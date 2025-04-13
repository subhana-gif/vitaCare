"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const sendCallReminder = (phoneNumber, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const call = yield client.calls.create({
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
});
exports.sendCallReminder = sendCallReminder;
