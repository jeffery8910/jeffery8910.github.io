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
            // Handle potential null/undefined values gracefully
            cell.textContent = rowData[header] !== null && rowData[header] !== undefined ? rowData[header] : '';
        });
    });

    containerElement.innerHTML = ''; // Clear previous content
    containerElement.appendChild(table);
}


// Initialize DuckDB-Wasm
async function initDuckDB() {
    updateStatus('正在初始化 DuckDB-Wasm...');
    try {
        // Select the best bundle based on browser support
        const bundles = globalThis.duckdb.DuckDBBundles;
        const bundle = await globalThis.duckdb.selectBundle(bundles);

         // Instantiate the async version of DuckDB-wasm
        const workerUrl = URL.createObjectURL(
            new Blob([`importScripts("${bundle.mainWorker}");`], {type: 'text/javascript'})
        );
        const worker = new Worker(workerUrl);
        const logger = new globalThis.duckdb.ConsoleLogger();
        db = new globalThis.duckdb.AsyncDuckDB(logger, worker);
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
        URL.revokeObjectURL(workerUrl); // Clean up the object URL

        connection = await db.connect();
        updateStatus('DuckDB 初始化完成。請選擇檔案。', 'success');
        fileInput.disabled = false; // Enable file input after init
    } catch (error) {
        updateStatus(`DuckDB 初始化失敗: ${error}`, 'error');
        console.error(error);
        fileInput.disabled = true; // Disable if init fails
    }
}

// Analyze the uploaded file
async function analyzeFile(file) {
    if (!db || !connection) {
        updateStatus('DuckDB 尚未初始化。', 'error');
        return;
    }

    updateStatus(`正在讀取檔案: ${file.name}...`);
    resultsSection.style.display = 'block'; // Show results section
    schemaContainer.innerHTML = '載入中...';
    statsContainer.innerHTML = '計算中...';
    downloadButton.style.display = 'none';
    finalStatsDataForDownload = null; // Reset download data

    const reader = new FileReader();
    reader.onload = async (event) => {
        const buffer = event.target.result; // File content as ArrayBuffer
        const tableName = 'csv_data';
        const registeredFileName = 'uploaded.csv';

        try {
            updateStatus('正在將檔案註冊到 DuckDB...');
            await db.registerFileBuffer(registeredFileName, new Uint8Array(buffer));

            updateStatus(`正在將 CSV 載入到表格 '${tableName}'...`);
            // Use AUTO_DETECT=TRUE and specify nullstr
            // Note: DuckDB-Wasm's read_csv might have slightly different auto-detection behavior or options.
            // Adjust header=true, sample_size etc. if needed based on Wasm documentation.
            await connection.query(`
                CREATE OR REPLACE TABLE ${tableName} AS
                SELECT * FROM read_csv(
                    '${registeredFileName}',
                    AUTO_DETECT=TRUE,
                    nullstr='NULL',
                    header=true
                );
            `);
            updateStatus('CSV 載入完成。正在分析結構...', 'success');

            // --- 1. Get Schema ---
            const schemaResult = await connection.query(`DESCRIBE ${tableName};`);
            const schemaData = schemaResult.toArray().map(row => row.toJSON()); // Convert Arrow to plain JS objects
            renderTable(schemaContainer, schemaData);
            updateStatus('結構分析完成。正在計算統計數據...', 'success');

            // --- Prepare for Stats Calculation ---
            const columnsInfo = schemaData.map(col => ({ name: col.column_name, type: col.column_type }));
            const numericalCols = [];
            const categoricalCols = [];
            const numeric_types = ['BIGINT', 'DOUBLE', 'DECIMAL', 'FLOAT', 'INTEGER', 'SMALLINT', 'TINYINT', 'UBIGINT', 'UINTEGER', 'USMALLINT', 'UTINYINT', 'HUGEINT'];
            const category_like_types = ['VARCHAR', 'TEXT', 'DATE', 'TIMESTAMP', 'TIME', 'BOOLEAN', 'UUID', 'INTERVAL', 'ENUM', 'LIST', 'STRUCT', 'MAP']; // Expanded list

            columnsInfo.forEach(({ name, type }) => {
                let base_dtype = type.split('(')[0].toUpperCase();
                 if (base_dtype.includes('<')) base_dtype = base_dtype.split('<')[0]; // Handle LIST<...>, MAP<...>, etc.

                if (numeric_types.includes(base_dtype)) {
                    numericalCols.push(name);
                } else if (category_like_types.includes(base_dtype)) {
                    categoricalCols.push(name);
                }
            });

            let numericalStatsResults = null;
            let categoricalStatsResults = []; // Array to store results for each cat column

            // --- 2. Calculate Numerical Stats ---
            if (numericalCols.length > 0) {
                updateStatus('計算數值統計...');
                let selectParts = [];
                numericalCols.forEach(col => {
                    // Quote column names just in case they have spaces or special chars
                    const quotedCol = `"${col.replace(/"/g, '""')}"`;
                    selectParts.push(
                        `COUNT(${quotedCol}) AS "${col}_count"`,
                        `COUNT(*) FILTER (WHERE ${quotedCol} IS NULL) AS "${col}_null_count"`,
                        `AVG(${quotedCol}) AS "${col}_mean"`,
                        `STDDEV_SAMP(${quotedCol}) AS "${col}_std"`,
                        `MIN(${quotedCol}) AS "${col}_min"`,
                        `QUANTILES(${quotedCol}, [0.25, 0.5, 0.75]) AS "${col}_quantiles"` // Use QUANTILES for multiple
                        // `QUANTILE_CONT(${quotedCol}, 0.25) AS "${col}_25%"`, // Older versions might need separate
                        // `MEDIAN(${quotedCol}) AS "${col}_50% (median)"`,
                        // `QUANTILE_CONT(${quotedCol}, 0.75) AS "${col}_75%"`,
                        // `MAX(${quotedCol}) AS "${col}_max"`
                    );
                     // Add MAX separately as QUANTILES doesn't include it
                    selectParts.push(`MAX(${quotedCol}) AS "${col}_max"`);
                });

                 if (selectParts.length > 0) {
                    const queryNumerical = `SELECT ${selectParts.join(', ')} FROM ${tableName};`;
                    try {
                        const result = await connection.query(queryNumerical);
                        // Result is an Arrow table with one row
                        numericalStatsResults = result.toArray()[0]?.toJSON() ?? {}; // Get the first row as a JS object
                    } catch (numErr) {
                         updateStatus(`計算數值統計時出錯: ${numErr}`, 'error');
                         console.error("Numerical Stats Error:", numErr);
                         numericalStatsResults = {}; // Set to empty if error
                    }
                 }
            }

            // --- 3. Calculate Categorical Stats ---
            if (categoricalCols.length > 0) {
                updateStatus('計算類別統計...');
                for (const col of categoricalCols) {
                    const quotedCol = `"${col.replace(/"/g, '""')}"`;
                    const queryBasic = `SELECT COUNT(*) AS tc, COUNT(${quotedCol}) AS nnc, COUNT(DISTINCT ${quotedCol}) AS uc FROM ${tableName};`;
                    // CTE for mode/frequency
                    const queryModeFreq = `
                        WITH freq AS (
                            SELECT ${quotedCol} AS mv, COUNT(*) AS c
                            FROM ${tableName}
                            WHERE ${quotedCol} IS NOT NULL
                            GROUP BY ALL -- Use GROUP BY ALL for simplicity
                        )
                        SELECT mv, c FROM freq ORDER BY c DESC, mv ASC NULLS LAST LIMIT 1;
                    `;
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
                         console.warn(`計算類別統計 '${col}' 時出錯 (可能類型不適用): ${catErr}`);
                         // Optionally add an error entry or skip
                         categoricalStatsResults.push({
                             columnName: col,
                             'Total Count': 'Error',
                             'Non-NULL Count': 'Error',
                             'Unique Values': 'Error',
                             'Most Frequent Value (Mode)': 'Error',
                             'Mode Frequency': 'Error',
                         });
                    }
                }
            }

            // --- 4. Format and Display Stats ---
            updateStatus('正在格式化統計結果...');
            finalStatsDataForDownload = formatStatsForDisplayAndDownload(
                schemaData,
                numericalStatsResults,
                categoricalStatsResults
            );

            if (finalStatsDataForDownload && finalStatsDataForDownload.length > 0) {
                renderTable(statsContainer, finalStatsDataForDownload);
                downloadButton.style.display = 'inline-block'; // Show download button
                updateStatus('分析完成！', 'success');
            } else {
                statsContainer.innerHTML = '<p>未能生成統計數據。</p>';
                updateStatus('分析完成，但未生成統計數據。', 'info');
            }

        } catch (error) {
            updateStatus(`分析過程中出錯: ${error}`, 'error');
            console.error(error);
        } finally {
            // Clean up the registered file? Optional, depends on whether you reuse the name.
             try {
                 // await db.dropFile(registeredFileName); // Use if needed, check API
             } catch (dropErr) { console.warn("Error dropping file:", dropErr); }
            updateStatus('分析結束。您可以選擇另一個檔案。', 'info');
        }
    };

    reader.onerror = (event) => {
        updateStatus(`讀取檔案時發生錯誤: ${reader.error}`, 'error');
    };

    reader.readAsArrayBuffer(file); // Read file as ArrayBuffer
}

// Function to format stats into the long format for display/download
function formatStatsForDisplayAndDownload(schemaData, numericalStats, categoricalStats) {
    const allStatsRecords = [];
    const schemaMap = new Map(schemaData.map(item => [item.column_name, item.column_type]));

    // Process numerical stats
    if (numericalStats) {
        for (const key in numericalStats) {
            const value = numericalStats[key];
            const parts = key.split('_'); // Split "colname_stat"
            const statKey = parts.pop(); // Get the last part as stat key
            const originalColName = parts.join('_'); // Rejoin the rest as column name

            if (!originalColName || !statKey) continue; // Skip if parsing fails

            const inferredType = schemaMap.get(originalColName) || '未知';

            // Handle QUANTILES result (it's an array)
             if (statKey === 'quantiles' && Array.isArray(value)) {
                 allStatsRecords.push({
                     '原始欄位名稱': originalColName, '推斷類型': inferredType,
                     '統計指標': STAT_NAME_MAPPING_NUMERICAL['25%'] || '25%', '統計值': value[0]
                 });
                 allStatsRecords.push({
                     '原始欄位名稱': originalColName, '推斷類型': inferredType,
                     '統計指標': STAT_NAME_MAPPING_NUMERICAL['50% (median)'] || '50% (median)', '統計值': value[1]
                 });
                 allStatsRecords.push({
                     '原始欄位名稱': originalColName, '推斷類型': inferredType,
                     '統計指標': STAT_NAME_MAPPING_NUMERICAL['75%'] || '75%', '統計值': value[2]
                 });
             } else {
                 const chineseStatName = STAT_NAME_MAPPING_NUMERICAL[statKey] || statKey;
                 allStatsRecords.push({
                     '原始欄位名稱': originalColName,
                     '推斷類型': inferredType,
                     '統計指標': chineseStatName,
                     '統計值': value
                 });
             }
        }
    }


    // Process categorical stats
    if (categoricalStats) {
        categoricalStats.forEach(catStat => {
            const originalColName = catStat.columnName;
            const inferredType = schemaMap.get(originalColName) || '未知';
            for (const statKey in catStat) {
                if (statKey === 'columnName') continue; // Skip the column name itself
                const chineseStatName = STAT_NAME_MAPPING_CATEGORICAL[statKey] || statKey;
                allStatsRecords.push({
                    '原始欄位名稱': originalColName,
                    '推斷類型': inferredType,
                    '統計指標': chineseStatName,
                    '統計值': catStat[statKey]
                });
            }
        });
    }

    // Sort results
    allStatsRecords.sort((a, b) => {
        if (a['原始欄位名稱'] < b['原始欄位名稱']) return -1;
        if (a['原始欄位名稱'] > b['原始欄位名稱']) return 1;
        if (a['統計指標'] < b['統計指標']) return -1;
        if (a['統計指標'] > b['統計指標']) return 1;
        return 0;
    });

    return allStatsRecords;
}


// Function to generate CSV string from the formatted stats data
function generateCSV(dataArray) {
    if (!dataArray || dataArray.length === 0) return '';

    const headers = Object.keys(dataArray[0]);
    const csvRows = [headers.join(',')]; // Header row

    dataArray.forEach(row => {
        const values = headers.map(header => {
            let value = row[header];
            if (value === null || value === undefined) {
                value = '';
            } else {
                value = String(value);
                // Escape double quotes and handle commas within values
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    value = `"${value.replace(/"/g, '""')}"`;
                }
            }
            return value;
        });
        csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
}


// Function to trigger CSV download
function triggerDownload(csvString, filename) {
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8-sig;' }); // Add BOM for Excel
    const link = document.createElement('a');
    if (link.download !== undefined) { // Check for download attribute support
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up
    } else {
        updateStatus('瀏覽器不支援自動下載。', 'error');
    }
}

// --- Event Listeners ---

// Initialize DuckDB when the script loads
document.addEventListener('DOMContentLoaded', () => {
    fileInput.disabled = true; // Disable until DB is ready
    initDuckDB();
});


// Handle file selection
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        analyzeFile(file);
    } else {
        updateStatus('未選擇檔案。', 'info');
        resultsSection.style.display = 'none';
    }
});

// Handle download button click
downloadButton.addEventListener('click', () => {
    if (finalStatsDataForDownload) {
        const csvString = generateCSV(finalStatsDataForDownload);
        const originalFilename = fileInput.files[0]?.name ?? 'download';
        const baseName = originalFilename.includes('.') ? originalFilename.substring(0, originalFilename.lastIndexOf('.')) : originalFilename;
        const downloadFilename = `${baseName}_stats.csv`;
        triggerDownload(csvString, downloadFilename);
    } else {
        updateStatus('沒有可下載的統計數據。', 'error');
    }
});
