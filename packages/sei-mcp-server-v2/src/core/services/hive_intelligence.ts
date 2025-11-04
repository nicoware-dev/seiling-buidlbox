import { getHiveIntelligenceApiKey } from '../config.js';

// Hive Intelligence API Configuration
const HIVE_INTELLIGENCE_API_URL = "https://api.hiveintelligence.xyz/v1/search";

// tested but response is taking way longer time
// need to optimize but its from hive end so need to see
/**
 * @function fetchHiveResults
 * @description Sends a prompt to the Hive Intelligence API and retrieves the results.
 * @param {string} prompt - The query or prompt to send to the API.
 * @returns {Promise} A promise that resolves to the API results or an error object.
 */
export async function fetchHiveResults(
    prompt: string,
): Promise<any> {
    try {
        const apiKey = getHiveIntelligenceApiKey();

        const headers: Record<string, string> = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        const response = await fetch(HIVE_INTELLIGENCE_API_URL, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to fetch Hive Intelligence results: ${error.message}`);
        }
        throw new Error(`An unknown error occurred while fetching Hive Intelligence results: ${String(error)}`);
    }
}
