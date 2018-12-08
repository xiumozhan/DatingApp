/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ChatMessageThreadService } from './chat-message-thread.service';

describe('Service: ChatMessageThread', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ChatMessageThreadService]
        });
    });

    it('should ...', inject([ChatMessageThreadService], (service: ChatMessageThreadService) => {
        expect(service).toBeTruthy();
    }));
});
