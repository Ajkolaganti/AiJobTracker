import React, { useState, useEffect } from 'react';
import { supabase } from './auth/supabaseClient';
import { useAuth } from '../AuthContext';
import { useToast } from "../hooks/use-toast";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Mail, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface EmailJobTrackerProps {
  onNewJobsFound: (newJobs: any[]) => void;
}

const EmailJobTracker: React.FC<EmailJobTrackerProps> = ({ onNewJobsFound }) => {
  const [isTracking, setIsTracking] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTrackingStatus();
    }
  }, [user]);

  const fetchTrackingStatus = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('email_tracking')
      .select('is_tracking')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching tracking status:', error);
    } else if (data) {
      setIsTracking(data.is_tracking || false);
    }
  };

  const handleToggleTracking = async () => {
    if (!user) return;

    const newTrackingStatus = !isTracking;

    const { error } = await supabase
      .from('email_tracking')
      .upsert({ user_id: user.id, is_tracking: newTrackingStatus });

    if (error) {
      console.error('Error updating tracking status:', error);
      toast({
        title: "Error updating tracking status",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setIsTracking(newTrackingStatus);
      toast({
        title: newTrackingStatus ? "Email tracking started" : "Email tracking stopped",
        description: newTrackingStatus 
          ? "We'll now track job applications from your email." 
          : "We've stopped tracking job applications from your email.",
        variant: "default",
      });

      if (newTrackingStatus) {
        startEmailChecking();
      } else {
        stopEmailChecking();
      }
    }
  };

  const startEmailChecking = async () => {
    // This function would typically be implemented on the server-side
    // For demonstration, we'll simulate finding new jobs
    const simulateNewJobs = [
      { company: 'TechCorp', position: 'Software Engineer', date_applied: '2023-05-15', status: 'Applied' },
      { company: 'DataInc', position: 'Data Analyst', date_applied: '2023-05-16', status: 'Applied' },
    ];
    onNewJobsFound(simulateNewJobs);
  };

  const stopEmailChecking = () => {
    // This function would typically be implemented on the server-side
    // It would stop the email checking process
    console.log('Email checking stopped');
  };

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          You must be logged in to use email tracking.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white mt-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="mr-2 h-6 w-6 text-blue-400" />
          Email Job Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>We will use your account email: {user.email}</p>
          <Button 
            onClick={handleToggleTracking} 
            className={isTracking ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}
          >
            {isTracking ? "Stop Tracking" : "Start Tracking"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailJobTracker;