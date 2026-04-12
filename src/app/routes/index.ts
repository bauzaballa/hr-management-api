import { Router } from 'express';

import fs from 'node:fs';
import path from 'node:path';

const basename = path.basename(__filename);

const componentsPath = path.join(__dirname, '../components');
const directories = fs.readdirSync(componentsPath);

const routes: Router[] = [];

directories.forEach((directory) => {
  const dirPath = path.join(componentsPath, directory);

  if (!fs.statSync(dirPath).isDirectory()) return;

  const files = fs
    .readdirSync(dirPath)
    .filter(
      (file) =>
        file.indexOf('.') !== 0 &&
        file !== basename &&
        (file.endsWith('.routes.js') || file.endsWith('.routes.ts'))
    );

  files.forEach((file) => {
    const routePath = path.join(dirPath, file);
    const routeModule = require(routePath);

    const route = routeModule.default || routeModule;

    routes.push(route);
  });
});

export default routes;
