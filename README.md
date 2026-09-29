# design_system_angular

Migration Angular 19 du design system Socium. Le dépôt React (`design_system`, sur
`Socium-Design/design_system`) reste la référence figée : chaque composant Angular ici est
reconstruit à partir de son vrai code source React (props, comportement réels — jamais deviné par
analogie avec un équivalent HTML natif), pas traduit ligne à ligne.

## État actuel

Squelette uniquement — aucun composant migré. Voir la spec de migration (lots par niveau,
primitifs avant composés) pour l'ordre de traitement.

## Structure

```
packages/angular/                        Workspace Angular CLI (tooling, non publié)
  angular-components/                    Librairie publiable : @socium-ds/angular-components
    src/
      primitifs/                         Miroir des composants sans dépendance interne
      composes/                          Miroir des composants qui en composent d'autres
      templates/                         Miroir de packages/react/src/templates/
      public-api.ts                      Point d'entrée public — un export par composant migré
    .storybook/                          Storybook pour Angular (@storybook/angular, webpack5)
```

Correspondance avec le dépôt React (`packages/react/src/`) :

| React (`design_system`) | Angular (ici) |
|---|---|
| `components/<Primitif>/` (28, aucune dépendance interne) | `packages/angular/angular-components/src/primitifs/<primitif>/` |
| `components/<Composé>/` (13, dépend d'autres composants) | `packages/angular/angular-components/src/composes/<compose>/` |
| `templates/<Template>/` | `packages/angular/angular-components/src/templates/<template>/` |

## Commandes

Depuis `packages/angular/` :

```bash
npm install
npx ng build angular-components   # build la librairie (ng-packagr)
npx ng run angular-components:storybook   # Storybook, http://localhost:6006
```
