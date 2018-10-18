/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SessionExpiredModalComponent } from './session-expired-modal.component';

describe('SessionExpiredModalComponent', () => {
    let component: SessionExpiredModalComponent;
    let fixture: ComponentFixture<SessionExpiredModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SessionExpiredModalComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SessionExpiredModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
