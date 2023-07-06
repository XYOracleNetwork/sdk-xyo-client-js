import { ModuleError, ModuleQueryResult, QueryBoundWitness } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export interface WrapperError extends Error {
  errors: (ModuleError | null)[]
  query: [QueryBoundWitness, Payload[], ModuleError[]]
  result: ModuleQueryResult | undefined
}
