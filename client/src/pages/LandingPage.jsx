// client/src/pages/LandingPage.jsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";
import { BookOpen, Users, ArrowRightLeft } from "lucide-react"; // Import icons
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from '@/context/AuthContext'; // Import our custom auth hook

const LandingPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Get the login function from our context

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const api_url = import.meta.env.VITE_API_URL;
      const res = await axios.post(`${api_url}/auth/google-login`, { idToken });

      const { token, user } = res.data;
      
      // 1. Call the login function from our context
      login(token, user);

      // 2. Redirect the user based on their status
      if (user.hasListedFirstBook) {
        navigate('/feed');
      } else {
        navigate('/onboarding');
      }
      
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      const errorMessage = error.response?.data?.message || "An error occurred during sign-in.";
      alert(`Login Failed: ${errorMessage}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 className="text-2xl font-bold text-slate-800">readius</h1>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="text-center py-20 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl lg:text-6xl font-extrabold text-slate-900">
              Exchange Books, Expand Minds.
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
              A peer-to-peer book lending platform exclusively for VIT Bhopal students. Share your books, discover new reads, and connect with your campus community.
            </p>
            <div className="mt-8">
              <Button size="lg" onClick={handleGoogleSignIn}>
                Sign in with Google to Get Started
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-slate-900">Why Readus?</h3>
              <p className="mt-2 text-md text-slate-600">Everything you need for a seamless book exchange experience.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader className="items-center">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="mt-4">For Students, By Students</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-slate-600">
                  Built for the VITB community. Sign in with your official university email to ensure a safe and trusted environment.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="items-center">
                   <div className="bg-primary/10 p-3 rounded-full">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Effortless Discovery</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-slate-600">
                  Easily list your books using the Google Books API and browse an infinite feed of available books from your peers.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="items-center">
                   <div className="bg-primary/10 p-3 rounded-full">
                    <ArrowRightLeft className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Simple & Secure Transactions</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-slate-600">
                  Request, borrow, and return books with a clear, tracked process. A badge-based reputation system helps build trust.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 bg-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500">
          &copy; {new Date().getFullYear()} Readus. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;