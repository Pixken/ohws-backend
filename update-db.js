// Script to create the big-egg database and import the schema
// This is a minimal script to be run with Node.js

const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const mysql = require('mysql');

// Database connection config
const dbConfig = {
  host: '117.72.49.27',
  port: 6480,
  user: 'zxdbf',
  password: '20011113XSZxsz.'
};

// Path to the SQL file
const sqlFilePath = path.join(__dirname, 'big-egg.sql');

// Function to execute MySQL commands
function executeQuery(connection, query) {
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

// Function to execute SQL file
function executeSqlFile(connection, filePath) {
  // Read the SQL file
  const sql = fs.readFileSync(filePath, 'utf8');
  
  // Split SQL file into separate statements
  const statements = sql.split(';').filter(statement => statement.trim() !== '');
  
  console.log(`Executing ${statements.length} SQL statements from ${filePath}`);
  
  // Execute each statement sequentially
  return statements.reduce((promise, statement) => {
    return promise.then(() => {
      return executeQuery(connection, statement);
    }).catch(error => {
      console.error(`Error executing statement: ${statement.substring(0, 100)}...`);
      throw error;
    });
  }, Promise.resolve());
}

async function main() {
  // Create connection to MySQL server
  const connection = mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password
  });
  
  try {
    // Connect to MySQL
    connection.connect();
    console.log('Connected to MySQL server');
    
    // Create database if it doesn't exist
    await executeQuery(connection, 'CREATE DATABASE IF NOT EXISTS `big-egg`');
    console.log('Database "big-egg" created or already exists');
    
    // Switch to the new database
    await executeQuery(connection, 'USE `big-egg`');
    console.log('Using database "big-egg"');
    
    // Execute the SQL file
    await executeSqlFile(connection, sqlFilePath);
    console.log('SQL script executed successfully');
    
    // Update the Prisma connection string in the .env file
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    
    // Replace DATABASE_URL or add it if it doesn't exist
    if (envContent.includes('DATABASE_URL=')) {
      envContent = envContent.replace(
        /DATABASE_URL=.*?(\r?\n|$)/,
        `DATABASE_URL=mysql://zxdbf:20011113XSZxsz.@117.72.49.27:6480/big-egg\n`
      );
    } else {
      envContent += `\nDATABASE_URL=mysql://zxdbf:20011113XSZxsz.@117.72.49.27:6480/big-egg\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('Updated DATABASE_URL in .env file');
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    // Close connection
    connection.end();
  }
}

main(); 