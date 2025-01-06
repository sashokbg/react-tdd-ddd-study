/** @type {import('ts-jest').JestConfigWithTsJest} **/
const config = {
  roots: ['<rootDir>'],
  testEnvironment: 'node',
  transform: {
    '^.+.tsx?$': ['ts-jest', {
      isolatedModules: true,
    }],
  },
  preset: 'ts-jest',
  moduleNameMapper: {
    '@/model/(.*)': '<rootDir>/src/model/$1',
  },
  globals: {
  },
};

export default config;
