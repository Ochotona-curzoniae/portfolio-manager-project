import axios from 'axios';
// Function to fetch stock data
async function getStockData(symbol) {
const url = `https://yfapi.net/v8/finance/chart/${symbol}`;
const options = {
headers: {
'x-api-key': 'YOUR_API_KEY' // Replace with your actual API key
}
};

try {
const response = await axios.get(url, options);
console.log(response.data);
} catch (error) {
console.error('Error fetching stock data:', error);
}
}

// Example usage
getStockData('AAPL'); // Fetch data for Apple Inc