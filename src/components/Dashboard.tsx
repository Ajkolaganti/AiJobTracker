import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Briefcase, FileText, Calendar, Clock } from 'lucide-react';
import { supabase } from './auth/supabaseClient';
import { useAuth } from '../AuthContext';

interface JobApplication {
  id: string;
  status: string;
  date_applied: string;
}

interface UserProfile {
  total_applications: number;
  resumes_created: number;
  upcoming_interviews: number;
  average_response_time: number;
  application_status: { name: string; value: number }[];
}

export default function DashboardPage() {
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchJobApplications();
      fetchUserProfile();
    }
  }, [user]);

  const fetchJobApplications = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('jobs')
      .select('id, status, date_applied')
      .eq('userid', user.uid);

    if (error) {
      console.error('Error fetching job applications:', error);
    } else {
      setJobApplications(data || []);
    }
  };

  const fetchUserProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_data')
      .select('total_applications, resumes_created, upcoming_interviews, average_response_time, application_status')
      .eq('user_id', user.uid)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
    } else {
      setUserProfile(data);
    }
  };

  const calculateApplicationStatus = () => {
    const statusCounts = jobApplications.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Applied', value: statusCounts['Applied'] || 0 },
      { name: 'Interview', value: statusCounts['Interview Scheduled'] || 0 },
      { name: 'Offer', value: statusCounts['Offer Received'] || 0 },
      { name: 'Rejected', value: statusCounts['Rejected'] || 0 },
    ];
  };

  const applicationStatus = calculateApplicationStatus();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
        Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Briefcase className="h-6 w-6 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobApplications.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resumes Created</CardTitle>
            <FileText className="h-6 w-6 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userProfile?.resumes_created || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Interviews</CardTitle>
            <Calendar className="h-6 w-6 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userProfile?.upcoming_interviews || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
            <Clock className="h-6 w-6 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userProfile?.average_response_time || 0} days</div>
          </CardContent>
        </Card>
      </div>
      <Card className="mb-8 bg-gradient-to-br from-gray-800 to-gray-900 text-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Application Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={applicationStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#555" />
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#1f2937' }}
                itemStyle={{ color: '#fff' }}
                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
              />
              <Bar dataKey="value" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}