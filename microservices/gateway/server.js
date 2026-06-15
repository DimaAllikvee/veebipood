const express = require("express");
const cors = require("cors");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 5070;

app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Proxy rules
app.use("/api/users", createProxyMiddleware({ target: "http://users:5051", changeOrigin: true }));
app.use("/api/products", createProxyMiddleware({ target: "http://products:5052", changeOrigin: true }));
app.use("/api/orders", createProxyMiddleware({ target: "http://orders:5053", changeOrigin: true }));

app.get("/health", (req, res) => {
  res.json({ status: "gateway ok" });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(PORT, () => {
  console.log(`API Gateway jookseb pordil: ${PORT}`);
});
