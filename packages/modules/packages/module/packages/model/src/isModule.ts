/* eslint-disable @typescript-eslint/no-explicit-any */
import { Module, ModuleInstance } from './Module'

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
    return (module: any = {}, log = false): module is T => {
      return (
        (additionalCheck?.(module) ?? true) &&
        Object.entries(shape ?? {}).reduce((prev, [key, type]) => {
          const result = isType(module[key], type)
          if (!result && log) {
            console.warn(`isType Failed: ${key}: ${type}`)
          }
          return prev && result
        }, true)
      )
    }
  },
}

export const IsModuleFactory = {
  create: <T extends Module = Module>(expectedQueries?: string[], additionalCheck?: (module: any) => boolean): ModuleTypeCheck<T> => {
    return (module: any = {}): module is T => {
      return (
        isModule(module) &&
        (additionalCheck?.(module) ?? true) &&
        (expectedQueries?.reduce((prev, query) => prev && module.queries.includes(query), true) ?? true)
      )
    }
  },
}

export const isModule: InstanceTypeCheck<ModuleInstance> = IsInstanceFactory.create<ModuleInstance>({
  address: 'string',
  config: 'object',
  downResolver: 'object',
  params: 'object',
  queries: 'array',
  query: 'function',
  queryable: 'function',
})

export const isModuleInstance: InstanceTypeCheck<ModuleInstance> = IsInstanceFactory.create<ModuleInstance>(
  {
    describe: 'function',
    discover: 'function',
    manifest: 'function',
  },
  isModule,
)
