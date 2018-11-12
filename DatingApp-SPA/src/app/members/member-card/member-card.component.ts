import { Component, OnInit, Input } from '@angular/core';
import { User } from '../../models/user';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { AlertifyService } from 'src/app/services/alertify.service';

@Component({
    selector: 'app-member-card',
    templateUrl: './member-card.component.html',
    styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent implements OnInit {
    @Input() user: User;
    avatarUrl: string;

    constructor(private authService: AuthService,
        private userService: UserService, private alertify: AlertifyService) { }

    ngOnInit() {
        if (this.user.avatar !== null) {
            this.avatarUrl = this.user.avatar.url;
        }
    }

    sendLike(id: number) {
        this.userService.sendLike(this.authService.decodedToken.nameid, id).subscribe( data => {
            this.alertify.success('You have liked: ' + this.user.knownAs);
        }, error => {
            this.alertify.error(error);
        } );
    }

}
