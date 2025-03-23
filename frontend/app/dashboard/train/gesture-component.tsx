"use client";

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const GestureTraining = () => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
          Practice Your Body Language
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Reference Video */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <iframe
                src="https://www.youtube.com/embed/U1O3UFeCEeU?si=JRwmoDcag61hVnTK&amp;start=14"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Body Language Training Video"
              ></iframe>
            </div>
            <div className="absolute top-0 right-0 bg-black bg-opacity-50 p-2 m-2 rounded">
              <p className="text-green-400 text-sm font-medium">Reference: Professional Body Language</p>
            </div>
          </div>

          {/* Practice Tips */}
          <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden flex flex-col p-4">
            <h3 className="text-lg font-medium text-white mb-2">Practice Checklist</h3>
            <div className="overflow-y-auto text-gray-300 text-sm space-y-3 pr-2">
              <div className="flex items-start">
                <div className="h-5 w-5 rounded-full border border-blue-500 flex-shrink-0 flex items-center justify-center mt-0.5 mr-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                </div>
                <p>Set up a mirror or record yourself to observe your gestures and expressions</p>
              </div>
              <div className="flex items-start">
                <div className="h-5 w-5 rounded-full border border-blue-500 flex-shrink-0 flex items-center justify-center mt-0.5 mr-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                </div>
                <p>Practice holding eye contact with an object for 3-5 seconds at a time</p>
              </div>
              <div className="flex items-start">
                <div className="h-5 w-5 rounded-full border border-blue-500 flex-shrink-0 flex items-center justify-center mt-0.5 mr-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                </div>
                <p>Stand with feet shoulder-width apart, weight balanced evenly</p>
              </div>
              <div className="flex items-start">
                <div className="h-5 w-5 rounded-full border border-blue-500 flex-shrink-0 flex items-center justify-center mt-0.5 mr-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                </div>
                <p>Practice open-palm gestures to emphasize key points</p>
              </div>
              <div className="flex items-start">
                <div className="h-5 w-5 rounded-full border border-blue-500 flex-shrink-0 flex items-center justify-center mt-0.5 mr-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                </div>
                <p>Practice purposeful movement by marking spots to move between</p>
              </div>
              <div className="flex items-start">
                <div className="h-5 w-5 rounded-full border border-blue-500 flex-shrink-0 flex items-center justify-center mt-0.5 mr-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                </div>
                <p>Eliminate fidgeting habits by practicing with hands relaxed</p>
              </div>
            </div>
            <div className="absolute top-0 right-0 bg-black bg-opacity-50 p-2 m-2 rounded">
              <p className="text-white text-sm font-medium">Practice Guide</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-gray-400 text-sm">
            Watch the reference video and practice your body language using the tips below. Body language can significantly impact how interviewers perceive your professionalism and confidence.
          </p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
          Professional Body Language Guide
        </h2>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="eye-contact" className="border-b border-gray-700">
            <AccordionTrigger className="hover:bg-gray-800/70 px-4 py-4 transition-all">
              <span className="text-gray-200 font-medium">Eye Contact Techniques</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-3 text-gray-400">
              <p className="mb-3">Eye contact is one of the most powerful forms of nonverbal communication, signaling confidence, trustworthiness, and engagement.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><span className="text-blue-400 font-medium">Maintain Engaging Eye Contact</span> – Focus on one person at a time while speaking, whether addressing an audience or an interviewer. Hold their gaze for the length of a thought, and naturally shift to someone else during pauses.</li>
                <li><span className="text-blue-400 font-medium">Avoid Distracting Eye Movements</span> – Refrain from rapidly scanning the room, looking at the ceiling, or glancing to the side, as this can signal uncertainty or a lack of confidence. Maintain steady, intentional eye contact.</li>
                <li>For video interviews, look directly at the camera when speaking to create the impression of eye contact.</li>
                <li>If maintaining eye contact makes you nervous, practice looking at the bridge of the nose or forehead.</li>
                <li>The 50/70 rule: maintain eye contact 50% of the time when speaking and 70% when listening.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="posture" className="border-b border-gray-700">
            <AccordionTrigger className="hover:bg-gray-800/70 px-4 py-4 transition-all">
              <span className="text-gray-200 font-medium">Posture and Stance</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-3 text-gray-400">
              <p className="mb-3">Your posture communicates your confidence level and attention to the interaction, even before you begin speaking.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><span className="text-blue-400 font-medium">Adopt a Stable Posture</span> – Stand or sit with your feet shoulder-width apart and avoid shifting excessively. Whether standing in front of an audience or sitting in an interview, minimize unnecessary movements that could appear nervous or unfocused.</li>
                <li><span className="text-blue-400 font-medium">Move with Purpose</span> – If you need to change position, do so deliberately. In speeches, walk to a new spot with confidence before resuming. In interviews, lean slightly forward to show engagement but avoid fidgeting.</li>
                <li>Keep your shoulders back and spine straight but not rigid.</li>
                <li>When seated, keep both feet flat on the floor or cross your legs at the ankles.</li>
                <li>Avoid leaning back too far (appears disinterested) or hunching forward (appears tense).</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="gestures" className="border-b border-gray-700">
            <AccordionTrigger className="hover:bg-gray-800/70 px-4 py-4 transition-all">
              <span className="text-gray-200 font-medium">Hand Gestures</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-3 text-gray-400">
              <p className="mb-3">Appropriate hand gestures can enhance your message and make your communication more dynamic and engaging.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><span className="text-blue-400 font-medium">Use Gestures for Emphasis</span> – Complement your words with natural hand movements. Open-palmed, symmetrical gestures can reinforce key points and make your message more engaging.</li>
                <li><span className="text-blue-400 font-medium">Maintain a Relaxed Hand Position</span> – When not using gestures, keep your hands naturally at your sides or on your lap. Avoid clasping them, putting them in pockets, or crossing your arms, as these can come across as defensive or closed-off.</li>
                <li>Keep gestures within the "gesture box" - the area from your shoulders to your waist, and not extending too far from your body.</li>
                <li>Match gesture size to your environment - smaller in interviews, larger when presenting to groups.</li>
                <li>Use precision gestures (thumb and forefinger close together) when discussing detailed or precise information.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="expressions" className="border-b border-gray-700">
            <AccordionTrigger className="hover:bg-gray-800/70 px-4 py-4 transition-all">
              <span className="text-gray-200 font-medium">Facial Expressions</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-3 text-gray-400">
              <p className="mb-3">Your facial expressions convey your emotions and level of interest, significantly impacting how your message is received.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Maintain appropriate facial expressions that match your message.</li>
                <li>Smile genuinely when greeting or when the topic is positive - a genuine smile involves the eyes (crow's feet).</li>
                <li>Avoid unconscious expressions like furrowed brows or tense jaw that signal stress.</li>
                <li>Practice "neutral-positive" expression for active listening - slight smile, relaxed face.</li>
                <li>Be aware that facial expressions are universal and harder to control than other body language.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="mirroring" className="border-b border-gray-700">
            <AccordionTrigger className="hover:bg-gray-800/70 px-4 py-4 transition-all">
              <span className="text-gray-200 font-medium">Mirroring Techniques</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-3 text-gray-400">
              <p className="mb-3">Subtle mirroring of others' body language can build rapport and show engagement in conversation.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Subtly mirror the posture, speaking pace, or energy level of your interviewer.</li>
                <li>If they lean forward, consider leaning forward slightly as well.</li>
                <li>Match their communication style without mimicking exact gestures.</li>
                <li>Adapt your energy level to the setting - more animated for high-energy environments, calmer for formal settings.</li>
                <li>Use this technique sparingly and naturally - obvious mirroring appears manipulative.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-800">
          <h3 className="text-blue-400 font-medium mb-2">Pro Tips:</h3>
          <ul className="text-gray-300 space-y-1 text-sm">
            <li>• Record your practice interview sessions to observe your body language objectively</li>
            <li>• Practice in front of a mirror to become aware of unconscious habits</li>
            <li>• Take deep breaths before important interactions to reduce tension in your body language</li>
            <li>• Remember that confident body language actually helps you feel more confident (psychological feedback)</li>
            <li>• Be authentic - aim for natural improvement rather than completely changing your style</li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
          Why Body Language Matters in Interviews
        </h2>
        <p className="text-gray-300 mb-4">
          Studies show that nonverbal cues account for 55% of first impressions, while verbal content accounts for only 7%. Your body language sends powerful signals about your confidence, competence, and how well you might fit into a team.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-blue-400 font-medium mb-2">Trust Building</h3>
            <p className="text-gray-400 text-sm">
              Research indicates that open body language with appropriate eye contact significantly increases perceptions of trustworthiness. Interviewers make unconscious judgments about integrity based on nonverbal cues.
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-blue-400 font-medium mb-2">Competence Signals</h3>
            <p className="text-gray-400 text-sm">
              Confident body language is directly associated with perceptions of competence. Even when qualifications are identical, candidates with stronger nonverbal skills are rated as more capable.
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-blue-400 font-medium mb-2">Cultural Alignment</h3>
            <p className="text-gray-400 text-sm">
              Hiring managers often assess whether you'll fit into the company culture. Your body language gives clues about your adaptability, stress management, and interpersonal style.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestureTraining; 