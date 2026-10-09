# Labs — composants expérimentaux

Point d'entrée secondaire **`@socium-design/angular-components/labs`** : des composants qui comblent un
écart du design system (issue **GAP-DS**) repéré dans le prototype SIRH, en attendant une décision de
l'équipe design. Rien de Labs n'est exporté par le point d'entrée principal.

```ts
import { SocLabsIconButton } from '@socium-design/angular-components/labs';
```

> **Les composants Labs peuvent changer sans garantie de compatibilité** (inputs, sélecteurs, rendu),
> jusqu'à leur promotion dans le kit. Ne pas les utiliser en dehors du prototype sans accord.

Storybook : section **« Labs (expérimental) »** (chaque story porte le bandeau « Composant expérimental —
non stabilisé »). Référence générée : `docs/generated/components.md`, section « Labs ».
Les composants de glisser-déposer s'appuient sur `@angular/cdk` (dépendance pair optionnelle, requise
pour `/labs`).

## Composants

| Composant | Statut | Issue GAP-DS | Pages qui l'utilisent |
|---|---|---|---|
| `soc-labs-icon-button` (`SocLabsIconButton`) | Proposé | [#22](https://github.com/Socium-Design/design_system_angular/issues/22) | — (cible : composition de tableau de bord, Bibliothèque) |
| `soc-labs-pill-toggle` (`SocLabsPillToggle`) | Proposé | [#16](https://github.com/Socium-Design/design_system_angular/issues/16) | — (cible : statut d'un tableau de bord, ET / OU des populations) |
| `soc-labs-chart-type-chip` (`SocLabsChartTypeChip`) | Proposé | [#24](https://github.com/Socium-Design/design_system_angular/issues/24) (voir #7) | — (cible : catalogue de la Bibliothèque, cartes de composition ; remplace `app-icone-graphique`) |
| `soc-labs-inline-edit` (`SocLabsInlineEdit`) | Proposé | [#23](https://github.com/Socium-Design/design_system_angular/issues/23) | — (cible : renommage des sections dans la composition) |
| `soc-labs-compact-field` (`SocLabsCompactField`) | Proposé | [#25](https://github.com/Socium-Design/design_system_angular/issues/25) | — (cible : panneau « Informations » de la composition) |
| `soc-labs-list-row` (`SocLabsListRow`) | Proposé | [#21](https://github.com/Socium-Design/design_system_angular/issues/21) (glisser : #8) | — (cible : catalogue de la Bibliothèque) |
| `soc-labs-drop-zone` (`SocLabsDropZone`) | Proposé | [#8](https://github.com/Socium-Design/design_system_angular/issues/8) | — (cible : sections de la composition, glisser depuis la Bibliothèque) |

Statuts : **Proposé** (créé dans Labs, pas encore dans le prototype) · **En test** (utilisé dans le
prototype, en revue) · **Validé** (promu dans le kit) · **Abandonné** (supprimé).

## Cycle de vie

1. **GAP-DS repéré** : une issue `GAP-DS` décrit l'écart (constat, besoin, proposition).
2. **Créé dans Labs** : `labs/src/<composant>/`, sélecteur `soc-labs-*`, classe `SocLabs*`, label `labs`
   ajouté à l'issue, ligne ajoutée au tableau ci-dessus (statut **Proposé**).
3. **Utilisé dans le prototype** (`sirh_prototype`) : statut **En test**, pages renseignées dans le tableau.
4. **Revu** dans Storybook et dans le prototype par l'équipe design.
5. Décision :
   - **Validé** → promu dans le kit officiel : renommé sans « labs » (`soc-labs-x` → `soc-x`,
     `SocLabsX` → `SocX`), déplacé dans `src/primitifs|composes|templates/`, exporté par le point
     d'entrée principal, issue fermée.
   - **Abandonné** → supprimé de Labs, issue fermée avec la raison.

**Une promotion ne se fait jamais sans l'accord explicite de l'équipe design.**

## Règles

Mêmes règles que le kit (voir `CLAUDE.md`) : standalone, signals (`input`/`output`/`model`), `OnPush`,
`ViewEncapsulation.None`, accessibilité (rôles ARIA, clavier, focus visible), **tokens CSS du kit
uniquement** (aucune couleur ni taille en dur ; une taille sans token est dérivée des tokens par
`calc()`). Un composant Labs importe le kit uniquement par son nom de paquet
(`@socium-design/angular-components`), jamais par chemin relatif vers `src/`. Tests unitaires
(`*.spec.ts`) et stories (toutes les variantes et tous les états) obligatoires.
