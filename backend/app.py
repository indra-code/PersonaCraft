from getAudioFeatures import getAudioFeatures
from getPostureFeatures import getPostureFeatures
from getEmotionFeatures import getEmotionFeatures
from getLanguageAnalysis import getLangAnalysis
import os
from flask import Flask,request,jsonify,send_file
from flask_restful import Api,Resource
from werkzeug.utils import secure_filename
import torch
import subprocess
from langflow_report import run_flow
from langflow_qa import run_flow_qa
import json
print(f"CUDA available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"CUDA device: {torch.cuda.get_device_name(0)}")
else:
    print("Running on CPU mode")
app = Flask(__name__)
api = Api(app)
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
api.add_resource(Video,'/upload')
api.add_resource(TTS, '/tts') 
api.add_resource(QA,'/qa')
if __name__ == '__main__':
    app.run(debug=True,use_reloader=False,host="0.0.0.0", port=5000)