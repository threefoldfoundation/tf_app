import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { RogerthatError } from '../manual_typings/rogerthat-errors';
import { I18nService } from './i18n.service';

@Injectable()
export class RogerthatService {
  constructor(private i18nService: I18nService) {
  }

  initialize() {
    this.i18nService.use(rogerthat.user.language);
  }

  getContext(): Observable<any> {
    return Observable.create((emitter: Subject<any>) => {
      rogerthat.context(success.bind(this), error.bind(this));

      function success(context: any) {
        emitter.next(context);
        emitter.complete();
      }

      function error(error: RogerthatError) {
        emitter.error(error);
      }
    });
  }
}
