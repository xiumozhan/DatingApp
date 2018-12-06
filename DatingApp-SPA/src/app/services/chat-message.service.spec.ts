/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ChatMessageService } from './chat-message.service';

describe('Service: ChatMessage', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ChatMessageService]
        });
    });

    it('should ...', inject([ChatMessageService], (service: ChatMessageService) => {
        expect(service).toBeTruthy();
    }));
});
