import { Params } from '@angular/router';

export class TestFilters {
  protected _filters: Map<string, TestFilter> = new Map<string, TestFilter>()
  
  constructor(
    filters: any[] = []
  ) {
    for (const filter of filters) {
      this.addFilter(filter);
    }
  }

  get filters(): MapIterator<TestFilter> {
    return this._filters.values();
  }

  set filters(
    filters: TestFilter[]
  ) {
    for (const filter of filters) {
      this._filters.set(filter.key, filter);
    }
  }

  addFilter(
    filter: TestFilter,
  ) {
    this._filters.set(filter.key, filter);
  }

  getFilter<T = any>(
    key: string
  ): T {
    if (!this._filters.has(key)) {
      throw new Error('No key found in filters.');
    }

    return <T> this._filters.get(key);
  }

  toParams(): Params {
    const params: Params = {};

    for (const filter of this._filters.values()) {
      params[filter.key] = filter.toParams();
    }

    return params;
  }

  mergeFromParams(
    params: Params
  ) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      const filter = this._filters.get(paramKey);

      if (!filter)
        continue;

      filter.mergeFromParams(paramValue);
    }
  }
}

export class TestFilter {
  constructor(
    protected _key: string,
    protected _value: any
  ) { }

  get key(): string {
    return this._key;
  }

  get value(): any {
    return this._value;
  }

  set value(
    value: any
  ) {
    this._value = value;
  }

  mergeFromParams(
    value: any
  ) {
    this.value = value;
  }

  toParams(): any {
    return this.value;
  }
}

export class TestBooleanFilterGroup extends TestFilter {
  constructor(
    _key: string,
    _value: string[],
    protected allowMulti: boolean = true
  ) {
    super(_key, new Map<string, boolean>());
    this.setFromArray(_value);
  }

  override get value(): Map<string, boolean> {
    return this._value;
  }

  override set value(
    value: Map<string, boolean>
  ) {
    this._value = value;
  }

  override mergeFromParams(
    value: any
  ) {
    if (!Array.isArray(value)) {
      value = [value];
    }

    this.setFromArray(value, true);
  }

  override toParams(): any {
    return this.getEnabled();
  }

  disableAll() {
    for (const [key, value] of this._value) {
      this._value.set(key, false);
    }
  }

  setEnabled(
    key: string,
    enabled: boolean
  ) {
    if (!this.allowMulti)
      this.disableAll();

    this._value.set(key, enabled);
  }

  getEnabled(): string[] {
    const values = [];

    for (const [key, value] of this._value) {
      if (value == true)
        values.push(key);
    }

    return values;
  }

  setFromArray(
    values: string[],
    enabled: boolean = false
  ) {
    for (const value of values) {
      this._value.set(value, enabled);
    }

    if (!this.allowMulti && this.getEnabled().length > 1)
      this.disableAll();
  }
}
