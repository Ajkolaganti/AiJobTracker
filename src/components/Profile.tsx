import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { UserProfile } from '../types';
import { Download, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './auth/supabaseClient';
import { useAuth } from '../AuthContext';
import { useToast } from "../hooks/use-toast";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    existingResume: null,
  });
  const [aiGeneratedResumes, setAiGeneratedResumes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchAiGeneratedResumes();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('user_data')
      .select('name, email, phone')
      .eq('user_id', user.uid)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error fetching profile",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setProfile(prevProfile => ({
        ...prevProfile,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
      }));
    }
    setIsLoading(false);
  };

  const fetchAiGeneratedResumes = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('ai_generated_resumes')
      .select('*')
      .eq('user_id', user.uid);

    if (error) {
      console.error('Error fetching AI generated resumes:', error);
    } else if (data) {
      setAiGeneratedResumes(data.map(item => item.resume_text));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfile(prev => ({ ...prev, existingResume: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
  
    const { error } = await supabase
      .from('user_data')
      .upsert(
        {
          user_id: user.uid,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
        },
        { onConflict: ['user_id'] } // Ensure upsert only updates the existing row if there's a conflict on user_id
      );
  
    if (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } else {
        console.log('profile updated successfully')
      toast({
        title: "Profile updated successfully",
        variant: "default",
      });
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signin');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Profile Details</TabsTrigger>
              <TabsTrigger value="resumes">AI Generated Resumes</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={handleInputChange}
                    className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resume">Upload Resume</Label>
                  <Input
                    id="resume"
                    name="resume"
                    type="file"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx"
                    className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                  />
                </div>
                <Button type="submit" className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-teal-500 hover:to-green-500 text-white" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </Button>
                <div className="p-4">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="resumes">
              <div className="space-y-4">
                {aiGeneratedResumes.length > 0 ? (
                  aiGeneratedResumes.map((resume, index) => (
                    <Card key={index} className="bg-gray-800 text-white">
                      <CardContent className="p-4">
                        <p className="font-medium">Resume {index + 1}</p>
                        <p className="text-sm text-gray-300">{resume}</p>
                        <Button className="mt-2 bg-blue-500 hover:bg-blue-600" variant="outline">
                          <Download className="mr-2 h-4 w-4" /> Download
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p>No AI-generated resumes available.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}