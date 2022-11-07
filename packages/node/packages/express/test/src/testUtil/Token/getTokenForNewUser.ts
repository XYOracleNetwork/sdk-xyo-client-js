import { getExistingUser } from '../User'
import { signInUser } from './signInUser'

export const getTokenForNewUser = async (): Promise<string> => {
  return signInUser(await getExistingUser())
}
