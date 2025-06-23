import type { TypeCheck } from '@xylabs/object'
import { IsObjectFactory } from '@xylabs/object'
import type { AttachableModuleInstance } from '@xyo-network/module-model'

import type { BridgeModuleEventData } from '../EventData.ts'
import type { BridgeInstance } from '../Instance.ts'
import type { BridgeModule } from '../Module.ts'
import type { BridgeParams } from '../Params.ts'

export type AttachableBridgeInstance<
  TParams extends BridgeParams = BridgeParams,
  TEventData extends BridgeModuleEventData = BridgeModuleEventData,
> = BridgeModule<TParams, TEventData> &
  AttachableModuleInstance<TParams, TEventData> &
  BridgeInstance<TParams, TEventData>

export type AttachableBridgeInstanceTypeCheck<T extends AttachableBridgeInstance = AttachableBridgeInstance> = TypeCheck<T>

export class IsAttachableBridgeInstanceFactory<T extends AttachableBridgeInstance = AttachableBridgeInstance> extends IsObjectFactory<T> {}
