#!/usr/bin/env tsx

import { db } from "@core/database";
import { sql } from "drizzle-orm";
import readline from "readline";

interface DatabaseError {
  message: string;
  code?: string;
  detail?: string;
}

// Función para leer entrada del usuario
const askQuestion = (question: string): Promise<string> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

// Narrowing para errores
const isDatabaseError = (err: unknown): err is DatabaseError => {
  return (
    typeof err === "object" && err !== null && "message" in err && typeof err.message === "string"
  );
};

async function cleanDatabase(): Promise<void> {
  try {
    console.clear();
    console.log("🧹 LIMPIADOR DE BASE DE DATOS\n");
    console.log("=".repeat(60));
    console.log("⚠️  ¡ADVERTENCIA! Esta operación eliminará TODOS los datos");
    console.log("=".repeat(60));
    console.log("\nSe eliminarán los datos de las siguientes tablas:");
    console.log("  • applicant");
    console.log("  • observation_applicant");
    console.log("  • task_field_value");
    console.log("  • task_field");
    console.log("  • activity");
    console.log("  • task_step");
    console.log("  • task");
    console.log("  • task_template");
    console.log("  • job_position");
    console.log("  • request_field_value");
    console.log("  • request_field");
    console.log("  • request_step");
    console.log("  • request");
    console.log("  • type_request_template");
    console.log("  • request_template");
    console.log("  • type_request");
    console.log("  • seeders_log");
    console.log("\nNota: Las tablas se mantendrán, solo se eliminarán los datos.");
    console.log("=".repeat(60));

    const confirmation = await askQuestion('\nPara confirmar, escribe "DELETE": ');

    if (confirmation !== "DELETE") {
      console.log("\n❌ Operación cancelada");
      process.exit(0);
    }

    console.log("\n🚀 Iniciando limpieza de datos...\n");

    // 1. Deshabilitar constraints
    console.log("🔓 Deshabilitando restricciones...");
    await db.execute(sql`SET session_replication_role = 'replica';`);

    // Orden de eliminación basado en dependencias (de más específico a más general)
    const tablesInOrder = [
      "observation_applicant",
      "applicant",
      "job_position",

      "task_field_value",
      "task_field",
      "task_step",
      "task",
      "task_template",

      "request_field_value",
      "request_field",
      "activity",
      "request_step",
      "request",
      "type_request_template",
      "request_template",
      "type_request",

      "seeders_log",
    ];

    console.log("🗑️  Eliminando datos...");

    try {
      for (const table of tablesInOrder) {
        console.log(`   • ${table}`);
        await db.execute(sql.raw(`TRUNCATE TABLE "${table}" CASCADE;`));
      }
      console.log("✅ Datos eliminados con TRUNCATE");
    } catch (err: unknown) {
      console.log("⚠️  Falló TRUNCATE, usando DELETE...");

      if (isDatabaseError(err)) {
        console.log("Error:", err.message);
      } else {
        console.log("Error desconocido al truncar.");
      }

      // Fallback DELETE
      for (const table of tablesInOrder) {
        try {
          console.log(`   • ${table}`);
          await db.execute(sql.raw(`DELETE FROM "${table}";`));
        } catch (deleteErr: unknown) {
          if (isDatabaseError(deleteErr)) {
            console.log(`     ⚠️  Error con ${table}: ${deleteErr.message}`);
          } else {
            console.log(`     ⚠️  Error desconocido con ${table}`);
          }
        }
      }
      console.log("✅ Datos eliminados con DELETE");
    }

    // 3. Habilitar constraints
    console.log("\n🔐 Habilitando restricciones...");
    await db.execute(sql`SET session_replication_role = 'origin';`);

    // 4. Reiniciar secuencias
    console.log("🔄 Reiniciando secuencias...");
    try {
      await db.execute(sql`
        DO $$ 
        DECLARE 
          seq_name text;
        BEGIN 
          FOR seq_name IN (
            SELECT sequence_name 
            FROM information_schema.sequences 
            WHERE sequence_schema = 'public'
          )
          LOOP 
            BEGIN
              EXECUTE 'ALTER SEQUENCE ' || seq_name || ' RESTART WITH 1;';
            EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
          END LOOP;
        END $$;
      `);
    } catch (seqErr: unknown) {
      if (isDatabaseError(seqErr)) {
        console.log("⚠️  Error reiniciando secuencias:", seqErr.message);
      } else {
        console.log("⚠️  Error desconocido reiniciando secuencias");
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ ¡DATOS ELIMINADOS EXITOSAMENTE!");
    console.log("=".repeat(50));

    // Verificación final
    console.log("\n📊 Verificando estado de las tablas...");

    const tablesToCheck = [
      "applicant",
      "task",
      "task_template",
      "request",
      "request_template",
      "type_request",
      "seeders_log",
    ];

    for (const table of tablesToCheck) {
      try {
        const result = await db.execute(sql.raw(`SELECT COUNT(*) FROM "${table}";`));
        const value = result.rows?.[0]?.count;

        console.log(`   • ${table}: ${value ?? "?"} registros`);
      } catch (verifyErr: unknown) {
        if (isDatabaseError(verifyErr)) {
          console.log(`   • ${table}: Error al verificar - ${verifyErr.message}`);
        } else {
          console.log(`   • ${table}: Error desconocido al verificar.`);
        }
      }
    }

    console.log("\n🎉 ¡Proceso completado!");
    console.log("📝 Las tablas se mantienen intactas, solo se eliminaron los datos.");
  } catch (err: unknown) {
    if (isDatabaseError(err)) {
      console.error("\n❌ Error durante la limpieza:", err.message);
    } else {
      console.error("\n❌ Error desconocido durante la limpieza.");
    }
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  cleanDatabase().catch((err) => {
    if (isDatabaseError(err)) console.error(err.message);
    else console.error("Error desconocido.");
  });
}

export { cleanDatabase };
