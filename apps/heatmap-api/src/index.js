// import express from 'express';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import fs from 'fs';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();

// // Enable CORS
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
//   next();
// });

// // Serve static data files
// app.use('/data', express.static(path.join(__dirname, '../data')));

// // Get MRT stations data
// app.get('/stations', (req, res) => {
//   const dataPath = path.join(__dirname, '../data/mrt_stations.csv');
//   if (fs.existsSync(dataPath)) {
//     const data = fs.readFileSync(dataPath, 'utf8');
//     res.type('text/csv').send(data);
//   } else {
//     res.status(404).json({ error: 'MRT stations data not found' });
//   }
// });

// // Get crowd data
// app.get('/crowd', (req, res) => {
//   const dataPath = path.join(__dirname, '../data/final_data.csv');
//   if (fs.existsSync(dataPath)) {
//     const data = fs.readFileSync(dataPath, 'utf8');
//     res.type('text/csv').send(data);
//   } else {
//     res.status(404).json({ error: 'Crowd data not found' });
//   }
// });

// // Get taxi data
// app.get('/taxi', (req, res) => {
//   const dataPath = path.join(__dirname, '../data/taxi_data.csv');
//   if (fs.existsSync(dataPath)) {
//     const data = fs.readFileSync(dataPath, 'utf8');
//     res.type('text/csv').send(data);
//   } else {
//     res.status(404).json({ error: 'Taxi data not found' });
//   }
// });

// // Get merged data
// app.get('/merged', (req, res) => {
//   const dataPath = path.join(__dirname, '../data/merged_data.csv');
//   if (fs.existsSync(dataPath)) {
//     const data = fs.readFileSync(dataPath, 'utf8');
//     res.type('text/csv').send(data);
//   } else {
//     res.status(404).json({ error: 'Merged data not found' });
//   }
// });

// // Main endpoint - return available data endpoints
// app.get('/', (req, res) => {
//   res.json({
//     message: 'Singapore MRT/LRT Heatmap API',
//     endpoints: {
//       stations: '/stations - Get MRT/LRT station locations',
//       crowd: '/crowd - Get real-time crowd data',
//       taxi: '/taxi - Get taxi availability data',
//       merged: '/merged - Get merged heatmap data',
//       data: '/data/* - Access raw data files'
//     },
//     dataFiles: [
//       'mrt_stations.csv',
//       'final_data.csv',
//       'taxi_data.csv',
//       'merged_data.csv',
//       'mrt_lrt_heatmap.py'
//     ]
//   });
// });

// // Health check
// app.get('/health', (req, res) => {
//   res.json({ status: 'ok' });
// });

// const port = process.env.HEATMAP_PORT || 4014;
// app.listen(port, () => {
//   console.log(`Heatmap API listening on ${port}`);
// });


// src/index.js

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url'; // <-- New import

// --- ESM __dirname equivalent ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --------------------------------

const app = express();
const port = 4014;

// Tell Express to serve files from the 'public' directory
// (Make sure your Map.html is in a directory named 'public' next to src/)
app.use(express.static(path.join(__dirname)));

// Set the root route to serve your Map.html file
app.get('/', (req, res) => {
    // We use path.join(__dirname, 'public', 'Map.html') to build the full path
    res.sendFile(path.join(__dirname, 'Map.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});