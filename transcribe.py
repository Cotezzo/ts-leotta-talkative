import whisper
import sys

model = whisper.load_model("tiny.en")
result = model.transcribe(sys.argv[1]) # language="it"

print( result["text"] )