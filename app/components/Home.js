// @flow
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { findDataFiles } from '../actions/fileAccess';
import StyleMaker from './StyleMaker';
import ComponentDisplay from './ComponentDisplay';

const e = React.createElement;

const HomeContainer = styled.div`
  display: grid;
  grid-template-columns: 300px auto;
  grid-template-rows: 100px auto;
`;

const HomeHeader = styled.h2`
  grid-column: 1;
  grid-row: 1;
`;

const Sidebar = styled.div`
  grid-column: 1;
  grid-row: 2;
  display: flex;
  flex-direction: column;
  font-size: 18px;
  margin-right: 30px;
`;

const FileItem = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  direction: rtl;
  text-align: left;
  font-family: 'Courier New', Courier, monospace;
  margin: 3px 0;
`;

const CurrentComponent = styled.p`
  grid-column: 2;
  grid-row: 1;
`;

const Workspace = styled.div`
  grid-column: 2;
  grid-row: 2;
`;

const TestNest = styled.p`
  color: red;
`;

const NestedStrong = styled.strong`
  font-size: 24px;
  font-weight: bold;
  font-style: italic;
`;

const Home = () => {
  const [availableComponents, setAvailableComponents] = useState([]);
  const [currentStyles, setCurrentStyles] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState({ name: 'none' });
  const [parsedWorkspace, setParsedWorkspace] = useState(null);
  const [componentList, setComponentList] = useState({});

  useEffect(() => {
    const loadFiles = async () => {
      const files = await findDataFiles();
      setAvailableComponents(files);
    };
    loadFiles();

    setComponentList({
      parentContainer: {
        element: 'div',
        children: '#{helloOuter}',
        style: {
          padding: '5px'
        }
      },
      helloOuter: {
        element: TestNest,
        children: 'Hello #{helloInner} World #{anotherTest}',
        style: {}
      },
      helloInner: {
        element: NestedStrong,
        children: 'sweet',
        style: {}
      },
      anotherTest: {
        element: 'span',
        children: 'Testington',
        style: {}
      }
    });
  }, []);

  useEffect(() => {
    const componentKeys = Object.keys(componentList);
    if (!componentKeys.length) {
      return function noOp() {};
    }
    const comp = componentKeys[0];
    let current = {
      name: comp,
      value: componentList[comp],
      subItems: []
    };
    const rootElement = current;
    const templateRegex = /#{(.*?)}/g;
    const processedMap = new Map();
    processedMap.set(current.name, current);
    const itemsToProcess = [];
    while (
      templateRegex.test(current.value.children) ||
      itemsToProcess.length
    ) {
      templateRegex.lastIndex = 0;
      const currentMatch = [...current.value.children.matchAll(templateRegex)];
      // eslint-disable-next-line no-loop-func
      currentMatch.forEach(match => {
        const nextItem = componentKeys.find(x => x === match[1]);
        const nextElement = {
          name: nextItem,
          value: componentList[nextItem],
          subItems: []
        };
        current.subItems.push(nextItem);
        if (!processedMap.has(nextItem)) {
          itemsToProcess.push(nextElement);
          processedMap.set(nextItem, nextElement);
        }
      });
      if (itemsToProcess.length) {
        const nextElement = itemsToProcess.pop();
        current = nextElement;
      }
    }
    const renderedMap = new Map();
    const leafItems = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, val] of processedMap) {
      if (!val.subItems.length) {
        leafItems.push({
          key,
          val
        });
      }
    }
    leafItems.forEach(leaf => {
      const { key, val } = leaf;
      const renderedItem = e(
        val.value.element,
        {
          onClick: nextEvent => {
            if (nextEvent.target !== nextEvent.currentTarget) {
              return;
            }
            updateSelectedComponent(val);
            nextEvent.preventDefault();
          },
          style: val.value.style
        },
        val.value.children
      );
      renderedMap.set(key, renderedItem);
    });

    let processing = true;
    while (processing) {
      const availableToRender = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, val] of processedMap) {
        if (
          !renderedMap.has(key) && // Filter those that have not been rendered
          val.subItems.every(item => renderedMap.has(item)) // and can be rendred
        ) {
          availableToRender.push({
            key,
            val
          });
        }
      }
      if (availableToRender.length) {
        availableToRender.forEach(componentToRender => {
          const { key, val } = componentToRender;
          const renderedSubItems = val.subItems.map(item => {
            return {
              value: renderedMap.get(item),
              key: item
            };
          });
          const splitChildren = renderedSubItems.reduce(
            (previous, currentItem) => {
              const workingSegmentIndex = previous.findIndex(x => {
                return typeof x === 'string' && x.includes(currentItem.key);
              });
              const splitSegment = previous[workingSegmentIndex].split(
                `#{${currentItem.key}}`
              );
              const rendered = splitSegment.reduce((agg, segment, index) => {
                if (index === splitSegment.length - 1) {
                  return agg.concat(segment);
                }
                return agg.concat(segment, currentItem.value);
              }, []);
              previous.splice(workingSegmentIndex, 1, ...rendered);
              return previous;
            },
            [val.value.children]
          );
          const renderingItem = e(
            val.value.element,
            {
              onClick: nextEvent => {
                if (nextEvent.target !== nextEvent.currentTarget) {
                  return;
                }
                updateSelectedComponent(val);
                nextEvent.preventDefault();
              },
              style: val.value.style
            },
            ...splitChildren
          );
          renderedMap.set(key, renderingItem);
        });
      } else {
        processing = false;
      }
    }
    const finalRendering = React.cloneElement(
      renderedMap.get(rootElement.name),
      { key: comp }
    );

    setParsedWorkspace(finalRendering);
  }, [componentList]);

  const updateSelectedComponent = component => {
    setSelectedComponent(component);
    const styleArray = Object.keys(component.value.style).map(s => {
      return { name: s, value: component.value.style[s] };
    });
    setCurrentStyles(styleArray);
  };

  const updateStyle = composedStyle => {
    const componentListCopy = {
      ...componentList,
      [selectedComponent.name]: {
        ...selectedComponent.value,
        style: composedStyle
      }
    };
    setComponentList(componentListCopy);
  };

  const addComponent = (name, component, oldName, oldComponent) => {
    setComponentList({
      ...componentList,
      [oldName]: oldComponent,
      [name]: component
    });
  };

  const renderedComponentList = availableComponents.map(comp => (
    <FileItem key={`${comp.path}${comp.name}`}>{`${comp.path.replace(
      './',
      ''
    )}${comp.name}`}</FileItem>
  ));

  return (
    <HomeContainer>
      <HomeHeader>My Home</HomeHeader>
      <Sidebar>
        {renderedComponentList}
        <ComponentDisplay
          selectedName={selectedComponent.name}
          selectedComponent={componentList[selectedComponent.name] || {}}
          addComponent={addComponent}
        />
        <StyleMaker
          updateParent={comp => updateStyle(comp)}
          setStyles={setCurrentStyles}
          styles={currentStyles}
        />
      </Sidebar>
      <CurrentComponent>{selectedComponent.name}</CurrentComponent>
      <Workspace>{parsedWorkspace}</Workspace>
    </HomeContainer>
  );
};
// <Link to={routes.COUNTER}>to Counter</Link>
export default Home;
