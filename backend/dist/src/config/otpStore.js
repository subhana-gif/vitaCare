"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendOTP = exports.verifyOTP = exports.saveOTP = void 0;
const otpStore = new Map();
const saveOTP = (email, otp, ttlSeconds = 300) => {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    otpStore.set(email, { otp, expiresAt });
};
exports.saveOTP = saveOTP;
const verifyOTP = (email, enteredOTP) => {
    const data = otpStore.get(email);
    if (!data)
        return false;
    if (Date.now() > data.expiresAt) {
        otpStore.delete(email); // Expired OTP
        return false;
    }
    const isValid = data.otp === enteredOTP;
    if (isValid)
        otpStore.delete(email); // Consume OTP after verification
    return isValid;
};
exports.verifyOTP = verifyOTP;
const resendOTP = (email) => {
    var _a;
    const data = otpStore.get(email);
    return (_a = data === null || data === void 0 ? void 0 : data.otp) !== null && _a !== void 0 ? _a : "";
};
exports.resendOTP = resendOTP;
