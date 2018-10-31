import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';
import { User } from '../models/user';
import { SessionStatus } from '../models/session-status.enum';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    baseUrl = `${environment.apiUrl}auth/`;
    jwtHelper = new JwtHelperService();
    decodedToken: any;
    currentUser: User;
    emptyPhotoUrl = '../../assets/user.png';
    avatarUrl = new BehaviorSubject<string>(this.emptyPhotoUrl);
    currentAvatarUrl = this.avatarUrl.asObservable();

    constructor(private http: HttpClient) { }

    changeMemberAvatar(photoUrl: string) {
        this.avatarUrl.next(photoUrl);
    }

    login(model: any) {
        return this.http.post(this.baseUrl + 'login', model)
            .pipe(
                map( (response: any) => {
                    const user = response;
                    if (user) {
                        localStorage.setItem('token', user.token);
                        localStorage.setItem('user', JSON.stringify(user.user));
                        this.decodedToken = this.jwtHelper.decodeToken(user.token);
                        this.currentUser = user.user;
                        this.changeMemberAvatar(this.currentUser.avatar !== null ? this.currentUser.avatar.url : null);
                    }
                } )
            );
    }

    register(user: User) {
        return this.http.post(this.baseUrl + 'register', user);
    }

    loggedIn() {
        const token = localStorage.getItem('token');
        return !this.jwtHelper.isTokenExpired(token);
    }

    getCurrenSessionStatus(): SessionStatus {
        const token = localStorage.getItem('token');
        if (token) {
            return this.jwtHelper.isTokenExpired(token) ? SessionStatus.TokenExpired : SessionStatus.LoggedIn;
        }
        return SessionStatus.LoggedOut;
    }

    removeStoredAuthData(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.decodedToken = null;
        this.currentUser = null;
    }

}
