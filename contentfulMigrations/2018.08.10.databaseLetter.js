// add field to help find resources by starting letter or # for non-alphabetical named databases.
const forward = (migration) => {
  const resource = migration.editContentType('resource')

  resource.createField('databaseLetter')
    .name('Database Letter')
    .type('Symbol')

  resource.moveField('databaseLetter').afterField('alephSystemNumber')
}

const reverse = (migration) => {
  const resource = migration.editContentType('resource')
  resource.deleteField('databaseLetter')
}

module.exports = forward
