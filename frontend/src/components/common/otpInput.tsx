import React from "react";

interface CommonOtpInputProps {
  otp: string;
  setOtp: (otp: string) => void;
  handleVerifyOtp: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  resendOTP: () => void;
  timer: number;
  otpRequestCount: number;
}

const CommonOtpInput: React.FC<CommonOtpInputProps> = ({
  otp,
  setOtp,
  handleVerifyOtp,
  isSubmitting,
  resendOTP,
  timer,
  otpRequestCount,
}) => (
  <form onSubmit={handleVerifyOtp} className="space-y-6">
    <div>
      <label className="block text-gray-700 text-lg font-medium mb-2">Enter OTP</label>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>

    <button
      type="submit"
      disabled={isSubmitting}
      className={`w-full bg-blue-600 text-white py-3 text-xl font-medium rounded-lg hover:bg-blue-700 transition duration-300 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
    >
      {isSubmitting ? "Verifying..." : "Verify OTP"}
    </button>

    <div className="text-center">
      <button
        type="button"
        onClick={resendOTP}
        disabled={isSubmitting || otpRequestCount >= 3 || timer > 0}
        className="text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
      >
        Resend OTP {timer > 0 ? `(${timer}s)` : ""}
      </button>
    </div>
  </form>
);

export default CommonOtpInput;
