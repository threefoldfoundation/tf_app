export interface PaginatedResult<T> {
  cursor: string | null;
  more: boolean;
  results: T[];
}
