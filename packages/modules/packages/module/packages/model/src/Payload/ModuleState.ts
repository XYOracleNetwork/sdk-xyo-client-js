import { AsObjectFactory } from '@xylabs/object'
import {
  isPayloadOfSchemaType, isPayloadOfSchemaTypeWithSources, Payload, WithSources,
} from '@xyo-network/payload-model'

export interface StateDictionary {
  [key: string]: string | number
}
export interface State<T extends StateDictionary = StateDictionary> {
  state: T
}

export const ModuleStateSchema = 'network.xyo.module.state' as const
export type ModuleStateSchema = typeof ModuleStateSchema

export type ModuleState<T extends StateDictionary = StateDictionary> = Payload<State<T>, ModuleStateSchema>

export const isModuleState = <T extends StateDictionary = StateDictionary>(payload?: unknown): payload is ModuleState<T> => {
  return isPayloadOfSchemaType<ModuleState<T>>(ModuleStateSchema)(payload)
}

export const isModuleStateWithSources = <T extends StateDictionary = StateDictionary>(payload?: unknown): payload is WithSources<ModuleState<T>> => {
  return isPayloadOfSchemaTypeWithSources<ModuleState<T>>(ModuleStateSchema)(payload)
}

export const asModuleState = AsObjectFactory.create<ModuleState<StateDictionary>>(isModuleState)
