export const getConfig = () => {
    const deepgramApiKey = import.meta.env.VITE_DEEPGRAM_API_KEY;
    
    if (!deepgramApiKey) {
      throw new Error('VITE_DEEPGRAM_API_KEY is not defined in environment variables');
    }
  
    return {
      deepgram: {
        apiKey: deepgramApiKey
      }
    };
  };
  