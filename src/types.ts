export interface Job {
  id: string;
  company: string;
  position: string;
  date_applied: string;
  status: 'Applied' | 'Interview Scheduled' | 'Offer Received' | 'Rejected';
  jobPostingUrl: string;
  contactPerson: string;
  reminder?: Date;
}

export interface AIGeneratedContent {
  resume: string;
  coverLetter: string;
}

export interface UserProfile {
  existingResume?: string;
  name?:string;
  email?:string;
  phone?:string;

}
