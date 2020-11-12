const randomstring = require('randomstring')

const forward = async (migration, { makeRequest }) => {
  // Update validations to allow grouping to be referenced while we are converting
  const columnContainer = migration.editContentType('columnContainer')
  columnContainer.editField('columns')
    .items({
      type: 'Link',
      linkType: 'Entry',
      validations: [
        { linkContentType: ['grouping', 'columnContainer', 'linkColumn'] }
      ]
    })
  columnContainer.editField('landingPage')
    .validations([
      { linkContentType: ['grouping', 'columnContainer', 'page'] }
    ])

  migration.editContentType('linkColumn').editField('sections')
    .items({
      type: 'Link',
      linkType: 'Entry',
      validations: [
        { linkContentType: ['grouping', 'linkGroup'] }
      ]
    })

  migration.editContentType('page').editField('relatedExtraSections')
    .items({
      type: 'Link',
      linkType: 'Entry',
      validations: [
        { linkContentType: ['grouping', 'linkGroup'] }
      ]
    })

  migration.transformEntriesToType({
    sourceContentType: 'linkGroup',
    targetContentType: 'grouping',
    from: ['title', 'type', 'links'],
    shouldPublish: true,
    updateReferences: true,
    removeOldEntries: true,
    identityKey: (fields) => {
      return randomstring.generate(22)
    },
    transformEntryForLocale: async (fromFields, currentLocale) => {
      // If there's no referenced links it's not even valid
      if (!fromFields.links || !fromFields.links[currentLocale]) {
        return
      }

      const title = fromFields.title[currentLocale]

      // Convert title to lowercase, remove all special characters, and replace all spaces with dashes to generate id.
      const id = title.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s/g, '-')

      return {
        title,
        id,
        displayName: title,
        contentTypes: [
          'dynamicPage',
          'event',
          'externalLink',
          'internalLink',
          'news',
          'page',
          'resource',
        ],
        items: fromFields.links[currentLocale],
      }
    }
  })

  migration.transformEntriesToType({
    sourceContentType: 'linkColumn',
    targetContentType: 'grouping',
    from: ['title', 'sections'],
    shouldPublish: true,
    updateReferences: true,
    removeOldEntries: true,
    identityKey: (fields) => {
      return randomstring.generate(22)
    },
    transformEntryForLocale: async (fromFields, currentLocale) => {
      if (!fromFields.sections || !fromFields.sections[currentLocale]) {
        return
      }

      const title = fromFields.title[currentLocale]

      // Convert title to lowercase, remove all special characters, and replace all spaces with dashes to generate id.
      const id = title.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s/g, '-')

      return {
        title,
        id,
        displayName: title,
        contentTypes: [
          'grouping',
        ],
        items: fromFields.sections[currentLocale],
      }
    }
  })

  migration.transformEntriesToType({
    sourceContentType: 'columnContainer',
    targetContentType: 'grouping',
    from: ['title', 'slug', 'columns', 'showDescriptions'],
    shouldPublish: true,
    updateReferences: true,
    removeOldEntries: true,
    identityKey: (fields) => {
      return randomstring.generate(22)
    },
    transformEntryForLocale: async (fromFields, currentLocale) => {
      if (!fromFields.columns || !fromFields.columns[currentLocale]) {
        return
      }

      const title = fromFields.title[currentLocale]

      return {
        title,
        id: fromFields.slug[currentLocale],
        displayName: title,
        contentTypes: [
          'grouping',
        ],
        items: fromFields.columns[currentLocale],
        extraData: {
          showDescriptions: fromFields.showDescriptions ? fromFields.showDescriptions[currentLocale] : false
        },
      }
    }
  })
}

const reverse = (migration) => {

}

module.exports = forward
