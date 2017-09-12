import { Injectable } from '@angular/core';
import { RogerthatService } from './rogerthat.service';
import { SetReferralResult } from '../interfaces/referrals.interfaces';

@Injectable()
export class ReferrerService {

  constructor(private rogerthatService: RogerthatService) {
  }

  set(code: string) {
    return this.rogerthatService.apiCall<SetReferralResult>('referrals.set', { code });
  }
}
