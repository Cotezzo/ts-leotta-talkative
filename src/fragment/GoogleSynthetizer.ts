import axios from "axios";
import { Readable } from "stream";
import { Logger } from "../logging/Logger";
import CombinedStream from "combined-stream";

const synthetize = async (text: string, language: string): Promise<Readable> => {
    const chunkedText: RegExpMatchArray = text.match(/.{1,200}/g) as RegExpMatchArray;
    const streams: Readable[] = [];

    var combinedStream = CombinedStream.create();
    for(const chunk of chunkedText)
        combinedStream.append(await synthetizeChunk(chunk, language));

    return combinedStream;
}

// Returns a stream that contains the synthetized audio
const synthetizeChunk = async (text: string, language: string): Promise<Readable> => {
    const parsedText: string = encodeURIComponent(text.toLowerCase());
    Logger.debug(`Urlencoded text for google: ${text} (${parsedText.length})`);
    const audioURL = `https://translate.google.com/translate_tts?ie=UTF-8&q=${parsedText}&tl=${language}&client=tw-ob&ttsspeed=1`;
    return (await axios.get(audioURL, { responseType: 'stream' })).data;
}

export default synthetize;