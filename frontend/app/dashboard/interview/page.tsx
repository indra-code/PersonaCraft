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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedQuestion, setSelectedQuestion] = useState<string>(
    questions[0]
  );
  const [feedbackData, setFeedbackData] = useState<FeedbackResponse | null>(
    null
  );
  const [allFeedback, setAllFeedback] = useState<
    { question: string; feedback: FeedbackResponse }[]
  >([]);
  const [interviewComplete, setInterviewComplete] = useState<boolean>(false);
  const [randomQuestions, setRandomQuestions] = useState<string[]>([]);

  // Webcam recording states
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recording, setRecording] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const mediaParts = useRef<BlobPart[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Add a new state for camera preview
  const [showPreview, setShowPreview] = useState(false);

  // Initialize with 3 random questions
  useEffect(() => {
    const getRandomQuestions = () => {
      const shuffled = [...questions].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 3);
    };

    const randomQs = getRandomQuestions();
    setRandomQuestions(randomQs);
    setSelectedQuestion(randomQs[0]);
  }, []);

  // Add a function to initialize camera preview
  const initializeCamera = async () => {
    try {
      if (streamRef.current) {
        // If there's already a stream, use it
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = streamRef.current;
          videoPreviewRef.current
            .play()
            .catch((err) => console.error("Error playing preview:", err));
        }
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Store stream reference
      streamRef.current = stream;

      // Display webcam preview
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current
          .play()
          .catch((err) => console.error("Error playing preview:", err));
      }

      setShowPreview(true);
    } catch (error) {
      console.error("Error initializing camera:", error);
    }
  };

  // Initialize camera when component mounts
  useEffect(() => {
    initializeCamera();

    // Cleanup function to stop tracks when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Reset states when a new file is selected
      setResponse(null);
      setFeedbackData(null);
    }
  };

  // Start webcam recording - modify to use existing stream
  const startRecording = async () => {
    try {
      // Clear the mediaParts array before starting a new recording
      mediaParts.current = [];

      // If we don't have a stream yet, initialize it
      if (!streamRef.current) {
        await initializeCamera();
      }

      if (!streamRef.current) {
        throw new Error("Failed to initialize camera");
      }

      const recorder = new MediaRecorder(streamRef.current, {
        mimeType: "video/mp4",
      });
      setMediaRecorder(recorder);
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          mediaParts.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(mediaParts.current, { type: "video/mp4" });
        const url = URL.createObjectURL(blob);
        setMediaUrl(url);

        // Create a File object from the Blob
        const file = new File([blob], `interview-recording-${Date.now()}.mp4`, {
          type: "video/mp4",
        });
        setSelectedFile(file);
      };
      recorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  // Stop webcam recording
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const fetchVideoTranscription = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("video", selectedFile);
    const response = await fetch("http://localhost:5000/getlang", {
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
    formData.append("user_answer", userAnswer);
    formData.append("question", selectedQuestion);

    const response = await fetch("http://localhost:5000/qa", {
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

          // Store this feedback with the question
          const newFeedbackItem = {
            question: selectedQuestion,
            feedback: feedbackResult,
          };

          setAllFeedback((prev) => [...prev, newFeedbackItem]);
        }
      }
    } catch (error) {
      console.error("Process error:", error);
    } finally {
      setIsLoading(false);
      setIsFeedbackLoading(false);
    }
  };

  const handleNextQuestion = () => {
    // Clear current states
    setSelectedFile(null);
    setResponse(null);
    setFeedbackData(null);

    // Move to next question
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < randomQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedQuestion(randomQuestions[nextIndex]);
    } else {
      // Interview is complete
      setInterviewComplete(true);
    }
  };

  const handleRestartInterview = () => {
    // Reset everything
    setSelectedFile(null);
    setResponse(null);
    setFeedbackData(null);
    setAllFeedback([]);
    setInterviewComplete(false);
    setCurrentQuestionIndex(0);

    // Get new random questions
    const newRandomQuestions = [...questions]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    setRandomQuestions(newRandomQuestions);
    setSelectedQuestion(newRandomQuestions[0]);
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
        {!interviewComplete ? (
          <>
            {/* Question Progress */}
            <div className="bg-gray-900 rounded-lg shadow-xl p-4 border border-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">
                  Question {currentQuestionIndex + 1} of{" "}
                  {randomQuestions.length}
                </span>
                <div className="w-2/3 bg-gray-800 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full"
                    style={{
                      width: `${
                        ((currentQuestionIndex + 1) / randomQuestions.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Question Display */}
            <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                Interview Question
              </h2>

              <div className="w-full bg-gray-800 border border-gray-700 rounded-md p-4 text-gray-200 mb-4">
                <p>{selectedQuestion}</p>
              </div>

              <p className="text-gray-300 mb-4">
                Record yourself answering this question using the webcam below.
              </p>
            </div>

            {/* Webcam Recording Section */}
            <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                Record Your Answer
              </h2>

              <div className="flex items-center mb-4">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    recording ? "bg-red-500 animate-pulse" : "bg-gray-600"
                  }`}
                ></div>
                <p className="text-gray-300">
                  Status:{" "}
                  <span className="font-medium">
                    {recording
                      ? "Recording in progress"
                      : mediaUrl
                      ? "Recording complete"
                      : showPreview
                      ? "Ready to record"
                      : "Initializing camera..."}
                  </span>
                </p>
              </div>

              <div className="mb-6 rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
                <video
                  ref={videoPreviewRef}
                  src={mediaUrl || undefined}
                  className="w-full h-auto aspect-video"
                  controls={!!mediaUrl}
                  muted={!mediaUrl}
                  playsInline
                />
              </div>

              <div className="flex space-x-4">
                {!recording && !mediaUrl && (
                  <button
                    onClick={startRecording}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-md font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center"
                  >
                    Start Recording
                  </button>
                )}

                {recording && (
                  <button
                    onClick={stopRecording}
                    className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-4 rounded-md font-medium hover:from-red-700 hover:to-pink-700 transition-all shadow-lg flex items-center justify-center"
                  >
                    Stop Recording
                  </button>
                )}

                {mediaUrl && !recording && (
                  <>
                    <button
                      onClick={() => {
                        setMediaUrl(null);
                        setSelectedFile(null);
                      }}
                      className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-md font-medium hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg flex items-center justify-center"
                    >
                      Record Again
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-md font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                          Analyzing...
                        </span>
                      ) : (
                        "Analyze My Answer"
                      )}
                    </button>
                  </>
                )}
              </div>
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

            {/* Next Question Button */}
            {feedbackData && (
              <button
                className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 px-4 rounded-md font-medium hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-300"
                onClick={handleNextQuestion}
              >
                {currentQuestionIndex < randomQuestions.length - 1
                  ? "Next Question"
                  : "Complete Interview"}
              </button>
            )}
          </>
        ) : (
          /* Interview Complete - Show Summary */
          <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-6 text-center">
              Interview Complete!
            </h2>

            <div className="space-y-8">
              <p className="text-gray-300 text-center mb-6">
                You've completed all {randomQuestions.length} questions. Here's
                a summary of your performance:
              </p>

              <Accordion type="single" collapsible className="w-full">
                {allFeedback.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-gray-200 hover:text-blue-400">
                      Question {index + 1}: {item.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 p-4 bg-gray-800/30 rounded-md">
                        <div>
                          <h3 className="text-blue-400 font-medium">Score</h3>
                          <p className="text-gray-300">
                            {JSON.parse(item.feedback).score}/100
                          </p>
                        </div>
                        <div>
                          <h3 className="text-blue-400 font-medium">
                            Feedback
                          </h3>
                          <p className="text-gray-300">
                            {JSON.parse(item.feedback).feedback}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-blue-400 font-medium">
                            Suggestions
                          </h3>
                          <p className="text-gray-300">
                            {JSON.parse(item.feedback).suggestions}
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <button
                className="w-full mt-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-md font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                onClick={handleRestartInterview}
              >
                Start New Interview
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Audio player */}
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} controls className="mt-4" />
      )}
    </div>
  );
};

export default Interview;
