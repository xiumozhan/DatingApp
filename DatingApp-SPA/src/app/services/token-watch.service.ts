import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { interval, Observable, Subscription, Subject } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { SessionExpiredModalComponent } from '../modals/session-expired-modal/session-expired-modal.component';
import { Router } from '@angular/router';
import { SessionStatus } from '../models/session-status.enum';

@Injectable({
    providedIn: 'root'
})
export class TokenWatchService {
    private timer: Observable<SessionStatus>;
    private sessionChecking: Subscription;
    private isWatching = false;
    private hasSessionExpiredPreviously = false;
    private modal: BsModalRef;

    constructor(private authService: AuthService, private modalService: BsModalService, private router: Router) { }

    startWatching(): void {
        if (!this.isWatching) {
            this.isWatching = true;
            this.timer = interval(1000).pipe(
                startWith(0),
                map( () => this.authService.getCurrenSessionStatus() )
            );
            this.sessionChecking = this.timer.subscribe(sessionStatus => {
                this.handleSessionStatusChange(sessionStatus);
            });
        }
    }

    stopWatching(): void {
        if (this.isWatching) {
            this.isWatching = false;
            this.sessionChecking.unsubscribe();
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
