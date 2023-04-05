import { BoundWitness } from '@xyo-network/boundwitness-model'
import { Payload } from '@xyo-network/payload-model'

export type ModuleQueryResult<T extends Payload = Payload> = [BoundWitness, T[]]
