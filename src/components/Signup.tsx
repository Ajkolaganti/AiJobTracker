'use client'

import React, { useState } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from './auth/firebase';
import { supabase } from './auth/supabaseClient';

// Import the background image
import backgroundImage from '../../JTsignup2.jpg';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);
      setVerificationSent(true);

      await createUserProfile(user.uid, name, email, phone);
      navigate('/dashboard'); // Navigate to dashboard after successful signup and profile creation
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await createUserProfile(user.uid, user.displayName, user.email, user.phoneNumber);
      navigate('/dashboard'); // Navigate to dashboard after successful Google signup and profile creation
    } catch (error) {
      setError(error.message);
    }
  };

  const createUserProfile = async (userId, name, email, phone) => {
    const { error } = await supabase
      .from('user_data')
      .insert([
        {
          user_id: userId,
          name: name,
          email: email,
          phone: phone,
          total_applications: 0,
          resumes_created: 0,
          upcoming_interviews: 0,
          average_response_time: 0,
          application_status: [
            { name: 'Applied', value: 0 },
            { name: 'Interview', value: 0 },
            { name: 'Offer', value: 0 },
            { name: 'Rejected', value: 0 }
          ],
          subscription_plan: 'Free'
        }
      ]);

    if (error) throw error;
  };

  return (
    <div
      className="justify-center items-center min-h-screen text-gray-100 py-16 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <Card className="max-w-md mx-auto bg-gradient-to-br from-gray-800 to-blue-900 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {verificationSent ? (
            <div className="text-center">
              <p className="mb-4">A verification email has been sent to {email}.</p>
              <p>Please check your email and click on the verification link before signing in.</p>
              <Link to="/signin" className="text-blue-500 hover:underline mt-4 inline-block">
                Go to Sign In
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSignup}>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  required
                  className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
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
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  required
                  className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
              <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-teal-500 hover:to-green-500">
                Sign Up
              </Button>
            </form>
          )}

          {!verificationSent && (
            <>
              <Separator className="my-6 bg-gray-700" />

              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center border-2 border-gray-700  text-white bg-gray-800 hover:bg-gray-700"
                  onClick={handleGoogleSignup}
                >
                  <FaGoogle className="mr-2" />
                  Sign up with Google
                </Button>

                
              </div>

              <p className="text-center mt-6 text-gray-300">
                Already have an account?{' '}
                <Link to="/signin" className="text-blue-500 hover:underline">
                  Sign In
                </Link>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}