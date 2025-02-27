import { IsObjectFactory, TypeCheck } from '@xylabs/object'
import { AttachableModuleInstance } from '@xyo-network/module-model'

import { BridgeModuleEventData } from '../EventData.ts'
import { BridgeInstance } from '../Instance.ts'
import { BridgeModule } from '../Module.ts'
import { BridgeParams } from '../Params.ts'

export interface AttachableBridgeInstance<
  TParams extends BridgeParams = BridgeParams,
  TEventData extends BridgeModuleEventData = BridgeModuleEventData,
> extends BridgeModule<TParams, TEventData>,
  AttachableModuleInstance<TParams, TEventData>,
  BridgeInstance<TParams, TEventData> {}

export type AttachableBridgeInstanceTypeCheck<T extends AttachableBridgeInstance = AttachableBridgeInstance> = TypeCheck<T>

export class IsAttachableBridgeInstanceFactory<T extends AttachableBridgeInstance = AttachableBridgeInstance> extends IsObjectFactory<T> {}
