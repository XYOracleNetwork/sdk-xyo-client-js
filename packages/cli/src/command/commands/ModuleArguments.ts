import { ArgumentsCamelCase } from 'yargs'

import { BaseArguments } from '../BaseArguments'

export type ModuleArguments = BaseArguments &
  ArgumentsCamelCase<{
    address?: string
    name?: string
  }>

export const isModuleArguments = (args: BaseArguments): args is ModuleArguments => {
  return !!(args?.address || args?.name)
}
