/* Démarrage local : node server.js */
const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Expert Construction IA en ligne : http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("⚠️  ANTHROPIC_API_KEY non définie — copiez .env.example vers .env et ajoutez votre clé.");
  }
});
