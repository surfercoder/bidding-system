import '@testing-library/jest-dom';

// Add TextEncoder and Response polyfills
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    ok: boolean;
    status: number;
    statusText: string;
    headers: Headers;
    body: any;

    constructor(body?: any, init?: ResponseInit) {
      this.ok = init?.status ? init.status >= 200 && init.status < 300 : true;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || '';
      this.headers = new Headers(init?.headers);
      this.body = body;
    }

    async json() {
      return Promise.resolve(this.body);
    }
  };
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