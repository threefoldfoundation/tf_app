import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { RogerthatError } from '../manual_typings/rogerthat-errors';
import { I18nService } from './i18n.service';

export interface ApiCallResult {
  method: string;
  result: string;
  error: string | null;
  tag: string;
}

@Injectable()
export class RogerthatService {

  private resultReceived$: Observable<ApiCallResult>;
  private subject: Subject<ApiCallResult>;

  constructor(private i18nService: I18nService, private ngZone: NgZone) {
    this.resultReceived$ = Observable.create((emitter: Subject<ApiCallResult>) => {
      this.subject = emitter;
    });
  }

  initialize() {
    this.i18nService.use(rogerthat.user.language);
    rogerthat.api.callbacks.resultReceived((method: string, result: any, error: string | null, tag: string) => {
      console.log({ method, result, error, tag });
      this.ngZone.run(() => {
        if (error) {
          this.subject.error({ method, result, error, tag });
        } else {
          this.subject.next({ method, result, error, tag });
        }
      });
    });
  }

  getContext(): Observable<any> {
    return Observable.create((emitter: Subject<any>) => {
      rogerthat.context(success.bind(this), error.bind(this));

      function success(context: any) {
        emitter.next(context);
        emitter.complete();
      }

      function error(err: RogerthatError) {
        emitter.error(err);
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
    console.log(`system.api_call -> ${method}`);
    rogerthat.api.call(method, data, tag);
    return this.resultReceived$.filter(result => result.method === method && result.tag === tag)
      .do(result => console.log(`${method} result`, result.result))
      .map(result => <T>JSON.parse(result.result));
  }
}
