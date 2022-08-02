import ws from "k6/ws";
import { check } from "k6";
import {
  echo,
  BINARY,
  eloPack,
  bufferFrom,
  toArrayBuffer,
} from "./bundleOut.js";

export default function () {
  const url = "wss://ws.postman-echo.com/raw";
  const d = eloPack(
    {
      u: BINARY,
      t: BINARY,
    },
    {
      u: bufferFrom("node"),
      t: bufferFrom("aaa"),
    }
  );

  const res = ws.connect(url, {}, function (socket) {
    socket.on("message", (msg) => {
      console.log(msg);
      check(msg, { "echo is hello": (r) => msg === "hello" });
      socket.close();
    });

    socket.on("binaryMessage", function (msg) {
      // msg is an ArrayBuffer, so we can wrap it in a typed array directly.
      console.log("bin", msg);
    });

    socket.on("open", () => {
      console.log("connected");

      socket.sendBinary(toArrayBuffer(d));
    });
    socket.on("error", (err) => console.log(err));
    socket.on("close", (err) => console.log("closed"));
  });
}
