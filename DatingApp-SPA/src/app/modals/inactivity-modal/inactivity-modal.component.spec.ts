/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InactivityModalComponent } from './inactivity-modal.component';

describe('InactivityModalComponent', () => {
    let component: InactivityModalComponent;
    let fixture: ComponentFixture<InactivityModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [InactivityModalComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InactivityModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
