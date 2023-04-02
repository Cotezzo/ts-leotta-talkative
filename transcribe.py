import whisper
import sys

model = whisper.load_model("tiny.en")
whisper.DecodingOptions(language="it")
result = model.transcribe(sys.argv[1])

print( result["text"] )