"use client";

import { useEffect } from "react";

export function GeminiClient() {
  useEffect(() => {
    // Gemini API Helper Function
    const callGemini = async (prompt: string, button: HTMLButtonElement) => {
      const originalButtonContent = button.innerHTML;
      button.disabled = true;
      button.innerHTML = `<div class="loader mx-auto border-4 border-gray-300 border-t-indigo-600 rounded-full w-6 h-6 animate-spin"></div>`;

      try {
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const apiKey = ""; // Leave empty for now
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
        
        const result = await response.json();
        if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
          return result.candidates[0].content.parts[0].text;
        } else {
          return "Entschuldigung, es gab ein Problem bei der Generierung.";
        }
      } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.";
      } finally {
        button.disabled = false;
        button.innerHTML = originalButtonContent;
      }
    };

    // Post Generator Logic
    const generatePostBtn = document.getElementById('generate-post-btn') as HTMLButtonElement;
    const businessTypeInput = document.getElementById('business-type') as HTMLInputElement;
    const postTopicInput = document.getElementById('post-topic') as HTMLInputElement;
    const resultsArea = document.getElementById('results-area');
    const postOutput = document.getElementById('post-output');
    const postLoader = document.getElementById('post-loader');
    const postActions = document.getElementById('post-actions');

    if (generatePostBtn) {
      generatePostBtn.addEventListener('click', async () => {
        const businessType = businessTypeInput?.value.trim();
        const postTopic = postTopicInput?.value.trim();

        if (!businessType || !postTopic) {
          alert('Bitte füllen Sie beide Felder aus.');
          return;
        }
        
        // Show results area and loader
        resultsArea?.classList.remove('hidden');
        postActions?.classList.add('hidden');
        document.getElementById('image-ideas-card')?.classList.add('hidden');
        document.getElementById('hashtags-card')?.classList.add('hidden');
        postOutput?.classList.add('hidden');
        postLoader?.classList.remove('hidden');
        postLoader?.classList.add('flex');

        const prompt = `Du bist ein Social-Media-Experte für lokale Geschäfte in der DACH-Region. 

WICHTIG: Analysiere zuerst den Geschäftstyp "${businessType}" und das Thema "${postTopic}" um den passenden Tonfall zu bestimmen:

TONALITÄT-ANALYSE:
- Für Cafés, Restaurants, Bäckereien: Locker, herzlich, einladend
- Für Anwaltskanzleien, Steuerberater, Ärzte: Professionell, vertrauensvoll, seriös  
- Für Friseure, Beauty-Salons, Mode: Trendig, inspirierend, lifestyle-orientiert
- Für Handwerker, Autowerkstätten: Bodenständig, kompetent, zuverlässig
- Für Fitness-Studios, Yoga: Motivierend, energisch, gesundheitsbewusst

STIL-ANPASSUNG basierend auf Geschäftstyp:
1. LOCKER & WITZIG: Verwende umgangssprachliche Ausdrücke, Wortspiele, lockere Ansprache ("Hey", "Schaut mal"), mehr Emojis
2. PROFESSIONELL & INFORMATIV: Höfliche Sie-Form, sachliche Informationen, weniger Emojis, vertrauensvolle Sprache

Erstelle einen authentischen Social-Media-Post (4-5 Sätze) der GENAU zum Geschäftstyp passt. Der Post soll so klingen, als hätte ihn der Geschäftsinhaber selbst geschrieben - nicht wie generische KI-Texte.

Geschäftstyp: ${businessType}
Thema: "${postTopic}"

Sprich die Zielgruppe direkt an und verwende den passenden Tonfall für diesen Geschäftstyp.`;
        
        const generatedPost = await callGemini(prompt, generatePostBtn);
        
        postLoader?.classList.add('hidden');
        postLoader?.classList.remove('flex');
        if (postOutput) postOutput.textContent = generatedPost;
        postOutput?.classList.remove('hidden');
        postActions?.classList.remove('hidden');
      });
    }

    // Image Idea Generator Logic
    const generateImagesBtn = document.getElementById('generate-images-btn') as HTMLButtonElement;
    const imageIdeasCard = document.getElementById('image-ideas-card');
    const imageIdeasOutput = document.getElementById('image-ideas-output');
    const imageIdeasLoader = document.getElementById('image-ideas-loader');

    if (generateImagesBtn) {
      generateImagesBtn.addEventListener('click', async () => {
        const postText = postOutput?.textContent;
        if (!postText) return;

        imageIdeasCard?.classList.remove('hidden');
        imageIdeasOutput?.classList.add('hidden');
        imageIdeasLoader?.classList.remove('hidden');
        imageIdeasLoader?.classList.add('flex');

        const prompt = `Du bist ein Foto-Regisseur für Social Media Content. Basierend auf diesem Post: "${postText}"

Erstelle 3 detaillierte REGIE-ANWEISUNGEN für Bilder/Videos, die ein Kleinunternehmer mit dem Smartphone umsetzen kann:

FORMAT für jede Idee:
📸 BILD-IDEE [Nummer]: [Kurzer Titel]
🎬 WAS FOTOGRAFIEREN: [Genaue Beschreibung des Motivs]
📐 AUFNAHME-WINKEL: [Perspektive, z.B. "Von oben", "Augenhöhe", "Leicht schräg"]
💡 LICHT-TIPP: [Beleuchtung, z.B. "Natürliches Licht vom Fenster", "Warmes Abendlicht"]
🎨 STYLING: [Anordnung, Farben, Requisiten]
📱 SMARTPHONE-TIPP: [Technische Hinweise für bessere Qualität]

Die Ideen sollen:
- Zum Geschäftstyp und Post-Inhalt passen
- Mit einfachen Mitteln umsetzbar sein
- Professionell aussehen
- Engagement fördern

Geschäftstyp aus Post ableiten und passende Bildideen entwickeln.`;

        const generatedIdeas = await callGemini(prompt, generateImagesBtn);
        
        imageIdeasLoader?.classList.add('hidden');
        imageIdeasLoader?.classList.remove('flex');
        if (imageIdeasOutput) imageIdeasOutput.textContent = generatedIdeas;
        imageIdeasOutput?.classList.remove('hidden');
      });
    }

    // Hashtag Generator Logic
    const generateHashtagsBtn = document.getElementById('generate-hashtags-btn') as HTMLButtonElement;
    const hashtagsCard = document.getElementById('hashtags-card');
    const hashtagsOutput = document.getElementById('hashtags-output');
    const hashtagsLoader = document.getElementById('hashtags-loader');

    if (generateHashtagsBtn) {
      generateHashtagsBtn.addEventListener('click', async () => {
        const postText = postOutput?.textContent;
        const businessType = businessTypeInput?.value.trim();
        if (!postText) return;

        hashtagsCard?.classList.remove('hidden');
        hashtagsOutput?.classList.add('hidden');
        hashtagsLoader?.classList.remove('hidden');
        hashtagsLoader?.classList.add('flex');

        const prompt = `Gib mir 5-7 relevante und effektive Hashtags (nur die Hashtags, mit # am Anfang, durch Leerzeichen getrennt) für diesen Social-Media-Post für ein/e ${businessType}: "${postText}"`;

        const generatedHashtags = await callGemini(prompt, generateHashtagsBtn);
        
        hashtagsLoader?.classList.add('hidden');
        hashtagsLoader?.classList.remove('flex');
        if (hashtagsOutput) hashtagsOutput.textContent = generatedHashtags;
        hashtagsOutput?.classList.remove('hidden');
      });
    }

    // Chat Widget Logic
    const chatButton = document.getElementById('chat-button');
    const chatWindow = document.getElementById('chat-window');
    const closeChatButton = document.getElementById('close-chat-button');
    const chatForm = document.getElementById('chat-form') as HTMLFormElement;
    const chatInput = document.getElementById('chat-input') as HTMLInputElement;
    const chatMessages = document.getElementById('chat-messages');
    const languageSelector = document.getElementById('language-selector') as HTMLSelectElement;
    let chatHistory: any[] = [];

    const toggleChatWindow = () => {
      chatWindow?.classList.toggle('hidden');
      chatWindow?.classList.toggle('flex');
      if (!chatWindow?.classList.contains('hidden')) chatInput?.focus();
    };

    chatButton?.addEventListener('click', toggleChatWindow);
    closeChatButton?.addEventListener('click', toggleChatWindow);

    const addMessage = (sender: string, message: string) => {
      const messageContainer = document.createElement('div');
      messageContainer.classList.add('flex', sender === 'user' ? 'justify-end' : 'justify-start');
      const messageBubble = document.createElement('div');
      messageBubble.classList.add('max-w-[80%]', 'rounded-lg', 'p-3');
      messageBubble.classList.add(sender === 'user' ? 'bg-indigo-600' : 'bg-gray-200');
      messageBubble.classList.add(sender === 'user' ? 'text-white' : 'text-gray-800');
      messageBubble.textContent = message;
      messageContainer.appendChild(messageBubble);
      chatMessages?.appendChild(messageContainer);
      if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const showTypingIndicator = () => {
      const typingIndicator = document.createElement('div');
      typingIndicator.id = 'typing-indicator';
      typingIndicator.classList.add('flex', 'justify-start');
      typingIndicator.innerHTML = `<div class="max-w-[80%] rounded-lg p-3 bg-gray-200 text-gray-800 flex items-center space-x-1"><span class="block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: -0.32s;"></span><span class="block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: -0.16s;"></span><span class="block w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span></div>`;
      chatMessages?.appendChild(typingIndicator);
      if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const removeTypingIndicator = () => {
      const typingIndicator = document.getElementById('typing-indicator');
      if (typingIndicator) typingIndicator.remove();
    };

    if (chatForm) {
      chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userInput = chatInput?.value.trim();
        if (!userInput) return;

        addMessage('user', userInput);
        chatHistory.push({ role: "user", parts: [{ text: userInput }] });
        if (chatInput) chatInput.value = '';
        const submitButton = chatForm.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (submitButton) submitButton.disabled = true;
        showTypingIndicator();

        try {
          const selectedLanguage = languageSelector?.value || 'Deutsch';
          let languageInstruction = `Please respond ONLY in ${selectedLanguage}.`;
          if (selectedLanguage === 'Schweizerisch') languageInstruction = `Please respond ONLY in Swiss German dialect (Schweizerdeutsch).`;
          
          const systemInstruction = `You are a friendly and helpful assistant for "Content-Zauber", a web app that helps local businesses create social media posts with AI. Your goal is to answer user questions about the service, its features, and pricing. Be concise and helpful. ${languageInstruction}`;
          const apiHistory = [
            { role: "user", parts: [{ text: systemInstruction }] },
            { role: "model", parts: [{ text: "Okay, I understand." }] },
            ...chatHistory
          ];

          const payload = { contents: apiHistory };
          const apiKey = "";
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
          const result = await response.json();
          removeTypingIndicator();

          let aiResponse = "Entschuldigung, ich konnte keine Antwort generieren.";
          if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            aiResponse = result.candidates[0].content.parts[0].text;
          }

          addMessage('ai', aiResponse);
          chatHistory.push({ role: "model", parts: [{ text: aiResponse }] });
        } catch (error) {
          console.error("Error calling Gemini API:", error);
          removeTypingIndicator();
          addMessage('ai', 'Es ist ein Fehler aufgetreten.');
        } finally {
          if (submitButton) submitButton.disabled = false;
          chatInput?.focus();
        }
      });
    }

    // Initialize chat history
    chatHistory.push({ role: "model", parts: [{ text: "Hallo! Wie kann ich Ihnen heute helfen?" }] });

  }, []);

  return null;
}
