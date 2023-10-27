const express = require("express");
const app = express();
app.use(express.json());
require("dotenv").config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const port = 3000;

const apiRoutes = require("./routes/apiRoutes");
const emailRoutes = require("./routes/emailRoutes.js");
app.use("/api", apiRoutes);
app.use("/", emailRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log(`App listening at http://localhost:${process.env.PORT}`);
});
