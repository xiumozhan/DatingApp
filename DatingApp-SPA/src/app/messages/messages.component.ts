import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '../models/user';
import { ChatMessageService } from '../services/chat-message.service';
import { ChatMessage } from '../models/chat-message';
import { AuthService } from '../services/auth.service';
import { MessageThread } from '../models/message-thread';
import { ChatMessageThreadService } from '../services/chat-message-thread.service';
import { ChatMessageToDisplay } from '../models/chat-message-to-display';

@Component({
    selector: 'app-messages',
    templateUrl: './messages.component.html',
    styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit, OnDestroy, AfterViewInit {
    messageThreads: MessageThread[] = [];
    selectedThread: MessageThread;
    selectedUserAvatar: string;
    currentUser: User;
    currentUserAvatar: string;
    pendingMessageContent: string;
    messages: ChatMessageToDisplay[];
    disableScrollBottom = false;
    @ViewChild('messageList', { read: ElementRef }) messageList: ElementRef;
    @ViewChildren('messageItem', { read: ElementRef }) messageItems: QueryList<ElementRef>;

    constructor(private route: ActivatedRoute, private messageService: ChatMessageService,
        private authService: AuthService, private messageThreadService: ChatMessageThreadService) { }

    ngOnInit() {
        this.route.data.subscribe(data => {
            this.messageThreads = data['messageThreads'];
        });
        this.currentUser = this.authService.currentUser;
        if (this.currentUser.avatar !== null) {
            this.currentUserAvatar = this.currentUser.avatar.url;
        }
        this.messageService.onMessageReceived().subscribe( (message: ChatMessage) => {
            this.processIncomingNewMessage(message);
        } );
    }

    ngOnDestroy() {
        if (this.authService.loggedIn()) {
            this.messageService.performCleanUp();
        }
    }

    private processIncomingNewMessage(message: ChatMessage) {
        const messageThreadKey: string = message.threadId;
        const messageThreadIndex: number = this.messageThreads.findIndex((thread: MessageThread) => thread.id === messageThreadKey);
        if (messageThreadIndex !== -1) {
            const messageThread: MessageThread = this.messageThreads[messageThreadIndex];
            if (this.selectedThread !== undefined && this.selectedThread.id === message.threadId) {
                this.messages.push(message);
            } else {
                messageThread.unreadMessageCount += 1;
            }
            messageThread.latestMessage = message;
            this.messageThreads[messageThreadIndex] = messageThread;
        } else {
            this.messageThreadService.getMessageThread(messageThreadKey).subscribe((thread: MessageThread) => {
                this.messageThreads.unshift(thread);
            });
        }
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

    isSelected(thread: MessageThread): boolean {
        if (this.selectedThread === undefined) {
            return false;
        }
        return thread.id === this.selectedThread.id;
    }

    isSenderCurrentUser(userId: number): boolean {
        return userId === this.currentUser.id;
    }

    selectUserForConversation(thread: MessageThread): void {
        if (this.selectedThread === undefined || thread.id !== this.selectedThread.id) {
            let previousSelectedUserId: number;
            if (this.selectedThread !== undefined) {
                previousSelectedUserId = this.selectedThread.participant.id;
            }
            this.selectedThread = thread;
            if (this.selectedThread.participant.avatar !== null) {
                this.selectedUserAvatar = this.selectedThread.participant.avatar.url;
            } else {
                this.selectedUserAvatar = null;
            }
            this.pendingMessageContent = '';
            this.loadMessages(thread.id);
            this.markMessageThreadAsRead(thread.id);
            this.switchUserFocus(previousSelectedUserId);
        }
    }

    private switchUserFocus(previousSelectedUserId: number): void {
        if (previousSelectedUserId !== undefined) {
            this.messageService.unfocusOnUser(previousSelectedUserId).then(() => {
                this.messageService.focusOnUser(this.selectedThread.participant.id);
            });
        } else {
            this.messageService.focusOnUser(this.selectedThread.participant.id);
        }
    }

    private loadMessages(threadId: string): void {
        this.messageThreadService.getAllMessagesForThread(threadId).subscribe((messages: ChatMessageToDisplay[]) => {
            this.messages = messages;
        });
    }

    private markMessageThreadAsRead(threadId: string) {
        const threadIndex: number = this.messageThreads.findIndex((thread: MessageThread) => thread.id === threadId);
        const threadSelected: MessageThread = this.messageThreads[threadIndex];
        threadSelected.unreadMessageCount = 0;
        this.messageThreads[threadIndex] = threadSelected;
        this.messageService.markThreadAsRead(threadId, threadSelected.participant.id);
    }

    sendMessage(): void {
        this.messageService.sendPrivateMessageToUser(
            this.selectedThread.id, this.selectedThread.participant.id, this.pendingMessageContent);
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
        return thread.latestMessage !== null;
    }

    orderByLatestMessageSentTime(): MessageThread[] {
        return this.messageThreads.sort((thisThread: MessageThread, thatThread: MessageThread) => {
            if (thisThread.latestMessage === null && thatThread.latestMessage === null) {
                return 0;
            }
            if (thisThread.latestMessage !== null && thatThread.latestMessage === null) {
                return -1;
            }
            if (thisThread.latestMessage === null && thatThread.latestMessage !== null) {
                return 1;
            }
            return thisThread.latestMessage.messageSent < thatThread.latestMessage.messageSent ?
                1 : thisThread.latestMessage.messageSent < thatThread.latestMessage.messageSent ? 0 : -1;
        });
    }

}
