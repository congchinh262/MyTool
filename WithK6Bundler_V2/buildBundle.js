const plugin = require("node-stdlib-browser/helpers/esbuild/plugin");
const stdLibBrowser = require("node-stdlib-browser");

require("esbuild")
  .build({
    entryPoints: ["./src/bundle.ts"],
    bundle: true,
    // target: ["web"],
    outfile: "./k6/bundleOut.js",
    format: "esm",

    inject: [require.resolve("node-stdlib-browser/helpers/esbuild/shim")],
    define: {
      global: "global",
      process: "process",
      Buffer: "Buffer",
    },
    plugins: [plugin(stdLibBrowser)],
  })
  .catch((e) => {
    console.error(e);
  });
