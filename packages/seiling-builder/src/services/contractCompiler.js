// Note: Solidity compilation is disabled in browser due to solc compatibility issues
// For production, consider using a backend service for compilation (like conflux-box does)
// This keeps the frontend lightweight and avoids Node.js module issues
let solcModule = null;
let solcLoadAttempted = false;
async function getSolc() {
    if (solcLoadAttempted && !solcModule) {
        throw new Error('Solc failed to load previously');
    }
    if (!solcModule) {
        solcLoadAttempted = true;
        try {
            // Try to load solc dynamically - this may fail in browser environments
            const solcImport = await import(/* @vite-ignore */ 'solc');
            // Handle different export structures
            if (solcImport && typeof solcImport === 'object') {
                if (solcImport.compile && typeof solcImport.compile === 'function') {
                    solcModule = solcImport;
                }
                else if (solcImport.default) {
                    const defaultExport = solcImport.default;
                    if (defaultExport.compile && typeof defaultExport.compile === 'function') {
                        solcModule = defaultExport;
                    }
                    else {
                        solcModule = defaultExport;
                    }
                }
                else {
                    solcModule = solcImport;
                }
            }
            else {
                solcModule = solcImport;
            }
        }
        catch (error) {
            console.warn('Solc could not be loaded in browser environment:', error?.message);
            // Don't throw - allow the app to continue without compilation feature
            solcModule = null;
        }
    }
    if (!solcModule) {
        throw new Error('Solidity compiler is not available in browser environment. ' +
            'Please use bytecode + ABI deployment mode, or deploy contracts from a Node.js environment.');
    }
    return solcModule;
}
/**
 * Compile Solidity source code
 */
export async function compileContract(sourceCode, contractName, optimizerEnabled = true, optimizerRuns = 200) {
    try {
        // Auto-detect contract name if not provided
        if (!contractName) {
            const contractMatch = sourceCode.match(/contract\s+(\w+)/);
            if (contractMatch) {
                contractName = contractMatch[1];
            }
        }
        // If still no contract name, use default
        const finalContractName = contractName || 'Contract';
        // Create compilation input
        const input = {
            language: 'Solidity',
            sources: {
                'contract.sol': {
                    content: sourceCode,
                },
            },
            settings: {
                optimizer: {
                    enabled: optimizerEnabled,
                    runs: optimizerRuns,
                },
                evmVersion: 'london',
                outputSelection: {
                    '*': {
                        '*': ['abi', 'evm.bytecode.object'],
                    },
                },
            },
        };
        // Compile - dynamically load solc
        const solc = await getSolc();
        // Handle different solc export structures
        let compileFn;
        if (typeof solc === 'function') {
            compileFn = solc;
        }
        else if (solc.compile && typeof solc.compile === 'function') {
            compileFn = solc.compile;
        }
        else {
            throw new Error('Unable to find solc.compile function');
        }
        const output = JSON.parse(compileFn(JSON.stringify(input)));
        // Check for compilation errors
        if (output.errors) {
            const errors = output.errors
                .filter((e) => e.severity === 'error')
                .map((e) => e.formattedMessage || e.message);
            if (errors.length > 0) {
                return {
                    success: false,
                    abi: [],
                    bytecode: '',
                    errors,
                };
            }
        }
        // Extract contract output
        const contractOutput = output.contracts['contract.sol']?.[finalContractName];
        if (!contractOutput) {
            // Try to find any contract
            const contracts = output.contracts['contract.sol'];
            const firstContract = contracts ? Object.keys(contracts)[0] : null;
            if (!firstContract) {
                return {
                    success: false,
                    abi: [],
                    bytecode: '',
                    errors: ['No contract found in source code'],
                };
            }
            const contractData = contracts[firstContract];
            return {
                success: true,
                abi: contractData.abi || [],
                bytecode: contractData.evm?.bytecode?.object || '',
                contractName: firstContract,
            };
        }
        return {
            success: true,
            abi: contractOutput.abi || [],
            bytecode: contractOutput.evm?.bytecode?.object || '',
            contractName: finalContractName,
        };
    }
    catch (error) {
        return {
            success: false,
            abi: [],
            bytecode: '',
            errors: [error instanceof Error ? error.message : String(error)],
        };
    }
}
/**
 * Validate Solidity source code syntax
 */
export async function validateSoliditySource(sourceCode) {
    try {
        const input = {
            language: 'Solidity',
            sources: {
                'contract.sol': {
                    content: sourceCode,
                },
            },
            settings: {
                outputSelection: {
                    '*': {
                        '*': [],
                    },
                },
            },
        };
        // Dynamically load solc
        const solc = await getSolc();
        // Handle different solc export structures
        let compileFn;
        if (typeof solc === 'function') {
            compileFn = solc;
        }
        else if (solc.compile && typeof solc.compile === 'function') {
            compileFn = solc.compile;
        }
        else {
            throw new Error('Unable to find solc.compile function');
        }
        const output = JSON.parse(compileFn(JSON.stringify(input)));
        if (output.errors) {
            const errors = output.errors
                .filter((e) => e.severity === 'error')
                .map((e) => e.formattedMessage || e.message);
            if (errors.length > 0) {
                return {
                    valid: false,
                    errors,
                };
            }
        }
        return { valid: true };
    }
    catch (error) {
        return {
            valid: false,
            errors: [error instanceof Error ? error.message : String(error)],
        };
    }
}
