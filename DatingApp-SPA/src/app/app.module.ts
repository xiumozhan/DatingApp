import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDropdownModule, TabsModule, BsDatepickerModule, PaginationModule, ButtonsModule, ModalModule,
    TooltipModule } from 'ngx-bootstrap';
import { RouterModule } from '@angular/router';
import { JwtModule } from '@auth0/angular-jwt';
import { NgxGalleryModule } from 'ngx-gallery';
import { FileUploadModule } from 'ng2-file-upload';
import { TimeAgoPipe } from 'time-ago-pipe';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxImageGalleryModule } from 'ngx-image-gallery';

import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { AuthService } from './services/auth.service';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { ErrorInterceptorProvider } from './services/error.interceptor';
import { AlertifyService } from './services/alertify.service';
import { MemberListComponent } from './members/member-list/member-list.component';
import { ListsComponent } from './lists/lists.component';
import { MessagesComponent } from './messages/messages.component';
import { appRoutes } from './routes';
import { AuthGuard } from './guards/auth.guard';
import { UserService } from './services/user.service';
import { MemberCardComponent } from './members/member-card/member-card.component';
import { MemberDetailComponent } from './members/member-detail/member-detail.component';
import { MemberDetailResolver } from './resolvers/member-detail.resolver';
import { MemberListResolver } from './resolvers/member-list.resolver';
import { MemberEditComponent } from './members/member-edit/member-edit.component';
import { MemberEditResolver } from './resolvers/member-edit.resolver';
import { PreventUnsavedChanges } from './guards/prevent-unsaved-changes.guard';
import { PhotoEditorComponent } from './members/photo-editor/photo-editor.component';
import { ConfirmModalComponent } from './modals/confirm-modal/confirm-modal.component';
import { SessionExpiredModalComponent } from './modals/session-expired-modal/session-expired-modal.component';
import { SessionWatchService } from './services/session-watch.service';
import { InactivityModalComponent } from './modals/inactivity-modal/inactivity-modal.component';
import { ImageProfileUploadModalComponent } from './modals/image-profile-upload-modal/image-profile-upload-modal.component';
import { PhotoUploadModalComponent } from './modals/photo-upload-modal/photo-upload-modal.component';
import { ListsResolver } from './resolvers/lists.resolver';
import { ChatMessageService } from './services/chat-message.service';

export const tokenGetter = () => {
    return localStorage.getItem('token');
};

@NgModule({
    declarations: [
        AppComponent,
        NavComponent,
        HomeComponent,
        RegisterComponent,
        MemberListComponent,
        ListsComponent,
        MessagesComponent,
        MemberCardComponent,
        MemberDetailComponent,
        MemberEditComponent,
        PhotoEditorComponent,
        TimeAgoPipe,
        ConfirmModalComponent,
        SessionExpiredModalComponent,
        InactivityModalComponent,
        ImageProfileUploadModalComponent,
        PhotoUploadModalComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        BsDropdownModule.forRoot(),
        BsDatepickerModule.forRoot(),
        ModalModule.forRoot(),
        PaginationModule.forRoot(),
        TabsModule.forRoot(),
        ButtonsModule.forRoot(),
        TooltipModule.forRoot(),
        RouterModule.forRoot(appRoutes, {
            onSameUrlNavigation: 'reload'
        }),
        NgxGalleryModule,
        FileUploadModule,
        JwtModule.forRoot({
            config: {
                tokenGetter: tokenGetter,
                whitelistedDomains: ['localhost:5000'],
                blacklistedRoutes: ['localhost:5000/api/auth']
            }
        }),
        NgIdleKeepaliveModule.forRoot(),
        ImageCropperModule,
        NgxImageGalleryModule,
    ],
    providers: [
        AuthService,
        ErrorInterceptorProvider,
        AlertifyService,
        AuthGuard,
        UserService,
        MemberDetailResolver,
        MemberListResolver,
        MemberEditResolver,
        ListsResolver,
        PreventUnsavedChanges,
        SessionWatchService,
        ChatMessageService
    ],
    bootstrap: [
        AppComponent
    ],
    entryComponents: [
        ConfirmModalComponent,
        SessionExpiredModalComponent,
        InactivityModalComponent,
        ImageProfileUploadModalComponent,
        PhotoUploadModalComponent
    ]
})
export class AppModule { }
