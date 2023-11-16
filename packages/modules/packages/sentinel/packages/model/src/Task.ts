import { NameOrAddress } from '@xyo-network/module-model'

export interface ModuleTask<TEndpoints extends string = string> {
  /** @field the name of the endPoint that is being called.  If not specified, the default endPoint is used */
  endPoint?: TEndpoints
  /** @field determines what inputs are sent to each module - if string, that is the output from other module (name/address) */
  input?: boolean | string | string[]
  /** @field the modules that performs the task */
  module: NameOrAddress
  required?: boolean
}

export type ArchivistTask = ModuleTask<'all' | 'clear' | 'commit' | 'delete' | 'get' | 'insert'>
export type DivinerTask = ModuleTask<'divine'>
export type WitnessTask = ModuleTask<'observe'>

export type Task = WitnessTask | DivinerTask | ArchivistTask | ModuleTask
