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

    constructor(private authService: AuthService) { }

    public setupConnectionToMessageHub(): void {
        if (this.hubConnection !== null) {
            this.hubConnection = new signalR.HubConnectionBuilder()
                .configureLogging(signalR.LogLevel.Trace)
                .withUrl('http://localhost:5000/hub/privatechat', {
                    transport: 0,
                    accessTokenFactory: () => localStorage.getItem('token')
                })
                .build();
            this.hubConnection.start();
        }
    }

    public onMessageReceived(): Observable<ChatMessage> {
        return new Observable<ChatMessage>(observer => this.hubConnection.on('ReceiveMessage', (message: ChatMessage) => {
            observer.next(message);
        }));
    }

    public disconnectFromMessageHub(): void {
        this.hubConnection.stop();
    }

    public sendPrivateMessageToUser(threadId: string, recipientId: number, messageContent: string): void {
        this.hubConnection.invoke('SendPrivateMessage', threadId, recipientId, messageContent);
    }

}
