import { AsyncPipe, I18nPluralPipe } from '@angular/common';
import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { interval, Observable } from 'rxjs';
import { distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { getTimePipeValue, TimePipeTranslationMapping, TRANSLATION_MAPPING } from './time-pipe-data';

/**
 * Displays how long ago a date was in seconds / minutes / hours  / days or years.
 * Refreshes every <refreshTime> seconds.
 */
@Pipe({
  name: 'time',
  pure: false,
})
export class TimePipe implements OnDestroy, PipeTransform {
  private value: Date;
  private timer: Observable<string>;
  private readonly asyncPipe: AsyncPipe;

  constructor(private ref: ChangeDetectorRef,
              private translate: TranslateService,
              private i18nPluralPipe: I18nPluralPipe) {
    this.asyncPipe = new AsyncPipe(ref);
  }

  transform(obj: Date): string {
    if (!obj) {
      return '';
    }
    if (!(obj instanceof Date)) {
      throw new Error('TimePipe only works with Dates');
    }
    this.value = obj;
    if (!this.timer) {
      this.timer = this.getObservable();
    }
    return <string>this.asyncPipe.transform(this.timer);
  }

  ngOnDestroy() {
    this.asyncPipe.ngOnDestroy();
  }

  private getTranslationKey(value: number, timeType: keyof TimePipeTranslationMapping) {
    return this.i18nPluralPipe.transform(value, TRANSLATION_MAPPING[ timeType ]);
  }

  private getTimeDiff() {
    return (new Date().getTime() - this.value.getTime()) / 1000;
  }

  private getObservable() {
    return interval(5000).pipe(
      startWith(0),
      map(() => getTimePipeValue(this.getTimeDiff())),
      distinctUntilChanged((first, second) => first.value === second.value && first.timeType === second.timeType),
      switchMap(val => this.getTimeString(val.value, val.timeType)),
    );
  }

  private getTimeString(value: number, timeType: keyof TimePipeTranslationMapping): Observable<string> {
    return this.translate.stream(this.getTranslationKey(value, timeType), { value });
  }
}
