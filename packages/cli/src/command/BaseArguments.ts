import { ArgumentsCamelCase } from 'yargs'

export type OutputType = 'json' | 'raw'

export type BaseArguments = ArgumentsCamelCase<{
  help: boolean
  output: OutputType
  verbose: boolean
  version: boolean
}>
