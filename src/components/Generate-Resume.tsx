import React, { useState, useRef, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { PlusCircle, Trash2, Upload, User, Briefcase, GraduationCap, Award, Globe, BookOpen, Megaphone, Download, FileText, Loader2 } from 'lucide-react';

import { saveAs } from 'file-saver';
import mammoth from 'mammoth';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist';
import { Transition } from '@headlessui/react';
import { enhanceText, tailorResume } from '../services/aiService';
import { supabase } from './auth/supabaseClient';
import { useAuth } from '../AuthContext';
import { useToast } from "../hooks/use-toast";
import EmploymentDetails from './EmploymentDetailsProps';  // Import the new component
import { Document, Paragraph, Packer, TextRun, HeadingLevel, AlignmentType, UnderlineType, convertInchesToTwip } from 'docx';




interface Section {
  id: string;
  title: string;
  content: string;
}

interface Experience {
  id: string;
  jobTitle: string;
  employer: string;
  startDate: string;
  endDate: string;
  city: string;
  description: string;
  isEnhancing?: boolean;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
  city: string;
  description: string;
}

interface ParsedResume {
  personalDetails: {
    name: string;
    email: string;
    phone: string;
    jobTitle: string;
    location: string;
  };
  summary: string;
  skills: string[];
  experiences: Experience[];
  educations: Education[];
  additionalSections: Section[];
}

export default function GenerateResumePage() {
  const [personalDetails, setPersonalDetails] = useState({
    jobTitle: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    photo: null as File | null,
  });
  const [summary, setSummary] = useState('');
  const [isEnhancingSummary, setIsEnhancingSummary] = useState(false);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [uploadedResume, setUploadedResume] = useState<File | null>(null);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [resumeContent, setResumeContent] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [tailoredResume, setTailoredResume] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('upload');
  const { user } = useAuth();
  const { toast } = useToast();
  const [aiGeneratedResumes, setAiGeneratedResumes] = useState<any[]>([]);


  const generateResumeFromScratch = async () => {
    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: 'Normal',
            name: 'Normal',
            run: {
              font: 'Calibri',
              size: 22,
              color: '000000',
            },
            paragraph: {
              spacing: { after: 120 },
            },
          },
          {
            id: 'Heading1',
            name: 'Heading 1',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: {
              size: 28,
              bold: true,
              color: '2E74B5',
            },
            paragraph: {
              spacing: { before: 240, after: 120 },
            },
          },
        ],
      },
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `${personalDetails.firstName} ${personalDetails.lastName}`,
                bold: true,
                size: 36,
                font: 'Calibri',
                color: '2E74B5',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
          }),
          new Paragraph({
            text: `${personalDetails.email} | ${personalDetails.phone} | ${personalDetails.city}, ${personalDetails.country}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: 'Professional Summary',
            style: 'Heading1',
          }),
          new Paragraph({
            text: summary,
            style: 'Normal',
          }),
          new Paragraph({
            text: 'Experience',
            style: 'Heading1',
          }),
          ...experiences.flatMap(exp => [
            new Paragraph({
              children: [
                new TextRun({ text: exp.jobTitle, bold: true }),
                new TextRun(` at ${exp.employer}`),
                new TextRun(` | ${exp.startDate} - ${exp.endDate}`),
              ],
              spacing: { after: 60 },
            }),
            new Paragraph({
              text: exp.description,
              style: 'Normal',
            }),
          ]),
          new Paragraph({
            text: 'Education',
            style: 'Heading1',
          }),
          ...educations.flatMap(edu => [
            new Paragraph({
              children: [
                new TextRun({ text: edu.degree, bold: true }),
                new TextRun(` at ${edu.school}`),
                new TextRun(` | ${edu.startDate} - ${edu.endDate}`),
              ],
              spacing: { after: 60 },
            }),
            new Paragraph({
              text: edu.description,
              style: 'Normal',
            }),
          ]),
          ...sections.flatMap(section => [
            new Paragraph({
              text: section.title,
              style: 'Heading1',
            }),
            new Paragraph({
              text: section.content,
              style: 'Normal',
            }),
          ]),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${personalDetails.firstName}_${personalDetails.lastName}_Resume.docx`);
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    setUploadProgress(0);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Invalid file type. Please upload a PDF, DOCX, or TXT file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size exceeds 5MB. Please upload a smaller file.');
        return;
      }

      setUploadedResume(file);

      let content: string;

      if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        content = result.value;
      } else if (file.name.endsWith('.pdf')) {
        content = await extractTextFromPdf(file);
      } else {
        content = await readFileAsText(file);
      }

      setResumeContent(content);
      parseAndUpdateResume(content);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return text;
  };

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value);
  };

  useEffect(() => {
    if (user) {
      fetchAiGeneratedResumes();
    }
  }, [user]);

//   const tailorResume = async () => {
//     if (!resumeContent || !jobDescription) {
//       alert('Please upload a resume and provide a job description.');
//       return;
//     }
//     setIsLoading(true);
//     try {
//       const response = await axios.post(
//         '/api/tailor-resume',
//         {
//           resumeContent,
//           jobDescription,
//         }
//       );

//       setTailoredResume(response.data.tailoredResume);
      
//       // Save the AI-generated resume
//       await saveAiGeneratedResume(response.data.tailoredResume);
//     } catch (error) {
//       console.error('Error tailoring resume:', error);
//       toast({
//         title: "Error",
//         description: "An error occurred while tailoring the resume. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

const handleTailorResume = async () => {
    if (!resumeContent || !jobDescription) {
      toast({
        title: "Error",
        description: "Please upload a resume and provide a job description.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const tailoredContent = await tailorResume(resumeContent, jobDescription);
      setTailoredResume(tailoredContent);
      
      // Save the AI-generated resume
      await saveAiGeneratedResume(tailoredContent);

      toast({
        title: "Success",
        description: "Your resume has been tailored successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error tailoring resume:', error);
      toast({
        title: "Error",
        description: "An error occurred while tailoring the resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateDocx = () => {
    const cleanedResume = tailoredResume.replace(/\*/g, '').trim();
  
    // Split the resume into sections based on headers
    const sections = cleanedResume.split(/(?=##\s)/g).map((section) => section.trim());
  
    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: 'Normal',
            name: 'Normal',
            run: {
              font: 'Calibri',
              size: 22, // 11pt font size
              color: '000000',
            },
            paragraph: {
              spacing: { after: 120 },
            },
          },
          {
            id: 'Heading1',
            name: 'Heading 1',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: {
              size: 32, // 16pt font size
              bold: true,
              color: '2E74B5',
            },
            paragraph: {
              spacing: { before: 240, after: 120 },
            },
          },
          {
            id: 'Heading2',
            name: 'Heading 2',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: {
              size: 26, // 13pt font size
              bold: true,
              color: '2E74B5',
            },
            paragraph: {
              spacing: { before: 200, after: 100 },
            },
          },
        ],
      },
      sections: [
        {
          properties: {},
          children: sections.flatMap((section, index) => {
            const lines = section.split('\n').filter((line) => line.trim() !== '');
  
            // Header parsing
            const headerMatch = lines[0].match(/^##\s*(.*)/);
            const headerText = headerMatch ? headerMatch[1].trim() : '';
            const contentLines = headerMatch ? lines.slice(1) : lines;
  
            // Special handling for the contact info section
            if (index === 0 && headerText.toLowerCase().includes('contact')) {
              const nameLine = contentLines.shift();
              const nameParagraph = new Paragraph({
                children: [
                  new TextRun({
                    text: nameLine,
                    bold: true,
                    size: 48, // 24pt font size
                    font: 'Calibri',
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 120 },
              });
  
              const contactInfoParagraph = new Paragraph({
                text: contentLines.join(' | '),
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
              });
  
              return [nameParagraph, contactInfoParagraph];
            }
  
            // Section headers
            const sectionHeader = new Paragraph({
              text: headerText.toUpperCase(),
              heading: HeadingLevel.HEADING_1,
              thematicBreak: true,
              spacing: { before: 240, after: 120 },
            });
  
            // Content parsing
            const contentParagraphs = [];
  
            for (let i = 0; i < contentLines.length; i++) {
              let line = contentLines[i];
  
              // Experience Section Formatting
              if (headerText.toLowerCase() === 'experience' && line.includes(' at ')) {
                // Parse job title and company
                const [position, companyPart] = line.split(' at ');
                let [company, dates] = companyPart.split(', ');
                dates = dates || '';
  
                const positionParagraph = new Paragraph({
                  children: [
                    new TextRun({
                      text: position.trim(),
                      bold: true,
                      size: 24, // 12pt font size
                    }),
                    new TextRun({
                      text: ` at ${company.trim()}`,
                      italics: true,
                      size: 22, // 11pt font size
                    }),
                    new TextRun({
                      text: dates ? `, ${dates.trim()}` : '',
                      size: 22, // 11pt font size
                    }),
                  ],
                  spacing: { before: 200, after: 100 },
                });
  
                contentParagraphs.push(positionParagraph);
  
                // Add bullet points for responsibilities
                i++; // Move to the next line
                while (i < contentLines.length && contentLines[i].startsWith('- ')) {
                  contentParagraphs.push(
                    new Paragraph({
                      text: contentLines[i].replace(/^- /, '').trim(),
                      bullet: { level: 0 },
                      spacing: { before: 60, after: 60 },
                    })
                  );
                  i++;
                }
                i--; // Adjust the index since the outer loop will increment it
              } else if (line.startsWith('- ')) {
                // Bullet points for other sections
                contentParagraphs.push(
                  new Paragraph({
                    text: line.replace(/^- /, '').trim(),
                    bullet: { level: 0 },
                    spacing: { before: 60, after: 60 },
                  })
                );
              } else {
                // Regular paragraph
                contentParagraphs.push(
                  new Paragraph({
                    text: line.trim(),
                    spacing: { before: 100, after: 100 },
                  })
                );
              }
            }
  
            return [sectionHeader, ...contentParagraphs];
          }),
        },
      ],
    });
  
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, 'tailored_resume.docx');
    });
  };

  const generatePdf = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(tailoredResume, 180);
    doc.text(splitText, 15, 15);
    doc.save('tailored_resume.pdf');
  };

  const downloadTailoredResume = () => {
    const blob = new Blob([tailoredResume], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'tailored_resume.txt');
  };

  const parseAndUpdateResume = (content: string) => {
    const parsed = parseResume(content);
    setParsedResume(parsed);

    setPersonalDetails({
      ...personalDetails,
      jobTitle: parsed.personalDetails.jobTitle,
      firstName: parsed.personalDetails.name.split(' ')[0],
      lastName: parsed.personalDetails.name.split(' ').slice(1).join(' '),
      email: parsed.personalDetails.email,
      phone: parsed.personalDetails.phone,
      city: parsed.personalDetails.location.split(',')[0].trim(),
      country: parsed.personalDetails.location.split(',')[1]?.trim() || '',
    });
    setSummary(parsed.summary);
    setExperiences(parsed.experiences);
    setEducations(parsed.educations);
    setSections(parsed.additionalSections.map(section => ({
      id: Date.now().toString(),
      title: section.title,
      content: section.content,
    })));
  };

  const parseResume = (content: string): ParsedResume => {
    const sections = splitIntoSections(content);

    const parsed: ParsedResume = {
      personalDetails: { name: '', email: '', phone: '', jobTitle: '', location: '' },
      summary: '',
      skills: [],
      experiences: [],
      educations: [],
      additionalSections: [],
    };

    const personalDetailsSection = sections.find(s => s.title.toLowerCase().includes('personal') || !s.title);
    if (personalDetailsSection) {
      const lines = personalDetailsSection.content.split('\n');
      parsed.personalDetails.name = lines[0].trim();
      parsed.personalDetails.jobTitle = lines[1]?.trim() || '';

      const emailMatch = personalDetailsSection.content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
      if (emailMatch) parsed.personalDetails.email = emailMatch[0];

      const phoneMatch = personalDetailsSection.content.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/);
      if (phoneMatch) parsed.personalDetails.phone = phoneMatch[0];

      const locationMatch = personalDetailsSection.content.match(/([A-Za-z\s]+),\s*([A-Za-z\s]+)/);
      if (locationMatch) parsed.personalDetails.location = locationMatch[0];
    }

    const summarySection = sections.find(s => s.title.toLowerCase().includes('summary') || s.title.toLowerCase().includes('objective'));
    if (summarySection) {
      parsed.summary = summarySection.content.trim();
    }

    const skillsSection = sections.find(s => s.title.toLowerCase().includes('skills') || s.title.toLowerCase().includes('technologies'));
    if (skillsSection) {
      parsed.skills = extractSkills(skillsSection.content);
    }

    const experienceSection = sections.find(s => s.title.toLowerCase().includes('experience') || s.title.toLowerCase().includes('employment'));
    if (experienceSection) {
      parsed.experiences = extractExperiences(experienceSection.content);
    }

    const educationSection = sections.find(s => s.title.toLowerCase().includes('education'));
    if (educationSection) {
      parsed.educations = extractEducation(educationSection.content);
    }

    parsed.additionalSections = sections.filter(s =>
      !['personal', 'summary', 'objective', 'skills', 'technologies', 'experience', 'employment', 'education']
        .some(keyword => s.title.toLowerCase().includes(keyword))
    );

    return parsed;
  };

  const splitIntoSections = (content: string): Section[] => {
    const sectionRegex = /^([A-Z][A-Z\s]+):?$/gm;
    const sections: Section[] = [];
    let lastIndex = 0;
    let match;

    while ((match = sectionRegex.exec(content)) !== null) {
      if (lastIndex > 0) {
        sections.push({
          id: Date.now().toString(),
          title: content.slice(lastIndex, match.index).trim().split('\n')[0],
          content: content.slice(lastIndex, match.index).trim().split('\n').slice(1).join('\n')
        });
      }
      lastIndex = match.index;
    }

    sections.push({
      id: Date.now().toString(),
      title: content.slice(lastIndex).trim().split('\n')[0],
      content: content.slice(lastIndex).trim().split('\n').slice(1).join('\n')
    });

    return sections;
  };

  const extractSkills = (content: string): string[] => {
    const skillTokens = content.toLowerCase().match(/\b\w+\b/g) || [];
    const commonSkills = ['java', 'python', 'javascript', 'react', 'angular', 'node.js', 'sql', 'mongodb', 'aws', 'docker', 'kubernetes', 'git'];
    return Array.from(new Set(skillTokens.filter(token => commonSkills.includes(token))));
  };

  const extractExperiences = (content: string): Experience[] => {
    const experiences: Experience[] = [];
    const experienceBlocks = content.split(/(?=[A-Z][a-z]+ \d{4} - )/);

    for (const block of experienceBlocks) {
      const lines = block.split('\n').filter(line => line.trim() !== '');
      if (lines.length >= 3) {
        const dateRange = lines[0].match(/(\w+ \d{4}) - (\w+ \d{4}|\w+)/);
        experiences.push({
          id: Date.now().toString(),
          jobTitle: lines[1].trim(),
          employer: lines[0].replace(dateRange?.[0] || '', '').trim(),
          startDate: dateRange?.[1] || '',
          endDate: dateRange?.[2] || '',
          city: '',
          description: lines.slice(2).join('\n').trim(),
        });
      }
    }

    return experiences;
  };

  const extractEducation = (content: string): Education[] => {
    const educations: Education[] = [];
    const educationBlocks = content.split(/(?=[A-Z][a-z]+ \d{4} - )/);

    for (const block of educationBlocks) {
      const lines = block.split('\n').filter(line => line.trim() !== '');
      if (lines.length >= 2) {
        const dateRange = lines[0].match(/(\w+ \d{4}) - (\w+ \d{4}|\w+)/);
        educations.push({
          id: Date.now().toString(),
          school: lines[0].replace(dateRange?.[0] || '', '').trim(),
          degree: lines[1].trim(),
          startDate: dateRange?.[1] || '',
          endDate: dateRange?.[2] || '',
          city: '',
          description: lines.slice(2).join('\n').trim(),
        });
      }
    }

    return educations;
  };

  const handlePersonalDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalDetails({ ...personalDetails, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPersonalDetails({ ...personalDetails, photo: e.target.files[0] });
    }
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSummary(e.target.value);
  };

  const addExperience = () => {
    setExperiences([...experiences, {
      id: Date.now().toString(),
      jobTitle: '',
      employer: '',
      startDate: '',
      endDate: '',
      location: '',
      projectDescription: '',
      responsibilities: '',
    }]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setExperiences(experiences.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const deleteExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  const addEducation = () => {
    setEducations([...educations, {
      id: Date.now().toString(),
      school: '',
      degree: '',
      startDate: '',
      endDate: '',
      city: '',
      description: '',
    }]);
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducations(educations.map(edu =>
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const deleteEducation = (id: string) => {
    setEducations(educations.filter(edu => edu.id !== id));
  };

  const addSection = (title: string) => {
    setSections([...sections, {
      id: Date.now().toString(),
      title,
      content: '',
    }]);
  };

  const updateSection = (id: string, field: keyof Section, value: string) => {
    setSections(sections.map(section =>
      section.id === id ? { ...section, [field]: value } : section
    ));
  };

  const deleteSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id));
  };

  const enhanceExperienceDescription = async (expId: string) => {
    setExperiences((prevExperiences) =>
      prevExperiences.map((exp) => (exp.id === expId ? { ...exp, isEnhancing: true } : exp))
    );
  
    const experience = experiences.find((exp) => exp.id === expId);
    if (experience) {
      try {
        const enhancedDescription = await enhanceText(experience.description);
  
        setExperiences((prevExperiences) =>
          prevExperiences.map((exp) =>
            exp.id === expId ? { ...exp, description: enhancedDescription, isEnhancing: false } : exp
          )
        );
      } catch (error) {
        console.error('Error enhancing description:', error);
        setExperiences((prevExperiences) =>
          prevExperiences.map((exp) => (exp.id === expId ? { ...exp, isEnhancing: false } : exp))
        );
        alert('An error occurred while enhancing the description. Please try again.');
      }
    }
  };
  
  const enhanceProfessionalSummary = async () => {
    setIsEnhancingSummary(true);
    try {
      const enhancedSummary = await enhanceText(summary);
      setSummary(enhancedSummary);
    } catch (error) {
      console.error('Error enhancing summary:', error);
      alert('An error occurred while enhancing the summary. Please try again.');
    } finally {
      setIsEnhancingSummary(false);
    }
  };

  const saveAiGeneratedResume = async (resumeContent: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save a resume.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('ai_generated_resumes')
        .insert([
          { 
            user_id: user.uid, 
            resume_content: resumeContent,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "AI-generated resume saved successfully.",
        variant: "default",
      });

      // Refresh the list of AI-generated resumes
      fetchAiGeneratedResumes();
    } catch (error) {
      console.error('Error saving AI-generated resume:', error);
      toast({
        title: "Error",
        description: "Failed to save AI-generated resume.",
        variant: "destructive",
      });
    }
  };

  const fetchAiGeneratedResumes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ai_generated_resumes')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAiGeneratedResumes(data || []);
    } catch (error) {
      console.error('Error fetching AI-generated resumes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch AI-generated resumes.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-500  from-gray-800 to-gray-800">Generate Your Resume</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-50 flex justify-center mb-10 bg-gradient-to-br from-gray-800 to-white text-gray-800 rounded-3xl">
          <TabsTrigger value="scratch" className="mx-2 text-font-bold text-xl-black bg-gradient-to-500 bg-gradient-to-br from-gray-200 to-blue-800 rounded-xl">Start from Scratch</TabsTrigger>
          <TabsTrigger value="upload" className="mx-2 text-font-bold text-xl-black bg-gradient-to-500 bg-gradient-to-br from-gray-200 to-blue-800 rounded-xl">Upload Existing Resume</TabsTrigger>
        </TabsList>
        <TabsContent value="scratch">
         {/* Personal Details */}
         <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-6 w-6 text-blue-400" />
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    name="jobTitle"
                    placeholder="Desired Job Title"
                    value={personalDetails.jobTitle}
                    onChange={handlePersonalDetailsChange}
                    className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photo">Photo</Label>
                  <Input
                    id="photo"
                    type="file"
                    onChange={handlePhotoUpload}
                    className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={personalDetails.firstName}
                    onChange={handlePersonalDetailsChange}
                    className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={personalDetails.lastName}
                    onChange={handlePersonalDetailsChange}
                    className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={personalDetails.email}
                    onChange={handlePersonalDetailsChange}
                    className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={personalDetails.phone}
                    onChange={handlePersonalDetailsChange}
                    className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={personalDetails.country}
                    onChange={handlePersonalDetailsChange}
                    className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={personalDetails.city}
                    onChange={handlePersonalDetailsChange}
                    className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Professional Summary */}
          <Card className="mt-6 bg-gradient-to-br from-gray-800 to-gray-900 text-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-6 w-6 text-blue-400" />
                Professional Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Textarea
                  placeholder="Write a brief summary about your professional experience..."
                  value={summary}
                  onChange={handleSummaryChange}
                  rows={4}
                  className={`bg-gray-800 text-white border border-gray-700 focus:border-blue-500 ${isEnhancingSummary ? 'opacity-50' : ''}`}
                  disabled={isEnhancingSummary}
                />
                {isEnhancingSummary && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                  </div>
                )}
              </div>
              <div className="mt-4">
                <Button onClick={enhanceProfessionalSummary} disabled={isEnhancingSummary} className="bg-gradient-to-500 bg-gradient-to-br from-gray-800 to-blue-800 rounded-xl hover:bg-blue-600">
                  {isEnhancingSummary ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enhancing...
                    </>
                  ) : (
                    'Enhance with AI'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Employment History */}
        <Card className="mt-6 bg-gradient-to-br from-gray-800 to-gray-900 text-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="mr-2 h-6 w-6 text-blue-400" />
              Employment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {experiences.map((exp) => (
              <EmploymentDetails
                key={exp.id}
                experience={exp}
                updateExperience={updateExperience}
                deleteExperience={deleteExperience}
              />
            ))}
            <Button onClick={addExperience} variant="outline" className="w-full bg-gray-700 text-white hover:bg-gray-600">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Employment
            </Button>
          </CardContent>
        </Card>

          {/* Include other sections like Education, Additional Sections, etc. */}

          <div className="mt-6 flex justify-center">
            <Button
              onClick={generateResumeFromScratch}
              className="w-1/2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-teal-500 hover:to-green-500 text-white font-bold py-2 px-4 rounded-full flex items-center justify-center"
            >
              <Download className="mr-2 h-5 w-5" />
              Generate Resume
            </Button>
          </div>
        </TabsContent>

        {/* Upload Existing Resume tab */}
        <TabsContent value="upload">
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-6 w-6 text-blue-400" />
                Upload Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="flex items-center justify-center w-full h-64 border-4 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors duration-300"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleResumeUpload({ target: { files: e.dataTransfer.files } } as any);
                }}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-4 text-blue-500 animate-bounce" />
                  <p className="mb-2 text-lg"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-sm text-gray-400">PDF, DOCX, or TXT (MAX. 5MB)</p>
                </div>
                <Input
                  id="resume-upload"
                  type="file"
                  className="hidden"
                  onChange={handleResumeUpload}
                  accept=".pdf,.docx,.txt"
                  ref={fileInputRef}
                />
              </div>
              {uploadError && (
                <p className="text-sm text-red-500 mt-2">{uploadError}</p>
              )}
              {uploadedResume && (
                <p className="text-sm text-gray-300 mt-2">Uploaded: {uploadedResume.name}</p>
              )}
              {resumeContent && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">Resume Preview:</h3>
                  <pre className="whitespace-pre-wrap bg-gray-800 p-4 rounded-md max-h-64 overflow-y-auto">{resumeContent}</pre>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6 bg-gradient-to-br from-gray-800 to-gray-900 text-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="mr-2 h-6 w-6 text-blue-400" />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={handleJobDescriptionChange}
                rows={10}
                className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
              />
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleTailorResume}
              disabled={!uploadedResume || !jobDescription || isLoading}
              className="w-1/2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-2 px-4 rounded-full flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Tailoring Resume...
                </>
              ) : (
                'Tailor Resume'
              )}
            </Button>
          </div>

          {tailoredResume && (
            <Transition
              show={!!tailoredResume}
              enter="transition-opacity duration-500"
              enterFrom="opacity-0"
              enterTo="opacity-100"
            >
              <Card className="mt-6 bg-gradient-to-br from-gray-800 to-gray-900 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-6 w-6 text-blue-400" />
                    Tailored Resume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap bg-gray-800 p-4 rounded-md max-h-96 overflow-y-auto">{tailoredResume}</pre>
                  <div className="flex gap-4 mt-4">
                    <Button onClick={generateDocx} className="bg-blue-500 hover:bg-blue-600">
                      <Download className="mr-2 h-4 w-4" /> Download as DOCX
                    </Button>
                    <Button onClick={generatePdf} className="bg-red-500 hover:bg-red-600">
                      <Download className="mr-2 h-4 w-4" /> Download as PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Transition>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}