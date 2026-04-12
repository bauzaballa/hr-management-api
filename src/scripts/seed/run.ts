import fs from 'fs';
import path from 'path';
import { sql } from 'drizzle-orm';
import { db } from '../../core/database';
import { seedersLog } from '../../app/entities';

const SEEDERS_DIR = path.join(process.cwd(), './drizzle/seeders');

interface RunOptions {
  specific?: string;
}

export async function runSeeders(options: RunOptions) {
  try {
    console.log('🌱 Starting seeders...');

    // Obtener todos los archivos de seeders recursivamente
    const files = getAllSeederFiles(SEEDERS_DIR).sort();

    // Si no hay archivos
    if (files.length === 0) {
      console.log('📭 No se encontraron seeders');
      return;
    }

    console.log(`📁 Encontrados ${files.length} seeders`);

    // Si se especifica un seeder específico
    if (options.specific) {
      const specificFile = files.find(
        (file) =>
          file.relativePath.includes(options.specific!) ||
          file.fileName.replace(/^\d+-|\.ts$/g, '') === options.specific
      );

      if (!specificFile) {
        throw new Error(`Seeder "${options.specific}" no encontrado`);
      }

      await runSingleSeeder(specificFile);
      return;
    }

    // Ejecutar todos los seeders
    for (const file of files) {
      await runSingleSeeder(file);
    }

    console.log('✅ All seeders completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running seeders:', error);
    process.exit(1);
  }
}

// Función para obtener todos los archivos de seeders recursivamente
function getAllSeederFiles(
  dir: string,
  baseDir: string = SEEDERS_DIR
): Array<{ fileName: string; relativePath: string; fullPath: string }> {
  const files: Array<{ fileName: string; relativePath: string; fullPath: string }> = [];

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relativePath = path.relative(baseDir, fullPath);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Si es directorio, buscar recursivamente
      files.push(...getAllSeederFiles(fullPath, baseDir));
    } else if (stat.isFile() && item.endsWith('.ts') && !item.endsWith('.d.ts')) {
      // Si es archivo TypeScript válido
      files.push({
        fileName: item,
        relativePath: relativePath,
        fullPath: fullPath,
      });
    }
  }

  return files;
}

// Función para convertir rutas de Windows a URLs file:// válidas
function pathToFileURL(filePath: string): string {
  let pathName = path.resolve(filePath).replace(/\\/g, '/');

  // En Windows, agregar el slash inicial si no existe
  if (pathName[0] !== '/') {
    pathName = '/' + pathName;
  }

  return 'file://' + encodeURI(pathName);
}

async function runSingleSeeder(fileInfo: {
  fileName: string;
  relativePath: string;
  fullPath: string;
}) {
  try {
    // Convertir la ruta a URL file:// válida para Windows
    const fileUrl = pathToFileURL(fileInfo.fullPath);

    const seeder = await import(fileUrl);

    // Verificar si ya fue ejecutado (usamos relativePath como identificador único)
    const [existing] = await db
      .select()
      .from(seedersLog)
      .where(sql`${seedersLog.name} = ${fileInfo.relativePath}`);

    if (existing) {
      console.log(`⏭️  Seeder already executed: ${fileInfo.relativePath}`);
      return;
    }

    // Ejecutar seeder
    await seeder.seed();

    // Registrar en log
    await db.insert(seedersLog).values({
      name: fileInfo.relativePath,
      executedAt: new Date(),
    });

    console.log(`✅ Executed: ${fileInfo.relativePath}`);
  } catch (error) {
    console.error(`❌ Error executing seeder ${fileInfo.relativePath}:`, error);
    throw error;
  }
}
