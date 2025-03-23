"use client";

import { Upload } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Weakness {
  Weakness: string;
  "How to improve": string;
}

interface AnalysisResponse {
  Summary: string;
  Strengths: string;
  Weaknesses: Weakness[];
  Conclusion: string;
}

interface FeedbackResponse {
  score: string;
  feedback: string;
  missing_points: string;
  suggestions: string;
  resources: string;
  correct_answer: string;
}

const questions = [
  "What is a linked list and how does it work?",
  "What is a binary tree and how does it work?",
  "What is a hash table and how does it work?",
  "What is dynamic programming?",
  "Explain the concept of multi-threading in Java",
  "What is the difference between a stack and a queue?",
  "What is the difference between a linked list and an array?",
];
const answer = [
  "A linked list is a linear data structure that consists of a sequence of nodes, where each node contains a value and a reference to the next node in the list.",
  "A binary tree is a tree data structure in which each node has at most two children, which are referred to as the left child and the right child.",
  "A hash table is a data structure that stores key-value pairs in an array, using a hash function to compute an index into the array to store the value.",
  "Dynamic programming is a method for solving complex problems by breaking them down into simpler subproblems.",
  "Multi-threading in Java is a feature that allows multiple threads to run concurrently within a single process.",
];

const Interview = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [isSpeechLoading, setIsSpeechLoading] = useState(false);
  const [res, setResponse] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string>(
    questions[0]
  );
  const [feedbackData, setFeedbackData] = useState<FeedbackResponse | null>(
    null
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Reset states when a new file is selected
      setResponse(null);
      setFeedbackData(null);
    }
  };

  const fetchVideoTranscription = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("video", selectedFile);
    const response = await fetch("http://127.0.0.1:5000/getlang", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    // const parsedData = JSON.parse(data);
    return data.original_text || data; // Extract original_text if it exists
  };

  const fetchFeedback = async (userAnswer: string) => {
    if (!userAnswer || !selectedQuestion) return;

    const formData = new FormData();
    formData.append("user_answer", answer[0]);
    formData.append("question", questions[0]);

    const response = await fetch("http://127.0.0.1:5000/qa", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data;
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      // Step 1: Get transcription from video
      const transcriptionData = await fetchVideoTranscription();
      if (transcriptionData) {
        console.log("Transcription data:", transcriptionData);
        setResponse(transcriptionData);

        // Step 2: Get feedback on the transcribed answer
        setIsFeedbackLoading(true);
        const feedbackResult = await fetchFeedback(transcriptionData);
        if (feedbackResult) {
          console.log("Feedback data:", feedbackResult);
          setFeedbackData(feedbackResult);
        }
      }
    } catch (error) {
      console.error("Process error:", error);
    } finally {
      setIsLoading(false);
      setIsFeedbackLoading(false);
    }
  };

  const handleConvertAllToSpeech = async () => {
    if (!feedbackData) return;

    const textToConvert = `
      Feedback: ${feedbackData.feedback}
      Missing Points: ${feedbackData.missing_points}
      Suggestions: ${feedbackData.suggestions}
      Correct Answer: ${feedbackData.correct_answer}
    `;

    setIsSpeechLoading(true);
    setAudioUrl(null);

    try {
      const formData = new FormData();
      formData.append("report", textToConvert);

      const response = await fetch("http://localhost:5000/tts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}: ${response.statusText}`
        );
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      if (audioRef.current) {
        audioRef.current
          .play()
          .catch((err) => console.log("Autoplay prevented:", err));
      }
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof Error) {
        alert("Error converting text to speech: " + error.message);
      } else {
        alert("An unknown error occurred");
      }
    } finally {
      setIsSpeechLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-8 bg-gray-900">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-8 text-center">
        AI Interview Analysis
      </h1>

      <div className="max-w-4xl w-full space-y-8">
        {/* Question Selection */}
        <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Interview Question
          </h2>

          <select
            className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-gray-200 mb-4"
            value={selectedQuestion}
            onChange={(e) => setSelectedQuestion(e.target.value)}
          >
            {questions.map((q, index) => (
              <option key={index} value={q}>
                {q}
              </option>
            ))}
          </select>

          <p className="text-gray-300 mb-4">
            Record yourself answering this question and upload the video below.
          </p>
        </div>

        {/* Video Upload Section */}
        <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Upload Interview Video
          </h2>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-lg p-12 hover:border-gray-600 transition-colors bg-gray-800/50">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="h-12 w-12 text-gray-400 mb-3 group-hover:text-gray-300" />
              <span className="text-gray-300 font-medium">
                {selectedFile ? selectedFile.name : "Upload your video"}
              </span>
              <span className="text-sm text-gray-500 mt-1">
                Drag and drop or click to select
              </span>
            </label>
          </div>

          <button
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-md font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed shadow-lg"
            disabled={!selectedFile}
            onClick={handleSubmit}
          >
            {isLoading ? "Processing..." : "Analyze My Answer"}
          </button>
        </div>

        {/* Transcribed Answer Display */}
        {res && (
          <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
              Your Transcribed Answer
            </h2>
            <div className="bg-gray-800/50 p-4 rounded-md border-l-4 border-blue-500">
              <p className="text-gray-300 whitespace-pre-wrap">{res}</p>
            </div>

            {isFeedbackLoading && (
              <div className="mt-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-300">
                  Getting AI feedback...
                </span>
              </div>
            )}
          </div>
        )}

        {/* Feedback Display */}
        {feedbackData && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800 overflow-hidden relative">
              {/* Score Badge */}
              <div className="absolute top-4 right-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse">
                  <span className="text-white text-xl font-bold">
                    {JSON.parse(feedbackData).score}/100
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-6">
                AI Feedback
              </h2>

              <div className="space-y-6">
                <div className="animate-in fade-in slide-in-from-left-5 duration-300 delay-100">
                  <h3 className="text-lg font-medium text-blue-400 mb-2">
                    Overall Assessment
                  </h3>
                  <p className="text-gray-300 bg-gray-800/50 p-4 rounded-md border-l-4 border-blue-500">
                    {JSON.parse(feedbackData).feedback}
                  </p>
                </div>

                <div className="animate-in fade-in slide-in-from-left-5 duration-300 delay-200">
                  <h3 className="text-lg font-medium text-yellow-400 mb-2">
                    Missing Points
                  </h3>
                  <p className="text-gray-300 bg-gray-800/50 p-4 rounded-md border-l-4 border-yellow-500">
                    {JSON.parse(feedbackData).missing_points}
                  </p>
                </div>

                <div className="animate-in fade-in slide-in-from-left-5 duration-300 delay-300">
                  <h3 className="text-lg font-medium text-green-400 mb-2">
                    Suggestions
                  </h3>
                  <p className="text-gray-300 bg-gray-800/50 p-4 rounded-md border-l-4 border-green-500">
                    {JSON.parse(feedbackData).suggestions}
                  </p>
                </div>

                <div className="animate-in fade-in slide-in-from-left-5 duration-300 delay-400">
                  <h3 className="text-lg font-medium text-purple-400 mb-2">
                    Correct Answer
                  </h3>
                  <p className="text-gray-300 bg-gray-800/50 p-4 rounded-md border-l-4 border-purple-500">
                    {JSON.parse(feedbackData).correct_answer}
                  </p>
                </div>

                <div className="animate-in fade-in slide-in-from-left-5 duration-300 delay-500">
                  <h3 className="text-lg font-medium text-pink-400 mb-2">
                    Resources
                  </h3>
                  <div
                    className="text-gray-300 bg-gray-800/50 p-4 rounded-md border-l-4 border-pink-500"
                    dangerouslySetInnerHTML={{
                      __html: JSON.parse(feedbackData).resources?.replace(
                        /\[(.*?)\]\((.*?)\)/g,
                        '<a href="$2" target="_blank" class="text-blue-400 hover:underline">$1</a>'
                      ),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audio conversion button */}
        {feedbackData && (
          <button
            className="w-full mt-6 bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-4 rounded-md font-medium hover:from-green-700 hover:to-teal-700 transition-all disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-300"
            onClick={handleConvertAllToSpeech}
          >
            {isSpeechLoading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                Converting to Speech...
              </span>
            ) : (
              "Listen to Feedback"
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Interview;
