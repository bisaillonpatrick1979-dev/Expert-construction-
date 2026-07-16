# 🏗️ Expert Construction IA

Application web : un agent IA **expert en construction dans tous les corps de métier**, propulsé par l'API Anthropic (Claude), qui s'adapte automatiquement au **code de construction de votre province canadienne ou de votre état américain**.

**🌐 En production : https://expert-construction-ia.vercel.app** (ajoutez `ANTHROPIC_API_KEY` dans Vercel → Settings → Environment Variables, puis redéployez, pour activer l'agent)

## Fonctionnalités

- 👷 **Expert tous métiers** : charpenterie-menuiserie, planchers, gypse/drywall, toiture, revêtement extérieur, plomberie, électricité, gaz, CVC, fondations, isolation, maçonnerie, etc.
- 📜 **Codes adaptés à la juridiction** : Code national du bâtiment + variations provinciales (Code de construction du Québec, Ontario Building Code, BC Building Code…), codes ICC (IBC/IRC/IPC/NEC…) selon l'état américain. L'agent vérifie les exigences en vigueur par recherche web au besoin.
- 🎤 **Reconnaissance vocale** (speech-to-text) : dictez vos questions (fr-CA, navigateurs Chrome/Edge).
- 🔊 **Réponses vocales** (text-to-speech) : activez le bouton « Voix » pour que l'agent vous réponde à voix haute.
- 📷 **Analyse de photos** : envoyez des photos d'un problème (fissure, moisissure, toiture, plomberie…) — l'agent diagnostique et propose des solutions.
- 📄 **Analyse de PDF** : plans, devis, soumissions.
- 🅰️🅱️ **Solutions en options A / B / C** : chaque option avec matériaux exacts, fixations (types de clous, vis, ancrages), outils, étapes et **estimation des coûts**.
- 🛒 **Fournisseurs et prix locaux** : l'agent cherche sur le web les fournisseurs les plus proches de votre ville (RONA, Home Depot, Canac, BMR, Lowe's…) et sort une liste de prix.
- 🌐 **Recherche web intégrée** (outil serveur Anthropic `web_search`) avec géolocalisation approximative selon la ville choisie.

## Pourquoi l'adaptation par juridiction?

La recherche le confirme :

- **Canada** : le Code national du bâtiment (CNB 2020; édition 2025 publiée en décembre 2025) n'a force de loi que lorsqu'une province l'adopte — chacune avec ses propres variations. Le Québec, l'Ontario, la C.-B. et l'Alberta ont leurs propres codes. Sources : [CNRC — CNB 2025](https://nrc.canada.ca/en/certifications-evaluations-standards/codes-canada/codes-canada-publications/national-building-code-canada-2025), [ConstructConnect](https://canada.constructconnect.com/dcn/news/government/2026/01/new-2025-national-model-codes-bring-new-and-not-so-new-standards), [McMillan — Ontario Building Code 2025](https://mcmillan.ca/insights/coming-soon-ontarios-new-building-code-january-1-2025/)
- **États-Unis** : les codes varient bel et bien par état. Les 50 états utilisent les codes modèles ICC (IBC, IRC…), mais avec des **éditions différentes** (2018/2021/2024) et des **amendements étatiques et municipaux**; certains états ont des codes propres (Californie Title 24, Florida Building Code). Sources : [ICC](https://www.iccsafe.org/products-and-services/i-codes/ibc/), [OneClick Code — adoption par état](https://www.oneclickcode.com/blog/building-code-adoption-states-local), [ICC Digital Codes — United States](https://codes.iccsafe.org/codes/united-states)

## Installation

```bash
git clone https://github.com/bisaillonpatrick1979-dev/expert-construction-.git
cd expert-construction-
npm install
cp .env.example .env
# Éditez .env et collez votre clé API Anthropic (ANTHROPIC_API_KEY)
npm start
```

Ouvrez ensuite http://localhost:3000

## Configuration

| Variable | Description | Défaut |
|---|---|---|
| `ANTHROPIC_API_KEY` | Clé API Anthropic (**requise**) | — |
| `ANTHROPIC_MODEL` | Modèle Claude utilisé | `claude-opus-4-8` |
| `PORT` | Port du serveur | `3000` |

La clé API reste **côté serveur** — elle n'est jamais exposée au navigateur.

## Déploiement sur Vercel

Le projet est prêt pour Vercel : `public/` est servi en statique et `api/index.js` expose l'app Express comme fonction serverless (streaming supporté, `maxDuration` 300 s).

1. Importez le dépôt dans Vercel (ou `vercel deploy`)
2. Dans **Settings → Environment Variables**, ajoutez `ANTHROPIC_API_KEY`
3. Redéployez — c'est tout

## Architecture

```
app.js             Application Express : relaie vers l'API Anthropic (streaming SSE),
                   prompt système "expert construction" + contexte de juridiction,
                   outil web_search côté serveur, gestion pause_turn/erreurs
server.js          Démarrage local (node server.js)
api/index.js       Point d'entrée serverless Vercel
vercel.json        Config Vercel (statique + rewrites /api/* + maxDuration)
public/index.html  Interface (chat, sélecteur pays/province/ville, boutons voix)
public/app.js      Logique client : streaming, Web Speech API (STT + TTS),
                   pièces jointes (images → vision, PDF → document), historique
public/styles.css  Styles
```

- **Modèle** : `claude-opus-4-8` avec réflexion adaptative (`thinking: adaptive`) et mise en cache du prompt système (`cache_control`).
- **Voix** : Web Speech API du navigateur (`SpeechRecognition` pour la dictée, `speechSynthesis` pour la lecture) — aucun service externe, aucun coût supplémentaire. Chrome/Edge recommandés pour la dictée.

## Notes de sécurité

L'agent rappelle systématiquement que certains travaux (gaz, électricité, structure) doivent légalement être exécutés par des professionnels licenciés selon la juridiction (ex. : RBQ/CMEQ/CMMTQ au Québec, ESA/TSSA en Ontario), et signale les risques (amiante, plomb, permis requis). Les prix trouvés en ligne sont des estimations à valider chez le fournisseur.
