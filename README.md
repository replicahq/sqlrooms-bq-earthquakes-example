# SQLRooms BigQuery Earthquakes Demo

An interactive visualization of global earthquake data powered by BigQuery, DuckDB-WASM, and SQLRooms. This app demonstrates how to build data-intensive applications that query BigQuery and perform client-side analytics with Mosaic cross-filtering.

<img width="1065" height="620" alt="image" src="https://github.com/user-attachments/assets/38a303f3-24ac-4c46-bdc3-51a57219f4e9" />


## Features

- **BigQuery Integration**: Load earthquake data from NOAA's public dataset
- **DuckDB-WASM**: Client-side SQL analytics with Apache Arrow
- **Interactive Map**: GeoArrow-powered scatterplot with DeckGL
- **Cross-filtering**: Linked brushing between map and charts via Mosaic
- **Real-time Filtering**: Filter by magnitude, depth, and time period

## Quick Start

### Prerequisites

- Node.js 18+
- Google Cloud credentials with BigQuery access
- A GCP project with billing enabled (for running BigQuery jobs)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/replicahq/sqlrooms-bq-earthquakes-example.git
cd sqlrooms-bq-earthquakes-example
```

2. Install dependencies:
```bash
npm install
cd server && npm install && cd ..
```

3. Configure environment:
```bash
# Create .env file in server directory
echo "BIGQUERY_PROJECT=your-gcp-project-id" > server/.env
```

4. Set up Google Cloud authentication:
```bash
# Option 1: Use gcloud CLI
gcloud auth application-default login

# Option 2: Service account key
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
```

5. Start development servers:
```bash
npm run dev
```

6. Open http://localhost:5173 in your browser

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   DeckGL    │  │   Mosaic    │  │    DuckDB-WASM      │  │
│  │  Map View   │◄─┤   Charts    │◄─┤   (Arrow Tables)    │  │
│  └─────────────┘  └─────────────┘  └──────────▲──────────┘  │
└───────────────────────────────────────────────┼─────────────┘
                                                │ Arrow IPC
┌───────────────────────────────────────────────┼─────────────┐
│                    Express Server             │             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              @sqlrooms/bigquery                     │    │
│  │   BigQueryClient → rowsToArrowIPC → base64          │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────┼─────────────┘
                                                │
┌───────────────────────────────────────────────▼─────────────┐
│                    Google BigQuery                          │
│   bigquery-public-data.noaa_significant_earthquakes         │
└─────────────────────────────────────────────────────────────┘
```

## Data Source

This app queries the [NOAA Significant Earthquakes Database](https://console.cloud.google.com/marketplace/details/noaa-public/noaa-earthquakes) available in BigQuery's public datasets. The dataset contains ~6,000 significant earthquakes from year 1 AD to present.

**Columns used:**
- `latitude`, `longitude` - Geographic coordinates
- `eq_primary` - Primary magnitude
- `focal_depth` - Depth in kilometers
- `year`, `month`, `day` - Date components

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── map/           # DeckGL map with GeoArrow layer
│   │   └── filters/       # Mosaic cross-filter charts
│   ├── EarthquakeSlice.ts # Zustand slice for data loading
│   ├── store.ts           # SQLRooms store configuration
│   └── main.tsx           # App entry point
├── server/
│   └── src/
│       └── index.ts       # Express server with BigQuery endpoint
└── package.json
```

## Key Dependencies

- **[@sqlrooms/bigquery](https://github.com/replicahq/sqlrooms-bigquery)** - BigQuery utilities (install via `npm install github:replicahq/sqlrooms-bigquery`)
- **[@sqlrooms/mosaic](https://github.com/sqlrooms/sqlrooms)** - Cross-filtering with Mosaic
- **[@sqlrooms/duckdb](https://github.com/sqlrooms/sqlrooms)** - DuckDB-WASM integration
- **[@geoarrow/deck.gl-layers](https://github.com/geoarrow/deck.gl-layers)** - GeoArrow rendering
- **[apache-arrow](https://arrow.apache.org/)** - Arrow IPC serialization

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both server and client in development mode |
| `npm run build` | Build both server and client for production |
| `npm run dev:server` | Start only the Express server |
| `npm run dev:client` | Start only the Vite dev server |

## Customization

### Using a Different Dataset

Modify `server/src/index.ts` to query your own BigQuery table:

```typescript
const result = await bigQueryClient.query(`
  SELECT
    latitude,
    longitude,
    your_column AS magnitude,
    another_column AS depth,
    UNIX_MILLIS(timestamp_column) AS datetime
  FROM \`your-project.dataset.table\`
  WHERE latitude IS NOT NULL
  LIMIT @limit
`, { params: { limit } });
```

### Adding New Visualizations

Add new Mosaic charts in `src/components/filters/filterPlots.ts`:

```typescript
export const createCustomPlot = (brush: Selection) =>
  vg.plot(
    vg.rectY(vg.from('earthquakes', { filterBy: brush }), {
      x: vg.bin('your_column', { maxbins: 20 }),
      y: vg.count(),
    }),
    vg.intervalX({ as: brush }),
  );
```

## License

MIT

## Credits

- Earthquake data: [NOAA National Centers for Environmental Information](https://www.ncei.noaa.gov/)
- Built with [SQLRooms](https://github.com/sqlrooms/sqlrooms)
