import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { AlertifyService } from '../../services/alertify.service';
import { ActivatedRoute } from '@angular/router';
import { Pagination, PaginatedResult } from '../../models/pagination';

@Component({
    selector: 'app-member-list',
    templateUrl: './member-list.component.html',
    styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {
    users: User[];
    user: User = JSON.parse(localStorage.getItem('user'));
    genderList = [
        {value: 'male', display: 'Males'},
        {value: 'female', display: 'Females'}
    ];
    userParams: any = {};
    pagination: Pagination;

    constructor(private userService: UserService, private alertify: AlertifyService,
        private route: ActivatedRoute) { }

    ngOnInit() {
        this.route.data.subscribe(data => {
            this.users = data['users'].result;
            this.pagination = data['users'].pagination;
        });
        this.userParams.orderBy = 'lastActive';
    }

    resetFilters() {
        delete this.userParams['gender'];
        delete this.userParams['maxAge'];
        delete this.userParams['minAge'];
        this.loadUsers();
    }

    pageChanged(event: any): void {
        this.pagination.currentPage = event.page;
        this.loadUsers();
    }

    loadUsers() {
        this.userService.getUsers(this.pagination.currentPage, this.pagination.itemsPerPage, this.userParams)
            .subscribe((users: PaginatedResult<User[]>) => {
                this.users = users.result;
                this.pagination = users.pagination;
            }, error => {
                this.alertify.error(error);
            });
    }

}
