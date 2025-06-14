import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { Application, Category } from '../models/repository.model';
import { PopularDatabaseItem } from './repository/popular-repository.service';
import Dexie, { IndexableType, Table } from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService extends Dexie {
  static readonly DATABASE_NAME = 'swc-data';
  static readonly DATABASE_VERSION = 1;

  applications!: Table<Application, string>;
  categories!: Table<Category, number>;
  popularity!: Table<PopularDatabaseItem, string>;

  /**
   * Constructor.
   */
  constructor() {
    super(DatabaseService.DATABASE_NAME);
    this.initialize();
  }

  /**
   * Clear the database.
   */
  clear(
    tableName?: string
  ): Observable<any> {
    if (tableName) {
      return from(this.table(tableName).clear());
    }

    return from(Promise.allSettled([
      this.applications.clear(),
      this.categories.clear(),
      this.popularity.clear(),
    ]));
  }

  /**
   * Check if the database is in a correct state.
   */
  async inValidState(
    storeName: string
  ): Promise<boolean> {
    return (await this.table(storeName).count()) > 0;
  }

  /**
   * Reset the table state by deleting it all and then reinitializing it.
   */
  async reset(): Promise<void> {
    await this.delete();
    return this.initialize();
  }

  /**
   * Returns entry by id.
   * @param storeName The name of the store to query
   * @param id The entry id
   */
  getByID<T>(
    storeName: string,
    id: string | number
  ): Observable<T> {
    return from(
      this.verifyValidState(storeName).then(() =>
        this.table(storeName).get(id))
    )
  }

  /**
   * Return all elements from one store
   * @param storeName The name of the store to select the items
   */
  getAll<T>(
    storeName: string,
  ): Observable<T[]> {
    return from(
      this.verifyValidState(storeName).then(() =>
        this.table(storeName).toArray())
    )
  }

  /**
   * Bulk add to the table.
   * @param storeName
   * @param values
   */
  bulkAdd<T>(
    storeName: string,
    values: Array<T>
  ): Observable<IndexableType> {
    return from(this.table(storeName).bulkAdd(values));
  }

  /**
   * Initialize the database.
   */
  private initialize() {
    this.close();

    this.version(DatabaseService.DATABASE_VERSION).stores({
      applications: 'namespace',
      categories: '++id',
      popularity: 'namespace',
    });

    this.open();
  }

  /**
   * Verify if the database is in a correct state to work with. If not, redirect to the welcome page to re-setup.
   */
  private async verifyValidState(
    storeName: string
  ) {
    if (!await this.inValidState(storeName)) {
      window.location.href = '/welcome';
      return ;
    }
  }
}