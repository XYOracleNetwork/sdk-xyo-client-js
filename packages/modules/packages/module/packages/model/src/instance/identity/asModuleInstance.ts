import { AsObjectFactory } from '../../identity'
import { isModuleInstance } from './isModuleInstance'

export const asModuleInstance = AsObjectFactory.create(isModuleInstance)
