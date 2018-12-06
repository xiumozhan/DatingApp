import { ChatMessage } from './chat-message';
import { User } from './user';

export interface MessageThread {
    user: User;
    latestMessage?: ChatMessage;
    unreadMessageCount: number;
}
