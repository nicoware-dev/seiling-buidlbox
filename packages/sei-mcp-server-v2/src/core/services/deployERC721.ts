import { getWalletClient, getPublicClient } from './clients.js';
import { getPrivateKeyAsHex, getSeiTraceApiKey } from '../config.js';
import { DEFAULT_NETWORK } from '../chains.js';
import { getContract, encodeAbiParameters } from 'viem';
import { erc721Abi, ERC721_BYTECODE } from './abi/erc721.js';
import { VERIFICATION_APIS, ERC721_SOURCE_CODE } from './utils.js';
import { helpers } from './index.js';

/**
 * Deploys a custom ERC721 token contract.
 * @param name The name of the token.
 * @param symbol The symbol of the token.
 * @param baseURI_ The base URI for token metadata.
 * @param network The network to deploy to.
 * @returns The transaction hash of the deployment and the deployer's address.
 */
export async function deployERC721(
  name: string,
  symbol: string,
  baseURI_: string,
  network = DEFAULT_NETWORK
): Promise<{ txHash: `0x${string}`, deployerAddress: `0x${string}` }> {
  try {
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) {
      throw new Error('Private key not available. Set the PRIVATE_KEY environment variable.');
    }

    const walletClient = getWalletClient(privateKey, network);
    const account = walletClient.account;

    console.log(`Deploying ERC721 token "${name}" (${symbol}) with base URI "${baseURI_}"...`);

    const deploymentArgs = {
      abi: erc721Abi,
      bytecode: ERC721_BYTECODE as `0x${string}`,
      args: [name, symbol, baseURI_] as const,
      account,
      chain: walletClient.chain,
      gas: 2000000n,
    };

    const hash = await walletClient.deployContract({
      ...deploymentArgs,
      account: deploymentArgs.account || null
    });

    console.log(`ERC721 contract deployment transaction sent. Hash: ${hash}`);
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
      throw new Error(`Failed to deploy ERC721 contract: ${error.message}`);
    }
    throw new Error(`Failed to deploy ERC721 contract: ${String(error)}`);
  }
}

/**
 * Verifies an ERC721 contract locally.
 * @param contractAddress The deployed contract address.
 * @param name The name of the token used during deployment.
 * @param symbol The symbol of the token used during deployment.
 * @param baseURI_ The base URI used during deployment.
 * @param network The network where the contract was deployed.
 * @returns Verification result with status and details.
 */
export async function verifyERC721ContractLocal(
  contractAddress: string,
  name: string,
  symbol: string,
  baseURI_: string,
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

    console.log(`Verifying ERC721 contract at ${contractAddress} on ${network}...`);

    // First, verify the contract exists and has code
    const code = await publicClient.getCode({ address: contractAddress as `0x${string}` });
    if (!code || code === '0x') {
      throw new Error('No contract found at the specified address');
    }

    // Basic contract validation by checking if it responds to ERC721 standard calls
    try {
      const contract = getContract({
        address: contractAddress as `0x${string}`,
        abi: erc721Abi,
        client: publicClient
      });

      // Read contract data to verify it matches deployment parameters
      const [contractName, contractSymbol, contractBaseURI] = await Promise.all([
        contract.read.name(),
        contract.read.symbol(),
        (contract.read as any).baseURI ? (contract.read as any).baseURI() : Promise.resolve(''),
      ]);

      const parameterMatches = {
        name: contractName === name,
        symbol: contractSymbol === symbol,
        baseURI_: contractBaseURI === baseURI_
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
      console.log(`Base URI: ${contractBaseURI}`);
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
 * Verifies an ERC721 contract on a block explorer by submitting source code.
 * @param contractAddress The deployed contract address.
 * @param name The name of the token used during deployment.
 * @param symbol The symbol of the token used during deployment.
 * @param baseURI_ The base URI used during deployment.
 * @param network The network where the contract was deployed.
 * @returns Verification result with status and details.
 */
export async function verifyERC721Contract(
  contractAddress: string,
  name: string,
  symbol: string,
  baseURI_: string,
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

    console.log(`Verifying ERC721 contract at ${contractAddress} on the block explorer...`);

    const seiscanApiKey = getSeiTraceApiKey();
    if (!seiscanApiKey) {
      throw new Error('Block explorer API key not available. Set the SEITRACE_API_KEY environment variable.');
    }

    const publicClient = getPublicClient(network);

    const code = await publicClient.getBytecode({ address: contractAddress as `0x${string}` });
    if (!code || code === '0x') {
      throw new Error('No contract found at the specified address');
    }

    const constructorArgs = await encodeERC721ConstructorArguments(name, symbol, baseURI_);

    const verificationPayload = {
      module: 'contract',
      action: 'verifysourcecode',
      apikey: seiscanApiKey,
      contractaddress: contractAddress.toLowerCase(),
      sourceCode: ERC721_SOURCE_CODE,
      codeformat: 'solidity-single-file',
      contractname: 'BasicERC721',
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

    const response = await fetch(networkConfig.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'ERC721-Deployment-Tool/1.0'
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
        throw new Error(`Network error during verification: ${error.message}. Check if the block explorer API is accessible.`);
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
 * @param baseURI_ The base URI for token metadata.
 * @returns Encoded constructor arguments as hex string
 */
export function encodeERC721ConstructorArguments(
  name: string,
  symbol: string,
  baseURI_: string
): string {
  const encoded = encodeAbiParameters(
    [
      { type: 'string', name: 'name' },
      { type: 'string', name: 'symbol' },
      { type: 'string', name: 'baseURI_' }
    ],
    [name, symbol, baseURI_]
  );
  return encoded.slice(2); // remove `0x` prefix as required by verification APIs
}

/**
 * Mints the next available NFT to a specified address.
 * This function calls the `mint(address)` function on the contract.
 * @param nftContractAddress The address of the deployed ERC721 contract (NFT Contract Address).
 * @param toAddress The recipient address to receive the new NFT.
 * @param network The network where the contract is deployed.
 * @returns The transaction hash of the mint operation.
 */
export async function mintNFT(
  nftContractAddress: string,
  toAddress: string,
  network = DEFAULT_NETWORK
): Promise<{ txHash: `0x${string}` }> {
  try {
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) {
      throw new Error('Private key not available.');
    }

    const validatedNFTAddress = helpers.validateAddress(nftContractAddress);

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
    console.log(`Preparing to mint next available NFT to ${validatedToAddress}...`);

    const hash = await walletClient.writeContract({
      address: validatedNFTAddress as `0x${string}`,
      abi: erc721Abi,
      functionName: 'mint',
      args: [validatedToAddress as `0x${string}`],
      account,
      chain: walletClient.chain
    });

    console.log(`✅ NFT Mint transaction sent successfully! Hash: ${hash}`);
    return { txHash: hash };

  } catch (error) {
    console.error('Minting error details:', error);
    throw new Error(`Failed to mint NFT: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Mints a batch of new NFTs to a specified address.
 * @param nftContractAddress The address of the deployed ERC721 contract (NFT Contract Address).
 * @param toAddress The recipient address to receive the new NFTs.
 * @param quantity The number of NFTs to mint in the batch.
 * @param network The network where the contract is deployed.
 * @returns The transaction hash of the mint operation.
 */
export async function mintBatchNFTs(
  nftContractAddress: string,
  toAddress: string,
  quantity: number,
  network = DEFAULT_NETWORK
): Promise<{ txHash: `0x${string}` }> {
  try {
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) {
      throw new Error('Private key not available.');
    }

    if (quantity <= 0) {
      throw new Error("Quantity must be greater than zero.");
    }
    const validatedNFTAddress = helpers.validateAddress(nftContractAddress);

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

    console.log(`Preparing to mint a batch of ${quantity} NFTs to ${validatedToAddress}...`);

    const hash = await walletClient.writeContract({
      address: validatedNFTAddress as `0x${string}`,
      abi: erc721Abi,
      functionName: 'mintBatch',
      args: [validatedToAddress as `0x${string}`, BigInt(quantity)],
      account,
      chain: walletClient.chain
    });

    console.log(`✅ NFT Batch Mint transaction sent successfully! Hash: ${hash}`);
    return { txHash: hash };

  } catch (error) {
    console.error('Batch minting error details:', error);
    throw new Error(`Failed to mint batch of NFTs: ${error instanceof Error ? error.message : String(error)}`);
  }
}