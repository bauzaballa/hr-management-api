#!/usr/bin/env node

import { Command } from 'commander';
import { runSeeders } from './run';
import { undoSeeders } from './undo';
import { generateSeeder } from './generate';

const program = new Command();

program.version('1.0.0').description('CLI para manejar seeders de Drizzle ORM');

// Comando generate - MODIFICADO para aceptar 2 argumentos
program
  .command('generate <folder> <name>')
  .description('Genera un nuevo archivo seeder en una carpeta específica')
  .action(generateSeeder);

// Comando run - versión compatible
program
  .command('run')
  .description('Ejecuta todos los seeders pendientes')
  .option('-s, --specific <name>', 'Ejecutar un seeder específico')
  .action(runSeeders);

// Comando undo - versión compatible
program
  .command('undo')
  .description('Revierte los seeders ejecutados')
  .option('-s, --specific <name>', 'Revertir un seeder específico')
  .action(undoSeeders);

program.parse(process.argv);
