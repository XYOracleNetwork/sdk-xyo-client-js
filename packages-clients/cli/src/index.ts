import { assertEx } from '@xylabs/assert'

import { connect, printLogo, restart, setTerminalTitle, stop } from './lib'
import { startTerminal } from './terminal'

const main = async () => {
  setTerminalTitle()
  await printLogo()
  await restart()
  const connectedNodeModule = await connect()
  setTerminalTitle('XYO (Connected)')
  await startTerminal(assertEx(connectedNodeModule, 'Tried to connect to a remote module that was not a NodeModule'))
}

let exitStatus = 0

main()
  .then(() => {
    console.log('Finishing,...')
  })
  .catch(() => {
    console.log('Excepting,...')
    exitStatus = 1
  })
  .finally(async () => {
    await stop()
    process.exit(exitStatus)
  })
