export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface JoinOptions {
  columns?: string;
  joins?: {
    table: string;
    columns?: string;
    foreignKey?: string;
    alias?: string;
  }[];
}
export type WithJoins<T> = T & Record<string, any>;
