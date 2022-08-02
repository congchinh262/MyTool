import { eloPack } from "@elofun/elo-protobuf";
import { BINARY } from "@elofun/elo-protobuf/types";

export { BINARY, eloPack };

export function echo() {
  return "hi";
}

export function bufferFrom(d: any) {
  return Buffer.from(d);
}

export function toArrayBuffer(d: Buffer) {
  return new Uint8Array(d).buffer;
}
