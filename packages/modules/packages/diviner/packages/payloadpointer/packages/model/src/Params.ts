import type { DivinerParams } from '@xyo-network/diviner-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { PayloadPointerDivinerConfig } from './Config.ts'

/**
 * The params type of the Payload Pointer diviner
 **/
export type PayloadPointerDivinerParams = DivinerParams<AnyConfigSchema<PayloadPointerDivinerConfig>>
