/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  moduleNameMapper: {
    '^@models/(.*)$': '<rootDir>/src/app/models/$1',
    '^@services/(.*)$': '<rootDir>/src/app/services/$1',
    '^@environments/(.*)$': '<rootDir>/src/environments/$1',
    '^@constants$': '<rootDir>/src/app/constants.ts',
    '^@guards/(.*)$': '<rootDir>/src/app/guards/$1',
    '^@components/(.*)$': '<rootDir>/src/app/components/$1',
    '^@directives/(.*)$': '<rootDir>/src/app/directives/$1',
  },
};
