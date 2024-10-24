import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, MessageSquare, Share2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../AuthContext';
import { wsService } from '../services/webSocketService';
import { cacheService } from '../services/cacheService';
import { AudioRecorder } from '../components/audioRecorder/AudioRecorder';
import { DeepgramService } from '../services/deepGramService';
import { getConfig } from '../config/env.config';


interface DeepgramState {
    service: DeepgramService | null;
  }


interface TranscriptEntry {
  id: string;
  text: string[];
  timestamp: string;
  speaker: 'interviewer' | 'candidate';
}

interface StreamingResponse {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
  isStreaming: boolean;
}

interface AIResponse {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
  fromCache?: boolean;
  response?: string;
}

interface VideoCallState {
  isSharing: boolean;
  displayStream: MediaStream | null;
  micStream: MediaStream | null;
  audioContext: AudioContext | null;
}

interface AudioProcessingState {
  workletNode: AudioWorkletNode | null;
  streamMerger: MediaStreamAudioDestinationNode | null;
}

interface ImportMetaEnv {
    readonly VITE_DEEPGRAM_API_KEY: string
    // Add other env variables here
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }


declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const InterviewCopilot = () => {
  const { callType = 'phone' } = useParams<{ callType?: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [deepgramState, setDeepgramState] = useState<DeepgramState>({
    service: null
  });

  const [isRecording, setIsRecording] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<'interviewer' | 'candidate'>('interviewer');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showContextDialog, setShowContextDialog] = useState(false);
  const [meetingContext, setMeetingContext] = useState('');
  const [contextCollected, setContextCollected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [combinedTranscript, setCombinedTranscript] = useState<TranscriptEntry[]>([]);
  const [aiResponses, setAiResponses] = useState<AIResponse[]>([]);
  const [streamingResponse, setStreamingResponse] = useState<StreamingResponse | null>(null);
  const [audioRecorder, setAudioRecorder] = useState<AudioRecorder | null>(null);
  const [videoCallState, setVideoCallState] = useState<VideoCallState>({
    isSharing: false,
    displayStream: null,
    micStream: null,
    audioContext: null
  });
  const [audioProcessingState, setAudioProcessingState] = useState<AudioProcessingState>({
    workletNode: null,
    streamMerger: null
  });

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const currentSpeechRef = useRef<string[]>([]);
  const lastProcessedTextRef = useRef<string>('');

  useEffect(() => {
    if (!isValidCallType(callType)) {
      navigate('/copilot/phone');
    }
  }, [callType, navigate]);

  useEffect(() => {
    wsService.addMessageHandler('analysis_stream', handleAnalysisStream);
    wsService.addMessageHandler('analysis_response', handleAnalysisResponse);
    wsService.addMessageHandler('error', handleError);

    return () => {
      wsService.removeMessageHandler('analysis_stream');
      wsService.removeMessageHandler('analysis_response');
      wsService.removeMessageHandler('error');
    };
  }, []);

  const isValidCallType = (type: string): type is 'phone' | 'video' => {
    return type === 'phone' || type === 'video';
  };

  const handleError = useCallback((error: any) => {
    console.error('WebSocket error:', error);
    toast({
      title: "WebSocket Error",
      description: "An error occurred with the real-time connection.",
      variant: "destructive",
    });
  }, [toast]);

  const handleAnalysisStream = useCallback((data: any) => {
    if (data.isDone) {
      setStreamingResponse(null);
      return;
    }
    
    setStreamingResponse(prev => {
      if (!prev) return {
        id: Date.now().toString(),
        question: "Real-time Analysis",
        answer: data.content,
        timestamp: new Date().toISOString(),
        isStreaming: true
      };
      
      return {
        ...prev,
        answer: prev.answer + data.content
      };
    });
  }, []);

  const handleAnalysisResponse = useCallback((data: any) => {
    setAiResponses(prev => [{
      id: Date.now().toString(),
      question: "Analysis",
      answer: data.content,
      timestamp: new Date().toISOString()
    }, ...prev]);
  }, []);

  const updateCombinedTranscript = useCallback((text: string, isFinal: boolean) => {
    if (isFinal) {
      setCombinedTranscript(prev => {
        const lastEntry = prev[prev.length - 1];
        
        if (lastEntry && lastEntry.speaker === currentSpeaker) {
          return prev.map((entry, index) => 
            index === prev.length - 1 
              ? { ...entry, text: [...entry.text, text] }
              : entry
          );
        }

        return [...prev, {
          id: Date.now().toString(),
          speaker: currentSpeaker,
          text: [text],
          timestamp: new Date().toISOString()
        }];
      });
      currentSpeechRef.current = [];

      if (currentSpeaker === 'candidate') {
        processWithAI(text);
      }
    } else {
      currentSpeechRef.current = [...currentSpeechRef.current, text];
    }
  }, [currentSpeaker]);

  const processWithAI = useCallback(async (text: string) => {
    if (text === lastProcessedTextRef.current || !text.trim() || !user) return;
    
    lastProcessedTextRef.current = text;
    setIsProcessing(true);

    const cachedResponse = cacheService.get(text);
    if (cachedResponse) {
      setAiResponses(prev => [{
        id: Date.now().toString(),
        question: text,
        answer: cachedResponse,
        timestamp: new Date().toISOString(),
        fromCache: true
      }, ...prev]);
      setIsProcessing(false);
      return;
    }

    try {
      const response = await fetch('https://coral-app-gorus.ondigitalocean.app/api/meeting/assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.uid}`,
        },
        body: JSON.stringify({
          text,
          context: meetingContext,
          fullTranscript: combinedTranscript
        })
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      let accumulatedResponse = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          setAiResponses(prev => [{
            id: Date.now().toString(),
            question: text,
            answer: accumulatedResponse,
            timestamp: new Date().toISOString()
          }, ...prev]);
          setStreamingResponse(null);
          break;
        }

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(5));
              if (data.content) {
                accumulatedResponse += data.content;
                setStreamingResponse(prev => prev ? {
                  ...prev,
                  answer: accumulatedResponse
                } : {
                  id: Date.now().toString(),
                  question: text,
                  answer: accumulatedResponse,
                  timestamp: new Date().toISOString(),
                  isStreaming: true
                });
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }

    } catch (error) {
      console.error('AI processing error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze the response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [user, meetingContext, combinedTranscript, toast]);

  const initializeAudioProcessing = async (
    displayStream: MediaStream, 
    micStream: MediaStream, 
    audioContext: AudioContext
  ) => {
    try {
      const workletUrl = new URL('/audioProcessor.worklet.js', window.location.origin);
      await audioContext.audioWorklet.addModule(workletUrl.href);

      const streamMerger = audioContext.createMediaStreamDestination();
      const workletNode = new AudioWorkletNode(audioContext, 'audio-processor', {
        numberOfInputs: 2,
        numberOfOutputs: 1,
        channelCount: 2,
        channelCountMode: 'explicit',
        channelInterpretation: 'speakers'
      });

      const displayAudio = displayStream.getAudioTracks()[0];
      const micAudio = micStream.getAudioTracks()[0];

      const displaySource = audioContext.createMediaStreamSource(new MediaStream([displayAudio]));
      const micSource = audioContext.createMediaStreamSource(new MediaStream([micAudio]));

      const displayGain = audioContext.createGain();
      const micGain = audioContext.createGain();

      displayGain.gain.value = 1.0;
      micGain.gain.value = 0.0;

      displaySource.connect(displayGain).connect(workletNode);
      micSource.connect(micGain).connect(workletNode);
      workletNode.connect(streamMerger);

      setAudioProcessingState({
        workletNode,
        streamMerger
      });

      return streamMerger.stream;
    } catch (error) {
      console.error('Error initializing audio processing:', error);
      throw error;
    }
  };

  const stopRecording = useCallback(async () => {
    try {

        if (deepgramState.service) {
            deepgramState.service.stop();
            setDeepgramState({ service: null });
          }

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      if (audioProcessingState.workletNode) {
        audioProcessingState.workletNode.disconnect();
      }
      if (audioProcessingState.streamMerger) {
        audioProcessingState.streamMerger.disconnect();
      }

      if (videoCallState.displayStream) {
        videoCallState.displayStream.getTracks().forEach(track => track.stop());
      }
      if (videoCallState.micStream) {
        videoCallState.micStream.getTracks().forEach(track => track.stop());
      }
      if (videoCallState.audioContext) {
        await videoCallState.audioContext.close();
      }

      setVideoCallState({
        isSharing: false,
        displayStream: null,
        micStream: null,
        audioContext: null
      });

      setAudioProcessingState({
        workletNode: null,
        streamMerger: null
      });

      setIsRecording(false);
      toast({
        title: "Recording Stopped",
        description: "Meeting recording has been stopped successfully.",
      });

    } catch (error) {
      console.error('Error stopping recording:', error);
      toast({
        title: "Error",
        description: "Failed to stop recording properly.",
        variant: "destructive",
      });
    }
  }, [deepgramState, videoCallState, audioProcessingState, toast]);


  const startVideoRecording = async () => {
    if (!user) return;

    try {
      setShowShareDialog(false);

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      if (!displayStream.getAudioTracks().length) {
        throw new Error('No system audio captured. Please make sure to share audio when sharing the screen.');
      }

      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          suppressLocalAudioPlayback: true
        }
      });

      const audioContext = new AudioContext();
      const processedStream = await initializeAudioProcessing(
        displayStream,
        micStream,
        audioContext
      );

      // Initialize Deepgram service with the processed stream
      const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;
      console.log('Deepgram API Key:', DEEPGRAM_API_KEY);
      const deepgramService = new DeepgramService(DEEPGRAM_API_KEY || '');
      
      deepgramService.connect(
        (text: string, isFinal: boolean) => {
          updateCombinedTranscript(text, isFinal);

          if (isFinal && currentSpeaker === 'candidate') {
            processWithAI(text);
          }
        },
        (error: any) => {
          console.error('Deepgram error:', error);
          toast({
            title: "Recognition Error",
            description: "Speech recognition error. Please try again.",
            variant: "destructive",
          });
        }
      );

      // Start recording with the processed stream
      deepgramService.startRecording(processedStream);
      
      setDeepgramState({ service: deepgramService });
      setIsRecording(true);

      setVideoCallState({
        isSharing: true,
        displayStream,
        micStream,
        audioContext
      });

      displayStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      toast({
        title: "Recording Started",
        description: "Video and audio recording is now active. Press Space to switch speakers.",
        duration: 5000,
      });

    } catch (error) {
      console.error('Error starting video recording:', error);
      setShowShareDialog(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start recording.",
        variant: "destructive",
      });
      setIsRecording(false);
    }
  };

  const startPhoneRecording = async () => {
    if (!user) return;
  
    try {
        const config = getConfig();
      console.log('Config loaded:', { 
        hasApiKey: !!config.deepgram.apiKey,
        apiKeyLength: config.deepgram.apiKey.length 
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleSize: 16
        }
      });
  
      // Initialize with API key directly (for testing)
      const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;
console.log('Deepgram API Key:', DEEPGRAM_API_KEY);
const deepgramService = new DeepgramService(config.deepgram.apiKey);

      deepgramService.connect(
        (text: string, isFinal: boolean) => {
          console.log('Transcript received:', text, 'isFinal:', isFinal);
          if (text.trim()) {
            updateCombinedTranscript(text, isFinal);
            if (isFinal && currentSpeaker === 'candidate') {
              processWithAI(text);
            }
          }
        },
        (error: any) => {
          console.error('Deepgram connection error:', error);
          toast({
            title: "Recognition Error",
            description: "Failed to connect to speech recognition service.",
            variant: "destructive",
          });
        }
      );
  
      await deepgramService.startRecording(stream);
      
      setDeepgramState({ service: deepgramService });
      setIsRecording(true);
  
      toast({
        title: "Recording Started",
        description: "Speech recognition is now active. Press Space to switch speakers.",
        duration: 5000,
      });
  
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Failed to start recording. Please check microphone permissions.",
        variant: "destructive",
      });
      setIsRecording(false);
    }
  };


  const handleStartRecording = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the interview copilot.",
        variant: "destructive",
      });
      return;
    }

    if (callType === 'video') {
      setShowShareDialog(true);
    } else {
      if (!contextCollected) {
        setShowContextDialog(true);
      } else {
        await startPhoneRecording();
      }
    }
  }, [user, callType, contextCollected]);

  const handleContextSubmit = useCallback(async () => {
    if (!meetingContext.trim()) {
      toast({
        title: "Context Required",
        description: "Please provide context about the interview before starting.",
        variant: "destructive",
      });
      return;
    }

    setContextCollected(true);
    setShowContextDialog(false);
    await startPhoneRecording();
    
    toast({
      title: "Context Saved",
      description: "Interview context has been saved. Recording started.",
    });
  }, [meetingContext]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isRecording) {
        e.preventDefault();
        setCurrentSpeaker(prev => prev === 'interviewer' ? 'candidate' : 'interviewer');
        toast({
          title: "Speaker Switched",
          description: `Current speaker: ${currentSpeaker === 'interviewer' ? 'Candidate' : 'Interviewer'}`,
          duration: 2000,
        });
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => document.removeEventListener('keypress', handleKeyPress);
  }, [isRecording, currentSpeaker]);

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">Interview Copilot</h1>
            <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isRecording ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {currentSpeaker === 'interviewer' ? 'Interviewer' : 'Candidate'}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentSpeaker(prev => 
                prev === 'interviewer' ? 'candidate' : 'interviewer'
              )}
              className="bg-gray-600-to-blue-800 hover:bg-black hover:text-700 text-white"
            >
              Switch Speaker
            </Button>
          </div>
          
          <div className="flex space-x-4">
            <Button
              variant="default"
              onClick={() => processWithAI(combinedTranscript.map(t => t.text.join(' ')).join(' '))}
              disabled={isProcessing || !isRecording}
              className="bg-green-600 hover:bg-green-700 animate-pulse text-white"
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-4">⟳</span>
                  Analyzing...
                </span>
              ) : (
                <>
                  <MessageSquare className="w-14 h-14 mr-2" />
                  Get Answer
                </>
              )}
            </Button>
            
            <Button 
              variant={isRecording ? "destructive" : "default"}
              onClick={isRecording ? stopRecording : handleStartRecording}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRecording ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Start Recording
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contextCollected && (
            <Card className="bg-gray-800/50 border-gray-700 col-span-2 mb-4">
              <CardHeader>
                <CardTitle className="text-white">Meeting Context</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">{meetingContext}</p>
              </CardContent>
            </Card>
          )}
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Live Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={transcriptRef}
                className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar"
              >
                {combinedTranscript.map((entry) => (
                  <div 
                    key={entry.id} 
                    className={`p-3 rounded-lg animate-slide-down ${
                      entry.speaker === 'candidate' 
                        ? 'bg-blue-900/50' 
                        : 'bg-gray-700/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-300">
                        {entry.speaker} - {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-white">
                      {entry.text.join(' ')}
                    </p>
                  </div>
                ))}
                {combinedTranscript.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    No transcript available yet. Start recording to begin.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {streamingResponse && (
                  <div className="p-3 bg-gray-700/50 rounded-lg border border-blue-500/50 shadow-lg">
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-300">
                        {new Date(streamingResponse.timestamp).toLocaleTimeString()}
                      </span>
                      <div className="flex items-center space-x-2 text-blue-400">
                        <span className="flex space-x-1">
                          <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                          <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                        <span className="text-sm">Generating...</span>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-blue-300 font-medium">Question:</p>
                      <p className="mt-1 text-gray-300 italic">{streamingResponse.question}</p>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-green-300 font-medium">Answer:</p>
                      <div className="mt-1 text-white whitespace-pre-wrap">
                        {streamingResponse.answer}
                        <span className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-pulse" />
                      </div>
                    </div>
                  </div>
                )}

                {aiResponses.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-3 bg-gray-700/50 rounded-lg transition-all duration-300"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-300">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                      {item.fromCache && (
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                          Cached
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-blue-300 font-medium">Question:</p>
                      <p className="mt-1 text-gray-300 italic">
                        {item.question || 'No question detected'}
                      </p>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-green-300 font-medium">Answer:</p>
                      <div className="mt-1 text-white whitespace-pre-wrap">
                        {item.answer || item.response || 'No response available'}
                      </div>
                    </div>
                  </div>
                ))}

                {!streamingResponse && aiResponses.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    AI analysis will appear here when questions are asked.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="bg-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Start Video Recording</DialogTitle>
              <DialogDescription className="text-gray-300">
                Please share your screen with system audio to begin recording the meeting.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-center">
                <Share2 className="w-16 h-16 text-blue-400" />
              </div>
              <p className="text-center text-gray-300">
                Make sure to enable "Share system audio" when sharing your screen.
              </p>
              <div className="flex justify-end space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowShareDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={startVideoRecording}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Share Screen & Start Recording
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showContextDialog} onOpenChange={setShowContextDialog}>
          <DialogContent className="bg-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Meeting Context</DialogTitle>
              <DialogDescription className="text-gray-300">
                Please provide context about this meeting to help the AI better understand and analyze the conversation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <textarea
                value={meetingContext}
                onChange={(e) => setMeetingContext(e.target.value)}
                placeholder="e.g., This is a technical interview for a senior frontend developer position..."
                className="w-full h-32 px-3 py-2 text-white bg-gray-700 rounded-md border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex justify-end space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowContextDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleContextSubmit}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Save Context & Start Recording
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slideDown 0.3s ease-out forwards;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(75, 85, 99, 0.7);
        }
      `}</style>
    </div>
  );
};

export default InterviewCopilot;

