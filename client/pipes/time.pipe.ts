import { AsyncPipe, I18nPluralPipe } from '@angular/common';
import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import { distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';

interface StringKeyValue {
  [key: string]: string;
}

export interface TimePipeTranslationMapping {
  s: StringKeyValue;
  m: StringKeyValue;
  h: StringKeyValue;
  d: StringKeyValue;
  y: StringKeyValue;
}

export const translationMapping: TimePipeTranslationMapping = {
  s: {
    '=0': 'tff.just_now',
    '=1': 'tff.just_now',
    '=2': 'tff.just_now',
    '=3': 'tff.just_now',
    '=4': 'tff.just_now',
    '=5': 'tff.just_now',
    'other': 'tff.x_seconds_ago',
  },
  m: {
    '=1': 'tff.1_minute_ago',
    'other': 'tff.x_minutes_ago',
  },
  h: {
    '=1': 'tff.1_hour_ago',
    'other': 'tff.x_hours_ago',
  },
  d: {
    '=1': 'tff.1_day_ago',
    'other': 'tff.x_days_ago',
  },
  y: {
    '=1': 'tff.1_year_ago',
    'other': 'tff.x_years_ago',
  },
};

export function getTimePipeValue(seconds: number) {
  let timeType: keyof TimePipeTranslationMapping;
  let value: number;
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const year = day * 365;
  if (seconds < minute) {
    value = Math.floor(seconds);
    timeType = 's';
  } else if (seconds < hour) {
    value = Math.floor(seconds / minute);
    timeType = 'm';
  } else if (seconds < day) {
    value = Math.floor(seconds / hour);
    timeType = 'h';
  } else if (seconds < year) {
    value = Math.floor(seconds / day);
    timeType = 'd';
  } else {
    value = Math.floor(seconds / year);
    timeType = 'y';
  }
  return { value, timeType };
}

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
    return this.i18nPluralPipe.transform(value, translationMapping[ timeType ]);
  }

  private getTimeDiff() {
    return (new Date().getTime() - this.value.getTime()) / 1000;
  }

  private getObservable() {
    return IntervalObservable.create(5000).pipe(
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
