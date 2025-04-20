// script.js

// Define stat name mappings (similar to Python)
const STAT_NAME_MAPPING_NUMERICAL = {
    'count': '計數 (非NULL)',
    'null_count': 'NULL 值計數',
    'mean': '平均值',
    'std': '標準差 (樣本)',
    'min': '最小值',
    '25%': '25% 分位數',
    '50% (median)': '中位數 (50%)',
    '75%': '75% 分位數',
    'max': '最大值'
};

const STAT_NAME_MAPPING_CATEGORICAL = {
    'Total Count': '總筆數 (含NULL)',
    'Non-NULL Count': '非NULL筆數',
    'Unique Values': '唯一值數量 (非NULL)',
    'Most Frequent Value (Mode)': '眾數 (最常見值)',
    'Mode Frequency': '眾數頻次'
};


// Get DOM elements
const fileInput = document.getElementById('csvFileInput');
const statusDiv = document.getElementById('status');
const resultsSection = document.getElementById('results-section');
const schemaContainer = document.getElementById('schema-table-container');
const statsContainer = document.getElementById('stats-table-container');
const downloadButton = document.getElementById('downloadButton');

// DuckDB Wasm setup
let db = null;
let connection = null;
let finalStatsDataForDownload = null; // Store data for CSV download

// Function to update status messages
function updateStatus(message, type = 'info') {
    console.log(`Status (${type}): ${message}`);
    statusDiv.textContent = message;
    statusDiv.className = type; // Use class for styling (info, success, error)
    if (type === 'error') {
        resultsSection.style.display = 'none'; // Hide results on error
    }
}

// Function to render data as an HTML table
function renderTable(containerElement, dataArray) {
    if (!dataArray || dataArray.length === 0) {
        containerElement.innerHTML = '<p>沒有可顯示的數據。</p>';
        return;
    }

    const table = document.createElement('table');
    const thead = table.createTHead();
    const tbody = table.createTBody();
    // Ensure headers are derived correctly even if first row has missing keys (less likely here)
    const headers = Object.keys(dataArray[0]);

    // Create header row
    const headerRow = thead.insertRow();
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    // Create data rows
    dataArray.forEach(rowData => {
        const row = tbody.insertRow();
        headers.forEach(header => {
            const cell = row.insertCell();
            cell.textContent = rowData[header] !== null && rowData[header] !== undefined ? rowData[header] : '';
        });
    });

    containerElement.innerHTML = ''; // Clear previous content
    containerElement.appendChild(table);
}


// Initialize DuckDB-Wasm with Retry Logic
async function initDuckDB() {
    updateStatus('正在初始化 DuckDB-Wasm...');
    fileInput.disabled = true; // Disable input during init attempt

    try {
        // --- Check and Retry Logic ---
        const MAX_RETRIES = 5; // Maximum number of retries
        const RETRY_DELAY = 600; // Delay between retries in milliseconds
        let duckdbLoaded = (typeof globalThis.duckdb !== 'undefined' && typeof globalThis.duckdb.selectBundle !== 'undefined');
        let retries = 0;

        while (!duckdbLoaded && retries < MAX_RETRIES) {
            retries++;
            updateStatus(`DuckDB 庫尚未完全載入，正在進行第 ${retries}/${MAX_RETRIES} 次重試...`);
            // Wait for the specified delay
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            // Check again
            duckdbLoaded = (typeof globalThis.duckdb !== 'undefined' && typeof globalThis.duckdb.selectBundle !== 'undefined');
        }

        if (!duckdbLoaded) {
            // If still not loaded after retries, show error and stop
            updateStatus('DuckDB 庫載入超時或失敗。請檢查網路連接、瀏覽器控制台錯誤，或刷新頁面。', 'error');
            console.error("DuckDB object not found after multiple retries. Check network loading of DuckDB scripts.");
            return; // Stop initialization
        }
        // --- End Check and Retry ---

        // Proceed if loaded
        updateStatus('檢測到 DuckDB 庫，繼續初始化核心...');

        const bundles = globalThis.duckdb.DuckDBBundles; // Now it should be safe to access
        const bundle = await globalThis.duckdb.selectBundle(bundles);

         // Instantiate the async version of DuckDB-wasm
        // Create worker from Blob URL
        const workerUrl = URL.createObjectURL(
            new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' })
        );
        const worker = new Worker(workerUrl);

        const logger = new globalThis.duckdb.ConsoleLogger(); // Simple logger
        db = new globalThis.duckdb.AsyncDuckDB(logger, worker);

        // Instantiate and bootstrap the worker
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
        URL.revokeObjectURL(workerUrl); // Clean up the object URL after worker is created

        // Connect to the database
        connection = await db.connect(); // Creates a default in-memory database

        updateStatus('DuckDB 初始化完成。請選擇檔案。', 'success');
        fileInput.disabled = false; // Re-enable file input

    } catch (error) {
        // Catch errors during the initialization steps (bundle selection, worker creation, instantiation, connect)
        updateStatus(`DuckDB 初始化過程中發生嚴重錯誤: ${error}`, 'error');
        console.error("Error during DuckDB initialization steps:", error);
        fileInput.disabled = true; // Keep disabled on critical error
    }
}

// Analyze the uploaded file (Function remains the same as before)
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
        const registeredFileName = 'uploaded.csv'; // Name for DuckDB to reference the buffer

        try {
            updateStatus('正在將檔案註冊到 DuckDB...');
            // Register the file buffer with DuckDB
            await db.registerFileBuffer(registeredFileName, new Uint8Array(buffer));

            updateStatus(`正在將 CSV 載入到表格 '${tableName}'...`);
            // Load CSV into a table
            await connection.query(`
                CREATE OR REPLACE TABLE ${tableName} AS
                SELECT * FROM read_csv(?, AUTO_DETECT=TRUE, nullstr='NULL', header=true);
            `, [registeredFileName]); // Pass filename as parameter
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
                        `TRY_CAST(AVG(${quotedCol}) AS DOUBLE) AS "${col}_mean"`, // Use TRY_CAST for safety
                        `TRY_CAST(STDDEV_SAMP(${quotedCol}) AS DOUBLE) AS "${col}_std"`,
                        `MIN(${quotedCol}) AS "${col}_min"`,
                        `MAX(${quotedCol}) AS "${col}_max"`,
                        // Using QUANTILES for efficiency
                        `QUANTILES(${quotedCol}, [0.25, 0.5, 0.75]) AS "${col}_quantiles"`
                    );
                });

                 if (selectParts.length > 0) {
                    const queryNumerical = `SELECT ${selectParts.join(', ')} FROM ${tableName};`;
                    try {
                        const result = await connection.query(queryNumerical);
                        numericalStatsResults = result.toArray()[0]?.toJSON() ?? {};
                    } catch (numErr) {
                         updateStatus(`計算數值統計時出錯: ${numErr}`, 'error');
                         console.error("Numerical Stats Error:", numErr);
                         numericalStatsResults = {};
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
                        WITH freq AS (
                            SELECT ${quotedCol} AS mv, COUNT(*) AS c FROM ${tableName}
                            WHERE ${quotedCol} IS NOT NULL GROUP BY ALL
                        )
                        SELECT mv, c FROM freq ORDER BY c DESC, mv ASC NULLS LAST LIMIT 1;`;
                    try {
                        const basicResult = (await connection.query(queryBasic)).toArray()[0]?.toJSON() ?? {};
                        const modeResult = (await connection.query(queryModeFreq)).toArray()[0]?.toJSON() ?? { mv: null, c: 0 };
                        categoricalStatsResults.push({
                            columnName: col,
                            'Total Count': basicResult.tc ?? 0,
                            'Non-NULL Count': basicResult.nnc ?? 0,
                            'Unique Values': basicResult.uc ?? 0,
                            'Most Frequent Value (Mode)': modeResult.mv,
                            'Mode Frequency': modeResult.c ?? 0
                        });
                    } catch (catErr) {
                         console.warn(`計算類別統計 '${col}' 時出錯: ${catErr}`);
                         categoricalStatsResults.push({ columnName: col, 'Total Count': 'Error', /*...*/ });
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
                downloadButton.style.display = 'inline-block';
                updateStatus('分析完成！', 'success');
            } else {
                statsContainer.innerHTML = '<p>未能生成統計數據。</p>';
                updateStatus('分析完成，但未生成統計數據。', 'info');
            }

        } catch (error) {
            updateStatus(`分析過程中出錯: ${error}`, 'error');
            console.error("Analysis Error:", error);
        } finally {
            // Clean up the registered file (optional, good practice)
            try {
                await db.dropFile(registeredFileName);
            } catch (dropErr) { console.warn("Error dropping registered file:", dropErr); }
            // Don't reset status here, let the final status from try/catch remain
        }
    };

    reader.onerror = (event) => {
        updateStatus(`讀取檔案時發生錯誤: ${reader.error}`, 'error');
    };

    reader.readAsArrayBuffer(file);
}

// Function to format stats into the long format (Function remains the same as before)
function formatStatsForDisplayAndDownload(schemaData, numericalStats, categoricalStats) {
    const allStatsRecords = [];
    const schemaMap = new Map(schemaData.map(item => [item.column_name, item.column_type]));

    // Process numerical stats
    if (numericalStats) {
        for (const key in numericalStats) {
            const value = numericalStats[key];
            // Improved parsing for names like "col_name_with_underscores_stat"
            const parts = key.split('_');
            if (parts.length < 2) continue; // Need at least name_stat
            const statKey = parts.pop();
            const originalColName = parts.join('_');

            const inferredType = schemaMap.get(originalColName) || '未知';

             if (statKey === 'quantiles' && Array.isArray(value) && value.length === 3) {
                 allStatsRecords.push({ '原始欄位名稱': originalColName, '推斷類型': inferredType, '統計指標': STAT_NAME_MAPPING_NUMERICAL['25%'] || '25%', '統計值': value[0] });
                 allStatsRecords.push({ '原始欄位名稱': originalColName, '推斷類型': inferredType, '統計指標': STAT_NAME_MAPPING_NUMERICAL['50% (median)'] || '50% (median)', '統計值': value[1] });
                 allStatsRecords.push({ '原始欄位名稱': originalColName, '推斷類型': inferredType, '統計指標': STAT_NAME_MAPPING_NUMERICAL['75%'] || '75%', '統計值': value[2] });
             } else if (statKey !== 'quantiles') { // Avoid adding the raw quantiles array if handled above
                 const chineseStatName = STAT_NAME_MAPPING_NUMERICAL[statKey] || statKey;
                 allStatsRecords.push({ '原始欄位名稱': originalColName, '推斷類型': inferredType, '統計指標': chineseStatName, '統計值': value });
             }
        }
    }

    // Process categorical stats
    if (categoricalStats) {
        categoricalStats.forEach(catStat => {
            const originalColName = catStat.columnName;
            const inferredType = schemaMap.get(originalColName) || '未知';
            for (const statKey in catStat) {
                if (statKey === 'columnName') continue;
                const chineseStatName = STAT_NAME_MAPPING_CATEGORICAL[statKey] || statKey;
                allStatsRecords.push({ '原始欄位名稱': originalColName, '推斷類型': inferredType, '統計指標': chineseStatName, '統計值': catStat[statKey] });
            }
        });
    }

    // Sort results
    allStatsRecords.sort((a, b) => {
        const nameCompare = a['原始欄位名稱'].localeCompare(b['原始欄位名稱']);
        if (nameCompare !== 0) return nameCompare;
        // Basic sort for indicators, can be improved if specific order needed
        return a['統計指標'].localeCompare(b['統計指標']);
    });

    return allStatsRecords;
}

// Function to generate CSV string (Function remains the same as before)
function generateCSV(dataArray) {
    if (!dataArray || dataArray.length === 0) return '';
    const headers = Object.keys(dataArray[0]);
    const csvRows = [headers.join(',')];
    dataArray.forEach(row => {
        const values = headers.map(header => {
            let value = row[header];
            value = (value === null || value === undefined) ? '' : String(value);
            return (value.includes(',') || value.includes('"') || value.includes('\n'))
                   ? `"${value.replace(/"/g, '""')}"` : value;
        });
        csvRows.push(values.join(','));
    });
    return csvRows.join('\n');
}

// Function to trigger CSV download (Function remains the same as before)
function triggerDownload(csvString, filename) {
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8-sig;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } else {
        updateStatus('瀏覽器不支援自動下載。', 'error');
    }
}

// --- Event Listeners ---

// Initialize DuckDB when the script loads (DOM is ready)
document.addEventListener('DOMContentLoaded', () => {
    initDuckDB(); // Start initialization process
});


// Handle file selection
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file && db && connection) { // Ensure DB is ready before analyzing
        analyzeFile(file);
    } else if (!db || !connection) {
         updateStatus('DuckDB 尚未準備好，無法分析檔案。', 'error');
    } else {
        updateStatus('未選擇檔案。', 'info');
        resultsSection.style.display = 'none';
    }
});

// Handle download button click
downloadButton.addEventListener('click', () => {
    if (finalStatsDataForDownload && fileInput.files.length > 0) {
        const csvString = generateCSV(finalStatsDataForDownload);
        const originalFilename = fileInput.files[0]?.name ?? 'download.csv';
        const baseName = originalFilename.includes('.') ? originalFilename.substring(0, originalFilename.lastIndexOf('.')) : originalFilename;
        const downloadFilename = `${baseName}_stats.csv`;
        triggerDownload(csvString, downloadFilename);
    } else {
        updateStatus('沒有可下載的統計數據或未選擇原始檔案。', 'error');
    }
});
