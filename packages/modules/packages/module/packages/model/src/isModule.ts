import { Module } from './Module'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModuleTypeCheck<T extends Module = Module> = (module: any) => module is T

export const IsModuleFactory = <T extends Module = Module>(
  baseCheck?: ModuleTypeCheck,
  expectedFunctions?: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalCheck?: (module: any) => boolean,
): ModuleTypeCheck<T> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (module: any): module is T => {
    return (
      (baseCheck?.(module) || true) &&
      (additionalCheck?.(module) ?? true) &&
      (expectedFunctions?.reduce((prev, value) => prev && typeof module[value] === 'function', true) ?? true)
    )
  }
}

export const isModule: ModuleTypeCheck<Module> = IsModuleFactory<Module>(undefined, ['query'], (module) => typeof module.config === 'object')
