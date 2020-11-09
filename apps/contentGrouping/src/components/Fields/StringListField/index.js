import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { t as typy } from 'typy'
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc'
import arrayMove from 'array-move'
import {
  FormLabel,
  HelpText,
  Icon,
  Pill,
  TextInput,
  ValidationMessage,
} from '@contentful/forma-36-react-components'

const SortableList = SortableContainer(props => (
  <div className='pillListContainer'>{props.children}</div>
))

const SortablePillHandle = SortableHandle(() => (
  <div className='dragHandle'>
    <Icon icon='Drag' color='muted' className='pillIcon' />
  </div>
))

const SortablePill = SortableElement(props => (
  <Pill
    label={props.label}
    onClose={props.onClose}
    onDrag={() => { return }}
    dragHandleComponent={<SortablePillHandle />}
  />
))

const StringListField = (props) => {
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [shouldFocus, setShouldFocus] = useState(false)

  const addValue = (val) => {
    const arr = typy(props.value).safeArray
    // Don't allow duplicates because that's silly
    if (!arr.includes(val)) {
      arr.push(val)
      updateList(arr)
    }
  }

  const removeValue = (val) => {
    if (typy(props.value).safeArray.includes(val)) {
      updateList(props.value.filter(compare => compare !== val))
    }
  }

  const updateList = useCallback(
    (newValues) => {
      props.onChange({
        target: {
          value: [...newValues],
        },
      })
    },
    [props]
  )

  const swapItems = useCallback(
    ({ oldIndex, newIndex }) => {
      if (oldIndex !== newIndex) {
        const newItems = arrayMove(props.value, oldIndex, newIndex)
        updateList(newItems)
      }
    },
    [props.value, updateList]
  )

  const checkEnterPressed = (event) => {
    if (event.key === 'Enter' || event.which === 13 || event.keyCode === 13) { // Enter
      event.preventDefault()

      const val = typy(event, 'target.value').safeString
      if (val && !typy(props.value).safeArray.includes(val)) {
        addValue(val)
      }
      // The only way to clear the input value is to re-render, so we update state to force that.
      setShouldFocus(true)
      setLastUpdate(new Date())
    }
  }

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
      <TextInput
        key={lastUpdate}
        id={props.control.fieldId}
        name={props.control.fieldId}
        type='text'
        placeholder='Type a value and press enter.'
        onKeyPress={checkEnterPressed}
        autoFocus={shouldFocus}
        onBlur={() => setShouldFocus(false)}
        autoComplete='off'
        data-lpignore={true}
      />
      <SortableList
        useDragHandle
        axis='xy'
        distance={10}
        onSortEnd={swapItems}
      >
        {typy(props.value).safeArray.map((val, index) => (
          <SortablePill
            key={val + index.toString()}
            label={val}
            index={index}
            onClose={() => removeValue(val)}
          />
        ))}
      </SortableList>
      {typy(props.control, 'settings.helpText').safeString && (
        <HelpText>
          {props.control.settings.helpText}
        </HelpText>
      )}
    </React.Fragment>
  )
}

StringListField.propTypes = {
  control: PropTypes.shape({
    fieldId: PropTypes.string.isRequired,
    field: PropTypes.object.isRequired,
    settings: PropTypes.object,
  }).isRequired,
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  validationMessage: PropTypes.string,
}

export default StringListField
