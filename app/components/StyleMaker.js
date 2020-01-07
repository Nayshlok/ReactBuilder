import React from 'react';
import styled from 'styled-components';

const InputHolder = styled.span`
  display: flex;
  flex-direction: row;
`;

const StyledInput = styled.input`
  width: 125px;
`;

const StyleMaker = ({ updateParent, styles, setStyles }) => {
  const updateStyleName = (value, index) => {
    const styleCopy = [...styles];
    styleCopy[index].name = value;
    setStyles(styleCopy);
  };

  const updateStyleValue = (value, index) => {
    const styleCopy = [...styles];
    styleCopy[index].value = value;
    setStyles(styleCopy);
  };

  const removeElement = index => {
    const styleCopy = [...styles];
    styleCopy.splice(index, 1);
    setStyles(styleCopy);
  };

  const addStyle = () => {
    setStyles([...styles, { name: '', value: '' }]);
  };

  const composeStyles = () => {
    const composedStyle = styles.reduce((composed, style) => {
      if (style.name && style.value) {
        const temp = { ...composed, [style.name]: style.value };
        return temp;
      }
      return composed;
    }, {});

    updateParent(composedStyle);
  };

  const renderedStyles = styles.map((s, index) => {
    return (
      // eslint-disable-next-line react/no-array-index-key
      <InputHolder key={`style-${index}`}>
        <StyledInput
          name={`style-${index}-name`}
          onChange={e => updateStyleName(e.target.value, index)}
          value={styles[index].name}
        />
        <StyledInput
          name={`style-${index}-value`}
          onChange={e => updateStyleValue(e.target.value, index)}
          value={styles[index].value}
        />
        <button type="button" onClick={() => removeElement(index)}>
          X
        </button>
      </InputHolder>
    );
  });

  return (
    <div>
      {renderedStyles}
      <button type="button" onClick={addStyle}>
        Add Style
      </button>
      <button type="button" onClick={composeStyles}>
        Apply Styles
      </button>
    </div>
  );
};

export default StyleMaker;
