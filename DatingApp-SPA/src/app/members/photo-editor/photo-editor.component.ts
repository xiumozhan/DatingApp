import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { Photo } from '../../models/photo';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { AlertifyService } from '../../services/alertify.service';
import { BsModalService } from 'ngx-bootstrap';
import { Subject } from 'rxjs';
import { ConfirmModalComponent } from '../../modals/confirm-modal/confirm-modal.component';

@Component({
    selector: 'app-photo-editor',
    templateUrl: './photo-editor.component.html',
    styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
    @Input() photos: Photo[];
    @Output() getMemberPhotoChange = new EventEmitter<string>();
    uploader: FileUploader;
    hasBaseDropZoneOver = false;
    baseUrl = environment.apiUrl;
    currentMain: Photo;

    constructor(private authService: AuthService, private userService: UserService,
        private alertify: AlertifyService, private modalService: BsModalService) { }

    ngOnInit() {
        this.initializeUploader();
    }

    fileOverBase(e: any): void {
        this.hasBaseDropZoneOver = e;
    }

    initializeUploader() {
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
                    isAvatar: res.isAvatar
                };
                this.photos.push(photo);
            }
        };
    }

    deletePhoto(id: number) {
        const deleteSelectedPhoto = new Subject<boolean>();
        const modal = this.modalService.show(ConfirmModalComponent, {
            initialState: {
                confirmMessage: 'Are you sure you want to delete this photo?'
            }
        });
        modal.content.actionConfirmed = deleteSelectedPhoto;
        deleteSelectedPhoto.asObservable().subscribe(result => {
            if (result) {
                this.userService.deletePhoto(this.authService.decodedToken.nameid, id).subscribe(() => {
                    this.photos.splice(this.photos.findIndex(p => p.id === id), 1);
                    this.alertify.success('Photo has been deleted');
                }, error => {
                    this.alertify.error('Failed to delete the photo');
                });
            }
        });
    }
}
