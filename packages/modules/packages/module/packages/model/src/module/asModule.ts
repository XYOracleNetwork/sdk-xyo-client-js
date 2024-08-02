import { AsObjectFactory } from '@xylabs/object'

import { isModule } from './isModule.ts'

export const asModule = AsObjectFactory.create(isModule)
