const express = require('express');
const mysql = require('mysql2/promise');
const csvParser = require('csv-parser');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ticker_data',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(express.json());



// async function loadDataFromCSV() {
//     try {
//       const connection = await pool.getConnection();
//       const insertQuery = `INSERT INTO ticker_data (ticker, date, revenue, gp) VALUES (?, STR_TO_DATE(?, '%m/%d/%Y'), ?, ?)`;
      
//       fs.createReadStream('data.csv')
//         .pipe(csvParser({
//           separator: '\t', // Specify the tab character as the separator
//           headers: false // Don't treat the first row as headers
//         }))
//         .on('data', async (row) => {
//           const rowData = Object.values(row)[0].split(',');
//           const [ticker, date, revenue, gp] = rowData;
//           await connection.query(insertQuery, [ticker, date, revenue, gp]);
//         })
//         .on('end', async () => {
//           console.log('CSV file successfully processed');
//           connection.release();
//         });
//     } catch (error) {
//       console.error('Error loading data from CSV:', error);
//     }
//   }


//   (async () => {
//     try {
//       await pool.query(`CREATE TABLE IF NOT EXISTS ticker_data (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         ticker VARCHAR(10),
//         date DATE,
//         revenue DECIMAL(18, 2),
//         gp DECIMAL(18, 2)
//       )`);
//       await loadDataFromCSV();
//       console.log('Database initialized and CSV data loaded');
//     } catch (error) {
//       console.error('Error initializing database:', error);
//     }
//   })();


app.get('/api/ticker/:tickerSymbol', async (req, res) => {
    try {
        const tickerSymbol = req.params.tickerSymbol; 
        const columns = req.query.column ? req.query.column.split(',') : ['date', 'revenue', 'gp', 'ticker']; 
        const period = req.query.period || '5y';

        let query = `SELECT ${columns.join(', ')} FROM ticker_data WHERE ticker = ?`; 

        const connection = await pool.getConnection();
        const [rows] = await connection.query(query, [tickerSymbol]); 
        connection.release();

        res.json(rows);
    } catch (error) {
        console.error('Error fetching ticker data:', error);
        res.status(500).json({ error: 'Failed to fetch ticker data' });
    }
});

app.get('/api/ticker/all', async (req, res) => {
    try {
        const query = `SELECT * FROM ticker_data LIMIT 20`;

        const connection = await pool.getConnection();
        const [rows] = await connection.query(query);
        connection.release();
        res.json(rows);
    } catch (error) {
        console.error('Error fetching ticker data:', error);
        res.status(500).json({ error: 'Failed to fetch ticker data' });
    }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
