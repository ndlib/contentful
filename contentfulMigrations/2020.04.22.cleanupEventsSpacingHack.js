const forward = async (migration) => {
  migration.transformEntries({
    contentType: 'event',
    from: ['content', 'title'],
    to: ['content'],
    transformEntryForLocale: (fromFields, currentLocale) => {
      if (!fromFields.content || !fromFields.content[currentLocale]) {
        console.log('NO CONTENT:', fromFields.title ? fromFields.title[currentLocale] : 'Untitled')
        return
      }

      const oldContent = fromFields.content[currentLocale]
      // Removes all instances of <p>&nbsp;</p> as well as any new lines adjacent to it.
      const newContent = oldContent.replace(/(?:\\n)*<p>&nbsp;<\/p>(?:\\n)*\s*/g, '')
      if (newContent === oldContent) {
        return // No change
      }

      return {
        content: newContent,
      }
    }
  })
}

const reverse = (migration) => {
  // NOTE: MOST events had this hack at the end of the text. Some of them didn't have it, and some had it at the
  // beginning as well. The closest we can get to restoring the original is just applying it to the end of everything.
  migration.transformEntries({
    contentType: 'event',
    from: ['content'],
    to: ['content'],
    transformEntryForLocale: (fromFields, currentLocale) => {
      if (!fromFields.content || !fromFields.content[currentLocale]) {
        console.log('NO CONTENT:', fromFields.title[currentLocale])
        return
      }

      return {
        content: fromFields.content[currentLocale] + `\n\n<p>&nbsp;</p>\n`,
      }
    }
  })
}

module.exports = forward
