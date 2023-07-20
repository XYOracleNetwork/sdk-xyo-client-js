import { AsObjectFactory } from '../../identity'
import { isModuleObject } from './isModuleObject'

export const asModuleObject = AsObjectFactory.create(isModuleObject)
