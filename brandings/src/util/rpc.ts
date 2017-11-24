import { of } from 'rxjs/observable/of';
import { ApiError, ApiRequestStatus } from '../interfaces/rpc.interfaces';
import { ApiCallError, ApiCallResult } from '../services/rogerthat.service';

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

export function handleApiError(action: any, response: ApiCallError) {
  return of(new action(transformErrorResponse(response.apiCallResult)));
}
