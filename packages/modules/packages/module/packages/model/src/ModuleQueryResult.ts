import { BoundWitness } from '@xyo-network/boundwitness-model'
import { Payload } from '@xyo-network/payload-model'

export type ModuleQueryResult<E extends Payload[] = Payload[]> = [BoundWitness, Payload[], E]
