const { spawn } = require("child_process");

// This file exists to satisfy Render's default "node index.js" start command
// It redirects the execution to the backend service.

const startBackend = () => {
  console.log("🚀 Starting CodeHire Backend...");
  
  const ls = spawn("node", ["backend/src/server.js"], {
    shell: true,
    stdio: "inherit",
  });

  ls.on("close", (code) => {
    console.log(`Backend process exited with code ${code}`);
    process.exit(code);
  });
};

startBackend();
