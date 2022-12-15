import { connect, printLogo, restart, setTerminalTitle, stop } from './lib'
import { startTerminal } from './terminal'

const main = async () => {
  setTerminalTitle()
  await printLogo()
  await restart()
  const connection = await connect()
  setTerminalTitle('XYO (Connected)')
  await startTerminal(connection)
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
