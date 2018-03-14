interface StringKeyValue {
  [ key: string ]: string;
}

export interface TimePipeTranslationMapping {
  s: StringKeyValue;
  m: StringKeyValue;
  h: StringKeyValue;
  d: StringKeyValue;
  y: StringKeyValue;
}

export const TRANSLATION_MAPPING: TimePipeTranslationMapping = {
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

export const TIME_DURATION_MAPPING: TimePipeTranslationMapping = {
  s: {
    '=1': 'tff.1_second',
    'other': 'tff.x_seconds',
  },
  m: {
    '=1': 'tff.1_minute',
    'other': 'tff.x_minutes',
  },
  h: {
    '=1': 'tff.1_hour',
    'other': 'tff.x_hours',
  },
  d: {
    '=1': 'tff.1_day',
    'other': 'tff.x_days',
  },
  y: {
    '=1': 'tff.1_year',
    'other': 'tff.x_years',
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
