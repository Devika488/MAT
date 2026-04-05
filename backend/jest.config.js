/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  setupFilesAfterEnv: [
    '<rootDir>/src/tests/setup.ts' 
  ],
  moduleNameMapper: {
    '^(\\.\\.?\\/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      { useESM: true }
    ]
  },
  testMatch: [
    '<rootDir>/src/tests/**/*.test.ts'
  ]
};