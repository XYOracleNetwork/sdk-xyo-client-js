import type { WordlistInstance } from './Wordlist.ts'

export interface MnemonicInstance {

  /**
   *  The underlying entropy which the mnemonic encodes.
   */
  entropy: string

  /**
   *  The password used for this mnemonic. If no password is used this
   *  is the empty string (i.e. ``""``) as per the specification.
   */
  password: string

  /**
   *  The mnemonic phrase of 12, 15, 18, 21 or 24 words.
   *
   *  Use the [[wordlist]] ``split`` method to get the individual words.
   */
  phrase: string

  /**
   *  The wordlist for this mnemonic.
   */
  wordlist: WordlistInstance

  /**
   *  Returns the seed for the mnemonic.
   */
  computeSeed(): string
}
