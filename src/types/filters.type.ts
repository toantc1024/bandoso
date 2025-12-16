export interface FilterCondition<T = any> {
  column: keyof T;
  operator:
    | "eq"
    | "neq"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "like"
    | "ilike"
    | "in"
    | "is"
    | "not";
  value: any;
}

export interface SortOption<T = any> {
  column: keyof T;
  ascending?: boolean;
}

export interface Filters<T = any> {
  conditions?: FilterCondition<T>[];
  sort?: SortOption<T>[];
  search?: {
    columns: (keyof T)[];
    query: string;
  };
}
