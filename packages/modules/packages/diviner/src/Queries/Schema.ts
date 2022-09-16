import { XyoModuleQuerySchema } from '@xyo-network/module'

import { XyoDivinerDivineQuerySchema } from './Divine'

type XyoDivinerQuerySchemaBase = XyoDivinerDivineQuerySchema | XyoModuleQuerySchema

export type XyoDivinerQuerySchema<T extends string | void = void> = T extends string ? XyoDivinerQuerySchemaBase | T : XyoDivinerQuerySchemaBase
