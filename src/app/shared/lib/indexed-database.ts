import { ApplicationService } from '../services/application.service';
import { ModelFilters } from '../models/filters.model';
import { IJSONSerializable } from './json-serializable';

export class IndexedDatabase {
  /**
   * Get an object store from the IndexedDB.
   */
  static getObjectStore(
    request: IndexedDBRequest
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const db = indexedDB.open(request.databaseName);

      db.onsuccess = () => {
        const store = db.result
          .transaction(request.table, 'readonly')
          .objectStore(request.table);

        resolve({
          db: db,
          store: store
        });
      }

      db.onerror = () => reject(db.error)
    });
  }

  static getAll(
    request: IndexedDBRequest
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      IndexedDatabase.getObjectStore(request)
        .then(accessor => {
          const getRequest = accessor.store.getAll();

          // Success
          getRequest.onsuccess = function() {
            resolve(ApplicationService.restrict(request.filters, getRequest.result));
            accessor.dv.close();
          }

          // Error
          getRequest.onerror = () =>
            reject(getRequest.error);
        })
    });
  }
}

/**
 * Wrapper that provides information to perform an IndexedDB request.
 */
export class IndexedDBRequest implements IJSONSerializable {
  constructor(
    public databaseName: string,
    public table: string,
    public filters: ModelFilters
  ) { }

  /**
   * @inheritdoc
   */
  toJSON(): unknown {
    return {
      __type: 'WorkerData',
      databaseName: this.databaseName,
      table: this.table,
      filters: this.filters.toJSON(),
    };
  }

  /**
   * @inheritdoc
   */
  static fromJSON(
    key: any,
    serialized: any
  ): any {
    if (serialized && serialized.__type === 'WorkerData') {
      return new IndexedDBRequest(
        serialized.databaseName,
        serialized.table,
        ModelFilters.fromJSON(key, serialized.filters));
    }

    return serialized;
  }
}