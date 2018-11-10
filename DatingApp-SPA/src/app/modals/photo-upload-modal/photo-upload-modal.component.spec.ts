/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PhotoUploadModalComponent } from './photo-upload-modal.component';

describe('PhotoUploadModalComponent', () => {
    let component: PhotoUploadModalComponent;
    let fixture: ComponentFixture<PhotoUploadModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PhotoUploadModalComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PhotoUploadModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
