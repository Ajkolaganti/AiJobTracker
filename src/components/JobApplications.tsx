import React, { useState, useEffect } from 'react';
import { Mail, Plus } from 'lucide-react';
import JobList from './JobList';
import JobForm from './JobForm';
import { Job, UserProfile } from '../types';
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { supabase } from './auth/supabaseClient';
import { useAuth } from '../AuthContext';
import { useToast } from "../hooks/use-toast";
import EmailJobTracker from './EmailJobTracker';
import { aiService } from '../services/aiService';


const JobApplications = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [jobToDeleteId, setJobToDeleteId] = useState<string | null>(null);
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const { toast } = useToast();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isConsentDialogOpen, setIsConsentDialogOpen] = useState(false);



  useEffect(() => {
    if (user) {
      fetchJobs();
      fetchUserProfile();

    }
  }, [user]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('access_token');
    if (token) {
      setAccessToken(token);
      fetchJobsFromEmail(token);
    }
  }, []);

  const fetchJobs = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('userid', user.uid);

    if (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error fetching jobs",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setJobs(data || []);
    }
  };

  const handleNewJobsFound = (newJobs: Job[]) => {
    setJobs([...jobs, ...newJobs]);
    toast({
      title: "New jobs found",
      description: `${newJobs.length} new job application(s) added from your email.`,
      variant: "default",
    });
  };

  const fetchUserProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', user.uid)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
    } else {
      setUserProfile(data || {});
    }
  };

  const addJob = async (job: Omit<Job, 'id' | 'userid'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('jobs')
      .insert([{ 
        userid: user.uid,
        company: job.company,
        position: job.position,
        date_applied: job.date_applied,
        status: job.status,
        job_posting_url: job.jobPostingUrl || null,
        contact_person: job.contactPerson || null,
        set_reminder: job.setReminder || null
      }])
      .select();

    if (error) {
      console.error('Error adding job:', error);
      toast({
        title: "Error adding job",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setJobs([...jobs, data[0]]);
      setIsFormOpen(false);
      toast({
        title: "Job added successfully",
        variant: "default",
      });
    }
  };

const handleEdit = (job: Job) => {
    setEditingJob(job);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (updatedJob: Job) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('jobs')
      .update({
        company: updatedJob.company || null,
        position: updatedJob.position || null,
        date_applied: updatedJob.date_applied || null,
        status: updatedJob.status || null,
        job_posting_url: updatedJob.jobPostingUrl || null,
        contact_person: updatedJob.contactPerson || null,
        set_reminder: updatedJob.setReminder || null
      })
      .eq('id', updatedJob.id)
      .select();

    if (error) {
      console.error('Error updating job:', error);
      toast({
        title: "Error updating job",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setJobs(jobs.map(job => job.id === updatedJob.id ? data[0] : job));
      setIsEditModalOpen(false);
      setEditingJob(null);
      toast({
        title: "Job updated successfully",
        variant: "default",
      });
    }
  };

//   const handleEditSubmit = async (updatedJob: Job) => {
//     if (!user) return;

//     const { data, error } = await supabase
//       .from('jobs')
//       .update({
//         company: updatedJob.company,
//         position: updatedJob.position,
//         date_applied: updatedJob.date_applied,
//         status: updatedJob.status,
//         job_posting_url: updatedJob.jobPostingUrl || null,
//         contact_person: updatedJob.contactPerson || null,
//         set_reminder: updatedJob.setReminder || null
//       })
//       .eq('id', updatedJob.id)
//       .select();

//     if (error) {
//       console.error('Error updating job:', error);
//       toast({
//         title: "Error updating job",
//         description: error.message,
//         variant: "destructive",
//       });
//     } else if (data) {
//       setJobs(jobs.map(job => job.id === updatedJob.id ? data[0] : job));
//       setIsEditModalOpen(false);
//       setEditingJob(null);
//       toast({
//         title: "Job updated successfully",
//         variant: "default",
//       });
//     }
//   };

  const handleDelete = (jobId: string) => {
    setJobToDeleteId(jobId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!jobToDeleteId || !user) return;

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobToDeleteId);

    if (error) {
      console.error('Error deleting job:', error);
      toast({
        title: "Error deleting job",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setJobs(jobs.filter(job => job.id !== jobToDeleteId));
      setIsDeleteDialogOpen(false);
      setJobToDeleteId(null);
      toast({
        title: "Job deleted successfully",
        variant: "default",
      });
    }
  };

  const handleAddJobsFromEmail = async () => {
    if (!user) return;

    if (!accessToken) {
      setIsConsentDialogOpen(true);
      return;
    }

    await fetchJobsFromEmail(accessToken);
  };

  const handleConsentGranted = async () => {
    setIsConsentDialogOpen(false);
    try {
      const authUrl = await aiService.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error getting auth URL:', error);
      toast({
        title: "Authentication Error",
        description: "Failed to start the authentication process. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchJobsFromEmail = async (token: string) => {
    if (!user) return;

    toast({
      title: "Checking email for jobs",
      description: "Please wait while we fetch job applications from your email.",
      variant: "default",
    });

    try {
        console.log('Fetching jobs from email going to aiService.ts..',user.uid);
      const newJobs = await aiService.fetchJobsFromEmail(user.uid, token);

      // Merge new jobs with existing jobs, avoiding duplicates
      setJobs(prevJobs => {
        const existingIds = new Set(prevJobs.map(job => job.id));
        const uniqueNewJobs = newJobs.filter(job => !existingIds.has(job.id));
        return [...prevJobs, ...uniqueNewJobs];
      });
      console.log('Jobs fetched from email:', newJobs);
      console.log('Updated jobs:', jobs)

      toast({
        title: "Jobs imported successfully",
        description: `${newJobs.length} new job application(s) added from your email.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error fetching jobs from email:', error);
      toast({
        title: "Error importing jobs",
        description: "Failed to import jobs from your email. Please try again later.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Job Applications</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-gray-800 to-blue-800 rounded-xl hover:bg-blue-600 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Job
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-gray-800 to-gray-900 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add New Job Application</DialogTitle>
            </DialogHeader>
            <JobForm onAddJob={addJob} userProfile={userProfile} />
          </DialogContent>
        </Dialog>
        {/* Add EmailJobTracker component */}
        <Button 
        onClick={handleAddJobsFromEmail} 
        className="bg-gradient-to-r from-gray-800 to-green-800 rounded-xl hover:bg-green-600 text-white"
      >
        <Mail className="mr-2 h-4 w-4" /> Add Jobs from Email
      </Button>

       {/* Consent Dialog */}
       <AlertDialog open={isConsentDialogOpen} onOpenChange={setIsConsentDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Grant Email Access</AlertDialogTitle>
            <AlertDialogDescription>
              To fetch job applications from your email, we need your permission to access your Gmail account. 
              We will only read emails related to job applications. You can revoke this permission at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConsentGranted}>Grant Access</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      </div>
      <JobList jobs={jobs} onEdit={handleEdit} onDelete={handleDelete} />

      {/* Edit Job Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-gray-800 to-gray-900 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Job Application</DialogTitle>
          </DialogHeader>
          <JobForm
            onAddJob={handleEditSubmit}
            userProfile={userProfile}
            initialJob={editingJob}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this job application?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job application from our records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JobApplications;