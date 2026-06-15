const express = require("express");
const cors = require("cors");
const usersRouter = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 5051;

app.use(cors());
app.use(express.json());

app.use("/", usersRouter);

app.get("/health", (req, res) => {
  res.json({ status: "users ok" });
});

app.listen(PORT, () => {
  console.log(`Users service jookseb pordil: ${PORT}`);
});
