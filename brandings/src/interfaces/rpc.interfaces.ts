export interface ApiError {
  error: string;
  data: { [key: string]: any } | null;
}

export interface ApiRequestStatus {
  loading: boolean;
  success: boolean;
  error: ApiError | null;
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
