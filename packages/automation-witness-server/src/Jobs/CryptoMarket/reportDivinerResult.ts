import { MemoryNode } from '@xyo-network/modules'
import { Payload } from '@xyo-network/payload-model'
import { MemorySentinel, SentinelConfig, SentinelConfigSchema } from '@xyo-network/sentinel'
import { AdhocWitness, AdhocWitnessConfig, AdhocWitnessConfigSchema } from '@xyo-network/witnesses'

import { getAccount, WalletPaths } from '../../Account'
import { getArchivists } from '../../Archivists'

export const reportDivinerResult = async (payload: Payload): Promise<void> => {
  const account = getAccount(WalletPaths.CryptoMarketDivinerResultPanel)
  const node = await MemoryNode.create()
  const archivists = await getArchivists()
  const witnessConfig: AdhocWitnessConfig = { payload, schema: AdhocWitnessConfigSchema }
  const witness = await AdhocWitness.create({ account, config: witnessConfig })
  const modules = [witness, ...archivists]
  await Promise.all(
    modules.map(async (mod) => {
      await node.register(mod).attach(mod.address)
    }),
  )
  const sentinelConfig: SentinelConfig = {
    archivists: [...archivists.map((mod) => mod.address)],
    schema: SentinelConfigSchema,
    witnesses: [witness.address],
  }
  const sentinel = await MemorySentinel.create({ account, config: sentinelConfig })
  await sentinel.report()
}
