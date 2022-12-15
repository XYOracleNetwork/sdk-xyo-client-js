import { connect, printLogo, restart, setTerminalTitle, start, stop } from './lib'
import { startTerminal } from './terminal'

const main = async () => {
  setTerminalTitle()
  await printLogo()
  await restart()
  const connection = await connect()
  await startTerminal(connection)
}

const status = 0

main()
  .then(async () => {
    console.log('Finishing,...')
    await stop()
    process.exit(0)
  })
  .catch(async () => {
    console.log('Excepting,...')
    await stop()
    process.exit(1)
  })
