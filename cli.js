

import { startProxy } from "./server.js";

// Read command-line arguments
const args = process.argv.slice(2);

// Get command-line options
function getOption(name, defaultValue) {
  const index = args.indexOf(name);

  if (index === -1) {
    return defaultValue;
  }

  const value = args[index + 1];

  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${name}`);
  }

  return value;
}

try {
  const port = Number(getOption("--port", "3000"));
  const origin = getOption("--origin", null);
  const ttl = Number(getOption("--ttl", "60"));

  // Validate origin
  if (!origin) {
    throw new Error("Please provide an origin using --origin");
  }

  const parsedOrigin = new URL(origin);

  if (!["http:", "https:"].includes(parsedOrigin.protocol)) {
    throw new Error("Origin must use HTTP or HTTPS");
  }

  // Validate port
  if (
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    throw new Error("Invalid port number");
  }

  // Validate TTL
  if (!Number.isFinite(ttl) || ttl <= 0) {
    throw new Error("TTL must be a positive number");
  }

  // Start caching proxy
  startProxy(port, parsedOrigin, ttl);

} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
