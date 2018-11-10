import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { User } from '../../models/user';
import { ActivatedRoute } from '@angular/router';
import { AlertifyService } from '../../services/alertify.service';
import { NgForm } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { environment } from 'src/environments/environment';
import { BsModalService } from 'ngx-bootstrap';
import { ImageProfileUploadModalComponent } from 'src/app/modals/image-profile-upload-modal/image-profile-upload-modal.component';

@Component({
    selector: 'app-member-edit',
    templateUrl: './member-edit.component.html',
    styleUrls: ['./member-edit.component.css']
})
export class MemberEditComponent implements OnInit {
    user: User;
    avatarUrl: string;
    baseUrl = environment.apiUrl;
    @ViewChild('editForm') editForm: NgForm;
    @ViewChild('imageProfile') imageProfile: HTMLElement;
    @HostListener('window:beforeunload', ['$event'])
    unloadNotification($event: any) {
        if (this.editForm.dirty) {
            $event.returnValue = true;
        }
    }

    constructor(private route: ActivatedRoute, private alertify: AlertifyService,
        private userService: UserService, private authService: AuthService, private modalService: BsModalService) { }

    ngOnInit() {
        this.route.data.subscribe(data => {
            this.user = data['user'];
        });
        this.authService.currentAvatarUrl.subscribe(photoUrl => {
            this.avatarUrl = photoUrl || `../${this.authService.emptyPhotoUrl}`;
        });
    }

    updateUser() {
        this.userService.updateUser(this.authService.decodedToken.nameid, this.user).subscribe(next => {
            this.alertify.success('Profile updated successfully');
            this.editForm.reset(this.user);
        }, error => {
            this.alertify.error(error);
        });
    }

    openImageProfileUpdateModal(): void {
        this.modalService.show(ImageProfileUploadModalComponent, {
            initialState: {
                currentImageProfileUrl: this.avatarUrl,
                currentUserId: this.user.id
            },
            class: 'modal-lg gray-modal',
            backdrop: true,
            ignoreBackdropClick: true,
            animated: true,
            keyboard: false
        });
    }

}
