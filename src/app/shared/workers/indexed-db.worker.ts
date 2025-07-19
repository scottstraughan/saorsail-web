import { IndexedDBRequest, IndexedDatabase } from '../lib/indexed-database';

/**
 * Listen for indexed db requests.
 */
addEventListener('message', async ({ data }) => {
  const workerData: IndexedDBRequest = JSON.parse(data, IndexedDBRequest.fromJSON);
  postMessage(await IndexedDatabase.getAll(workerData));
});
