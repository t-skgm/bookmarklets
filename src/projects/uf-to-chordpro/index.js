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

  copy(chordText);

  alert('Chord data copied to clipboard!');
})();
