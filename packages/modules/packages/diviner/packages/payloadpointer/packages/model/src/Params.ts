import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { PayloadPointerDivinerConfig } from './Config.ts'

/**
 * The params type of the Payload Pointer diviner
 **/
export type PayloadPointerDivinerParams = DivinerParams<AnyConfigSchema<PayloadPointerDivinerConfig>>
