import React from 'react';

const ComponentDisplay = ({ selectedComponent }) => {
  const subItems = (selectedComponent.subItems || []).map(item => (
    <li key={item}>{item}</li>
  ));
  const elementType =
    selectedComponent.value.element.target || selectedComponent.value.element;
  return (
    <div>
      <p>Name: {selectedComponent.name}</p>
      <p>Type: {elementType}</p>
      {Boolean(subItems.length) && <ul>{subItems}</ul>}
    </div>
  );
};

export default ComponentDisplay;
