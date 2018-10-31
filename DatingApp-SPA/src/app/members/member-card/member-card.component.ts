import { Component, OnInit, Input } from '@angular/core';
import { User } from '../../models/user';

@Component({
    selector: 'app-member-card',
    templateUrl: './member-card.component.html',
    styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent implements OnInit {
    @Input() user: User;
    avatarUrl: string;

    constructor() { }

    ngOnInit() {
        if (this.user.avatar !== null) {
            this.avatarUrl = this.user.avatar.url;
        }
    }

}
