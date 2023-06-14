import { EthereumGasEthgasstationPayload, EthereumGasEthgasstationSchema } from '@xyo-network/ethgasstation-ethereum-gas-payload-plugin'
import { Payload } from '@xyo-network/payload-model'

export const isEthereumGasEthgasstationPayload = (payload?: Payload | null): payload is EthereumGasEthgasstationPayload => {
  return payload?.schema === EthereumGasEthgasstationSchema
}
