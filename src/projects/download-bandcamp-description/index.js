/**
 * BandcampのDescriptionをテキストファイルとして保存する
 */
(async () => {
  // get object value by path
  const get = (value, path, defaultValue) =>
    path.split('.').reduce((acc, v) => (acc = acc && acc[v]), value) ?? defaultValue;

  const parseDate = str => new Date(str).toISOString().slice(0, 10);

  // content をテキストファイルとしてダウンロードさせる
  const downloadTextFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
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

    // Validate if bandcamp page
    const metaContent = document.querySelector('meta[name="generator"]')?.content;
    if (metaContent !== 'Bandcamp') {
      alert('Download failed: this page is not generated by Bandcamp');
      return;
    }

    // Album description //

    const buildPublisherText = pb => {
      let _t = `[name]\n${pb.name}`;

      if (pb.foundingLocation) {
        // prettier-ignore
        _t = _t + '\n\n' +
          '[location]\n' +
          `${pb.foundingLocation.name}`;
      }

      if (pb.description) {
        // prettier-ignore
        _t = _t + '\n\n' +
          '[description]\n' +
          pb.description;
      }

      if (pb.mainEntityOfPage) {
        // prettier-ignore
        _t = _t + '\n\n' +
          '[website]\n' +
          pb.mainEntityOfPage.map(p => `* ${p.name} (${p.url})\n`);
      }

      return _t;
    };

    const ldStr = document.querySelector('script[type="application/ld+json"]').textContent;
    const ld = JSON.parse(ldStr);

    const isAlbum = ld.albumReleaseType != null;

    if (isAlbum) {
      const tracks = ld.track.itemListElement.map(el => `${el.position}. ${el.item.name}`);

      const d = {
        artist: ld.byArtist.name,
        title: ld.name,
        url: ld['@id'],
        trackList: tracks.join('\n') ?? '-',
        description: ld.description ?? '-',
        credits: ld.creditText ?? '-',
        published: parseDate(ld.datePublished),
        lisence: ld.copyrightNotice ?? '-',
        tags: ld.keywords ? ld.keywords.join(', ') ?? '-' : '-',
        publisherText: buildPublisherText(ld.publisher)
      };

      const inpageLyrics = Array.from(document.querySelectorAll('.lyricsRow')).map(row => {
        const tr = Number(row.id.replace('lyrics_row_', ''));
        const ly = row.textContent.trim();
        return `${tracks[tr - 1]}\n${ly}`;
      });

      // prettier-ignore
      let albumBody =
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
        d.tags +  '\n' +
        '\n' +
        '<Publisher>' + '\n' +
        d.publisherText;

      const hasLyrics = document.querySelector('.lyricsRow') != null;
      if (hasLyrics) {
        albumBody += '\n\n' + '<Lyrics (In-page)>\n' + inpageLyrics.join('\n\n');
      }

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
    } /** Single */ else {
      const d = {
        artist: ld.byArtist.name,
        title: ld.name,
        url: ld['@id'],
        description: ld.description ?? '-',
        credits: ld.creditText ?? '-',
        published: parseDate(ld.datePublished),
        lisence: ld.copyrightNotice ?? '-',
        publisherText: buildPublisherText(ld.publisher)
      };

      const lyricsText = document.querySelector('.lyricsText').textContent;

      // prettier-ignore
      let textBody =
        d.artist +
        '\n' +
        d.title +
        '\n' +
        d.url +
        '\n' +
        '\n' +
        '<Description>\n' +
        d.description +
        '\n' +
        '\n' +
        '<Credits>\n' +
        d.credits +
        '\n' +
        '\n';

      if (lyricsText != null) {
        const cleanedLyricsText = lyricsText
          .split('\n')
          .map(l => l.trim())
          .join('\n');
        textBody += '<Lyrics>\n' + cleanedLyricsText + '\n\n';
      }

      textBody +=
        '<Published>\n' +
        d.published +
        '\n' +
        '\n' +
        '<Lisence>\n' +
        d.lisence +
        '\n' +
        '\n' +
        '<Publisher>' +
        '\n' +
        d.publisherText;

      downloadTextFile(textBody, `${d.artist} - ${d.title}.txt`);
    }

    console.log('[marklet] script finished!');
  } catch (e) {
    alert('[marklet] Error!', e.message);
  }
})();
