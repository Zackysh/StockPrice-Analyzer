/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */

module.exports = {
  collectCoverage: true,
  modulePaths: ['<rootDir>'],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '\\\\node_modules\\\\',
    './src/utils/*',
    './src/exceptions/HttpException.ts',
    './src/db.ts',
    './dist/*',
  ],
  coverageProvider: 'v8',
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '@/(.*)': ['<rootDir>/src/$1'],
  },
  preset: 'ts-jest',
};
