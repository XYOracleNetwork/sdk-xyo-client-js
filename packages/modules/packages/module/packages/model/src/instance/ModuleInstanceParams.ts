import type { AnyConfigSchema, ModuleConfig } from '../Config/index.ts'
import type { QueryableModuleParams } from '../QueryableModule/index.ts'
import type { ModuleInstance } from './Instance.ts'

export type ModuleInstanceChildrenParams = {
  privateChildren?: ModuleInstance[]
  publicChildren?: ModuleInstance[]
}

export interface ModuleInstanceParams<TConfig extends AnyConfigSchema<ModuleConfig> = AnyConfigSchema<ModuleConfig>> extends
  QueryableModuleParams<TConfig>, ModuleInstanceChildrenParams {}
