import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { MessageThread } from '../models/message-thread';
import { Observable } from 'rxjs';
import { ChatMessage } from '../models/chat-message';

@Injectable({
    providedIn: 'root'
})
export class ChatMessageThreadService {
    baseUrl = environment.apiUrl;

    constructor(private http: HttpClient, private authService: AuthService) { }

    getMessageThreadsForUser(): Observable<MessageThread[]> {
        return this.http.get<MessageThread[]>(
            `${this.baseUrl}users/${this.authService.decodedToken.nameid}/chat/thread`);
    }

    getMessageThread(threadId: string): Observable<MessageThread[]> {
        return this.http.get<MessageThread[]>(
            `${this.baseUrl}users/${this.authService.decodedToken.nameid}/chat/thread/${threadId}`);
    }

    startMessageThread(anotherParticipantId: number): Observable<any> {
        return this.http.post(
            `${this.baseUrl}users/${this.authService.decodedToken.nameid}/chat/thread`,
            {anotherParticipantId: anotherParticipantId});
    }

    getAllMessagesForThread(threadId: string): Observable<ChatMessage[]> {
        return this.http.get<ChatMessage[]>(
            `${this.baseUrl}users/${this.authService.decodedToken.nameid}/chat/thread/${threadId}/messages`);
    }

}
