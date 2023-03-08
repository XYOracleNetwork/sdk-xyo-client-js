import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { XyoPayload } from '@xyo-network/payload-model'

import { EventData, XyoEmittery } from '../model'
import { XyoQueryBoundWitness } from '../Query'
import { ModuleEventArgs } from './ModuleEventArgs'

export type ModuleQueriedEventArgs = ModuleEventArgs<{
  payloads?: XyoPayload[]
  query: XyoQueryBoundWitness
  result: [XyoBoundWitness, XyoPayload[]]
}>

export interface ModuleEventData extends EventData {
  moduleQueried: ModuleQueriedEventArgs
}

export type ModuleEmittery = XyoEmittery<ModuleEventData>
