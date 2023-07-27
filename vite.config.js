const isCodeSandbox =
  "SANDBOX_URL" in process.env || "CODESANDBOX_HOST" in process.env;

export default {
  root: "src/",
  publicDir: "../static/",
  base: "./",
  server: {
    host: true,
    https: {
      key: "./threejs-fortune-privateKey.key",
      cert: "./threejs-fortune.crt",
    },
    open: !isCodeSandbox, // Open if it's not a CodeSandboxm
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    sourcemap: true,
  },
};
