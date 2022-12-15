import { connect, printLogo, restart, setTerminalTitle, stop } from './lib'
import { startTerminal } from './terminal'

const main = async () => {
  await printLogo()
  setTerminalTitle()
  await restart()
  const connection = await connect()
  await startTerminal(connection)
}

let status = 0

main()
  .then(() => {
    console.log('Finishing,...')
  })
  .catch(() => {
    console.log('Excepting,...')
    status = -1
  })
  .then(stop)
  .finally(process.exit(status))
