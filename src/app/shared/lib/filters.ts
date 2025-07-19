import { Params } from '@angular/router';
import { IJSONSerializable } from './json-serializable';

/**
 * Filters holds a list of IFilters.
 */
export class Filters implements IJSONSerializable {
  protected _filters: Map<string, IFilter> = new Map<string, IFilter>();
  
  constructor(
    filters: IFilter[] = []
  ) {
    this.setFromArray(filters);
  }

  setFromArray(
    filters: IFilter[]
  ) {
    for (const filter of filters) {
      this.addFilter(filter);
    }
  }

  setFromMap(
    filters: Map<string, IFilter>
  ) {
    this._filters = filters;
  }

  addFilter(
    filter: IFilter
  ) {
    this._filters.set(filter.id, filter);
  }

  getFilter<T = any>(
    id: string
  ): T {
    if (!this._filters.has(id)) {
      throw new Error(`No filter group found with id '${id}'.`);
    }

    return <T> this._filters.get(id);
  }

  toParams(): {} {
    let params: {} = {};

    for (const filter of this._filters.values()) {
      if (!filter.hasValidValue())
        continue;

      params = {...params, ...filter.toParams()};
    }

    return params;
  }

  mergeFromParams(
    params: any
  ) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      const filter = this._filters.get(paramKey);

      if (!filter)
        continue;

      filter.mergeFromParams(paramValue);
    }
  }


  toJSON() {
    return {
      __type: 'Filters',
      filters: Array.from(this._filters.entries())
    };
  }

  static fromJSON(
    key: any,
    serialized: any
  ): any {
    if (serialized && serialized.__type === 'Filters') {
      const filters = new Filters();

      const filtersMap = serialized.filters.map(
        ([filterKey, serializedFilter]: [string, any]) => {
          switch (serializedFilter.__type) {
            case 'MultiFilterGroup':
              return [filterKey, MultiFilterGroup.fromJSON(key, serializedFilter)];
            case 'FilterValue':
              return [filterKey, FilterValue.fromJSON(key, serializedFilter)];
          }

          return serializedFilter;
        });

      filters.setFromMap(new Map(filtersMap));
      return filters;
    }

    return serialized;
  }
}

/**
 * Holds a group of filters.
 */
export class MultiFilterGroup<T> implements IFilter, IJSONSerializable {
  private _values: Map<string, FilterValue<T>> = new Map<string, FilterValue<T>>()

  constructor(
    protected _id: string,
    protected filters: FilterValue<T>[] = []
  ) {
    for (const filter of filters) {
      this._values.set(filter.id, filter);
    }
  }

  get id(): string {
    return this._id;
  }

  hasValidValue(): boolean {
    return this.values.some(filter => filter.enabled);
  }

  get values(): FilterValue<T>[] {
    return Array.from(this._values.values());
  }

  set values(value: Map<string, FilterValue<T>>) {
    this._values = value;
  }

  addFilterValue(
    filterValue: FilterValue<T>,
  ) {
    this._values.set(filterValue.id, filterValue);
  }

  setEnabled(
    filterId: any,
    enabled: boolean
  ) {
    const filter = this._values.get(filterId);

    if (!filter) {
      console.error('no filter group found with id ' + filterId);
      return;
    }

    filter.enabled = enabled;
  }

  allEnabled(): FilterValue[] {
    return this.values.filter(filterValue => filterValue.enabled);
  }

  mergeFromParams(
    filterIds: any
  ): void {
    if (!Array.isArray(filterIds)) {
      filterIds = [filterIds];
    }

    for (const filterId of filterIds) {
      this.setEnabled(filterId, true);
    }
  }

  toParams(): Object {
    let params: any = {};
    params[this.id] = this.allEnabled().map(f => f.id);
    return params;
  }

  toJSON() {
    return {
      __type: 'MultiFilterGroup',
      id: this.id,
      values: Array.from(this._values)
    };
  }

  static fromJSON(
    key: any,
    serialized: any
  ): MultiFilterGroup<any> {
    if (serialized && serialized.__type === 'MultiFilterGroup') {
      const instance = new MultiFilterGroup(serialized.id);

      const filterValuesMap = serialized.values.map(
        ([filterKey, serializedFilter]: [string, any]) => {
          switch (serializedFilter.__type) {
            case 'FilterValue':
              return [filterKey, FilterValue.fromJSON(key, serializedFilter)];
          }

          return serializedFilter;
        });

      instance.values = new Map(filterValuesMap);
      return instance;
    }

    return serialized;
  }
}

/**
 * Holds a specific filter value.
 */
export class FilterValue<T=any> implements IFilter, IJSONSerializable {
  constructor(
    private _id: string,
    private _value: T,
    private _enabled: boolean = false
  ) { }

  get id(): string {
    return this._id;
  }

  hasValidValue(): boolean {
    return this.enabled;
  }

  get value(): T {
    return this._value;
  }

  set value(value: T) {
    this._value = value;
  }

  get enabled(): boolean {
    return this._enabled;
  }

  set enabled(value: boolean) {
    this._enabled = value;
  }

  mergeFromParams(
    value: any
  ): void {
    console.log(value)
  }

  toParams(): any {
    let params: any = {};

    params[this.id] = this.value;
    return params;
  }

  static fromJSON(
    key: string,
    serialized: any
  ): FilterValue {
    return new FilterValue(
      serialized.id, serialized.value, serialized.enabled);
  }

  toJSON(): any {
    return {
      __type: 'FilterValue',
      id: this.id,
      value: this.value,
      enabled: this.enabled
    };
  }
}

/**
 * Keyword filter.
 */
export class KeywordFilter extends FilterValue<string> {
  constructor() {
    super('keywords', '', true);
  }

  override get enabled(): boolean {
    return this.value.length > 0;
  }
}

/**
 * Interface for IFilter.
 */
export interface IFilter {
  /**
   * Get the id of the filter.
   */
  get id(): string;

  /**
   * If the filter has a valid value.
   */
  hasValidValue(): boolean;

  /**
   * Merge the values provided into the filter.
   * @param value
   */
  mergeFromParams(
    value: any
  ): void;

  /**
   * Convert the filters into Params.
   */
  toParams(): Params;

  /**
   * Convert the filters into a json string.
   */
  toJSON(): any;
}
