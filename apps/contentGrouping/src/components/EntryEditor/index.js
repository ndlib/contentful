import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { t as typy } from 'typy'
import {
  FieldGroup,
  Option,
  SelectField,
  TextField,
  Workbench,
} from '@contentful/forma-36-react-components'
import '@contentful/forma-36-fcss/dist/styles.css'
import '@contentful/forma-36-fcss'
import ContentTypeSelection from '../Fields/ContentTypeSelection'
import LockedTextField from '../Fields/LockedTextField'
import ScopedItemList from '../Fields/ScopedItemList'
import StringListField from '../Fields/StringListField'
import KeyValueList from '../Fields/KeyValueList'

const Entry = (props) => {
  const [lastUpdate, setLastUpdate] = useState(new Date()) // eslint-disable-line no-unused-vars

  useEffect(() => {
    // Listen for changes on id field. This happens when title is update prior to publishing,
    // so that id field generates in sync with title.
    const changeHandler = props.sdk.entry.fields['id'].onValueChanged((newValue) => {
      // Force UI refresh, otherwise ID is always one cycle behind
      setLastUpdate(new Date())
    })
    return () => changeHandler
  }, [props.sdk.entry.fields])

  const controls = (props.sdk.editor.editorInterface.controls || [])
    .filter(control => !control.field.disabled && !control.field.omitted) // Don't show controls that have been hidden or disabled
    .map(control => {
      const value = typy(props.sdk.entry, `fields.${control.fieldId}`).safeObjectOrEmpty.getValue()
      const validations = typy(control, 'field.validations').safeArray
      let component

      const commonProps = {
        onChange: (event) => {
          props.sdk.entry.fields[control.fieldId].setValue(event.target.value).then(() => {
            // Forces component to re-render, so cross-field references and values get updated
            setLastUpdate(new Date())
          })
        },
      }

      // If it's a recognized field that we need to customize, present our own components
      switch(control.fieldId) {
        case 'id':
          component = <LockedTextField entry={props.sdk.entry} control={control} value={value} {...commonProps} />
          break
        case 'contentTypes':
          component = <ContentTypeSelection space={props.sdk.space} control={control} value={value} {...commonProps} />
          break
        case 'items':
          const types = typy(typy(props.sdk.entry, `fields.contentTypes`).safeObjectOrEmpty.getValue()).safeArray
          component = (
            <ScopedItemList
              space={props.sdk.space}
              navigator={props.sdk.navigator}
              dialogs={props.sdk.dialogs}
              types={types}
              control={control}
              items={value}
              {...commonProps}
            />
          )
          break
        default:
          // Use a rough equivalent of the default UI for any other fields
          switch (control.widgetId) {
            case 'singleLine':
            case 'slugEditor':
              const sizeValidation = validations.find(validation => validation.size)
              component = control.widgetId === 'slugEditor' ? (
                  <LockedTextField entry={props.sdk.entry} control={control} value={value} {...commonProps} />
                ) : (
                  <TextField
                    id={control.fieldId}
                    name={control.fieldId}
                    labelText={control.field.name}
                    helpText={control.settings.helpText}
                    required={control.field.required}
                    value={value}
                    textInputProps={{
                      autoComplete: 'off',
                      'data-lpignore': true,
                      maxLength: typy(sizeValidation, 'size.max').safeNumber || 256,
                    }}
                    countCharacters
                    {...commonProps}
                  />
                )
              break
            case 'markdown':
              break
            case 'dropdown':
              const validationList = validations.find(validation => validation.in)
              component = (
                <SelectField
                  id={control.fieldId}
                  name={control.fieldId}
                  labelText={control.field.name}
                  helpText={control.settings.helpText}
                  required={control.field.required}
                  value={value}
                  {...commonProps}
                >
                  {validationList.in.map(optionValue => (
                    <Option key={optionValue} value={optionValue}>{optionValue}</Option>
                  ))}
                </SelectField>
              )
              break
            case 'entryLinksEditor':
              break
            case 'tagEditor':
            case 'listInput':
              component = <StringListField entry={props.sdk.entry} control={control} value={value} {...commonProps} />
              break
            case 'objectEditor':
              component = <KeyValueList control={control} value={value} {...commonProps} />
              break
            case 'checkbox':
              break
            default:
              break
          }
          break
      }

      return {
        id: control.fieldId,
        value: control.value,
        component: component,
      }
    })
  return (
    <Workbench.Content type='text'>
      {controls.filter(control => control.component).map(control => (
        <FieldGroup className='f36-margin--l fieldGroup' key={control.id}>
          {control.component}
        </FieldGroup>
      ))}
    </Workbench.Content>
  )
}

Entry.propTypes = {
  sdk: PropTypes.shape({
    editor: PropTypes.shape({
      editorInterface: PropTypes.shape({
        controls: PropTypes.arrayOf(PropTypes.object).isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
}

export default Entry
