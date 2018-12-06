import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '../models/user';
import { ChatMessageService } from '../services/chat-message.service';
import { ChatMessage } from '../models/chat-message';
import { AuthService } from '../services/auth.service';
import { MessageThread } from '../models/message-thread';

@Component({
    selector: 'app-messages',
    templateUrl: './messages.component.html',
    styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit, AfterViewInit {
    messageThreads: Map<number, MessageThread> = new Map<number, MessageThread>();
    selectedUser: User;
    selectedUserAvatar: string;
    currentUser: User;
    currentUserAvatar: string;
    pendingMessageContent: string;
    messages: ChatMessage[];
    disableScrollBottom = false;
    @ViewChild('messageList', { read: ElementRef }) messageList: ElementRef;
    @ViewChildren('messageItem', { read: ElementRef }) messageItems: QueryList<ElementRef>;

    constructor(private route: ActivatedRoute, private messageService: ChatMessageService,
        private authService: AuthService) { }

    ngOnInit() {
        this.route.data.subscribe(data => {
            data['users'].result.forEach((user: User) => {
                this.messageThreads.set(user.id, { user: user, unreadMessageCount: 0 });
            });
        });
        this.currentUser = this.authService.currentUser;
        if (this.currentUser.avatar !== null) {
            this.currentUserAvatar = this.currentUser.avatar.url;
        }
        this.messageService.onMessageReceived().subscribe( (message: ChatMessage) => {
            this.processIncomingNewMessage(message);
        } );
    }

    private processIncomingNewMessage(message: ChatMessage) {
        let messageThread: MessageThread;
        let messageThreadKey: number;
        if (this.selectedUser.id === message.senderId) {
            messageThread = this.messageThreads.get(message.senderId);
            messageThreadKey = message.senderId;
            this.messages.push(message);
        } else {
            if (this.isSenderCurrentUser(message.senderId)) {
                messageThread = this.messageThreads.get(message.recipientId);
                messageThreadKey = message.recipientId;
                this.messages.push(message);
            } else {
                messageThread = this.messageThreads.get(message.senderId);
                messageThreadKey = message.senderId;
                messageThread.unreadMessageCount += 1;
            }
        }
        messageThread.latestMessage = message;
        this.messageThreads.set(messageThreadKey, messageThread);
    }

    ngAfterViewInit() {
        this.messageItems.changes.subscribe(element => {
            this.scrollToBottom();
        });
    }

    private scrollToBottom(): void {
        if (!this.disableScrollBottom) {
            try {
                this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
            } catch (err) {}
        }
    }

    onScroll(): void {
        const messageListElement = this.messageList.nativeElement;
        const isAtBottom = messageListElement.scrollHeight - messageListElement.scrollTop === messageListElement.clientHeight;
        if (isAtBottom) {
            this.disableScrollBottom = false;
        } else {
            this.disableScrollBottom = true;
        }
    }

    isSelected(user: User): boolean {
        if (this.selectedUser === undefined) {
            return false;
        }
        return user.id === this.selectedUser.id;
    }

    isSenderCurrentUser(userId: number): boolean {
        return userId === this.currentUser.id;
    }

    selectUserForConversation(user: User): void {
        if (this.selectedUser === undefined || user.id !== this.selectedUser.id) {
            this.selectedUser = user;
            if (this.selectedUser.avatar !== null) {
                this.selectedUserAvatar = this.selectedUser.avatar.url;
            } else {
                this.selectedUserAvatar = null;
            }
            this.pendingMessageContent = '';
            this.messages = [];
        }
    }

    sendMessage(): void {
        this.messageService.sendPrivateMessageToUser(this.selectedUser.id, this.pendingMessageContent);
        this.pendingMessageContent = '';
    }

    isFirstMessageOfTheDay(messageIndex: number): boolean {
        if (messageIndex === 0) {
            return true;
        }
        const currentMessageSendDate: Date = new Date(this.messages[messageIndex].messageSent);
        const previousMessageSendDate: Date = new Date(this.messages[messageIndex - 1].messageSent);
        return (currentMessageSendDate.getDate() !== previousMessageSendDate.getDate()) ||
            (currentMessageSendDate.getMonth() !== previousMessageSendDate.getMonth()) ||
            (currentMessageSendDate.getFullYear() !== previousMessageSendDate.getFullYear());
    }

    isDateWithinCurrentYear(dateTime: Date): boolean {
        const currentYear: number = new Date().getFullYear();
        const yearToCompare: number = new Date(dateTime).getFullYear();
        return yearToCompare === currentYear;
    }

    hasUnreadMessage(thread: MessageThread): boolean {
        return thread.unreadMessageCount > 0;
    }

    hadConversationBefore(thread: MessageThread): boolean {
        console.log(thread.latestMessage);
        return thread.latestMessage !== undefined;
    }

}
