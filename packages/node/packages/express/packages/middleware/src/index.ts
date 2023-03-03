import { UserCreationAuthInfo } from '@xyo-network/express-node-lib'
import { AbstractArchivist, AbstractNode } from '@xyo-network/modules'
import {
  ArchiveBoundWitnessArchivistFactory,
  ArchivePayloadArchivistFactory,
  IdentifiableHuri,
  Queue,
  UserManager,
  UserWithoutId,
  WitnessedPayloadArchivist,
} from '@xyo-network/node-core-model'
import { Logger } from '@xyo-network/shared'
// NOTE: Required import since passport types (which we need to extend) extend Express
// eslint-disable-next-line @typescript-eslint/no-unused-vars

// https://github.com/DefinitelyTyped/DefinitelyTyped/commit/91c229dbdb653dbf0da91992f525905893cbeb91#r34812715
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // Since Passport augments each successfully auth'd request
    // with our User, we need to redefine the default Express
    // User (just an empty Object) to be our User so we don't
    // have to cast every request
    interface User extends UserWithoutId {
      id?: string
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface AuthInfo extends UserCreationAuthInfo {}

    interface Application {
      archiveBoundWitnessArchivistFactory: ArchiveBoundWitnessArchivistFactory
      archivePayloadsArchivistFactory: ArchivePayloadArchivistFactory
      archivist: AbstractArchivist
      archivistWitnessedPayloadArchivist: WitnessedPayloadArchivist
      logger: Logger
      node: AbstractNode
      responseQueue: Queue<IdentifiableHuri>
      userManager: UserManager
    }
  }
}

export * from './archiveLocals'
export * from './auth'
export * from './doc'
export * from './LoggingErrorHandler'
export * from './nodeEnv'
export * from './standardResponses'
