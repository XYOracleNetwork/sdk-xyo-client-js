import { WithFactory } from '@xyo-network/module-model'

import { isArchivistInstance } from './isArchivistInstance'
import { isArchivistModule } from './isArchivistModule'

export const withArchivistModule = WithFactory.create(isArchivistModule)
export const withArchivistInstance = WithFactory.create(isArchivistInstance)
