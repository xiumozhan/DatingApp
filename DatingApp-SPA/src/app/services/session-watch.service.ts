import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { interval, Observable, Subscription, Subject } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { SessionExpiredModalComponent } from '../modals/session-expired-modal/session-expired-modal.component';
import { Router } from '@angular/router';
import { SessionStatus } from '../models/session-status.enum';
import { InactivityModalComponent } from '../modals/inactivity-modal/inactivity-modal.component';
import { Idle, DEFAULT_INTERRUPTSOURCES, AutoResume } from '@ng-idle/core';

@Injectable({
    providedIn: 'root'
})
export class SessionWatchService {
    private timer: Observable<SessionStatus>;
    private sessionChecking: Subscription;
    private isWatching = false;
    private hasSessionExpiredPreviously = false;
    private hasUserIdleForTooLongPreviously: boolean;
    private modal: BsModalRef;
    private inactivityMaxTime = 30 * 60;
    private idleTimeout = 5 * 60;
    private onIdleEnd: Subscription;
    private onTimeoutWarning: Subscription;
    private onTimeout: Subscription;

    constructor(private authService: AuthService, private modalService: BsModalService, private router: Router,
        private idle: Idle) { }

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
            this.stopUserInactivityWatching();
        }
    }

    private stopUserInactivityWatching(): void {
        this.onIdleEnd.unsubscribe();
        this.onTimeoutWarning.unsubscribe();
        this.onTimeout.unsubscribe();
        this.idle.stop();
        this.idle.ngOnDestroy();
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
        this.configureUserIdleParameters();
        this.hasUserIdleForTooLongPreviously = false;
        this.configureUserIdleHandlers();
        this.idle.watch();
    }

    private configureUserIdleParameters(): void {
        this.idle.setIdle(this.inactivityMaxTime);
        this.idle.setTimeout(this.idleTimeout);
        this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
        this.idle.setAutoResume(AutoResume.notIdle);
    }

    private configureUserIdleHandlers(): void {
        this.onIdleEnd = this.idle.onIdleEnd.subscribe(() => {
            if (this.modal) {
                this.modal.hide();
            }
            this.idle.watch();
        });
        this.onTimeoutWarning = this.idle.onTimeoutWarning.subscribe(countdown => {
            this.openUserIdleForToLongModal(countdown);
        });
        this.onTimeout = this.idle.onTimeout.subscribe(() => {
            this.handleUserInactivityTimeout();
        });
    }

    private openUserIdleForToLongModal(countdown: number): void {
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
        this.modal.content.remainingTime = countdown;
    }

    private handleIfKeepBrowsingOrNot(keepBrowsing: boolean): void {
        if (keepBrowsing) {
            this.idle.watch();
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
