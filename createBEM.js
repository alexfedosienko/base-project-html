'use strict';

const fs = require('fs-extra');
const config = require('./config.json');
const blockName = process.argv[2];
const action = process.argv[3];

const blockFiles = [
  "html",
  "scss",
  "js"
];

if (blockName !== undefined) {
  let blockDirectory = config.dirs.blocks + blockName;
  if (action === "remove") {
    if (fs.existsSync(blockDirectory)) {
      console.log(`[BPH] Удаляю директорию с БЭМ блоком '${blockDirectory}'`);
      fs.remove(blockDirectory);
      let newConfig = config;
      newConfig.blocks = config.blocks.filter((item) => {
        if (item !== blockName) return blockName;
      });
      newConfig = JSON.stringify(config, '', 2);
      fs.writeFileSync('./config.json', newConfig);
      console.log(`[BPH] Удаляю подключение БЭМ блока в файл конфигурации config.json`);
    } else console.log(`[BPH] Директория БЭМ блока не найдена '${blockDirectory}'`);
  } else {
    let isExistBlock = false;
    config.blocks.forEach(item => {
      if (item === blockName) isExistBlock = true;
    });
    if (!fs.existsSync(blockDirectory)) {
      if (!isExistBlock) {
        console.log(`[BPH] Создаю директорию для БЭМ блока '${blockDirectory}'`);
        fs.mkdirSync(blockDirectory);
        blockFiles.forEach(extension => {
          let fileName = `${blockDirectory}/${blockName}.${extension}`;
          if (!fs.existsSync(fileName)) {
            console.log(`[BPH] Создаю файл '${fileName}'`);
            let fileContent = "";
            if (extension === "scss")
              fileContent = `// В этом файле должны быть стили для БЭМ-блока ${blockName}, его элементов,\n// модификаторов, псевдоселекторов, псевдоэлементов, @media-условий...\n\n.${blockName} {\n\n  $block-name: &; // #{$block-name}__element\n\n}\n`;
            else if (extension === "html")
              fileContent = `<!--DEV\n\nДля использования этого файла как шаблона:\n\n@ @include('blocks/${blockName}/${blockName}.html')\n\n(Нужно убрать пробел между символами @)\nПодробнее: https://www.npmjs.com/package/gulp-file-include\n\n<div class="${blockName}">content</div>\n\n-->\n`;
            else if (extension === "js")
              fileContent = `'use strict';\n// document.addEventListener(\'DOMContentLoaded\', function(){});\n// (function(){\n// код\n// }());\n`;
            fs.writeFile(fileName, fileContent, (err) => {
              if (err) return console.log(`[BPH] Ошибка! Файл НЕ создан: ${err}!`);
              console.log(`[BPH] Файл создан: ${fileName}`);
            });
          } else console.log(`[BPH] Ошибка! Файл '${fileName}' уже существует`);
        });
        config.blocks.push(blockName);
        const newConfig = JSON.stringify(config, '', 2);
        fs.writeFileSync('./config.json', newConfig);
        console.log(`[BPH] Добавляю подключение БЭМ блока в файл конфигурации config.json`);
      } else console.log(`[BPH] Ошибка! В файле конфигурации уже есть БЭМ блок с таким названием!`);
    } else console.log(`[BPH] Ошибка! БЭМ блок уже создан!`);
  }
} else console.log(`[BPH] Ошибка! Введите название БЭМ блока!`);
