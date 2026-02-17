import { AsObjectFactory } from '@xylabs/sdk-js'

import { isQueryableModuleObject } from './isQueryableModuleObject.ts'

export const asQueryableModuleObject = AsObjectFactory.create(isQueryableModuleObject)

/** @deprecated use asQueryableModuleObject instead */
export const asModuleObject = asQueryableModuleObject
