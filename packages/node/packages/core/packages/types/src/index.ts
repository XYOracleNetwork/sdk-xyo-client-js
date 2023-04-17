import { ARCHIVIST_TYPES } from './archivist'
import { DIVINER_TYPES } from './diviner'
import { JOB_TYPES } from './job'
import { MODULE_TYPES } from './module'
import { WITNESS_TYPES } from './witness'

export const TYPES = {
  ...ARCHIVIST_TYPES,
  ...DIVINER_TYPES,
  ...JOB_TYPES,
  ...MODULE_TYPES,
  ...WITNESS_TYPES,
  AccountMnemonic: Symbol('AccountMnemonic'),
  ApiKey: Symbol('ApiKey'),
  ConfigModuleFactoryDictionary: Symbol('ConfigModuleFactoryDictionary'),
  JwtSecret: Symbol('JwtSecret'),
  Logger: Symbol('Logger'),
  PasswordHasher: Symbol('PasswordHasher'),
  SchemaToQueryProcessorRegistry: Symbol('SchemaToQueryProcessorRegistry'),
}

export * from './Wallet'
