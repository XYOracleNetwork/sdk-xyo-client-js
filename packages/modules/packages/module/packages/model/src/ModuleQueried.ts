import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { XyoPayload } from '@xyo-network/payload-model'

import { EventData } from './Events'
import { ModuleEventArgs } from './ModuleEventArgs'
import { XyoQueryBoundWitness } from './Query'

export type ModuleQueriedEventArgs = ModuleEventArgs<{
  payloads?: XyoPayload[]
  query: XyoQueryBoundWitness
  result: [XyoBoundWitness, XyoPayload[]]
}>

export interface ModuleEventData extends EventData {
  moduleQueried: ModuleQueriedEventArgs
}
