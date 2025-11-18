import { Button } from "@/components/ui/button";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";

export default function LoginPage() {
  const handleGoogleSignIn = async () => {
    try {
      // 1. Trigger Google Sign-In popup with Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 2. Get the Firebase ID token from the user object
      const idToken = await user.getIdToken();

      // 3. Send the ID token to our backend server
      const api_url = import.meta.env.VITE_API_URL;
      const res = await axios.post(`${api_url}/auth/google-login`, {
        idToken,
      });

      // 4. If successful, backend sends our app's JWT token
      const { token, user: appUser } = res.data;
      console.log("App Token:", token);
      console.log("User Info:", appUser);
      
      // TODO: Store the token in localStorage and redirect user
      alert("Login Successful!");

    } catch (error) {
      console.error("Error during Google sign-in:", error);
      const errorMessage = error.response?.data?.message || "An error occurred during sign-in.";
      alert(`Login Failed: ${errorMessage}`);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white shadow-md rounded-lg text-center">
        <h1 className="text-3xl font-bold mb-2">Welcome to Readus</h1>
        <p className="text-gray-600 mb-6">VIT Bhopal's Campus Book Exchange</p>
        <Button onClick={handleGoogleSignIn}>
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}