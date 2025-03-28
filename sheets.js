import { CONFIG } from './config.js';

class SheetsManager {
    constructor() {
        this.baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    async fetchSheetData(sheetName) {
        try {
            // Check if we have cached data that's not expired
            const cached = this.cache.get(sheetName);
            if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
                console.log(`Using cached data for ${sheetName}`);
                return cached.data;
            }

            console.log(`Fetching ${sheetName} data from Google Sheets...`);
            
            // Construct the URL
            const url = `${this.baseUrl}/${CONFIG.SHEETS_ID}/values/${sheetName}?key=${CONFIG.API_KEY}`;
            console.log(`Request URL: ${url}`);

            // Fetch data
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
            }

            const result = await response.json();
            console.log(`Raw response for ${sheetName}:`, result);

            if (!result.values || result.values.length < 2) {
                console.warn(`Warning: ${sheetName} sheet has insufficient data`);
                return [];
            }

            // Convert sheet data to array of objects
            const headers = result.values[0].map(header => header.toLowerCase().trim());
            console.log(`Headers for ${sheetName}:`, headers);

            const data = result.values.slice(1).map(row => {
                const item = {};
                headers.forEach((header, index) => {
                    item[header] = row[index] || '';
                });
                return item;
            });

            // Cache the results
            this.cache.set(sheetName, {
                data,
                timestamp: Date.now()
            });

            console.log(`Processed ${data.length} rows for ${sheetName}`);
            return data;

        } catch (error) {
            console.error(`Error fetching ${sheetName} data:`, error);
            throw new Error(`Failed to fetch ${sheetName} data: ${error.message}`);
        }
    }

    async saveApplicationData(data) {
        try {
            // Use the Apps Script URL
            const url = CONFIG.APPS_SCRIPT_URL;
            
            // Format the data
            const formData = {
                name: data.name,
                class: data.class,
                level: data.level,
                discord: data.discord,
                experience: data.experience || '',
                interests: Array.isArray(data.interests) ? data.interests.join(', ') : data.interests,
                message: data.message
            };

            console.log('Attempting to save application with data:', formData);

            // Convert data to URL-encoded form data
            const params = new URLSearchParams();
            Object.entries(formData).forEach(([key, value]) => {
                params.append(key, value);
            });

            // Make the request
            const response = await fetch(url + '?' + params.toString(), {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            console.log('Form submitted successfully');
            
            // Check if the data was actually saved by making a GET request
            const checkResponse = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (checkResponse.ok) {
                const result = await checkResponse.json();
                console.log('Verification response:', result);
                return { status: 'success', message: 'Application submitted successfully' };
            } else {
                throw new Error('Failed to verify submission');
            }

        } catch (error) {
            console.error('Error saving application:', error);
            throw error;
        }
    }

    clearCache() {
        this.cache.clear();
    }
}

// Create a singleton instance
const sheetsManager = new SheetsManager();

// Export the fetchSheetData function
export async function fetchSheetData(sheetName) {
    try {
        // Check if API key and Sheet ID are configured
        if (!CONFIG.API_KEY || !CONFIG.SHEETS_ID) {
            throw new Error('Google Sheets API key or Sheet ID not configured');
        }

        return await sheetsManager.fetchSheetData(sheetName);
    } catch (error) {
        console.error('Error in fetchSheetData:', error);
        throw error;
    }
}

// Export the saveApplicationData function
export async function saveApplicationData(data) {
    try {
        return await sheetsManager.saveApplicationData(data);
    } catch (error) {
        console.error('Error in saveApplicationData:', error);
        throw error;
    }
}

// Export the manager instance for direct access if needed
export { sheetsManager }; 