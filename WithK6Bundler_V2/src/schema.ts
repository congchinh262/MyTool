import { BINARY, UINT16, UINT32, UINT8 } from "@elofun/elo-protobuf/types";
import { Buffer } from "buffer/";

export enum EWSGWMsgTypes {
  AUTH = 0,
  INFO,
  REQUEST,
  RESPONSE,
  NOTIFY,
  EVAL,
  SUBSCRIBE,
  BROADCAST,
  ACCESS_DENIED,
  EVENT,
  CONFIG,
}
export interface IWSGWPackage {
  type: EWSGWMsgTypes,
  data: Buffer
}

export const WSGWPackageSchema = {
  type: UINT8,
  data: BINARY
}

export interface IWSGWAuth {
  type: Buffer,
  credential: Buffer,
  secret: Buffer,
  clientId: Buffer
}

export interface IWSGWInfo {
  type: Buffer,
  credential: Buffer,
  userId: Buffer,
  clientId: Buffer,
  scopes: Buffer[]
}

export const WSGWAuthSchema = {
  type: BINARY,
  credential: BINARY,
  secret: BINARY,
  clientId: BINARY
}

export const WSGWInfoSchema = {
  type: BINARY,
  credential: BINARY,
  userId: UINT32,
  clientId: BINARY,
  scopes: [BINARY]
}

export interface IWSGWRequest {
  reqId: number,
  service: Buffer,
  api: Buffer,
  payload: Buffer,
}

export const WSGWRequestSchema = {
  reqId: UINT32,
  service: BINARY,
  api: BINARY,
  payload: BINARY
}

export interface IWSGWResponse {
  reqId: number,
  data: Buffer,
  status: number
}

export const WSGWResponseSchema = {
  reqId: UINT32,
  data: BINARY,
  status: UINT16
}
export interface IWSGEval {
  script: Buffer
}

export const WSGWEval = {
  script: BINARY
}

export interface IWSGWSubscribeRequest {
  service: Buffer;
  channel: Buffer;
}

export const WSGWSubscribeSchema = {
  service: BINARY,
  channel: BINARY
}