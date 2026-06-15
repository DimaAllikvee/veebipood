const express = require("express");
const cors = require("cors");
const productsRouter = require("./routes/products");

const app = express();
const PORT = process.env.PORT || 5052;

app.use(cors());
app.use(express.json());

app.use("/", productsRouter);

app.get("/health", (req, res) => {
  res.json({ status: "products ok" });
});

app.listen(PORT, () => {
  console.log(`Products service jookseb pordil: ${PORT}`);
});
