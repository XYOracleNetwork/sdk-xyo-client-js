export interface WordlistInstance {
  locale: string

  /**
     *  Maps an 11-bit value into its coresponding word in the list.
     *
     *  Sub-classes MUST override this.
     */
  getWord(index: number): string

  /**
     *  Maps a word to its corresponding 11-bit value.
     *
     *  Sub-classes MUST override this.
     */
  getWordIndex(word: string): number

  /**
   *  Sub-classes may override this to provider a language-specific
   *  method for joining %%words%% into a phrase.
   *
   *  By default, %%words%% are joined by a single space.
   */
  join(words: Array<string>): string

  split(phrase: string): Array<string>

}
