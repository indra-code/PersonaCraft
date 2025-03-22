import cv2
from deepface import DeepFace
import json
import sys
def emotion_func(video_path):
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise IOError("Cannot open video file")

    faceCascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    emotions_data = {}
    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        try:
            result = DeepFace.analyze(frame, actions=['emotion'])
            dominant_emotion = result[0]['dominant_emotion']
        except:
            dominant_emotion = "No Face Detected"

        emotions_data[f"frame_{frame_count}"] = dominant_emotion
        frame_count += 1

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = faceCascade.detectMultiScale(gray, 1.1, 4)

    cap.release()
    return emotions_data


def getEmotionFeatures(videoPath):
    data = emotion_func(videoPath)
    total_frames = len(data)  # Total frames processed
    emotion_counts = {}

    # Count occurrences of each emotion
    for emotion in data.values():
        if emotion not in emotion_counts:
            emotion_counts[emotion] = 0
        emotion_counts[emotion] += 1

    # Convert counts to percentages
    emotion_percentages = {emotion: (count / total_frames) * 100 for emotion, count in emotion_counts.items()}
    return json.dumps(emotion_percentages)

#print(getEmotionFeatures(r'C:\Users\swain\Downloads\face2\face2\fardeen.mp4'))