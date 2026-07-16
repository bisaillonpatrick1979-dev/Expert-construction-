/* Fonction serverless Vercel : POST /api/chat (streaming SSE) */
const { handleChat } = require("../lib/expert");

module.exports = handleChat;
module.exports.config = { supportsResponseStreaming: true };
