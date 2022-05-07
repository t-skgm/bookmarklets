/**
 * BandcampのDescriptionをテキストファイルとして保存する
 */
(async () => {
  // get object value by path
  const get = (value, path, defaultValue) =>
    path.split('.').reduce((acc, v) => (acc = acc && acc[v]), value) ?? defaultValue;
  // content をテキストファイルとしてダウンロードさせる
  const downloadTextFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plan' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };
  const domparser = new DOMParser();
  const fetchJsonLd = async url => {
    const htmlStr = await fetch(url).then(h => h.text());
    const doc = domparser.parseFromString(htmlStr, 'text/html');
    const trackldStr = doc.querySelector('script[type="application/ld+json"]').textContent;
    return JSON.parse(trackldStr);
  };

  try {
    console.log('[marklet] script starts');
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
    d.url + '\n' +
    '\n' +
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
      url: el.item['@id'],
      title: `${el.position}. ${el.item.name}`,
      lyrics: get(el, 'item.recordingOf.lyrics.text')
    }));
    const trackInfoList = document.querySelectorAll('.info_link');
    const urlsToSongsThatHasInfo = Array.from(trackInfoList)
      .filter(info => info.textContent.includes('info'))
      .map(info => `${location.origin}${info.querySelector('a').getAttribute('href')}`);

    const hasLyricsOrInfo = lyricsList.some(i => i.lyrics !== undefined) || urlsToSongsThatHasInfo.length !== 0;
    if (hasLyricsOrInfo) {
      console.log("[marklet] this album has some track info. let's download it");
      const trackTexts = await Promise.all(
        lyricsList.map(async i => {
          let text = i.title + '\n';

          // Infoがある曲
          if (urlsToSongsThatHasInfo.includes(i.url)) {
            const trackLd = await fetchJsonLd(i.url);
            const info = trackLd.description;
            const credit = trackLd.creditText;
            if (info) text += '<Description>\n' + info + '\n';
            if (credit) text += '<Credit>\n' + credit + '\n';
          }

          if (i.lyrics) text += '<Lyrics>\n' + i.lyrics;

          return text;
        })
      );

      const tracksBody = d.artist + ' - ' + d.title + '\n\n' + trackTexts.join('\n\n');

      downloadTextFile(tracksBody, `${d.artist} - ${d.title} Tracks.txt`);
    }

    console.log('[marklet] script finished!');
  } catch (e) {
    alert('[marklet] Error!', e.message);
  }
})();
