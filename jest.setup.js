/**
 * Jest setup for React Native component/hook tests
 * 
 * This file runs before each test file in the 'components' project.
 * The jest-expo preset handles most React Native mocking automatically.
 */

// Import built-in matchers from @testing-library/react-native v12.4+
// See: https://callstack.github.io/react-native-testing-library/docs/migration/jest-matchers
import '@testing-library/react-native/matchers';

// Extend Jest's expect with the custom matchers
expect.extend(require('@testing-library/react-native/matchers'));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
