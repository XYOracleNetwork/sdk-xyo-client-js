import { ArgumentsCamelCase } from 'yargs'

import { BaseArguments } from '../BaseArguments'

export type ModuleArguments = BaseArguments &
  ArgumentsCamelCase<{
    address: string
  }>
