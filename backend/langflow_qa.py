# Note: Replace **<YOUR_APPLICATION_TOKEN>** with your actual Application token


import json
import requests
from dotenv import load_dotenv
import os
load_dotenv()
question = "What is the difference between compilation and interpretation?Also explain the use of branching in version control."
user_answer = "compilation means running the code and interpreting means translating the code into another language."

BASE_API_URL = "https://api.langflow.astra.datastax.com"
LANGFLOW_ID = os.getenv('LANGFLOW_ID')
FLOW_ID = os.getenv('FLOW_ID')
APPLICATION_TOKEN = os.getenv('LANGFLOW_API_KEY')
ENDPOINT = "question_answer" 


def run_flow_qa(message: str,question,user_answer,
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
    "TextInput-LwCyh": {
        "input_value": question
    },
    "Prompt-6YCzn": {
        "template": "You are an AI evaluator that checks if a user's answer is correct by comparing it with a reference answer from a document.You are given the question asked to an interviewee and the answer given by the the interviewee as input.Use retrieval augmented generation(RAG) to retreive the relevant answer to the question from the document.Check the similarity between the user's response(user_answer) and the response you got from the document using RAG(retrieved_answer).\nEvaluate the user's answer for correctness, completeness, and relevance.\nProvide a similarity score from 0 to 100 and a short justification.\nYour response should be in a json format and should consist of the following fields:\njson(\n\"score\":\"\"\n\"feedback\":\"<brief explanation of why this score was given>\"\n\"missing_points\":\"<if applicable,consists of key details missing in the user's answer compared to the retrieved answer>\"\n\"suggestions\":\"\"<what improvements should the user enforce to better his/her answer>\"\n\"resources\":\"<Provide the necessary references or materials the user should consult to accurately answer the question. Make sure to provide links to every resource>\"\n\"correct_answer\":\"<a comprehensive correct answer to the question asked based on the retrieved_answer>\"\n)\n\nEvaluation Criteria:\n\n1)Factual Accuracy – Is the user's answer factually correct?\n2)Completeness – Does the user's answer cover all key points in the reference answer?\n3)Relevance – Is the response focused on answering the question?\n\nquestion = {question}\nretrieved_answer={retrieved_answer}\nuser_answer = {user_answer}",
        "tool_placeholder": "",
        "question": "",
        "retrieved_answer": "",
        "user_answer": ""
    },
    "TextInput-fS3js": {
      "input_value": user_answer
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
#     res = run_flow_qa('Execute')
#     res = res['outputs'][0]['outputs'][0]['results']['text']['text']
#     print(res)
#     with open('res1.json','w') as f:
#         json.dump(res,f,indent=4)

