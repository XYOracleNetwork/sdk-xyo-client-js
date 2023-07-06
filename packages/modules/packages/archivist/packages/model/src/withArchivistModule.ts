import { WithModuleFactory } from '@xyo-network/module-model'

import { isArchivistModule } from './isArchivistModule'

export const withArchivistModule = WithModuleFactory.create(isArchivistModule)
