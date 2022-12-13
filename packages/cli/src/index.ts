import { connect, printLogo, start } from './lib'
import { startTerminal } from './terminal'

const main = async () => {
  await printLogo()
  await start()
  const connection = await connect()
  await startTerminal(connection)
}

main()
  .then(() => {
    console.log('Finishing,...')
  })
  .catch(() => {
    console.log('Excepting,...')
  })
