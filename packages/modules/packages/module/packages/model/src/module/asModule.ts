import { AsObjectFactory } from '@xylabs/object'

import { isModule } from './isModule.js'

export const asModule = AsObjectFactory.create(isModule)
