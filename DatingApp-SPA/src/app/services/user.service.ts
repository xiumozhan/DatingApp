import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { PaginatedResult } from '../models/pagination';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getUsers(page?, itemsPerPage?, userParams?): Observable<PaginatedResult<User[]>> {
        const paginatedResult: PaginatedResult<User[]> = new PaginatedResult<User[]>();
        let params = new HttpParams();
        if (page !== null && itemsPerPage !== null) {
            params = params.append('pageNumber', page);
            params = params.append('pageSize', itemsPerPage);
        }
        if (userParams != null) {
            Object.keys(userParams).forEach( key => {
                params = params.append(key, userParams[key]);
            } );
        }
        return this.http.get<User[]>(`${this.baseUrl}users`, { observe: 'response', params })
            .pipe(
                map(response => {
                    paginatedResult.result = response.body;
                    if (response.headers.get('Pagination') !== null) {
                        paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
                    }
                    return paginatedResult;
                })
            );
    }

    getUser(id): Observable<User> {
        return this.http.get<User>(`${this.baseUrl}users/${id}`);
    }

    updateUser(id: number, user: User) {
        return this.http.put(`${this.baseUrl}users/${id}`, user);
    }

    deletePhoto(userId: number, id: number) {
        return this.http.delete(`${this.baseUrl}users/${userId}/photos/${id}`);
    }

    setProfileImage(userId: number, imageData: FormData) {
        return this.http.put(`${this.baseUrl}users/${userId}/photos/setAvatar`, imageData);
    }
}
