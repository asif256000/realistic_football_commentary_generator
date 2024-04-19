from TTS.api import TTS
import inflect
import re
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


# voices = ["peter", "vicki", "darren"]
# languages = ["en", "fr", "pt"]

# voices = ["peter", "vicki"]
# languages = ["en", "fr"]

voices = ["peter"]
languages = ["en"]


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


parent_text = "The first half continues to be intense as Messi scores for Barcelona in the 42nd minute, putting them level with Real Madrid. The teams head into halftime with a 2-2 scoreline."
parent_text = replace_numbers_with_words(parent_text)

# portuguese_text = GoogleTranslator(source='auto', target='pt').translate(text)

for voice in voices:
    for language in languages:
        text = GoogleTranslator(source='auto', target=language).translate(parent_text)
         
        if language == "fr":
            tts.tts_to_file(text, speaker_wav=f"base_voice/{voice}_final.mp3", language="fr-fr", file_path=f"{voice}_{language}.wav")
        # elif language == "pt":
        #     tts.tts_to_file(text, speaker_wav=f"base_voice/{voice}_final.mp3", language="pt-br", file_path=f"{voice}_{language}.wav")
        else:
            tts.tts_to_file(text, speaker_wav=f"base_voice/{voice}_final.mp3", language="en", file_path=f"{voice}_{language}.wav")




# tts.tts_to_file(french_text, speaker_wav="peter_final.mp3", language="en", file_path="checkout.wav")
# tts.tts_to_file(portuguese_text, speaker_wav="peter_final.mp3", language="pt-br", file_path="portuguese_try.wav")


'''
Welcome to today's thrilling match between two Spanish giants, Real Madrid and Barcelona, at the Santiago Bernabeu Stadium. The atmosphere is electric as fans are on the edge of their seats for this highly anticipated clash.

The game started with a bang as Neymar opens the scoring for Barcelona in the 7th minute with a precise shot into the top right corner, assisted by Iniesta. Real Madrid quickly responds with Benzema equalizing in the 20th minute, heading in a cross from Di Maria. Benzema becomes a key player, scoring again in the 24th minute, this time with a right-footed shot at the bottom right corner from another Di Maria cross.

The first half continues to be intense as Messi scores for Barcelona in the 42nd minute, putting them level with Real Madrid. The teams head into halftime with a 2-2 scoreline.

The second half sees Cristiano Ronaldo converting a penalty in the 55th minute to put Real Madrid in the lead. However, the game takes a turn when Sergio Ramos receives a red card in the 63rd minute, leaving Real Madrid with 10 men.

Barcelona capitalizes on the numerical advantage, with Messi scoring his second goal from the penalty spot in the 65th minute to level the score at 3-3. The game reaches its climax when Messi completes his hat-trick in the 84th minute, putting Barcelona in the lead with a stunning goal in the top right corner.

Despite a late push from Real Madrid, including a missed opportunity by Alexis Sanchez in the 90th minute, Barcelona holds on to claim a 4-3 victory in this dramatic El Clasico showdown.

The away team, Barcelona, emerges victorious in a thrilling encounter, showcasing their attacking prowess and resilience. The individual brilliance of players like Messi and Iniesta proved to be decisive in securing the win, while Real Madrid will be ruing missed opportunities, especially after going down to 10 men.

That's all from the Santiago Bernabeu tonight, where Barcelona takes home the bragging rights in this intense battle of Spanish giants!
'''
