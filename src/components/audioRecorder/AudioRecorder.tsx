// Add type declarations
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface MediaRecorderErrorEvent extends Event {
  error: Error;
}

export interface AudioRecorderConfig {
  onTranscription: (text: string, isFinal: boolean) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (isRecording: boolean) => void;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recognition: SpeechRecognition | null = null;
  private isRecording: boolean = false;
  private readonly config: AudioRecorderConfig;
  private restartTimeout: NodeJS.Timeout | null = null;
  private recognitionRestartAttempts: number = 0;
  private readonly MAX_RESTART_ATTEMPTS = 5;

  constructor(config: AudioRecorderConfig) {
    // Validate config
    if (typeof config.onTranscription !== 'function') {
      throw new Error('onTranscription must be a function');
    }
    this.config = config;
  }

  private initializeRecognitionEvents(recognition: SpeechRecognition) {
    // Configure recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    // Set up recognition event handlers
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      try {
        const result = event.results[event.results.length - 1];
        if (result) {
          const transcript = result[0].transcript;
          const isFinal = result.isFinal;
          
          // Log before calling callback
          console.log('Recognition result:', { transcript, isFinal });
          
          // Ensure callback exists and is a function
          if (typeof this.config.onTranscription === 'function') {
            this.config.onTranscription(transcript, isFinal);
          } else {
            console.error('onTranscription callback is not a function');
          }
        }
      } catch (error) {
        console.error('Error in recognition onresult:', error);
        this.handleError(error as Error);
      }
    };

    recognition.onend = () => {
      console.log('Recognition ended');
      if (this.isRecording) {
        this.restartSpeechRecognition();
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.log('Recognition error event:', event.error);
      
      switch (event.error) {
        case 'network':
          this.handleError(new Error('Network error occurred. Check your connection.'));
          break;
        case 'no-speech':
          this.restartSpeechRecognition();
          break;
        case 'aborted':
          if (this.isRecording) {
            this.restartSpeechRecognition();
          }
          break;
        default:
          this.handleError(new Error(`Speech recognition error: ${event.error}`));
      }
    };

    recognition.onstart = () => {
      console.log('Recognition started');
    };
  }

  
  async start() {
    if (this.isRecording) return;

    try {
      await this.initializeSpeechRecognition();
      await this.initializeMediaRecorder();

      this.isRecording = true;
      this.config.onStatusChange?.(true);
      this.setupAutoRestart();

    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private async initializeSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error('Speech recognition is not supported in this browser');
    }

    const recognition = new SpeechRecognition();
    this.recognition = recognition;
    
    this.initializeRecognitionEvents(recognition);

    try {
      await recognition.start();
      console.log('Speech recognition started successfully');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      throw error;
    }
  }

  private async initializeMediaRecorder() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          console.log('Audio data available:', event.data.size, 'bytes');
        }
      };

      mediaRecorder.onerror = (event: Event) => {
        const errorEvent = event as MediaRecorderErrorEvent;
        this.handleError(new Error('MediaRecorder error: ' + errorEvent.error.message));
      };

      // Start recording with 1-second chunks
      mediaRecorder.start(1000);
      this.mediaRecorder = mediaRecorder;
      console.log('Media recorder started successfully');

    } catch (error) {
      console.error('Error initializing media recorder:', error);
      throw error;
    }
  }

  private async restartSpeechRecognition() {
    if (!this.isRecording || !this.recognition) return;

    this.recognitionRestartAttempts++;

    if (this.recognitionRestartAttempts > this.MAX_RESTART_ATTEMPTS) {
      this.handleError(new Error('Maximum recognition restart attempts reached'));
      return;
    }

    console.log(`Attempting to restart speech recognition (attempt ${this.recognitionRestartAttempts})`);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const recognition = this.recognition;
      try {
        recognition.stop();
      } catch (error) {
        console.log('Error stopping recognition (expected):', error);
      }

      await recognition.start();
      console.log('Speech recognition restarted successfully');
      
      this.recognitionRestartAttempts = 0;

    } catch (error) {
      console.error('Error restarting speech recognition:', error);
      this.handleError(error as Error);
    }
  }

  private handleError(error: Error) {
    console.error('AudioRecorder error:', error);
    this.config.onError?.(error);

    if (this.isRecording) {
      if (this.recognitionRestartAttempts <= this.MAX_RESTART_ATTEMPTS) {
        this.restartRecording();
      } else {
        this.stop();
        this.config.onError?.(new Error('Recording stopped due to excessive errors'));
      }
    }
  }

  private setupAutoRestart() {
    if (this.restartTimeout) {
      clearInterval(this.restartTimeout);
    }

    this.restartTimeout = setInterval(() => {
      if (this.isRecording && this.mediaRecorder && this.mediaRecorder.state !== 'recording') {
        console.log('Auto-restarting recording due to inactive state');
        this.restartRecording();
      }
    }, 5000);
  }

  private async restartRecording() {
    try {
      await this.stop();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.start();
    } catch (error) {
      console.error('Error restarting recording:', error);
      this.config.onError?.(error as Error);
    }
  }

  async stop() {
    if (!this.isRecording) return;

    this.isRecording = false;
    this.config.onStatusChange?.(false);
    this.recognitionRestartAttempts = 0;

    if (this.restartTimeout) {
      clearInterval(this.restartTimeout);
      this.restartTimeout = null;
    }

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.log('Error stopping recognition (expected):', error);
      }
      this.recognition = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
        const tracks = this.mediaRecorder.stream.getTracks();
        tracks.forEach(track => track.stop());
      } catch (error) {
        console.error('Error stopping media recorder:', error);
      }
      this.mediaRecorder = null;
    }
  }
}