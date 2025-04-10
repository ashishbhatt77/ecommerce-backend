require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const connectDatabase = require("./config/db");
const swaggerDocs = require("./swaggerConfig");

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(mongoSanitize());

swaggerDocs(app);

// const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
// app.use(limiter);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Set-Cookie"],
  })
);

connectDatabase();

const routes = {
  auth: require("./routes/authRoutes"),
  products: require("./routes/productRoutes"),
  users: require("./routes/customerRoutes"),
  admin: require("./routes/adminRoutes"),
  seller: require("./routes/sellerRoutes"),
  cart: require("./routes/cartRoutes"),
  orders: require("./routes/orderRoutes"),
  payments: require("./routes/paymentRoutes"),
  wallet: require("./routes/walletRoutes"),
};

Object.entries(routes).forEach(([key, route]) => {
  app.use(`/api/${key}`, route);
});

app.get("/", (req, res) => res.send("Secure E-Commerce API Running..."));

app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));