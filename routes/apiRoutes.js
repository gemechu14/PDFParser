const express = require("express");
const router = express.Router();
const {
  parsePDF,
  balance,
  total_balance,
  search_transaction,
} = require("../controllers/apiControllers.js");

router.get("/transactions", parsePDF);
router.post("/transactions/search", search_transaction);
router.get("/balance/total_balance", total_balance);
router.post("/specific_date", balance);

module.exports = router;
