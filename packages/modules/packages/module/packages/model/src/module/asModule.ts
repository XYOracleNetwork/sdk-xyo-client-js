import { AsObjectFactory } from '@xylabs/sdk-js'

import { isModule } from './isModule.ts'

export const asModule = AsObjectFactory.create(isModule)
