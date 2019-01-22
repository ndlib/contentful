// allow floor map to be toggled on service points
const forward = (migration) => {
  const resource = migration.editContentType('resource')

  resource.createField('accessNotes')
    .name('Access Notes')
    .type('Text')

  resource.moveField('accessNotes').afterField('access')

  const settings = { "helpText": "538 $a" }
  resource.changeEditorInterface('accessNotes', 'multipleLine', settings)

  // LW-469 Throwing this in as well since it was on the same content model and easy to lump in
  resource.editField('alephSystemNumber')
    .validations([
      { unique: true }
    ])
}

const reverse = (migration) => {
  const resource = migration.editContentType('resource')

  resource.deleteField('accessNotes')

  resource.editField('alephSystemNumber')
    .validations([
      { unique: false }
    ])
}

module.exports = forward
