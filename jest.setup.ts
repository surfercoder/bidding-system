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


// Polyfill BroadcastChannel for MSW compatibility
if (typeof global.BroadcastChannel === 'undefined') {
  class BroadcastChannel {
    name: string;
    constructor(name: string) { this.name = name; }
    postMessage() {}
    close() {}
    // AddEventListener and removeEventListener are not needed for MSW tests
  }
  // @ts-ignore
  global.BroadcastChannel = BroadcastChannel;
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