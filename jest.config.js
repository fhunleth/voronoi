module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['./test/setupJest.js'],
  testMatch: ['**/test/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  moduleFileExtensions: ['js'],
  testTimeout: 10000, // Increase timeout
  verbose: true
};
