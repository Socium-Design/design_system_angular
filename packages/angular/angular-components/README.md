# @socium-design/angular-components

Design system Socium pour **Angular 19** : composants standalone, tokens, polices, templates de page.

- **Guide d'utilisation** : [`docs/USAGE.md`](docs/USAGE.md)
- **Référence de tous les composants** (inputs, outputs, slots, types) : [`docs/generated/components.md`](docs/generated/components.md) — générée depuis le code, source de vérité.

## Installation

Le paquet est **privé**, publié sur GitHub Packages (organisation `Socium-Design`).

```bash
# une fois par machine : authentifier npm auprès de GitHub Packages (voir le guide d'équipe de sirh_prototype)
npm install @socium-design/angular-components @lucide/angular
```

Puis ajouter la feuille de style dans `angular.json` (cibles `build` et `test`) :

```json
"styles": ["node_modules/@socium-design/angular-components/styles.css", "src/styles.scss"]
```

## Exemple

```ts
import { SocButton } from '@socium-design/angular-components';

@Component({ imports: [SocButton], template: `<button socButton variant="primary">Enregistrer</button>` })
export class Exemple {}
```

Dépôt du design system : <https://github.com/Socium-Design/design_system_angular>
