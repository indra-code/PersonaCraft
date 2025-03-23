"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Training = () => {
  const [activeSection, setActiveSection] = useState("posture");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (activeSection === "posture") {
      const img = videoRef.current;
      if (img) {
        setIsLoading(true);
        setError(null);
        
        // Add error handling for the image load
        img.onload = () => {
          setIsLoading(false);
        };
        
        img.onerror = () => {
          setError("Failed to connect to video feed. Please ensure the Python server is running.");
          setIsLoading(false);
        };

        img.src = "http://localhost:5000/video_feed";
      }
    }
  }, [activeSection]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-8 bg-gray-900">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-8 text-center">
        Interview Training Center
      </h1>

      <div className="max-w-6xl w-full space-y-8">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveSection("posture")}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              activeSection === "posture"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-200 hover:bg-gray-600"
            }`}
          >
            Posture Training
          </button>
          <button
            onClick={() => setActiveSection("speech")}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              activeSection === "speech"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-200 hover:bg-gray-600"
            }`}
          >
            Speech Training
          </button>
          <button
            onClick={() => setActiveSection("gestures")}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              activeSection === "gestures"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-200 hover:bg-gray-600"
            }`}
          >
            Gesture Training
          </button>
        </div>

        {activeSection === "posture" && (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                Practice Your Posture
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Reference Posture */}
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      src="/sitting_posture_analysis_looping.gif"
                      alt="Reference Posture"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: 'center' }}
                      unoptimized={true}
                      width={1280}
                      height={720}
                      
                    />
                  </div>
                  <div className="absolute top-0 right-0 bg-black bg-opacity-50 p-2 m-2 rounded">
                    <p className="text-green-400 text-sm font-medium">Reference: Good Posture</p>
                  </div>
                </div>

                {/* Live Feed */}
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-white">Loading camera feed...</p>
                    </div>
                  )}
                  {error && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-red-500 text-center p-4">{error}</p>
                    </div>
                  )}
                  <img
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    alt="Posture Analysis Feed"
                  />
                  <div className="absolute top-0 right-0 bg-black bg-opacity-50 p-2 m-2 rounded">
                    <p className="text-white text-sm font-medium">Your Posture</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-gray-400 text-sm">
                  Compare your posture with the reference image. The AI will analyze your posture in real-time and highlight areas that need adjustment in red.
                </p>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                Proper Interview Posture Guide
              </h2>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="shoulders" className="border-b border-gray-700">
                  <AccordionTrigger className="hover:bg-gray-800/70 px-4 py-4 transition-all">
                    <span className="text-gray-200 font-medium">Shoulder Posture</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 text-gray-400">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Keep your shoulders relaxed and pulled back slightly</li>
                      <li>Avoid hunching forward or raising your shoulders toward your ears</li>
                      <li>Maintain equal height for both shoulders</li>
                      <li>Your shoulders should form a straight line when viewed from the front</li>
                      <li>This posture conveys confidence and attentiveness</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="head" className="border-b border-gray-700">
                  <AccordionTrigger className="hover:bg-gray-800/70 px-4 py-4 transition-all">
                    <span className="text-gray-200 font-medium">Head Position</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 text-gray-400">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Keep your chin parallel to the floor</li>
                      <li>Avoid tilting your head down (appears disengaged) or up (appears arrogant)</li>
                      <li>Face the interviewer directly when speaking</li>
                      <li>Maintain a neutral neck position to prevent strain</li>
                      <li>Occasional nodding shows active listening</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="hands" className="border-b border-gray-700">
                  <AccordionTrigger className="hover:bg-gray-800/70 px-4 py-4 transition-all">
                    <span className="text-gray-200 font-medium">Hand Placement</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 text-gray-400">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Rest hands comfortably on the table or in your lap</li>
                      <li>Keep gestures within the frame of your body</li>
                      <li>Use open palm gestures to appear honest and open</li>
                      <li>Avoid fidgeting, tapping, or playing with objects</li>
                      <li>Moderate hand gestures can emphasize points, but don't overdo it</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="back" className="border-b border-gray-700">
                  <AccordionTrigger className="hover:bg-gray-800/70 px-4 py-4 transition-all">
                    <span className="text-gray-200 font-medium">Back and Sitting Position</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 text-gray-400">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Sit with your back straight but not rigid</li>
                      <li>Lean slightly forward to show engagement</li>
                      <li>Keep your lower back supported against the chair</li>
                      <li>Feet should be flat on the floor</li>
                      <li>Avoid slouching or leaning too far back (appears too casual)</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-800">
                <h3 className="text-blue-400 font-medium mb-2">Pro Tips:</h3>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>• Practice your posture in front of a mirror regularly</li>
                  <li>• Record yourself in mock interviews to identify issues</li>
                  <li>• Good posture not only looks better but helps you breathe properly and reduces anxiety</li>
                  <li>• Remember that proper posture helps you appear confident even when you're nervous</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeSection === "speech" && (
          <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
              Speech Training
            </h2>
            <p className="text-gray-300">
              Speech training module coming soon. This section will help you practice your vocal tone, pace, clarity, and eliminate filler words.
            </p>
          </div>
        )}

        {activeSection === "gestures" && (
          <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
              Gesture Training
            </h2>
            <p className="text-gray-300">
              Gesture training module coming soon. This section will help you practice appropriate hand gestures and body language for interviews.
            </p>
          </div>
        )}

        <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800 mt-8">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Why Posture Matters in Interviews
          </h2>
          <p className="text-gray-300 mb-4">
            Research shows that interviewers form 60% of their impression within the first 15 seconds of meeting you. Your posture communicates confidence, professionalism, and attention to detail before you even begin speaking.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-blue-400 font-medium mb-2">Psychological Impact</h3>
              <p className="text-gray-400 text-sm">
                Good posture actually changes your hormone levels, increasing testosterone and decreasing cortisol, helping you feel more confident and less stressed.
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-blue-400 font-medium mb-2">Interviewer Perception</h3>
              <p className="text-gray-400 text-sm">
                Interviewers associate upright posture with leadership qualities, attention to detail, and higher competence levels.
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-blue-400 font-medium mb-2">Physical Benefits</h3>
              <p className="text-gray-400 text-sm">
                Proper posture improves breathing, reduces fatigue, and helps you think more clearly during challenging interview questions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Training;
