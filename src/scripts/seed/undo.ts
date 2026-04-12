import fs from 'fs';
import path from 'path';
import { sql } from 'drizzle-orm';
import { db } from '../../core/database';
import { seedersLog } from '../../app/entities';

const SEEDERS_DIR = path.join(process.cwd(), './drizzle/seeders');

interface UndoOptions {
  specific?: string;
}

export async function undoSeeders(options: UndoOptions) {
  try {
    console.log('🔄 Reverting seeders...');

    // Obtener seeders ejecutados
    const executedSeeders = await db
      .select()
      .from(seedersLog)
      .orderBy(sql`${seedersLog.executedAt} DESC`);

    if (executedSeeders.length === 0) {
      console.log('📭 No hay seeders ejecutados para revertir');
      return;
    }

    console.log(`📁 Encontrados ${executedSeeders.length} seeders ejecutados`);

    // Si se especifica un seeder específico
    if (options.specific) {
      const specificSeeder = executedSeeders.find(
        (seeder) =>
          seeder.name.includes(options.specific!) ||
          seeder.name.replace(/^\d+-|\.ts$/g, '') === options.specific
      );

      if (!specificSeeder) {
        throw new Error(`Seeder ejecutado "${options.specific}" no encontrado`);
      }

      await undoSingleSeeder(specificSeeder.name);
      return;
    }

    // Revertir todos los seeders (en orden inverso)
    for (const seeder of executedSeeders) {
      await undoSingleSeeder(seeder.name);
    }

    console.log('✅ All seeders reverted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error reverting seeders:', error);
    process.exit(1);
  }
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

async function undoSingleSeeder(relativePath: string) {
  const filePath = path.join(SEEDERS_DIR, relativePath);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Seeder file not found: ${relativePath}`);

    // Eliminar el registro aunque no exista el archivo
    console.log(`🗑️  Eliminando registro de seeder no encontrado: ${relativePath}`);
    await db.delete(seedersLog).where(sql`${seedersLog.name} = ${relativePath}`);
    return;
  }

  try {
    // Convertir la ruta a URL file:// válida para Windows
    const fileUrl = pathToFileURL(filePath);
    const seeder = await import(fileUrl);

    // Ejecutar unseed
    if (seeder.unseed) {
      await seeder.unseed();
    } else {
      console.log(`⚠️  Función unseed no encontrada en: ${relativePath}`);
    }

    // Eliminar del log
    await db.delete(seedersLog).where(sql`${seedersLog.name} = ${relativePath}`);

    console.log(`✅ Reverted: ${relativePath}`);
  } catch (error) {
    console.error(`❌ Error reverting seeder ${relativePath}:`, error);
    throw error;
  }
}
