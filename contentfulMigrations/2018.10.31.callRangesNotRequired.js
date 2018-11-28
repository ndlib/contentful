const normalize_space = (str) => {
  // Taken from here: https://bytes.com/topic/javascript/answers/165013-how-javascript-trim-normalize-space-functions#post637391
  // Replace repeated spaces, newlines and tabs with a single space
  return str.replace(/^\s*|\s(?=\s)|\s*$/g, "");
}

const forward = (migration) => {
  const resource = migration.editContentType('collectionCallRanges')

  resource.editField('rangeStart').required(false)
  resource.editField('rangeEnd').required(false)

  migration.transformEntries({
    contentType: 'collectionCallRanges',
    from: ['rangeStart', 'rangeEnd'],
    to: ['rangeStart', 'rangeEnd'],
    shouldPublish: true,
    transformEntryForLocale: function (fromFields, currentLocale) {
      const start = (fromFields.rangeStart && fromFields.rangeStart[currentLocale]) ? normalize_space(fromFields.rangeStart[currentLocale]) : ''
      const end = (fromFields.rangeEnd && fromFields.rangeEnd[currentLocale]) ? normalize_space(fromFields.rangeEnd[currentLocale]) : ''

      let output = {}
      output['rangeStart'] = (start == 'A 000000') ? '' : start
      output['rangeEnd'] = (end == 'ZZ 999999' || end == 'ZZ 000000') ? '' : end
      return output
    },
  })
}

const reverse = (migration) => {
  const resource = migration.editContentType('collectionCallRanges')

  migration.transformEntries({
    contentType: 'collectionCallRanges',
    from: ['rangeStart', 'rangeEnd'],
    to: ['rangeStart', 'rangeEnd'],
    shouldPublish: true,
    transformEntryForLocale: function (fromFields, currentLocale) {
      const start = (fromFields.rangeStart && fromFields.rangeStart[currentLocale]) ? normalize_space(fromFields.rangeStart[currentLocale]) : ''
      const end = (fromFields.rangeEnd && fromFields.rangeEnd[currentLocale]) ? normalize_space(fromFields.rangeEnd[currentLocale]) : ''

      let output = {}
      output['rangeStart'] = !start ? 'A 000000' : start
      output['rangeEnd'] = !end ? 'ZZ 999999' : end
      return output
    },
  })

  resource.editField('rangeStart').required(true)
  resource.editField('rangeEnd').required(true)
}

module.exports = forward
