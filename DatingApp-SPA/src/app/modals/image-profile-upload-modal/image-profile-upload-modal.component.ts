import { Component, ViewChild, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ImageCroppedEvent } from 'ngx-image-cropper/src/image-cropper.component';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { BsModalRef } from 'ngx-bootstrap';
import { AlertifyService } from 'src/app/services/alertify.service';
import { UserService } from 'src/app/services/user.service';
import { Photo } from 'src/app/models/photo';
import { AuthService } from 'src/app/services/auth.service';
import { BaseModalComponent } from '../base-modal-component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-image-profile-upload-modal',
    templateUrl: './image-profile-upload-modal.component.html',
    styleUrls: ['./image-profile-upload-modal.component.css']
})
export class ImageProfileUploadModalComponent extends BaseModalComponent {
    baseUrl = environment.apiUrl;
    imageChangedEvent: any;
    croppedImage: any;
    @ViewChild('imageCropper') imageCropper: ImageCropperComponent;
    @Input() currentImageProfileUrl: string;
    @Input() currentUserId: number;
    hasImageUploaded = false;
    private croppedImageBlob: Blob;

    constructor(protected modalRef: BsModalRef, private alertify: AlertifyService,
        private userService: UserService, private authService: AuthService, protected router: Router) {
        super(modalRef, router);
    }

    fileChangeEvent(event: any): void {
        if (event.target.value.length > 0) {
            this.hasImageUploaded = true;
            this.imageChangedEvent = event;
        }
    }

    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
        this.croppedImageBlob = event.file;
    }

    imageLoaded() {
    }

    loadImageFailed() {
    }

    uploadImage(): void {
        if (this.croppedImageBlob.size === 0) {
            this.alertify.error('Cannot upload selected image, image either empty or damaged.');
            return;
        }
        const formData = new FormData();
        formData.append('file', this.croppedImageBlob, `user-${this.currentUserId}-profile-image`);
        this.userService.setProfileImage(this.currentUserId, formData).subscribe((newImage: Photo) => {
            this.alertify.success('Successfully updated profile image');
            this.authService.changeMemberAvatar(newImage.url);
            this.authService.currentUser.avatar = newImage;
            localStorage.setItem('user', JSON.stringify(this.authService.currentUser));
        }, error => {
            this.alertify.error(error);
        });
    }

    tearDown() {
        this.modalRef.hide();
        this.croppedImage = null;
        this.croppedImageBlob = null;
    }

}
