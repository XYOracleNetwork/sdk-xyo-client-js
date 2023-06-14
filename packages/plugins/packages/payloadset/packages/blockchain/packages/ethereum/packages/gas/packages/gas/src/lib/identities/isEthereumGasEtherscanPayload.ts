import { EthereumGasEtherscanPayload, EthereumGasEtherscanSchema } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'
import { Payload } from '@xyo-network/payload-model'

export const isEthereumGasEtherscanPayload = (payload?: Payload | null): payload is EthereumGasEtherscanPayload => {
  return payload?.schema === EthereumGasEtherscanSchema
}
