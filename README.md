# Solid — application musée MO5

Front du musée MO5 : SolidStart v2 exécuté avec Bun, consomme l'API Ocelot.
Suivi du travail : tickets `MO5/SOLID-*` sur htboard.

## Pile

- SolidStart v2 (vite + nitro, preset bun), solid-js, @solidjs/router, @solidjs/meta
- Bun (runtime, gestionnaire de paquets, exécuteur de scripts)
- CSS natif, mobile-first, dark mode par défaut — pas de Tailwind
- Image Docker multi-stage (voir `SOLID-14`)

## Commandes

```sh
bun install
bun run dev           # serveur de développement
bun run build         # build de production (.output)
bun run start         # exécute le build (.output/server/index.mjs)
bun run lint          # eslint
bun run check:types   # tsc --noEmit
bun run test          # tests unitaires (bun test, fichiers *.spec.ts de src)
bun run test:browser  # tests navigateur Playwright + axe-core (voir note)
```

Vérifications à passer avant chaque commit : `lint`, `check:types`, `test`, `test:browser`.

> Note : le CLI Playwright est exécuté avec Node car son chargement de config
> reste bloqué sous Bun (observé avec bun 1.3.14). Tout le reste du projet
> tourne avec Bun.

## Tests

- **Unitaires** : `*.spec.ts` à côté du code, exécutés par `bun test src`.
- **Navigateur** : `tests/*.integration.spec.ts`, lancés par Playwright avec
  contrôle axe-core d'accessibilité et budget de navigation (< 3 s).
  Le premier lancement nécessite `bunx playwright install chromium`.

## Structure

```
src/
├── features/   # domaines métier, fichiers préfixés par la feature (ex. scan.scan-page.tsx)
├── routes/     # routes fichier de SolidStart, délèguent aux vues des features
├── ui/         # composants d'interface réutilisables
├── server/     # code serveur uniquement (env, client API Ocelot)
├── app.tsx     # racine du routeur
└── app.css     # design system
```

Les appels vers l'API Ocelot passent par un client HTTP dédié par feature
(`src/server/api/api-client.server.ts` en base), pas par des actions serveur :
l'API est un service externe.

## Environnement

Copier `env.example` vers `.env` et renseigner `OCLOT_API_URL`.
