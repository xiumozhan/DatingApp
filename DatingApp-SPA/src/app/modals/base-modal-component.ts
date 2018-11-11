import { BsModalRef } from 'ngx-bootstrap';
import { Router, NavigationStart } from '@angular/router';
import { OnInit } from '@angular/core';
import { filter } from 'rxjs/operators';

export class BaseModalComponent implements OnInit {
    constructor(protected modalRef: BsModalRef, protected router: Router) {}

    ngOnInit(): void {
        this.listenToRouteChange();
    }

    private listenToRouteChange(): void {
        this.router.events.pipe(
            filter( (event: Event) => event instanceof NavigationStart ) )
            .subscribe( (event: NavigationStart) => {
                this.tearDown();
            } );
    }

    protected tearDown(): void {
        this.modalRef.hide();
    }
}
