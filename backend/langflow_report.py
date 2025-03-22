import json
import requests
from dotenv import load_dotenv
import os
# features = '''
# {
#     "Audio Features": "{\"gender\": \"female\", \"pronunciation_posteriori_probability_score_percentage\": 90.09, \"number_of_syllables\": 117.0, \"rate_of_speech(syllables/second)\": 3.0, \"articulation_rate(syllables/second)\": 5.0, \"speaking_duration(seconds)\": 23.3, \"original_duration(seconds)\": 35.9, \"balance\": 0.6, \"f0_mean(Hertz)\": 196.52, \"f0_std(Hertz)\": 29.51, \"f0_median(Hertz)\": 193.5, \"f0_min(Hertz)\": 80.0, \"f0_max(Hertz)\": 384.0, \"f0_quantile25(Hertz)\": 25.0, \"f0_quantile75(Hertz)\": 179.0, \"nisqa_score\": 2.809978, \"number_of_long_pauses\": 1, \"durations_of_pauses\": [\"19.0241\"]}",
#     "Posture Features": "{\"video_info\": {\"path\": \"C:\\\\work\\\\BITSH\\\\backend\\\\uploads\\\\videoplayback_1.mp4\", \"duration_seconds\": 35.8, \"fps\": 30.0, \"total_frames\": 1074}, \"thresholds\": {\"max_head_tilt_degrees\": 110.0, \"min_head_tilt_degrees\": 90.0, \"shoulder_tilt_pixels\": 20.0, \"spine_angle_degrees\": 171.0}, \"frame_statistics\": {\"total_frames_analyzed\": 1074, \"head_tilt_up_percentage\": 42.923649906890134, \"head_tilt_down_percentage\": 0.931098696461825, \"shoulder_tilt_percentage\": 12.290502793296088, \"spine_angle_percentage\": 0.8379888268156425}, \"gesture_statistics\": {\"good_gestures_percentage\": 0.0, \"poor_gestures_percentage\": 44.878957169459966, \"no_gestures_percentage\": 55.121042830540034}, \"hand_dominance\": {\"left_hand_percentage\": 46.97110904007455, \"right_hand_percentage\": 12.115563839701771, \"both_hands_percentage\": 40.91332712022367}}",
#     "Emotion Features": "{\"happy\": 46.55493482309125, \"neutral\": 21.22905027932961, \"fear\": 0.8379888268156425, \"sad\": 4.376163873370578, \"surprise\": 0.186219739292365, \"angry\": 0.0931098696461825, \"No Face Detected\": 26.722532588454378}",
#     "Language Features": {
#         "original_text": " Hi, I'm Zamayata Gongkur and 19 years old, I stand 5 feet 4 inches tall. I can speak English and Hindi both of these languages, fluent here and apart from the American also speak some French and basic Marathi as well. My current location is Mumbai and these are my preference. Thank you.",
#         "filler_words": {
#             "count": 1,
#             "wordlist": [
#                 {
#                     "text": "[*]",
#                     "start": 15.64,
#                     "end": 15.68,
#                     "confidence": 0.0
#                 }
#             ]
#         },
#         "corrected_text": "Hi, I'm Zamayata Gongkur and 19 years old, I stand 5 feet 4 inches tall.I can speak English and Hindi both of these languages, fluent here and apart from the American I also speak some French and basic Marathi as well.My current location is Mumbai and these are my preference.Thank you.",
#         "corrections": [
#             {
#                 "original": " Hi, I'm Zamayata Gongkur and 19 years old, I stand 5 feet 4 inches tall.",
#                 "corrected": "Hi, I'm Zamayata Gongkur and 19 years old, I stand 5 feet 4 inches tall."
#             },
#             {
#                 "original": "I can speak English and Hindi both of these languages, fluent here and apart from the American also speak some French and basic Marathi as well.",
#                 "corrected": "I can speak English and Hindi both of these languages, fluent here and apart from the American I also speak some French and basic Marathi as well."
#             },
#             {
#                 "original": "My current location is Mumbai and these are my preference.",
#                 "corrected": "My current location is Mumbai and these are my preference."
#             },
#             {
#                 "original": "Thank you.",
#                 "corrected": "Thank you."
#             }
#         ]
#     }
# }
# '''
# environment= "An online interview with a company CEO"
load_dotenv()
BASE_API_URL = "https://api.langflow.astra.datastax.com"
LANGFLOW_ID = os.getenv('LANGFLOW_ID')
FLOW_ID = os.getenv('FLOW_ID')
APPLICATION_TOKEN = os.getenv('LANGFLOW_API_KEY')
ENDPOINT = "report" 

def run_flow(message: str,features,environment,
  output_type: str = "chat",
  input_type: str = "chat",) -> dict:
    """
    Run a flow with a given message and optional tweaks.

    :param message: The message to send to the flow
    :param endpoint: The ID or the endpoint name of the flow
    :param tweaks: Optional tweaks to customize the flow
    :return: The JSON response from the flow
    """
    TWEAKS = {
        "TextInput-7RLDX": {
            "input_value": features
        },
        "Prompt-HARxq": {
            "template": "You are an expert and friendly communication coach who specializes in providing the right exercises which help a user overcome their weaknesses in communication,posture,enotion and grammar.\nYou are encouraging and supportive and at the same time guide the user's in the right direction to self improvement.\nYou are given a detailed analysis of the user's speech which includes audio features,posture features,emotion features and language(grammar) features which have been extracted from a video of the user talking.They include the following features:\n1. *Audio Features* - Information about pronunciation, speech rate, articulation, balance, pitch (f0 mean, median, min, max), NISQA score, and long pauses.\n2. *Posture Features* - Details about head tilt, shoulder tilt, spine angle, gesture statistics, and hand dominance.\n3. *Emotion Features* - Detection of various emotions such as neutral, happy, fear, sad, angry, and instances where no face was detected.\n4. *Language Features* - Original text, detected filler words represented by [*], corrected text, and text corrections.\nMake sure to take into complete consideration the environment the user is planning to speak in while analyzing these features and suggesting improvements.Different environment will require different pitch,posture and emotion.The environment will be given to you as input.\nYour job is to suggest *exercises to correct mistakes* wherever applicable. These exercises should be tailored to the user's weaknesses. Suggest solid exercises on your own as much as possible, include references to external sources if referring to any.It is okay to suggest other applications,books,etc as long as their appropriate references are included.They should be tailored to the user's speaking environment.\nMake sure to also provide a brief summary of the user's speech in a friendly and encouraging tone which gives the user an overview of his/her speech including both strengths and weaknesses.\nThe conclusion should be encouraging to the user towards self impovement.\nThe How to improve section should contain how the user can overcome the respective weakness.This section can be commmunicated in a strict and point-to-point manner.\n\nThe output must be structured in the following JSON format and should be directly addressing the user:\njson(\n    \"Summary\":\"\"\n    \"Strengths\": \"\"\n    \"Weaknesses\":(\n        \"Weakness\":\n        \"How to improve\":\n    )\n    \"Conclusion\":\n)\nMake sure to NOT to add special characters like \\n in any of the output, instead just the new sentence in a new line.\nEnsure that the suggestions are practical, easy to understand, and personalized. Explain how improvements in each aspect can contribute to a more engaging, confident, and effective performance.Make sure to be specific while addressing the weaknesses,let the user know the value of their weakness.Do not include any special symbols like '*' in your output.\n\nInput:\n\nEnvironment: {environment}\nDetailed Analysis: {detailed_analysis}\n",
            "tool_placeholder": "",
            "environment": environment
        },
    }
    api_url = f"{BASE_API_URL}/lf/{LANGFLOW_ID}/api/v1/run/{ENDPOINT}"

    payload = {
        "input_value": message,
        "output_type": output_type,
        "input_type": input_type,
    }
    headers = None
    if TWEAKS:
        payload["tweaks"] = TWEAKS
    if APPLICATION_TOKEN:
        headers = {"Authorization": "Bearer " + APPLICATION_TOKEN, "Content-Type": "application/json"}
    response = requests.post(api_url, json=payload, headers=headers)
    response = response.json()
    return response['outputs'][0]['outputs'][0]['results']['text']['text']

# if __name__ == "__main__":
#     res = run_flow("Use the features provided in the input to make your analysis")
#     res = res['outputs'][0]['outputs'][0]['results']['text']['text']
#     print(res)
#     with open('res.json','w') as f:
#         json.dump(res,f,indent=4)