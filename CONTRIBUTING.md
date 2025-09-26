# Guide de Contribution - Architecture Feature-First

## 🏗️ Architecture

Ce projet suit une architecture **Feature-First** basée sur les principes **SOLID**, **KISS** et **DDD**.

### 📁 Structure des Features

```
src/features/
├── events/                    # 📋 COLLECTION d'événements
│   ├── events.ctrl.ts        # Hook pour la liste
│   ├── events.view.tsx       # Vue liste
│   ├── events.types.ts       # Types collection
│   ├── events.utils.ts       # Utilitaires collection
│   ├── events.const.ts       # Constantes
│   └── events.api.ts         # API collection
├── event/                     # 🎯 ÉVÉNEMENT individuel
│   ├── event.ctrl.ts         # Hook individuel
│   ├── event.view.tsx        # Vue individuelle
│   ├── event.types.ts        # Types individuels
│   └── event.api.ts          # API individuelle
├── event-create/              # ➕ CRÉATION d'événement
│   ├── event-create.ctrl.ts  # Hook création
│   ├── event-create.form.tsx # Formulaire de création
│   ├── event-create.modal.tsx# Modal de création
│   └── event-create.types.ts # Types création
└── event-details/             # 👁️ DÉTAILS d'événement
    ├── event-details.ctrl.ts # Hook détails
    ├── event-details.modal.tsx# Modal détails
    └── event-details.types.ts# Types détails
```

## 🎯 Principes

### 1. **Feature-First**

- Chaque feature est autonome
- Pas d'imports entre features
- Partage via des utilitaires communs

### 2. **Namespaces Expressifs**

- `.ctrl.ts` - Hooks/logique métier
- `.view.tsx` - Composants de vue
- `.form.tsx` - Formulaires
- `.modal.tsx` - Modales
- `.types.ts` - Types TypeScript
- `.utils.ts` - Utilitaires
- `.const.ts` - Constantes
- `.api.ts` - APIs

### 3. **SOLID Principles**

- **S**ingle Responsibility : Un fichier = une responsabilité
- **O**pen/Closed : Extensible sans modification
- **L**iskov Substitution : Interfaces cohérentes
- **I**nterface Segregation : Interfaces spécifiques
- **D**ependency Inversion : Dépendances vers abstractions

### 4. **KISS (Keep It Simple, Stupid)**

- Pas de classes inutiles
- Hooks simples avec `createSignal`
- Pas d'index avec imports superflus
- Architecture plate et lisible

## 📝 Conventions de Code

### Hooks (`.ctrl.ts`)

```typescript
export function useFeatureName() {
  const [state, setState] = createSignal(initialValue)

  const action = () => {
    // Logique métier
  }

  return {
    state,
    action,
  }
}
```

### Composants (`.view.tsx`, `.form.tsx`, `.modal.tsx`)

```typescript
interface ComponentProps {
  // Props typées
}

export const Component = (props: ComponentProps) => {
  // UI pure, pas de logique métier
  return <div>...</div>
}
```

### Types (`.types.ts`)

```typescript
export interface FeatureData {
  // Types spécifiques à la feature
}

export interface FeatureState {
  // État de la feature
}
```

### APIs (`.api.ts`)

```typescript
export const featureAPI = async ({ request }: { request: Request }) => {
  // Logique API pure
  return Response.json(data)
}
```

## 🚫 Anti-Patterns

### ❌ À Éviter

- Classes pour la logique simple
- Imports entre features
- Fichiers index avec réexports
- Logique métier dans les composants
- Types `any` ou `unknown`
- Couplage fort entre composants

### ✅ Bonnes Pratiques

- Hooks avec `createSignal`
- Composants UI purs
- Types stricts
- Séparation claire des responsabilités
- Architecture modulaire

## 🔄 Workflow de Développement

### 1. Créer une Feature

1. Créer le dossier `src/features/feature-name/`
2. Ajouter les fichiers avec namespaces appropriés
3. Implémenter la logique dans `.ctrl.ts`
4. Créer les composants UI
5. Définir les types

### 2. Modifier une Feature

1. Identifier la responsabilité
2. Modifier le fichier approprié
3. Maintenir la cohérence des types
4. Tester l'isolation

### 3. Refactoring

1. Identifier les responsabilités mélangées
2. Séparer en features distinctes
3. Utiliser les namespaces appropriés
4. Maintenir la compatibilité

## 📚 Exemples

### Feature Simple

```
src/features/user-profile/
├── user-profile.ctrl.ts      # Hook pour le profil
├── user-profile.view.tsx     # Vue du profil
├── user-profile.types.ts     # Types du profil
└── user-profile.api.ts       # API du profil
```

### Feature Complexe

```
src/features/event-management/
├── event-management.ctrl.ts  # Hook principal
├── event-management.view.tsx # Vue principale
├── event-management.form.tsx # Formulaire
├── event-management.modal.tsx# Modal
├── event-management.types.ts # Types
├── event-management.utils.ts # Utilitaires
├── event-management.const.ts # Constantes
└── event-management.api.ts   # API
```

## 🎯 Objectifs

- **Maintenabilité** : Code facile à comprendre et modifier
- **Testabilité** : Logique isolée et testable
- **Réutilisabilité** : Composants et hooks réutilisables
- **Évolutivité** : Architecture qui grandit avec le projet
- **Simplicité** : Moins de complexité, plus de clarté

---

_Cette architecture favorise la productivité et la qualité du code en gardant les choses simples et organisées._
