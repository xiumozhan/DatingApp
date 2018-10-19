import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { interval, Observable, Subscription, Subject } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { SessionExpiredModalComponent } from '../modals/session-expired-modal/session-expired-modal.component';
import { Router } from '@angular/router';
import { SessionStatus } from '../models/session-status.enum';
import { UserIdleService } from 'angular-user-idle';
import { InactivityModalComponent } from '../modals/inactivity-modal/inactivity-modal.component';

@Injectable({
    providedIn: 'root'
})
export class SessionWatchService {
    private timer: Observable<SessionStatus>;
    private sessionChecking: Subscription;
    private longTimeInactivityChecking: Subscription;
    private longTimeInactivityTimeoutChecking: Subscription;
    private isWatching = false;
    private hasSessionExpiredPreviously = false;
    private hasUserIdleForTooLongPreviously: boolean;
    private modal: BsModalRef;

    constructor(private authService: AuthService, private modalService: BsModalService,
        private router: Router, private userIdle: UserIdleService) { }

    startWatching(): void {
        if (!this.isWatching) {
            this.isWatching = true;
            this.startTokenWatching();
            this.startUserInactivityWatching();
        }
    }

    stopWatching(): void {
        if (this.isWatching) {
            this.isWatching = false;
            this.sessionChecking.unsubscribe();
            this.longTimeInactivityChecking.unsubscribe();
            this.longTimeInactivityTimeoutChecking.unsubscribe();
            this.userIdle.stopWatching();
        }
    }

    private startTokenWatching(): void {
        this.timer = interval(1000).pipe(
            startWith(0),
            map( () => this.authService.getCurrenSessionStatus() )
        );
        this.sessionChecking = this.timer.subscribe(sessionStatus => {
            this.handleSessionStatusChange(sessionStatus);
        });
    }

    private startUserInactivityWatching(): void {
        this.userIdle.startWatching();
        this.hasUserIdleForTooLongPreviously = false;
        this.longTimeInactivityChecking = this.userIdle.onTimerStart().subscribe(count => {
            this.openUserIdleForToLongModal(count);
        });
        this.longTimeInactivityTimeoutChecking = this.userIdle.onTimeout().subscribe(() => {
            this.handleUserInactivityTimeout();
        });
    }

    private openUserIdleForToLongModal(count: number): void {
        if (!this.hasUserIdleForTooLongPreviously) {
            const keepBrowsingAfterLongTimeInactivity = new Subject<boolean>();
            this.hasUserIdleForTooLongPreviously = true;
            this.modal = this.modalService.show(InactivityModalComponent, {
                backdrop: true,
                ignoreBackdropClick: true,
                animated: true,
                keyboard: false
            });
            this.modal.content.keepBrowsing = keepBrowsingAfterLongTimeInactivity;
            keepBrowsingAfterLongTimeInactivity.asObservable().subscribe(keepBrowsing => {
                this.handleIfKeepBrowsingOrNot(keepBrowsing);
            });
        }
        this.modal.content.remainingTime = this.userIdle.getConfigValue().timeout - count;
    }

    private handleIfKeepBrowsingOrNot(keepBrowsing: boolean): void {
        if (keepBrowsing) {
            this.userIdle.resetTimer();
            this.hasUserIdleForTooLongPreviously = false;
        } else {
            this.stopWatching();
            this.authService.removeStoredAuthData();
            this.router.navigate(['/home']);
        }
    }

    private openSessionExpiredModal(): void {
        const userClosedModal = new Subject<boolean>();
        this.modal = this.modalService.show(SessionExpiredModalComponent, {
            backdrop: true,
            ignoreBackdropClick: true,
            animated: true,
            keyboard: false
        });
        this.modal.content.modalClosed = userClosedModal;
        userClosedModal.asObservable().subscribe(modalClosed => {
            if (modalClosed) {
                this.authService.removeStoredAuthData();
                this.router.navigate(['/home']);
            }
        });
    }

    private handleUserInactivityTimeout(): void {
        this.modal.hide();
        this.stopWatching();
        this.authService.removeStoredAuthData();
        this.router.navigate(['/home']);
    }

    private handleSessionStatusChange(sessionStatus: SessionStatus): void {
        switch (sessionStatus) {
            case SessionStatus.TokenExpired:
                if (!this.hasSessionExpiredPreviously) {
                    this.hasSessionExpiredPreviously = true;
                    this.openSessionExpiredModal();
                }
                break;
            case SessionStatus.LoggedOut:
                this.modal.hide();
                this.router.navigate(['/home']);
                break;
            case SessionStatus.LoggedIn:
                if (this.hasSessionExpiredPreviously) {
                    this.hasSessionExpiredPreviously = false;
                    this.router.navigateByUrl(this.router.url);
                }
                break;
            default:
                break;
        }
    }

}
