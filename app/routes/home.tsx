import { getAuth } from "@clerk/react-router/ssr.server";
import { ConvexHttpClient } from "convex/browser";
import Footer from "~/components/homepage/footer";
import Integrations from "~/components/homepage/integrations";
import Pricing from "~/components/homepage/pricing";
import { GeminiClient } from "~/components/gemini-client";
import { api } from "../../convex/_generated/api";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  const title = "Content-Zauber - KI Social Media für Ihr Geschäft";
  const description =
    "Verabschieden Sie sich von der Schreibblockade. Unser KI-Assistent erstellt authentische Social-Media-Inhalte, damit Sie sich wieder auf Ihr Kerngeschäft konzentrieren können.";
  const keywords = "Content-Zauber, KI, Social Media, Posts, Geschäft, Marketing";
  const siteUrl = "https://www.content-zauber.de/";
  const imageUrl =
    "https://jdj14ctwppwprnqu.public.blob.vercel-storage.com/rsk-image-FcUcfBMBgsjNLo99j3NhKV64GT2bQl.png";

  return [
    { title },
    {
      name: "description",
      content: description,
    },

    // Open Graph / Facebook
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:url", content: siteUrl },
    { property: "og:site_name", content: "Content-Zauber" },
    { property: "og:image", content: imageUrl },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    {
      name: "twitter:description",
      content: description,
    },
    { name: "twitter:image", content: imageUrl },
    {
      name: "keywords",
      content: keywords,
    },
    { name: "author", content: "Content-Zauber Team" },
    { name: "favicon", content: imageUrl },
  ];
}

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL!)

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  // Parallel data fetching to reduce waterfall
  const [subscriptionData, plans] = await Promise.all([
    userId
      ? convex.query(api.subscriptions.checkUserSubscriptionStatus, {
          userId,
        }).catch((error) => {
          console.error("Failed to fetch subscription data:", error);
          return null;
        })
      : Promise.resolve(null),
    convex.action(api.subscriptions.getAvailablePlans, {}),
  ]);

  return {
    isSignedIn: !!userId,
    hasActiveSubscription: subscriptionData?.hasActiveSubscription || false,
    plans,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <Integrations loaderData={loaderData} />
      <HeroSection />
      <GeneratorSection />
      <FeaturesSection />
      <ContentZauberPricing />
      <FAQSection />
      <ContentZauberFooter />
      <ChatWidget />
      <GeminiClient />
    </>
  );
}

// Hero Section Component
function HeroSection() {
  return (
    <section className="py-20 md:py-32 text-center">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-4">
          Social-Media-Posts in <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Sekunden</span>, nicht Stunden.
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Verabschieden Sie sich von der Schreibblockade. Unser KI-Assistent erstellt authentische Social-Media-Inhalte, damit Sie sich wieder auf Ihr Kerngeschäft konzentrieren können.
        </p>
        <a href="#generator" className="bg-indigo-600 text-white font-bold px-8 py-4 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 text-lg inline-block">
          Live ausprobieren
        </a>
        <p className="text-sm text-gray-500 mt-4">Keine Anmeldung erforderlich.</p>
      </div>
    </section>
  );
}

// Generator Section Component
function GeneratorSection() {
  return (
    <section id="generator" className="py-20 bg-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Probieren Sie die Magie live aus!</h2>
        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">Geben Sie einfach an, was für ein Geschäft Sie haben und worüber Sie posten möchten. Unsere KI erledigt den Rest.</p>
        
        <div className="max-w-xl mx-auto bg-gray-50 p-8 rounded-lg border border-gray-200 shadow-sm">
          <div className="space-y-4">
            <div>
              <label htmlFor="business-type" className="block text-left font-semibold mb-1 text-gray-700">Art Ihres Geschäfts:</label>
              <input type="text" id="business-type" placeholder="z.B. Café, Bäckerei, Friseursalon" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="post-topic" className="block text-left font-semibold mb-1 text-gray-700">Worüber möchten Sie posten?</label>
              <input type="text" id="post-topic" placeholder="z.B. Unser neues Sauerteigbrot, 10% Rabatt am Freitag" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <button id="generate-post-btn" className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2">
              <span>✨ Post erstellen</span>
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div id="results-area" className="mt-12 max-w-3xl mx-auto text-left hidden">
          <div id="post-result-card" className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold mb-4">Ihr Post-Entwurf:</h3>
            <div id="post-output" className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md min-h-[100px]"></div>
            <div id="post-loader" className="hidden justify-center items-center min-h-[100px]">
              <div className="loader border-4 border-gray-300 border-t-indigo-600 rounded-full w-6 h-6 animate-spin"></div>
            </div>
            <div id="post-actions" className="mt-4 hidden flex-col sm:flex-row gap-4">
              <button id="generate-images-btn" className="w-full bg-indigo-100 text-indigo-700 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-200 transition-colors flex items-center justify-center space-x-2">
                <span>✨ Bildideen generieren</span>
              </button>
              <button id="generate-hashtags-btn" className="w-full bg-purple-100 text-purple-700 font-semibold py-2 px-4 rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center space-x-2">
                <span>✨ Hashtags vorschlagen</span>
              </button>
            </div>
          </div>
          
          <div id="image-ideas-card" className="mt-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm hidden">
            <h3 className="text-xl font-bold mb-4">Passende Bildideen:</h3>
            <div id="image-ideas-output" className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md min-h-[100px]"></div>
            <div id="image-ideas-loader" className="hidden justify-center items-center min-h-[100px]">
              <div className="loader border-4 border-gray-300 border-t-indigo-600 rounded-full w-6 h-6 animate-spin"></div>
            </div>
          </div>

          <div id="hashtags-card" className="mt-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm hidden">
            <h3 className="text-xl font-bold mb-4">Relevante Hashtags:</h3>
            <div id="hashtags-output" className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md min-h-[50px]"></div>
            <div id="hashtags-loader" className="hidden justify-center items-center min-h-[50px]">
              <div className="loader border-4 border-gray-300 border-t-indigo-600 rounded-full w-6 h-6 animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Features Section Component
function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Alles, was Sie für erfolgreiches Social Media brauchen</h2>
          <p className="text-lg text-gray-600">Sparen Sie Zeit und gewinnen Sie Kunden.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-indigo-600 text-white flex items-center justify-center">📝</div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold">KI schreibt Ihre Posts</h4>
                <p className="text-gray-600">Geben Sie nur Ihr Geschäft und das Thema ein. Unsere KI erstellt sofort einen fertigen Social-Media-Post in Ihrem Stil – locker für Cafés, professionell für Anwälte.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-indigo-600 text-white flex items-center justify-center">📸</div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold">KI gibt Foto-Anweisungen</h4>
                <p className="text-gray-600">Klicken Sie auf "Bildideen" und erhalten detaillierte Regie-Anweisungen: Was fotografieren, welcher Winkel, welches Licht – alles mit dem Smartphone umsetzbar.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-indigo-600 text-white flex items-center justify-center">#</div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold">KI wählt perfekte Hashtags</h4>
                <p className="text-gray-600">Automatisch passende Hashtags für Ihren Post und Ihr Geschäft. Keine Recherche nötig – die KI kennt die besten Tags für maximale Reichweite.</p>
              </div>
            </div>
          </div>
          <div>
            <img src="/Feature-Illustration.png" alt="Illustration von Social-Media-Posts" className="rounded-lg shadow-xl max-w-md w-full h-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}

// FAQ Section Component
function FAQSection() {
  return (
    <section id="faq" className="py-20">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-12">Häufig gestellte Fragen</h2>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-2">Für wen ist Content-Zauber gedacht?</h4>
            <p className="text-gray-600">Content-Zauber ist ideal für Inhaber von kleinen, lokalen Unternehmen wie Cafés, Restaurants, Boutiquen, Salons oder Handwerksbetrieben, die ihre Social-Media-Präsenz ohne großen Zeitaufwand verbessern möchten.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Brauche ich technische Vorkenntnisse?</h4>
            <p className="text-gray-600">Nein, überhaupt nicht! Die Plattform ist extrem einfach und intuitiv gestaltet. Wenn Sie eine E-Mail schreiben können, können Sie auch Content-Zauber nutzen.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Wie "intelligent" ist die KI wirklich?</h4>
            <p className="text-gray-600">Unsere KI wird mit modernsten Sprachmodellen betrieben. Sie lernt aus Ihren Angaben und generiert Texte, die relevant, kreativ und auf Ihre Marke zugeschnitten sind. Es ist aber immer noch Ihr Geschäft – Sie haben das letzte Wort und können alles anpassen.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Kann ich jederzeit kündigen?</h4>
            <p className="text-gray-600">Ja, absolut. Sie können Ihr Abonnement jederzeit mit einem Klick in Ihren Kontoeinstellungen kündigen. Ohne Wenn und Aber.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Content-Zauber Pricing Section Component
function ContentZauberPricing() {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Ein Preis, der sich rechnet.</h2>
        <p className="text-lg text-gray-600 mb-12">Wählen Sie den Plan, der zu Ihnen passt. Jederzeit kündbar.</p>
        <div className="flex flex-col md:flex-row justify-center gap-8 max-w-5xl mx-auto">
          <div className="border border-gray-200 rounded-lg p-8 w-full flex flex-col">
            <h3 className="text-2xl font-semibold mb-2">Starter</h3>
            <p className="text-gray-500 mb-6">Für den ersten Test.</p>
            <p className="text-4xl font-bold mb-6">€4,90 <span className="text-lg font-normal text-gray-500">/ Monat</span></p>
            <ul className="text-left space-y-3 mb-8 flex-grow">
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> 15 Posts pro Monat</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> KI schreibt Posts + Hashtags</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> KI-Bildideen mit Anleitung</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> E-Mail Support</li>
            </ul>
            <a href="#" className="w-full bg-gray-100 text-indigo-600 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors text-center block">Plan wählen</a>
          </div>
          <div className="border-2 border-indigo-600 rounded-lg p-8 w-full relative flex flex-col">
            <span className="absolute top-0 -translate-y-1/2 bg-indigo-600 text-white text-sm font-semibold px-3 py-1 rounded-full">Empfohlen</span>
            <h3 className="text-2xl font-semibold mb-2">Business</h3>
            <p className="text-gray-500 mb-6">Für regelmäßige Posts.</p>
            <p className="text-4xl font-bold mb-6">€9,90 <span className="text-lg font-normal text-gray-500">/ Monat</span></p>
            <ul className="text-left space-y-3 mb-8 flex-grow">
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> 50 Posts pro Monat</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Alle KI-Features</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Unbegrenzte Geschäftstypen</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> E-Mail Support</li>
            </ul>
            <a href="#" className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors text-center block">Plan wählen</a>
          </div>
          <div className="border border-gray-200 rounded-lg p-8 w-full flex flex-col">
            <h3 className="text-2xl font-semibold mb-2">Pro</h3>
            <p className="text-gray-500 mb-6">Für Content-Profis.</p>
            <p className="text-4xl font-bold mb-6">€19,90 <span className="text-lg font-normal text-gray-500">/ Monat</span></p>
            <ul className="text-left space-y-3 mb-8 flex-grow">
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> 150 Posts pro Monat</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Alle Features</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Schnellerer E-Mail Support</li>
            </ul>
            <a href="#" className="w-full bg-gray-100 text-indigo-600 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors text-center block">Plan wählen</a>
          </div>
        </div>
      </div>
    </section>
  );
}

// Content-Zauber Footer Component
function ContentZauberFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h5 className="text-2xl font-bold">Content<span className="text-indigo-400">Zauber</span></h5>
            <p className="text-gray-400">Mehr Zeit für Ihr Geschäft.</p>
          </div>
          <div className="flex space-x-8">
            <a href="#" className="text-gray-400 hover:text-white">Impressum</a>
            <a href="#" className="text-gray-400 hover:text-white">Datenschutz</a>
            <a href="#" className="text-gray-400 hover:text-white">Kontakt</a>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-6 text-center text-gray-500">
          &copy; 2025 Content-Zauber. Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  );
}

// Chat Widget Component
function ChatWidget() {
  return (
    <div id="chat-widget" className="fixed bottom-5 right-5 z-50">
      <button id="chat-button" className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
      <div id="chat-window" className="hidden absolute bottom-20 right-0 w-80 sm:w-96 h-[32rem] bg-white rounded-lg border border-gray-200 flex-col origin-bottom-right shadow-xl">
        <div className="p-4 border-b bg-gray-50 rounded-t-lg flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-900">KI-Assistent</h3>
            <select id="language-selector" className="text-sm text-gray-600 bg-transparent border-none focus:ring-0 p-0">
              <option value="Deutsch">Deutsch</option>
              <option value="English">English</option>
              <option value="Français">Français</option>
              <option value="Schweizerisch">Schweizerisch</option>
            </select>
          </div>
          <button id="close-chat-button" className="text-gray-500 hover:text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div id="chat-messages" className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-gray-200 text-gray-800">Hallo! Wie kann ich Ihnen heute helfen?</div>
          </div>
        </div>
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <form id="chat-form" className="flex items-center space-x-2">
            <input type="text" id="chat-input" placeholder="Stellen Sie eine Frage..." className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" autoComplete="off" />
            <button type="submit" className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
