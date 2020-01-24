const forward = (migration) => {
  const floor = migration.editContentType('floor')

  floor.createField('spacesText')
    .name('Service Points, Centers, and Spaces (Text)')
    .type('Symbol')

  floor.createField('spacesLinks')
    .name('Service Points, Centers, and Spaces (Links)')
    .type('Array')
    .items({
      type: 'Link',
      linkType: 'Entry',
      validations: [
        { linkContentType: ['page', 'internalLink', 'externalLink'] }
      ]
    })

  const building = migration.editContentType('building')

  building.createField('slug')
    .name('Slug')
    .type('Symbol')
    .validations([
      { unique: true },
    ])

  building.moveField('slug').afterField('title')
  building.changeFieldControl('slug', 'extension', 'crossSlug', {})
}

const reverse = (migration) => {
  const floor = migration.editContentType('floor')
  floor.deleteField('spacesText')
  floor.deleteField('spacesLinks')

  const building = migration.editContentType('building')
  building.deleteField('slug')
}

module.exports = forward
