const forward = (migration) => {
  const internalLink = migration.editContentType('internalLink')
  internalLink.createField('includeOnSubjectList')
    .name('Include on Subjects A-Z')
    .type('Boolean')

  // Sadly, we can no longer keep page required since "subjects" that don't show on the A-Z won't have a page :(
  internalLink.editField('page').required(false)

  const banlist = ['law', 'library-and-information-science', 'sports-research']
  migration.transformEntries({
    contentType: 'internalLink',
    from: ['includeOnSubjectList', 'context', 'id'],
    to: ['includeOnSubjectList'],
    transformEntryForLocale: (fromFields, currentLocale) => {
      // If it's not a subject, don't change it
      if (!fromFields.context || fromFields.context[currentLocale] != 'Subject' || !fromFields.id) {
        return
      }

      return {
        includeOnSubjectList: !banlist.includes(fromFields.id[currentLocale]),
      }
    }
  })
}

const reverse = (migration) => {
  const internalLink = migration.editContentType('internalLink')
  internalLink.deleteField('includeOnSubjectList')
  internalLink.editField('page').required(true)
}

module.exports = forward