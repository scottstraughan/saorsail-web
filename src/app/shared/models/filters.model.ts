import { Filters} from '../lib/filters';
import { IJSONSerializable } from '../lib/json-serializable';

export class ModelFilters implements IJSONSerializable {
  constructor(
    public order: ModelOrder,
    public limit: number,
    public offset: number,
    public filters?: Filters
  ) { }

  toJSON() {
    return {
      __type: 'ModelFilters',
      order: this.order,
      limit: this.limit,
      offset: this.offset,
      filters: this.filters ? this.filters.toJSON() : undefined
    };
  }

  static fromJSON(
    key: any,
    serialized: any
  ): any {
    if (serialized && serialized.__type === 'ModelFilters') {
      return new ModelFilters(
        serialized.order,
        serialized.limit,
        serialized.offset,
        Filters.fromJSON(key, serialized.filters));
    }

    return serialized;
  }
}

export type ModelOrder = {
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

export const DefaultOrderFilters: ModelOrder[] = [
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
