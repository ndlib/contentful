// add field to help find resources by starting letter or # for non-alphabetical named databases.
const forward = (migration) => {
  const resource = migration.editContentType('Alert')

  resource.createField('global')
    .name('Global Alert')
    .type('Boolean')
}

const reverse = (migration) => {
  const resource = migration.editContentType('Alert')
  resource.deleteField('global')
}

module.exports = forward
