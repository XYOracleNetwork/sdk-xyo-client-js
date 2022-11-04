import { Archivist } from '@xyo-network/archivist'

import { User, UserWithoutId } from '../Domain'
import { UpsertResult } from '../UpsertResult'

export type UserArchivist = Archivist<User, User & UpsertResult, UserWithoutId, User, Partial<User>>
