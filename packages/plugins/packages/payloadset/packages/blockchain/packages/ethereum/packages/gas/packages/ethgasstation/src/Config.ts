import { XyoEthereumGasEthgasstationWitnessConfigSchema } from '@xyo-network/ethgasstation-ethereum-gas-payload-plugin'
import { WitnessConfig } from '@xyo-network/witness'

export type XyoEthereumGasEthgasstationWitnessConfig = WitnessConfig<{
  schema: XyoEthereumGasEthgasstationWitnessConfigSchema
}>
