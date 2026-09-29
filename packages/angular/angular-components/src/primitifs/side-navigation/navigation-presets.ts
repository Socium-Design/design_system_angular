import type { Type } from '@angular/core';
import {
  LucideAppWindow,
  LucideAward,
  LucideBanknote,
  LucideBookOpen,
  LucideBriefcase,
  LucideBriefcaseBusiness,
  LucideBuilding2,
  LucideCalculator,
  LucideCalendar,
  LucideCalendarCheck,
  LucideCalendarDays,
  LucideChartPie,
  LucideCircleCheck,
  LucideClipboardCheck,
  LucideClipboardList,
  LucideClipboardPen,
  LucideCoins,
  LucideDownload,
  LucideFileChartColumn,
  LucideFileCheck,
  LucideFilePlus,
  LucideFileSignature,
  LucideFileSpreadsheet,
  LucideFileText,
  LucideFiles,
  LucideFilter,
  LucideFolderSearch,
  LucideGitFork,
  LucideGraduationCap,
  LucideGrid3x3,
  LucideHistory,
  LucideHouse,
  LucideInbox,
  LucideInfo,
  LucideLayoutDashboard,
  LucideList,
  LucideListChecks,
  LucideListFilter,
  LucideMail,
  LucideNetwork,
  LucidePackage,
  LucidePackageCheck,
  LucidePiggyBank,
  LucidePlus,
  LucidePresentation,
  LucideReceipt,
  LucideReceiptText,
  LucideSend,
  LucideSettings,
  LucideShieldCheck,
  LucideTarget,
  LucideTrendingUp,
  LucideUser,
  LucideUsers,
  LucideWallet,
  LucideWorkflow,
} from '@lucide/angular';

export type NavigationProduct = 'workspace' | 'job' | 'workflow' | 'perfs' | 'doc' | 'payroll';

/** A reference to an icon COMPONENT CLASS (e.g. `LucideHouse` itself, not an instance) — the
 * Angular equivalent of React storing a rendered `<House />` element directly in plain preset
 * data. React's `ReactNode` can hold an already-rendered element; Angular has nothing structurally
 * equivalent for a plain non-component .ts data file (no live template context exists here to
 * declare a `TemplateRef` against, unlike a consumer's own component template — see `Tabs.icon`'s
 * docstring for that alternative, used where a live template context *does* exist). Rendered via
 * `NgComponentOutlet`, which correctly instantiates an attribute-selector component like
 * `svg[lucideHouse]` using the selector's own tag (`svg`) as the host element. */
export type IconComponent = Type<unknown>;

export interface SideNavItemData {
  id: string;
  label: string;
  icon: IconComponent;
  /** Called in addition to the component's own `select` output whenever this item is clicked —
   * matches React `SideNavItem`'s own `onClick?: () => void`. None of the built-in presets above
   * set one (consistent with React's presets), but a consumer-supplied item can. */
  onClick?: () => void;
}

export interface SideNavSectionData {
  title: string;
  items: SideNavItemData[];
}

export interface SideNavActionData {
  id: string;
  label: string;
  icon: IconComponent;
  /** Matches React `SideNavAction`'s own `onClick?: () => void`. */
  onClick?: () => void;
}

export interface NavigationPreset {
  title: string;
  sections: SideNavSectionData[];
  actionSection?: { title: string; items: SideNavActionData[] };
}

/**
 * One preset per "Produit" variant of Figma's SiteNavigation component — transcribed label-by-
 * label and icon-by-icon from design_system (React)'s own navigationPresets.ts, itself
 * transcribed from the Figma file (icons identified there by comparing each exported SVG's
 * geometry against lucide-react's own icon path data, not guessed from the label text — carried
 * over verbatim, not re-derived here). Section/item ids are slugs of their label, prefixed with
 * the product, so the same label reused across products never collides.
 */
export const NAVIGATION_PRESETS: Record<NavigationProduct, NavigationPreset> = {
  workspace: {
    title: 'Workspace',
    sections: [
      {
        title: 'MENU PRINCIPAL',
        items: [
          { id: 'workspace-accueil', label: 'Accueil', icon: LucideHouse },
          { id: 'workspace-tableau-de-bord', label: 'Tableau de bord', icon: LucideLayoutDashboard },
          { id: 'workspace-historique', label: 'Historique', icon: LucideHistory },
        ],
      },
      {
        title: 'GESTION ENTREPRISE',
        items: [
          { id: 'workspace-infos-generales', label: 'Infos générales', icon: LucideInfo },
          { id: 'workspace-applications', label: 'Applications', icon: LucideAppWindow },
          { id: 'workspace-employes', label: 'Employés', icon: LucideUsers },
          { id: 'workspace-permissions', label: 'Permissions', icon: LucideShieldCheck },
          { id: 'workspace-postes', label: 'Postes', icon: LucideBriefcase },
          { id: 'workspace-structures', label: 'Structures', icon: LucideNetwork },
          { id: 'workspace-organigramme', label: 'Organigramme', icon: LucideGitFork },
          { id: 'workspace-configurations', label: 'Configurations', icon: LucideSettings },
        ],
      },
      {
        title: 'PARAMÈTRES DE PAIE',
        items: [
          { id: 'workspace-rubriques-de-paie', label: 'Rubriques de paie', icon: LucideList },
          { id: 'workspace-etat-de-paie', label: 'État de paie', icon: LucideFileText },
          { id: 'workspace-controle-cycle-paie', label: 'Contrôle cycle paie', icon: LucideCircleCheck },
        ],
      },
      {
        title: 'MON ESPACE',
        items: [
          { id: 'workspace-profil', label: 'Profil', icon: LucideUser },
          { id: 'workspace-mes-taches', label: 'Mes tâches', icon: LucideListChecks },
        ],
      },
    ],
  },
  job: {
    title: 'Job',
    sections: [
      {
        title: 'MENU PRINCIPAL',
        items: [
          { id: 'job-accueil', label: 'Accueil', icon: LucideHouse },
          { id: 'job-tableau-de-bord', label: 'Tableau de bord', icon: LucideLayoutDashboard },
        ],
      },
      {
        title: 'GESTION & SUIVI',
        items: [
          { id: 'job-offres', label: 'Offres', icon: LucideBriefcaseBusiness },
          { id: 'job-cvtheque', label: 'CvThèque', icon: LucideFolderSearch },
        ],
      },
      {
        title: 'GESTION DES MODÈLES',
        items: [
          { id: 'job-modeles-d-offres', label: "Modèles d'offres", icon: LucideFilePlus },
          { id: 'job-modeles-pre-qualif', label: 'Modèles pré-qualif.', icon: LucideFileCheck },
          { id: 'job-modeles-d-emails', label: "Modèles d'emails", icon: LucideMail },
          { id: 'job-modeles-de-pipeline', label: 'Modèles de pipeline', icon: LucideFilter },
          { id: 'job-modeles-de-rapport', label: 'Modèles de rapport', icon: LucideFileChartColumn },
          { id: 'job-modeles-de-criteres', label: 'Modèles de critères', icon: LucideListFilter },
        ],
      },
      {
        title: 'PARAMÉTRAGE',
        items: [
          { id: 'job-workflow', label: 'Workflow', icon: LucideWorkflow },
          { id: 'job-jours-feries', label: 'Jours fériés', icon: LucideCalendarDays },
          { id: 'job-configuration', label: 'Configuration', icon: LucideSettings },
          { id: 'job-templates-d-export', label: "Templates d'export", icon: LucideDownload },
        ],
      },
      {
        title: 'MON ESPACE',
        items: [
          { id: 'job-mon-organisation', label: 'Mon organisation', icon: LucideBuilding2 },
          { id: 'job-ma-presentation', label: 'Ma présentation', icon: LucidePresentation },
          { id: 'job-listes-diffusion', label: 'Listes diffusion', icon: LucideSend },
        ],
      },
    ],
  },
  workflow: {
    title: 'Workflow',
    sections: [
      {
        title: 'MENU PRINCIPAL',
        items: [
          { id: 'workflow-accueil', label: 'Accueil', icon: LucideHouse },
          { id: 'workflow-dashboard', label: 'Dashboard', icon: LucideLayoutDashboard },
          { id: 'workflow-historique', label: 'Historique', icon: LucideHistory },
          { id: 'workflow-conge', label: 'Congé', icon: LucideCalendar },
          { id: 'workflow-note-de-frais', label: 'Note de frais', icon: LucideReceipt },
          { id: 'workflow-demande-moyen', label: 'Demande moyen', icon: LucidePackage },
          { id: 'workflow-avance-salaire', label: 'Avance salaire', icon: LucideBanknote },
          { id: 'workflow-autres-demandes', label: 'Autres demandes', icon: LucideClipboardList },
        ],
      },
      {
        title: 'PARAMÈTRES',
        items: [
          { id: 'workflow-workflow', label: 'Workflow', icon: LucideWorkflow },
          { id: 'workflow-jours-feries', label: 'Jours fériés', icon: LucideCalendarDays },
          { id: 'workflow-configuration', label: 'Configuration', icon: LucideSettings },
          { id: 'workflow-templates-d-export', label: "Templates d'export", icon: LucideDownload },
        ],
      },
      {
        title: 'MON ESPACE',
        items: [
          { id: 'workflow-mon-profil', label: 'Mon profil', icon: LucideUser },
          { id: 'workflow-mes-conges', label: 'Mes congés', icon: LucideCalendarCheck },
          { id: 'workflow-mes-notes-de-frais', label: 'Mes notes de frais', icon: LucideReceiptText },
          { id: 'workflow-mes-demandes-moyens', label: 'Mes demandes moyens', icon: LucidePackageCheck },
          { id: 'workflow-mes-avances-salaire', label: 'Mes avances salaire', icon: LucideWallet },
          { id: 'workflow-mes-demandes-perso', label: 'Mes demandes perso.', icon: LucideClipboardPen },
        ],
      },
    ],
  },
  perfs: {
    title: 'Perfs',
    sections: [
      {
        title: 'MENU PRINCIPAL',
        items: [
          { id: 'perfs-accueil', label: 'Accueil', icon: LucideHouse },
          { id: 'perfs-tableau-de-bord', label: 'Tableau de bord', icon: LucideLayoutDashboard },
          { id: 'perfs-objectifs', label: 'Objectifs', icon: LucideTarget },
          { id: 'perfs-evaluations', label: 'Évaluations', icon: LucideClipboardCheck },
          { id: 'perfs-competences', label: 'Compétences', icon: LucideAward },
          { id: 'perfs-carrieres', label: 'Carrières', icon: LucideTrendingUp },
          { id: 'perfs-formations', label: 'Formations', icon: LucideGraduationCap },
          { id: 'perfs-matrice-9-box', label: 'Matrice 9-box', icon: LucideGrid3x3 },
          { id: 'perfs-employes', label: 'Employés', icon: LucideUsers },
          { id: 'perfs-historiques', label: 'Historiques', icon: LucideHistory },
        ],
      },
      {
        title: 'MON ESPACE',
        items: [
          { id: 'perfs-mes-objectifs', label: 'Mes objectifs', icon: LucideTarget },
          { id: 'perfs-mes-evaluations', label: 'Mes évaluations', icon: LucideClipboardCheck },
          { id: 'perfs-mes-formations', label: 'Mes formations', icon: LucideGraduationCap },
          { id: 'perfs-mon-profil', label: 'Mon profil', icon: LucideUser },
        ],
      },
    ],
    actionSection: {
      title: 'ACTIONS RAPIDES',
      items: [
        { id: 'perfs-ajouter-un-formulaire', label: 'Ajouter un formulaire', icon: LucidePlus },
        { id: 'perfs-ajouter-un-objectif', label: 'Ajouter un objectif', icon: LucidePlus },
        { id: 'perfs-ajouter-une-campagne', label: 'Ajouter une campagne', icon: LucidePlus },
      ],
    },
  },
  doc: {
    title: 'Doc',
    sections: [
      {
        title: 'MENU PRINCIPAL',
        items: [
          { id: 'doc-accueil', label: 'Accueil', icon: LucideHouse },
          { id: 'doc-tableau-de-bord', label: 'Tableau de bord', icon: LucideLayoutDashboard },
          { id: 'doc-demandes', label: 'Demandes', icon: LucideInbox },
          { id: 'doc-contrats', label: 'Contrats', icon: LucideFileSignature },
          { id: 'doc-modeles', label: 'Modèles', icon: LucideFiles },
          { id: 'doc-employes', label: 'Employés', icon: LucideUsers },
          { id: 'doc-conformite', label: 'Conformité', icon: LucideShieldCheck },
          { id: 'doc-bulletins-de-paie', label: 'Bulletins de paie', icon: LucideReceipt },
          { id: 'doc-parametres', label: 'Paramètres', icon: LucideSettings },
        ],
      },
    ],
  },
  payroll: {
    title: 'Payroll',
    sections: [
      {
        title: 'MENU PRINCIPAL',
        items: [
          { id: 'payroll-accueil', label: 'Accueil', icon: LucideHouse },
          { id: 'payroll-tableau-de-bord', label: 'Tableau de bord', icon: LucideLayoutDashboard },
          { id: 'payroll-mes-bulletins-de-paie', label: 'Mes bulletins de paie', icon: LucideReceiptText },
          { id: 'payroll-historique', label: 'Historique', icon: LucideHistory },
        ],
      },
      {
        title: 'GESTION ENTREPRISES',
        items: [
          { id: 'payroll-employes', label: 'Employés', icon: LucideUsers },
          { id: 'payroll-elements-remuneration', label: 'Éléments rémunération', icon: LucideCoins },
          { id: 'payroll-bulletins-de-paie', label: 'Bulletins de paie', icon: LucideReceipt },
          { id: 'payroll-etats-de-paie', label: 'États de paie', icon: LucideFileSpreadsheet },
          { id: 'payroll-simulateur-de-paie', label: 'Simulateur de paie', icon: LucideCalculator },
          { id: 'payroll-provisions', label: 'Provisions', icon: LucidePiggyBank },
          { id: 'payroll-centres-analytiques', label: 'Centres analytiques', icon: LucideChartPie },
          { id: 'payroll-comptes-comptables', label: 'Comptes comptables', icon: LucideBookOpen },
          { id: 'payroll-augm-salariales', label: 'Augm. salariales', icon: LucideTrendingUp },
        ],
      },
      {
        title: 'CONFIG. GLOBALE',
        items: [{ id: 'payroll-gestion-des-entreprises', label: 'Gestion des entreprises', icon: LucideBuilding2 }],
      },
    ],
  },
};
