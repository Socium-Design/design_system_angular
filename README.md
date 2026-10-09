# design_system_angular

Migration Angular 19 du design system Socium. Le dépôt React (`design_system`, sur
`Socium-Design/design_system`) reste la référence figée : chaque composant Angular ici est
reconstruit à partir de son vrai code source React (props, comportement réels — jamais deviné par
analogie avec un équivalent HTML natif), pas traduit ligne à ligne.

## État actuel

- **Lot 1 — primitifs : terminé** (27 composants, `src/primitifs/`). `Menu`/`MenuItem`, d'abord
  classés primitifs, dépendent de `Checkbox`/`RadioButton` : ils sont donc traités dans le Lot 2.
- **Lot 2 — composés : terminé** (14 composants, `src/composes/`) : `Menu`/`MenuItem`, `Select`,
  `MultiSelect`, `LanguageSelect`, `EnterpriseSelect`, `TableFilterSelect`, `AvatarMenu`, `Dialog`,
  `Drawer` (+ `DrawerDetailItem`), `UploadFile`, `ProfileLine`, `HeaderApp`, `CardGrid`, `DataTable`.
- **Lot 3 — templates : terminé** (6 composants, `src/templates/`) : `AppShell`, `PageHome`, `PageList`,
  `PageDetails`, `PageForm`, `PageProfile` (+ marqueurs de slots partagés `page-slots.ts`).
- **Formulaires** : tous les champs de saisie sont des `ControlValueAccessor` (`formControl`,
  `formControlName`, `ngModel`) — voir Storybook → Guides/Formulaires.

Voir `CLAUDE.md` pour les conventions établies (sélecteur d'attribut, `ViewEncapsulation.None`,
projection de contenu, équivalents Angular des idiomes React sans équivalent direct) à réutiliser
pour les composants suivants.

## Structure

```
packages/angular/                        Workspace Angular CLI (tooling, non publié)
  angular-components/                    Librairie publiable : @socium-design/angular-components
    src/
      primitifs/                         Miroir des composants sans dépendance interne
      composes/                          Miroir des composants qui en composent d'autres
      templates/                         Miroir de packages/react/src/templates/
      public-api.ts                      Point d'entrée public — un export par composant migré
    labs/                                Composants expérimentaux : @socium-design/angular-components/labs
                                         (voir labs/README.md — statut, issues GAP-DS, cycle de vie)
    .storybook/                          Storybook pour Angular (@storybook/angular, webpack5)
```

Correspondance avec le dépôt React (`packages/react/src/`) :

| React (`design_system`) | Angular (ici) |
|---|---|
| `components/<Primitif>/` (28, aucune dépendance interne) | `packages/angular/angular-components/src/primitifs/<primitif>/` |
| `components/<Composé>/` (13, dépend d'autres composants) | `packages/angular/angular-components/src/composes/<compose>/` |
| `templates/<Template>/` | `packages/angular/angular-components/src/templates/<template>/` |

## Utiliser la librairie

Ajouter la feuille de style compilée une fois dans l'application consommatrice (tokens, polices
auto-hébergées, utilitaires Tailwind de tous les composants) :

```json
"styles": ["node_modules/@socium-design/angular-components/styles.css"]
```

## Commandes

Depuis `packages/angular/` :

```bash
npm install
npm test                            # tests unitaires (Karma + Jasmine, Chrome headless)
npm run build                       # librairie (ng-packagr) + dist/angular-components/styles.css
npx ng run angular-components:storybook   # Storybook, http://localhost:6006
```
