import { StyleSheet, View } from 'react-native';
import { merge } from 'lodash';

import themable from './themable';

function registerTheme(theme) {
  if (this.themes) this.themes[theme] = this.themes[theme] || {};
  ThemeManager.themeVariables[theme] = ThemeManager.themeVariables[theme] || {};
}

function registerProperties(stylesObj) {
  if (!stylesObj) return {};

  const properties = {};
  const keys = Object.keys(stylesObj);
  for (const key of keys) {
    properties[key] = {
      configurable: true,
      get: () => this.getPropertyFromTheme(this.currentTheme, key),
    };
  }

  Object.defineProperties(stylesObj, properties);
  Object.defineProperties(this.styles, properties);

  return stylesObj;
}

function addThemeVariables(theme, variables) {
  if (!theme) return addGlobalVariables(variables);

  registerTheme(theme);
  Object.assign(ThemeManager.themeVariables[theme], variables);
}

function addGlobalVariables(variables) {
  if (!ThemeManager.globalTheme) return;

  addThemeVariables(ThemeManager.globalTheme, variables);
}

function addStyle(theme, stylesObj) {
  registerTheme(theme);
  return Object.assign(this.themes[theme], stylesObj);
}

export default class ThemeManager {
  static globalTheme = 'default';
  static themes = {};
  static themeVariables = {};
  static config = {
    styleSheetReference: StyleSheet,
    fallbackToGlobalTheme: true,
  };

  constructor() {
    this.styles = {};
    this.themes = {};
    this.currentTheme = this.globalTheme;

    addStyle = addStyle.bind(this);
    registerTheme = registerTheme.bind(this);
    registerProperties = registerProperties.bind(this);

    registerTheme(this.globalTheme);
  }

  static config({ styleSheetReference }) {
    if (styleSheetReference) this.config.styleSheetReference = styleSheetReference;
  }

  static addVariables(themes = [], variables = {}) {
    let _themes;
    let _variables;

    // allow to not specify first argument (will consider variables as global ones)
    if (!Array.isArray(arguments[0]) && typeof arguments[0] === 'object') {
      _themes = [ThemeManager.globalTheme];
      _variables = arguments[0] || {};
    } else {
      _themes = (Array.isArray(themes) ? themes : [themes]).filter(Boolean);
      _variables = variables || {};
    }

    // add variables for each specified theme
    _themes.map((theme) => addThemeVariables(theme, _variables));
  }

  static getVariable(theme, variableName) {
    return (this.themeVariables[theme] || {})[variableName];
  }

  create(themes = [], styleObj) {
    let _themes;
    let _styleObj;

    // allow to not specify first argument (considering theme as the global one)
    if (!Array.isArray(arguments[0]) && typeof arguments[0] === 'object') {
      _themes = [ThemeManager.globalTheme];
      _styleObj = arguments[0];
    } else {
      _themes = (Array.isArray(themes) ? themes : [themes]).filter(Boolean);
      _styleObj = styleObj || {};
    }

    // create styles for each specified theme
    _themes.map((theme) => addStyle(theme, styleObj));

    registerProperties(styleObj);
    return this.styles;
  }

  getPropertyFromTheme(theme, propertyName) {
    if ((this.themes[theme] || {})[propertyName] !== undefined)
      return (this.themes[theme] || {})[propertyName];

    if (ThemeManager.config.fallbackToGlobalTheme
      && this.themes[ThemeManager.globalTheme][propertyName] !== undefined)
      return this.themes[ThemeManager.globalTheme][propertyName];

    return null;
  }

  setTheme(theme) {
    this.currentTheme = theme || ThemeManager.globalTheme;
    return this.currentTheme;

    // const styles = this.getStyles(this.currentTheme);
    // this.styles = ThemeManager.config.styleSheetReference.create(styles);
    // this.styles = this.getStyles(this.currentTheme);
  }

  getStyles(theme) {
    const _theme = theme || this.currentTheme;
    const _globalStyles = (ThemeManager.config.fallbackToGlobalTheme && this.themes[ThemeManager.globalTheme]) || {};

    return merge({}, _globalStyles, this.themes[_theme]);
  }

  attach(component) {
    return themable(component);
  }
};
