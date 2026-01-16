import { RoomPanel } from '@sqlrooms/room-shell';
import { Button, ScrollArea } from '@sqlrooms/ui';
import { Database, RefreshCw } from 'lucide-react';
import { useRoomStore } from '../../store';

export default function DataSourcesPanel() {
  const tables = useRoomStore((state) => state.db.tables);
  const isLoading = useRoomStore((state) => state.earthquakes.isLoading);
  const meta = useRoomStore((state) => state.earthquakes.meta);
  const loadData = useRoomStore((state) => state.earthquakes.loadData);

  return (
    <RoomPanel type="data" className="flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">BigQuery Data Source</h3>
            <div className="text-xs text-muted-foreground">
              <code>bigquery-public-data.noaa_significant_earthquakes.earthquakes</code>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => loadData()}
              disabled={isLoading}
              className="w-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Reload Data'}
            </Button>
            {meta && (
              <div className="text-xs text-muted-foreground">
                {meta.rowCount.toLocaleString()} rows loaded in {meta.loadTimeMs}ms
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">DuckDB Tables</h3>
            {tables.length === 0 ? (
              <div className="text-xs text-muted-foreground">No tables loaded</div>
            ) : (
              <div className="space-y-1">
                {tables.map(({ tableName }) => (
                  <div
                    key={tableName}
                    className="flex items-center gap-2 text-xs p-2 rounded bg-muted/50"
                  >
                    <Database className="h-3 w-3" />
                    <span className="font-mono">{tableName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </RoomPanel>
  );
}
