// script.js
// --- Use ESM import ---
import * as duckdb from 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@latest/dist/duckdb.esm.js';
// Or specify a version:
// import * as duckdb from 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb.esm.js';


// Define stat name mappings (remains the same)
const STAT_NAME_MAPPING_NUMERICAL = { /* ... */ };
const STAT_NAME_MAPPING_CATEGORICAL = { /* ... */ };

// Get DOM elements (remains the same)
const fileInput = document.getElementById('csvFileInput');
const statusDiv = document.getElementById('status');
const resultsSection = document.getElementById('results-section');
const schemaContainer = document.getElementById('schema-table-container');
const statsContainer = document.getElementById('stats-table-container');
const downloadButton = document.getElementById('downloadButton');

// DuckDB Wasm setup
let db = null;
let connection = null;
let finalStatsDataForDownload = null;

// Function to update status messages (remains the same)
function updateStatus(message, type = 'info') { /* ... */ }

// Function to render data as an HTML table (remains the same)
function renderTable(containerElement, dataArray) { /* ... */ }


// Initialize DuckDB-Wasm (Updated according to ESM pattern)
async function initDuckDB() {
    updateStatus('正在初始化 DuckDB-Wasm...');
    fileInput.disabled = true;

    try {
        // --- Updated Initialization using imported duckdb ---
        const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles(); // Use the function

        // Select the best bundle based on browser features
        const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

        // Create worker from Blob URL (Correct way)
        const workerUrl = URL.createObjectURL(
            new Blob([`importScripts("${bundle.mainWorker}")`], { type: 'text/javascript' })
        );
        const worker = new Worker(workerUrl);

        // Instantiate the async version of DuckDB-wasm using the imported object
        const logger = new duckdb.ConsoleLogger(); // Use imported logger
        db = new duckdb.AsyncDuckDB(logger, worker); // Use imported AsyncDuckDB
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
        URL.revokeObjectURL(workerUrl); // Clean up the object URL

        // Connect to the database
        connection = await db.connect();

        updateStatus('DuckDB 初始化完成。請選擇檔案。', 'success');
        fileInput.disabled = false; // Enable file input

    } catch (error) {
        updateStatus(`DuckDB 初始化失敗: ${error}`, 'error');
        console.error("DuckDB Initialization Error:", error);
        // Potentially provide more specific feedback based on error type if needed
    }
}

// Analyze the uploaded file (Function logic remains the same)
async function analyzeFile(file) { /* ... (no changes needed inside this function's logic) ... */ }

// Function to format stats (Function logic remains the same)
function formatStatsForDisplayAndDownload(schemaData, numericalStats, categoricalStats) { /* ... */ }

// Function to generate CSV string (Function logic remains the same)
function generateCSV(dataArray) { /* ... */ }

// Function to trigger CSV download (Function logic remains the same)
function triggerDownload(csvString, filename) { /* ... */ }

// --- Event Listeners ---

// Initialize DuckDB when the script module is loaded and executed
initDuckDB(); // Call init directly as it's now within the module scope

// Handle file selection (Listener remains the same)
fileInput.addEventListener('change', (event) => { /* ... */ });

// Handle download button click (Listener remains the same)
downloadButton.addEventListener('click', () => { /* ... */ });

// --- Helper functions (updateStatus, renderTable, analyzeFile, formatStatsForDisplayAndDownload, generateCSV, triggerDownload) should be defined here ---
// (Paste the full code for these functions from the previous correct version)

// --- Make sure the helper functions are defined before they are called or hoist them if using function declarations ---
// Example: Putting analyzeFile definition here...
async function analyzeFile(file) {
    if (!db || !connection) {
        updateStatus('DuckDB 尚未初始化或連接失敗。', 'error');
        return;
    }

    updateStatus(`正在讀取檔案: ${file.name}...`);
    resultsSection.style.display = 'block';
    schemaContainer.innerHTML = '載入中...';
    statsContainer.innerHTML = '計算中...';
    downloadButton.style.display = 'none';
    finalStatsDataForDownload = null;

    const reader = new FileReader();
    reader.onload = async (event) => {
        const buffer = event.target.result;
        const tableName = 'csv_data';
        const registeredFileName = 'uploaded.csv';

        try {
            updateStatus('正在將檔案註冊到 DuckDB...');
            await db.registerFileBuffer(registeredFileName, new Uint8Array(buffer));

            updateStatus(`正在將 CSV 載入到表格 '${tableName}'...`);
            await connection.query(`
                CREATE OR REPLACE TABLE ${tableName} AS
                SELECT * FROM read_csv(?, AUTO_DETECT=TRUE, nullstr='NULL', header=true);
            `, [registeredFileName]);
            updateStatus('CSV 載入完成。正在分析結構...', 'success');

            // --- 1. Get Schema ---
            const schemaResult = await connection.query(`DESCRIBE ${tableName};`);
            const schemaData = schemaResult.toArray().map(row => row.toJSON());
            renderTable(schemaContainer, schemaData);
            updateStatus('結構分析完成。正在計算統計數據...', 'success');

            // --- Prepare for Stats Calculation ---
            const columnsInfo = schemaData.map(col => ({ name: col.column_name, type: col.column_type }));
            const numericalCols = [];
            const categoricalCols = [];
            const numeric_types = ['BIGINT', 'DOUBLE', 'DECIMAL', 'FLOAT', 'INTEGER', 'SMALLINT', 'TINYINT', 'UBIGINT', 'UINTEGER', 'USMALLINT', 'UTINYINT', 'HUGEINT'];
            const category_like_types = ['VARCHAR', 'TEXT', 'DATE', 'TIMESTAMP', 'TIME', 'BOOLEAN', 'UUID', 'INTERVAL', 'ENUM', 'LIST', 'STRUCT', 'MAP'];

            columnsInfo.forEach(({ name, type }) => {
                let base_dtype = type.split('(')[0].toUpperCase();
                 if (base_dtype.includes('<')) base_dtype = base_dtype.split('<')[0];
                if (numeric_types.includes(base_dtype)) numericalCols.push(name);
                else if (category_like_types.includes(base_dtype)) categoricalCols.push(name);
            });

            let numericalStatsResults = null;
            let categoricalStatsResults = [];

            // --- 2. Calculate Numerical Stats ---
            if (numericalCols.length > 0) {
                updateStatus('計算數值統計...');
                let selectParts = [];
                numericalCols.forEach(col => {
                    const quotedCol = `"${col.replace(/"/g, '""')}"`;
                    selectParts.push(
                        `COUNT(${quotedCol}) AS "${col}_count"`,
                        `COUNT(*) FILTER (WHERE ${quotedCol} IS NULL) AS "${col}_null_count"`,
                        `TRY_CAST(AVG(${quotedCol}) AS DOUBLE) AS "${col}_mean"`,
                        `TRY_CAST(STDDEV_SAMP(${quotedCol}) AS DOUBLE) AS "${col}_std"`,
                        `MIN(${quotedCol}) AS "${col}_min"`,
                        `MAX(${quotedCol}) AS "${col}_max"`,
                        `QUANTILES(${quotedCol}, [0.25, 0.5, 0.75]) AS "${col}_quantiles"`
                    );
                });

                 if (selectParts.length > 0) {
                    const queryNumerical = `SELECT ${selectParts.join(', ')} FROM ${tableName};`;
                    try {
                        const result = await connection.query(queryNumerical);
                        numericalStatsResults = result.toArray()[0]?.toJSON() ?? {};
                    } catch (numErr) {
                         updateStatus(`計算數值統計時出錯: ${numErr}`, 'error'); console.error("Numerical Stats Error:", numErr); numericalStatsResults = {};
                    }
                 }
            }

            // --- 3. Calculate Categorical Stats ---
            if (categoricalCols.length > 0) {
                updateStatus('計算類別統計...');
                for (const col of categoricalCols) {
                    const quotedCol = `"${col.replace(/"/g, '""')}"`;
                    const queryBasic = `SELECT COUNT(*) AS tc, COUNT(${quotedCol}) AS nnc, COUNT(DISTINCT ${quotedCol}) AS uc FROM ${tableName};`;
                    const queryModeFreq = `
                        WITH freq AS ( SELECT ${quotedCol} AS mv, COUNT(*) AS c FROM ${tableName} WHERE ${quotedCol} IS NOT NULL GROUP BY ALL )
                        SELECT mv, c FROM freq ORDER BY c DESC, mv ASC NULLS LAST LIMIT 1;`;
                    try {
                        const basicResult = (await connection.query(queryBasic)).toArray()[0]?.toJSON() ?? {};
                        const modeResult = (await connection.query(queryModeFreq)).toArray()[0]?.toJSON() ?? { mv: null, c: 0 };
                        categoricalStatsResults.push({ columnName: col, 'Total Count': basicResult.tc ?? 0, 'Non-NULL Count': basicResult.nnc ?? 0, 'Unique Values': basicResult.uc ?? 0, 'Most Frequent Value (Mode)': modeResult.mv, 'Mode Frequency': modeResult.c ?? 0 });
                    } catch (catErr) {
                         console.warn(`計算類別統計 '${col}' 時出錯: ${catErr}`); categoricalStatsResults.push({ columnName: col, 'Total Count': 'Error', /*...*/ });
                    }
                }
            }

            // --- 4. Format and Display Stats ---
            updateStatus('正在格式化統計結果...');
            finalStatsDataForDownload = formatStatsForDisplayAndDownload(
                schemaData, numericalStatsResults, categoricalStatsResults
            );

            if (finalStatsDataForDownload && finalStatsDataForDownload.length > 0) {
                renderTable(statsContainer, finalStatsDataForDownload);
                downloadButton.style.display = 'inline-block'; updateStatus('分析完成！', 'success');
            } else {
                statsContainer.innerHTML = '<p>未能生成統計數據。</p>'; updateStatus('分析完成，但未生成統計數據。', 'info');
            }

        } catch (error) {
            updateStatus(`分析過程中出錯: ${error}`, 'error'); console.error("Analysis Error:", error);
        } finally {
            try { await db.dropFile(registeredFileName); } catch (dropErr) { console.warn("Error dropping registered file:", dropErr); }
        }
    };
    reader.onerror = (event) => { updateStatus(`讀取檔案時發生錯誤: ${reader.error}`, 'error'); };
    reader.readAsArrayBuffer(file);
}

// (Paste the full definitions for updateStatus, renderTable, formatStatsForDisplayAndDownload, generateCSV, triggerDownload here if you haven't already)
// Make sure they are defined before being called in the event listeners or initDuckDB.
