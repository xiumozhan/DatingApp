import { Component, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap';
import { BaseModalComponent } from '../base-modal-component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-inactivity-modal',
    templateUrl: './inactivity-modal.component.html',
    styleUrls: ['./inactivity-modal.component.css']
})
export class InactivityModalComponent extends BaseModalComponent {
    @Input() remainingTime: number;
    keepBrowsing: Subject<boolean>;

    constructor(protected modalRef: BsModalRef, protected router: Router) {
        super(modalRef, router);
    }

    logoutNow(): void {
        this.modalRef.hide();
        this.keepBrowsing.next(false);
        this.keepBrowsing.complete();
    }

    wantToKeepBrowsing(): void {
        this.modalRef.hide();
        this.keepBrowsing.next(true);
        this.keepBrowsing.complete();
    }

    tearDown(): void {
        this.wantToKeepBrowsing();
    }

}
