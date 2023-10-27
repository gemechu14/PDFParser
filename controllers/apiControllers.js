const pdf = require("pdf-parse");
const fs = require("fs");

const pdfFilePath = "././bank_statement.pdf";

exports.search_transaction = async (req, res, next) => {
  const { startDate, endDate } = req.body;
  try {
    const transactions = await parsePDF();
    const filteredTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate >= new Date(startDate) &&
        transactionDate <= new Date(endDate)
      );
    });
    return res.status(200).json(filteredTransactions);
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({ error: "PDF file not found." });
    } else {
      return res.status(500).json({
        error: "Internal server error .",
      });
    }
  }
};
//FOR SPECIFIC DATE
exports.balance = async (req, res) => {
  const { date } = req.body;
  try {
    const transactions = await parsePDF();

    const balance = transactions
      .filter((transaction) => new Date(transaction.date) <= new Date(date))
      .reduce(
        (acc, transaction) =>
          acc +
          (parseFloat(transaction.credit) - parseFloat(transaction.debit)),
        0
      );

    return res.status(200).json({ balance: balance });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({ error: "PDF file not found." });
    } else {
      return res.status(500).json({
        error: "Internal server error .",
      });
    }
  }
};

exports.total_balance = async (req, res, next) => {
  try {
    const parsedText = await parsePDF();
    const totalBalance = calculateTotalBalance(parsedText);

    if (totalBalance !== null) {
      res.json({ totalBalance: totalBalance });
    } else {
      return res.status(404).json({ error: "Total balance not found." });
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({ error: "PDF file not found." });
    } else {
      s;
      return res.status(500).json({
        error: "Internal server error .",
      });
    }
  }
};
//Function to parse the extracted text into transaction objects
function parseBankStatementText(statementText) {
  const accountNumberRegex = /Account Number:\s*(\d+)/;
  const nameRegex = /^(MR|MS|MRS)\s+([A-Z\s]+)$/;

  const accountNumberMatch = statementText.match(accountNumberRegex);
  const nameMatch = statementText.match(nameRegex);

  const accountNumber = accountNumberMatch
    ? accountNumberMatch[1]
    : "Not Found";
  const name = nameMatch ? nameMatch[2] : "Not Found";

  const transactionRegex =
    /^(\d{2} [A-Za-z]{3} \d{4})\s(.+?)\s+([\d,.]+)\s+([\d,.]+)\s+(\S+)/gm;

  const transactions = [];
  let match;
  while ((match = transactionRegex.exec(statementText)) !== null) {
    const [All_Information, date, debit, credit, balance, _] = match;
    const cleanDebit = parseFloat(debit.replace(/[^0-9.-]+/g), "") || 0;
    const cleanCredit = parseFloat(credit.replace(/[^0-9.-]+/g), "") || 0;

    transactions.push({
      All_Information,
      date,
      debit: cleanDebit,
      credit: cleanCredit,
      balance,
    });
  }
  return transactions;
}
exports.parsePDF = async (req, res, next) => {
  try {
    console.log("pdfFilePath", pdfFilePath.length);
    const data = await pdf(fs.readFileSync(pdfFilePath));
    parsedPDF = data.text;
    const parsedData = parseBankStatementText(parsedPDF);
    return res.status(200).json(parsedData);
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({ error: "PDF file not found." });
    } else {
      console.error("Error calculating total balance:", error);
      return res.status(500).json({
        error: "Internal server error .",
      });
    }
  }
};

async function parsePDF() {
  try {
    const data = await pdf(fs.readFileSync(pdfFilePath));
    parsedPDF = data.text;
    const parsedData = parseBankStatementText(parsedPDF);
    return parsedData;
  } catch (error) {
    return res.status(500).json({
      error: "An internal server error occurred.",
    });
  }
}
function calculateTotalBalance(transactions) {
  let totalBalance = 0;
  for (const transaction of transactions) {
    const balance = parseFloat(transaction.balance) || 0;
    totalBalance += balance;
  }

  // Return the calculated total balance
  return totalBalance;
}
