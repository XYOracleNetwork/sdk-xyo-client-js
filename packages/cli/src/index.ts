import { connect, printLogo, setTerminalTitle, start } from './lib'
import { startTerminal } from './terminal'

const main = async () => {
  setTerminalTitle()
  await printLogo()
  await start()
  const connection = await connect()
  await startTerminal(connection)
}

main()
  .then(() => {
    console.log('Finishing,...')
    process.exit(0)
  })
  .catch(() => {
    console.log('Excepting,...')
    process.exit(1)
  })
