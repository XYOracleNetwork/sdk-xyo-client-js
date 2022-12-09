import { XyoEthereumGasEthgasstationWitnessConfigSchema } from '@xyo-network/ethgasstation-ethereum-gas-payload-plugin'
import { XyoWitnessConfig } from '@xyo-network/witness'

export type XyoEthereumGasEthgasstationWitnessConfig = XyoWitnessConfig<{
  schema: XyoEthereumGasEthgasstationWitnessConfigSchema
}>
