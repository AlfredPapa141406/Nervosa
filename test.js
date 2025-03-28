import { fetchSheetData } from './sheets.js';

async function testConnection() {
    try {
        const members = await fetchSheetData('Members');
        console.log('Successfully connected to Members sheet:', members);
    } catch (error) {
        console.error('Error connecting to sheet:', error);
    }
}

testConnection(); 