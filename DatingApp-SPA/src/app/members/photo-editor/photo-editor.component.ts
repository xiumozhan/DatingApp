import { Component, OnInit, Input, ViewChild } from '@angular/core';
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
import { PhotoUploadModalComponent } from 'src/app/modals/photo-upload-modal/photo-upload-modal.component';

@Component({
    selector: 'app-photo-editor',
    templateUrl: './photo-editor.component.html',
    styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
    @Input() photos: Photo[];
    @Input() enableEditMode: boolean;
    isInEditMode = false;
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

    processImageSelection(photo: Photo, photoIndex: number): void {
        if (photo.selected !== true) {
            this.selectedPhotoIds.add(photo.id);
            this.photos[photoIndex].selected = true;
        } else {
            this.selectedPhotoIds.delete(photo.id);
            this.photos[photoIndex].selected = false;
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

    deletePhoto(ids: Set<number>): void {
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

    openGallery(index: number = 0): void {
        this.ngxImageGallery.open(index);
    }

    enterEditMode(): void {
        if ( this.enableEditMode ) {
            this.isInEditMode = true;
        }
    }

    exitEditMode(): void {
        this.isInEditMode = false;
        this.deselectAll();
    }

    openAddPhotosModal(): void {
        const uploadedPhoto = new Subject<Photo>();
        const modal = this.modalService.show(PhotoUploadModalComponent, { class: 'modal-lg modal-photo-upload' });
        modal.content.successfullyUploadedPhoto = uploadedPhoto;
        uploadedPhoto.asObservable().subscribe( photo => {
            this.photos.push(photo);
            this.images.push({
                url: photo.url,
                title: photo.description,
                thumbnailUrl: photo.thumbnailUrl || photo.url
            });
        } );
    }
}
