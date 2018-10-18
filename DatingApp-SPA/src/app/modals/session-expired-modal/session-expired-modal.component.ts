import { Component, ViewEncapsulation } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-session-expired-modal',
    templateUrl: './session-expired-modal.component.html',
    styleUrls: ['./session-expired-modal.component.css']
})
export class SessionExpiredModalComponent {
    modalClosed: Subject<boolean>;

    constructor(private modalRef: BsModalRef) { }

    confirmSessionExpired(): void {
        this.modalClosed.next(true);
        this.modalClosed.complete();
        this.modalRef.hide();
    }

}
