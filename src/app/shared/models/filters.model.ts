import { TestFilters } from '../services/filter2.service';

export interface Filters {
  order: Order
  limit: number
  offset: number
  filters?: TestFilters
}

export interface Order {
  by: OrderBy | undefined
  direction: OrderDirection | undefined
}

export enum OrderDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export enum OrderBy {
  NAME = 'name',
  DATE_ADDED = 'date-added',
  DATE_UPDATED = 'date-updated',
  POPULARITY = 'popularity'
}

export const DefaultOrderFilters: Order[] = [
  {
    by: OrderBy.NAME,
    direction: OrderDirection.ASC
  },
  {
    by: OrderBy.NAME,
    direction: OrderDirection.DESC
  },
  {
    by: OrderBy.DATE_ADDED,
    direction: OrderDirection.ASC
  },
  {
    by: OrderBy.DATE_ADDED,
    direction: OrderDirection.DESC
  },
  {
    by: OrderBy.DATE_UPDATED,
    direction: OrderDirection.ASC
  },
  {
    by: OrderBy.DATE_UPDATED,
    direction: OrderDirection.DESC
  },
  {
    by: OrderBy.POPULARITY,
    direction: OrderDirection.ASC
  },
  {
    by: OrderBy.POPULARITY,
    direction: OrderDirection.DESC
  },
];
