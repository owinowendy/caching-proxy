# ⚡ Caching Proxy

> A lightweight backend proxy that sits between your clients and any API, remembering responses so repeat requests come back in **milliseconds instead of seconds**.

https://roadmap.sh/projects/caching-server

---

## 🤔 Why this exists

Every time your app calls a slow or rate-limited API, you pay for it in latency, bandwidth, and quota. Caching Proxy fixes that:

- 🚀 **Faster responses**: cached requests skip the network round trip
- 💸 **Fewer upstream calls**: save on rate limits and API costs
- 🛡️ **More resilient**: serve cached data even when the origin is slow
- 🔍 **Fully transparent**: every response tells you if it was a cache hit or miss

---

## 🎬 See it in action

```bash
# First request: fetched from the origin server
$ curl -i http://localhost:3000/products
X-Cache: MISS        # ~800ms

# Second request: served instantly from cache
$ curl -i http://localhost:3000/products
X-Cache: HIT         # ~3ms
```

**Same data. 250x faster.**

---

## ✨ Features

| Feature | Description |
|---|---|
| In-memory caching | Blazing-fast lookups with no external dependencies |
| Configurable TTL | Control how long responses stay fresh |
| `X-Cache` header | Instantly see `HIT` or `MISS` on every response |
| CLI support | Start the proxy with one command |
| Cache clearing | Wipe the cache whenever you need a fresh start |

---

## 🚀 Quick start

```bash
# 1. Clone and install
git clone https://github.com/your-username/caching-proxy.git
cd caching-proxy
npm install

# 2. Start the proxy
caching-proxy --port 3000 --origin http://dummyjson.com

# 3. Try it
curl -i http://localhost:3000/products
```

---

## ⚙️ Options

| Flag | Description | Example |
|---|---|---|
| `--port` | Port the proxy listens on | `--port 3000` |
| `--origin` | The server requests are forwarded to | `--origin http://dummyjson.com` |
| `--ttl` | Cache lifetime in seconds | `--ttl 60` |
| `--clear-cache` | Clears all cached responses | `--clear-cache` |

---

## 🧠 How it works

```
Client ──▶ Caching Proxy ──▶ Origin Server
              │    ▲
              ▼    │
           Cache Store
```

1. A request arrives at the proxy
2. **Cache hit?** Return the stored response immediately (`X-Cache: HIT`)
3. **Cache miss?** Forward to the origin, store the response, then return it (`X-Cache: MISS`)

---

## 🗺️ Roadmap

- [ ] Redis support for distributed caching
- [ ] Cache invalidation by route
- [ ] Request/response logging dashboard
- [ ] Docker image

---


## 📄 License

MIT © your-name
