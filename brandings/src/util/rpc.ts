import { Observable } from 'rxjs/Observable';
import { ApiError, ApiRequestStatus } from '../interfaces/rpc.interfaces';
import { ApiCallResult } from '../services/rogerthat.service';

export function transformErrorResponse(response: ApiCallResult): ApiRequestStatus {
  const apiError: ApiError = {
    error: <string>response.error,
    data: response.result ? JSON.parse(response.result) : null,
  };
  return {
    error: apiError,
    loading: false,
    success: false,
  };
}

export function handleApiError(action: any, response: ApiCallResult) {
  return Observable.of(new action(transformErrorResponse(response)));
}
