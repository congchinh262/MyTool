require("esbuild").buildSync({
  entryPoints: ["node_modules/@elofun/services-wsgw/index.js"],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ["chrome58", "firefox57", "safari11", "edge16"],
  outfile: "bundle/out.js",
  format: "esm",
  define: {
    global: "window",
  },
});
