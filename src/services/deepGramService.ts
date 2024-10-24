export class DeepgramService {
    private socket: WebSocket | null = null;
    private audioContext: AudioContext | null = null;
    private audioProcessor: ScriptProcessorNode | null = null;
    private deepgramApiKey: string;
  
    constructor(apiKey: string) {
      this.deepgramApiKey = apiKey;
    }
  
    connect(onTranscript: (text: string, isFinal: boolean) => void, onError: (error: any) => void) {
      try {
        // Configure URL with all required parameters
        const deepgramUrl = 'wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000&channels=1&interim_results=true&punctuate=true&language=en-US&model=general';
  
        // Create WebSocket with authorization header
        this.socket = new WebSocket(deepgramUrl, ['token', this.deepgramApiKey]);
  
        this.socket.onopen = () => {
          console.log('Deepgram WebSocket connected successfully');
        };
  
        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Deepgram response:', data);
  
            if (data.channel?.alternatives?.[0]) {
              const transcript = data.channel.alternatives[0].transcript;
              const isFinal = data.is_final || false;
  
              if (transcript && transcript.trim()) {
                console.log('Processing transcript:', transcript, 'isFinal:', isFinal);
                onTranscript(transcript, isFinal);
              }
            }
          } catch (error) {
            console.error('Error parsing Deepgram message:', error);
          }
        };
  
        this.socket.onerror = (error) => {
          console.error('Deepgram WebSocket error:', error);
          // Check WebSocket state
          console.log('WebSocket state:', this.socket?.readyState);
          console.log('WebSocket protocol:', this.socket?.protocol);
          onError(error);
        };
  
        this.socket.onclose = (event) => {
          console.log('Deepgram WebSocket closed:', event.code, event.reason);
        };
  
      } catch (error) {
        console.error('Error connecting to Deepgram:', error);
        onError(error);
      }
    }
  
    async startRecording(stream: MediaStream) {
      try {
        this.audioContext = new AudioContext({
          sampleRate: 16000
        });
  
        const source = this.audioContext.createMediaStreamSource(stream);
        
        // Create a script processor with smaller buffer size
        this.audioProcessor = this.audioContext.createScriptProcessor(1024, 1, 1);
  
        this.audioProcessor.onaudioprocess = (e) => {
          if (this.socket?.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmData = new Int16Array(inputData.length);
            
            // Convert Float32Array to Int16Array
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
  
            this.socket.send(pcmData.buffer);
          }
        };
  
        // Connect the audio graph
        source.connect(this.audioProcessor);
        this.audioProcessor.connect(this.audioContext.destination);
  
        console.log('Recording started successfully');
        console.log('Audio context state:', this.audioContext.state);
        console.log('WebSocket state:', this.socket?.readyState);
  
      } catch (error) {
        console.error('Error starting recording:', error);
        throw error;
      }
    }
  
    stop() {
      try {
        if (this.audioProcessor) {
          this.audioProcessor.disconnect();
          this.audioProcessor = null;
        }
  
        if (this.audioContext) {
          this.audioContext.close();
          this.audioContext = null;
        }
  
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.close();
          this.socket = null;
        }
      } catch (error) {
        console.error('Error stopping Deepgram recording:', error);
        throw error;
      }
    }
  }