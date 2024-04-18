const fs = require('fs');

// Function to read the first line of a CSV file
function readFirstLineFromCSV(filePath) {
    // Read the file
    const data = fs.readFileSync(filePath, 'utf8');
    // Split the data by new line
    const lines = data.split('\n');
    // Return the first line
    return lines[1];
}

// Example usage
const filePath = 'adjusted.csv'; // Replace 'example.csv' with your CSV file path
const firstLine = readFirstLineFromCSV(filePath);
console.log('First line of the CSV file:', firstLine);
