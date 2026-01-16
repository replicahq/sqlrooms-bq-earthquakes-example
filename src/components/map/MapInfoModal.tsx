import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@sqlrooms/ui';

interface MapInfoModalProps {
  onClose: () => void;
}

export const MapInfoModal = ({ onClose }: MapInfoModalProps) => {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>BigQuery Earthquakes Demo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p>
            This demo loads earthquake data from the{' '}
            <strong>bigquery-public-data.noaa_significant_earthquakes</strong>{' '}
            dataset using the <code>@sqlrooms/bigquery</code> package.
          </p>
          <p>
            <strong>Features:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Data is fetched from BigQuery and loaded into DuckDB-WASM</li>
            <li>Mosaic provides cross-filtering between map and charts</li>
            <li>GeoArrow layers render points efficiently on the map</li>
            <li>Brush mode allows spatial filtering</li>
          </ul>
          <p>
            <strong>Controls:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Click points for details (pointer mode)</li>
            <li>Hover to filter by location (brush mode)</li>
            <li>Drag on charts to filter by value</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};
