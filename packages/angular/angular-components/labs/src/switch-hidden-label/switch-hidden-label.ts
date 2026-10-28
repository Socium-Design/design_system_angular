import { Directive } from '@angular/core';

/**
 * ## Rôle
 * Sur un `soc-switch` du kit : garde son `label` comme **nom accessible** de l'interrupteur, mais le masque
 * visuellement (`sr-only`). Pour un interrupteur seul dans une cellule de tableau (« Entreprise active ») ou à
 * côté d'un libellé visible qui n'est pas un `<label>` (bouton qui ouvre un détail : `soc-labs-option-row`).
 * L'hôte passe en `position: relative` : le libellé masqué (en absolu) reste à sa place au lieu d'allonger la page.
 * `soc-switch` n'a pas d'entrée `ariaLabel` et ne relaie pas `aria-label` posé sur son hôte (#65).
 *
 * ```html
 * <soc-switch socLabsSwitchHiddenLabel label="Entreprise active" [checked]="true" />
 * ```
 */
@Directive({
  selector: 'soc-switch[socLabsSwitchHiddenLabel]',
  standalone: true,
  host: { class: 'relative [&_label>span]:sr-only' },
})
export class SocLabsSwitchHiddenLabel {}
