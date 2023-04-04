export default interface ChatMessage {
    message_type: string;
    payload: {
        unique_id: string;
        subscription_name: string;
        data: {
            messageAdded: {
                id: string;
                messageId: number;
                creationTime: number;
                state: "complete" | "incomplete";
                text: string;
                author: "human" | "chinchilla" | string;
                linkifiedText: string;
                contentType: string;
                suggestedReplies: string[];
                vote?: any;             // ??
                voteReason?: any;       // ??
                chat: {
                    chatId: number;
                    defaultBotNickname: string;
                    id: string;
                }
            }
        }
    }
}