const normalize_space = (str) => {
  // Taken from here: https://bytes.com/topic/javascript/answers/165013-how-javascript-trim-normalize-space-functions#post637391
  // Replace repeated spaces, newlines and tabs with a single space
  return str.replace(/^\s*|\s(?=\s)|\s*$/g, "");
}

const capitalizeTerm = (term) => {
  const wordBlacklist = [
    'a', 'an', 'the', 'and', 'of', 'in', 'to', 'for', 'on', 'with', 'com', 'net', 'org', 'gov',
    'de', 'le', 'un', 'une', 'la', 'et', 'des', 'pour', 'du', 'avec',
    'el', 'uno', 'una', 'y', 'del', 'para', 'por',
    'die', 'der', 'den', 'des', 'dem', 'das', 'ein', 'eine', 'einem', 'eines', 'einer', 'einen', 'und', 'von', 'im', 'für', 'mit',
    'il', 'i', 'gli', 'l', 'lo', 'della', 'degli', 'dell', 'i',
    'vol', 'no',
  ]
  if (!wordBlacklist.includes(term)) {
    return term.charAt(0).toUpperCase() + term.slice(1)
  }
  return term
}

// allow floor map to be toggled on service points
const forward = (migration) => {
  migration.transformEntries({
    contentType: 'resource',
    from: ['title', 'alephSystemNumber'],
    to: ['title', 'alephSystemNumber'],
    shouldPublish: true,
    transformEntryForLocale: function (fromFields, currentLocale) {
      const oldValue = (fromFields.title && fromFields.title[currentLocale]) ? fromFields.title[currentLocale] : ''

      // Remove space before colon for colon-ified titles. (American West : Sources -> American West: Sources)
      let newValue = oldValue.replace(/ : /gm, ': ')
      // Get all words that start with a lowercase letter other than e. (E.g. Leave alone words like "e-Resources" or "ebooks")
      // This is extra complicated to account for words that have accented characters and to consider words with
      // apostrophes as all one match. Otherwise it would capitalize after the apostrophe. (E.g. "Women'S")
      newValue = oldValue.replace(/\b[A-z][A-zÀ-ÖØ-öø-ž-_']*['ʼ][A-zÀ-ÖØ-öø-ž-_']*|\b[a-df-z][A-zÀ-ÖØ-öø-ž-_']*/gm, capitalizeTerm)

      // If value unchanged, don't update the item.
      if (newValue == oldValue) {
        return undefined
      }

      console.log(`${oldValue} -> ${newValue}`)

      // PART 2: Pad alephSystemNumber. This is because a new validation on the content model requires that these are
      // 9 characters. The resources won't publish successfully if they fail validation, that's why we do it here.
      const oldAlephNumber = fromFields.alephSystemNumber ? fromFields.alephSystemNumber[currentLocale] : ''
      const newAlephNumber = (oldAlephNumber && oldAlephNumber.length < 9) ? oldAlephNumber.padStart(9, '0') : oldAlephNumber

      return {
        title: newValue,
        alephSystemNumber: newAlephNumber,
      }
    },
  })
}

const reverse = (migration) => {
  // There's no way to reverse this precisely because the originally capitalization is lost after conversion.
  // Besides, this is a purely aesthetic migration so there isn't much reason to revert it.
}

module.exports = forward
