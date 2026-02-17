import { AsObjectFactory } from '@xylabs/sdk-js'

import { isQueryableModule } from './isQueryableModule.ts'

export const asQueryableModule = AsObjectFactory.create(isQueryableModule)

/** @deprecated use asQueryableModule instead */
export const asModule = asQueryableModule
