import { AsObjectFactory } from './AsObjectFactory'
import { isObject } from './isObject'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const asObject = (() => AsObjectFactory.create(<T>(obj: T): obj is T => isObject(obj)))()
