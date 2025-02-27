import type { FirebaseApp } from '@firebase/app'
import type { ArchivistParams } from '@xyo-network/archivist-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { FirebaseArchivistConfig } from './Config.ts'

export type FirebaseArchivistParams = ArchivistParams<AnyConfigSchema<FirebaseArchivistConfig>, {
  firebaseApp?: FirebaseApp
}>
