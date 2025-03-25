import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

const accountSid: string = process.env.TWILIO_ACCOUNT_SID as string;
const authToken: string = process.env.TWILIO_AUTH_TOKEN as string;
const twilioNumber: string = process.env.TWILIO_PHONE_NUMBER as string;

const client = twilio(accountSid, authToken);

/**
 * Sends an automated call reminder
 * @param phoneNumber - Recipient's phone number
 * @param message - Message to be spoken during the call
 */
export const sendCallReminder = async (phoneNumber: string, message: string) => {
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

    console.log(`✅ Call scheduled successfully: ${call.sid}`);
  } catch (error) {
    console.error(`❌ Error sending call reminder: ${(error as Error).message}`);
  }
};
