import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { Photo } from '../../models/photo';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { AlertifyService } from '../../services/alertify.service';
import { BsModalService } from 'ngx-bootstrap';
import { Subject } from 'rxjs';
import { ConfirmModalComponent } from '../../modals/confirm-modal/confirm-modal.component';
import { NgxImageGalleryComponent, GALLERY_IMAGE, GALLERY_CONF } from 'ngx-image-gallery';

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
    conf: GALLERY_CONF = {
        imageOffset: '0px',
        showImageTitle: false,
        imageBorderRadius: '0%',
        thumbnailSize: 100
    };
    @ViewChild(NgxImageGalleryComponent) ngxImageGallery: NgxImageGalleryComponent;
    images: GALLERY_IMAGE[];
    selectedPhotoIds: Set<number> = new Set<number>();

    constructor(private authService: AuthService, private userService: UserService,
        private alertify: AlertifyService, private modalService: BsModalService) { }

    ngOnInit() {
        this.initializeUploader();
        this.photos.forEach( (photo: Photo, index: number, photoArray: Photo[]) => {
            photoArray[index].selected = false;
        } );
        this.images = this.photos.map(photo => {
            return {
                url: photo.url,
                title: photo.description,
                thumbnailUrl: photo.thumbnailUrl || photo.url
            };
        });
    }

    processImageSelection(e: any, photoId: number): void {
        if (e.target.checked) {
            this.selectedPhotoIds.add(photoId);
        } else {
            this.selectedPhotoIds.delete(photoId);
        }
    }

    selectOrDeselectAll(e: any): void {
        if (e.target.checked) {
            this.selectAll();
        } else {
            this.deselectAll();
        }
    }

    private selectAll(): void {
        this.photos.forEach( (photo: Photo, index: number, photoArray: Photo[]) => {
            photoArray[index].selected = true;
            this.selectedPhotoIds.add(photo.id);
        } );
    }

    private deselectAll(): void {
        this.photos.forEach( (photo: Photo, index: number, photoArray: Photo[]) => {
            photoArray[index].selected = false;
        } );
        this.selectedPhotoIds.clear();
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
                    isAvatar: res.isAvatar,
                    width: res.width,
                    height: res.height,
                    thumbnailUrl: res.thumbnailUrl,
                    selected: false
                };
                this.photos.push(photo);
                this.images.push({
                    url: photo.url,
                    title: photo.description,
                    thumbnailUrl: photo.thumbnailUrl || photo.url
                });
            }
        };
    }

    deletePhoto(ids: Set<number>) {
        const deleteSelectedPhoto = new Subject<boolean>();
        const modal = this.modalService.show(ConfirmModalComponent, {
            initialState: {
                confirmMessage: 'Are you sure you want to delete this photo?'
            }
        });
        modal.content.actionConfirmed = deleteSelectedPhoto;
        deleteSelectedPhoto.asObservable().subscribe(result => {
            if (result) {
                this.userService.deletePhoto(this.authService.decodedToken.nameid, Array.from(ids)).subscribe(() => {
                    ids.forEach( id => {
                        const deletedPhotoIndex = this.photos.findIndex(p => p.id === id);
                        this.photos.splice(deletedPhotoIndex, 1);
                        this.images.splice(deletedPhotoIndex, 1);
                    } );
                    this.alertify.success('Photos have been deleted');
                    this.selectedPhotoIds.clear();
                }, error => {
                    this.alertify.error(error);
                    this.selectedPhotoIds.clear();
                });
            }
        });
    }

    openGallery(index: number = 0) {
        this.ngxImageGallery.open(index);
    }
}
