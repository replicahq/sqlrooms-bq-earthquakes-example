import { Button, Slider } from '@sqlrooms/ui';
import { Info, MousePointer2, Brush, Link, Unlink, X } from 'lucide-react';

interface MapControlsProps {
  dbReady: boolean;
  enableBrushing: boolean;
  setEnableBrushing: (enabled: boolean) => void;
  syncCharts: boolean;
  toggleSyncCharts: () => void;
  brushRadius: number;
  setBrushRadius: (radius: number) => void;
  clearBrush: () => void;
  onShowInfo: () => void;
}

export const MapControls = ({
  dbReady,
  enableBrushing,
  setEnableBrushing,
  syncCharts,
  toggleSyncCharts,
  brushRadius,
  setBrushRadius,
  clearBrush,
  onShowInfo,
}: MapControlsProps) => {
  if (!dbReady) return null;

  return (
    <div className="absolute right-4 top-4 z-50 flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          variant={enableBrushing ? 'default' : 'outline'}
          size="sm"
          onClick={() => setEnableBrushing(!enableBrushing)}
          title={enableBrushing ? 'Switch to click mode' : 'Switch to brush mode'}
        >
          {enableBrushing ? <Brush className="h-4 w-4" /> : <MousePointer2 className="h-4 w-4" />}
        </Button>
        <Button
          variant={syncCharts ? 'default' : 'outline'}
          size="sm"
          onClick={toggleSyncCharts}
          disabled={!enableBrushing}
          title={syncCharts ? 'Unlink charts from brush' : 'Link charts to brush'}
        >
          {syncCharts ? <Link className="h-4 w-4" /> : <Unlink className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={clearBrush}
          disabled={!enableBrushing}
          title="Clear brush selection"
        >
          <X className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onShowInfo}
          title="Show info"
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>

      {enableBrushing && (
        <div className="bg-background/80 rounded-md p-2 backdrop-blur-sm">
          <div className="text-xs mb-1">Brush radius: {(brushRadius / 1000).toFixed(0)}km</div>
          <Slider
            value={[brushRadius]}
            onValueChange={([v]) => setBrushRadius(v)}
            min={10000}
            max={200000}
            step={5000}
            className="w-32"
          />
        </div>
      )}
    </div>
  );
};
