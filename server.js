
import http from "node:http";

import {
  getCachedResponse,
  setCachedResponse
} from "./cache.js";

// Start the caching proxy server
export function startProxy(port, origin, ttl) {

  const server = http.createServer(async (req, res) => {

    try {

      const targetUrl = new URL(req.url, origin);
      const method = req.method.toUpperCase();

      // Only cache GET requests
      const canCache =
        method === "GET" &&
        !req.headers.authorization &&
        !req.headers.cookie &&
        !req.headers["cache-control"]?.includes("no-cache");

      const cacheKey = `${method}:${targetUrl.href}`;

      // 1. Check whether response exists in cache
      if (canCache) {

        const cached = getCachedResponse(cacheKey);

        if (cached) {

          console.log(`[HIT] ${targetUrl.href}`);

          res.writeHead(cached.status, {
            ...cached.headers,
            "x-cache": "HIT"
          });

          return res.end(cached.body);
        }
      }

      // 2. Cache miss: forward request to original server
      console.log(`[MISS] ${targetUrl.href}`);

      const headers = {};

      for (const [key, value] of Object.entries(req.headers)) {
        if (
          ![
            "host",
            "connection",
            "content-length",
            "transfer-encoding"
          ].includes(key.toLowerCase())
        ) {
          headers[key] = value;
        }
      }

      // Read request body for POST, PUT, PATCH etc.
      const chunks = [];

      if (!["GET", "HEAD"].includes(method)) {
        for await (const chunk of req) {
          chunks.push(chunk);
        }
      }

      const body =
        chunks.length > 0
          ? Buffer.concat(chunks)
          : undefined;

      // 3. Forward request
      const response = await fetch(targetUrl, {
        method,
        headers,
        body,
        redirect: "manual"
      });

      // 4. Read response
      const responseBody = Buffer.from(
        await response.arrayBuffer()
      );

      const responseHeaders = {};

      for (const [key, value] of response.headers.entries()) {
        if (
          ![
            "connection",
            "keep-alive",
            "transfer-encoding",
            "upgrade"
          ].includes(key.toLowerCase())
        ) {
          responseHeaders[key] = value;
        }
      }

      // 5. Store eligible responses
      const cacheControl =
        response.headers.get("cache-control") || "";

      const shouldStore =
        canCache &&
        response.status === 200 &&
        !cacheControl.includes("no-store") &&
        !cacheControl.includes("private") &&
        !response.headers.has("set-cookie") &&
        response.headers.get("vary") !== "*";

      if (shouldStore) {

        setCachedResponse(
          cacheKey,
          {
            status: response.status,
            headers: responseHeaders,
            body: responseBody
          },
          ttl
        );
      }

      // 6. Return response to client
      res.writeHead(response.status, {
        ...responseHeaders,
        "content-length": responseBody.length,
        "x-cache": "MISS"
      });

      res.end(responseBody);

    } catch (error) {

      console.error("Proxy error:", error.message);

      if (!res.headersSent) {
        res.writeHead(502, {
          "content-type": "application/json"
        });

        res.end(JSON.stringify({
          error: "Bad Gateway",
          message: "Unable to reach the original server"
        }));
      }
    }

  });

  // Start listening
  server.listen(port, () => {

    console.log(`Caching proxy running on port ${port}`);
    console.log(`Forwarding requests to: ${origin}`);
    console.log(`Cache TTL: ${ttl} seconds`);

  });

  return server;
}
