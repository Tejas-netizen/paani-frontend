'use client';

import { useState, useEffect } from 'react';
import useSpeechRecognition from 'react-speech-recognition';
import { useSpeechSynthesis } from 'react-speech-kit';

export default function VoiceChat({ onQueryResult }) {
  const [isListening, setIsListening] = useState(false);
  const { speak } = useSpeechSynthesis();
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const startListening = () => {
    resetTranscript();
    setIsListening(true);
  };

  const stopListening = async () => {
    setIsListening(false);
    if (transcript) {
      // Process the voice query
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: transcript })
        });
        
        const data = await response.json();
        
        // Speak the response
        if (data.success) {
          speak({ text: data.summary || 'Query processed successfully' });
          onQueryResult && onQueryResult(data);
        }
      } catch (error) {
        console.error('Error processing voice query:', error);
        speak({ text: 'Sorry, I encountered an error processing your query' });
      }
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <div>Browser doesn't support speech recognition.</div>;
  }

  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow">
      <button
        onClick={isListening ? stopListening : startListening}
        className={`px-4 py-2 rounded-full ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-ocean-600 hover:bg-ocean-700'
        } text-white transition-colors`}
      >
        {isListening ? 'Stop Listening' : 'Start Voice Query'}
      </button>
      
      {isListening && (
        <div className="text-gray-600">
          Listening... {transcript}
        </div>
      )}
    </div>
  );
}