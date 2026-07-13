## 2025-02-20 - Global Error Handling and DoS Prevention in Express API

**Vulnerability:** The Express API in `app.ts` lacked payload limits on body parsers (`express.json` and `express.urlencoded`), making it vulnerable to Denial of Service (DoS) attacks via oversized payloads. Additionally, there was no custom global error handler, which could allow the default Express error handler to leak stack traces or internal implementation details during an unhandled exception.
**Learning:** Even simple API setups need explicit defense-in-depth measures against resource exhaustion and information leakage. Using `req.log.error()` (provided by `pino-http`) is safer and preserves request context better than importing the logger directly in global error handlers.
**Prevention:** Always specify a `limit` when configuring body parsers (e.g., `limit: "100kb"`). Always add a custom 4-arity error handler (`(err, req, res, next)`) at the end of the Express middleware chain to catch unhandled errors and return a safe, generic response to the client.
## 2025-02-21 - Request Timeout and ERR_HTTP_HEADERS_SENT in Express API

**Vulnerability:** Unbounded request processing could lead to resource exhaustion and DoS attacks (Slowloris) due to hanging connections. Attempting to fix this by adding `req.setTimeout` that directly calls `res.json()` causes a secondary DoS vulnerability via `ERR_HTTP_HEADERS_SENT` crashes when long-running handlers eventually resolve.
**Learning:** Adding timeout middleware requires coordinated support from the global error handler. Firing `res.json()` mid-flight without cancelling downstream promises leads to race conditions.
**Prevention:** In Express, timeout middleware should throw a custom Error with a specific status code (`err.status = 408`) and pass it to `next(err)`. The global error handler must be updated to correctly extract and return this dynamic status code, instead of hardcoding 500s.
