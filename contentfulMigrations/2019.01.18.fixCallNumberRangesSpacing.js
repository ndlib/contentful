const normalize_space = (str) => {
  // Taken from here: https://bytes.com/topic/javascript/answers/165013-how-javascript-trim-normalize-space-functions#post637391
  // Replace repeated spaces, newlines and tabs with a single space
  return str.replace(/^\s*|\s(?=\s)|\s*$/g, "");
}

// allow floor map to be toggled on service points
const forward = (migration) => {
  migration.transformEntries({
    contentType: 'collectionCallRanges',
    from: ['rangeStart', 'rangeEnd'],
    to: ['rangeStart', 'rangeEnd'],
    shouldPublish: true,
    transformEntryForLocale: function (fromFields, currentLocale) {
      const start = (fromFields.rangeStart && fromFields.rangeStart[currentLocale]) ? normalize_space(fromFields.rangeStart[currentLocale]) : ''
      const end = (fromFields.rangeEnd && fromFields.rangeEnd[currentLocale]) ? normalize_space(fromFields.rangeEnd[currentLocale]) : ''

      let modified = false
      let output = {
        'rangeStart': start,
        'rangeEnd': end,
      }
      // Empty values are allowed, so don't bother trying to split and combine if the value has no spaces in it
      if (start.includes(' ')) {
        let split = start.split(' ')
        output['rangeStart'] = split[0].padEnd(2, ' ') + ' ' + split[1]
        modified = true
      }
      if (end.includes(' ')) {
        let split = end.split(' ')
        output['rangeEnd'] = split[0].padEnd(2, ' ') + ' ' + split[1]
        modified = true
      }
      return modified ? output : undefined
    },
  })
}

const reverse = (migration) => {
  migration.transformEntries({
    contentType: 'collectionCallRanges',
    from: ['rangeStart', 'rangeEnd'],
    to: ['rangeStart', 'rangeEnd'],
    shouldPublish: true,
    transformEntryForLocale: function (fromFields, currentLocale) {
      // The double space added during forward will be removed simply by the normalize_space function
      const start = (fromFields.rangeStart && fromFields.rangeStart[currentLocale]) ? normalize_space(fromFields.rangeStart[currentLocale]) : ''
      const end = (fromFields.rangeEnd && fromFields.rangeEnd[currentLocale]) ? normalize_space(fromFields.rangeEnd[currentLocale]) : ''

      // If there is nothing to revert, don't bother republishing this entry. Just return undefined to skip it.
      if ((!start || start == fromFields.rangeStart[currentLocale]) && (!end || end == fromFields.rangeEnd[currentLocale])) {
        return undefined
      }

      let output = {
        'rangeStart': start,
        'rangeEnd': end,
      }
      return output
    },
  })
}

module.exports = forward
