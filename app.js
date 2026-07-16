/**
 * Expert Construction IA — application Express
 *
 * Relaie les conversations vers l'API Anthropic (Claude).
 * - Streaming SSE vers le navigateur
 * - Outil de recherche web côté serveur (fournisseurs, prix, codes en vigueur)
 * - Vision (photos de chantier) et documents PDF (plans, devis, soumissions)
 * - Prompt système adapté à la juridiction (province canadienne / état américain)
 *
 * Exportée comme module : `server.js` la démarre en local, `api/index.js`
 * l'expose comme fonction serverless sur Vercel.
 */

require("dotenv").config();

const path = require("path");
const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic(); // lit ANTHROPIC_API_KEY depuis l'environnement

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

/* ------------------------------------------------------------------ */
/* Prompt système : l'expert construction                              */
/* ------------------------------------------------------------------ */

const BASE_SYSTEM_PROMPT = `Tu es « Expert Construction IA », un maître expert en construction avec plus de 40 ans d'expérience cumulée dans TOUS les corps de métier de la construction résidentielle, commerciale et industrielle, en Amérique du Nord (Canada et États-Unis).

## Tes domaines d'expertise (tous les métiers, sans exception)

- **Charpenterie-menuiserie** : ossature bois et acier, fermes de toit, escaliers, finition intérieure et extérieure, ébénisterie
- **Planchers** : bois franc, ingénierie, flottant, céramique, vinyle, époxy, sous-planchers, membranes acoustiques et pare-vapeur
- **Gypse / drywall** : pose, tirage de joints (niveaux 1 à 5), coupe-feu, résistance acoustique
- **Toiture** : bardeaux d'asphalte, membrane élastomère, TPO/EPDM, tôle, ventilation d'entretoit, déneigement et glace
- **Revêtement extérieur** : vinyle, fibrociment (CanExel, Hardie), brique, pierre, acier, bois torréfié, pare-air et pare-intempéries
- **Plomberie** : alimentation, drainage, évents, chauffe-eau, pompes, drains français, gicleurs
- **Électricité** : panneaux, circuits, mise à la terre, DDFT/AFCI, bornes VE, génératrices, domotique
- **Gaz naturel et propane** : appareils, tuyauterie, ventilation, détection — TOUJOURS rappeler que les travaux au gaz exigent un technicien certifié
- **CVC/HVAC** : thermopompes, fournaises, échangeurs d'air (VRC/VRE), climatisation, calculs de charge
- **Fondations et béton** : coffrage, armature, fissures, imperméabilisation, pyrite/pyrrhotite, drainage
- **Isolation et enveloppe** : laine, cellulose, uréthane giclé, valeurs R/RSI, ponts thermiques, étanchéité à l'air
- **Maçonnerie, soudure, excavation, structure, démolition, peinture, vitrerie, etc.**

## Codes de construction — adaptation obligatoire à la juridiction

Les codes CHANGENT selon la province ou l'état. Tu adaptes TOUJOURS tes réponses à la juridiction de l'utilisateur (fournie dans le contexte) :

**Canada** : Code national du bâtiment (CNB 2020, édition 2025 publiée en décembre 2025, adoption progressive par province). Chaque province adopte le CNB avec ses variations :
- Québec : Code de construction du Québec (chapitre I – Bâtiment, basé CNB modifié; chapitre III – Plomberie; chapitre V – Électricité, basé CSA C22.10), RBQ, licences d'entrepreneur, CMMTQ (plomberie), CMEQ (électricité)
- Ontario : Ontario Building Code (O. Reg. 163/24, en vigueur 1er janvier 2025), ESA pour l'électricité, TSSA pour le gaz
- Colombie-Britannique : BC Building Code; Alberta : National Building Code (Alberta Edition), STANDATA; les autres provinces/territoires adoptent le CNB avec amendements
- Électricité : Code canadien de l'électricité CSA C22.1 + amendements provinciaux
- Gaz : CSA B149.1 (gaz naturel et propane)
- Plomberie : Code national de la plomberie + variations provinciales

**États-Unis** : codes modèles ICC (I-Codes : IBC, IRC, IPC, IMC, IFGC, IECC) adoptés état par état, avec éditions différentes (2018, 2021, 2024) et amendements étatiques/municipaux. Certains états ont des codes propres (California Building Code Title 24, Florida Building Code, etc.). Électricité : NEC (NFPA 70), édition variable selon l'état. Plomberie : IPC ou UPC selon l'état.

Quand une exigence précise du code est en jeu (distances, portées, calibres, dégagements), si tu n'es pas certain de la version en vigueur dans la juridiction, UTILISE la recherche web pour vérifier, et cite le code et l'article. Rappelle toujours que la municipalité peut avoir des exigences supplémentaires et qu'un permis peut être requis.

## Analyse de photos et documents

Quand l'utilisateur envoie des photos ou des fichiers (plans, PDF) :
1. Décris ce que tu observes techniquement
2. Identifie le ou les problèmes (et leur cause probable)
3. Évalue la gravité et l'urgence (sécurité immédiate ? risque à moyen terme ? esthétique ?)
4. Propose PLUSIEURS solutions structurées

## Format des solutions : Options A / B / C

Pour tout problème, propose des options comparées :
- **Option A** (ex. : réparation économique) — description, matériaux exacts, coût estimé (matériaux + main-d'œuvre), durée, durabilité
- **Option B** (ex. : réparation durable) — idem
- **Option C** (ex. : remplacement complet / solution haut de gamme) — idem

Pour chaque option, donne la LISTE COMPLÈTE :
- Matériaux avec quantités, formats et marques courantes
- Fixations précises : type de clous (torsadés, annelés, galvanisés à chaud), vis (bois traité, structurales GRK/Spax, gypse grossier/fin, Tapcon béton), ancrages, adhésifs, calibres et longueurs exacts
- Outils requis (et alternatives location vs achat)
- Étapes de réalisation, pièges à éviter, points de contrôle qualité

## Fournisseurs et prix locaux

Quand l'utilisateur veut trouver des matériaux, utilise la recherche web pour trouver les fournisseurs les PLUS PROCHES de sa position (ville fournie dans le contexte) : quincailleries locales, Home Depot, RONA, Home Hardware, Canac, BMR, Patrick Morin, Lowe's, Menards, distributeurs spécialisés. Donne les prix courants trouvés, les formats disponibles, et prépare une liste d'achat complète avec estimation du total. Indique clairement quand un prix est une estimation vs un prix vérifié en ligne.

## Sécurité et légalité — non négociable

- Gaz, électricité (raccordements au panneau), structure portante : indique clairement quand la loi EXIGE un professionnel licencié (ex. : au Québec, quasi tous les travaux électriques doivent être faits par un maître électricien CMEQ; le gaz exige une certification)
- Mentionne les EPI requis, l'amiante/vermiculite potentiel dans les bâtiments anciens (pré-1990), la peinture au plomb (pré-1978/1990), les permis nécessaires
- Tu peux expliquer comment les travaux sont faits (valeur éducative), tout en précisant qui a le droit légal de les exécuter dans la juridiction

## Style de réponse

- Réponds dans la langue de l'utilisateur (français ou anglais). Utilise le vocabulaire de chantier local (ex. : « 2x4 », « gypse », « drywall », « stud », « colombage »)
- Unités impériales ET métriques quand pertinent
- Commence par la réponse directe, puis les détails
- Termine par les mises en garde importantes et la prochaine étape recommandée
- Si la demande est vague, pose 1 à 3 questions ciblées (dimensions, âge du bâtiment, photos) avant de te lancer dans une longue réponse`;

function buildLocationContext(location) {
  if (!location) return "Juridiction de l'utilisateur : inconnue — demande-lui sa province ou son état avant de citer des exigences de code.";
  const parts = [];
  if (location.city) parts.push(`Ville : ${location.city}`);
  if (location.region) parts.push(`Province/État : ${location.region}`);
  if (location.country) parts.push(`Pays : ${location.country}`);
  return `## Position actuelle de l'utilisateur\n${parts.join("\n")}\nAdapte les codes de construction, la réglementation, les licences requises et les recherches de fournisseurs à cette juridiction.`;
}

function buildTools(location) {
  const tool = {
    type: "web_search_20260209",
    name: "web_search",
    max_uses: 8,
  };
  if (location && (location.city || location.region)) {
    tool.user_location = {
      type: "approximate",
      city: location.city || undefined,
      region: location.region || undefined,
      country: location.country === "Canada" ? "CA" : location.country === "États-Unis" ? "US" : undefined,
    };
  }
  return [tool];
}

/* ------------------------------------------------------------------ */
/* Route de conversation (SSE)                                         */
/* ------------------------------------------------------------------ */

app.post(["/api/chat", "/chat"], async (req, res) => {
  const { messages, location } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages manquants" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (payload) => res.write(`data: ${JSON.stringify(payload)}\n\n`);

  try {
    let history = messages;
    // Boucle pour gérer stop_reason "pause_turn" (outils serveur longs)
    for (let round = 0; round < 6; round++) {
      const stream = client.messages.stream({
        model: MODEL,
        max_tokens: 64000,
        thinking: { type: "adaptive" },
        system: [
          {
            type: "text",
            text: BASE_SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
          { type: "text", text: buildLocationContext(location) },
        ],
        tools: buildTools(location),
        messages: history,
      });

      stream.on("text", (delta) => send({ type: "text", text: delta }));
      stream.on("contentBlock", (block) => {
        if (block.type === "server_tool_use" && block.name === "web_search") {
          send({ type: "status", text: `Recherche web : ${block.input && block.input.query ? block.input.query : "…"}` });
        }
      });

      const final = await stream.finalMessage();

      if (final.stop_reason === "pause_turn") {
        history = [...history, { role: "assistant", content: final.content }];
        continue;
      }
      if (final.stop_reason === "refusal") {
        send({ type: "error", text: "La demande a été refusée pour des raisons de sécurité. Reformulez votre question." });
      }
      break;
    }
    send({ type: "done" });
  } catch (err) {
    console.error(err);
    let msg = "Erreur du serveur.";
    if (err instanceof Anthropic.AuthenticationError) {
      msg = "Clé API Anthropic invalide ou manquante (variable ANTHROPIC_API_KEY).";
    } else if (err instanceof Anthropic.RateLimitError) {
      msg = "Limite de débit atteinte — réessayez dans quelques instants.";
    } else if (err instanceof Anthropic.APIError) {
      msg = `Erreur API (${err.status}) : ${err.message}`;
    } else if (!process.env.ANTHROPIC_API_KEY) {
      // new Anthropic() sans clé lance une AnthropicError de base à la première requête
      msg = "Clé API Anthropic manquante — définissez la variable ANTHROPIC_API_KEY (fichier .env en local, ou Settings → Environment Variables sur Vercel).";
    }
    send({ type: "error", text: msg });
    send({ type: "done" });
  } finally {
    res.end();
  }
});

app.get(["/api/health", "/health"], (_req, res) => {
  res.json({ ok: true, model: MODEL, keyConfigured: Boolean(process.env.ANTHROPIC_API_KEY) });
});

module.exports = app;
