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
  describe('Album page C (with in-page lyrics)', () => {
    const albumHtmlC = readStubHtml('bandcamp_album_c.html');

    /** @type {JSDOM} */
    let dom;
    /** @type {Window} */
    let window;
    /** @type {Document} */
    let document;

    beforeAll(() => {
      // init window/document with jsdom
      dom = new JSDOM(albumHtmlC);
      global.document = document = dom.window.document;
      global.window = window = dom.window;
      global.DOMParser = dom.window.DOMParser;

      // mock fetch
      global.fetch = jest.fn(mockedFetchFn(buildHtmlWithJsonLd));
    });

    test('test jsdom mocking', async () => {
      const documentTitle = document.querySelector('title').textContent;
      expect(documentTitle).toMatchInlineSnapshot(`"Mémorial | Erevan"`);
    });

    describe('execute script', () => {
      let linkClickSpy;
      let createObjectURLSpy;

      beforeAll(async () => {
        // set spy fn
        linkClickSpy = jest.spyOn(window.HTMLElement.prototype, 'click');
        createObjectURLSpy = jest.spyOn(global.URL, 'createObjectURL');

        // execute script
        await import('../index');
      });

      test('alert never to be called', () => {
        expect(global.alert).not.toBeCalled();
      });

      test('download file (click link) has fired 2 times (album info and track info)', () => {
        expect(linkClickSpy).toBeCalledTimes(2);
      });

      test('generated album info text', () => {
        const textData = createObjectURLSpy.mock.calls[0][0].blobParts[0];

        expect(textData).toMatchSnapshot();
      });

      test('generated track info text', () => {
        const textData = createObjectURLSpy.mock.calls[1][0].blobParts[0];

        expect(textData).toMatchSnapshot();
      });
    });
  });
});
