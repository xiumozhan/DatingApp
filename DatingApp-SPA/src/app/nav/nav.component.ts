import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AlertifyService } from '../services/alertify.service';
import { Router } from '@angular/router';
import { SessionWatchService } from '../services/session-watch.service';
import { ChatMessageService } from '../services/chat-message.service';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
    model: any = {};
    avatarUrl: string;
    unreadMessageCount = 0;

    constructor(public authService: AuthService, private alertify: AlertifyService,
        private router: Router, private sessionWatchService: SessionWatchService, private chatMessageService: ChatMessageService) { }

    ngOnInit() {
        this.authService.currentAvatarUrl.subscribe(photoUrl => {
            this.avatarUrl = photoUrl || this.authService.emptyPhotoUrl;
        });
        this.chatMessageService.isConnectionCurrentlyEstablished.subscribe((isConnected: boolean) => {
            if (isConnected) {
                this.chatMessageService.onTotalUnreadMessageCountReceived().subscribe((unreadMessageCount: number) => {
                    this.unreadMessageCount = unreadMessageCount;
                });
            }
        });
    }

    hasUnreadMessage(): boolean {
        return this.unreadMessageCount > 0;
    }

    login() {
        this.authService.login(this.model).subscribe(next => {
            this.alertify.success('Successfully logged in');
        }, error => {
            this.alertify.error(error);
        }, () => {
            this.sessionWatchService.startWatching();
            this.router.navigate(['/members']);
            this.chatMessageService.setupConnectionToMessageHub();
        });
    }

    loggedIn() {
        return this.authService.loggedIn();
    }

    logout() {
        this.sessionWatchService.stopWatching();
        this.authService.removeStoredAuthData();
        this.alertify.message('logged out');
        this.router.navigate(['/home']);
        this.chatMessageService.disconnectFromMessageHub();
    }

}
