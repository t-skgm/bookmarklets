import { jest } from '@jest/globals';

class MockBlob {
  constructor(blobParts, options) {
    /** @type {BlobPart[] | undefined} */
    this.blobParts = blobParts;
    /** @type {BlobPropertyBag | undefined} */
    this.options = options;
  }
}

class MockURL {
  static createObjectURL() {
    return 'mocked createObjectURL';
  }
}

global.alert = jest.fn();
global.Blob = MockBlob;
global.URL = MockURL;

global.location = {
  origin: 'https://example.com',
  host: 'example.com'
};
