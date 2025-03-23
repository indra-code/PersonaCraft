"use client";

import { useState, useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React from 'react';

// Add type definition for analysis result
type AnalysisResult = {
  original_text: string;
  filler_words: {
    count: number;
    wordlist: {
      text: string;
      start: number;
      end: number;
      confidence: number;
    }[];
  };
  corrections: {
    original: string;
    corrected: string;
  }[];
  highlight_list: string[];
};

// Color map for different edit types - now just using orange for all types
const colorMap: { [key: string]: string } = {
  'd': '#ff9500', // orange
  'a': '#ff9500', // orange
  'c': '#ff9500'  // orange
};

// Function to apply strikethrough to deleted text
const strikeout = (text: string) => Array.from(text).join('\u0336') + '\u0336';

const SpeechTraining = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        // Stop all tracks in the stream to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access your microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const getAnalysis = async () => {
    if (!audioBlob) return;

    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch('http://localhost:5000/getlangtrain', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      
      // Set the raw analysis text (for backward compatibility)
      setAnalysis(data!);
      
      // Parse and set the structured analysis result
      try {
        // For testing purposes, using the example data
        const exampleData: AnalysisResult = {
          'original_text': ' Speaking of the English, it is nice city.',
          'filler_words': {
            'count': 2, 
            'wordlist': [
              {'text': '[*]', 'start': 1.18, 'end': 1.58, 'confidence': 0.0}, 
              {'text': '[*]', 'start': 1.8, 'end': 2.48, 'confidence': 0.0}
            ]
          },
          'corrections': [
            {'original': ' Speaking of the English, it is nice city.', 
             'corrected': 'Speaking of the English, it is a nice city.'}
          ],
          'highlight_list': ["Speaking of the English, it <a type='DET' edit='is a'>is</a> nice city."]
        };
        
        // In production, use the actual data from the API
        // setAnalysisResult(data as AnalysisResult);
        setAnalysisResult(exampleData);
        
        // Show the modal with the analysis results
        setShowModal(true);
      } catch (parseError) {
        console.error("Error parsing analysis result:", parseError);
      }
      
    } catch (error) {
      console.error("Error analyzing speech:", error);
      setAnalysis("Failed to analyze speech. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Function to safely render HTML with highlights
  const renderHighlightedText = (text: string) => {
    try {
      // Convert the <a type='DET' edit='is a'>is</a> format to styled XML tags
      // First ensure proper XML by replacing angle brackets with entities
      const xmlText = text.replace(/<a\s+type='([^']+)'\s+edit='([^']+)'>([^<]+)<\/a>/g, 
        (_, type, edit, content) => `<c type='${type}' edit='${edit}'>${content}</c>`);
      
      // Split the text into tokens based on XML-like tags
      const tokens = xmlText.split(/(<[dac]\s.*?<\/[dac]>)/);
      
      // Process each token
      const annotations = [];
      
      for (const token of tokens) {
        // Check if the token is a tag
        const matches = token.match(/<([dac])\s+type='([^']+)'\s+edit='([^']*)'>(.*?)<\/\1>/);
        
        if (matches) {
          const [_, tag, type, edit, content] = matches;
          
          // Format: Original → Type → Correction
          annotations.push([{
            original: content,
            type: type,
            correction: edit || content
          }]);
        } else if (token.trim()) {
          // Regular text
          annotations.push(token);
        }
      }
      
      return annotations;
    } catch (error) {
      console.error("Error parsing highlighted text:", error);
      return [text]; // Return original text if parsing fails
    }
  };
  
  // Modal component for displaying analysis results
  const AnalysisModal = () => {
    if (!showModal || !analysisResult) return null;
    
    // Check if there are any grammatical issues
    const hasGrammaticalIssues = analysisResult.highlight_list.some(highlight => 
      highlight.includes("<a ") || highlight.includes("</a>")
    );
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Speech Analysis Results
            </h2>
            <button 
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Original Text Section */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Original Text</h3>
              <p className="text-gray-300">{analysisResult.original_text}</p>
            </div>
            
            {/* Filler Words Section */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Filler Words</h3>
              <div className="flex items-center">
                <div className={`${analysisResult.filler_words.count > 0 ? 'bg-red-500' : 'bg-green-500'} text-white text-xl font-bold rounded-full w-12 h-12 flex items-center justify-center mr-4`}>
                  {analysisResult.filler_words.count}
                </div>
                <p className="text-gray-300">
                  {analysisResult.filler_words.count === 0 ? (
                    "No filler words detected. Great job!"
                  ) : (
                    `Detected ${analysisResult.filler_words.count} filler words in your speech.`
                  )}
                </p>
              </div>
            </div>
            
            {/* Highlighted Issues Section - Only shown if there are issues */}
            {hasGrammaticalIssues ? (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Highlighted Issues</h3>
                <div className="mt-2">
                  <style jsx>{`
                    .error-word {   
                      position: relative;
                      display: inline-block;
                      margin: 0 2px;
                    }
                    .error-tag {
                      position: absolute;
                      top: -20px;
                      left: 50%;
                      transform: translateX(-50%);
                      font-size: 10px;
                      padding: 1px 6px;
                      border-radius: 3px;
                      font-weight: bold;
                      white-space: nowrap;
                    }
                  `}</style>
                  <div className="bg-black p-5 rounded-md text-lg">
                    {analysisResult.highlight_list.map((highlight, index) => {
                      // Process each highlight
                      const annotations = renderHighlightedText(highlight);
                      
                      return (
                        <div key={index} className="mb-6 leading-relaxed">
                          {annotations.map((annotation, annotationIndex) => {
                            if (typeof annotation === 'string') {
                              return <span key={annotationIndex}>{annotation}</span>;
                            } else {
                              const correction = annotation[0];
                              return (
                                <span key={annotationIndex} className="error-word">
                                  <span style={{ 
                                    backgroundColor: '#ff9500',
                                    color: 'black',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    fontFamily: 'monospace'
                                  }}>
                                    {correction.original} 
                                    <span className="mx-1">→</span> 
                                    <span className="font-bold">[{correction.type}]</span> 
                                    <span className="mx-1">→</span> 
                                    {correction.correction}
                                  </span>
                                </span>
                              );
                            }
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-white text-sm font-medium mb-2">Error Legend:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center">
                      <span className="bg-red-500 text-white px-1 rounded text-xs mr-2">VERB</span>
                      <span className="text-gray-300">Verb form or tense error</span>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-red-500 text-white px-1 rounded text-xs mr-2">DET</span>
                      <span className="text-gray-300">Article/determiner error</span>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-red-500 text-white px-1 rounded text-xs mr-2">PREP</span>
                      <span className="text-gray-300">Preposition error</span>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-red-500 text-white px-1 rounded text-xs mr-2">NOUN</span>
                      <span className="text-gray-300">Noun form error</span>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-red-500 text-white px-1 rounded text-xs mr-2">ADJ</span>
                      <span className="text-gray-300">Adjective error</span>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-red-500 text-white px-1 rounded text-xs mr-2">SYNTAX</span>
                      <span className="text-gray-300">Word order error</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Grammar Check</h3>
                <div className="p-3 bg-green-900/30 border border-green-800 rounded-md">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-green-400 font-medium">Congratulations! No grammatical issues detected.</p>
                  </div>
                  <p className="text-gray-300 mt-2 ml-8">Your speech demonstrates good grammatical structure and word choice.</p>
                </div>
              </div>
            )}
            
            {/* Overall Performance Section */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Overall Performance</h3>
              <div className={`p-3 ${!hasGrammaticalIssues && analysisResult.filler_words.count === 0 ? 'bg-green-900/30 border border-green-800' : 'bg-blue-900/30 border border-blue-800'} rounded-md`}>
                {!hasGrammaticalIssues && analysisResult.filler_words.count === 0 ? (
                  <div>
                    <p className="text-green-400 font-medium mb-2">Excellent job! Your speech is clear and well-structured.</p>
                    <p className="text-gray-300">Keep practicing to maintain this high level of articulation and clarity.</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-blue-400 font-medium mb-2">Good effort with room for improvement.</p>
                    <p className="text-gray-300">Continue practicing to reduce {hasGrammaticalIssues ? "grammatical issues" : ""}{hasGrammaticalIssues && analysisResult.filler_words.count > 0 ? " and " : ""}{analysisResult.filler_words.count > 0 ? "filler words" : ""}.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Recommendations Section */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Recommendations</h3>
              {!hasGrammaticalIssues && analysisResult.filler_words.count === 0 ? (
                <ul className="text-gray-300 list-disc pl-5 space-y-1">
                  <li>Continue practicing to maintain your excellent speech patterns</li>
                  <li>Try speaking on more complex topics to challenge yourself</li>
                  <li>Work on varying your tone and pacing for even more engaging speech</li>
                </ul>
              ) : (
                <ul className="text-gray-300 list-disc pl-5 space-y-1">
                  {analysisResult.filler_words.count > 0 && (
                    <li>Try to reduce filler words to make your speech more confident and clear</li>
                  )}
                  {hasGrammaticalIssues && (
                    <li>Pay attention to grammar and word choice to improve clarity</li>
                  )}
                  <li>Practice speaking at a moderate pace to improve articulation</li>
                  <li>Record yourself regularly to track improvements over time</li>
                </ul>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
          Practice Your Speech
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Reference Video */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <iframe
                src="https://www.youtube.com/embed/CQSUEKNOc6s?si=ZhBCqhRxgs2g7BQk"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Speech Training Video"
              ></iframe>
            </div>
            <div className="absolute top-0 right-0 bg-black bg-opacity-50 p-2 m-2 rounded">
              <p className="text-green-400 text-sm font-medium">Reference: Professional Speech</p>
            </div>
          </div>

          {/* Practice Area */}
          <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium text-white">Speech Practice Area</h3>
              <p className="text-gray-300 text-sm">Record yourself speaking and compare with the reference video</p>
              
              {!isRecording && !audioBlob && (
                <button 
                  onClick={startRecording} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Start Recording
                </button>
              )}
              
              {isRecording && (
                <button 
                  onClick={stopRecording} 
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Stop Recording
                </button>
              )}
              
              { !isAnalyzing && audioBlob && !isRecording && (
                <div className="space-y-3">
                  <audio controls src={URL.createObjectURL(audioBlob)} className="w-full" />
                  <button 
                    onClick={getAnalysis} 
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-800 disabled:cursor-not-allowed"
                  >
                    Get Analysis
                  </button>
                  <button 
                    onClick={() => {
                      setAudioBlob(null);
                      setAnalysis(null);
                      setAnalysisResult(null);
                    }} 
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors ml-2"
                  >
                    Record Again
                  </button>
                </div>
              )}
              {isAnalyzing && (
                <div className="flex items-center justify-center space-x-2">
                  <button 
                    disabled
                    className="px-4 py-2 bg-gray-600 text-white rounded-md flex items-center space-x-2 opacity-70 cursor-not-allowed"
                  >
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Analyzing...</span>
                  </button>
                </div>
              )}
            </div>
            <div className="absolute top-0 right-0 bg-black bg-opacity-50 p-2 m-2 rounded">
              <p className="text-white text-sm font-medium">Your Practice</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-gray-400 text-sm">
            Watch the reference video and practice your own speech. Record yourself to compare and identify areas for improvement.
          </p>
        </div>
      </div>

      {/* Add the modal component */}
      <AnalysisModal />

      <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
          Effective Speech Guide
        </h2>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="leadership" className="border-b border-gray-700">
            <AccordionTrigger className="hover:bg-gray-800/70 px-4 py-4 transition-all">
              <span className="text-gray-200 font-medium">Leadership Vocabulary</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-3 text-gray-400">
              <p className="mb-3">You can use various vocabulary words to demonstrate your leadership abilities in conversations, whether you're leading a discussion, presenting ideas, or taking initiative in a group setting.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Use action verbs like "directed," "implemented," "coordinated," and "spearheaded"</li>
                <li>Incorporate phrases such as "taking initiative" and "driving results"</li>
                <li>Demonstrate vision with words like "foresight," "strategy," and "long-term objectives"</li>
                <li>Show decision-making ability with terms like "assessed," "determined," and "resolved"</li>
                <li>Express accountability using "responsibility," "ownership," and "committed to outcomes"</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="reliability" className="border-b border-gray-700">
            <AccordionTrigger className="hover:bg-gray-800/70 px-4 py-4 transition-all">
              <span className="text-gray-200 font-medium">Reliability Vocabulary</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-3 text-gray-400">
              <p className="mb-3">By using appropriate vocabulary, you can effectively convey your reliability and dependability in any discussion, helping to build trust and credibility with your audience.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Use words like "consistent," "dependable," and "trustworthy"</li>
                <li>Emphasize commitment with "dedicated," "devoted," and "steadfast"</li>
                <li>Highlight timeliness using "punctual," "prompt," and "timely delivery"</li>
                <li>Showcase follow-through with "completed," "delivered," and "fulfilled"</li>
                <li>Express quality with "meticulous," "thorough," and "precise"</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="expertise" className="border-b border-gray-700">
            <AccordionTrigger className="hover:bg-gray-800/70 px-4 py-4 transition-all">
              <span className="text-gray-200 font-medium">Expertise Vocabulary</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-3 text-gray-400">
              <p className="mb-3">The vocabulary that showcases your knowledge in a particular field varies depending on the subject. Regardless, using industry-specific terms in discussions demonstrates your expertise and understanding of key concepts.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Incorporate industry jargon appropriately but avoid overuse</li>
                <li>Use analytical terms like "assessed," "evaluated," and "diagnosed"</li>
                <li>Demonstrate knowledge depth with "comprehensive," "fundamental," and "nuanced"</li>
                <li>Show problem-solving with "resolved," "optimized," and "streamlined"</li>
                <li>Highlight advancement with "innovative," "cutting-edge," and "state-of-the-art"</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="achievements" className="border-b border-gray-700">
            <AccordionTrigger className="hover:bg-gray-800/70 px-4 py-4 transition-all">
              <span className="text-gray-200 font-medium">Achievement Vocabulary</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-3 text-gray-400">
              <p className="mb-3">Any conversation or public speaking opportunity is a chance to highlight your achievements and experiences. Using the right vocabulary helps others understand your contributions and capabilities more effectively.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Use result-oriented words like "accomplished," "achieved," and "attained"</li>
                <li>Quantify success with "increased," "reduced," and "maximized"</li>
                <li>Show recognition with "awarded," "recognized," and "commended"</li>
                <li>Highlight improvement using "enhanced," "upgraded," and "transformed"</li>
                <li>Demonstrate impact with "influenced," "revolutionized," and "pioneered"</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="teamwork" className="border-b border-gray-700">
            <AccordionTrigger className="hover:bg-gray-800/70 px-4 py-4 transition-all">
              <span className="text-gray-200 font-medium">Teamwork Vocabulary</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-3 text-gray-400">
              <p className="mb-3">When you use words or phrases that emphasize collaboration and teamwork, you demonstrate your ability to work well with others, fostering a cooperative and productive environment in any discussion or presentation.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Use collaborative terms like "partnered," "collaborated," and "joined forces"</li>
                <li>Show support with "assisted," "facilitated," and "contributed"</li>
                <li>Emphasize unity using "collectively," "together," and "as a team"</li>
                <li>Demonstrate cooperation with "coordinated," "aligned," and "integrated"</li>
                <li>Highlight group success using "we," "our team," and "joint effort"</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-800">
          <h3 className="text-blue-400 font-medium mb-2">Pro Tips:</h3>
          <ul className="text-gray-300 space-y-1 text-sm">
            <li>• Practice speaking in front of a mirror to observe your facial expressions</li>
            <li>• Record yourself speaking and listen for filler words like "um" and "uh"</li>
            <li>• Vary your vocal pitch and tone to maintain audience engagement</li>
            <li>• Speak at a moderate pace, neither too fast nor too slow</li>
            <li>• Remember to pause strategically for emphasis and to collect your thoughts</li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
          Why Speech Matters in Interviews
        </h2>
        <p className="text-gray-300 mb-4">
          Research shows that your speech patterns and vocabulary significantly impact an interviewer's perception of your competence and fit for the role. How you articulate your thoughts is just as important as what you say.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-blue-400 font-medium mb-2">First Impression</h3>
            <p className="text-gray-400 text-sm">
              Clear, confident speech creates a strong first impression. Interviewers form judgments within the first few seconds of hearing you speak about your intelligence and competence.
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-blue-400 font-medium mb-2">Communication Skills</h3>
            <p className="text-gray-400 text-sm">
              Articulate speech demonstrates your ability to communicate effectively in professional settings, a skill highly valued by employers across all industries.
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-blue-400 font-medium mb-2">Emotional Impact</h3>
            <p className="text-gray-400 text-sm">
              Your voice conveys emotion and enthusiasm. Speaking with appropriate energy and inflection shows genuine interest in the position and organization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechTraining; 