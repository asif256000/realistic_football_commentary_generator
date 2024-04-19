# import wave
# import numpy as np
# # load two files you'd like to mix
# fnames =["./output_eng.wav", "./stadium.wav"]
# wavs = [wave.open(fn) for fn in fnames]
# frames = [w.readframes(w.getnframes()) for w in wavs]
# # here's efficient numpy conversion of the raw byte buffers
# # '<i2' is a little-endian two-byte integer.
# samples = [np.frombuffer(f, dtype='<i2') for f in frames]
# samples = [samp.astype(np.float64) for samp in samples]
# # mix as much as possible
# n = min(map(len, samples))
# mix = samples[0][:n] + samples[1][:n]
# # Save the result
# mix_wav = wave.open("./mix.wav", 'w')
# mix_wav.setparams(wavs[0].getparams())
# # before saving, we want to convert back to '<i2' bytes:
# mix_wav.writeframes(mix.astype('<i2').tobytes())
# mix_wav.close()


from pydub import AudioSegment
# import librosa

# length_commentary = librosa.get_duration(filename='eng_try.wav')
# print(length_commentary)

# data, sr = librosa.load("stadium_full.wav", sr=None, mono=False)
# trimmed = librosa.util.fix_length(data, size=int(sr * length_commentary))
# # librosa.output.write_wav("background.wav", trimmed, sr)
# import soundfile as sf
# sf.write('background.wav', trimmed, sr) # Error in writing the trimmed file



# voices = ["peter", "vicki", "darren"]
# languages = ["en", "fr", "pt"]

voices = ["peter"]
languages = ["en"]

sound2 = AudioSegment.from_file("base_voice/stadium_full.wav")

for voice in voices:
    for language in languages:
        sound1 = AudioSegment.from_file(f"{voice}_{language}.wav")
        combined = sound1.overlay(sound2)
        combined.export(f"{voice}_{language}_combined.wav", format='wav')






# sound1 = AudioSegment.from_file("vicki_en.wav")

# combined = sound1.overlay(sound2)
# combined2 = sound1.overlay(combined)

# combined2.export("sample.wav", format='wav')



# sound1 = AudioSegment.from_file("portuguese_try.wav")

# combined = sound1.overlay(sound2)
# combined.export("combined_final_portuguese.wav", format='wav')
