// otpStore.ts
type OTPData = {
    otp: string;
    expiresAt: number;
  };
  
  const otpStore = new Map<string, OTPData>();
  
  export const saveOTP = (email: string, otp: string, ttlSeconds = 300) => {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    otpStore.set(email, { otp, expiresAt });
  };
  
  export const verifyOTP = (email: string, enteredOTP: string): boolean => {
    const data = otpStore.get(email);
    if (!data) return false;
  
    if (Date.now() > data.expiresAt) {
      otpStore.delete(email); // Expired OTP
      return false;
    }
  
    const isValid = data.otp === enteredOTP;
    if (isValid) otpStore.delete(email); // Consume OTP after verification
    return isValid;
  };
  
  export const resendOTP = (email: string): string => {
    const data = otpStore.get(email);
    return data?.otp ?? "";
  };
  