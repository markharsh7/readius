// client/src/pages/OnboardingPage.jsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Your firebase config
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

// Placeholder component for the book listing step
const AddFirstBook = () => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Step 2: List Your First Book</h3>
      <p>This will be the book search and add form.</p>
    </div>
  );
}

// --- Start of updated VerifyPhone component ---
const VerifyPhone = ({ onVerified }) => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, token } = useAuth();

  // Setup reCAPTCHA on component mount
  useEffect(() => {
    // The 'recaptcha-container' div is crucial.
    // The 'invisible' size means the user doesn't have to solve a puzzle
    // unless Firebase's risk analysis deems it necessary.
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        console.log("reCAPTCHA verified");
      }
    });
    return () => {
      // Cleanup verifier on unmount
      window.recaptchaVerifier.clear();
    };
  }, []);

  const handleSendOtp = async () => {
    setError("");
    if (!/^\+91[6-9]\d{9}$/.test(phone)) {
        setError("Please enter a valid Indian phone number (e.g., +919876543210).");
        return;
    }
    setLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
      setError(""); // Clear previous errors
      console.log("OTP sent successfully!");
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      // 1. Confirm the OTP with Firebase
      const result = await confirmationResult.confirm(otp);
      const firebaseUser = result.user;
      console.log("Firebase OTP verification successful:", firebaseUser);

      // 2. Get the fresh ID token which now contains the phone number
      const idToken = await firebaseUser.getIdToken();

      // 3. Send this token to our backend to update our database
      await axios.post(
        `${import.meta.env.VITE_API_URL}/users/update-phone`,
        { idToken },
        // The AuthContext already sets the Authorization header for us!
      );

      console.log("Backend phone update successful!");
      onVerified(); // Tell the parent component to move to the next step

    } catch (error) {
      console.error("Error verifying OTP:", error);
      setError("Invalid OTP or verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Step 1: Verify Your Phone Number</h3>
      <p className="text-sm text-slate-500 mb-4">An OTP will be sent for verification.</p>
      
      <div id="recaptcha-container"></div>
      
      <div className="space-y-4">
        {!confirmationResult ? (
          // Show Phone Input View
          <>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                placeholder="+919876543210" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button className="w-full" onClick={handleSendOtp} disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </>
        ) : (
          // Show OTP Input View
          <>
            <p className="text-sm text-green-600">OTP sent to {phone}.</p>
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input 
                id="otp" 
                placeholder="XXXXXX" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button className="w-full" onClick={handleVerifyOtp} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </>
        )}
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
};
// --- End of updated VerifyPhone component ---


export default function OnboardingPage() {
  const [step, setStep] = useState(1); 

  const handlePhoneVerified = () => {
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Readus!</CardTitle>
          <CardDescription>Just a couple more steps to get you set up.</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && <VerifyPhone onVerified={handlePhoneVerified} />}
          {step === 2 && <AddFirstBook />}
        </CardContent>
      </Card>
    </div>
  );
}