// // gmail_auth.js
// const fs = require("fs");
// const { google } = require("googleapis");
// const readline = require("readline");

// const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

// async function authorize() {
//   try {
//     const content = fs.readFileSync("credentials.json");
//     const credentials = JSON.parse(content);
//     const { client_id, client_secret, redirect_uris } = credentials.installed; // Use 'web' object

//     const oAuth2Client = new google.auth.OAuth2(
//       client_id,
//       client_secret,
//       redirect_uris[0]
//     );
//     const tokenPath = "token.json";

//     try {
//       const token = fs.readFileSync(tokenPath);
//       oAuth2Client.setCredentials(JSON.parse(token));
//       return oAuth2Client;
//     } catch (error) {
//       return getNewToken(oAuth2Client);
//     }
//   } catch (error) {
//     console.error("Error loading client secret file:", error);
//   }
// }

// function getNewToken(oAuth2Client) {
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: "offline",
//     scope: SCOPES,
//   });
//   console.log("Authorize this app by visiting this url:", authUrl);
//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });

//   return new Promise((resolve, reject) => {
//     rl.question("Enter the code from that page here: ", (code) => {
//       rl.close();
//       oAuth2Client.getToken(code, (err, token) => {
//         if (err) {
//           console.error("Error retrieving access token", err);
//           reject(err);
//         }
//         oAuth2Client.setCredentials(token);
//         fs.writeFileSync("token.json", JSON.stringify(token));
//         console.log("Token is stored in token.json");
//         resolve(oAuth2Client);
//       });
//     });
//   });
// }

// // function getNewToken(oAuth2Client) {
// //   const authUrl = oAuth2Client.generateAuthUrl({
// //     access_type: "offline",
// //     scope: SCOPES,
// //   });
// //   console.log("Authorize this app by visiting this url:", authUrl);
// //   const rl = readline.createInterface({
// //     input: process.stdin,
// //     output: process.stdout,
// //   });

// //   return new Promise((resolve, reject) => {
// //     rl.question("Enter the code from that page here: ", (code) => {
// //       rl.close();
// //       oAuth2Client.getToken(code, (err, token) => {
// //         if (err) {
// //           console.error("Error retrieving access token", err);
// //           reject(err);
// //         }
// //         oAuth2Client.setCredentials(token);
// //         fs.writeFileSync("token.json", JSON.stringify(token));
// //         resolve(oAuth2Client);
// //       });
// //     });
// //   });
// // }

// module.exports = authorize;



const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');
const readline = require('readline');

const TOKEN_PATH = 'token.json'; // Store the token in a JSON file
const CLIENT_ID =
  "454069427528-8m9kqv8napbf43mrv68v4mdcer7n2et6.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "http://localhost:3000/callback";
const credentials = {
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  redirect_uris: REDIRECT_URI,
};
console.log(credentials);
const oAuth2Client = new OAuth2Client(
  credentials.client_id,
  credentials.client_secret,
  credentials.redirect_uris[0]
);

// Check if we have previously stored a token
fs.readFile(TOKEN_PATH, (err, token) => {
  if (err) {
    // If no token, start the OAuth2 flow
    getAccessToken(oAuth2Client);
  } else {
    oAuth2Client.setCredentials(JSON.parse(token));
  }
});

function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
  });

  console.log('Authorize this app by visiting this URL:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from the page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error('Error retrieving access token:', err);
        return;
      }
      oAuth2Client.setCredentials(token);
      // Store the token for future use
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
    });
  });
}

module.exports = oAuth2Client; // Export the OAuth2 client
