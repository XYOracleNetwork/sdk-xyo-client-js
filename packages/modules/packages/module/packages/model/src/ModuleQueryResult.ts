import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { Payload } from '@xyo-network/payload-model'

export type ModuleQueryResult<T extends Payload = Payload> = [XyoBoundWitness, T[]]
