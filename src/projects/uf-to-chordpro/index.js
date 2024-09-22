/**
 * UF to ChordPro
 */
(() => {
  const chordElm = document.querySelector('#my-chord-data');

  const rows = chordElm?.querySelectorAll('.chord-row') ?? [];

  const rowTexts = Array.from(rows).map(row => {
    const sections = row.querySelectorAll('.chord');

    const sectionTexts = Array.from(sections).map(section => {
      const sectionChord = section.querySelector('ruby > rt')?.textContent ?? '';
      const sectionLyrics = section.querySelectorAll('& > span')?.[1]?.textContent ?? '';
      const sectionText = `[${sectionChord}]${sectionLyrics}`;
      return sectionText;
    });

    const rowText = sectionTexts.join(' ');
    return rowText;
  });

  const chordText = rowTexts.join('\n');

  // wait until the document is focused
  // https://blog.hog.as/entry/2021/09/30/021450
  setTimeout(() => {
    navigator.clipboard
      .writeText(chordText, 500)
      .then(() => {
        alert('Chord data copied to clipboard!');
      })
      .catch(err => {
        alert('Failed to copy chord data to clipboard:', err);
      });
  });
})();
