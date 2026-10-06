# Guide d'utilisation du design system Angular Socium

Livré avec le paquet `@socium-design/angular-components`. La **référence exacte** de chaque composant
(inputs, outputs, slots, types) est dans `docs/generated/components.md` — à lire avant d'utiliser un composant.
Ce guide explique les **conventions** qui s'appliquent partout.

## 1. Installation dans une application Angular 19

```bash
npm install @socium-design/angular-components @lucide/angular
```

Le paquet est publié sur GitHub Packages (privé) : voir le README de `sirh_prototype` pour l'authentification.
Ajouter la feuille de style **une seule fois** dans `angular.json` (build **et** test) :

```json
"styles": ["node_modules/@socium-design/angular-components/styles.css", "src/styles.scss"]
```

Elle contient les tokens (variables CSS `--bridges-*`, `--index-*`), les polices auto-hébergées et tous les
styles des composants. Aucune configuration Tailwind n'est nécessaire dans l'application.

## 2. Importer un composant

Tous les composants sont **standalone** : on les ajoute à `imports` du composant qui les utilise.

```ts
import { SocButton, SocButtonLeftIcon } from '@socium-design/angular-components';
import { LucidePlus } from '@lucide/angular';

@Component({
  imports: [SocButton, SocButtonLeftIcon, LucidePlus],
  template: `
    <button socButton variant="primary" (click)="ajouter()">
      <svg lucidePlus socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg>
      Ajouter
    </button>
  `,
})
```

## 3. Les quatre familles de composants

| Famille | Exemple | Règle |
|---|---|---|
| **Sélecteur d'attribut** sur un élément natif | `<button socButton>`, `<button socMenuItem label="…">` | Tous les attributs/événements natifs fonctionnent (`type`, `(click)`, `aria-label`…). |
| **Composant élément** | `<soc-card>`, `<soc-data-table>` | Inputs/outputs explicites, listés dans la référence. |
| **Slots (contenu projeté)** | `<svg socCardIcon>`, `<span socMessageContent>` | Un attribut marqueur range l'élément dans le bon emplacement. Pas de marqueur = slot par défaut. |
| **Champs de formulaire** | `<soc-input-text>`, `<soc-select>` | `ControlValueAccessor` : `formControl`, `formControlName`, `ngModel`. |

## 4. Règles à connaître

- **Booléens** : l'attribut nu suffit (`<soc-input-text required disabled>`). Les inputs « `model` » (↔ dans la référence : `checked`, `open`, `value`…) se lient en `[(x)]` ou `[x]` — pas d'attribut nu pour eux.
- **Actions présentes ou non** : un `output()` Angular ne dit pas s'il est écouté ; les fonctionnalités optionnelles ont donc un booléen
  explicite (`searchable`, `rowClickable`, `rowActions`, `showBack`, `showViewProfile`…), `false` par défaut.
- **Contenu riche dans un tableau** (`soc-data-table`) : `render` d'une colonne = une fonction `(row) => string` **ou** un `TemplateRef`
  (`<ng-template #cell let-row>…</ng-template>`).
- **Slots dans un `@if`** : un seul élément projeté par bloc `@if` (deux éléments dans le même bloc ne sont pas projetés).
- **Overlays** (`soc-popover`, `soc-dialog`, `soc-drawer`, `soc-tooltip`) : rendus dans `<body>`, ils n'héritent pas du layout du parent.
- **Icônes** : `@lucide/angular`, `<svg lucideXxx class="size-full" [strokeWidth]="1.5">` dans un slot d'icône (le slot fixe la taille).
- **Styles personnalisés** : utiliser les variables CSS du design system (`var(--bridges-position-gap-md)`…), jamais de valeurs en dur.
  Ne jamais surcharger les espacements internes d'un composant : si un espacement semble faux, c'est un écart du design system (GAP-DS).

## 5. Pages complètes

Une page applicative = `soc-app-shell` (AppSwitch + header + navigation latérale) autour d'**un** template de page :

| Besoin | Template |
|---|---|
| Accueil d'un produit | `soc-page-home` |
| Liste d'objets (tableau, filtres, pagination) | `soc-page-list` |
| Détail d'un objet | `soc-page-details` |
| Création / modification | `soc-page-form` |
| Fiche d'une personne | `soc-page-profile` |

Les slots communs des pages sont les marqueurs `socPage*` (`socPageBreadcrumb`, `socPageActions`, `socPageTabs`, `socPageBadge`…).
`soc-app-shell` suit tout seul le produit, l'item de menu, le repli et la langue (`[(product)]`, `[(navSelectedId)]`…) ;
l'application relie ces valeurs au routeur.

## 6. Ce qui manque ? (`GAP-DS`)

Si un besoin n'est couvert par aucun composant, **ne pas improviser un faux composant** : le signaler comme `GAP-DS`
(composant manquant, prop manquante, écart visuel) dans le dépôt `Socium-Design/design_system_angular`.
