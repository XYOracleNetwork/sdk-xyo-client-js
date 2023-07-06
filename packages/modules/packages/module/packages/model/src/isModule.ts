/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModuleInstance } from './Module'
import { ModuleAddressQuerySchema, ModuleDiscoverQuerySchema } from './Queries'

export type InstanceTypeCheck<T extends object = object> = (module: object) => module is T

export type ModuleTypeCheck<T extends ModuleInstance = ModuleInstance> = InstanceTypeCheck<T>

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
    return (module: any): module is T => {
      return (
        (additionalCheck?.(module) ?? true) &&
        (Object.entries(shape ?? {}).reduce((prev, [key, type]) => prev && isType(module[key], type), true) ?? true)
      )
    }
  },
}

export const IsModuleFactory = {
  create: <T extends ModuleInstance = ModuleInstance>(expectedQueries?: string[], additionalCheck?: (module: any) => boolean): ModuleTypeCheck<T> => {
    return (module: any): module is T => {
      return (
        isModuleInstance(module) &&
        (additionalCheck?.(module) ?? true) &&
        (expectedQueries?.reduce((prev, query) => prev && module.queries.includes(query), true) ?? true)
      )
    }
  },
}

export const isModuleInstance: InstanceTypeCheck<ModuleInstance> = IsInstanceFactory.create<ModuleInstance>({
  account: 'object',
  address: 'string',
  config: 'object',
  discover: 'function',
  downResolver: 'object',
  manifest: 'function',
  params: 'object',
  queries: 'array',
  query: 'function',
  queryable: 'function',
  upResolver: 'object',
})

export const isModule: ModuleTypeCheck<ModuleInstance> = IsModuleFactory.create<ModuleInstance>([ModuleAddressQuerySchema, ModuleDiscoverQuerySchema])
