// @flow
import * as React from 'react';
import PropTypes from 'prop-types';

const App = ({ children }) => {
  return <>{children}</>;
};

App.propTypes = {
  children: PropTypes.node.isRequired
};

export default App;
