# React & React Native Theme Manager

Goal: Make it easier to support multiple styles in your app (e.g light and dark theme).

-- Contributions are welcome!

## Install

```sh
$ npm i -S react-themable
```

### Features
 - [x] `React` and `React Native` support
 - [x] Change component theme using `theme` prop
 - [x] Get theme from parent components using `theme` context
 - [x] Support global variables per theme (e.g. `$backgroundColor`)
 - [ ] Use cache (memoize) to prevent unneed style recreation


### Example

![Screenshot from example](https://raw.githubusercontent.com/brunolemos/react-themable/master/example.png)

You can copy and paste both files below for a fully working example:

`App.js`
```js
import React, { Component } from 'react';
import { AppRegistry, View } from 'react-native';
import ThemeManager, { themable } from 'react-themable';

import Button from './src/components/Button';

// tip: import theme variables from different files (e.g. ./themes/dark.theme.js)
const globalThemeVariables = { fontSize: 20 };
const darkThemeVariables = { backgroundColor: '#333333', color: '#666666' };
const lightThemeVariables = { backgroundColor: '#eeeeee', color: '#111111' };

// configure variables (optional, but makes life easier)
// if I dont pass a theme, styles will be applied globally.
// you can also specify the themes as an array at the first argument (e.g. ['dark', 'light'])
ThemeManager.addVariables(globalThemeVariables);
ThemeManager.addVariables('dark', darkThemeVariables);
ThemeManager.addVariables('light', lightThemeVariables);

const ThemableView = themable(View);

export default App = () => (
  <ThemableView style={{ flex: 1, paddingTop: 22 }} theme='blue'>
    <Button>Blue (getting from context)</Button>
    <Button theme='dark'>Dark</Button>
    <Button theme='light'>Light</Button>
  </ThemableView>
);

AppRegistry.registerComponent('App', () => App);
```

`src/Button.js`
```js
import React, { Component } from 'react';
import { Text, View } from 'react-native';
import ThemeManager from 'react-themable';

const Button = (props, context) => {
  // if you are not using a pure funciton,
  // you access the theme via this.context.theme
  themeManager.setTheme(context.theme);
  const { styles } = themeManager;

  return (
    <View style={styles.view}>
      <Text style={styles.text}>{props.children}</Text>
    </View>
  );
}

const themeManager = new ThemeManager();

// simple mode -- styles applied only on blue theme
themeManager.create('blue', {
  text: { color: '#5685ee' },
});

// if I dont pass a theme, styles will be applied globally.
// variables will still get the correspondent theme value.
// you can also specify the themes as an array at the first argument (e.g. ['dark', 'light'])
themeManager.create({
  view: { height: 100, backgroundColor: '$backgroundColor' },
  text: { fontSize: '$fontSize', textAlign: 'center', marginTop: 40, color: '$textColor'}
});

export default themeManager.attach(Button);
```



#### Developer
- Full Stack Developer (Node.js, GraphQL, React, React Native)
- Twitter: [@brunolemos](https://twitter.com/brunolemos)

#### License
- MIT
