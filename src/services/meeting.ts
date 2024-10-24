// services/meeting.ts
import { supabase } from '../components/auth/supabaseClient';
import { Meeting, TranscriptEntry, AIResponse } from '../types/meeting';

export class MeetingService {
  private static instance: MeetingService;
  private socket: WebSocket | null = null;
  private messageQueue: any[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private constructor() {}

  static getInstance(): MeetingService {
    if (!MeetingService.instance) {
      MeetingService.instance = new MeetingService();
    }
    return MeetingService.instance;
  }

  async initializeWebSocket(accessToken: string): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}?token=${accessToken}`);

      ws.onopen = () => {
        this.socket = ws;
        this.reconnectAttempts = 0;
        
        // Send any queued messages
        while (this.messageQueue.length > 0) {
          const data = this.messageQueue.shift();
          this.socket?.send(data);
        }
        
        resolve(ws);
      };

      ws.onerror = (error) => {
        reject(error);
      };

      ws.onclose = () => {
        this.socket = null;
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => {
            this.initializeWebSocket(accessToken);
          }, 1000 * Math.pow(2, this.reconnectAttempts));
        }
      };
    });
  }

  async startMeeting(userId: string, meetingType: 'phone' | 'video'): Promise<string> {
    const { data, error } = await supabase
      .from('meeting_transcripts')
      .insert({
        user_id: userId,
        meeting_type: meetingType,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  async endMeeting(meetingId: string): Promise<void> {
    const { error } = await supabase
      .from('meeting_transcripts')
      .update({
        ended_at: new Date().toISOString(),
      })
      .eq('id', meetingId);

    if (error) throw error;
  }

  async saveTranscript(meetingId: string, transcript: TranscriptEntry): Promise<void> {
    const { error } = await supabase
      .from('meeting_transcripts')
      .update({
        transcript: supabase.sql`array_append(transcript, ${transcript})`,
      })
      .eq('id', meetingId);

    if (error) throw error;
  }

  async saveAIResponse(meetingId: string, response: AIResponse): Promise<void> {
    const { error } = await supabase
      .from('meeting_transcripts')
      .update({
        ai_responses: supabase.sql`array_append(ai_responses, ${response})`,
      })
      .eq('id', meetingId);

    if (error) throw error;
  }

  async generateMeetingSummary(meetingId: string): Promise<string> {
    const { data, error } = await supabase
      .rpc('generate_meeting_summary', {
        meeting_id: meetingId,
      });

    if (error) throw error;
    return data.summary;
  }

  sendAudio(audioData: Blob): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(audioData);
    } else {
      this.messageQueue.push(audioData);
    }
  }

  async getMeetingHistory(userId: string, limit = 10): Promise<Meeting[]> {
    const { data, error } = await supabase
      .from('meeting_transcripts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async getMeetingDetails(meetingId: string): Promise<Meeting> {
    const { data, error } = await supabase
      .from('meeting_transcripts')
      .select('*')
      .eq('id', meetingId)
      .single();

    if (error) throw error;
    return data;
  }
}

export const meetingService = MeetingService.getInstance();