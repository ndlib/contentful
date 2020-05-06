const forward = (migration) => {
  const eventGroup = migration.createContentType('eventGroup')
  eventGroup.name('Event Group')
  eventGroup.displayField('title')

  eventGroup.createField('title')
    .name('Title')
    .type('Symbol')
    .required(true)

  eventGroup.createField('events')
    .name('Events')
    .type('Array')
    .required(true)
    .items({
      type: 'Link',
      linkType: 'Entry',
      validations: [
        { 'linkContentType': ['event'] }
      ],
    })

  eventGroup.changeFieldControl('events', 'builtin', 'entryCardsEditor', {})
}

const reverse = (migration) => {
  migration.deleteContentType('eventGroup')
}

module.exports = forward
