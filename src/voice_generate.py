import inflect
import re
import os
import json
from TTS.api import TTS
from deep_translator import GoogleTranslator

# Commentators:
# 1. Peter Drury
# 2. Vicki Sparks
# 3. Darren Fletcher

# voices = ["peter", "vicki", "darren"]
# languages = ["en", "fr", "pt"]

# The file path to the resources folder
resources_file_path = "/Users/shreyas/Workspace/VT/Capstone/realistic_football_commentary_generator/resources" 

# TTS model initialization and voices and languages supported
tts = TTS(model_name="tts_models/multilingual/multi-dataset/your_tts", progress_bar=False)
voices = ["peter", "vicki"]
languages = ["en", "fr"]

# Selected match ids to generate audio
match_ids = ["G29Np7eA/", "StRC9O3T/", "2J6xgTqs/"]

def replace_numbers_with_words(sentence):
    p = inflect.engine()
    words = sentence.split()
    for i in range(len(words)):
        if words[i].isdigit():
            words[i] = p.number_to_words(words[i])
            # For "2-2", we want to retain the hyphen, so we'll split and replace each part individually
            if "-" in words[i]:
                words[i] = "-".join([p.number_to_words(part) if part.isdigit() else part for part in words[i].split("-")])
        elif re.match(r'\d+(st|nd|rd|th)', words[i]):  # Check if the word contains ordinal numbers like "42nd"
            ordinal = re.search(r'\d+(st|nd|rd|th)', words[i]).group()
            words[i] = words[i].replace(ordinal, p.ordinal(p.number_to_words(ordinal)))
        elif "-" in words[i]:
            words[i] = "-".join([p.number_to_words(part) if part.isdigit() else part for part in words[i].split("-")])
    return ' '.join(words)


def generate_audio(match_id, paragraph_id, paragraph):
    paragraph = replace_numbers_with_words(paragraph)
    for voice in voices:
        for language in languages:
            text = GoogleTranslator(source='auto', target=language).translate(paragraph)
            if language == "fr":
                tts.tts_to_file(text, speaker_wav=f"{resources_file_path}/audio/base_voice/{voice}_final.mp3", 
                                language="fr-fr", 
                                file_path=f"{resources_file_path}/audio/final_audio/{match_id}/{voice}_{language}_{paragraph_id}.wav")
            # elif language == "pt":
            #     tts.tts_to_file(text, speaker_wav=f"base_voice/{voice}_final.mp3", language="pt-br", file_path=f"{voice}_{language}.wav")
            else:
                tts.tts_to_file(text, speaker_wav=f"{resources_file_path}/audio/base_voice/{voice}_final.mp3", 
                                language="en", 
                                file_path=f"{resources_file_path}/audio/final_audio/{match_id}/{voice}_{language}_{paragraph_id}.wav")


def get_commentary_from_file(file_path):
    with open(f"{file_path}/generated_summaries.json", "r") as f:
        data = json.load(f)
    
    for match_id in data:
        # Only selecting some games for creating limited audio files
        if match_id not in match_ids:
            continue
        if not os.path.exists(f"{resources_file_path}/audio/final_audio/{match_id[:-1]}"):
            os.makedirs(f"{resources_file_path}/audio/final_audio/{match_id[:-1]}")

        paragraphs = data[match_id].split("\n\n")
        for paragraph_id in range(len(paragraphs)):
            # Slicing the match_id to get rid of the "/" at the end
            generate_audio(match_id[:-1], paragraph_id, paragraphs[paragraph_id])
    
if __name__ == "__main__":
    get_commentary_from_file(resources_file_path)