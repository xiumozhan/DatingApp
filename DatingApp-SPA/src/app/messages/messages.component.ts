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
    messageThreads: Map<string, MessageThread> = new Map<string, MessageThread>();
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
            data['messageThreads'].forEach((messageThread: MessageThread) => {
                this.messageThreads.set(messageThread.id, messageThread);
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

    ngOnDestroy() {
        if (this.authService.loggedIn()) {
            this.messageService.performCleanUp();
        }
    }

    private processIncomingNewMessage(message: ChatMessage) {
        const messageThreadKey: string = message.threadId;
        const messageThread: MessageThread = this.messageThreads.get(messageThreadKey);
        if (this.selectedThread !== undefined && this.selectedThread.id === message.threadId) {
            this.messages.push(message);
        } else {
            messageThread.unreadMessageCount += 1;
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
        const threadSelected: MessageThread = this.messageThreads.get(threadId);
        threadSelected.unreadMessageCount = 0;
        this.messageThreads.set(threadId, threadSelected);
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

}
