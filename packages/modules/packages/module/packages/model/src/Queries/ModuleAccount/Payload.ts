import { Payload } from '@xyo-network/payload-model'

export const ModuleAccountSchema = 'network.xyo.module.account'
export type ModuleAccountSchema = typeof ModuleAccountSchema

export type ModuleAccountPayload = Payload<{
  address: string
  name?: string
  schema: ModuleAccountSchema
}>

export const ModuleAccountPreviousHashSchema = `${ModuleAccountSchema}.hash.previous`
export type ModuleAccountPreviousHashSchema = typeof ModuleAccountPreviousHashSchema

export type ModuleAccountPreviousHashPayload = Payload<{
  address: string
  previousHash?: string
  schema: ModuleAccountPreviousHashSchema
}>
