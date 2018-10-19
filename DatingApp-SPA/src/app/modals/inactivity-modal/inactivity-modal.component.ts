import { Component, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap';

@Component({
    selector: 'app-inactivity-modal',
    templateUrl: './inactivity-modal.component.html',
    styleUrls: ['./inactivity-modal.component.css']
})
export class InactivityModalComponent {
    @Input() remainingTime: number;
    keepBrowsing: Subject<boolean>;

    constructor(private modalRef: BsModalRef) { }

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

}
