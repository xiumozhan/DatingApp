import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Subject } from 'rxjs';
import { BaseModalComponent } from '../base-modal-component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-confirm-modal',
    templateUrl: './confirm-modal.component.html',
    styleUrls: ['./confirm-modal.component.css']
})
export class ConfirmModalComponent extends BaseModalComponent {
    actionConfirmed: Subject<boolean>;

    constructor(protected modalRef: BsModalRef, protected router: Router) {
        super(modalRef, router);
    }

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

    tearDown(): void {
        this.decline();
    }

}
