import React, { useState } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { supabase } from './auth/supabaseClient';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from './auth/firebase';


export default function SigninPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else if (data) {
      navigate('/dashboard');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Save user info to localStorage or context for later use
      localStorage.setItem('userToken', user.accessToken);
      localStorage.setItem('userProfile', JSON.stringify({
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      }));
      console.log("Signin successful:", user);


      // Navigate to the dashboard or home page after successful login
      navigate('/applications');
    setTimeout(() => navigate('/dashboard'), 100);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto bg-gradient-to-br from-gray-800 to-gray-900 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form className="space-y-6" onSubmit={handleSignIn}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                required
                className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500">
              Sign In
            </Button>
          </form>

          <Separator className="my-6 bg-gray-700" />

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center border border-gray-700 text-white bg-gray-800 hover:bg-gray-700"
              onClick={handleGoogleSignIn}
            >
              <FaGoogle className="mr-2" />
              Sign in with Google
            </Button>

            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className="w-full border border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
                onClick={() => console.log('Facebook signin')}
              >
                <FaFacebook />
              </Button>
              <Button
                variant="outline"
                className="w-full border border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
                onClick={() => console.log('Twitter signin')}
              >
                <FaTwitter />
              </Button>
              <Button
                variant="outline"
                className="w-full border border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
                onClick={() => console.log('LinkedIn signin')}
              >
                <FaLinkedin />
              </Button>
            </div>
          </div>

          <p className="text-center mt-6 text-gray-300">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}