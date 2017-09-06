import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { RogerthatError } from '../manual_typings/rogerthat-errors';
import { I18nService } from './i18n.service';
import 'rxjs/add/operator/finally';

export interface ApiCallResult {
  method: string;
  result: string;
  error: string | null;
  tag: string;
}

@Injectable()
export class RogerthatService {

  private resultReceived$: Observable<ApiCallResult>;

  constructor(private i18nService: I18nService, private ngZone: NgZone) {
    this.resultReceived$ = Observable.create((emitter: Subject<ApiCallResult>) => {
      rogerthat.api.callbacks.resultReceived((method: string, result: any, error: string | null, tag: string) => {
        this.ngZone.run(() => {
          if (error) {
            emitter.error({ method, result, error, tag });
          } else {
            emitter.next({ method, result, error, tag });
          }
        });
      });
    });
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

  apiCall<T>(method: string, data?: any, tag?: string | null): Observable<T> {
    if (!tag) {
      tag = rogerthat.util.uuid();
    }
    if (data) {
      data = JSON.stringify(data);
    }
    rogerthat.api.call(method, data, tag);
    return this.resultReceived$.filter(result => result.method === method && result.tag === tag)
      .map(result => <T>JSON.parse(result.result));
  }
}
