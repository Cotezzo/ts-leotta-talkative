### Description
Discord bot that can listen to your voice, chat with ChatGPT (GPT-3) and read aloud the reply in the voice chat, also transcribing your conversation in the text channel.

### Components used
- voice-recognition: [openai-whisper](https://github.com/openai/whisper) implemented with a Python script (can run on GPU)
- chatbot: a ChatGPT mirror, [poe](https://poe.com), implemented without actual APIs but with some scraping
- voice-synthesis: old fashioned [Google-Translate](https://translate.google.com) scraping

### Usage
To install all the required dependancies listed in the package.json
```
npm install
```

To run the bot in "test" mode for developing purposes
```
npm test
```

To transpile the ts code to js and run it
```
npm build
npm start
```

### Enviroment variables
A .env file is required for the bot to run, it must contain:
- ENV: 'P' or 'T' (PRODUCTION or TEST)
- PROD_KEY: your final bot secrey key
- TEST_KEY: your test bot secret key (if you need one)

- PREFIX: string the bot uses to find your commands in the chat (command example: $listen)
- VERSION: bot version
- LOG_LEVEL: DEBUG | INFO | WARN | ERROR (logging isn't too detailed for now, just leave it at DEBUG)

- POE_LOGIN_COOKIE: Your login cookie generated once you logged in poe.com (from F12)
- POE_COMPLETE_CHANNEL: Url param "generated" and sent to the backend in various requests (from F12)
- POE_CHAT_ID: Chat identifier generated and sent to the backend when posting a message (from F12)
