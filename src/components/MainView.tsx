import { SpinnerPane, Button } from '@sqlrooms/ui';
import { useEffect } from 'react';
import { useRoomStore } from '../store';
import MapView from './map/MapView';
import FiltersPanel from './filters/FiltersPanel';

export const MainView = () => {
  const mosaicConn = useRoomStore((state) => state.mosaic.connection);
  const isTableReady = useRoomStore((state) =>
    state.db.tables.find(({ table: { table } }) => table === 'earthquakes'),
  );
  const isLoading = useRoomStore((state) => state.earthquakes.isLoading);
  const error = useRoomStore((state) => state.earthquakes.error);
  const meta = useRoomStore((state) => state.earthquakes.meta);
  const loadData = useRoomStore((state) => state.earthquakes.loadData);

  // Auto-load data when DuckDB is ready (only once, don't retry on error)
  useEffect(() => {
    if (mosaicConn.status === 'ready' && !isTableReady && !isLoading && !meta && !error) {
      loadData();
    }
  }, [mosaicConn.status, isTableReady, isLoading, meta, error, loadData]);

  if (mosaicConn.status === 'loading') {
    return <SpinnerPane className="h-full w-full" />;
  } else if (mosaicConn.status === 'error') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-4 text-red-500">
        <h2 className="text-2xl font-bold">
          Error initializing Mosaic:{' '}
          {mosaicConn.error instanceof Error
            ? mosaicConn.error.message
            : 'Unknown error'}
        </h2>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-4">
        <SpinnerPane className="h-32 w-32" />
        <p className="text-lg">Loading earthquake data from BigQuery...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-4">
        <p className="text-red-500 text-lg">Error: {error}</p>
        <Button onClick={() => loadData()}>Retry</Button>
      </div>
    );
  }

  if (!isTableReady) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-4">
        <p>No earthquake data loaded</p>
        <Button onClick={() => loadData()}>Load from BigQuery</Button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-row">
      <MapView className="w-[70%] flex-grow" />
      <FiltersPanel className="w-[30%] max-w-[400px]" />
    </div>
  );
};
