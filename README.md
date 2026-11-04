# CV web · Daniel Carballido

Web estática (HTML + CSS + JS, sin dependencias ni build).

```
index.html        ← contenido del CV
css/styles.css    ← estilos (tema oscuro / claro automático)
js/main.js        ← desplegables, "expandir todo", animaciones
assets/
  foto.jpg                 ← tu foto (cuadrada, ~400×400)
  CV_Dani_Carballido.pdf   ← PDF descargable
  favicon.svg
vercel.json
```

## Antes de publicar
1. Copia tu foto a `assets/foto.jpg` (si no existe se muestran las iniciales "DC").
2. Copia el PDF a `assets/CV_Dani_Carballido.pdf`.
3. En `index.html` cambia `https://www.linkedin.com/in/TU-PERFIL` por tu URL real.

## Ampliar la información de un empleo
Cada empleo es un `<article class="job">`. Lo que va dentro de `<div class="job__more">`
es lo que aparece al desplegar: añade `<h3>`, `<ul>`, `<p>` o etiquetas `<ul class="chips">`.

## Ver en local
Abre `index.html` en el navegador, o: `npx serve .`

## Publicar en Vercel
**Opción A (recomendada, con GitHub):**
1. Sube la carpeta a un repositorio de GitHub.
2. En https://vercel.com → *Add New → Project* → importa el repo.
3. Framework preset: **Other**, sin build command. *Deploy*.
Cada `git push` vuelve a publicar automáticamente.

**Opción B (CLI):**
```
npm i -g vercel
vercel          # primer despliegue (preview)
vercel --prod   # producción
```

## Alternativas gratuitas
- **GitHub Pages**: Settings → Pages → Deploy from branch `main` / root.
- **Netlify**: arrastra la carpeta a https://app.netlify.com/drop
- **Cloudflare Pages**: conecta el repo, sin build command.
