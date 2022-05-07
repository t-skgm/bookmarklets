import fs from 'fs';
import gcc from 'google-closure-compiler';
const { compiler: Compiler } = gcc;

// eslint-disable-next-line no-script-url
const bookmarkletPrefix = 'javascript:';

const configs = {
  htmlPath: './docs/index.html',
  distDir: './docs/',
  projectsDir: './src/projects/'
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

fs.readdir(configs.projectsDir, (_err, projectIds) => {
  console.log('target projects:', projectIds);

  Promise.all(
    projectIds.map(async id => {
      const compiled = await compile(id);

      // save each script text
      fs.writeFileSync(`${configs.distDir}${id}.txt`, compiled, { encoding: 'utf8' });

      return { id, compiled };
    })
  ).then(scripts => {
    const markletsHtml = `<html>
<head><title>march-am Bookmarklets</title></head>
<body>
<h1>march-am Bookmarklets</h1>
<p>使いたいBookmarkletをブックマークバーにドラッグ</p>
<ul>
${scripts.map(script => `<li><a href="${encodeURI(script.compiled)}">${script.id}</a></li>`)}
</ul>
</body>
</html>`;
    fs.writeFileSync(configs.htmlPath, markletsHtml, { encoding: 'utf8' });

    console.log('done!', scripts);
  });
});
