const express = require("express");
const Logger = require("./utils/Logger");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT_PROD ?? 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

/* ##### ROOT ##### */
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the API Perrona" });
});

app.use("/auth", authRoutes);
app.use("/reservaciones", require("./routes/reservacionRoutes"));
app.use("/health", require("./routes/healthRoutes"));
app.use("/componentes", require("./routes/componentesRoutes"));
app.use("/empresas", require("./routes/empresaRoutes"));

app.use("/assets", express.static(path.join(__dirname, "..", "public_assets")));

app.listen(PORT, () => {
  Logger.info(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
