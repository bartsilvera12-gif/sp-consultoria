// Copia el export estático de Next (carpeta `out/`) a `dist/`,
// que es la carpeta que se sube a Hostinger.
// Se ejecuta automáticamente después de `next build` (ver package.json).
import { rmSync, cpSync, existsSync } from "node:fs";

const SRC = "out";
const DEST = "dist";

if (!existsSync(SRC)) {
  console.error(`\n[build-dist] No se encontró la carpeta "${SRC}/". ¿Se ejecutó "next build" con output: "export"?\n`);
  process.exit(1);
}

rmSync(DEST, { recursive: true, force: true });
cpSync(SRC, DEST, { recursive: true });

console.log(`\n[build-dist] Export copiado a "${DEST}/". Listo para subir a Hostinger.\n`);
