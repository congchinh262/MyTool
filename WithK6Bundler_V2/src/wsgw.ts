// WSGW run in master frame. It's main communication between client and server
import EventEmitter from 'events';
import { Buffer } from 'buffer/';
import { eloPack, eloUnpack } from '@elofun/elo-protobuf';
import { WebSocket } from 'ws';

import {
  EWSGWMsgTypes,
  IWSGWPackage,
  IWSGWResponse,
  WSGWPackageSchema,
  WSGWRequestSchema,
  WSGWResponseSchema,
  WSGWSubscribeSchema
} from './schema';
const wsgwLog  = console.log.bind(console);

export interface IWSGWUserInfo {
  type: string,
  credential: string,
  userId: string,
  clientId: string,
  scopes: string[]
}
export class WSGWClient extends EventEmitter {
  private ws: WebSocket;
  private authInfo?: IWSGWUserInfo;
  private subsChannel: { [channel: string]: boolean };
  private isRetricted: boolean;
  private authParams?: any;

  private sendingQueue: Array<{
    buffer: Buffer,
    exp: number
  }>;

  constructor(ws: WebSocket) {
    super();
    this.ws = ws;
    this.ws.onmessage = this.onMessage.bind(this);
    this.subsChannel = {};
    this.isRetricted = false;
    this.sendingQueue = [];
    this.on('auth', this.onAuthInfo.bind(this));
    this.sendEvent('ready', {});
  }

 
  private getReqId() {
    return Math.floor(Math.random() * 2000000000);
  }

  public get userId() {
    return this.authInfo ? this.authInfo.userId : null;
  }

  public get credential() {
    return `${this.authInfo ? this.authInfo.credential : ''}`;
  }

  public checkScope(scope: string) {
    if (!this.authInfo || this.authInfo.scopes.indexOf(scope) < 0) {
      return false;
    }
    return true;
  }

  public getScopes() {
    return this.authInfo?.scopes;
  }

  public async auth({
    type,
    credential,
    secret,
    clientId
  }: {
    type: string;
    credential: string;
    secret: string;
    clientId: string;
  }) {
    this.authParams = null;
    const res = await this.request('auth', 'login', {
      type,
      credential,
      secret,
      clientId
    });
    if (res.status === 200) {
      this.authParams = {
        type,
        credential,
        secret,
        clientId
      };
      this.authInfo = res.data.info;
    }
    return res;
  }

  private onAuthInfo(authInfo: IWSGWUserInfo) {
    this.authInfo = authInfo;
  }

  private async onMessage(msg: any) {
    if (this.isRetricted) { return; }
    this.emit('message', msg);
    try {
      const { type, data }: IWSGWPackage = eloUnpack(WSGWPackageSchema, Buffer.from(msg.data));
      this.proccessMessage(type, data);
    } catch (error) {
      this.close();
    }
  };

  private proccessMessage(type: EWSGWMsgTypes, data: any) {
    switch (type) {
      case EWSGWMsgTypes.RESPONSE: {
        const res: IWSGWResponse = eloUnpack(WSGWResponseSchema, data);
        this.emit(`res-${res.reqId}`, res);
        break;
      }
      case EWSGWMsgTypes.BROADCAST: {
        const broadcast = JSON.parse(`${data}`);
        this.emit(`broadcast`, broadcast);
        this.emit(`broadcast-${broadcast.service}-${broadcast.channel}`, broadcast.data);
        wsgwLog(['onBroadcast', broadcast.service, broadcast.channel, JSON.stringify(broadcast.data)].join(" | "));
        break;
      }
      case EWSGWMsgTypes.ACCESS_DENIED: {
        this.isRetricted = true;
        this.ws.close();
        break;
      }
      case EWSGWMsgTypes.EVENT:
        const ev = JSON.parse(`${data}`);
        this.emit(`${ev.type}`, ev.data);
        break;
      default:
        break;
    }
  }

  private sendEvent(evtype: string, data: any) {
    const pack = eloPack(WSGWPackageSchema, {
      type: EWSGWMsgTypes.EVENT,
      data: Buffer.from(JSON.stringify({
        type: evtype,
        data
      }))
    });
    this.doSend(pack);
  }

  private doSend(pack: Buffer | any, timeout = 10000) {
    if (this.isRetricted) { return; };
    if (this.ws.readyState === this.ws.OPEN) {
      this.ws.send(pack);
    } else {
      this.sendingQueue.push({
        buffer: Buffer.from(pack),
        exp: Date.now() + timeout
      });
    }
  }

  public async request<T = any>(service: string, api: string, payload: any = {}, timeout: number = 11000): Promise<{ status: number, data: T }> {
    const startMs = Date.now();
    const reqId = this.getReqId();
    const pack = eloPack(WSGWRequestSchema, {
      reqId,
      service: Buffer.from(service),
      api: Buffer.from(api),
      payload: Buffer.from(JSON.stringify(payload))
    });
    const requestPack = eloPack(WSGWPackageSchema, { type: EWSGWMsgTypes.REQUEST, data: pack });
    this.doSend(requestPack, timeout);
    return new Promise((resolve, reject) => {
      const onRes = ({ status, data }: IWSGWResponse) => {
        clearTimeout(pid);
        const resdata = JSON.parse(`${data}`);
        resolve({ status, data: resdata });
        wsgwLog(['request', service, api, JSON.stringify(payload), status, `${data}`, `${Date.now() - startMs}`].join(" | "));
      };
      const pid = setTimeout(() => {
        reject('timeout!');
        wsgwLog(`request`, service, api, payload, 'Timeout!');
      }, timeout);
      this.once(`res-${reqId}`, onRes);
    });
  }

  public subscribe(service: string, channel: string, cb?: (data: any) => void) {
    const sub = [service, channel].join('_._');
    if (!this.subsChannel[sub]) {
      this.subsChannel[sub] = true;
      const pack = eloPack(WSGWSubscribeSchema, { service: Buffer.from(service), channel: Buffer.from(channel) });
      const subPack = eloPack(WSGWPackageSchema, { type: EWSGWMsgTypes.SUBSCRIBE, data: Buffer.from(pack) });
      this.doSend(subPack);
    }
    if (cb) {
      this.on(`broadcast-${service}-${channel}`, cb);
    }
  }

  public async setAuthToken(token: string, timeout = 10000) {
    this.sendEvent('authToken', token);
    return new Promise((resolve, reject) => {
      const pid = setTimeout(() => {
        reject('timeout!');
      }, timeout);
      const onAuth = (authInfo: IWSGWUserInfo) => {
        clearTimeout(pid);
        resolve(authInfo);
      };
      this.once('auth', onAuth);
    });
  }

  public close() {
    this.ws.close();
    this.removeAllListeners();
  }
}
