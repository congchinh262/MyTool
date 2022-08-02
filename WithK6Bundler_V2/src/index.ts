import { eloPack } from "@elofun/elo-protobuf";
import { BINARY } from "@elofun/elo-protobuf/types";
import { Buffer } from "buffer/";
import { WebSocket } from "ws";
import { WSGWClient } from "./wsgw";
import { EloToken } from "@elofun/elo-sdk/token";
import fetch from "node-fetch";
import { randomMinMax } from "./helper";
import { USER_POOL, TOKEN_POOL} from "./conf"
// import {connectWsgw} from '@elofun/services-wsgw';

const WEB_HOST = process.env.WEB_HOST || "https://gami-mvt.elofun.net/";
const WSGW_HOST = process.env.WSGW_HOST || "wss://gami-mvt.elofun.net/wsgw/";
const NUM_USER = parseInt(process.env.NUM_USERS || "1");

const GAMEID_POOL = [1, 2, 3, 4, 6, 8, 9, 10];

// Fix window & WebSocket is not defined
global.window = global.window || ({} as Window);
global.WebSocket = global.WebSocket || require("ws");
window.navigator = window.navigator || ({ userAgent: "LoadTest" } as Navigator);
window.location = window.location || ({ href: WEB_HOST } as Location);

export interface IWSGWUserInfo {
  type: string;
  credential: string;
  userId: string;
  clientId: string;
  scopes: string[];
}
export interface IWSGWClient {
  userId: number;
  credential: string;
  checkScope: (scope: string) => boolean;
  getScopes: () => string[] | undefined;
  request: (
    service: string,
    api: string,
    data: any,
    timeout?: number
  ) => Promise<{
    status: number;
    data: any;
  }>;
  subscribe: (
    service: string,
    channel: string,
    cb?: (data: any) => void
  ) => void;
  auth: (data: {
    credential: string;
    secret: string;
    clientId: string;
    type: string;
  }) => Promise<{
    status: number;
    data: any;
  }>;
  setAuthToken: (token: string) => Promise<IWSGWUserInfo>;
}

export const connectWsgw = async (ep: string): Promise<IWSGWClient> => {
  return new Promise((resolve) => {
    const ctx: {
      ep: string;
      ts: number;
      ws: WebSocket;
    } = {
      ep,
      ts: Date.now(),
      ws: new WebSocket(ep, {
        headers: {
          "user-agent": "node",
        },
      }),
    };

    ctx.ws.binaryType = "arraybuffer";
    ctx.ws.onerror = () => {
      console.log("on error!");
    };
    ctx.ws.onclose = () => {
      console.log("on close!");
    };
    ctx.ws.onopen = () => {
      ctx.ws.send(
        eloPack(
          {
            u: BINARY,
            t: BINARY,
          },
          {
            u: Buffer.from("node"),
            t: Buffer.from(WSGW_HOST),
          }
        )
      );
      ctx.ws.onmessage = function (e) {
        ctx.ws.onmessage = () => {};
        const wsgw = new WSGWClient(ctx.ws);
        resolve(wsgw as any);
      };
    };
  });
};

export const serviceToken = new EloToken({
  clientId: "gami",
  credential: "services",
  expiredAt: Date.now() + 4 * 365 * 24 * 3600 * 1000,
  scopes: ["admin", "auth-admin"],
  type: "user",
  userId: 0,
}).toString();

const waitFor = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

const runTest = (wsgw: IWSGWClient): Promise<any> => {
  return fetch(WEB_HOST)
    .then((res) => res.text())
    .finally(() => {
      return wsgw.setAuthToken(serviceToken).then(async () => {
        const msisdn = USER_POOL[Math.floor(Math.random()*USER_POOL.length)].userId;
        // const msisdn = `84${1000000 + Math.floor(Math.random() * 10000000)}`;
        await wsgw.request("auth", "register", {
          clientId: "gami",
          credential: msisdn,
          type: "user",
          secret: "secret",
          profile: {},
        });
        return wsgw
          .request("auth", "authForUser", {
            credential: msisdn,
            type: "user",
            clientId: "gami",
          })
          .then(({ data }) => {
            return wsgw.setAuthToken(data.token);
          })
          .then(() => waitFor(10000))
          .then(() => {
            return wsgw.request("gami", "profile", {});
          })
          .then(() => waitFor(0))
          .then(() => {
            return wsgw.request("game", "claimDailyReward", {});
          })
          .then(() => {
            return wsgw.request("game", "getTurnBalances", {});
          })
          .then(async (balances) => {
            let turn = balances?.data.balance || 0;
            if (turn <= 0) {
              return;
            }
            while (turn > 0) {
              const {
                status,
                data: { rewards },
              } = await wsgw.request("game", "bookRewards", {});
              if (status !== 200) {
                throw new Error("book rewards error!");
              }
              while (rewards.length) {
                const reward = rewards.pop();
                if (reward) {
                  await wsgw
                    .request("game", "claimReward", { id: reward })
                    .then(({ status, data }) => {
                      if (status !== 200) {
                        console.error(status, data);
                        process.exit(1);
                      }
                    })
                    .catch((e) => {
                      console.error(e);
                      process.exit();
                    });
                  await waitFor(0 + Math.random() * 2000);
                }
              }
              turn = wsgw
                .request("game", "getTurnBalances", {})
                .then((balances) => balances?.data.balance || 0);
            }
          })
          .then(() => {
            return wsgw.request("game", "getRewardsHistory", {
              offset: 0,
              limit: 100,
              rewardTypeIds: ["5"],
            });
          })
          .then(() => waitFor(2000));
      });
    })
    .catch((e) => {
      console.error(e);
      return waitFor(Math.random() * 2000);
    })
    .finally(() => {
      setTimeout(() => {
        runTest(wsgw);
      }, Math.random() * 60000);
    });
};

const addUser = async () => {
  connectWsgw(WSGW_HOST)
    .then((wsgw) => {
      return runTest(wsgw);
    })
    .catch(console.error)
    .finally(() => {
      addUser();
    });
};

for (let i = 0; i < NUM_USER; i++) {
  setTimeout(addUser, Math.random() * i * 1000);
}
