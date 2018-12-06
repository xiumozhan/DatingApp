import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './services/auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from './models/user';
import { SessionWatchService } from './services/session-watch.service';
import { ChatMessageService } from './services/chat-message.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
    jwtHelper = new JwtHelperService();

    constructor(private authService: AuthService, private sessionWatchService: SessionWatchService,
        private chatMessageService: ChatMessageService) {}

    ngOnInit() {
        const token = localStorage.getItem('token');
        const user: User = JSON.parse(localStorage.getItem('user'));
        if (token) {
            if (!this.jwtHelper.isTokenExpired(token)) {
                this.authService.decodedToken = this.jwtHelper.decodeToken(token);
                this.sessionWatchService.startWatching();
                if (user) {
                    this.authService.currentUser = user;
                    this.authService.changeMemberAvatar(user.avatar !== null ? user.avatar.url : null);
                    this.chatMessageService.setupConnectionToMessageHub();
                }
            } else {
                this.authService.removeStoredAuthData();
            }
        }
    }

    ngOnDestroy(): void {
        this.sessionWatchService.stopWatching();
        this.chatMessageService.disconnectFromMessageHub();
    }
}
