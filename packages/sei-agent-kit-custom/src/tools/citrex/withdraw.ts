import CitrexSDK from 'citrex-sdk'
import { Config } from 'citrex-sdk/types'
import * as dotenv from 'dotenv'

dotenv.config()

export async function citrexWithdraw(amount: string) {
    const MY_PRIVATE_KEY = process.env.SEI_PRIVATE_KEY

    try {
        const CONFIG = {
            debug: false,
            environment: 'mainnet',
            rpc: 'https://evm-rpc.sei-apis.com',
            subAccountId: 0,
        }
        const Client = new CitrexSDK(MY_PRIVATE_KEY as `0x${string}`, CONFIG as Config)
        const { error, success } = await Client.withdraw(Number(amount))
        if (success) {
            return ("Withdrawal successful")
        } else {
            return ("Withdrawal failed")
        }
    } catch (error) {
        console.error('Error during withdraw:', error)
        throw error
    }
}