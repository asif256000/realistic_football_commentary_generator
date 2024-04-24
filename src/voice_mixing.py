import os
from pydub import AudioSegment

# The file path to the resources folder
resources_file_path = "/Users/shreyas/Workspace/VT/Capstone/realistic_football_commentary_generator/resources" 
# Selected match ids to generate audio
match_ids = ["G29Np7eA/", "StRC9O3T/", "2J6xgTqs/"]
sound2 = AudioSegment.from_file(f"{resources_file_path}/audio/base_voice/stadium_full.wav")

for match_id in match_ids:
    if not os.path.exists(f"{resources_file_path}/audio/combined_audio/{match_id[:-1]}"):
        os.makedirs(f"{resources_file_path}/audio/combined_audio/{match_id[:-1]}")
    for file in os.listdir(f"{resources_file_path}/audio/final_audio/{match_id[:-1]}"):
        sound1 = AudioSegment.from_file(f"{resources_file_path}/audio/final_audio/{match_id[:-1]}/{file}")
        combined = sound1.overlay(sound2)
        combined.export(f"{resources_file_path}/audio/combined_audio/{match_id[:-1]}/{file[:-4]}_combined.wav", format='wav')
