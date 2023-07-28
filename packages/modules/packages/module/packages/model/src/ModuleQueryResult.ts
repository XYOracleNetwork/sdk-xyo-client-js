import { BoundWitness } from '@xyo-network/boundwitness-model'
import { ModuleError, Payload } from '@xyo-network/payload-model'

export type ModuleQueryResult = [BoundWitness, Payload[], ModuleError[]]
