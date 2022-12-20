import { getNode } from '@xyo-network/node-app'

import { getAccount } from './lib'

void getAccount().then(getNode)
