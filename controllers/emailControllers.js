const { OAuth2Client } = require("google-auth-library");
const { google } = require("googleapis");
const pdf = require("pdf-parse");
const express = require("express");
const app = express();
const fs = require("fs");
app.use(express.json());
const TOKEN_PATH = "token.json";

const oAuth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);
const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/gmail.readonly"],
});

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

exports.list_emails = async (req, res, next) => {
  try {
    const { subject } = req.body;
    // Check if we have a valid token, or refresh it
    const token = fs.readFileSync(TOKEN_PATH, "utf-8"); // Assuming TOKEN_PATH is defined
    oAuth2Client.setCredentials(JSON.parse(token));

    const response = await gmail.users.messages.list({
      userId: "me",
      q: subject,
    });
    const messages = response.data.messages;
    // users.messages.attachments.list;
    if (!messages) {
      res.send("No emails found.");
    } else {
      // Step 2: List attachments for each message
      const messagesWithAttachments = [];

      for (const message of messages) {
        const messageId = message.id;

        // List attachments for the current message
        const messageDetails = await gmail.users.messages.get({
          userId: "me",
          id: messageId,
        });

        const attachments = messageDetails.data.payload.parts;

        // Add the attachment information to the message object
        message.attachments = attachments;

        messagesWithAttachments.push(message);
      }

      res.json(messagesWithAttachments);
    }
  } catch (error) {}
};

exports.download_attachments = async (req, res, next) => {
  const { messageId, attachmentId } = req.body;
  try {
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
    const response = await gmail.users.messages.attachments.get({
      userId: "me",
      messageId,
      id: attachmentId,
    });

    const data = response.data;
    const pdfBuffer = Buffer.from(data.data, "base64");

    // Save the PDF locally
    fs.writeFileSync("bank_statement.pdf", pdfBuffer);

    // Parse the PDF
    const pdfText = await pdf(pdfBuffer);
    res.send(pdfText.text);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error downloading and parsing PDF.");
  }
};

exports.callback = async (req, res, next) => {
  try {
    const authorizationCode = req.query.code;

    oAuth2Client.getToken(authorizationCode, (err, tokens) => {
      if (err) {
        console.error("Error getting tokens:", err);
        res.send("Error getting tokens");
        return;
      }

      const accessToken = tokens.access_token;
      const refreshToken = tokens.refresh_token;
      const expiryDate = tokens.expiry_date;

      // Use the access token to make authorized API requests
      // For example, you can use axios to make requests to the Gmail API
      axios
        .get("https://www.googleapis.com/gmail/v1/users/me/profile", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          res.send("Tokens obtained successfully!");
        })
        .catch((error) => {
          return res.status(500).json({
            error: "An internal server error occurred.",
          });
        });
    });
  } catch (error) {
    return res.status(500).json({
      error: "An internal server error occurred.",
    });
  }
};
