import { spawn } from "node:child_process";

const procs = [];

const start = (command, args, name) => {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: false,
    env: process.env,
  });

  child.on("exit", (code, signal) => {
    if (signal || (typeof code === "number" && code !== 0)) {
      console.log(`${name} exited (${signal || code}), shutting down...`);
      for (const proc of procs) {
        if (!proc.killed) {
          proc.kill("SIGTERM");
        }
      }
      process.exit(code ?? 0);
    }
  });

  procs.push(child);
  return child;
};

process.on("SIGINT", () => {
  for (const proc of procs) {
    if (!proc.killed) {
      proc.kill("SIGTERM");
    }
  }
  process.exit(0);
});

process.on("SIGTERM", () => {
  for (const proc of procs) {
    if (!proc.killed) {
      proc.kill("SIGTERM");
    }
  }
  process.exit(0);
});

start("npm", ["run", "mock-backend"], "mock-backend");
start("npm", ["run", "dev", "--", "--host", "0.0.0.0"], "frontend");
