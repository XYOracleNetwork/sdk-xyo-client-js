import { QueryBoundWitness } from '@xyo-network/boundwitness-builder'
import { ModuleQueryResult } from '@xyo-network/module-model'
import { ModuleError, Payload } from '@xyo-network/payload-model'

export interface WrapperError extends Error {
  errors: (ModuleError | null)[]
  query: [QueryBoundWitness, Payload[], ModuleError[]]
  result: ModuleQueryResult | undefined
}
