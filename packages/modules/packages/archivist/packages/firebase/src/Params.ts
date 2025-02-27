import { FirebaseApp } from '@firebase/app'
import { ArchivistParams } from '@xyo-network/archivist-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { FirebaseArchivistConfig } from './Config.ts'

export type FirebaseArchivistParams = ArchivistParams<AnyConfigSchema<FirebaseArchivistConfig>, {
  firebaseApp?: FirebaseApp
}>
