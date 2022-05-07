(() => {
  // get object value by path
  const get = (value, path) => path.split('.').reduce((acc, v) => (acc = acc && acc[v]), value);
  // content をテキストファイルとしてダウンロードさせる
  const downloadTextFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plan' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  // Album description //

  const ldStr = document.querySelector('script[type="application/ld+json"]').textContent;
  const ld = JSON.parse(ldStr);

  const tracks = ld.track.itemListElement.map(el => `${el.position}. ${el.item.name}`);

  const d = {
    artist: ld.byArtist.name,
    title: ld.name,
    url: ld['@id'],
    trackList: tracks.join('\n'),
    description: ld.description,
    credits: ld.creditText,
    published: ld.datePublished,
    lisence: ld.copyrightNotice,
    tags: ld.keywords.join(', ')
  };

  // prettier-ignore
  const albumBody =
    d.artist + '\n' +
    d.title + '\n' +
    d.url + '\n\n' +
    '<Track list>\n' +
    d.trackList + '\n' +
    '\n' +
    '<Description>\n' +
    d.description  + '\n' +
    '\n' +
    '<Credits>\n' +
    d.credits  + '\n' +
    '\n' +
    '<Published>\n' +
    d.published  + '\n' +
    '\n' +
    '<Lisence>\n' +
    d.lisence  + '\n' +
    '\n' +
    '<Tags>\n' +
    d.tags;

  downloadTextFile(albumBody, `${d.artist} - ${d.title}.txt`);

  // Track description //

  const lyricsList = ld.track.itemListElement.map(el => ({
    id: el.item['@id'],
    title: `${el.position}. ${el.item.name}`,
    lyrics: get(el, 'item.recordingOf.lyrics.text')
  }));
  const trackInfoList = document.querySelectorAll('.info_link');
  const urlsToSongsThatHasInfo = Array.from(trackInfoList)
    .filter(info => info.textContent.includes('info'))
    .map(info => `${location.origin}${info.querySelector('a').getAttribute('href')}`);
  const hasLyricsOrInfo = lyricsList.every(i => i.lyrics !== undefined) || urlsToSongsThatHasInfo.length !== 0;

  if (hasLyricsOrInfo) {
    const trackTexts = lyricsList.map(i => i.title + '\n\n' + (i.lyrics ?? '(none)')).join('\n\n');
    const tracksBody = d.artist + ' - ' + d.title + '\n\n' + trackTexts;

    downloadTextFile(tracksBody, `${d.artist} - ${d.title} Tracks.txt`);
  }
})();
