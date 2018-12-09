import { Injectable } from '@angular/core';
import { HubConnection } from '@aspnet/signalr';
import * as signalR from '@aspnet/signalr';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { ChatMessage } from '../models/chat-message';

@Injectable({
    providedIn: 'root'
})
export class ChatMessageService {
    private hubConnection: HubConnection;
    private userTalkingTo: number;

    constructor(private authService: AuthService) { }

    public setupConnectionToMessageHub(): void {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .configureLogging(signalR.LogLevel.Trace)
            .withUrl('http://localhost:5000/hub/privatechat', {
                transport: 0,
                accessTokenFactory: () => localStorage.getItem('token')
            })
            .build();
        this.hubConnection.start();
    }

    public onMessageReceived(): Observable<ChatMessage> {
        return new Observable<ChatMessage>(observer => this.hubConnection.on('ReceiveMessage', (message: ChatMessage) => {
            observer.next(message);
        }));
    }

    public disconnectFromMessageHub(): void {
        if (this.userTalkingTo !== undefined) {
            this.unfocusOnUser(this.userTalkingTo).then(() => {
                this.hubConnection.stop();
            });
        } else {
            this.hubConnection.stop();
        }
    }

    public sendPrivateMessageToUser(threadId: string, recipientId: number, messageContent: string): void {
        this.hubConnection.invoke('SendPrivateMessage', threadId, recipientId, messageContent);
    }

    public markThreadAsRead(threadId: string, anotherParticipantId: number): void {
        this.hubConnection.invoke('MarkThreadAsRead', threadId, anotherParticipantId);
    }

    public async focusOnUser(anotherParticipantId: number): Promise<any> {
        return this.hubConnection.invoke('FocusOnThread', anotherParticipantId).then(() => {
            this.userTalkingTo = anotherParticipantId;
        });
    }

    public async unfocusOnUser(anotherParticipantId: number): Promise<any> {
        return this.hubConnection.invoke('LoseFocusOnThread', anotherParticipantId).then(() => {
            this.userTalkingTo = undefined;
        });
    }

    public performCleanUp(): void {
        if (this.userTalkingTo !== undefined) {
            this.unfocusOnUser(this.userTalkingTo);
        }
    }
}
