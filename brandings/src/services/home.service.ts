import { Injectable } from '@angular/core';
import { SupportStatus } from '../interfaces/home';

@Injectable()
export class HomeService {
  getSupportStatus(): SupportStatus {
    const now = new Date();
    // 9-5 on weekdays
    const allowedDays = [ 1, 2, 3, 4, 5 ];
    const allowedHours = [ 8, 9, 10, 11, 12, 13, 14, 15 ];
    const online = allowedDays.includes(now.getUTCDay()) && allowedHours.includes(now.getUTCHours());
    return { online };
  }
}
