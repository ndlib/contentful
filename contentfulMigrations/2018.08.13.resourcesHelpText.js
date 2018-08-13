const forward = (migration) => {
    const resource = migration.editContentType('resource')

    let settings = { "helpText": "display for all 710 X_ where $4 pbl" }
    resource.changeEditorInterface('publisher','singleLine',settings)
    
    settings = { "helpText": "506 $f $a $c" }
    resource.changeEditorInterface('access','singleLine',settings)

    settings = { "helpText": "740 X2 $a, list all, remove punctuation and all text after, apply Headline capitalization" }
    resource.changeEditorInterface('includes','markdown',settings)

    settings = { "helpText": "display for all 710 X_ where $4 pltfrm" }
    resource.changeEditorInterface('platform','singleLine',settings)

    settings = { "helpText": "display for all 710 X_ where $4 prv" }
    resource.changeEditorInterface('provider','singleLine',settings)
  }
  
  module.exports = forward
  