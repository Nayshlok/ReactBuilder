/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const DisplayContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const ComponentDisplay = ({
  selectedName,
  selectedComponent,
  addComponent
}) => {
  const [editing, setEditing] = useState(false);
  const [childString, setChildString] = useState(
    selectedComponent.children || ''
  );
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('');
  const [newChild, setNewChild] = useState('');

  useEffect(() => {
    setChildString(selectedComponent.children || '');
  }, [selectedComponent]);

  const composeComponent = () => {
    const newComponent = {
      element: newType,
      children: newChild,
      style: {}
    };
    const oldComponent = {
      ...selectedComponent,
      children: childString
    };
    addComponent(newName, newComponent, selectedName, oldComponent);
  };

  const nullCheckedValue = selectedComponent.element || 'none';
  const elementType = nullCheckedValue.target || nullCheckedValue;
  return (
    <DisplayContainer>
      <p>Name: {selectedName}</p>
      <p>Type: {elementType}</p>
      {!editing && (
        <>
          <p>{childString}</p>
          <button type="button" onClick={() => setEditing(true)}>
            Add Element
          </button>
        </>
      )}
      {editing && (
        <FormContainer>
          <label htmlFor="current-child">Current children:</label>
          <input
            id="current-child"
            name="current-child-string"
            value={childString}
            onChange={e => setChildString(e.target.value)}
          />
          <label htmlFor="new-name">New Name:</label>
          <input
            id="new-name"
            name="element-name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <label htmlFor="new-type">New Type:</label>
          <input
            id="new-type"
            name="element-type"
            value={newType}
            onChange={e => setNewType(e.target.value)}
          />
          <label htmlFor="new-child">New Child:</label>
          <input
            id="new-child"
            name="new-child-content"
            value={newChild}
            onChange={e => setNewChild(e.target.value)}
          />
          <button type="submit" onClick={() => composeComponent()}>
            Update component
          </button>
          <button type="button" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </FormContainer>
      )}
    </DisplayContainer>
  );
};

export default ComponentDisplay;
