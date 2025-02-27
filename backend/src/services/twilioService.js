const twilio = require("twilio");
require("dotenv").config();

const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendCall(phoneNumber) {
  try {
    const call = await client.calls.create({
      url: "http://demo.twilio.com/docs/voice.xml", // Change this to a custom message
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    console.log("Call SID:", call.sid);
  } catch (error) {
    console.error("Error making call:", error);
  }
}

module.exports = sendCall;
