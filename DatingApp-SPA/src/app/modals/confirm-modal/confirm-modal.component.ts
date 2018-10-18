import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-confirm-modal',
    templateUrl: './confirm-modal.component.html',
    styleUrls: ['./confirm-modal.component.css']
})
export class ConfirmModalComponent {
    actionConfirmed: Subject<boolean>;

    constructor(private modalRef: BsModalRef) { }

    confirm(): void {
        this.actionConfirmed.next(true);
        this.actionConfirmed.complete();
        this.modalRef.hide();
    }

    decline(): void {
        this.actionConfirmed.next(false);
        this.actionConfirmed.complete();
        this.modalRef.hide();
    }

}
