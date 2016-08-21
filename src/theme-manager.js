import { merge, cloneDeep } from 'lodash';

import themable from './themable';

function registerTheme(theme) {
  const _theme = theme || ThemeManager.globalTheme;

  if (this.themes) this.themes[_theme] = this.themes[_theme] || {};
  ThemeManager.themeVariables[_theme] = ThemeManager.themeVariables[_theme] || {};
}

function registerProperties(stylesObj) {
  if (!stylesObj) return {};

  const properties = {};
  for (const key in stylesObj) {
    properties[key] = {
      configurable: true,
      get: () => this.getPropertyFromTheme(this.currentTheme, key),
    };
  }

  Object.defineProperties(stylesObj, properties);
  merge(this.styles, stylesObj);

  return stylesObj;
}

function isVariable(key) {
  return typeof key === 'string' && key[0] === '$';
}

function fixVariableName(variableName) {
  return isVariable(variableName) ? variableName.slice(1) : variableName;
}

function fixVariableNames(variablesObject) {
  if (!variablesObject) return {};

  let fixedVariables = {};
  for (const key in variablesObject) fixedVariables[fixVariableName(key)] = variablesObject[key];

  return fixedVariables;
}

function addStyle(theme, stylesObj) {
  const _theme = theme || ThemeManager.globalTheme;

  registerTheme(_theme);
  return merge(this.themes[_theme], stylesObj);
}

function addThemeVariables(theme, variables) {
  const _theme = theme || ThemeManager.globalTheme;
  if (!_theme) return;

  registerTheme(_theme);
  Object.assign(ThemeManager.themeVariables[_theme], fixVariableNames(variables));
}

function parseStyle(theme, style) {
  if (typeof style === 'string' && style[0] === '$') return ThemeManager.getVariable(theme, style);
  if (typeof style !== 'object') return style;

  const _theme = theme || ThemeManager.globalTheme;
  const parsedStyle = cloneDeep(style);
  for (const key in parsedStyle) parsedStyle[key] = parseStyle(_theme, parsedStyle[key]);
  return parsedStyle;
}

export default class ThemeManager {
  static globalTheme = 'default';
  static themeVariables = {};
  static config = {
    styleSheetReference: null, // { StyleSheet } from 'react-native' or a custom one like EStyleSheet
    fallbackToGlobalTheme: true,
  };

  constructor() {
    this.styles = {};
    this.themes = {};
    this.localThemeVariables = {};
    this.currentTheme = ThemeManager.globalTheme;

    addStyle = addStyle.bind(this);
    registerTheme = registerTheme.bind(this);
    registerProperties = registerProperties.bind(this);

    registerTheme(ThemeManager.globalTheme);
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
    const _variableName = variableName[0] === '$' ? variableName.slice(1) : variableName;

    return (theme && (this.themeVariables[theme] || {})[_variableName])
      || (ThemeManager.config.fallbackToGlobalTheme && (this.themeVariables[ThemeManager.globalTheme] || {})[_variableName]);
  }

  create(themes = [], styleObj) {
    let _themes;
    let _styleObj;

    // allow to not specify first argument (considering theme as the global one)
    if (!Array.isArray(arguments[0]) && typeof arguments[0] === 'object') {
      _themes = [ThemeManager.globalTheme];
      _styleObj = arguments[0];
    } else {
      _themes = Array.isArray(themes) ? themes : [themes];
      _styleObj = styleObj || {};
    }

    // create styles for each specified theme
    _themes.map((theme) => addStyle(theme, _styleObj));

    registerProperties(_styleObj);
    return this.styles;
  }

  getPropertyFromTheme(theme, propertyName) {
    let _theme;
    let value;

    if ((this.themes[theme] || {})[propertyName] !== undefined) {
      _theme = theme;
      value = (this.themes[theme] || {})[propertyName];
    }

    else if (ThemeManager.config.fallbackToGlobalTheme
      && this.themes[ThemeManager.globalTheme][propertyName] !== undefined) {
      _theme = ThemeManager.globalTheme;
      value = this.themes[ThemeManager.globalTheme][propertyName];
    }

    return parseStyle(_theme, value);
  }

  setTheme(theme) {
    const _theme = theme || ThemeManager.globalTheme;
    if (this.currentTheme === _theme) return _theme;

    this.currentTheme = _theme;
    this.styles = this.getStyles(this.currentTheme); // ThemeManager.config.styleSheetReference.create(styles);

    return this.currentTheme;
  }

  getStyles(theme) {
    const _theme = theme || this.currentTheme;
    const _globalStyles = (ThemeManager.config.fallbackToGlobalTheme && this.themes[ThemeManager.globalTheme]) || {};

    return parseStyle(_theme, merge({}, _globalStyles, this.themes[_theme]));
  }

  attach(component) {
    return themable(component);
  }
};
