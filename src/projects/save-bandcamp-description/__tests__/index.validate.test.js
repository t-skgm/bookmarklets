import { jest } from '@jest/globals';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { resolve } from 'path';
// import { setTimeout } from 'timers/promises';
import { buildHtmlWithJsonLd, getDirname, mockedFetchFn } from '../../../../test/utils';

const readStubHtml = filename =>
  readFileSync(resolve(getDirname(import.meta.url), './__stub__/', filename), {
    encoding: 'utf8'
  });

describe('save-bandcamp-description', () => {
  describe('With invalil html (which has no generator=Bandcamp meta tag)', () => {
    const notBandcampHtml = readStubHtml('not_bandcamp_page.html');

    /** @type {JSDOM} */
    let dom;
    /** @type {Window} */
    let window;
    /** @type {Document} */
    let document;

    beforeAll(() => {
      // init window/document with jsdom
      dom = new JSDOM(notBandcampHtml);
      global.document = document = dom.window.document;
      global.window = window = dom.window;
      global.DOMParser = dom.window.DOMParser;

      // mock fetch
      global.fetch = jest.fn(mockedFetchFn(buildHtmlWithJsonLd));
    });

    describe('test', () => {
      let linkClickSpy;
      let logErrorSpy;

      beforeAll(async () => {
        // set spy fn
        linkClickSpy = jest.spyOn(window.HTMLElement.prototype, 'click');
        logErrorSpy = jest.spyOn(console, 'error');
        // execute script
        await import('../index');
      });

      test('not called download', () => {
        expect(linkClickSpy).not.toBeCalled();
      });

      test('alert shown', () => {
        expect(global.alert).toBeCalledWith('Download failed: this page is not generated by Bandcamp');
      });
    });
  });
});
