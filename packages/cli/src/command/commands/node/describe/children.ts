import { EmptyObject } from '@xyo-network/core'
import { NodeInstance } from '@xyo-network/node-model'
import { CommandBuilder, CommandModule } from 'yargs'

import { printError, printLine } from '../../../../lib'
import { BaseArguments } from '../../../BaseArguments'
import { getNode } from '../../../util'

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = {}
export const command = 'children'
export const deprecated = false
export const describe = 'Describe the children of the XYO Node'
export const handler = async (argv: BaseArguments) => {
  const { verbose } = argv
  try {
    const node: NodeInstance = await getNode(argv)
    const description = await node.describe()
    const childAddresses = description?.children || []
    const children = await Promise.all(childAddresses?.map((child) => node.resolve({ address: [child] }, { direction: 'down' })))
    const childDescriptions = await Promise.all(children.flat().map(async (mod) => await mod.describe()))
    printLine(JSON.stringify(childDescriptions))
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Error Querying Node')
  }
}

const mod: CommandModule<EmptyObject, BaseArguments> = {
  aliases,
  command,
  deprecated,
  describe,
  handler,
}

// eslint-disable-next-line import/no-default-export
export default mod
