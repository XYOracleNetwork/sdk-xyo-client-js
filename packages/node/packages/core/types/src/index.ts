import { ARCHIVIST_TYPES } from './archivist'
import { DIVINER_TYPES } from './diviner'
import { MODULE_TYPES } from './module'
import { ModuleList } from './ModuleList'

export { ModuleList } from './ModuleList'

export const TYPES: ModuleList = {
  ...ARCHIVIST_TYPES,
  ...DIVINER_TYPES,
  ...MODULE_TYPES,
  ApiKey: Symbol('ApiKey'),
  JobProvider: Symbol('JobProvider'),
  JobQueue: Symbol('JobQueue'),
  JwtSecret: Symbol('JwtSecret'),
  Logger: Symbol('Logger'),
  PasswordHasher: Symbol('PasswordHasher'),
  PayloadToQueryConverterRegistry: Symbol('PayloadToQueryConverterRegistry'),
  QueryQueue: Symbol('QueryQueue'),
  ResponseQueue: Symbol('ResponseQueue'),
  SchemaToQueryProcessorRegistry: Symbol('SchemaToQueryProcessorRegistry'),
  UserManager: Symbol('UserManager'),
}
