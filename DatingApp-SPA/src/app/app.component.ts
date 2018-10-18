import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './services/auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from './models/user';
import { TokenWatchService } from './services/token-watch.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
    jwtHelper = new JwtHelperService();

    constructor(private authService: AuthService, private tokenWatchService: TokenWatchService) {}

    ngOnInit() {
        const token = localStorage.getItem('token');
        const user: User = JSON.parse(localStorage.getItem('user'));
        if (token) {
            if (!this.jwtHelper.isTokenExpired(token)) {
                this.authService.decodedToken = this.jwtHelper.decodeToken(token);
                this.tokenWatchService.startWatching();
                if (user) {
                    this.authService.currentUser = user;
                    this.authService.changeMemberPhoto(user.photoUrl);
                }
            } else {
                this.authService.removeStoredAuthData();
            }
        }
    }

    ngOnDestroy(): void {
        this.tokenWatchService.stopWatching();
    }
}
