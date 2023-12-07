import { AnyObject } from './AnyObject'
import { AsObjectFactory } from './AsObjectFactory'
import { isObject } from './isObject'

export const asAnyObject = (() => AsObjectFactory.create<AnyObject>(<T extends AnyObject>(obj: unknown): obj is T => isObject(obj)))()
