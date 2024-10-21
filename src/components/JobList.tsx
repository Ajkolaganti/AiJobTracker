import React from 'react';
import { Job } from '../types';
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Edit2, Trash2 } from 'lucide-react';

interface JobListProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
}

export default function JobList({ jobs, onEdit, onDelete }: JobListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-500 text-white';
      case 'Interview Scheduled':
        return 'bg-yellow-500 text-white';
      case 'Offer Received':
        return 'bg-green-500 text-white';
      case 'Rejected':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
        Your Job Applications
      </h2>
      <Table className="min-w-full bg-gray-800 text-white">
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 py-2">Company</TableHead>
            <TableHead className="px-4 py-2">Position</TableHead>
            <TableHead className="px-4 py-2">Date Applied</TableHead>
            <TableHead className="px-4 py-2">Status</TableHead>
            <TableHead className="px-4 py-2">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id} className="hover:bg-blue-700-500 transition-colors duration-200">
              <TableCell className="border bg-black text-white px-4 py-2 font-medium">{job.company}</TableCell>
              <TableCell className="border bg-black text-white px-4 py-2">{job.position}</TableCell>
              <TableCell className="border bg-black text-white px-4 py-2">{job.date_applied}</TableCell>
              <TableCell className="border bg-black text-white px-4 py-2">
                <Badge className={`px-2 py-1 rounded-full ${getStatusColor(job.status)}`}>{job.status}</Badge>
              </TableCell>
              <TableCell className="border bg-black text-white hover:bg-gray-800 px-4 py-2">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="hover:bg-blue-500 hover:text-white transition-colors bg-gray-1000 text-white duration-200"
                    onClick={() => onEdit(job)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="hover:bg-red-500 hover:text-white transition-colors bg-red-800 text-white duration-200"
                    onClick={() => onDelete(job.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}