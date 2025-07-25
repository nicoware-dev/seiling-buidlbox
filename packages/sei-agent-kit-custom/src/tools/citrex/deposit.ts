import CitrexSDK from 'citrex-sdk'
import { Config } from 'citrex-sdk/types'
import * as dotenv from 'dotenv'

dotenv.config()

export async function citrexDeposit(amount: string) {
    const MY_PRIVATE_KEY = process.env.SEI_PRIVATE_KEY

    try {
        const CONFIG = {
            debug: false,
            environment: 'mainnet',
            rpc: 'https://evm-rpc.sei-apis.com',
            subAccountId: 0,
        }
        const Client = new CitrexSDK(MY_PRIVATE_KEY as `0x${string}`, CONFIG as Config)
        const { error, success, transactionHash } = await Client.deposit(Number(amount))
        if (success) {
            return ("Deposit successful, transaction hash: " + transactionHash)
        } else {
            return ("Deposit failed")
        }
    } catch (error) {
        console.error('Error during deposit:', error)
        throw error
    }
}