const fs = require('fs');
const util = require('util');

const readdir = util.promisify(fs.readdir);
const readfile = util.promisify(fs.readFile);

// eslint-disable-next-line
async function findDataFiles() {
  const components = await processDirectory('./', 'data');
  console.log(components);
  const content = await readfile(
    `${components[0].path}/${components[0].name}`,
    'utf8'
  );
  const obj = JSON.parse(content);
  console.log(obj);
}

async function processDirectory(parentPath, nextDirectory) {
  const currentPath = `${parentPath}${nextDirectory}/`;
  const components = [];
  const directory = await readdir(`${currentPath}`, { withFileTypes: true });
  for (let i = 0; i < directory.length; i += 1) {
    const file = directory[i];
    if (file.isFile()) {
      components.push({
        name: file.name,
        path: currentPath
      });
    } else if (file.isDirectory()) {
      // eslint-disable-next-line
      const subComponents = await processDirectory(currentPath, file.name);
      components.push(...subComponents);
    }
  }
  return components;
}
