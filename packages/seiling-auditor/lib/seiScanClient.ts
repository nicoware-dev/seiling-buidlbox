import axios from 'axios';

// Use environment variable or fallback to default SeiScan API
// SeiScan API client for Sei blockchain contract verification
const SEISCAN_API_URL = process.env.SEISCAN_API_URL || 'https://api.seiscan.app';
const SEISCAN_API_KEY = process.env.SEISCAN_API_KEY;

function removeComments(sourceCode: string): string {
  let result = '';
  let i = 0;
  let inString = false;
  let stringChar = '';
  let inSingleLineComment = false;
  let inMultiLineComment = false;
  
  while (i < sourceCode.length) {
    const char = sourceCode[i];
    const nextChar = sourceCode[i + 1];
    
    if (!inSingleLineComment && !inMultiLineComment) {
      if ((char === '"' || char === "'") && !inString) {
        inString = true;
        stringChar = char;
        result += char;
        i++;
        continue;
      } else if (inString && char === stringChar && sourceCode[i - 1] !== '\\') {
        inString = false;
        stringChar = '';
        result += char;
        i++;
        continue;
      }
    }
    
    if (inString) {
      result += char;
      i++;
      continue;
    }
    
    if (!inSingleLineComment && !inMultiLineComment) {
      if (char === '/' && nextChar === '/') {
        inSingleLineComment = true;
        i += 2;
        continue;
      } else if (char === '/' && nextChar === '*') {
        inMultiLineComment = true;
        i += 2;
        continue;
      }
    }
    
    if (inSingleLineComment && char === '\n') {
      inSingleLineComment = false;
      result += char; 
      i++;
      continue;
    }
    
    if (inMultiLineComment && char === '*' && nextChar === '/') {
      inMultiLineComment = false;
      i += 2;
      result += '  ';
      continue;
    }
    
    if (inSingleLineComment || inMultiLineComment) {
      if (inMultiLineComment && char === '\n') {
        result += char;
      } else if (inMultiLineComment) {
        result += ' '; 
      }
      i++;
      continue;
    }
    
    result += char;
    i++;
  }
  
  return result;
}

export class ContractNotFound extends Error {
  constructor(address: string) {
    super(`Contract not found or not verified on Sei: ${address}`);
    this.name = 'ContractNotFound';
  }
}

export interface ContractSource {
  name: string;
  content: string;
}

export interface VerifiedContract {
  address: string;
  contractName: string;
  sources: ContractSource[];
  compiler: {
    version: string;
    settings?: any;
  };
  constructorArguments?: string;
  abi?: any[];
}

export async function getContractSource(address: string): Promise<string> {
  console.log(`[SeiScan] Fetching contract source for address: ${address}`);
  
  // SeiScan API endpoint structure - adapt based on actual API documentation
  // Structure for verified contract data from SeiScan
  const apiUrl = `${SEISCAN_API_URL}/api?module=contract&action=getsourcecode&address=${address}`;
  if (SEISCAN_API_KEY) {
    console.log(`[SeiScan] Using API key for enhanced rate limits`);
  }
  console.log(`[SeiScan] API URL: ${apiUrl}`);
  
  try {
    const requestConfig: any = {
      url: apiUrl,
      method: 'GET'
    };

    // Add API key if available
    if (SEISCAN_API_KEY) {
      requestConfig.params = { apikey: SEISCAN_API_KEY };
    }

    const response = await axios(requestConfig);
    console.log(`[SeiScan] Response status: ${response.status}`);
    console.log(`[SeiScan] Response data:`, JSON.stringify(response.data, null, 2));
    
    // SeiScan may return different response structure - adapt as needed
    if (response.data.status === '0' || response.data.status === 0) {
      console.log(`[SeiScan] API returned error status:`, response.data.message);
      throw new ContractNotFound(address);
    }
    
    const result = response.data.result;
    if (!result || !Array.isArray(result) || result.length === 0) {
      console.log(`[SeiScan] No result data found`);
      throw new ContractNotFound(address);
    }
    
    const contractData = result[0];
    const sourceCode = contractData.SourceCode || contractData.sourceCode;
    console.log(`[SeiScan] Extracted source code length:`, sourceCode?.length || 0);
    
    if (!sourceCode || sourceCode.trim().length === 0) {
      console.log(`[SeiScan] No source code found in result`);
      throw new ContractNotFound(address);
    }
    
    const cleanedSourceCode = removeComments(sourceCode);
    console.log(`[SeiScan] Source code cleaned, original length: ${sourceCode.length}, cleaned length: ${cleanedSourceCode.length}`);
    
    return cleanedSourceCode;
  } catch (error) {
    console.error(`[SeiScan] Error fetching contract:`, error);
    
    if (axios.isAxiosError(error)) {
      console.log(`[SeiScan] Axios error status:`, error.response?.status);
      console.log(`[SeiScan] Axios error data:`, error.response?.data);
      
      if (error.response?.status === 404) {
        throw new ContractNotFound(address);
      }
    }
    
    if (error instanceof ContractNotFound) {
      throw error;
    }
    
    throw error;
  }
}

/**
 * Get full verified contract details including multi-file sources
 */
export async function getVerifiedContract(address: string): Promise<VerifiedContract> {
  console.log(`[SeiScan] Fetching verified contract details for address: ${address}`);
  
  const apiUrl = `${SEISCAN_API_URL}/api?module=contract&action=getsourcecode&address=${address}`;
  console.log(`[SeiScan] API URL: ${apiUrl}`);
  
  try {
    const requestConfig: any = {
      url: apiUrl,
      method: 'GET'
    };

    // Add API key if available
    if (SEISCAN_API_KEY) {
      requestConfig.params = { apikey: SEISCAN_API_KEY };
    }

    const response = await axios(requestConfig);
    console.log(`[SeiScan] Response status: ${response.status}`);
    
    // SeiScan may return different response structure - adapt as needed
    if (response.data.status === '0' || response.data.status === 0) {
      console.log(`[SeiScan] API returned error status:`, response.data.message);
      throw new ContractNotFound(address);
    }
    
    const result = response.data.result;
    if (!result || !Array.isArray(result) || result.length === 0) {
      console.log(`[SeiScan] No result data found`);
      throw new ContractNotFound(address);
    }
    
    const contractData = result[0];
    const sourceCode = contractData.SourceCode || contractData.sourceCode;
    
    if (!sourceCode || sourceCode.trim().length === 0) {
      console.log(`[SeiScan] No source code found in result`);
      throw new ContractNotFound(address);
    }

    // Parse multi-file sources if present
    const sources: ContractSource[] = [];
    
    try {
      // Check if it's a JSON with multiple files (Solidity Standard JSON Input)
      if (sourceCode.startsWith('{') && sourceCode.includes('"sources"')) {
        const parsed = JSON.parse(sourceCode);
        
        if (parsed.sources) {
          // Standard JSON format
          for (const [fileName, fileData] of Object.entries(parsed.sources)) {
            const content = (fileData as any).content;
            if (content) {
              sources.push({
                name: fileName,
                content: removeComments(content)
              });
            }
          }
        }
      } 
      // Check if it's wrapped in extra braces (some APIs return this format)
      else if (sourceCode.startsWith('{{') && sourceCode.endsWith('}}')) {
        const unwrapped = sourceCode.slice(1, -1);
        const parsed = JSON.parse(unwrapped);
        
        if (parsed.sources) {
          for (const [fileName, fileData] of Object.entries(parsed.sources)) {
            const content = (fileData as any).content;
            if (content) {
              sources.push({
                name: fileName,
                content: removeComments(content)
              });
            }
          }
        }
      }
    } catch (parseError) {
      console.log(`[SeiScan] Failed to parse multi-file format, treating as single file`);
    }

    // If no multi-file sources found, treat as single file
    if (sources.length === 0) {
      const contractName = contractData.ContractName || 'Contract';
      const fileName = `${contractName}.sol`;
      sources.push({
        name: fileName,
        content: removeComments(sourceCode)
      });
    }

    console.log(`[SeiScan] Parsed ${sources.length} source files for contract ${address}`);

    return {
      address: address.toLowerCase(),
      contractName: contractData.ContractName || 'Contract',
      sources,
      compiler: {
        version: contractData.CompilerVersion || 'unknown',
        settings: contractData.Settings ? JSON.parse(contractData.Settings) : undefined
      },
      constructorArguments: contractData.ConstructorArguments,
      abi: contractData.ABI ? JSON.parse(contractData.ABI) : undefined
    };

  } catch (error) {
    console.error(`[SeiScan] Error fetching verified contract:`, error);
    
    if (axios.isAxiosError(error)) {
      console.log(`[SeiScan] Axios error status:`, error.response?.status);
      console.log(`[SeiScan] Axios error data:`, error.response?.data);
      
      if (error.response?.status === 404) {
        throw new ContractNotFound(address);
      }
    }
    
    if (error instanceof ContractNotFound) {
      throw error;
    }
    
    throw error;
  }
}

/**
 * Get combined source code from all files in a verified contract
 */
export async function getCombinedContractSource(address: string): Promise<string> {
  const verifiedContract = await getVerifiedContract(address);
  
  if (verifiedContract.sources.length === 1) {
    return verifiedContract.sources[0].content;
  }

  // Combine multiple files with clear separators and line preservation
  let combinedSource = '';
  let currentLine = 1;
  
  for (const source of verifiedContract.sources) {
    combinedSource += `// File: ${source.name}\n`;
    combinedSource += `// Lines ${currentLine}-${currentLine + source.content.split('\n').length - 1}\n\n`;
    combinedSource += source.content;
    combinedSource += '\n\n';
    
    currentLine += source.content.split('\n').length + 3; // +3 for the comment lines and spacing
  }

  return combinedSource.trim();
}

