import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { MessageThread } from '../models/message-thread';
import { AlertifyService } from '../services/alertify.service';
import { Observable, of } from 'rxjs';
import { ChatMessageThreadService } from '../services/chat-message-thread.service';
import { catchError } from 'rxjs/operators';

@Injectable()
export class MessageThreadResolver implements Resolve<MessageThread[]> {
    constructor(private messageThreadService: ChatMessageThreadService, private alertify: AlertifyService,
        private router: Router) {}

    resolve(route: ActivatedRouteSnapshot): Observable<MessageThread[]> {
        return this.messageThreadService.getMessageThreadsForUser().pipe(
            catchError(error => {
                this.alertify.error('Problem retrieving data');
                this.router.navigate(['/']);
                return of(null);
            })
        );
    }
}
