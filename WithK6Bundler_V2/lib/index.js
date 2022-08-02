"use strict";
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
exports.serviceToken = exports.connectWsgw = void 0;
var elo_protobuf_1 = require("@elofun/elo-protobuf");
var types_1 = require("@elofun/elo-protobuf/types");
var buffer_1 = require("buffer/");
var ws_1 = require("ws");
var wsgw_1 = require("./wsgw");
var token_1 = require("@elofun/elo-sdk/token");
var node_fetch_1 = __importDefault(require("node-fetch"));
var conf_1 = require("./conf");
// import {connectWsgw} from '@elofun/services-wsgw';
var WEB_HOST = process.env.WEB_HOST || "https://gami-mvt.elofun.net/";
var WSGW_HOST = process.env.WSGW_HOST || "wss://gami-mvt.elofun.net/wsgw/";
var NUM_USER = parseInt(process.env.NUM_USERS || "1");
var GAMEID_POOL = [1, 2, 3, 4, 6, 8, 9, 10];
// Fix window & WebSocket is not defined
global.window = global.window || {};
global.WebSocket = global.WebSocket || require("ws");
window.navigator = window.navigator || { userAgent: "LoadTest" };
window.location = window.location || { href: WEB_HOST };
var connectWsgw = function (ep) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve) {
                var ctx = {
                    ep: ep,
                    ts: Date.now(),
                    ws: new ws_1.WebSocket(ep, {
                        headers: {
                            "user-agent": "node",
                        },
                    }),
                };
                ctx.ws.binaryType = "arraybuffer";
                ctx.ws.onerror = function () {
                    console.log("on error!");
                };
                ctx.ws.onclose = function () {
                    console.log("on close!");
                };
                ctx.ws.onopen = function () {
                    ctx.ws.send((0, elo_protobuf_1.eloPack)({
                        u: types_1.BINARY,
                        t: types_1.BINARY,
                    }, {
                        u: buffer_1.Buffer.from("node"),
                        t: buffer_1.Buffer.from(WSGW_HOST),
                    }));
                    ctx.ws.onmessage = function (e) {
                        ctx.ws.onmessage = function () { };
                        var wsgw = new wsgw_1.WSGWClient(ctx.ws);
                        resolve(wsgw);
                    };
                };
            })];
    });
}); };
exports.connectWsgw = connectWsgw;
exports.serviceToken = new token_1.EloToken({
    clientId: "gami",
    credential: "services",
    expiredAt: Date.now() + 4 * 365 * 24 * 3600 * 1000,
    scopes: ["admin", "auth-admin"],
    type: "user",
    userId: 0,
}).toString();
var waitFor = function (ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, 0);
    });
};
var runTest = function (wsgw) {
    return (0, node_fetch_1.default)(WEB_HOST)
        .then(function (res) { return res.text(); })
        .finally(function () {
        return wsgw.setAuthToken(exports.serviceToken).then(function () { return __awaiter(void 0, void 0, void 0, function () {
            var msisdn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        msisdn = conf_1.USER_POOL[Math.floor(Math.random() * conf_1.USER_POOL.length)].userId;
                        // const msisdn = `84${1000000 + Math.floor(Math.random() * 10000000)}`;
                        return [4 /*yield*/, wsgw.request("auth", "register", {
                                clientId: "gami",
                                credential: msisdn,
                                type: "user",
                                secret: "secret",
                                profile: {},
                            })];
                    case 1:
                        // const msisdn = `84${1000000 + Math.floor(Math.random() * 10000000)}`;
                        _a.sent();
                        return [2 /*return*/, wsgw
                                .request("auth", "authForUser", {
                                credential: msisdn,
                                type: "user",
                                clientId: "gami",
                            })
                                .then(function (_a) {
                                var data = _a.data;
                                return wsgw.setAuthToken(data.token);
                            })
                                .then(function () { return waitFor(10000); })
                                .then(function () {
                                return wsgw.request("gami", "profile", {});
                            })
                                .then(function () { return waitFor(0); })
                                .then(function () {
                                return wsgw.request("game", "claimDailyReward", {});
                            })
                                .then(function () {
                                return wsgw.request("game", "getTurnBalances", {});
                            })
                                .then(function (balances) { return __awaiter(void 0, void 0, void 0, function () {
                                var turn, _a, status_1, rewards, reward;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            turn = (balances === null || balances === void 0 ? void 0 : balances.data.balance) || 0;
                                            if (turn <= 0) {
                                                return [2 /*return*/];
                                            }
                                            _b.label = 1;
                                        case 1:
                                            if (!(turn > 0)) return [3 /*break*/, 8];
                                            return [4 /*yield*/, wsgw.request("game", "bookRewards", {})];
                                        case 2:
                                            _a = _b.sent(), status_1 = _a.status, rewards = _a.data.rewards;
                                            if (status_1 !== 200) {
                                                throw new Error("book rewards error!");
                                            }
                                            _b.label = 3;
                                        case 3:
                                            if (!rewards.length) return [3 /*break*/, 7];
                                            reward = rewards.pop();
                                            if (!reward) return [3 /*break*/, 6];
                                            return [4 /*yield*/, wsgw
                                                    .request("game", "claimReward", { id: reward })
                                                    .then(function (_a) {
                                                    var status = _a.status, data = _a.data;
                                                    if (status !== 200) {
                                                        console.error(status, data);
                                                        process.exit(1);
                                                    }
                                                })
                                                    .catch(function (e) {
                                                    console.error(e);
                                                    process.exit();
                                                })];
                                        case 4:
                                            _b.sent();
                                            return [4 /*yield*/, waitFor(0 + Math.random() * 2000)];
                                        case 5:
                                            _b.sent();
                                            _b.label = 6;
                                        case 6: return [3 /*break*/, 3];
                                        case 7:
                                            turn = wsgw
                                                .request("game", "getTurnBalances", {})
                                                .then(function (balances) { return (balances === null || balances === void 0 ? void 0 : balances.data.balance) || 0; });
                                            return [3 /*break*/, 1];
                                        case 8: return [2 /*return*/];
                                    }
                                });
                            }); })
                                .then(function () {
                                return wsgw.request("game", "getRewardsHistory", {
                                    offset: 0,
                                    limit: 100,
                                    rewardTypeIds: ["5"],
                                });
                            })
                                .then(function () { return waitFor(2000); })];
                }
            });
        }); });
    })
        .catch(function (e) {
        console.error(e);
        return waitFor(Math.random() * 2000);
    })
        .finally(function () {
        setTimeout(function () {
            runTest(wsgw);
        }, Math.random() * 60000);
    });
};
var addUser = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        (0, exports.connectWsgw)(WSGW_HOST)
            .then(function (wsgw) {
            return runTest(wsgw);
        })
            .catch(console.error)
            .finally(function () {
            addUser();
        });
        return [2 /*return*/];
    });
}); };
for (var i = 0; i < NUM_USER; i++) {
    setTimeout(addUser, Math.random() * i * 1000);
}
