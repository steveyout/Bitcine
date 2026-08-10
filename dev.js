import { spawn } from "node:child_process";

const args = process.argv.slice(2);
const cleanedArgs = [];

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--host") {
    if (args[i + 1] && !args[i + 1].startsWith("-")) {
      cleanedArgs.push("-H", args[i + 1]);
      i++;
    } else {
      cleanedArgs.push("-H", "0.0.0.0");
    }
  } else if (arg.startsWith("--host=")) {
    const val = arg.split("=")[1];
    cleanedArgs.push("-H", val || "0.0.0.0");
  } else {
    cleanedArgs.push(arg);
  }
}

if (!cleanedArgs.includes("-p") && !cleanedArgs.includes("--port")) {
  cleanedArgs.push("-p", "3000");
}

const child = spawn("npx", ["next", "dev", ...cleanedArgs], {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => {
  process.exit(code || 0);
});
