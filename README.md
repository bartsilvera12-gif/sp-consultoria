# SP Consultoría — Sitio institucional

Sitio web institucional de SP Consultoría (export estático).

## Estructura

- `index.html` — página principal (copia de `SP Consultoría.dc.html` para hosting).
- `SP Consultoría.dc.html` — archivo fuente del editor (DesignCode).
- `support.js` — runtime que renderiza la página.
- `uploads/` — recursos (logo, brochure, imágenes).
- `screenshots/` — capturas de referencia.

## Ver en local

Servir la carpeta con cualquier servidor estático, por ejemplo:

```bash
python -m http.server 8000
```

Luego abrir http://localhost:8000

## Publicar con GitHub Pages

1. En GitHub: **Settings → Pages**.
2. En **Source** elegir la rama `main` y carpeta `/ (root)`.
3. Guardar. La página quedará disponible en la URL que muestre GitHub Pages.
