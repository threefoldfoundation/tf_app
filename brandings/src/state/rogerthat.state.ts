import { createSelector } from '@ngrx/store';
import { IAppState } from '../app/app.state';
import { ServiceData, UserData } from '../interfaces/rogerthat';
import { apiRequestInitial, ApiRequestStatus } from '../interfaces/rpc.interfaces';
import { ListNewsItemsResult } from '../manual_typings/rogerthat';
import { ApiCallResult } from '../services/rogerthat.service';

export interface IRogerthatState<UserDataType = any, ServiceDataType = any> {
  apiCallResult: ApiCallResult | null;
  newsItemList: ListNewsItemsResult;
  newsItemListStatus: ApiRequestStatus;
  userData: UserDataType;
  serviceData: ServiceDataType;
}

export const getRogerthatState = (state: IAppState) => state.rogerthat;

export const initialRogerthatState: IRogerthatState<UserData, ServiceData> = {
  apiCallResult: null,
  newsItemList: { cursor: '', items: [] },
  newsItemListStatus: apiRequestInitial,
  userData: {},
  serviceData: {},
};

export const getApicallResult = createSelector(getRogerthatState, s => s.apiCallResult);

export const getNewsItemList = createSelector(getRogerthatState, s => s.newsItemList);
export const getNewsItemListStatus = createSelector(getRogerthatState, s => s.newsItemListStatus);

export const getUserData = createSelector(getRogerthatState, s => s.userData);
export const getServiceData = createSelector(getRogerthatState, s => s.serviceData);

