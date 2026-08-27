# Portfolio

Portfolio personnel d'Ayoub El Omari — un site React à page unique avec une
page d'accueil, une page à propos, une page CV, et deux systèmes de contenu
basés sur MDX : `/project/:slug` pour les études de cas réalisées et
`/beyond/:slug` pour les idées pas encore construites. Entièrement bilingue
(français/anglais), avec un changement de langue côté client sans segment
d'URL.

## Stack technique

- **React 19** + **React Router v7** (`BrowserRouter`)
- **Vite 7** pour le développement et le build
- **Sass** pour le style, propriétés CSS personnalisées pour le thème (pas de
  Tailwind ni de CSS-in-JS)
- **MDX** (`@mdx-js/rollup`) pour le contenu des études de cas et des pages
  beyond
- Du JS/JSX pur — pas de TypeScript

## Démarrage

```bash
npm install
npm run dev
```

Autres scripts :

```bash
npm run build     # build de production
npm run preview   # aperçu local du build de production
npm run lint       # ESLint
```

## Structure du projet

```
src/
  App.jsx, main.jsx   routage et point d'entrée
  i18n/                LanguageContext + dictionnaires en.json/fr.json
  pages/, sections/    accueil, à propos, CV, et chrome partagé
  projects/            études de cas, découvertes automatiquement via import.meta.glob
  beyond/              idées pas encore construites, même logique de découverte
  rendr-web/           Rendr, un moteur de rendu autonome utilisé dans une étude de cas
  mdx/                 primitives MDX partagées
```

Ajouter un projet ou une entrée beyond revient simplement à ajouter un
dossier — aucun enregistrement manuel nécessaire. Voir `src/projects/CLAUDE.md`
et `src/beyond/CLAUDE.md` pour les règles de rédaction de contenu.

## Déploiement

Application statique (SPA), déployable sur n'importe quel hébergeur statique
(Vercel, Netlify, Cloudflare Pages). Le routage utilisant `BrowserRouter`,
l'hébergeur doit rediriger les chemins inconnus vers `index.html`.
