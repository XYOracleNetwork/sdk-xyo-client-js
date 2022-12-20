import { getNode } from '@xyo-network/node-app'

import { getAccount } from './lib'

const main = async () => {
  const account = await getAccount()
  return getNode(account)
}

void main()
