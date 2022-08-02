"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WSGWSubscribeSchema = exports.WSGWEval = exports.WSGWResponseSchema = exports.WSGWRequestSchema = exports.WSGWInfoSchema = exports.WSGWAuthSchema = exports.WSGWPackageSchema = exports.EWSGWMsgTypes = void 0;
var types_1 = require("@elofun/elo-protobuf/types");
var EWSGWMsgTypes;
(function (EWSGWMsgTypes) {
    EWSGWMsgTypes[EWSGWMsgTypes["AUTH"] = 0] = "AUTH";
    EWSGWMsgTypes[EWSGWMsgTypes["INFO"] = 1] = "INFO";
    EWSGWMsgTypes[EWSGWMsgTypes["REQUEST"] = 2] = "REQUEST";
    EWSGWMsgTypes[EWSGWMsgTypes["RESPONSE"] = 3] = "RESPONSE";
    EWSGWMsgTypes[EWSGWMsgTypes["NOTIFY"] = 4] = "NOTIFY";
    EWSGWMsgTypes[EWSGWMsgTypes["EVAL"] = 5] = "EVAL";
    EWSGWMsgTypes[EWSGWMsgTypes["SUBSCRIBE"] = 6] = "SUBSCRIBE";
    EWSGWMsgTypes[EWSGWMsgTypes["BROADCAST"] = 7] = "BROADCAST";
    EWSGWMsgTypes[EWSGWMsgTypes["ACCESS_DENIED"] = 8] = "ACCESS_DENIED";
    EWSGWMsgTypes[EWSGWMsgTypes["EVENT"] = 9] = "EVENT";
    EWSGWMsgTypes[EWSGWMsgTypes["CONFIG"] = 10] = "CONFIG";
})(EWSGWMsgTypes = exports.EWSGWMsgTypes || (exports.EWSGWMsgTypes = {}));
exports.WSGWPackageSchema = {
    type: types_1.UINT8,
    data: types_1.BINARY
};
exports.WSGWAuthSchema = {
    type: types_1.BINARY,
    credential: types_1.BINARY,
    secret: types_1.BINARY,
    clientId: types_1.BINARY
};
exports.WSGWInfoSchema = {
    type: types_1.BINARY,
    credential: types_1.BINARY,
    userId: types_1.UINT32,
    clientId: types_1.BINARY,
    scopes: [types_1.BINARY]
};
exports.WSGWRequestSchema = {
    reqId: types_1.UINT32,
    service: types_1.BINARY,
    api: types_1.BINARY,
    payload: types_1.BINARY
};
exports.WSGWResponseSchema = {
    reqId: types_1.UINT32,
    data: types_1.BINARY,
    status: types_1.UINT16
};
exports.WSGWEval = {
    script: types_1.BINARY
};
exports.WSGWSubscribeSchema = {
    service: types_1.BINARY,
    channel: types_1.BINARY
};
