import { Injectable } from '@angular/core';
import { SetReferralResult } from '../interfaces/referrals.interfaces';
import { RogerthatService } from './rogerthat.service';

@Injectable()
export class ReferrerService {

  constructor(private rogerthatService: RogerthatService) {
  }

  set(code: string) {
    return this.rogerthatService.apiCall<SetReferralResult>('referrals.set', { code });
  }
}
