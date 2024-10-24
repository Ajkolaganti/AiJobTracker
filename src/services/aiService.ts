// aiservice.ts

import axios from 'axios';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { Job, AIGeneratedContent } from '../types';



export const getAuthUrl = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/auth/google/url');
    return response.data.url;
  } catch (error) {
    console.error("Error fetching Google Auth URL:", error);
  }
};

// Fetch Job Description from URL
async function fetchJobDescription(jobPostingUrl: string): Promise<string> {
  try {
    const response = await axios.get(jobPostingUrl);
    // Extract job description from the page content
    // Note: You might need to adjust the extraction logic based on the actual structure of the job posting page
    const parser = new DOMParser();
    const doc = parser.parseFromString(response.data, 'text/html');
    const jobDescriptionElement = doc.querySelector('.job-description');
    const jobDescription = jobDescriptionElement ? jobDescriptionElement.textContent || '' : '';
    return jobDescription;
  } catch (error) {
    console.error('Error fetching job description:', error);
    return '';
  }
}

// Generate Resume and Cover Letter
export const generateResumeAndCoverLetter = async (
  jobTitle,
  company,
  jobPostingUrl,
  existingResume
) => {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/generate-resume-cover-letter',
      {
        jobTitle,
        company,
        jobPostingUrl,
        existingResume,
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
};

// Enhance Text using AI (for Professional Summary and Experience Descriptions)
export const enhanceText = async (text) => {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/enhance-text',
      { text }
    );

    return response.data.enhancedText;
  } catch (error) {
    console.error('Error enhancing text:', error);
    throw error;
  }
};

// Enhance Text using AI (for Professional Summary and Experience Descriptions)


export const getChatResponse = async (userMessage) => {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/get-chat-response',
      { userMessage }
    );

    return response.data.aiResponse;
  } catch (error) {
    console.error('Error getting chat response:', error);
    throw error;
  }
};

export const tailorResume = async (resumeContent, jobDescription) => {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/tailor-resume',
      {
        resumeContent,
        jobDescription,
      }
    );

    return response.data.tailoredResume;
  } catch (error) {
    console.error('Error tailoring resume:', error);
    throw error;
  }
};


// // Function to enhance jobs with AI insights
// async function enhanceJobsWithAI(jobs: Job[]): Promise<Job[]> {
//   const messages = [
//     { role: 'system', content: 'You are an AI assistant specialized in job search and career advice.' },
//     { 
//       role: 'user', 
//       content: `Analyze the following job applications and provide insights:
//       1. Categorize the status of each job into standard stages (Applied, Interview Scheduled, Offer Received, Rejected).
//       2. Provide 3 general insights or recommendations based on the overall job search progress.
      
//       Job Applications:
//       ${JSON.stringify(jobs)}
      
//       Provide the output in the following JSON format:
//       {
//         "categorizedJobs": [
//           {
//             "id": string,
//             "status": string
//           }
//         ],
//         "insights": [string, string, string]
//       }`
//     }
//   ];

//   const response = await axios.post(
//     API_URL,
//     {
//       model: 'gpt-4o',
//       messages: messages,
//       max_tokens: 500,
//       temperature: 0.5,
//     },
//     {
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${API_KEY}`,
//       },
//     }
//   );

//   const aiOutput = JSON.parse(response.data.choices[0].message.content);

//   // Update job statuses
//   const enhancedJobs = jobs.map(job => {
//     const categorizedJob = aiOutput.categorizedJobs.find(cj => cj.id === job.id);
//     return categorizedJob ? { ...job, status: categorizedJob.status } : job;
//   });

//   // You can store or return insights separately if needed
//   const insights = aiOutput.insights;

//   return enhancedJobs;
// }

// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_REDIRECT_URI
// );

// export const getAuthUrl = (): string => {
//   return oauth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: ['https://www.googleapis.com/auth/gmail.readonly']
//   });
// };

// export const getAccessToken = async (code: string): Promise<string> => {
//   const { tokens } = await oauth2Client.getToken(code);
//   oauth2Client.setCredentials(tokens);
//   return tokens.access_token as string;
// };

export const fetchJobsFromEmail = async (userId: string, accessToken: string): Promise<Job[]> => {
  try {
    console.log('Fetching jobs from email inside aiService.ts line 307...',accessToken);
    const response = await axios.post('http://localhost:3000/api/fetch-jobs-from-email', { userId, accessToken });
    return response.data.jobs;
  } catch (error) {
    console.error('Error in fetchJobsFromEmail:', error);
    throw error;
  }
};

// Helper function to extract job info using AI
async function extractJobInfo(emailContent: string) {
  const messages = [
    { role: 'system', content: 'You are an AI assistant specialized in analyzing job application emails.' },
    { 
      role: 'user', 
      content: `Analyze the following email content and extract job application information if present. 
      If it's not a job application email, indicate that it's not.
      
      Email content:
      ${emailContent}
      
      Provide the output in the following JSON format:
      {
        "isJobApplication": boolean,
        "company": string,
        "position": string,
        "date": string,
        "status": string
      }`
    }
  ];

  const response = await axios.post(
    API_URL,
    {
      model: 'gpt-4o',
      messages: messages,
      max_tokens: 200,
      temperature: 0.3,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  );

  return JSON.parse(response.data.choices[0].message.content);
}

export const aiService = {
  getAuthUrl,
  fetchJobsFromEmail,
  generateResumeAndCoverLetter,
  enhanceText,
  getChatResponse,
  tailorResume
};