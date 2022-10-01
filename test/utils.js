import { URL } from 'url';

export const getDirname = importMetaUrl => new URL('.', importMetaUrl).pathname;

export const mockedFetchFn = async htmlBody => ({
  async text() {
    return htmlBody;
  }
});

export const buildHtmlWithJsonLd = `
<html>
<head>
<script type="application/ld+json">
{ someJsonLdProperties: 'is here' }
</script>
</head>
</html>
`;
