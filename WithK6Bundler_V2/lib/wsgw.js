"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WSGWClient = void 0;
// WSGW run in master frame. It's main communication between client and server
var events_1 = __importDefault(require("events"));
var buffer_1 = require("buffer/");
var elo_protobuf_1 = require("@elofun/elo-protobuf");
var schema_1 = require("./schema");
var wsgwLog = console.log.bind(console);
var WSGWClient = /** @class */ (function (_super) {
    __extends(WSGWClient, _super);
    function WSGWClient(ws) {
        var _this = _super.call(this) || this;
        _this.ws = ws;
        _this.ws.onmessage = _this.onMessage.bind(_this);
        _this.subsChannel = {};
        _this.isRetricted = false;
        _this.sendingQueue = [];
        _this.on('auth', _this.onAuthInfo.bind(_this));
        _this.sendEvent('ready', {});
        return _this;
    }
    WSGWClient.prototype.getReqId = function () {
        return Math.floor(Math.random() * 2000000000);
    };
    Object.defineProperty(WSGWClient.prototype, "userId", {
        get: function () {
            return this.authInfo ? this.authInfo.userId : null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WSGWClient.prototype, "credential", {
        get: function () {
            return "".concat(this.authInfo ? this.authInfo.credential : '');
        },
        enumerable: false,
        configurable: true
    });
    WSGWClient.prototype.checkScope = function (scope) {
        if (!this.authInfo || this.authInfo.scopes.indexOf(scope) < 0) {
            return false;
        }
        return true;
    };
    WSGWClient.prototype.getScopes = function () {
        var _a;
        return (_a = this.authInfo) === null || _a === void 0 ? void 0 : _a.scopes;
    };
    WSGWClient.prototype.auth = function (_a) {
        var type = _a.type, credential = _a.credential, secret = _a.secret, clientId = _a.clientId;
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.authParams = null;
                        return [4 /*yield*/, this.request('auth', 'login', {
                                type: type,
                                credential: credential,
                                secret: secret,
                                clientId: clientId
                            })];
                    case 1:
                        res = _b.sent();
                        if (res.status === 200) {
                            this.authParams = {
                                type: type,
                                credential: credential,
                                secret: secret,
                                clientId: clientId
                            };
                            this.authInfo = res.data.info;
                        }
                        return [2 /*return*/, res];
                }
            });
        });
    };
    WSGWClient.prototype.onAuthInfo = function (authInfo) {
        this.authInfo = authInfo;
    };
    WSGWClient.prototype.onMessage = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, type, data;
            return __generator(this, function (_b) {
                if (this.isRetricted) {
                    return [2 /*return*/];
                }
                this.emit('message', msg);
                try {
                    _a = (0, elo_protobuf_1.eloUnpack)(schema_1.WSGWPackageSchema, buffer_1.Buffer.from(msg.data)), type = _a.type, data = _a.data;
                    this.proccessMessage(type, data);
                }
                catch (error) {
                    this.close();
                }
                return [2 /*return*/];
            });
        });
    };
    ;
    WSGWClient.prototype.proccessMessage = function (type, data) {
        switch (type) {
            case schema_1.EWSGWMsgTypes.RESPONSE: {
                var res = (0, elo_protobuf_1.eloUnpack)(schema_1.WSGWResponseSchema, data);
                this.emit("res-".concat(res.reqId), res);
                break;
            }
            case schema_1.EWSGWMsgTypes.BROADCAST: {
                var broadcast = JSON.parse("".concat(data));
                this.emit("broadcast", broadcast);
                this.emit("broadcast-".concat(broadcast.service, "-").concat(broadcast.channel), broadcast.data);
                wsgwLog(['onBroadcast', broadcast.service, broadcast.channel, JSON.stringify(broadcast.data)].join(" | "));
                break;
            }
            case schema_1.EWSGWMsgTypes.ACCESS_DENIED: {
                this.isRetricted = true;
                this.ws.close();
                break;
            }
            case schema_1.EWSGWMsgTypes.EVENT:
                var ev = JSON.parse("".concat(data));
                this.emit("".concat(ev.type), ev.data);
                break;
            default:
                break;
        }
    };
    WSGWClient.prototype.sendEvent = function (evtype, data) {
        var pack = (0, elo_protobuf_1.eloPack)(schema_1.WSGWPackageSchema, {
            type: schema_1.EWSGWMsgTypes.EVENT,
            data: buffer_1.Buffer.from(JSON.stringify({
                type: evtype,
                data: data
            }))
        });
        this.doSend(pack);
    };
    WSGWClient.prototype.doSend = function (pack, timeout) {
        if (timeout === void 0) { timeout = 10000; }
        if (this.isRetricted) {
            return;
        }
        ;
        if (this.ws.readyState === this.ws.OPEN) {
            this.ws.send(pack);
        }
        else {
            this.sendingQueue.push({
                buffer: buffer_1.Buffer.from(pack),
                exp: Date.now() + timeout
            });
        }
    };
    WSGWClient.prototype.request = function (service, api, payload, timeout) {
        if (payload === void 0) { payload = {}; }
        if (timeout === void 0) { timeout = 11000; }
        return __awaiter(this, void 0, void 0, function () {
            var startMs, reqId, pack, requestPack;
            var _this = this;
            return __generator(this, function (_a) {
                startMs = Date.now();
                reqId = this.getReqId();
                pack = (0, elo_protobuf_1.eloPack)(schema_1.WSGWRequestSchema, {
                    reqId: reqId,
                    service: buffer_1.Buffer.from(service),
                    api: buffer_1.Buffer.from(api),
                    payload: buffer_1.Buffer.from(JSON.stringify(payload))
                });
                requestPack = (0, elo_protobuf_1.eloPack)(schema_1.WSGWPackageSchema, { type: schema_1.EWSGWMsgTypes.REQUEST, data: pack });
                this.doSend(requestPack, timeout);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var onRes = function (_a) {
                            var status = _a.status, data = _a.data;
                            clearTimeout(pid);
                            var resdata = JSON.parse("".concat(data));
                            resolve({ status: status, data: resdata });
                            wsgwLog(['request', service, api, JSON.stringify(payload), status, "".concat(data), "".concat(Date.now() - startMs)].join(" | "));
                        };
                        var pid = setTimeout(function () {
                            reject('timeout!');
                            wsgwLog("request", service, api, payload, 'Timeout!');
                        }, timeout);
                        _this.once("res-".concat(reqId), onRes);
                    })];
            });
        });
    };
    WSGWClient.prototype.subscribe = function (service, channel, cb) {
        var sub = [service, channel].join('_._');
        if (!this.subsChannel[sub]) {
            this.subsChannel[sub] = true;
            var pack = (0, elo_protobuf_1.eloPack)(schema_1.WSGWSubscribeSchema, { service: buffer_1.Buffer.from(service), channel: buffer_1.Buffer.from(channel) });
            var subPack = (0, elo_protobuf_1.eloPack)(schema_1.WSGWPackageSchema, { type: schema_1.EWSGWMsgTypes.SUBSCRIBE, data: buffer_1.Buffer.from(pack) });
            this.doSend(subPack);
        }
        if (cb) {
            this.on("broadcast-".concat(service, "-").concat(channel), cb);
        }
    };
    WSGWClient.prototype.setAuthToken = function (token, timeout) {
        if (timeout === void 0) { timeout = 10000; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.sendEvent('authToken', token);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var pid = setTimeout(function () {
                            reject('timeout!');
                        }, timeout);
                        var onAuth = function (authInfo) {
                            clearTimeout(pid);
                            resolve(authInfo);
                        };
                        _this.once('auth', onAuth);
                    })];
            });
        });
    };
    WSGWClient.prototype.close = function () {
        this.ws.close();
        this.removeAllListeners();
    };
    return WSGWClient;
}(events_1.default));
exports.WSGWClient = WSGWClient;
