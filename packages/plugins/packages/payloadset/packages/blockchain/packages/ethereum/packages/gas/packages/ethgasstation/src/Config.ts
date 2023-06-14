import { EthereumGasEthgasstationWitnessConfigSchema } from '@xyo-network/ethgasstation-ethereum-gas-payload-plugin'
import { WitnessConfig } from '@xyo-network/witness'

export type EthereumGasEthgasstationWitnessConfig = WitnessConfig<{
  schema: EthereumGasEthgasstationWitnessConfigSchema
}>
