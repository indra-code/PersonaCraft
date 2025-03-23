from getAudioFeatures import getAudioFeatures
from getPostureFeatures import getPostureFeatures
from getEmotionFeatures import getEmotionFeatures
from getLanguageAnalysis import getLangAnalysis
from backend.getLangAnalTrain import getLangTrain
import os
from flask import Flask,request,jsonify,send_file,Response
from flask_restful import Api,Resource
from flask_cors import CORS
from werkzeug.utils import secure_filename
import torch
import subprocess
from langflow_report import run_flow
from langflow_qa import run_flow_qa
import json
import cv2
import mediapipe as mp
import numpy as np
import time
import threading
import logging
from getLivePosture import getAngle, getPosture, getSpineAngle, draw_landmarks_with_thresholds, process_video

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

print(f"CUDA available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"CUDA device: {torch.cuda.get_device_name(0)}")
else:
    print("Running on CPU mode")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow any origin for testing
api = Api(app)

# Global variable to store the latest frame for live posture
global_frame = [None]  # Using a list to make it mutable
last_frame_time = time.time()

def generate_frames():
    logger.info("Starting frame generation")
    last_frame = None
    frame_count = 0
    
    while True:
        try:
            current_time = time.time()
            
            if global_frame[0] is not None:
                # Use the latest frame
                frame = global_frame[0]
                last_frame = frame
                frame_count += 1
                
                # Log occasional status updates
                if frame_count % 100 == 0:
                    logger.info(f"Streamed {frame_count} frames")
                
                # Encode and yield the frame
                ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
                if not ret:
                    logger.error("Failed to encode frame")
                    if last_frame is not None:
                        # Try with the last successful frame as fallback
                        ret, buffer = cv2.imencode('.jpg', last_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
                        if not ret:
                            continue
                    else:
                        continue
                
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                      b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                
                # Adaptive rate control - adjust delay based on processing time
                process_time = time.time() - current_time
                if process_time < 0.03:  # Target ~30 fps
                    time.sleep(max(0, 0.03 - process_time))
            else:
                if time.time() - last_frame_time > 5:
                    logger.warning("No frames received for 5 seconds")
                    last_frame_time = time.time()
                time.sleep(0.1)
        except Exception as e:
            logger.error(f"Error in generate_frames: {e}")
            time.sleep(0.1)

# Direct route for video feed
@app.route('/video_feed')
def video_feed():
    logger.info("Video feed endpoint accessed")
    return Response(generate_frames(),
                   mimetype='multipart/x-mixed-replace; boundary=frame')

# Route to serve the test HTML page
@app.route('/test_camera')
def test_camera():
    logger.info("Test camera page accessed")
    return send_file('test_camera.html')

# For compatibility with existing code, keep the RESTful resource
class LivePosture(Resource):
    def get(self):
        logger.info("LivePosture resource accessed")
        return Response(generate_frames(),
                      mimetype='multipart/x-mixed-replace; boundary=frame')

# Initialize camera and start video processing thread
def initialize_camera():
    logger.info("Initializing camera and starting video thread")
    try:
        # Import here to avoid circular imports
        from getLivePosture import process_video
        
        # Start video processing in a separate thread
        video_thread = threading.Thread(target=process_video, args=(global_frame,))
        video_thread.daemon = True
        video_thread.start()
        logger.info("Video processing thread started successfully")
    except Exception as e:
        logger.error(f"Error initializing camera: {e}")

UPLOAD_FOLDER = os.path.join(os.getcwd(),'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER,exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

class Video(Resource):
    def post(self):
        try:
            subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
            print(request.files)
            if 'video' not in request.files:
                return jsonify({'Error':'Video not received'})
            video_file = request.files['video']
            filename = secure_filename(video_file.filename)
            input_video_path = os.path.join(UPLOAD_FOLDER, filename)
            video_file.save(input_video_path)
            print(input_video_path)
            audio_features = getAudioFeatures(input_video_path)
            print('Audio Features Extracted: ',audio_features)
            posture_features = getPostureFeatures(input_video_path)
            print('Posture Features Extracted: ',posture_features)
            emotion_features = getEmotionFeatures(input_video_path)
            print('Emotion Features Extracted: ',emotion_features)
            language_features = getLangAnalysis(input_video_path)
            print('Language Features Extracted',language_features)
            features_output = {
                "Audio Features": audio_features,
                "Posture Features": posture_features,
                "Emotion Features": emotion_features,
                "Language Features": language_features
            }
            features_output = json.dumps(features_output)
            env = "An online interview with a company CEO"
            report = run_flow(message='Use the features provided in the input to make your analysis',features=features_output,environment=env)
            return jsonify(report)
        except Exception as e:
            print(f"Error processing request: {str(e)}")
            return jsonify({'Error': str(e)})

class TTS(Resource):
    def post(self):
        try:
            if 'report' not in request.form:
                return jsonify({'Error':'Report not received'})
            
            report_text = request.form['report']
            
            import sys
            import os
            
            current_dir = os.getcwd()
            if current_dir not in sys.path:
                sys.path.append(current_dir)
            
            from getTTS import get_audio
            
            audio_path = get_audio(report_text)
            
            return send_file(audio_path, as_attachment=True,download_name="speech.wav", mimetype="audio/wav")
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"Error processing TTS request: {str(e)}")
            print(f"Detailed error: {error_details}")
            return jsonify({'Error': str(e), 'Details': error_details})
        
class QA(Resource):
    def post(self):
        try:
            if 'question' not in request.form:
                return jsonify({'Error':'Question not received'})
            question = request.form['question']
            user_answer = request.form['user_answer']
            response = run_flow_qa(message='Execute',question=question,user_answer=user_answer)
            return jsonify(response)
        except Exception as e:
            print(f"Error processing qa response")
            return jsonify({'Error':str(e)})

class GetLang(Resource):
    def post(self):
        try:
            if 'video' not in request.files:
                return jsonify({'Error':'Video not received'})
            video_file = request.files['video']
            filename = secure_filename(video_file.filename)
            input_video_path = os.path.join(UPLOAD_FOLDER, filename)
            video_file.save(input_video_path)
            print(input_video_path)
            response = getLangAnalysis(input_video_path)
            return jsonify(response['original_text'])
        except Exception as e:
            print(f"Error processing lang analysis")
            return jsonify({'Error':str(e)})
        
class GetLangTrain(Resource):
    def post(self):
        try:
            if 'audio' not in request.files:
                return jsonify({'Error':'Audio not received'})
            audio_file = request.files['audio']
            filename = secure_filename(audio_file.filename)
            print(filename)
            input_audio_path = os.path.join(UPLOAD_FOLDER, filename)
            audio_file.save(input_audio_path)
            print(input_audio_path)
            print("Audio file saved, running getLangTrain")
            response = getLangTrain(input_audio_path)
            return jsonify(response)
        except Exception as e:
            print(f"Error processing language training analysis")
            return jsonify({'Error': str(e)})


api.add_resource(Video,'/upload')
api.add_resource(TTS, '/tts') 
api.add_resource(QA,'/qa')
api.add_resource(GetLang,'/getlang')
api.add_resource(LivePosture, '/live_posture')
api.add_resource(GetLangTrain,'/getlangtrain')

if __name__ == '__main__':
    try:
        initialize_camera()
        
        print("Starting Flask server on port 5000...")
        app.run(debug=True, use_reloader=False, host="0.0.0.0", port=5000)
    except Exception as e:
        print(f"Error starting server: {e}")



