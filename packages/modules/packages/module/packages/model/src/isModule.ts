/* eslint-disable @typescript-eslint/no-explicit-any */
import { DirectModule, IndirectModule, Module, ModuleInstance } from './Module'

export type InstanceTypeCheck<T extends object = object> = (module: object) => module is T

export type ModuleTypeCheck<T extends Module = Module> = InstanceTypeCheck<T>

export type FieldType = 'string' | 'number' | 'object' | 'symbol' | 'symbol' | 'undefined' | 'null' | 'array' | 'function' | 'payload'

export type InstanceTypeShape = Record<string | number | symbol, FieldType>

export const isType = (value: any, expectedType: FieldType) => {
  if (expectedType === 'array') {
    return Array.isArray(value)
  } else if (expectedType === 'payload') {
    return typeof value === 'object' && typeof value.schema === 'string'
  } else {
    return typeof value === expectedType
  }
}

export const IsInstanceFactory = {
  create: <T extends object = object>(shape?: InstanceTypeShape, additionalCheck?: (module: any) => boolean): InstanceTypeCheck<T> => {
    return (module: any = {}): module is T => {
      return (
        (additionalCheck?.(module) ?? true) &&
        (Object.entries(shape ?? {}).reduce((prev, [key, type]) => prev && isType(module[key], type), true) ?? true)
      )
    }
  },
}

export const IsIndirectModuleFactory = {
  create: <T extends IndirectModule = IndirectModule>(expectedQueries?: string[], additionalCheck?: (module: any) => boolean): ModuleTypeCheck<T> => {
    return (module: any = {}): module is T => {
      return (
        isModuleInstance(module) &&
        (additionalCheck?.(module) ?? true) &&
        (expectedQueries?.reduce((prev, query) => prev && module.queries.includes(query), true) ?? true)
      )
    }
  },
}

export const IsModuleFactory = IsIndirectModuleFactory

export const isIndirectModuleInstance: InstanceTypeCheck<ModuleInstance> = IsInstanceFactory.create<ModuleInstance>({
  account: 'object',
  address: 'string',
  config: 'object',
  downResolver: 'object',
  params: 'object',
  queries: 'array',
  query: 'function',
  queryable: 'function',
  upResolver: 'object',
})

export const isDirectModuleInstance: InstanceTypeCheck<ModuleInstance> = IsInstanceFactory.create<ModuleInstance>({
  description: 'function',
  discover: 'function',
  manifest: 'function',
  subscribe: 'function',
})

export const isModuleInstance = isIndirectModuleInstance

export const isDirectModule = <T extends DirectModule = DirectModule>(
  module: any = {},
  expectedQueries?: string[],
  additionalCheck?: (module: any) => boolean,
): module is T => {
  return (
    isDirectModuleInstance(module) &&
    (additionalCheck?.(module) ?? true) &&
    (expectedQueries?.reduce((prev, query) => prev && module.queries.includes(query), true) ?? true)
  )
}

export const isIndirectModule = <T extends IndirectModule = IndirectModule>(
  module: any = {},
  expectedQueries?: string[],
  additionalCheck?: (module: any) => boolean,
): module is T => {
  return (
    isIndirectModuleInstance(module) &&
    (additionalCheck?.(module) ?? true) &&
    (expectedQueries?.reduce((prev, query) => prev && module.queries.includes(query), true) ?? true)
  )
}

export const isModule = isIndirectModule
