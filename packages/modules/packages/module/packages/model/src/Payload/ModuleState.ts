import { AsObjectFactory } from '@xylabs/sdk-js'
import type { Payload, WithSources } from '@xyo-network/payload-model'
import {
  asSchema, isPayloadOfSchemaType, isPayloadOfSchemaTypeWithSources,
} from '@xyo-network/payload-model'

export interface StateDictionary {
  [key: string]: string | number
}
export interface State<T extends StateDictionary = StateDictionary> {
  state: T
}

export const ModuleStateSchema = asSchema('network.xyo.module.state', true)
export type ModuleStateSchema = typeof ModuleStateSchema

export type ModuleState<T extends StateDictionary = StateDictionary> = Payload<State<T>, ModuleStateSchema>

export const isModuleState = <T extends StateDictionary = StateDictionary, TInput = unknown>(payload?: TInput): payload is ModuleState<T> & TInput => {
  return isPayloadOfSchemaType<ModuleState<T>>(ModuleStateSchema)(payload)
}

export const isModuleStateWithSources = <T extends StateDictionary = StateDictionary,
  TInput = unknown>(payload?: TInput): payload is WithSources<ModuleState<T>> & TInput => {
  return isPayloadOfSchemaTypeWithSources<ModuleState<T>>(ModuleStateSchema)(payload)
}

export const asModuleState = AsObjectFactory.create<ModuleState<StateDictionary>>(isModuleState)
export const asOptionalModuleState = AsObjectFactory.createOptional<ModuleState<StateDictionary>>(isModuleState)
