const express = require("express");
const cors = require("cors");
const path = require("path");
const data = require("./data");

const usersRouter = require("./routes/users");
const productsRouter = require("./routes/products");
const ordersRouter = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || "development";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/users", usersRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", env: ENV, timestamp: new Date().toISOString() });
});

app.get("/api/stats", (req, res) => {
  res.json({
    totalProducts: data.products.length,
    totalOrders: data.orders.length,
    totalUsers: data.users.length,
    activeOrders: data.orders.filter((o) => o.status !== "kohale toimetatud").length,
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`Veebipoe server jookseb: http://localhost:${PORT}`);
  console.log(`Keskkond: ${ENV}`);
});
