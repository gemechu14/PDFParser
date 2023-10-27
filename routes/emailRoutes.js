const express = require("express");
const router = express.Router();
const {
  list_emails,
  download_attachments,
  callback,
} = require("../controllers/emailControllers.js");
router.post("/list_email", list_emails);
router.post("/download_attachment", download_attachments);
router.get("/callback", callback);
module.exports = router;
