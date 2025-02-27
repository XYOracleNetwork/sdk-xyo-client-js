import { DivinerConfig } from '@xyo-network/diviner-model'
import { ModuleIdentifier } from '@xyo-network/module-model'

import { PayloadPointerDivinerSchema } from './Schema.ts'

/**
 * The config schema for the Payload Pointer Diviner
 */
export const PayloadPointerDivinerConfigSchema = `${PayloadPointerDivinerSchema}.config`

/**
 * The config schema type for the Payload Pointer Diviner
 */
export type PayloadPointerDivinerConfigSchema = typeof PayloadPointerDivinerConfigSchema

/**
 * The configuration for the Payload Pointer Diviner
 */
export type PayloadPointerDivinerConfig = DivinerConfig<
  {
    /**
     * The module identifier of the bound witness diviner
     */
    boundWitnessDiviner: ModuleIdentifier
    /**
     * The module identifier of the payload diviner
     */
    payloadDiviner: ModuleIdentifier
  } & { schema: PayloadPointerDivinerConfigSchema }
>
