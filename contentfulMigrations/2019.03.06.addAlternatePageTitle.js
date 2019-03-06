// allow floor map to be toggled on service points
const forward = (migration) => {
  const resource = migration.editContentType('page')

  resource.createField('alternateTitle')
    .name('Alternate Title')
    .type('Symbol')

  resource.moveField('alternateTitle').afterField('title')

  const settings = { "helpText": "May be displayed instead of Title in some areas, especially when a short name is desired." }
  resource.changeEditorInterface('alternateTitle', 'singleLine', settings)

  const mappings = {
    'architecture': 'Architecture Library',
    'business': 'Business Library',
    'engineering': 'Engineering Library',
    'mathematics': 'Mathematics Library',
  }

  migration.transformEntries({
    contentType: 'page',
    from: ['slug'],
    to: ['alternateTitle'],
    shouldPublish: true,
    transformEntryForLocale: function (fromFields, currentLocale) {
      let output = {}
      const mappedValue = (fromFields.slug && fromFields.slug[currentLocale]) ? mappings[fromFields.slug[currentLocale]] : null

      return mappedValue ? { 'alternateTitle': mappedValue } : undefined
    },
  })
}

const reverse = (migration) => {
  const resource = migration.editContentType('page')
  resource.deleteField('alternateTitle')
}

module.exports = forward
