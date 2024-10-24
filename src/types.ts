export interface Job {
  id: string;
  company: string;
  position: string;
  date_applied: string;
  status: 'Applied' | 'Interview Scheduled' | 'Offer Received' | 'Rejected';
  jobPostingUrl: string;
  contactPerson: string;
  setReminder?: Date;
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

interface AudioWorkletProcessor {
  readonly port: MessagePort;
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>
  ): boolean;
}

declare var AudioWorkletProcessor: {
  prototype: AudioWorkletProcessor;
  new(): AudioWorkletProcessor;
};

declare function registerProcessor(
  name: string,
  processorCtor: new () => AudioWorkletProcessor
): void;

registerProcessor('audio-processor', AudioWorkletProcessor);
