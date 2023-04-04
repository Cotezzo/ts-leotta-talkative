from TTS.api import TTS

# Running a single speaker model

# Init and run TTS with the target model name
tts = TTS(model_name="tts_models/it/mai_female/glow-tts", progress_bar=False, gpu=False)
tts.tts_to_file(text="Vediamo che voce hai", file_path="./out/TTS/test.wav")


'''
# Running a multi-speaker and multi-lingual model

# List available 🐸TTS models and choose the first one
model_name = TTS.list_models()[0]

# Init TTS
tts = TTS(model_name)

# Run TTS
# ❗ Since this model is multi-speaker and multi-lingual, we must set the target speaker and the language
# Text to speech with a numpy output
wav = tts.tts("This is a test! This is also a test!!", speaker=tts.speakers[0], language=tts.languages[0])

# Text to speech to a file
tts.tts_to_file(text="Hello world!", speaker=tts.speakers[0], language=tts.languages[0], file_path="output.wav")
'''


'''
# Example voice cloning with YourTTS in English, French and Portuguese:
tts = TTS(model_name="tts_models/multilingual/multi-dataset/your_tts", progress_bar=False, gpu=True)
tts.tts_to_file("This is voice cloning.", speaker_wav="my/cloning/audio.wav", language="en", file_path="output.wav")
tts.tts_to_file("C'est le clonage de la voix.", speaker_wav="my/cloning/audio.wav", language="fr", file_path="output.wav")
tts.tts_to_file("Isso é clonagem de voz.", speaker_wav="my/cloning/audio.wav", language="pt", file_path="output.wav")
'''