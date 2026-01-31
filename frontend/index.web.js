import { AppRegistry } from 'react-native';
import App from './src/web/App.web';

// Register the app
AppRegistry.registerComponent('YourApp', () => App);

// Run the app
AppRegistry.runApplication('YourApp', {
  rootTag: document.getElementById('root'),
});
