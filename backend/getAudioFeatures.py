import subprocess
import os
import json
import re
import librosa
import soundfile as sf
import contextlib
import io
mysp = __import__("my-voice-analysis")
def getAudio(videofile):
    command_to_extract_audio  = [
        'ffmpeg',
        '-i',videofile,
        '-vn',
        '-acodec', 'pcm_s16le', 
        os.path.join('uploads',os.path.splitext(os.path.basename(videofile))[0]+'.wav')
    ]
    subprocess.run(command_to_extract_audio,stderr=subprocess.PIPE,stdout = subprocess.DEVNULL)
    print('Succesfully got audio')
    return;
def getTimes(audiofile):
    command_to_detect_silence = [
        'ffmpeg',
        '-i',
        audiofile,
        '-af',
        'silencedetect=n=-20dB:d=1.5',
        '-f',
        'null',
        '-'
    ]
    output = subprocess.run(
        command_to_detect_silence,stderr=subprocess.PIPE,stdout=subprocess.DEVNULL,text=True
    )
    ls = []
    start = re.findall('silence_start:\s*([\d.]+)',output.stderr)
    end = re.findall('silence_end:\s*([\d.]+)',output.stderr)
    durations = re.findall('silence_duration:\s*([\d.]+)',output.stderr)
    for i in range(len(start)):
        ls.append([start[i],end[i],durations[i]])
    print(ls)
    return durations
def getNISQAScore(audioFile):
    print(audioFile)
    command = [
    "python", "-Wignore", "uploads/NISQA/run_predict.py",
    "--mode", "predict_file",
    "--pretrained_model", "uploads/NISQA/weights/nisqa_mos_only.tar",
    "--deg", audioFile
    ]
    result = subprocess.run(command,capture_output=True,text=True)
    output = re.findall('.wav\s*([\d.]+)',result.stdout)
    return output
def convert_audio_file(input_file, path,temp_name):
    print("entered conversion function")
    y, s = librosa.load(f"{path}/{input_file}", sr=44100)

    if len(y) % 2 == 1:
        y = y[:-1]

    y = y * 32767 / max(abs(y))
    y = y.astype('int16')

    sf.write(f"{path}/{temp_name}", y, s, "PCM_24")

def analyze_audio_file(audio_file,path,temp_name):
    print("entered analyze")
    convert_audio_file(audio_file,path,temp_name)
    print("finished conversion")
    with io.StringIO() as buf, contextlib.redirect_stdout(buf):
        mysp.mysptotal(temp_name[:-4], path)
        mysp.mysppron(temp_name[:-4], path)
        mysp.myspgend(temp_name[:-4], path)
        captured_output = buf.getvalue()
        os.remove(f"{path}/{temp_name}")
        gender = re.findall('a\s*(Male|female)',captured_output)
        gender = gender[0] if gender else 'Unknown'
        p_score = re.findall('Pronunciation_posteriori_probability_score_percentage= :\s*([\d.]+)',captured_output)
        numbers = [float(num) for num in re.findall(r"\d+\.\d+|\d+", captured_output) if num != "0"]
        return {
            "gender": gender,
            "pronunciation_posteriori_probability_score_percentage": float(p_score[0]),
            "number_of_syllables": numbers[0],
            "rate_of_speech(syllables/second)": numbers[2],
            "articulation_rate(syllables/second)": numbers[3],
            "speaking_duration(seconds)": numbers[4],
            "original_duration(seconds)": numbers[5],
            "balance": numbers[6],
            "f0_mean(Hertz)": numbers[7],
            "f0_std(Hertz)": numbers[8],
            "f0_median(Hertz)": numbers[9],
            "f0_min(Hertz)": numbers[10],
            "f0_max(Hertz)": numbers[11],
            "f0_quantile25(Hertz)": numbers[12],
            "f0_quantile75(Hertz)": numbers[13],
        }
def getAudioFeatures(videoPath):
    wav_path = os.path.join('uploads', os.path.splitext(os.path.basename(videoPath))[0] + '.wav')
    print("Checking if file exists:", wav_path)
    
    if not os.path.exists(wav_path):
        print("File does not exist, running getAudio...")
        getAudio(videoPath)
    fullPath = os.path.abspath(videoPath)
    folderPath = os.path.dirname(fullPath)
    print(fullPath)
    print(os.path.splitext(os.path.basename(videoPath))[0])
    print(folderPath)
    audio_features = analyze_audio_file(os.path.splitext(os.path.basename(videoPath))[0]+'.wav',folderPath,'temp.wav')
    #print(audio_features)
    nisqa_score = getNISQAScore(os.path.join(folderPath,os.path.splitext(os.path.basename(videoPath))[0]+'.wav'))
    number_of_pauses = getTimes(os.path.join(folderPath,os.path.splitext(os.path.basename(videoPath))[0]+'.wav'))
    audio_features['nisqa_score'] = float(nisqa_score[0])
    audio_features['number_of_long_pauses'] = len(number_of_pauses)
    audio_features['durations_of_pauses'] = sorted(number_of_pauses,reverse=True)
    print(audio_features)
    audio_features_json = json.dumps(audio_features)
    # with open('audio_features.json','w') as f:
    #     json.dump(audio_features,f,indent=4)
    return audio_features_json
# getAudioFeatures(r'C:\BITSH\backend\uploads\video4.mp4')

