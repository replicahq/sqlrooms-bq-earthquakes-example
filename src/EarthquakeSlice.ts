import { BaseRoomStoreState, createSlice } from '@sqlrooms/room-shell';
import { DuckDbSliceState, WasmDuckDbConnector } from '@sqlrooms/duckdb';
import { produce } from 'immer';
import { tableFromIPC } from 'apache-arrow';
import { base64ToArrowIPC } from '@sqlrooms/bigquery/client';

export interface EarthquakeLoadMeta {
  rowCount: number;
  loadTimeMs: number;
}

export type EarthquakeSliceState = {
  earthquakes: {
    isLoading: boolean;
    error: string | null;
    meta: EarthquakeLoadMeta | null;
    loadData: (limit?: number) => Promise<void>;
  };
};

export function createEarthquakeSlice() {
  return createSlice<
    EarthquakeSliceState,
    BaseRoomStoreState & EarthquakeSliceState & DuckDbSliceState
  >((set, get, _store) => {
    const updateState = (updates: Partial<EarthquakeSliceState['earthquakes']>) => {
      set((state) =>
        produce(state, (draft) => {
          Object.assign(draft.earthquakes, updates);
        }),
      );
    };

    return {
      earthquakes: {
        isLoading: false,
        error: null,
        meta: null,

        loadData: async (limit = 50000) => {
          updateState({ isLoading: true, error: null });

          try {
            // Fetch earthquake data from server
            const response = await fetch('/api/earthquakes/load', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ limit }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log(`[earthquakes] Received ${data.rowCount} rows`);

            // Load into DuckDB using the bigquery package utilities
            const db = get().db;
            if (!db?.connector) {
              throw new Error('DuckDB not ready');
            }

            // Drop existing table
            await db.connector.query('DROP TABLE IF EXISTS earthquakes');

            // Decode Arrow and insert
            const arrowBytes = base64ToArrowIPC(data.data);
            const arrowTable = tableFromIPC(arrowBytes);
            const conn = (db.connector as WasmDuckDbConnector).getConnection();
            await conn.insertArrowTable(arrowTable, { name: 'earthquakes' });

            console.log('[earthquakes] Data loaded into DuckDB');

            // Refresh table schemas
            await db.refreshTableSchemas();

            updateState({
              isLoading: false,
              meta: {
                rowCount: data.rowCount,
                loadTimeMs: data.loadTimeMs,
              },
            });
          } catch (error) {
            console.error('[earthquakes] Error:', error);
            updateState({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to load data',
            });
          }
        },
      },
    };
  });
}
