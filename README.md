# PersonaCraft

## Overview
This SaaS platform empowers users to enhance both their speech and non-verbal communication skills through an integrated analysis of video and audio inputs. The system provides real-time feedback, leveraging cutting-edge AI technologies to improve verbal clarity, pronunciation, posture, and overall body language.

## Key Features

### 1. *Multimodal Data Capture*
- Records high-quality video and audio to capture the complete spectrum of a user's performance.
- Ensures detailed analysis of speech, facial expressions, gestures, and posture.

### 2. *Language Analysis*
- Uses *Whisper-Timestamp* for accurate transcriptions and timestamped speech analysis.
- Integrates *Gramformer* to perform grammar correction and refine verbal communication.
- Detects and highlights filler words to improve speech fluency.

### 3. *Audio Analysis*
- Utilizes *NISQA* for a detailed audio-level analysis.
- Evaluates speech intelligibility, pronunciation quality, and pitch variations.
- Provides actionable insights to improve vocal performance and clarity.

### 4. *Non-Verbal Communication Evaluation*
- Employs *MediaPipe* to analyze key non-verbal cues:
  - Posture
  - Facial expressions
  - Hand gestures
- Generates insights to improve overall body language and engagement.

### 5. *Actionable Insights via LLM & Langflow*
- Leverages *large language models (LLMs)* and *Langflow* to transform analytical data into personalized feedback.
- Provides clear, structured recommendations to enhance communication skills.

### 6. *RAG-Based Answer Comparison*
- Uses *Retrieval-Augmented Generation (RAG)* to compare user responses with company-specific questions stored in a vector database.
- Helps users align their answers with organizational expectations, making it highly useful for interview and corporate training purposes.

### 7. *Training Module*
- Provides personalized training to correct user weaknesses.
- Includes exercises such as:
  - *Posture correction* for better presence.
  - *Voice exercises* to improve pronunciation, tone, and pitch modulation.
  - *Non-verbal communication drills* to enhance confidence and clarity.

### 8. *Robust SaaS Infrastructure*
- Implements *secure user authentication* and *subscription management*.
- Integrates *Supabase* for database management.
- Supports *payment gateway integration* for seamless user experience.

## Getting Started
1. Sign Up – Create an account on the platform.
2. Record or Upload a Video – Submit a video for analysis.
3. Receive AI-Generated Feedback – Get detailed insights into speech and body language.
4. Follow Personalized Training – Improve through structured exercises and recommendations.
5. Track progress over time with the training module.

## Tech Stack
- *Speech Analysis*: Whisper-Timestamp, Gramformer
- *Audio Processing*: NISQA
- *Non-Verbal Analysis*: MediaPipe
- *AI & NLP*: LLMs, Langflow, RAG
- *Backend*: Supabase, FastAPI,AstraDB
- *Frontend*: React, Tailwind CSS


This platform serves as an all-in-one solution for individuals and organizations aiming to refine communication skills through AI-driven insights and training. 
