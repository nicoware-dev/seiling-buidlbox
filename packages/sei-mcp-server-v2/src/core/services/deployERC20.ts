import { getWalletClient, getPublicClient } from './clients.js';
import { getPrivateKeyAsHex, getSeiTraceApiKey } from '../config.js';
import { DEFAULT_NETWORK } from '../chains.js';
import { getContract, encodeAbiParameters } from 'viem';
import { erc20DeployAbi, ERC20_BYTECODE } from './abi/erc20.js';
import { VERIFICATION_APIS, ERC20_SOURCE_CODE } from './utils.js';
import { helpers } from './index.js';

/**
 * Deploys a custom ERC20 token contract.
 * @param name The name of the token.
 * @param symbol The symbol of the token.
 * @param initialSupply The total initial supply of the token (e.g., "1000000" for one million tokens). The contract will handle decimal conversion.
 * @param decimals The number of decimals the token should have.
 * @param network The network to deploy to.
 * @returns The transaction hash of the deployment and the deployer's address.
 */
export async function deployERC20(
  name: string,
  symbol: string,
  initialSupply: string,
  decimals: number,
  network = DEFAULT_NETWORK
): Promise<{ txHash: `0x${string}`, deployerAddress: `0x${string}` }> {
  try {
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) {
      throw new Error('Private key not available. Set the PRIVATE_KEY environment variable.');
    }

    const walletClient = getWalletClient(privateKey, network);
    const account = walletClient.account;

    console.log(`Deploying ERC20 token "${name}" (${symbol}) with initial supply of ${initialSupply} and ${decimals} decimals...`);

    const supplyAsBigInt = BigInt(initialSupply);

    // Validate inputs
    if (decimals < 0 || decimals > 77) {
      throw new Error('Decimals must be between 0 and 77');
    }

    if (supplyAsBigInt <= 0n) {
      throw new Error('Initial supply must be greater than 0');
    }

    const deploymentArgs = {
      abi: erc20DeployAbi,
      bytecode: ERC20_BYTECODE as `0x${string}`,
      args: [name, symbol, supplyAsBigInt, decimals] as const,
      account,
      chain: walletClient.chain,
      gas: 2000000n,
    };

    const hash = await walletClient.deployContract({
      ...deploymentArgs,
      account: deploymentArgs.account || null
    });

    console.log(`ERC20 contract deployment transaction sent. Hash: ${hash}`);
    return { txHash: hash, deployerAddress: account?.address || '0x0' };

  } catch (error) {
    console.error('Deployment error details:', error);

    if (error instanceof Error) {
      if (error.message.includes('insufficient funds')) {
        throw new Error(`Insufficient funds for deployment. Check your account balance and gas requirements.`);
      } else if (error.message.includes('nonce')) {
        throw new Error(`Nonce error. Try again in a few seconds.`);
      } else if (error.message.includes('gas')) {
        throw new Error(`Gas-related error: ${error.message}. Try increasing gas limit or check network status.`);
      }
      throw new Error(`Failed to deploy ERC20 contract: ${error.message}`);
    }
    throw new Error(`Failed to deploy ERC20 contract: ${String(error)}`);
  }
}

/**
 * Verifies an ERC20 contract locally.
 * @param contractAddress The deployed contract address.
 * @param name The name of the token used during deployment.
 * @param symbol The symbol of the token used during deployment.
 * @param initialSupply The initial supply used during deployment.
 * @param decimals The decimals used during deployment.
 * @param network The network where the contract was deployed.
 * @returns Verification result with status and details.
 */
export async function verifyERC20ContractLocal(
  contractAddress: string,
  name: string,
  symbol: string,
  initialSupply: string,
  decimals: number,
  network = DEFAULT_NETWORK
): Promise<{
  success: boolean,
  message: string,
  explorerUrl?: string,
  contractAddress: string
}> {
  try {
    // Validate contract address format
    if (!contractAddress.startsWith('0x') || contractAddress.length !== 42) {
      throw new Error('Invalid contract address format');
    }

    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) {
      throw new Error('Private key not available. Set the PRIVATE_KEY environment variable.');
    }

    const publicClient = getPublicClient(network);
    const walletClient = getWalletClient(privateKey, network);

    console.log(`Verifying ERC20 contract at ${contractAddress} on ${network}...`);

    // First, verify the contract exists and has code
    const code = await publicClient.getCode({ address: contractAddress as `0x${string}` });
    if (!code || code === '0x') {
      throw new Error('No contract found at the specified address');
    }

    // Basic contract validation by checking if it responds to ERC20 standard calls
    try {
      const contract = getContract({
        address: contractAddress as `0x${string}`,
        abi: erc20DeployAbi,
        client: publicClient
      });

      // Read contract data to verify it matches deployment parameters
      const [contractName, contractSymbol, contractDecimals, contractTotalSupply] = await Promise.all([
        contract.read.name(),
        contract.read.symbol(),
        contract.read.decimals(),
        contract.read.totalSupply()
      ]);

      // Verify the contract parameters match what was expected
      const expectedTotalSupply = BigInt(initialSupply) * (10n ** BigInt(decimals));

      const parameterMatches = {
        name: contractName === name,
        symbol: contractSymbol === symbol,
        decimals: Number(contractDecimals) === decimals,
        totalSupply: contractTotalSupply === expectedTotalSupply
      };

      const allMatch = Object.values(parameterMatches).every(match => match);

      if (!allMatch) {
        const mismatches = Object.entries(parameterMatches)
          .filter(([_, matches]) => !matches)
          .map(([param]) => param);

        console.warn(`Parameter mismatches detected: ${mismatches.join(', ')}`);
        return {
          success: false,
          message: `Contract verification failed: Parameter mismatches detected for ${mismatches.join(', ')}. Contract exists but parameters don't match deployment inputs.`,
          contractAddress,
          explorerUrl: walletClient.chain?.blockExplorers?.default ?
            `${walletClient.chain.blockExplorers.default.url}/address/${contractAddress}` : undefined
        };
      }

      // Contract verification successful
      const explorerUrl = walletClient.chain?.blockExplorers?.default ?
        `${walletClient.chain.blockExplorers.default.url}/address/${contractAddress}` : undefined;

      console.log(`✅ Contract verification successful!`);
      console.log(`Contract Address: ${contractAddress}`);
      console.log(`Name: ${contractName}`);
      console.log(`Symbol: ${contractSymbol}`);
      console.log(`Decimals: ${contractDecimals}`);
      console.log(`Total Supply: ${contractTotalSupply.toString()}`);
      if (explorerUrl) {
        console.log(`Explorer URL: ${explorerUrl}`);
      }

      return {
        success: true,
        message: `Contract verification successful! All parameters match deployment inputs.`,
        contractAddress,
        explorerUrl
      };

    } catch (contractError) {
      throw new Error(`Contract interaction failed: ${contractError instanceof Error ? contractError.message : String(contractError)}`);
    }

  } catch (error) {
    console.error('Verification error details:', error);

    if (error instanceof Error) {
      if (error.message.includes('network')) {
        throw new Error(`Network error during verification: ${error.message}`);
      } else if (error.message.includes('address')) {
        throw new Error(`Invalid contract address: ${error.message}`);
      }
      throw new Error(`Contract verification failed: ${error.message}`);
    }
    throw new Error(`Contract verification failed: ${String(error)}`);
  }
}

/**
 * Verifies an ERC20 contract on Seitrace block explorer by submitting source code.
 * @param contractAddress The deployed contract address.
 * @param name The name of the token used during deployment.
 * @param symbol The symbol of the token used during deployment.
 * @param initialSupply The initial supply used during deployment.
 * @param decimals The decimals used during deployment.
 * @param network The network where the contract was deployed.
 * @returns Verification result with status and details.
 */
export async function verifyERC20Contract(
  contractAddress: string,
  name: string,
  symbol: string,
  initialSupply: string,
  decimals: number,
  network = DEFAULT_NETWORK
): Promise<{
  success: boolean,
  message: string,
  explorerUrl?: string,
  contractAddress: string,
  verificationGuid?: string
}> {
  try {
    // Validate contract address format
    if (!contractAddress.startsWith('0x') || contractAddress.length !== 42) {
      throw new Error('Invalid contract address format');
    }

    // Get network configuration
    const networkConfig = VERIFICATION_APIS[network as keyof typeof VERIFICATION_APIS];
    if (!networkConfig) {
      throw new Error(`Verification not supported for network: ${network}. Supported networks: ${Object.keys(VERIFICATION_APIS).join(', ')}`);
    }

    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) {
      throw new Error('Private key not available. Set the PRIVATE_KEY environment variable.');
    }

    const walletClient = getWalletClient(privateKey, network);

    const chainConfig = walletClient.chain;
    if (!chainConfig) {
      throw new Error(`Unsupported network: ${network}`);
    }

    console.log(`Verifying ERC20 contract at ${contractAddress} on Seitrace...`);

    const seiscanApiKey = getSeiTraceApiKey();
    if (!seiscanApiKey) {
      throw new Error('SeiTrace API key not available. Set the SEITRACE_API_KEY environment variable.');
    }

    // First, verify the contract exists and has code
    const publicClient = getPublicClient(network);

    const code = await publicClient.getBytecode({ address: contractAddress as `0x${string}` });
    if (!code || code === '0x') {
      throw new Error('No contract found at the specified address');
    }

    // Encode constructor arguments
    const constructorArgs = await encodeConstructorArguments(name, symbol, initialSupply, decimals);

    const verificationPayload = {
      module: 'contract',
      action: 'verifysourcecode',
      apikey: seiscanApiKey,
      contractaddress: contractAddress.toLowerCase(),
      sourceCode: ERC20_SOURCE_CODE,
      codeformat: 'solidity-single-file',
      contractname: 'ERC20Contract',
      compilerversion: 'v0.8.20+commit.a1b79de6',
      optimizationUsed: '1',
      runs: '200',
      constructorArguements: constructorArgs,
      evmversion: 'paris',
      licenseType: '3'
    };

    console.log('Submitting contract for verification...');
    console.log(`API Endpoint: ${networkConfig.apiUrl}`);
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Constructor Args: ${constructorArgs}`);

    // Submit verification request to Seitrace
    const response = await fetch(networkConfig.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'ERC20-Deployment-Tool/1.0'
      },
      body: new URLSearchParams(verificationPayload).toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Response Error:', errorText);
      throw new Error(`Verification API request failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Verification API Response:', result);

    // Handle different response formats from block explorer APIs
    if (result.status === '1' || result.message === 'OK') {
      const explorerUrl = `${networkConfig.explorerUrl}/address/${contractAddress}`;

      console.log('✅ Contract verification submitted successfully!');
      console.log(`Contract Address: ${contractAddress}`);
      console.log(`Explorer URL: ${explorerUrl}`);
      console.log(`Verification GUID: ${result.result || 'N/A'}`);

      return {
        success: true,
        message: 'Contract verification submitted successfully! It may take a few minutes to process.',
        contractAddress,
        explorerUrl,
        verificationGuid: result.result
      };
    } else if (result.status === '0') {
      // Handle specific error cases
      if (result.result && result.result.includes('already verified')) {
        return {
          success: true,
          message: 'Contract is already verified on the block explorer.',
          contractAddress,
          explorerUrl: `${networkConfig.explorerUrl}/address/${contractAddress}`
        };
      } else {
        throw new Error(`Verification failed: ${result.result || result.message || 'Unknown error'}`);
      }
    } else {
      throw new Error(`Unexpected response format: ${JSON.stringify(result)}`);
    }

  } catch (error) {
    console.error('Verification error details:', error);

    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        throw new Error(`Network error during verification: ${error.message}. Check if Seitrace API is accessible.`);
      } else if (error.message.includes('address')) {
        throw new Error(`Invalid contract address: ${error.message}`);
      } else if (error.message.includes('already verified')) {
        return {
          success: true,
          message: error.message,
          contractAddress,
          explorerUrl: VERIFICATION_APIS[network as keyof typeof VERIFICATION_APIS]?.explorerUrl ?
            `${VERIFICATION_APIS[network as keyof typeof VERIFICATION_APIS].explorerUrl}/address/${contractAddress}` : undefined
        };
      }
      throw new Error(`Contract verification failed: ${error.message}`);
    }
    throw new Error(`Contract verification failed: ${String(error)}`);
  }
}

/**
 * Encodes constructor arguments for contract verification.
 * @param name Token name
 * @param symbol Token symbol  
 * @param initialSupply Initial supply (without decimals - the contract multiplies by 10^decimals)
 * @param decimals Number of decimals
 * @returns Encoded constructor arguments as hex string
 */
export function encodeConstructorArguments(
  name: string,
  symbol: string,
  initialSupply: string,
  decimals: number
): string {
  const encoded = encodeAbiParameters(
    [
      { type: 'string', name: 'name' },
      { type: 'string', name: 'symbol' },
      { type: 'uint256', name: 'initialSupply' },
      { type: 'uint8', name: 'decimalsValue' }
    ],
    [name, symbol, BigInt(initialSupply), decimals]
  );
  return encoded.slice(2); // remove `0x` prefix as required by verification APIs
}

/**
 * Checks the verification status of a contract.
 * @param contractAddress The contract address to check
 * @param network The network 
 * @returns Verification status
 */
export async function checkVerificationStatus(
  contractAddress: string,
  network = DEFAULT_NETWORK
): Promise<{
  isVerified: boolean,
  status: string,
  explorerUrl?: string
}> {
  try {
    const networkConfig = VERIFICATION_APIS[network as keyof typeof VERIFICATION_APIS];
    if (!networkConfig) {
      throw new Error(`Status check not supported for network: ${network}`);
    }

    const apiUrl = `${networkConfig.url}/api?module=contract&action=getabi&address=${contractAddress}`;
    const explorerUrl = `${networkConfig.explorerUrl}/address/${contractAddress}`;

    const res = await fetch(apiUrl);
    const json = await res.json();

    if (json.status === '1') {
      return {
        isVerified: true,
        status: 'Contract is verified ✅',
        explorerUrl
      };
    } else {
      return {
        isVerified: false,
        status: json.result || 'Contract not verified ❌',
        explorerUrl
      };
    }
  } catch (error) {
    throw new Error(`Failed to check verification status: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Mints additional tokens to a specified address.
 * NOTE: The private key used must belong to the owner of the token contract address.
 * @param tokenAddress The address of the deployed ERC20 contract.
 * @param toAddress The recipient address to receive the new tokens.
 * @param amount The number of tokens to mint (e.g., "5000"). The function will handle decimal conversion.
 * @param network The network where the contract is deployed.
 * @returns The transaction hash of the mint operation.
 */
export async function mintTokens(
  tokenAddress: string,
  toAddress: string,
  amount: string,
  network = DEFAULT_NETWORK
): Promise<{ txHash: `0x${string}` }> {
  try {
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) {
      throw new Error('Private key not available. Set the PRIVATE_KEY environment variable.');
    }

    const validatedTokenAddress = helpers.validateAddress(tokenAddress);

    const publicClient = getPublicClient(network);
    const walletClient = getWalletClient(privateKey, network);
    const account = walletClient.account;

    if (!account) {
      throw new Error('Could not get account from wallet client.');
    }

    let validatedToAddress;
    if (toAddress === "") {
      validatedToAddress = account.address;
    } else {
      validatedToAddress = helpers.validateAddress(toAddress);
    }
    console.log(`Preparing to mint ${amount} tokens to ${validatedToAddress} on contract ${validatedTokenAddress}...`);

    // Create a contract instance to interact with it
    const contract = getContract({
      address: validatedTokenAddress as `0x${string}`,
      abi: erc20DeployAbi,
      client: publicClient
    });

    // Fetch the token's decimals to calculate the correct amount
    const decimals = await contract.read.decimals();
    console.log(`Token decimals: ${decimals}`);

    // Calculate the final amount in the token's smallest unit
    const amountAsBigInt = BigInt(amount) * (10n ** BigInt(decimals));
    console.log(`Executing mint transaction for ${amountAsBigInt.toString()} units...`);

    // Call the mint function
    const hash = await walletClient.writeContract({
      address: validatedTokenAddress as `0x${string}`,
      abi: erc20DeployAbi,
      functionName: 'mint',
      args: [validatedToAddress as `0x${string}`, amountAsBigInt],
      account,
      chain: walletClient.chain
    });

    console.log(`✅ Mint transaction sent successfully! Hash: ${hash}`);

    return { txHash: hash };

  } catch (error) {
    console.error('Minting error details:', error);

    if (error instanceof Error) {
      if (error.message.includes('insufficient funds')) {
        throw new Error(`Insufficient funds for minting. Check your account balance and gas requirements.`);
      } else if (error.message.includes('caller is not the owner')) {
        throw new Error('Minting failed: The provided private key does not belong to the contract owner.');
      } else if (error.message.includes('nonce')) {
        throw new Error(`Nonce error. Try again in a few seconds.`);
      }
      throw new Error(`Failed to mint tokens: ${error.message}`);
    }
    throw new Error(`Failed to mint tokens: ${String(error)}`);
  }
}