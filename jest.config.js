/**
 * Jest configuration for Music Theory Mobile
 * 
 * Uses Jest projects to support two types of tests:
 * 1. Unit tests - Pure functions (fast, node environment)
 * 2. Component/Hook tests - React Native components (requires RN preset)
 */

const baseConfig = {
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

module.exports = {
  projects: [
    // Unit tests for pure functions (music theory, audio utils, etc.)
    {
      ...baseConfig,
      displayName: 'unit',
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: ['<rootDir>/__tests__'],
      testMatch: [
        '**/__tests__/music-theory/**/*.test.ts',
        '**/__tests__/audio/**/*.test.ts',
      ],
    },
    // Component and hook tests (React Native)
    {
      ...baseConfig,
      displayName: 'components',
      preset: 'jest-expo',
      testEnvironment: 'node',
      roots: ['<rootDir>/__tests__'],
      testMatch: [
        '**/__tests__/components/**/*.test.tsx',
        '**/__tests__/hooks/**/*.test.ts',
        '**/__tests__/hooks/**/*.test.tsx',
      ],
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
  ],
  collectCoverageFrom: [
    'src/lib/music-theory/**/*.ts',
    'src/lib/audio/**/*.ts',
    'src/hooks/**/*.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',           // Console output
    'text-summary',   // Summary in console
    'html',           // HTML report for local viewing
    'json-summary',   // For GitHub Actions summary
    'json',           // Full JSON for detailed analysis
    'lcov',           // For coverage tools integration
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 75,
      lines: 70,
      statements: 70,
    },
  },
};
