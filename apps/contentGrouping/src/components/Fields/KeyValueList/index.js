import React from 'react'
import PropTypes from 'prop-types'
import { t as typy } from 'typy'
import {
  Button,
  FormLabel,
  HelpText,
  ValidationMessage,
} from '@contentful/forma-36-react-components'
import KeyValueRow from './KeyValueRow'

const KeyValueList = (props) => {
  const fieldId = props.control.fieldId
  const keys = props.value ? Object.keys(props.value) : []

  const onAddRow = () => {
    if (!keys.includes('')) {
      update({
        ...typy(props, 'value').safeObjectOrEmpty,
        '': '',
      })
    }
  }

  const onRemoveRow = (key) => {
    if (keys.includes(key)) {
      const newObj = {}
      keys.forEach((current) => {
        if (current !== key) {
          newObj[current] = props.value[current]
        }
      })
      update(newObj)
    }
  }

  const onRowChange = (oldKey, newKey, value) => {
    const newObj = {
      ...typy(props, 'value').safeObjectOrEmpty,
      [newKey]: value,
    }
    // So when the key is updated we don't retain what the key used to be.
    if (oldKey !== newKey) {
      delete newObj[oldKey]
    }
    update(newObj)
  }

  const update = (newValue) => {
    props.onChange({
      target: {
        value: newValue,
      },
    })
  }

  return (
    <React.Fragment>
      <FormLabel htmlFor={fieldId} required={props.control.field.required}>
        {props.control.field.name}
      </FormLabel>
      {props.validationMessage && (
        <ValidationMessage>
          {props.validationMessage}
        </ValidationMessage>
      )}
      {keys.map((key, index) => (
        <KeyValueRow
          key={index}
          keyName={key}
          index={index}
          fieldId={fieldId}
          value={props.value[key]}
          onChange={onRowChange}
          onRemove={() => onRemoveRow(key)}
        />
      ))}
      <div className='buttonRow'>
        <Button buttonType='primary' onClick={onAddRow}>Add Field</Button>
      </div>
      {typy(props.control, 'settings.helpText').safeString && (
        <HelpText>
          {props.control.settings.helpText}
        </HelpText>
      )}
    </React.Fragment>
  )
}

KeyValueList.propTypes = {
  control: PropTypes.shape({
    fieldId: PropTypes.string.isRequired,
    field: PropTypes.object.isRequired,
    settings: PropTypes.object,
  }).isRequired,
  type: PropTypes.oneOf(['number', 'date', 'time', 'text', 'password', 'email', 'search', 'url']),
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default KeyValueList
