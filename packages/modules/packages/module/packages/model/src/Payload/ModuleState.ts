import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

export interface StateDictionary {
  [key: string]: string | number | undefined
}
export interface State<T extends StateDictionary = StateDictionary> {
  state: T
}

export const ModuleStateSchema = 'network.xyo.module.state' as const
export type ModuleStateSchema = typeof ModuleStateSchema

export type ModuleState<T extends StateDictionary = StateDictionary> = Payload<State<T>, ModuleStateSchema>

export const isModuleState = <T extends StateDictionary = StateDictionary>(payload?: Payload | null): payload is ModuleState<T> => {
  return isPayloadOfSchemaType<ModuleState<T>>(ModuleStateSchema)(payload)
}
