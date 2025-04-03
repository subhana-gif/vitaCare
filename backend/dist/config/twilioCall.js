"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCallReminder = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const twilio_1 = __importDefault(require("twilio"));
dotenv_1.default.config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const client = (0, twilio_1.default)(accountSid, authToken);
const sendCallReminder = async (phoneNumber, message) => {
    try {
        const call = await client.calls.create({
            twiml: `<Response>
                <Say voice="man">
                  <Prosody rate="slow">
                    ${message}
                  </Prosody>
                </Say>
              </Response>`,
            to: phoneNumber,
            from: twilioNumber,
        });
        console.log(`Call scheduled successfully: ${call.sid}`);
    }
    catch (error) {
        console.error(` Error sending call reminder: ${error.message}`);
    }
};
exports.sendCallReminder = sendCallReminder;
