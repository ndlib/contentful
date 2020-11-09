import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import {
  FormLabel,
  IconButton,
  TextInput,
} from '@contentful/forma-36-react-components'

const KeyValueRow = (props) => {
  const keyRef = useRef()
  const valueRef = useRef()

  const formFieldNameId = `${props.fieldId}_${props.index}_name`
  const formFieldValueId = `${props.fieldId}_${props.index}_value`

  const onKeyChange = (event) => {
    const newKey = event.target.value
    if (newKey !== props.keyName) {
      if (valueRef.current) {
        props.onChange(props.keyName, newKey, valueRef.current.props.value)
      }
    }
  }

  const onValueChange = (event) => {
    if (keyRef.current) {
      const key = keyRef.current.props.value
      props.onChange(key, key, event.target.value)
    }
  }

  return (
    <div className='keyValueRow'>
      <div className='textInputGroup'>
        <FormLabel htmlFor={formFieldNameId}>
          Name:&nbsp;
        </FormLabel>
        <TextInput
          ref={keyRef}
          id={formFieldNameId}
          name={formFieldNameId}
          type='text'
          value={props.keyName}
          onBlur={onKeyChange}
          autoComplete='off'
          data-lpignore={true}
        />
      </div>
      <div className='textInputGroup'>
        <FormLabel htmlFor={formFieldValueId}>
          Value:&nbsp;
        </FormLabel>
        <TextInput
          ref={valueRef}
          id={formFieldValueId}
          name={formFieldValueId}
          type='text'
          value={props.value}
          onChange={onValueChange}
          autoComplete='off'
          data-lpignore={true}
        />
      </div>
      <IconButton
        className='keyValueDelete'
        buttonType='muted'
        label='Remove'
        iconProps={{
          icon: 'Delete',
          size: 'medium',
        }}
        onClick={props.onRemove}
      />
    </div>
  )
}

KeyValueRow.propTypes = {
  index: PropTypes.number.isRequired,
  fieldId: PropTypes.string.isRequired,
  keyName: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
}

export default KeyValueRow
