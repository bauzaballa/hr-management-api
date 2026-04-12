import { execSync } from 'child_process';

try {
  console.log('Generando migraciones...');
  execSync('npm run db:generate', { stdio: 'inherit' });

  console.log('Aplicando migraciones...');
  execSync('npm run db:migrate', { stdio: 'inherit' });

  console.log('✅ Migración completada');
} catch (error) {
  console.error('❌ Error en la migración:', error);
  process.exit(1);
}
