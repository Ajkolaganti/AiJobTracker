// aiservice.ts

import axios from 'axios';
import { AIGeneratedContent } from '../types';

const API_KEY = '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';
const API_URL = 'https://api.openai.com/v1/chat/completions';

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
  jobTitle: string,
  company: string,
  jobPostingUrl: string,
  existingResume?: string
): Promise<AIGeneratedContent> => {
  try {
    const jobDescription = await fetchJobDescription(jobPostingUrl);

    const messages = [
      { role: 'system', content: 'You are an expert resume writer and career coach.' },
      {
        role: 'user',
        content: `Create a tailored resume for a ${jobTitle} position at ${company}.
        Job Description: ${jobDescription}
        ${existingResume ? `Existing Resume: ${existingResume}` : 'Please create a new resume from scratch.'}

        Please format the resume in Markdown.`,
      },
      {
        role: 'user',
        content: `Now, create a cover letter for the same position.
        Address it to the hiring manager at ${company}.

        Please format the cover letter in Markdown.`,
      },
    ];

    const response = await axios.post(
      API_URL,
      {
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 2000,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    const generatedContent = response.data.choices[0].message.content;
    const [resume, coverLetter] = generatedContent.split('Now, create a cover letter for the same position.');

    return {
      resume: resume.trim(),
      coverLetter: coverLetter.trim(),
    };
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
};

// Enhance Text using AI (for Professional Summary and Experience Descriptions)
export const enhanceText = async (text: string): Promise<string> => {
  try {
    const messages = [
      {
        role: 'system',
        content:
          'You are a professional resume writer specializing in enhancing resumes. Provide only the enhanced text without any introductory or concluding remarks, instructions, or formatting. Do not include any markdown or additional comments.',
      },
      {
        role: 'user',
        content: `Please enhance the following text to make it more impactful and professional, ensuring it appears to be written by a human:

"${text}"`,
      },
    ];

    const response = await axios.post(
      API_URL,
      {
        model: 'gpt-4o', // Corrected model name
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    const rawContent = response.data.choices[0].message.content.trim();

    // Option 1: If the response is clean and contains only the enhanced text
    // return rawContent;

    // Option 2: If the response might contain delimiters or additional text,
    // extract the content between '---' or other markers.

    // Example extraction between '---'
    const delimiter = '---';
    const parts = rawContent.split(delimiter);

    if (parts.length >= 3) {
      // Enhanced text is between the first and second '---'
      const enhancedText = parts[1].trim();
      return enhancedText;
    }

    // If no delimiters are found, return the raw content
    return rawContent;
  } catch (error) {
    console.error('Error enhancing text:', error);
    throw error;
  }
};

export const getChatResponse = async (userMessage: string): Promise<string> => {
  try {
    const messages = [
      { role: 'system', content: 'You are an AI assistant specialized in job search and interview preparation. Provide helpful, concise advice to users.' },
      { role: 'user', content: userMessage },
    ];

    const response = await axios.post(
      API_URL,
      {
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    const aiResponse = response.data.choices[0].message.content.trim();
    return aiResponse;
  } catch (error) {
    console.error('Error getting chat response:', error);
    throw error;
  }
};

export const tailorResume = async (resumeContent: string, jobDescription: string): Promise<string> => {
  try {
    const messages = [
      {
        role: 'system',
        content: 'You are an AI assistant specializing in tailoring resumes to specific job descriptions. Your task is to analyze the given resume and job description, then provide an updated version of the resume that better matches the job requirements. Focus on enhancing the responsibilities and experiences to align with the job description. Maintain the original structure and formatting of the resume.',
      },
      {
        role: 'user',
        content: `Please tailor the following resume to better match the provided job description. Focus on updating the responsibilities and experiences, ensuring it appears to be written by a human:

Resume:
${resumeContent}

Job Description:
${jobDescription}`,
      },
    ];

    const response = await axios.post(
      API_URL,
      {
        model: 'gpt-4o', // Make sure to use the correct model name
        messages: messages,
        max_tokens: 2000, // Adjust as needed
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    const tailoredResume = response.data.choices[0].message.content.trim();
    return tailoredResume;
  } catch (error) {
    console.error('Error tailoring resume:', error);
    throw error;
  }
};