export interface TranscriptEntry {
    id: string;
    text: string;
    timestamp: string;
    speaker: string;
    confidence: number;
  }
  
  export interface AIResponse {
    id: string;
    question: string;
    response: string;
    timestamp: string;
    context?: string;
  }
  
  export interface Meeting {
    id: string;
    userId: string;
    meetingType: 'phone' | 'video';
    startTime: string;
    endTime?: string;
    transcript: TranscriptEntry[];
    aiResponses: AIResponse[];
    summary?: string;
    actionItems?: string[];
  }

  export type CallType = 'phone' | 'video';

export interface RouteParams {
  callType?: string;
}