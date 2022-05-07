import fs from 'fs';
import gcc from 'google-closure-compiler';
const { compiler: Compiler } = gcc;

// eslint-disable-next-line no-script-url
const bookmarkletPrefix = 'javascript:';

const compileByProjectId = projectId => {
  const compiler = new Compiler({
    js: `src/projects/${projectId}/index.js`,
    compilation_level: 'SIMPLE',
    language_in: 'ECMASCRIPT_NEXT',
    language_out: 'ECMASCRIPT_NEXT'
  });

  compiler.run((_code, compiled) => {
    const body = bookmarkletPrefix + compiled.replace(/\n/g, '');
    fs.writeFileSync(`dist/${projectId}.txt`, body, { encoding: 'utf8' });
  });
};

fs.readdir('./src/projects', (_err, projectIds) => {
  console.log('target projects:', projectIds);
  projectIds.forEach(compileByProjectId);
  console.log('done!');
});
