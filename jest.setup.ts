import '@testing-library/jest-dom';

// Add TextEncoder and Response polyfills
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}

import { Response as CrossFetchResponse } from 'cross-fetch';

if (typeof global.Response === 'undefined') {
  // @ts-ignore
  global.Response = CrossFetchResponse;
}


// Mock fetch globally
global.fetch = jest.fn();

beforeAll(() => {
  // Setup any global test environment configurations
});

beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  // Cleanup any global test environment configurations
});