import React, { useState, useEffect } from 'react';
import { Job, UserProfile } from '../types';
import AIGenerator from './AIGenerator';
import { setReminder } from '../services/reminderService';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Calendar, Briefcase, Link, User as UserIcon } from 'lucide-react';

interface JobFormProps {
  onAddJob: (job: Job) => void;
  userProfile: UserProfile;
  initialJob?: Job | null;
  isEditing?: boolean;
}

export default function JobForm({ onAddJob, userProfile, initialJob, isEditing = false }: JobFormProps) {
  const [job, setJob] = useState<Omit<Job, 'id'>>({
    company: '',
    position: '',
    date_applied: '',
    status: 'Applied',
    jobPostingUrl: '',
    contactPerson: '',
  });
  const [reminderDate, setReminderDate] = useState('');

  useEffect(() => {
    if (initialJob && isEditing) {
      setJob({
        company: initialJob.company,
        position: initialJob.position,
        date_applied: initialJob.date_applied,
        status: initialJob.status,
        jobPostingUrl: initialJob.jobPostingUrl || '',
        contactPerson: initialJob.contactPerson || '',
      });
      setReminderDate(initialJob.setReminder || '');
    }
  }, [initialJob, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob = isEditing && initialJob ? { ...job, id: initialJob.id } : { ...job, id: Date.now().toString() };
    onAddJob(newJob as Job);
    if (reminderDate) {
      const reminderDateTime = new Date(reminderDate);
      setReminder(newJob as Job, reminderDateTime);
    }
    if (!isEditing) {
      setJob({
        company: '',
        position: '',
        date_applied: '',
        status: 'Applied',
        jobPostingUrl: '',
        contactPerson: '',
      });
      setReminderDate('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setJob((prevJob) => ({ ...prevJob, [name]: value }));
  };

  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Briefcase className="mr-2 h-6 w-6 text-blue-400" />
          Add New Job Application
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Field */}
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={18} />
                <Input
                  id="company"
                  name="company"
                  value={job.company}
                  onChange={handleChange}
                  className="pl-10 bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            {/* Position Field */}
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={18} />
                <Input
                  id="position"
                  name="position"
                  value={job.position}
                  onChange={handleChange}
                  className="pl-10 bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            {/* Date Applied */}
            <div className="space-y-2">
              <Label htmlFor="date_applied">Date Applied</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={18} />
                <Input
                  id="date_applied"
                  name="date_applied"
                  type="date"
                  value={job.date_applied}
                  onChange={handleChange}
                  className="pl-10 bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" value={job.status} onValueChange={(value) => setJob(prev => ({ ...prev, status: value }))}>
                <SelectTrigger id="status" className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Applied">Applied</SelectItem>
                  <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="Offer Received">Offer Received</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Job Posting URL */}
            <div className="space-y-2">
              <Label htmlFor="jobPostingUrl">Job Posting URL</Label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={18} />
                <Input
                  id="jobPostingUrl"
                  name="jobPostingUrl"
                  type="url"
                  value={job.jobPostingUrl}
                  onChange={handleChange}
                  className="pl-10 bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            {/* Contact Person */}
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={18} />
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  value={job.contactPerson}
                  onChange={handleChange}
                  className="pl-10 bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Set Reminder */}
          <div className="space-y-2">
            <Label htmlFor="reminder">Set Reminder</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={18} />
              <Input
                id="reminder"
                name="reminder"
                type="datetime-local"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="pl-10 bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => {
              if (!isEditing) {
                setJob({
                  company: '',
                  position: '',
                  date_applied: '',
                  status: 'Applied',
                  jobPostingUrl: '',
                  contactPerson: '',
                });
                setReminderDate('');
              }
            }} className="border border-black bg-gray-700 text-gray-300 rounded-2xl px-4 py-2 hover:bg-blue-500 hover:text-white hover:border-blue-700">
              Clear
            </Button>
            <Button type="submit" className="bg-gradient-to-r rounded-2xl px-4 py-2 from-green-500 to-teal-500 hover:from-teal-500 hover:to-green-500 text-white">
              {isEditing ? 'Update Job Application' : 'Add Job Application'}
            </Button>
          </div>
        </form>

        {/* AI Generator Component */}
        <div className="mt-8">
          <AIGenerator
            jobTitle={job.position}
            company={job.company}
            jobPostingUrl={job.jobPostingUrl}
            existingResume={userProfile.existingResume}
          />
        </div>
      </CardContent>
    </Card>
  );
}