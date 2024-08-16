import { assertEx } from '@xylabs/assert'
import type { ArchivistInstance } from '@xyo-network/archivist-model'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import type { NodeInstance } from '@xyo-network/node-model'

// eslint-disable-next-line import-x/no-internal-modules
import { ArchivistName } from '../Node/getTestNode.ts'

export const getArchivist = async (node: NodeInstance, name = ArchivistName): Promise<ArchivistInstance> => {
  return assertEx(asArchivistInstance(await node.resolve(name)), () => `Could not find archivist with name ${name}`)
}
