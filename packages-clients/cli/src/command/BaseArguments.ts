import { ArgumentsCamelCase } from 'yargs'

export type OutputType = 'json' | 'raw'

export type BaseArguments = ArgumentsCamelCase<{
  config?: string
  help: boolean
  network: string
  output: OutputType
  verbose: boolean
  version: boolean
}>
