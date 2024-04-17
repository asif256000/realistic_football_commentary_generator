from TTS.api import TTS

from deep_translator import GoogleTranslator


# Commentators:
# 1. Peter Drury
# 2. Vicki Sparks
# 3. Darren Fletcher



# text = "That was an incredible finish by Cristiano Ronaldo!"



# tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC")
# tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2")

# tts.tts_to_file(text="That was an incredible finish by Ronaldo!")

tts = TTS(model_name="tts_models/multilingual/multi-dataset/your_tts", progress_bar=False)


voices = ["peter", "vicki", "darren"]
languages = ["en", "fr", "pt"]


parent_text = "The action kicked off early in the 2nd minute with Hamburg's Mladen Petric attempting a shot from the left side of the box, assisted by Gokhan Tore. Unfortunately for Hamburg, the shot went high and wide, setting the tone for a match filled with attempts on goal. Dortmund responded in kind, with Shinji Kagawa missing a shot to the top right corner in the 14th minute, following a key pass from Mario Gotze."
# french_text = GoogleTranslator(source='auto', target='fr').translate(text)
# portuguese_text = GoogleTranslator(source='auto', target='pt').translate(text)

for voice in voices:
    for language in languages:
        text = GoogleTranslator(source='auto', target=language).translate(parent_text)
         
        if language == "fr":
            tts.tts_to_file(text, speaker_wav=f"{voice}_final.mp3", language="fr-fr", file_path=f"{voice}_{language}.wav")
        elif language == "pt":
            tts.tts_to_file(text, speaker_wav=f"{voice}_final.mp3", language="pt-br", file_path=f"{voice}_{language}.wav")
        else:
            tts.tts_to_file(text, speaker_wav=f"{voice}_final.mp3", language="en", file_path=f"{voice}_{language}.wav")




# tts.tts_to_file(french_text, speaker_wav="peter_final.mp3", language="fr-fr", file_path="french_try.wav")
# tts.tts_to_file(portuguese_text, speaker_wav="peter_final.mp3", language="pt-br", file_path="portuguese_try.wav")