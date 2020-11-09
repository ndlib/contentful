const randomstring = require('randomstring')

const forward = async (migration, { makeRequest }) => {
  // Any fields that reference presenters should reference groupings instead after this migration+
  migration.editContentType('event').editField('presenters')
    .items({
      type: 'Link',
      linkType: 'Entry',
      validations: [
        { linkContentType: ['presenter', 'grouping'] }
      ]
    })

  migration.transformEntriesToType({
    sourceContentType: 'presenter',
    targetContentType: 'grouping',
    from: ['title', 'type', 'people'],
    shouldPublish: true,
    updateReferences: true,
    removeOldEntries: true,
    identityKey: (fields) => {
      return randomstring.generate(22)
    },
    transformEntryForLocale: async (fromFields, currentLocale) => {
      // If there's no referenced people it's not even valid
      if (!fromFields.people || !fromFields.people[currentLocale]) {
        return
      }
      // If it has no title, use the name of the first person as the new title
      let title = (!fromFields.title || !fromFields.title[currentLocale]) ? '' : fromFields.title[currentLocale].trim()
      if (!title) {
        const response = await makeRequest({
          method: 'GET',
          url: `/entries?content_type=person&sys.id=${fromFields.people[currentLocale][0].sys.id}&limit=1`
        })
        // Didn't find the person? Invalid record
        if (!response.items.length) {
          console.error(`Invalid record with person id ${fromFields.people[currentLocale][0].sys.id}`)
          return
        }
        title = response.items[0].fields.name[currentLocale]
      }

      // Convert title to lowercase, remove all special characters, and replace all spaces with dashes to generate id.
      const id = title.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s/g, '-')

      return {
        title,
        id,
        contentTypes: [
          'person',
        ],
        items: fromFields.people[currentLocale],
        extraData: {
          presenterType: fromFields.type[currentLocale],
        },
      }
    }
  })
}

const reverse = (migration) => {
  migration.transformEntriesToType({
    sourceContentType: 'grouping',
    targetContentType: 'presenter',
    from: ['title', 'contentTypes', 'items', 'extraData'],
    shouldPublish: true,
    updateReferences: false,
    removeOldEntries: false,
    identityKey: (fields) => {
      return randomstring.generate(22)
    },
    transformEntryForLocale: async (fromFields, currentLocale) => {
      // If no content types checked, it's invalid
      if (!fromFields.contentTypes || !fromFields.contentTypes[currentLocale]) {
        return
      }
      // Only migrate records that are groups of persons
      if (fromFields.contentTypes[currentLocale].length > 1 || !fromFields.contentTypes[currentLocale].includes('person')) {
        return
      }

      return {
        title: fromFields.title[currentLocale],
        type: fromFields.extraData[currentLocale].presenterType,
        people: fromFields.items[currentLocale],
      }
    }
  })
}

module.exports = forward
