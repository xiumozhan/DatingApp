/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ImageProfileUploadModalComponent } from './image-profile-upload-modal.component';

describe('ImageProfileUploadModalComponent', () => {
    let component: ImageProfileUploadModalComponent;
    let fixture: ComponentFixture<ImageProfileUploadModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ImageProfileUploadModalComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ImageProfileUploadModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
