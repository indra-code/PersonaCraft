import subprocess
import json
import torch
import re
from gramformer import Gramformer
import os
from getAudioFeatures import getAudio


def set_seed(seed):
  torch.manual_seed(seed)
  if torch.cuda.is_available():
    torch.cuda.manual_seed_all(seed)


def contains_filler(word_list):
    filler_words = {"[*]", "hmm", "uhh", "um", "uh", "like", "you know"}
    return [word for word in word_list if word["text"].lower() in filler_words]


def process_language_train(path):
    try:
        print("Running language processing")
        wav_path = os.path.join('uploads', os.path.splitext(os.path.basename(path))[0] + '.wav')
        print("Checking if file exists:", wav_path)
        if not os.path.exists(wav_path):
            print("File does not exist, running getAudio...")
            getAudio(path)
        audioPath = os.path.abspath(os.path.join('uploads',os.path.splitext(os.path.basename(path))[0]+'.wav'))
        print('Audio path for lang analysis:',audioPath)
        device = "cuda" if torch.cuda.is_available() else "cpu"
        use_gpu = torch.cuda.is_available()
        gf = Gramformer(models=1, use_gpu=use_gpu)
        try:
            process = subprocess.Popen(
                ['python', '-c', f"import whisper_timestamped as whisper; model = whisper.load_model('tiny', device='{device}'); audio = whisper.load_audio(r'{audioPath}'); result = whisper.transcribe(model, audio, language='en', detect_disfluencies=True, vad='silero'); import json; print(json.dumps(result))"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                stdin=subprocess.PIPE
            )
            output, error = process.communicate()
            if error:
                print(f"Error during transcription: {error.decode()}")
            result = json.loads(output.decode())
            text = result['text']
            corrected_text = ''
            filtered_words = [contains_filler(segment["words"]) for segment in result["segments"]]
            filtered_words = [word for word_list in filtered_words for word in word_list] 
            print("Grammar Check...")
            grammar_list = []
            highlight_list = []
            parsed_sentences = re.split(r'(?<=[.!?])\s+', text)
            print(len(parsed_sentences))
            for sentence in parsed_sentences:
                corrected_sentences = gf.correct(sentence,max_candidates=1)
                for corrected_sentence in corrected_sentences:
                    grammar_list.append({'original':sentence,'corrected':corrected_sentence})
                corrected_text = corrected_text+corrected_sentences.pop()
                highlight_list.append(gf.highlight(sentence,corrected_sentence))
            #print(f"highlighted text: \n {highlight_list}")
            output_json = {
                "original_text": text,
                "filler_words": {
                    "count": len(filtered_words),
                    "wordlist": filtered_words
                },
                "corrections": grammar_list,
                "highlight_list": highlight_list
            }
            print(output_json)
            return output_json
        except Exception as e:
            print(f"Error during transcription: {e}")
            return {"error": str(e)}
    except Exception as e:
        print(f"Error initializing models: {e}")
        raise


def getLangTrain(path):
    set_seed(1212)
    print("Running getLangTrain")
    train_language_features = process_language_train(path)
    return train_language_features

