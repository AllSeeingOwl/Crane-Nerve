## 2025-02-20 - Global Error Handling and DoS Prevention in Express API

**Vulnerability:** The Express API in `app.ts` lacked payload limits on body parsers (`express.json` and `express.urlencoded`), making it vulnerable to Denial of Service (DoS) attacks via oversized payloads. Additionally, there was no custom global error handler, which could allow the default Express error handler to leak stack traces or internal implementation details during an unhandled exception.
**Learning:** Even simple API setups need explicit defense-in-depth measures against resource exhaustion and information leakage. Using `req.log.error()` (provided by `pino-http`) is safer and preserves request context better than importing the logger directly in global error handlers.
**Prevention:** Always specify a `limit` when configuring body parsers (e.g., `limit: "100kb"`). Always add a custom 4-arity error handler (`(err, req, res, next)`) at the end of the Express middleware chain to catch unhandled errors and return a safe, generic response to the client.

## 2025-02-21 - Request Timeout and ERR_HTTP_HEADERS_SENT in Express API

**Vulnerability:** Unbounded request processing could lead to resource exhaustion and DoS attacks (Slowloris) due to hanging connections. Attempting to fix this by adding `req.setTimeout` that directly calls `res.json()` causes a secondary DoS vulnerability via `ERR_HTTP_HEADERS_SENT` crashes when long-running handlers eventually resolve.
**Learning:** Adding timeout middleware requires coordinated support from the global error handler. Firing `res.json()` mid-flight without cancelling downstream promises leads to race conditions.
**Prevention:** In Express, timeout middleware should throw a custom Error with a specific status code (`err.status = 408`) and pass it to `next(err)`. The global error handler must be updated to correctly extract and return this dynamic status code, instead of hardcoding 500s.

## 2026-07-14 - Secure CORS Configuration in Express API

**Vulnerability:** The Express API in `app.ts` used an overly permissive CORS configuration (`app.use(cors())`), which defaults to allowing all origins (`*`). In a production environment, this could allow malicious websites to make cross-origin requests and potentially access sensitive user data if authentication is later added.
**Learning:** The default configuration for `cors()` is unsafe for production. It's crucial to explicitly configure the `origin` option based on the environment to restrict access only to trusted domains.
**Prevention:** Always configure the `cors` middleware to use a restrictive origin in production. This can be achieved by checking `process.env.NODE_ENV` and reading allowed origins from an environment variable (like `CORS_ORIGIN`), defaulting to a secure value or `false` if not set.

## 2026-07-16 - Hardening Content Security Policy (CSP) with Helmet

**Vulnerability:** The Express API in `app.ts` utilized `helmet()` with its default configurations. While better than nothing, it did not specify a Content Security Policy (CSP) suited for the application's needs, potentially leaving it open to basic XSS attacks if it were to serve HTML directly.
**Learning:** Default configurations in security libraries like `helmet` are just baselines. A robust CSP is one of the most effective ways to mitigate XSS by explicitly whitelisting allowed sources for scripts, styles, and other resources.
**Prevention:** Explicitly configure `helmet({ contentSecurityPolicy: { directives: ... } })` in Express applications, strictly defining `defaultSrc`, `scriptSrc`, `styleSrc`, etc.

## 2026-07-17 - API Rate Limiting for Express

**Vulnerability:** The Express API was missing rate limiting, making it susceptible to brute-force and Denial of Service (DoS) attacks.
**Learning:** Adding rate limiting protects against abusive behavior by throttling requests per IP address.
**Prevention:** Apply `express-rate-limit` middleware on critical endpoints (like `/api`) configured with a `windowMs` and a `max` threshold.
