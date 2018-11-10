import { Component, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { environment } from 'src/environments/environment';
import { Photo } from 'src/app/models/photo';
import { AuthService } from 'src/app/services/auth.service';
import { BsModalRef } from 'ngx-bootstrap';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-photo-upload-modal',
    templateUrl: './photo-upload-modal.component.html',
    styleUrls: ['./photo-upload-modal.component.css']
})
export class PhotoUploadModalComponent implements OnInit {
    uploader: FileUploader;
    hasBaseDropZoneOver = false;
    baseUrl = environment.apiUrl;
    successfullyUploadedPhoto: Subject<Photo>;

    constructor(private authService: AuthService, private modalRef: BsModalRef) { }

    ngOnInit() {
        this.initializeUploader();
    }

    private initializeUploader(): void {
        this.uploader = new FileUploader({
            url: `${this.baseUrl}users/${this.authService.decodedToken.nameid}/photos`,
            authToken: 'Bearer ' + localStorage.getItem('token'),
            isHTML5: true,
            allowedFileType: ['image'],
            removeAfterUpload: true,
            autoUpload: false,
            maxFileSize: 10 * 1024 * 1024
        });

        this.uploader.onAfterAddingFile = (file) => {
            file.withCredentials = false;
        };

        this.uploader.onSuccessItem = (item, response, status, headers) => {
            if (response) {
                const res: Photo = JSON.parse(response);
                const photo = {
                    id: res.id,
                    url: res.url,
                    dateAdded: res.dateAdded,
                    description: res.description,
                    isAvatar: res.isAvatar,
                    width: res.width,
                    height: res.height,
                    thumbnailUrl: res.thumbnailUrl,
                    selected: false
                };
                this.successfullyUploadedPhoto.next(photo);
            }
        };
    }

    fileOverBase(e: any): void {
        this.hasBaseDropZoneOver = e;
    }

    close(): void {
        this.uploader.clearQueue();
        this.uploader.destroy();
        this.modalRef.hide();
    }

}
