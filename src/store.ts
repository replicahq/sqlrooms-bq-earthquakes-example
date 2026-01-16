import { createWasmDuckDbConnector } from '@sqlrooms/duckdb';
import { createMosaicSlice } from '@sqlrooms/mosaic';
import { MosaicSliceState } from '@sqlrooms/mosaic/dist/MosaicSlice';
import {
  BaseRoomConfig,
  createRoomShellSlice,
  createRoomStore,
  LayoutConfig,
  LayoutTypes,
  persistSliceConfigs,
  RoomShellSliceState,
} from '@sqlrooms/room-shell';
import {
  createDefaultSqlEditorConfig,
  createSqlEditorSlice,
  SqlEditorSliceConfig,
  SqlEditorSliceState,
} from '@sqlrooms/sql-editor';
import { DatabaseIcon } from 'lucide-react';
import { MainView } from './components/MainView';
import DataSourcesPanel from './components/data-sources/DataSourcesPanel';
import {
  createMapSettingsSlice,
  MapSettingsConfig,
  MapSettingsSliceState,
} from './MapSettingsSlice';
import {
  createEarthquakeSlice,
  EarthquakeSliceState,
} from './EarthquakeSlice';

export type RoomState = RoomShellSliceState &
  SqlEditorSliceState &
  MosaicSliceState &
  MapSettingsSliceState &
  EarthquakeSliceState;

export const { roomStore, useRoomStore } = createRoomStore<RoomState>(
  persistSliceConfigs(
    {
      name: 'bq-earthquakes-example-app-state-storage',
      sliceConfigSchemas: {
        room: BaseRoomConfig,
        layout: LayoutConfig,
        sqlEditor: SqlEditorSliceConfig,
        mapSettings: MapSettingsConfig,
      },
    },
    (set, get, store) => ({
      // Sql editor slice
      ...createSqlEditorSlice()(set, get, store),

      // Room shell slice - no dataSources since we load from BigQuery
      ...createRoomShellSlice({
        connector: createWasmDuckDbConnector({
          initializationQuery: 'LOAD spatial',
        }),
        config: {
          ...createDefaultSqlEditorConfig(),
          dataSources: [], // Data loaded from BigQuery instead
        },
        layout: {
          config: {
            type: LayoutTypes.enum.mosaic,
            nodes: 'main',
          },
          panels: {
            data: {
              title: 'Data',
              icon: DatabaseIcon,
              component: DataSourcesPanel,
              placement: 'sidebar',
            },
            main: {
              title: 'Main view',
              icon: () => null,
              component: MainView,
              placement: 'main',
            },
          },
        },
      })(set, get, store),

      ...createMosaicSlice()(set, get, store),

      ...createMapSettingsSlice()(set, get, store),

      // Earthquake data slice - loads from BigQuery
      ...createEarthquakeSlice()(set, get, store),
    }),
  ),
);
