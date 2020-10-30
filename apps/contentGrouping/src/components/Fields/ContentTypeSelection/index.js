import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { t as typy } from 'typy'
import {
  FormLabel,
  HelpText,
  Switch,
  ValidationMessage,
} from '@contentful/forma-36-react-components'

const ContentTypeSelection = (props) => {
  const [values, setValues] = useState(props.value || [])
  const onToggle = (id, checked) => {
    let newValues = [...values]

    if (checked) {
      newValues.push(id)
    } else {
      newValues = newValues.filter(val => val !== id)
    }

    setValues(newValues)
    props.onChange({
      target: {
        value: newValues,
      },
    })
  }

  const contentTypes = props.space.getCachedContentTypes()
  const leftSide = [...contentTypes].splice(0, Math.ceil(contentTypes.length / 2))
  const rightSide = [...contentTypes].splice(-(contentTypes.length - leftSide.length))
  const column = (items) => (
    <div className='contentTypeListColumn'>
      {items.map(contentType => (
        <Switch
          key={contentType.sys.id}
          id={contentType.sys.id}
          name={contentType.sys.id}
          labelText={contentType.name}
          isChecked={values.includes(contentType.sys.id)}
          onToggle={(checked) => onToggle(contentType.sys.id, checked)}
        />
      ))}
    </div>
  )

  return (
    <React.Fragment>
      <FormLabel htmlFor={props.control.fieldId} required={props.control.field.required}>
        {props.control.field.name}
      </FormLabel>
      {props.validationMessage && (
        <ValidationMessage>
          {props.validationMessage}
        </ValidationMessage>
      )}
      <div id={props.control.fieldId} name={props.control.fieldId}>
        {column(leftSide)}
        {column(rightSide)}
      </div>
      {typy(props.control, 'settings.helpText').safeString && (
        <HelpText>
          {props.control.settings.helpText}
        </HelpText>
      )}
    </React.Fragment>
  )
}

ContentTypeSelection.propTypes = {
  space: PropTypes.shape({
    getContentTypes: PropTypes.func.isRequired,
  }).isRequired,
  control: PropTypes.shape({
    fieldId: PropTypes.string.isRequired,
    field: PropTypes.object.isRequired,
    settings: PropTypes.object,
  }).isRequired,
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  validationMessage: PropTypes.string,
}

export default ContentTypeSelection
