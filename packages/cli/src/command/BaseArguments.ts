import { ArgumentsCamelCase } from 'yargs'

export type BaseArguments = ArgumentsCamelCase<{
  h: boolean
  help: boolean
  v: boolean
  verbose: boolean
  version: boolean
}>
