import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./src/lib/logger.js";

const app: Express = express();

// Trust the first proxy to enable accurate IP detection for rate limiting if deployed behind a reverse proxy/load balancer
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
      },
    },
  }),
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
const isProduction = process.env.NODE_ENV === "production";
app.use(
  cors({
    origin: isProduction ? process.env.CORS_ORIGIN || false : "*",
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// Security Enhancement: Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: "Too many requests, please try again later." },
});
app.use("/api", limiter);

interface HttpError extends Error {
  status?: number;
}

// Security Enhancement: Request Timeout
app.use((req: Request, res: Response, next: NextFunction) => {
  req.setTimeout(30000, () => {
    if (!res.headersSent) {
      const err = new Error("Request Timeout") as HttpError;
      err.status = 408;
      next(err);
    }
  });
  next();
});

app.use("/api", router);

// Global error handler to prevent leaking stack traces
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (res.headersSent) {
    return _next(err);
  }

  req.log.error(err, "Unhandled error in request");

  let status = 500;
  let message = "Internal Server Error";

  if (err instanceof Error) {
    const httpErr = err as HttpError;
    if (httpErr.status) status = httpErr.status;
    if (status !== 500) message = httpErr.message;
  }

  res.status(status).json({ error: message });
});

export default app;
