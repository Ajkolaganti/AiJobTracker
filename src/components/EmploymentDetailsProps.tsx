import React, { useState } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Trash2, Loader2 } from 'lucide-react';
import { enhanceText } from '../services/aiService';

interface EmploymentDetailsProps {
  experience: {
    id: string;
    jobTitle: string;
    employer: string;
    startDate: string;
    endDate: string;
    location: string;
    projectDescription: string;
    responsibilities: string;
  };
  updateExperience: (id: string, field: string, value: string) => void;
  deleteExperience: (id: string) => void;
}

const EmploymentDetails: React.FC<EmploymentDetailsProps> = ({
  experience,
  updateExperience,
  deleteExperience,
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhance = async (field: 'projectDescription' | 'responsibilities') => {
    setIsEnhancing(true);
    try {
      const enhancedText = await enhanceText(experience[field]);
      updateExperience(experience.id, field, enhancedText);
    } catch (error) {
      console.error('Error enhancing text:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="mb-4 p-4 border rounded-lg border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor={`jobTitle-${experience.id}`}>Job Title</Label>
          <Input
            id={`jobTitle-${experience.id}`}
            value={experience.jobTitle}
            onChange={(e) => updateExperience(experience.id, 'jobTitle', e.target.value)}
            className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`employer-${experience.id}`}>Employer</Label>
          <Input
            id={`employer-${experience.id}`}
            value={experience.employer}
            onChange={(e) => updateExperience(experience.id, 'employer', e.target.value)}
            className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`startDate-${experience.id}`}>Start Date</Label>
          <Input
            id={`startDate-${experience.id}`}
            type="date"
            value={experience.startDate}
            onChange={(e) => updateExperience(experience.id, 'startDate', e.target.value)}
            className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`endDate-${experience.id}`}>End Date</Label>
          <Input
            id={`endDate-${experience.id}`}
            type="date"
            value={experience.endDate}
            onChange={(e) => updateExperience(experience.id, 'endDate', e.target.value)}
            className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`location-${experience.id}`}>Location</Label>
          <Input
            id={`location-${experience.id}`}
            value={experience.location}
            onChange={(e) => updateExperience(experience.id, 'location', e.target.value)}
            className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={`projectDescription-${experience.id}`}>Project Description</Label>
          <div className="relative">
            <Textarea
              id={`projectDescription-${experience.id}`}
              value={experience.projectDescription}
              onChange={(e) => updateExperience(experience.id, 'projectDescription', e.target.value)}
              rows={3}
              className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
              disabled={isEnhancing}
            />
            <Button
              onClick={() => handleEnhance('projectDescription')}
              disabled={isEnhancing}
              className="mt-2 bg-gradient-to-500 bg-gradient-to-br from-gray-800 to-blue-800 rounded-xl hover:bg-blue-600"
            >
              {isEnhancing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enhancing...
                </>
              ) : (
                'Enhance with AI'
              )}
            </Button>
          </div>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={`responsibilities-${experience.id}`}>Responsibilities</Label>
          <div className="relative">
            <Textarea
              id={`responsibilities-${experience.id}`}
              value={experience.responsibilities}
              onChange={(e) => updateExperience(experience.id, 'responsibilities', e.target.value)}
              rows={4}
              className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
              disabled={isEnhancing}
            />
            <Button
              onClick={() => handleEnhance('responsibilities')}
              disabled={isEnhancing}
              className="mt-2 bg-gradient-to-500 bg-gradient-to-br from-gray-800 to-blue-800 rounded-xl hover:bg-blue-600"
            >
              {isEnhancing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enhancing...
                </>
              ) : (
                'Enhance with AI'
              )}
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => deleteExperience(experience.id)} className="text-red-500 hover:bg-red-500 hover:text-white">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </div>
    </div>
  );
};

export default EmploymentDetails;