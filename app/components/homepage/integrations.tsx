import { memo } from "react";
import { Link } from "react-router";
import { LogoIcon } from "~/components/logo";
import {
  Convex,
  Polar,
  ReactIcon,
  ReactRouter,
  TailwindIcon,
  Typescript,
} from "~/components/logos";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Navbar } from "./navbar";
import { InteractiveBackground } from "~/components/interactive-background";

export default function IntegrationsSection({
  loaderData,
}: {
  loaderData?: { isSignedIn: boolean; hasActiveSubscription: boolean };
}) {
  return (
    <section id="hero" className="relative min-h-screen overflow-hidden bg-slate-900">
      <Navbar loaderData={loaderData} />
      
      {/* Animated Grid Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-12 h-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div
                key={i}
                className="border border-slate-700/30 animate-pulse"
                style={{
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Side - Text Content */}
              <div className="text-left">
                <div className="inline-block px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-sm mb-6">
                  Neu: Content-Zauber Beta
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
                  Schluss mit{" "}
                  <span className="text-red-400 line-through">stundenlangem</span>
                  <br />
                  <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    Grübeln
                  </span>{" "}
                  über Posts.
                </h1>
                
                <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                  Während andere noch überlegen, was sie posten sollen, haben Sie bereits 
                  drei perfekte Posts erstellt. Für Ihr Café, Ihren Salon, Ihre Praxis.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link
                    to="/sign-up"
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 text-center"
                  >
                    Account erstellen
                  </Link>
                  <a
                    href="#generator"
                    className="px-6 py-3 border border-slate-600 text-slate-300 font-semibold rounded-lg hover:bg-slate-800 transition-all duration-300 text-center"
                  >
                    Demo ansehen
                  </a>
                </div>
                
                <div className="text-sm text-slate-400">
                  Ehrlich: Wir sind neu. Aber unsere KI ist schon verdammt gut.
                </div>
              </div>
              
              {/* Right Side - Visual Element */}
              <div className="relative">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-slate-400 text-sm ml-2">content-zauber.app</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-slate-900/80 rounded-lg p-4">
                      <div className="text-slate-300 text-sm mb-2">Eingabe:</div>
                      <div className="text-slate-400 text-xs">
                        "Bäckerei, neues Sauerteigbrot"
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-emerald-900/50 to-cyan-900/50 rounded-lg p-4 border border-emerald-500/30">
                      <div className="text-emerald-300 text-sm mb-2">Ausgabe:</div>
                      <div className="text-slate-200 text-sm leading-relaxed">
                        "Frisch aus dem Ofen: Unser neues Sauerteigbrot! 🍞 
                        72 Stunden Teigführung für den perfekten Geschmack. 
                        Probieren Sie es heute noch! #Handwerk #Sauerteig"
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  3.2s
                </div>
                <div className="absolute -bottom-4 -left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Ready to post
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtle animated elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-indigo-400 rounded-full animate-ping opacity-30"></div>
      <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-emerald-400 rounded-full animate-ping opacity-40" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping opacity-25" style={{ animationDelay: '2s' }}></div>
    </section>
  );
}

const IntegrationCard = memo(({
  children,
  className,
  borderClassName,
}: {
  children: React.ReactNode;
  className?: string;
  borderClassName?: string;
}) => {
  return (
    <div
      className={cn(
        "bg-background relative flex size-20 rounded-xl dark:bg-transparent",
        className
      )}
    >
      <div
        role="presentation"
        className={cn(
          "absolute inset-0 rounded-xl border border-black/20 dark:border-white/25",
          borderClassName
        )}
      />
      <div className="relative z-20 m-auto size-fit *:size-8">{children}</div>
    </div>
  );
});
