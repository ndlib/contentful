// Add field type "ID" on Internal Link, which serves as a static, human-readable identifier
const forward = (migration) => {
  const internalLink = migration.editContentType('internalLink')

  internalLink.createField('id')
    .name('ID')
    .type('Symbol')
    .required(true)
    .validations([
      { unique: true },
    ])

  internalLink.moveField('id').afterField('title')

  const settings = { "helpText": "Internal identifier for the record. Must be unique. Must not be changed after publishing." }
  internalLink.changeFieldControl('id', 'builtin', 'slugEditor', settings)

  // Values of id field will be populated in another migration script
}

const reverse = (migration) => {
  const internalLink = migration.editContentType('internalLink')

  internalLink.deleteField('id')
}

module.exports = forward
