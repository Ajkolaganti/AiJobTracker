// AIGenerator.tsx

import React, { useState } from 'react';
import { generateResumeAndCoverLetter } from '../services/aiService';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Loader2, FileText } from 'lucide-react';

interface AIGeneratorProps {
  jobTitle: string;
  company: string;
  jobPostingUrl: string;
  existingResume?: string;
}

export default function AIGenerator({ jobTitle, company, jobPostingUrl, existingResume }: AIGeneratorProps) {
  const [content, setContent] = useState<{ resume: string; coverLetter: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const generatedContent = await generateResumeAndCoverLetter(jobTitle, company, jobPostingUrl, existingResume);
      setContent(generatedContent);
    } catch (error) {
      console.error('Error generating content:', error);
    }
    setLoading(false);
  };

  return (
    <Card className="mt-6 bg-gradient-to-br from-gray-800 to-gray-900 text-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">AI-Assisted Document Generation</CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleGenerate}
          className="w-full mb-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-teal-500 hover:to-green-500 text-white"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Generate Resume & Cover Letter
            </>
          )}
        </Button>
        {content && (
          <Tabs defaultValue="resume" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="resume">Resume</TabsTrigger>
              <TabsTrigger value="coverLetter">Cover Letter</TabsTrigger>
            </TabsList>
            <TabsContent value="resume">
              <Card className="bg-gray-800 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Generated Resume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-700 p-4 rounded-md whitespace-pre-wrap text-sm">{content.resume}</div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="coverLetter">
              <Card className="bg-gray-800 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Generated Cover Letter</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-700 p-4 rounded-md whitespace-pre-wrap text-sm">{content.coverLetter}</div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}