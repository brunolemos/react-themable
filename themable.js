import React, { Component } from 'react';

const types = { theme: React.PropTypes.string };

export default (ThemableComponent) => class extends Component {
  constructor(props) {
    super(props);
    
    ThemableComponent.contextTypes = ThemableComponent.contextTypes || {};
    Object.assign(ThemableComponent.contextTypes, types);
  }

  static contextTypes = types;
  static propTypes = types;
  static childContextTypes = types;

  getChildContext() {
    return { theme: this.props.theme || this.context.theme };
  }

  render() {
    return <ThemableComponent {...this.props} />;
  }
};
