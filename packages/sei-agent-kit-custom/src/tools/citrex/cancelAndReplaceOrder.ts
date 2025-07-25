import CitrexSDK from 'citrex-sdk'
import { Config, PlaceOrderReturnType, ReplacementOrderArgs } from 'citrex-sdk/types'
import * as dotenv from 'dotenv'

dotenv.config()

export async function citrexCancelAndReplaceOrder(
    orderId: `0x${string}`,
    orderArgs: ReplacementOrderArgs
): Promise<PlaceOrderReturnType | undefined> {
    const MY_PRIVATE_KEY = process.env.SEI_PRIVATE_KEY

    try {
        const CONFIG = {
            debug: false,
            environment: 'mainnet',
            rpc: 'https://evm-rpc.sei-apis.com',
            subAccountId: 0,
        }
        const Client = new CitrexSDK(MY_PRIVATE_KEY as `0x${string}`, CONFIG as Config)
        const result = await Client.cancelAndReplaceOrder(orderId, orderArgs)
        return result
    } catch (error) {
        console.error(error)
        return
    }
} 