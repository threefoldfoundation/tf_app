import { ApiErrorResponse } from '../../../framework/client/sample/interfaces/rpc.interfaces';

export interface ApiRequestStatus {
  loading: boolean;
  success: boolean;
  error: ApiErrorResponse | null;
}

export const apiRequestInitial: ApiRequestStatus = {
  loading: false,
  success: false,
  error: null,
};

export const apiRequestLoading: ApiRequestStatus = {
  loading: true,
  success: false,
  error: null,
};

export const apiRequestSuccess: ApiRequestStatus = {
  loading: false,
  success: true,
  error: null,
};
