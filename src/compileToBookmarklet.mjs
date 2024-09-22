import fs from 'fs/promises';
import gcc from 'google-closure-compiler';
const { compiler: Compiler } = gcc;

// eslint-disable-next-line no-script-url
const bookmarkletPrefix = 'javascript:';

const configs = {
  htmlPath: './docs/index.html',
  distDir: './docs/',
  projectsDir: './src/projects/'
};

const toScriptHtmlStr = scripts => `<html>
<head><title>Bookmarklets</title></head>
<body>
<h1>Bookmarklets</h1>
<p>使いたいBookmarkletをブックマークバーにドラッグ</p>
<ul>
${scripts.map(
  script => `  <li>
    <a href="${encodeURI(script.compiled)}">
      ${kebabToNormal(script.id)}
    </a>
  </li>`
)}
</ul>
</body>
</html>
`;

const kebabToNormal = str => {
  const spaced = str.split('-').join(' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

const compile = async projectId => {
  const compiler = new Compiler({
    js: `${configs.projectsDir}${projectId}/index.js`,
    compilation_level: 'SIMPLE',
    language_in: 'ECMASCRIPT_NEXT',
    language_out: 'ECMASCRIPT_NEXT'
  });

  return new Promise((resolve, reject) => {
    compiler.run((_exitCode, compiled, err) => {
      if (err) return reject(err);
      const body = bookmarkletPrefix + compiled.replace(/\n/g, '');
      return resolve(body);
    });
  });
};

const main = async () => {
  const projectIds = await fs.readdir(configs.projectsDir);
  console.log('target projects:', projectIds);

  const scripts = await Promise.all(
    projectIds.map(async id => {
      const compiled = await compile(id);

      // save each script text
      await fs.writeFile(`${configs.distDir}${id}.txt`, compiled, { encoding: 'utf8' });

      return { id, compiled };
    })
  );

  const htmlStr = toScriptHtmlStr(scripts);
  await fs.writeFile(configs.htmlPath, htmlStr, { encoding: 'utf8' });

  console.log('done!', scripts);
};

main().catch(console.error);
