// @flow
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { findDataFiles } from '../actions/fileAccess';
import StyleMaker from './StyleMaker';

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
      helloOuter: {
        element: TestNest,
        children: 'Hello #{helloInner} World',
        initialVisibile: true,
        style: {}
      },
      helloInner: {
        element: NestedStrong,
        children: 'sweet',
        initialVisibile: false,
        style: {}
      }
    });
  }, []);

  useEffect(() => {
    const componentKeys = Object.keys(componentList);
    const parsed = componentKeys
      .filter(comp => componentList[comp].initialVisibile)
      .map(comp => {
        const stack = [];
        let current = {
          name: comp,
          value: componentList[comp]
        };
        const templateRegex = /#{(.*)}/;
        while (templateRegex.test(current.value.children)) {
          const currentMatch = current.value.children.match(templateRegex);
          stack.push(current);
          const nextItem = componentKeys.find(x => x === currentMatch[1]);
          if (!nextItem) {
            return null;
          }
          current = {
            name: nextItem,
            value: componentList[nextItem]
          };
        }
        let rendered = e(
          current.value.element,
          {
            onClick: currentEvent => {
              updateSelectedComponent(current);
              currentEvent.preventDefault();
            },
            style: current.value.style
          },
          current.value.children
        );
        while (stack.length > 0) {
          const next = stack.pop();
          const templateMatch = next.value.children.match(templateRegex);
          const childParts = next.value.children.split(templateMatch[0]);
          rendered = e(
            next.value.element,
            {
              onClick: nextEvent => {
                if (nextEvent.target !== nextEvent.currentTarget) {
                  return;
                }
                updateSelectedComponent(next);
                nextEvent.preventDefault();
              },
              style: next.value.style
            },
            childParts[0],
            rendered,
            childParts[1]
          );
        }

        rendered = React.cloneElement(rendered, { key: comp });

        return rendered;
      });

    setParsedWorkspace(parsed);
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
