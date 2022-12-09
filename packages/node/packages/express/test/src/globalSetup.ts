import { config } from 'dotenv'
config()
import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { XyoArchive } from '@xyo-network/api'

import { claimArchive, getArchive, setArchiveAccessControl, signInUser } from './testUtil'

/**
 * Jest global setup method run before
 * any tests are run
 * https://jestjs.io/docs/configuration#globalsetup-string
 */
module.exports = async () => {
  const testArchives = [
    { accessControl: false, name: 'temp' },
    { accessControl: true, name: 'temp-private' },
  ]
  for (const testArchive of testArchives) {
    let archive: XyoArchive
    const { name, accessControl } = testArchive
    const phrase = process.env.ACCOUNT_SEED
    const account = new Account({ phrase })
    const token = await signInUser({
      address: account.addressValue.bn.toString('hex'),
      privateKey: account.private.bn.toString('hex'),
    })
    try {
      archive = await getArchive(name, token)
    } catch (error) {
      console.log(`${name} archive does not exist, creating...`)
      archive = await claimArchive(token, name)
      if (accessControl) {
        archive = await setArchiveAccessControl(token, name, { accessControl, archive: name })
      }
    }
    assertEx(archive.archive === name, `ERROR: ${name} archive does not exist`)
    assertEx(archive.accessControl === accessControl, `ERROR: ${name} archive has incorrect permissions`)
  }
}
