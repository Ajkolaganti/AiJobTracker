import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import JobList from './JobList';
import JobForm from './JobForm';
import { Job, UserProfile } from '../types';
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { supabase } from './auth/supabaseClient';
import { useAuth } from '../AuthContext';
import { useToast } from "../hooks/use-toast";

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

  useEffect(() => {
    if (user) {
      fetchJobs();
      fetchUserProfile();
    }
  }, [user]);

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
        company: updatedJob.company,
        position: updatedJob.position,
        date_applied: updatedJob.date_applied,
        status: updatedJob.status,
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