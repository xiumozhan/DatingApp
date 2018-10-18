/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TokenWatchService } from './token-watch.service';

describe('Service: TokenWatch', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TokenWatchService]
        });
    });

    it('should ...', inject([TokenWatchService], (service: TokenWatchService) => {
        expect(service).toBeTruthy();
    }));
});
