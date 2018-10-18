import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { MemberEditComponent } from '../members/member-edit/member-edit.component';
import { BsModalService } from 'ngx-bootstrap';
import { Subject, Observable } from 'rxjs';
import { ConfirmModalComponent } from '../modals/confirm-modal/confirm-modal.component';

@Injectable()
export class PreventUnsavedChanges implements CanDeactivate<MemberEditComponent> {
    constructor(private modalService: BsModalService) {}

    canDeactivate(component: MemberEditComponent): boolean | Observable<boolean> {
        if (component.editForm.dirty) {
            const leaveCurrentPage = new Subject<boolean>();
            const modal = this.modalService.show(ConfirmModalComponent, {
                initialState: {
                    confirmMessage: 'Are you sure you want to continue? Any unsaved changes will be lost on you current page.'
                }
            });
            modal.content.actionConfirmed = leaveCurrentPage;
            return leaveCurrentPage.asObservable();
        }
        return true;
    }
}
