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

## Observabilidad (Grafana Cloud + Faro / OpenTelemetry)
`js/observability.js` usa **Grafana Faro** (SDK web basado en OpenTelemetry) para enviar a Grafana Cloud:
sesiones y visitas, dispositivo / navegador / SO / resolución / idioma, procedencia, Web Vitals
(LCP, FCP, INP, CLS, TTFB), tiempos de carga (Navigation Timing), errores JS, trazas OTel e
interacciones (empleos desplegados, clics en PDF / LinkedIn / email, secciones vistas).

Mientras `FARO_URL` esté vacío no se carga nada. En local (`localhost`) tampoco envía datos,
salvo que abras la web con `?faro=1`.

### Puesta en marcha
1. Crea una cuenta gratuita en https://grafana.com (plan Free).
2. En tu stack: **Observability → Frontend → Create new app**. Nombre `webcv`, y en
   *CORS allowed origins* el dominio de la web (p. ej. `https://carballido-daniel.github.io`).
3. Copia la URL del collector (`https://faro-collector-....grafana.net/collect/...`) y pégala en
   `FARO_URL` dentro de `js/observability.js`. Esa URL es pública por diseño: no es un secreto.
4. Publica la web y visítala. En minutos verás datos en la app *Frontend Observability*.

### Dashboard propio
`grafana/dashboard-webcv.json` → en Grafana: **Dashboards → New → Import**, sube el fichero y elige
el datasource Loki de tu stack (`grafanacloud-<stack>-logs`).

Si algún panel sale vacío, abre **Explore** con ese Loki, busca tus logs de Faro y ajusta la
variable **Selector de logs** del dashboard (por defecto `{app_name="webcv"}`) a las etiquetas reales.
