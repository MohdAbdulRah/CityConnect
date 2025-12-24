const axios = require("axios");

const sendMail = async ({ to, subject, html }) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "CityConnect",
          email: process.env.MAIL_USER,
        },
        to: [
          {
            email: to,
          },
        ],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );
  } catch (err) {
    console.error("BREVO API ERROR:", err.response?.data || err.message);
    throw new Error("Email sending failed");
  }
};

module.exports = sendMail;
