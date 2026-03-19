# WorldPlanner — Vibe-Coding Prompt

## Contexte & Objectif

Crée une application web single-page appelée **WorldPlanner** permettant de planifier des réunions avec une équipe dispersée à travers le monde. L'utilisateur sélectionne plusieurs villes, choisit une date et une heure, et voit instantanément l'heure correspondante dans chaque fuseau horaire.

---

## Stack technique recommandée

- **Framework** : React (Vite) ou Next.js App Router
- **Styling** : Tailwind CSS + shadcn/ui
- **Librairie timezone** : `date-fns-tz` ou `luxon` (gestion fiable des DST / heure d'été)
- **Recherche de villes** : dataset statique JSON (`cities.json` avec ville → timezone IANA) ou API légère comme `geonames` / `timezonedb`
- **Icônes** : `lucide-react`

---

## Fonctionnalités principales

### 1. Sélection de villes

- Barre de recherche avec **autocomplétion** (type-ahead) sur les noms de villes en français et en anglais.
- Résultats filtrés en temps réel, affichant : `Ville, Pays · UTC±X`.
- Possibilité d'ajouter jusqu'à **10 villes** simultanément.
- Chaque ville ajoutée apparaît sous forme de **tag supprimable** (croix).
- Pré-sélectionner automatiquement la ville locale de l'utilisateur (via `Intl.DateTimeFormat().resolvedOptions().timeZone`).

### 2. Sélecteur de date & heure de réunion

- Champ date (date picker natif ou composant shadcn/ui Calendar).
- Champ heure avec sélection par incréments de 15 minutes.
- Une **timezone de référence** choisie par l'utilisateur parmi ses villes sélectionnées (défaut : ville locale).
- L'heure saisie est interprétée dans la timezone de référence.

### 3. Tableau des fuseaux horaires

- Tableau ou grille de **cartes** (une par ville), affichant :
  - Drapeau emoji du pays + Nom de la ville
  - Heure locale à la date/heure choisie (format 24h et 12h, toggle)
  - Décalage UTC (ex. `UTC+9`)
  - Différence par rapport à la timezone de référence (ex. `+7h`, `-3h`)
  - Badge coloré selon la plage horaire locale :
    - 🟢 **Vert** : 08h00–19h00 (horaires de travail)
    - 🟡 **Jaune** : 06h00–08h00 ou 19h00–22h00 (acceptable)
    - 🔴 **Rouge** : 22h00–06h00 (nuit)
- Tri automatique du moins décalé au plus décalé par rapport à la référence.

### 4. Slider "Trouver le meilleur créneau"

- Slider horizontal représentant les heures de la journée (00h → 23h).
- En déplaçant le slider, toutes les cartes se mettent à jour en temps réel.
- Les badges colorés permettent de visualiser d'un coup d'œil le créneau idéal où toutes les villes sont en vert ou jaune.

### 5. Partage & Export

- Bouton **"Copier le lien"** : encode les paramètres (villes + date/heure) dans l'URL (query params), permettant de partager la vue avec l'équipe.
- Bouton **"Copier le résumé"** : génère un texte Markdown du style :
  ```
  📅 Réunion : Mardi 24 mars 2026 à 10h00 (Paris)
  🌍 Paris — 10:00 (UTC+1)
  🌍 New York — 05:00 (UTC-4)
  🌍 Tokyo — 18:00 (UTC+9)
  🌍 Sydney — 20:00 (UTC+11)
  ```

---

## Design & UX

- **Thème** : sombre par défaut (dark mode), toggle clair/sombre en haut à droite.
- **Couleurs** : fond `#0f172a` (slate-900), accents `#6366f1` (indigo-500), textes clairs.
- **Typographie** : Inter ou Geist (clean, lisible).
- **Layout** : colonne centrale max-width 900px, centré, padding confortable.
- **Responsive** : cartes en colonne sur mobile, grille 2-3 colonnes sur desktop.
- **Animations** : transitions douces sur l'ajout/suppression de cartes (`framer-motion` ou CSS transitions).
- **Accessibilité** : contrastes WCAG AA, navigation clavier sur la recherche et le slider.

---

## Structure de fichiers suggérée

```
worldPlanner/
├── public/
│   └── cities.json          # Dataset : [{name, country, timezone, flag}]
├── src/
│   ├── components/
│   │   ├── CitySearch.tsx   # Autocomplétion de recherche
│   │   ├── CityCard.tsx     # Carte d'une ville avec heure + badge
│   │   ├── TimeSlider.tsx   # Slider horaire interactif
│   │   ├── DateTimePicker.tsx
│   │   └── ShareButtons.tsx
│   ├── hooks/
│   │   └── useTimezones.ts  # Logique de conversion des heures
│   ├── data/
│   │   └── cities.ts        # Import et typage du dataset
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── tailwind.config.ts
```

---

## Dataset `cities.json` — format attendu

```json
[
  { "name": "Paris", "country": "France", "countryCode": "FR", "timezone": "Europe/Paris", "flag": "🇫🇷" },
  { "name": "New York", "country": "United States", "countryCode": "US", "timezone": "America/New_York", "flag": "🇺🇸" },
  { "name": "Tokyo", "country": "Japan", "countryCode": "JP", "timezone": "Asia/Tokyo", "flag": "🇯🇵" },
  { "name": "Sydney", "country": "Australia", "countryCode": "AU", "timezone": "Australia/Sydney", "flag": "🇦🇺" },
  { "name": "London", "country": "United Kingdom", "countryCode": "GB", "timezone": "Europe/London", "flag": "🇬🇧" },
  { "name": "Dubai", "country": "UAE", "countryCode": "AE", "timezone": "Asia/Dubai", "flag": "🇦🇪" },
  { "name": "Singapore", "country": "Singapore", "countryCode": "SG", "timezone": "Asia/Singapore", "flag": "🇸🇬" },
  { "name": "São Paulo", "country": "Brazil", "countryCode": "BR", "timezone": "America/Sao_Paulo", "flag": "🇧🇷" },
  ...
]
```

Inclure au minimum les **150 plus grandes villes du monde** avec leurs timezones IANA correctes.

---

## Contraintes & bonnes pratiques

- Gérer correctement le **changement d'heure (DST)** via les timezones IANA (jamais d'offset fixe codé en dur).
- L'app fonctionne **100% côté client** (pas de backend nécessaire).
- Zéro dépendance à une API externe payante.
- Code TypeScript strict, composants bien typés.
- Performances : la recherche est debounced (300ms), le rendu des cartes mémoïsé (`useMemo`).

---

## Livrable attendu

Une application web fonctionnelle et déployable (ex. Vercel / Netlify) permettant à une équipe internationale de planifier ses réunions en un coup d'œil, sans jamais avoir à calculer les décalages horaires manuellement.
