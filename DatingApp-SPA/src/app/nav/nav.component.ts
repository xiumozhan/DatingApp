import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AlertifyService } from '../services/alertify.service';
import { Router } from '@angular/router';
import { SessionWatchService } from '../services/session-watch.service';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
    model: any = {};
    avatarUrl: string;

    constructor(public authService: AuthService, private alertify: AlertifyService,
        private router: Router, private sessionWatchService: SessionWatchService) { }

    ngOnInit() {
        this.authService.currentAvatarUrl.subscribe(photoUrl => {
            this.avatarUrl = photoUrl || this.authService.emptyPhotoUrl;
        });
    }

    login() {
        this.authService.login(this.model).subscribe(next => {
            this.alertify.success('Successfully logged in');
        }, error => {
            this.alertify.error(error);
        }, () => {
            this.sessionWatchService.startWatching();
            this.router.navigate(['/members']);
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
    }

}
