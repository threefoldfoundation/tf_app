import { createSelector } from '@ngrx/store';
import { IAppState } from '../app/app.state';
import { ServiceData, UserData } from '../interfaces/rogerthat';
import { apiRequestInitial, ApiRequestStatus } from '../interfaces/rpc.interfaces';
import { CryptoAddress, QrCodeScannedContent } from '../manual_typings/rogerthat';
import { RogerthatError } from '../manual_typings/rogerthat-errors';
import { ApiCallResult } from '../services/rogerthat.service';

export interface IRogerthatState<UserDataType = any, ServiceDataType = any> {
  apiCallResult: ApiCallResult | null;
  userData: UserDataType;
  serviceData: ServiceDataType;
  address: CryptoAddress | null;
  addressStatus: ApiRequestStatus<RogerthatError>;
  qrCodeContent: QrCodeScannedContent | null;
  qrCodeError: RogerthatError | null;
}

export const getRogerthatState = (state: IAppState) => state.rogerthat;

export const initialRogerthatState: IRogerthatState<UserData, ServiceData> = {
  apiCallResult: null,
  userData: {},
  serviceData: {},
  address: null,
  addressStatus: apiRequestInitial,
  qrCodeContent: null,
  qrCodeError: null,
};

export const getApicallResult = createSelector(getRogerthatState, s => s.apiCallResult);

export const getQrCodeContent = createSelector(getRogerthatState, s => s.qrCodeContent);
export const getQrCodeError = createSelector(getRogerthatState, s => s.qrCodeError);

export const getAddress = createSelector(getRogerthatState, s => s.address);
export const getAddressStatus = createSelector(getRogerthatState, s => s.addressStatus);

export const getUserData = createSelector(getRogerthatState, s => s.userData);
export const getServiceData = createSelector(getRogerthatState, s => s.serviceData);
