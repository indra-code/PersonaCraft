"use client";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import React, { useState, useRef, useCallback } from "react";

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

const ScreenRecorder = () => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recording, setRecording] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeechLoading, setIsSpeechLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaParts = useRef([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // Clear the mediaParts array before starting a new recording
      mediaParts.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Store stream reference to stop tracks later
      streamRef.current = stream;

      // Display webcam preview
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current
          .play()
          .catch((err) => console.error("Error playing preview:", err));
      }

      const recorder = new MediaRecorder(stream, { mimeType: "video/mp4" });
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

        // Stop all tracks when recording is complete
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };
      recorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  }, [mediaRecorder]);

  const handleAIReview = async () => {
    if (!mediaUrl) return;

    try {
      setIsAnalyzing(true);

      // Convert Blob URL to File object
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const file = new File([blob], `screen-recording-${Date.now()}.mp4`, {
        type: "video/mp4",
      });

      // Create FormData and append the file
      const formData = new FormData();
      formData.append("video", file);

      // Send to backend
      const analysisResponse = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await analysisResponse.json();
      setAnalysisResult(data);
    } catch (error) {
      console.error("Error analyzing video:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConvertAllToSpeech = async () => {
    if (!analysisResult) return;

    const analysisData = JSON.parse(analysisResult);
    const textToConvert = `
      Summary: ${analysisData.Summary}
      Strengths: ${analysisData.Strengths}
      Weaknesses: ${analysisData.Weaknesses.map(
        (w: Weakness) => w.Weakness + ": " + w["How to improve"]
      ).join(". ")}
      Conclusion: ${analysisData.Conclusion}
    `;

    // Use the handleConvert logic from TextToSpeech component
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
        Screen & Audio Recorder
      </h1>

      <div className="max-w-4xl w-full space-y-8">
        <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Record Your Screen and Audio
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
                  : "Ready to record"}
              </span>
            </p>
          </div>

          <div className="mb-6 rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
            {recording ? (
              <video
                ref={videoPreviewRef}
                className="w-full h-auto aspect-video"
                muted
                playsInline
              />
            ) : mediaUrl ? (
              <video
                src={mediaUrl}
                controls
                className="w-full h-auto aspect-video"
              />
            ) : (
              <div className="w-full aspect-video flex items-center justify-center bg-gray-800 text-gray-500">
                <p>No recording available</p>
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            {!recording && (
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
          </div>
          <div className="flex space-x-4 justify-center items-center mt-5">
            <button
              onClick={handleAIReview}
              className={`flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-md font-medium transition-all shadow-lg flex items-center justify-center ${
                !mediaUrl
                  ? "opacity-50 cursor-not-allowed from-gray-600 to-gray-700"
                  : "hover:from-blue-700 hover:to-purple-700"
              }`}
              disabled={!mediaUrl || isAnalyzing}
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                  Analyzing...
                </span>
              ) : (
                "Get AI Review"
              )}
            </button>
          </div>
        </div>

        {mediaUrl && (
          <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
              Recording Complete
            </h2>

            <div className="mt-4">
              <button
                onClick={handleConvertAllToSpeech}
                disabled={isSpeechLoading}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-4 rounded-md font-medium hover:from-green-700 hover:to-teal-700 transition-all shadow-lg flex items-center justify-center"
              >
                {isSpeechLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                ) : (
                  "Get Audio Report"
                )}
              </button>
              {audioUrl && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Generated Audio:
                  </h3>
                  <audio
                    ref={audioRef}
                    controls
                    className="w-full"
                    src={audioUrl}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    If audio doesn't play automatically, click the play button
                    above.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {analysisResult && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                Summary
              </h2>
              <p className="text-gray-300">
                {JSON.parse(analysisResult)?.Summary}
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                Strengths
              </h2>
              <p className="text-gray-300">
                {JSON.parse(analysisResult)?.Strengths}
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                Areas for Improvement
              </h2>
              <div className="space-y-4">
                {JSON.parse(analysisResult)?.Weaknesses[0] &&
                  JSON.parse(analysisResult)?.Weaknesses.map(
                    (weakness: any, index: number) => (
                      <Accordion
                        type="single"
                        collapsible
                        className="w-full bg-gray-800/50 rounded-lg overflow-hidden"
                      >
                        <AccordionItem
                          value={weakness.Weakness}
                          className="border-b border-gray-700 last:border-0"
                        >
                          <AccordionTrigger className="hover:bg-gray-800/70 px-4 py-4 transition-all">
                            <span className="text-gray-200 font-medium">
                              {weakness.Weakness}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 py-3 text-gray-400">
                            {weakness["How to improve"]}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )
                  )}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                Conclusion
              </h2>
              <p className="text-gray-300">
                {JSON.parse(analysisResult)?.Conclusion}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenRecorder;
