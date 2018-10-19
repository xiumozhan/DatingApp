/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SessionWatchService } from './session-watch.service';

describe('Service: TokenWatch', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SessionWatchService]
        });
    });

    it('should ...', inject([SessionWatchService], (service: SessionWatchService) => {
        expect(service).toBeTruthy();
    }));
});
