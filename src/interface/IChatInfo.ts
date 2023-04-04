export default interface IChatInfo {
    formkey: string;
    tchannelData: {
        minSeq: string;
        channel: string;
        channelHash: string;
        boxName: string;
        baseHost: string;
        targetUrl: string;
        enableWebsocket: boolean;
    }
}