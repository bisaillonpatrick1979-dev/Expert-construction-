/* Expert Construction IA — client */

(() => {
  "use strict";

  /* ---------------- Juridictions ---------------- */

  const REGIONS = {
    "Canada": [
      "Québec", "Ontario", "Colombie-Britannique", "Alberta", "Manitoba",
      "Saskatchewan", "Nouvelle-Écosse", "Nouveau-Brunswick",
      "Terre-Neuve-et-Labrador", "Île-du-Prince-Édouard",
      "Yukon", "Territoires du Nord-Ouest", "Nunavut",
    ],
    "États-Unis": [
      "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
      "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia",
      "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
      "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
      "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
      "New Hampshire", "New Jersey", "New Mexico", "New York",
      "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
      "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
      "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
      "West Virginia", "Wisconsin", "Wyoming",
    ],
  };

  /* ---------------- Langues (interface + IA + voix) ---------------- */

  const LANGS = {
    fr: {
      speech: "fr-CA",
      tagline: "Tous les métiers · Codes adaptés à votre province ou état",
      cityPlaceholder: "Ville (ex. : Sainte-Marie)",
      inputPlaceholder: "Décrivez votre problème de construction… (Entrée pour envoyer)",
      voiceOn: "🔊 Voix",
      voiceOff: "🔇 Voix",
      analyzeFiles: "Analyse les fichiers joints et identifie les problèmes.",
      micUnsupported: "La reconnaissance vocale n'est pas supportée par ce navigateur. Utilisez Chrome ou Edge.",
      micDenied: "Accès au micro refusé. Autorisez le micro dans votre navigateur.",
      serverUnreachable: "Impossible de contacter le serveur : ",
      codeBlock: " (bloc de code) ",
      welcome: `<p><strong>Bonjour! 👷</strong> Je suis votre expert en construction — charpenterie, planchers, gypse, toiture, revêtement extérieur, plomberie, électricité, gaz, CVC, fondations… tous les métiers.</p>
        <p>Je m'adapte au code de construction de <em>votre</em> province ou état (sélectionnez-le en haut). Vous pouvez :</p>
        <ul>
          <li>🎤 me parler (bouton micro)</li>
          <li>📷 m'envoyer des photos d'un problème ou des plans PDF</li>
          <li>🛒 me demander où trouver les matériaux au meilleur prix près de chez vous</li>
        </ul>
        <p>Décrivez votre projet ou votre problème!</p>`,
    },
    en: {
      speech: "en-US",
      tagline: "Every trade · Codes adapted to your province or state",
      cityPlaceholder: "City (e.g., Edmonton)",
      inputPlaceholder: "Describe your construction problem… (Enter to send)",
      voiceOn: "🔊 Voice",
      voiceOff: "🔇 Voice",
      analyzeFiles: "Analyze the attached files and identify the problems.",
      micUnsupported: "Speech recognition is not supported by this browser. Use Chrome or Edge.",
      micDenied: "Microphone access denied. Allow the microphone in your browser.",
      serverUnreachable: "Unable to reach the server: ",
      codeBlock: " (code block) ",
      welcome: `<p><strong>Hello! 👷</strong> I'm your construction expert — framing, flooring, drywall, roofing, siding, plumbing, electrical, gas, HVAC, foundations… every trade.</p>
        <p>I adapt to the building code of <em>your</em> province or state (select it above). You can:</p>
        <ul>
          <li>🎤 talk to me (mic button)</li>
          <li>📷 send me photos of a problem or PDF plans</li>
          <li>🛒 ask me where to find materials at the best price near you</li>
        </ul>
        <p>Describe your project or your problem!</p>`,
    },
    es: {
      speech: "es-ES",
      tagline: "Todos los oficios · Códigos adaptados a su provincia o estado",
      cityPlaceholder: "Ciudad (ej.: Miami)",
      inputPlaceholder: "Describa su problema de construcción… (Enter para enviar)",
      voiceOn: "🔊 Voz",
      voiceOff: "🔇 Voz",
      analyzeFiles: "Analiza los archivos adjuntos e identifica los problemas.",
      micUnsupported: "El reconocimiento de voz no es compatible con este navegador. Use Chrome o Edge.",
      micDenied: "Acceso al micrófono denegado. Permita el micrófono en su navegador.",
      serverUnreachable: "No se puede contactar con el servidor: ",
      codeBlock: " (bloque de código) ",
      welcome: `<p><strong>¡Hola! 👷</strong> Soy su experto en construcción — carpintería, pisos, drywall, techos, revestimiento, plomería, electricidad, gas, HVAC, cimientos… todos los oficios.</p>
        <p>Me adapto al código de construcción de <em>su</em> provincia o estado (selecciónelo arriba). Usted puede:</p>
        <ul>
          <li>🎤 hablarme (botón del micrófono)</li>
          <li>📷 enviarme fotos de un problema o planos PDF</li>
          <li>🛒 preguntarme dónde encontrar materiales al mejor precio cerca de usted</li>
        </ul>
        <p>¡Describa su proyecto o su problema!</p>`,
    },
  };

  /* ---------------- Éléments DOM ---------------- */

  const chatEl = document.getElementById("chat");
  const inputEl = document.getElementById("input");
  const sendBtn = document.getElementById("sendBtn");
  const micBtn = document.getElementById("micBtn");
  const attachBtn = document.getElementById("attachBtn");
  const fileInput = document.getElementById("fileInput");
  const attachmentsEl = document.getElementById("attachments");
  const countryEl = document.getElementById("country");
  const regionEl = document.getElementById("region");
  const cityEl = document.getElementById("city");
  const ttsToggle = document.getElementById("ttsToggle");
  const langEl = document.getElementById("lang");
  const taglineEl = document.getElementById("tagline");
  const welcomeEl = document.getElementById("welcome");

  /* ---------------- État ---------------- */

  const history = []; // format API Anthropic : [{role, content}]
  let pendingFiles = []; // {name, mediaType, base64, isImage}
  let busy = false;
  let ttsEnabled = false;

  /* ---------------- Choix de langue ---------------- */

  function currentLang() {
    return LANGS[langEl.value] || LANGS.fr;
  }

  function applyLanguage() {
    const L = currentLang();
    document.documentElement.lang = langEl.value;
    taglineEl.textContent = L.tagline;
    cityEl.placeholder = L.cityPlaceholder;
    inputEl.placeholder = L.inputPlaceholder;
    ttsToggle.textContent = ttsEnabled ? L.voiceOn : L.voiceOff;
    // Le message d'accueil n'est retraduit que s'il est encore le premier et seul message
    if (welcomeEl && chatEl.querySelectorAll(".message").length === 1) {
      welcomeEl.innerHTML = L.welcome;
    }
    if (recognition) recognition.lang = L.speech;
  }

  langEl.addEventListener("change", () => {
    localStorage.setItem("eci-lang", langEl.value);
    applyLanguage();
  });

  function restoreLanguage() {
    const saved = localStorage.getItem("eci-lang");
    if (saved && LANGS[saved]) langEl.value = saved;
  }

  /* ---------------- Juridiction ---------------- */

  function fillRegions() {
    const regions = REGIONS[countryEl.value];
    regionEl.innerHTML = regions.map((r) => `<option>${r}</option>`).join("");
  }
  countryEl.addEventListener("change", () => { fillRegions(); saveLocation(); });
  regionEl.addEventListener("change", saveLocation);
  cityEl.addEventListener("change", saveLocation);

  function saveLocation() {
    localStorage.setItem("eci-location", JSON.stringify(getLocation()));
  }
  function getLocation() {
    return { country: countryEl.value, region: regionEl.value, city: cityEl.value.trim() };
  }
  function restoreLocation() {
    fillRegions();
    try {
      const saved = JSON.parse(localStorage.getItem("eci-location") || "null");
      if (saved) {
        if (REGIONS[saved.country]) countryEl.value = saved.country;
        fillRegions();
        if (saved.region) regionEl.value = saved.region;
        cityEl.value = saved.city || "";
      }
    } catch { /* ignorer */ }
  }
  restoreLocation();

  /* ---------------- Rendu markdown minimal ---------------- */

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function renderMarkdown(md) {
    const codeBlocks = [];
    md = md.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
      codeBlocks.push(`<pre><code>${escapeHtml(code)}</code></pre>`);
      return `\u0000${codeBlocks.length - 1}\u0000`;
    });

    let html = escapeHtml(md);
    html = html.replace(/`([^`\n]+)`/g, "<code>$1</code>");
    html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>");
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/(^|\s)\*([^*\n]+)\*/g, "$1<em>$2</em>");

    // Tableaux simples
    html = html.replace(/((?:^\|.*\|\s*$\n?)+)/gm, (block) => {
      const rows = block.trim().split("\n").filter((r) => !/^\|[\s:-]+\|$/.test(r.replace(/\|/g, "|")));
      const cells = rows
        .filter((r) => !/^\|[\s|:-]+$/.test(r))
        .map((r, i) => {
          const tag = i === 0 ? "th" : "td";
          const cols = r.split("|").slice(1, -1).map((c) => `<${tag}>${c.trim()}</${tag}>`).join("");
          return `<tr>${cols}</tr>`;
        });
      return `<table>${cells.join("")}</table>`;
    });

    // Listes
    html = html.replace(/((?:^[-*] .*$\n?)+)/gm, (block) => {
      const items = block.trim().split("\n").map((l) => `<li>${l.replace(/^[-*] /, "")}</li>`).join("");
      return `<ul>${items}</ul>`;
    });
    html = html.replace(/((?:^\d+\. .*$\n?)+)/gm, (block) => {
      const items = block.trim().split("\n").map((l) => `<li>${l.replace(/^\d+\. /, "")}</li>`).join("");
      return `<ol>${items}</ol>`;
    });

    // Paragraphes
    html = html
      .split(/\n{2,}/)
      .map((p) => (/^<(h\d|ul|ol|table|pre)/.test(p.trim()) ? p : `<p>${p.replace(/\n/g, "<br>")}</p>`))
      .join("");

    html = html.replace(/\u0000(\d+)\u0000/g, (_, i) => codeBlocks[Number(i)]);
    return html;
  }

  /* ---------------- Affichage des messages ---------------- */

  function addUserMessage(text, files) {
    const div = document.createElement("div");
    div.className = "message user";
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    if (text) {
      const p = document.createElement("p");
      p.textContent = text;
      bubble.appendChild(p);
    }
    for (const f of files) {
      if (f.isImage) {
        const img = document.createElement("img");
        img.className = "thumb";
        img.src = `data:${f.mediaType};base64,${f.base64}`;
        bubble.appendChild(img);
      } else {
        const p = document.createElement("p");
        p.textContent = `📄 ${f.name}`;
        bubble.appendChild(p);
      }
    }
    div.appendChild(bubble);
    chatEl.appendChild(div);
    scrollToBottom();
  }

  function addAssistantBubble() {
    const div = document.createElement("div");
    div.className = "message assistant";
    const bubble = document.createElement("div");
    bubble.className = "bubble typing";
    div.appendChild(bubble);
    chatEl.appendChild(div);
    scrollToBottom();
    return bubble;
  }

  function addStatus(text) {
    const div = document.createElement("div");
    div.className = "status-line";
    div.textContent = `🔎 ${text}`;
    chatEl.appendChild(div);
    scrollToBottom();
    return div;
  }

  function scrollToBottom() {
    chatEl.scrollTop = chatEl.scrollHeight;
  }

  /* ---------------- Pièces jointes ---------------- */

  attachBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", async () => {
    for (const file of fileInput.files) {
      if (file.size > 25 * 1024 * 1024) {
        alert(`« ${file.name} » dépasse 25 Mo.`);
        continue;
      }
      const base64 = await fileToBase64(file);
      pendingFiles.push({
        name: file.name,
        mediaType: file.type,
        base64,
        isImage: file.type.startsWith("image/"),
      });
    }
    fileInput.value = "";
    renderAttachments();
  });

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function renderAttachments() {
    attachmentsEl.innerHTML = "";
    pendingFiles.forEach((f, i) => {
      const chip = document.createElement("div");
      chip.className = "attach-chip";
      if (f.isImage) {
        const img = document.createElement("img");
        img.src = `data:${f.mediaType};base64,${f.base64}`;
        chip.appendChild(img);
      } else {
        chip.append("📄");
      }
      chip.append(f.name.length > 28 ? f.name.slice(0, 25) + "…" : f.name);
      const rm = document.createElement("button");
      rm.textContent = "✕";
      rm.title = "Retirer";
      rm.addEventListener("click", () => {
        pendingFiles.splice(i, 1);
        renderAttachments();
      });
      chip.appendChild(rm);
      attachmentsEl.appendChild(chip);
    });
  }

  /* ---------------- Reconnaissance vocale (speech-to-text) ---------------- */

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let recording = false;

  // Sur Chrome Android, le mode continu répète les résultats finaux (mots
  // doublés/triplés). On désactive le mode continu sur mobile et on relance
  // la reconnaissance automatiquement tant que l'utilisateur n'arrête pas.
  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = currentLang().speech;
    recognition.interimResults = true;
    recognition.continuous = !isMobile;

    let baseText = "";
    let finalText = "";
    recognition.onstart = () => {
      baseText = inputEl.value ? inputEl.value + " " : "";
      finalText = "";
    };
    recognition.onresult = (event) => {
      let interim = "";
      // Ne parcourir que les nouveaux résultats (resultIndex) au lieu de tout
      // relire à chaque événement — c'était la cause principale du doublage.
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          // Garde anti-doublon : certains navigateurs réémettent le même
          // résultat final plusieurs fois.
          const trimmed = transcript.trim();
          if (trimmed && !finalText.trim().endsWith(trimmed)) {
            finalText += transcript + " ";
          }
        } else {
          interim += transcript;
        }
      }
      inputEl.value = (baseText + finalText + interim).replace(/\s{2,}/g, " ").trimStart();
      autoGrow();
    };
    recognition.onend = () => {
      // En mode non continu (mobile), relancer tant que l'utilisateur enregistre
      if (recording && !recognition.continuous) {
        baseText = inputEl.value ? inputEl.value + " " : "";
        finalText = "";
        try { recognition.start(); return; } catch { /* fin normale */ }
      }
      recording = false;
      micBtn.classList.remove("recording");
      micBtn.textContent = "🎤";
    };
    recognition.onerror = (e) => {
      if (e.error === "not-allowed") {
        recording = false;
        alert(currentLang().micDenied);
      }
    };
  } else {
    micBtn.title = "Reconnaissance vocale non supportée par ce navigateur (utilisez Chrome ou Edge)";
  }

  micBtn.addEventListener("click", () => {
    if (!recognition) {
      alert(currentLang().micUnsupported);
      return;
    }
    if (recording) {
      recording = false; // avant stop() pour empêcher la relance automatique
      recognition.stop();
      micBtn.classList.remove("recording");
      micBtn.textContent = "🎤";
    } else {
      recognition.lang = currentLang().speech;
      recording = true;
      micBtn.classList.add("recording");
      micBtn.textContent = "⏹";
      recognition.start();
    }
  });

  /* ---------------- Synthèse vocale (text-to-speech) ---------------- */

  ttsToggle.addEventListener("click", () => {
    ttsEnabled = !ttsEnabled;
    const L = currentLang();
    ttsToggle.classList.toggle("on", ttsEnabled);
    ttsToggle.textContent = ttsEnabled ? L.voiceOn : L.voiceOff;
    ttsToggle.setAttribute("aria-pressed", String(ttsEnabled));
    if (!ttsEnabled) speechSynthesis.cancel();
  });

  // Nettoie le texte pour la lecture : markdown, émojis, symboles décoratifs
  function textForSpeech(text, L) {
    return text
      .replace(/```[\s\S]*?```/g, L.codeBlock)
      // Émojis et pictogrammes (🛒 📷 ⚠️ 👷 …) + drapeaux + sélecteurs de variante
      .replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}\u{20E3}]/gu, " ")
      // Symboles markdown et décoratifs
      .replace(/[#*_`>|•·–—✕✓✔✗]/g, " ")
      // Tirets de listes en début de ligne
      .replace(/^\s*-\s+/gm, "")
      .replace(/\n+/g, ". ")
      .replace(/\s{2,}/g, " ")
      .replace(/(\.\s*){2,}/g, ". ")
      .trim();
  }

  // Choisit la voix la plus naturelle disponible dans la langue demandée.
  // Les voix « Natural/Neural » (Edge), « Google » (Chrome) et
  // « Enhanced/Premium » (iOS/macOS) sonnent bien mieux que les voix
  // système par défaut, souvent robotiques.
  function pickVoice(speechLang) {
    const voices = speechSynthesis.getVoices();
    const wanted = speechLang.toLowerCase();
    const base = wanted.slice(0, 2);
    const candidates = voices.filter((v) =>
      v.lang.replace("_", "-").toLowerCase().startsWith(base)
    );
    const score = (v) => {
      const name = v.name.toLowerCase();
      const lang = v.lang.replace("_", "-").toLowerCase();
      let s = 0;
      if (/natural|neural/.test(name)) s += 10; // Microsoft Edge (très naturelles)
      if (name.includes("google")) s += 8;      // Chrome
      if (/enhanced|premium|siri/.test(name)) s += 8; // iOS / macOS
      if (name.includes("online")) s += 4;
      if (!v.localService) s += 3;              // voix en ligne = meilleure qualité
      if (lang === wanted) s += 2;              // dialecte exact (ex. fr-CA)
      if (v.default) s += 1;
      return s;
    };
    return candidates.sort((a, b) => score(b) - score(a))[0] || null;
  }

  function speak(text) {
    if (!ttsEnabled || !("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const L = currentLang();
    const plain = textForSpeech(text, L);
    if (!plain) return;
    const utterance = new SpeechSynthesisUtterance(plain);
    const voice = pickVoice(L.speech);
    if (voice) utterance.voice = voice;
    utterance.lang = voice ? voice.lang : L.speech;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    speechSynthesis.speak(utterance);
  }
  // Certains navigateurs chargent les voix en différé
  if ("speechSynthesis" in window) {
    speechSynthesis.getVoices();
    if (typeof speechSynthesis.onvoiceschanged !== "undefined") {
      speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
    }
  }

  /* ---------------- Envoi ---------------- */

  function autoGrow() {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 180) + "px";
  }
  inputEl.addEventListener("input", autoGrow);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  sendBtn.addEventListener("click", sendMessage);

  restoreLanguage();
  applyLanguage();

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (busy || (!text && pendingFiles.length === 0)) return;

    if (recording && recognition) recognition.stop();

    busy = true;
    sendBtn.disabled = true;

    const files = pendingFiles;
    pendingFiles = [];
    renderAttachments();
    inputEl.value = "";
    autoGrow();

    addUserMessage(text, files);

    // Construire le contenu au format API
    const content = [];
    for (const f of files) {
      if (f.isImage) {
        content.push({
          type: "image",
          source: { type: "base64", media_type: f.mediaType, data: f.base64 },
        });
      } else {
        content.push({
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: f.base64 },
        });
      }
    }
    content.push({ type: "text", text: text || currentLang().analyzeFiles });
    history.push({ role: "user", content });

    const bubble = addAssistantBubble();
    let assistantText = ""; // texte réel du modèle (seul lui entre dans l'historique)
    let errorText = "";     // erreurs/refus : affichés, mais JAMAIS mémorisés
    let statusEl = null;

    const renderBubble = () => {
      const combined =
        assistantText + (errorText ? (assistantText ? "\n\n" : "") + "⚠️ " + errorText : "");
      bubble.innerHTML = renderMarkdown(combined);
    };

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, location: getLocation(), language: langEl.value }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Erreur serveur (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          let event;
          try { event = JSON.parse(line.slice(6)); } catch { continue; }

          if (event.type === "text") {
            assistantText += event.text;
            renderBubble();
            scrollToBottom();
          } else if (event.type === "status") {
            if (statusEl) statusEl.remove();
            statusEl = addStatus(event.text);
          } else if (event.type === "error") {
            errorText = event.text;
            renderBubble();
          }
        }
      }
    } catch (err) {
      if (!errorText) errorText = currentLang().serverUnreachable + err.message;
      renderBubble();
    } finally {
      bubble.classList.remove("typing");
      if (statusEl) statusEl.remove();
      if (assistantText) {
        history.push({ role: "assistant", content: assistantText });
        speak(assistantText);
      } else {
        // Aucune vraie réponse (erreur ou refus) : retirer le tour utilisateur
        // pour que l'échec ne contamine pas la suite de la conversation
        history.pop();
      }
      busy = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }
})();
