import fs from 'fs';
import path from 'path';
import dayjs from '../../shared/utils/dayjs';

const SEEDERS_DIR = path.join(process.cwd(), './drizzle/seeders');

// MODIFICADO: Ahora recibe folder y name como parámetros separados
export async function generateSeeder(folder: string, name: string) {
  try {
    // Crear directorio base si no existe
    if (!fs.existsSync(SEEDERS_DIR)) {
      fs.mkdirSync(SEEDERS_DIR, { recursive: true });
    }

    // Ruta de la carpeta del seeder
    const folderPath = path.join(SEEDERS_DIR, folder);

    // Crear carpeta si no existe
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`📁 Carpeta creada: ${folder}`);
    } else {
      console.log(`📂 Carpeta existente: ${folder}`);
    }

    // Generar timestamp
    const timestamp = dayjs().format('YYYY-MM-DD-HHmmss');
    const fileName = `${timestamp}-${name.toLowerCase().replace(/\s+/g, '-')}.ts`;
    const filePath = path.join(folderPath, fileName);

    // Template del seeder
    const template = `import { db } from '../../../src/core/database';
import { sql } from 'drizzle-orm';

export async function seed() {
  try {
    console.log('🌱 Running seeder: ${name}');
    
    // Tu código de seeder aquí
    // Ejemplo:
    // await db.insert(model).values([
    //   { name: 'John Doe', email: 'john@example.com' },
    //   { name: 'Jane Doe', email: 'jane@example.com' },
    // ]);

    console.log('✅ Seeder ${name} completed successfully!');
  } catch (error) {
    console.error('❌ Error in seeder ${name}:', error);
    throw error;
  }
}

export async function unseed() {
  try {
    console.log('🔄 Reverting seeder: ${name}');
    
    // Tu código para revertir aquí
    // Ejemplo:
    // await db.delete(model);

    console.log('✅ Seeder ${name} reverted successfully!');
  } catch (error) {
    console.error('❌ Error reverting seeder ${name}:', error);
    throw error;
  }
}`;

    fs.writeFileSync(filePath, template);
    console.log(`✅ Seeder creado: ${folder}/${fileName}`);
  } catch (error) {
    console.error('❌ Error generando seeder:', error);
    process.exit(1);
  }
}

// ELIMINA la función parseArguments y el if(require.main === module)
// porque ahora commander maneja los argumentos
