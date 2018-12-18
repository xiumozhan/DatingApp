import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatMessageThreadService } from 'src/app/services/chat-message-thread.service';
import { MessageThread } from 'src/app/models/message-thread';

@Component({
    selector: 'app-member-detail',
    templateUrl: './member-detail.component.html',
    styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {
    user: User;
    avatarUrl: string;

    constructor(private route: ActivatedRoute, private messageThreadService: ChatMessageThreadService,
        private router: Router) { }

    ngOnInit() {
        this.route.data.subscribe(data => {
            this.user = data['user'];
            if ( this.user.avatar !== null ) {
                this.avatarUrl = this.user.avatar.url;
            }
        });
    }

    startChattingWithUser(userId: number): void {
        this.messageThreadService.startMessageThread(userId).subscribe((thread: MessageThread) => {
            this.router.navigate(['/messages'], { queryParams: { threadId: thread.id } });
        });
    }
}
