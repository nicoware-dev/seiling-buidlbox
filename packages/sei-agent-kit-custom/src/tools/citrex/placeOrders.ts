import CitrexSDK from 'citrex-sdk'
import { Config, OrderArgs, PlaceOrderReturnType } from 'citrex-sdk/types'
import * as dotenv from 'dotenv'

dotenv.config()

export async function citrexPlaceOrders(
    ordersArgs: OrderArgs[]
): Promise<PlaceOrderReturnType[] | undefined> {
    const MY_PRIVATE_KEY = process.env.SEI_PRIVATE_KEY

    try {
        const CONFIG = {
            debug: false,
            environment: 'mainnet',
            rpc: 'https://evm-rpc.sei-apis.com',
            subAccountId: 0,
        }
        const Client = new CitrexSDK(MY_PRIVATE_KEY as `0x${string}`, CONFIG as Config)
        const result = await Client.placeOrders(ordersArgs)
        return result
    } catch (error) {
        console.error(error)
        return
    }
} 