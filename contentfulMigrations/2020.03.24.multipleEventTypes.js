const forward = (migration) => {
  // Immediately before migrating, make sure to change the type field to "singleType"
  // This way we can reuse the id "type" when we create a new field to hold multiple.

  const event = migration.editContentType('event')
  event.createField('type')
    .name('Type')
    .type('Array')
    .items({
      type: 'Symbol',
      validations: [
        {
          in: [
            'Discussion',
            'Exhibit',
            'Hands-On Lab',
            'Lecture/Seminar',
            'Research/Writing Camp',
            'Workshop',
            'Study Break',
            'Special Event',
            'Virtual'
          ]
        }
      ]
    })
  event.moveField('type').afterField('slug')
  event.changeFieldControl('type', 'builtin', 'checkbox', {})

  migration.transformEntries({
    contentType: 'event',
    from: ['singleType'],
    to: ['type'],
    transformEntryForLocale: (fromFields, currentLocale) => {
      if (!fromFields.singleType || !fromFields.singleType[currentLocale]) {
        return
      }

      return {
        type: [
          fromFields.singleType[currentLocale],
        ],
      }
    }
  })

  event.deleteField('singleType')
}

const reverse = (migration) => {
  const event = migration.editContentType('event')
  event.createField('type')
    .name('Type')
    .type('Symbol')
    .validations([
      {
        in: [
          'Discussion',
          'Exhibit',
          'Hands-On Lab',
          'Lecture/Seminar',
          'Research/Writing Camp',
          'Workshop',
          'Study Break',
          'Special Event',
          'Virtual'
        ]
      }
    ])
  event.moveField('type').afterField('slug')
  event.changeFieldControl('type', 'builtin', 'dropdown', {})

  migration.transformEntries({
    contentType: 'event',
    from: ['multipleType'],
    to: ['type'],
    transformEntryForLocale: (fromFields, currentLocale) => {
      if (!fromFields.multipleType || !fromFields.multipleType[currentLocale] || !fromFields.multipleType[currentLocale].length) {
        return
      }

      return {
        type: fromFields.multipleType[currentLocale][0],
      }
    }
  })

  event.deleteField('multipleType')
}

module.exports = forward
