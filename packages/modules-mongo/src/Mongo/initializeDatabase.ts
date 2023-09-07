import { addIndexes } from './Indexes'

export const initializeDatabase = async () => {
  await addIndexes()
}
