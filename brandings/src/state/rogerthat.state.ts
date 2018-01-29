import { createSelector } from '@ngrx/store';
import { IAppState } from '../app/app.state';
import { ServiceData, UserData } from '../interfaces/rogerthat';
import { apiRequestInitial, ApiRequestStatus } from '../interfaces/rpc.interfaces';
import { BadgeUpdated, BadgeUpdatedKey, ListNewsItemsResult } from '../manual_typings/rogerthat';
import { ApiCallResult } from '../services/rogerthat.service';

export interface IRogerthatState<UserDataType = any, ServiceDataType = any> {
  apiCallResult: ApiCallResult | null;
  newsItemList: ListNewsItemsResult;
  newsItemListStatus: ApiRequestStatus;
  userData: UserDataType;
  serviceData: ServiceDataType;
  badges: BadgeUpdated[];
}

export const getRogerthatState = (state: IAppState) => state.rogerthat;

export const initialRogerthatState: IRogerthatState<UserData, ServiceData> = {
  apiCallResult: null,
  newsItemList: { cursor: '', items: [] },
  newsItemListStatus: apiRequestInitial,
  userData: {},
  serviceData: {},
  badges: [],
};

export const getApicallResult = createSelector(getRogerthatState, s => s.apiCallResult);

export const getNewsItemList = createSelector(getRogerthatState, s => s.newsItemList);
export const getNewsItemListStatus = createSelector(getRogerthatState, s => s.newsItemListStatus);

export const getUserData = createSelector(getRogerthatState, s => s.userData);
export const getServiceData = createSelector(getRogerthatState, s => s.serviceData);

export const getBadges = createSelector(getRogerthatState, s => s.badges);
export const getMessagesBadgeCount = createSelector(getBadges, badges => getBadgeCount('messages', badges));
export const getNewsBadge = createSelector(getBadges, badges => getBadgeCount('news', badges));

export function getBadgeCount(key: BadgeUpdatedKey, badges: BadgeUpdated[]): number {
  const badge = badges.find(b => b.key === key);
  if (badge) {
    return badge.count;
  }
  return 0;
}
