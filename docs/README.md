# 📚 Documentation Technique - SolidJS App

## 🎯 Vision

Cette documentation sert de **one-pager** pour chaque feature, permettant de structurer le code en DDD (Domain-Driven Design) avec des fichiers `.feature`.

## 📁 Structure

```
docs/
├── features/           # One-pager par feature
│   ├── auth.feature
│   ├── user-management.feature
│   └── ...
├── architecture/       # Architecture générale
│   ├── ddd-structure.md
│   └── tech-stack.md
└── templates/          # Templates pour les features
    └── feature-template.md
```

## 🚀 Workflow

1. **Documenter** → Créer le one-pager de la feature
2. **Structurer** → Organiser en domaines DDD
3. **Implémenter** → Coder avec la structure claire

## 🎨 Design System

- **Couleurs** : Définies dans `src/app.css` avec Tailwind v4
- **Composants** : Réutilisables et cohérents
- **Responsive** : Mobile-first approach

---

_Cette doc évolue avec le projet - chaque feature documentée devient un domaine structuré_
