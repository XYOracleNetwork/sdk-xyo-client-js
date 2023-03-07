import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { XyoPayload } from '@xyo-network/payload-model'
import Emittery from 'emittery'

import { XyoQueryBoundWitness } from '../Query'
import { ModuleEventArgs } from './ModuleEventEmitter'

export type ModuleQueriedEventArgs = ModuleEventArgs<{
  payloads?: XyoPayload[]
  query: XyoQueryBoundWitness
  result: [XyoBoundWitness, XyoPayload[]]
}>

export type ModuleEmittery = Emittery<{ moduleQueried: ModuleQueriedEventArgs }>
