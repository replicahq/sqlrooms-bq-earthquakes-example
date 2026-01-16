import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import {
  BigQueryClient,
  createBigQueryRouter,
  createSafeQueryAuthorizer,
  rowsToArrowIPC,
  arrowIPCToBase64,
} from '@sqlrooms/bigquery/server';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize BigQuery client
// IMPORTANT: projectId must be YOUR billing-enabled project, not bigquery-public-data
// You can still query public datasets - the projectId is where the job runs
const bigQueryClient = new BigQueryClient({
  projectId: process.env.BIGQUERY_PROJECT || 'model-159019',
});

// Create generic BigQuery router for ad-hoc queries
const bigQueryRouter = createBigQueryRouter({
  client: bigQueryClient,
  authorizeQuery: createSafeQueryAuthorizer(),
});

// Middleware
app.use(cors());
app.use(express.json());

// Mount generic BigQuery router
app.use('/api/bq', bigQueryRouter);

// Load earthquakes data endpoint
// This demonstrates a domain-specific endpoint that uses the BigQuery package
app.post('/api/earthquakes/load', async (req, res, next) => {
  try {
    const { limit = 50000 } = req.body;

    console.log(`[earthquakes] Loading up to ${limit} earthquakes from BigQuery...`);
    const startTime = Date.now();

    // Query the public earthquakes dataset
    // Map columns to match the expected schema from the original example
    const result = await bigQueryClient.query(`
      SELECT
        latitude AS Latitude,
        longitude AS Longitude,
        CAST(magnitude AS FLOAT64) AS Magnitude,
        CAST(depth AS FLOAT64) AS Depth,
        UNIX_MILLIS(TIMESTAMP(date)) AS DateTime
      FROM \`bigquery-public-data.noaa_significant_earthquakes.earthquakes\`
      WHERE latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND magnitude IS NOT NULL
      ORDER BY date DESC
      LIMIT @limit
    `, {
      params: { limit },
    });

    const duration = Date.now() - startTime;
    console.log(`[earthquakes] Query returned ${result.rows.length} rows in ${duration}ms`);

    // Convert to Arrow IPC format
    const arrowBuffer = rowsToArrowIPC(result.rows);
    const base64Data = arrowIPCToBase64(arrowBuffer);

    res.json({
      data: base64Data,
      rowCount: result.rows.length,
      loadTimeMs: duration,
    });
  } catch (error) {
    console.error('[earthquakes] Error:', error);
    next(error);
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`BigQuery project: ${process.env.BIGQUERY_PROJECT || 'bigquery-public-data'}`);
});
