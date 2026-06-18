"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Dictionary map for support locales
export type Locale = "en" | "hi" | "gu" | "de" | "es" | "fr";

interface LocaleContextProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
  isRTL: boolean;
}

const LocaleContext = createContext<LocaleContextProps | undefined>(undefined);

// In-memory static translations to ensure instant, hydration-safe loads without server-side routing lags.
const translations: Record<Locale, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.about": "About",
    "nav.skills": "Skills",
    "nav.projects": "Projects",
    "nav.arcade": "Arcade",
    "nav.experience": "Experience",
    "nav.education": "Education",
    "nav.contact": "Contact",
    "hero.cta.view": "View Projects",
    "hero.cta.contact": "Contact Me",
    "about.title": "About Me",
    "about.bio": "I am a Full Stack AI Developer specializing in production-ready, scalable SaaS and AI systems. I leverage Java/Spring Boot for highly reliable service APIs and modern AI/LLM components for state-of-the-art intelligent workloads.",
    "about.stats.projects": "Projects Built",
    "about.stats.experience": "Years Experience",
    "about.stats.certificates": "Certifications",
    "about.stats.education": "Completed Degrees",
    "skills.title": "Skills & Expertise",
    "skills.radar": "Skill Alignment",
    "projects.title": "Featured Projects",
    "projects.viewDemo": "Live Demo",
    "projects.github": "GitHub Repo",
    "arcade.title": "Interactive Arcade",
    "experience.title": "Professional Experience",
    "education.title": "Education & Credentials",
    "contact.title": "Let's Connect",
    "contact.name": "Name",
    "contact.email": "Email Address",
    "contact.message": "Your Message",
    "contact.submit": "Send Message",
    "contact.sending": "Sending...",
    "contact.success": "Message sent successfully!",
    "contact.error": "Failed to send message. Please try again."
  },
  hi: {
    "nav.home": "होम",
    "nav.about": "मेरे बारे में",
    "nav.skills": "कौशल",
    "nav.projects": "परियोजनाएं",
    "nav.arcade": "आर्केड",
    "nav.experience": "अनुभव",
    "nav.education": "शिक्षा",
    "nav.contact": "संपर्क",
    "hero.cta.view": "परियोजनाएं देखें",
    "hero.cta.contact": "मुझसे संपर्क करें",
    "about.title": "मेरे बारे में",
    "about.bio": "मैं एक फुल स्टैक एआई डेवलपर हूँ जो उत्पादन-तैयार, स्केलेबल SaaS और AI सिस्टम में विशेषज्ञता रखता हूँ। मैं अत्यधिक विश्वसनीय सेवा एपीआई के लिए जावा/स्प्रिंग बूट का लाभ उठाता हूँ।",
    "about.stats.projects": "परियोजनाएं",
    "about.stats.experience": "वर्षों का अनुभव",
    "about.stats.certificates": "प्रमाण पत्र",
    "about.stats.education": "शिक्षा डिग्री",
    "skills.title": "कौशल और विशेषज्ञता",
    "skills.radar": "कौशल संरेखण",
    "projects.title": "विशेष रुप से प्रदर्शित परियोजनाएं",
    "projects.viewDemo": "लाइव डेमो",
    "projects.github": "गिटहब",
    "arcade.title": "इंटरएक्टिव आर्केड",
    "experience.title": "व्यावसायिक अनुभव",
    "education.title": "शिक्षा और साख",
    "contact.title": "चलो जुड़ते हैं",
    "contact.name": "नाम",
    "contact.email": "ईमेल पता",
    "contact.message": "आपका संदेश",
    "contact.submit": "संदेश भेजें",
    "contact.sending": "भेजा जा रहा है...",
    "contact.success": "संदेश सफलतापूर्वक भेजा गया!",
    "contact.error": "संदेश भेजने में विफल। पुनः प्रयास करें।"
  },
  gu: {
    "nav.home": "હોમ",
    "nav.about": "મારા વિશે",
    "nav.skills": "કૌશલ્યો",
    "nav.projects": "પ્રોજેક્ટ્સ",
    "nav.arcade": "આર્કેડ",
    "nav.experience": "અનુભવ",
    "nav.education": "શિક્ષણ",
    "nav.contact": "સંપર્ક",
    "hero.cta.view": "પ્રોજેક્ટ્સ જુઓ",
    "hero.cta.contact": "સંપર્ક કરો",
    "about.title": "મારા વિશે",
    "about.bio": "હું એક ફૂલ સ્ટેક એઆઈ ડેવલપર છું જે પ્રોડક્શન-રેડી, સ્કેલેબલ SaaS અને AI સિસ્ટમ્સમાં નિષ્ણાત છે. હું સ્પ્રિંગ બૂટ અને આર્ટિફિશિયલ ઇન્ટેલિજન્સ ઘટકોનો ઉપયોગ કરું છું.",
    "about.stats.projects": "પ્રોજેક્ટ્સ",
    "about.stats.experience": "વર્ષોનો અનુભવ",
    "about.stats.certificates": "પ્રમાણપત્રો",
    "about.stats.education": "ડિગ્રીઓ",
    "skills.title": "કૌશલ્યો અને કુશળતા",
    "skills.radar": "કૌશલ્ય ગોઠવણી",
    "projects.title": "વિશિષ્ટ પ્રોજેક્ટ્સ",
    "projects.viewDemo": "ડેમો",
    "projects.github": "ગિટહબ",
    "arcade.title": "ઇન્ટરેક્ટિવ આર્કેડ",
    "experience.title": "વ્યાવસાયિક અનુભવ",
    "education.title": "શિક્ષણ અને ઓળખપત્રો",
    "contact.title": "કનેક્ટ કરીએ",
    "contact.name": "નામ",
    "contact.email": "ઈમેલ",
    "contact.message": "તમારો સંદેશ",
    "contact.submit": "સંકલ્પ મોકલો",
    "contact.sending": "મોકલી રહ્યું છે...",
    "contact.success": "સંદેશ સફળતાપૂર્વક મોકલવામાં આવ્યો છે!",
    "contact.error": "સંદેશ મોકલવામાં નિષ્ફળ. ફરીથી પ્રયાસ કરો."
  },
  de: {
    "nav.home": "Startseite",
    "nav.about": "Über mich",
    "nav.skills": "Fähigkeiten",
    "nav.projects": "Projekte",
    "nav.arcade": "Spielhalle",
    "nav.experience": "Erfahrung",
    "nav.education": "Ausbildung",
    "nav.contact": "Kontakt",
    "hero.cta.view": "Projekte ansehen",
    "hero.cta.contact": "Kontaktieren Sie mich",
    "about.title": "Über mich",
    "about.bio": "Ich bin ein Full Stack AI Entwickler, spezialisiert auf produktionsbereite, skalierbare SaaS- und KI-Systeme. Ich verwende Java/Spring Boot für zuverlässige APIs.",
    "about.stats.projects": "Projekte",
    "about.stats.experience": "Jahre Erfahrung",
    "about.stats.certificates": "Zertifikate",
    "about.stats.education": "Abschlüsse",
    "skills.title": "Fähigkeiten & Expertise",
    "skills.radar": "Skill-Ausrichtung",
    "projects.title": "Ausgewählte Projekte",
    "projects.viewDemo": "Live-Demo",
    "projects.github": "GitHub",
    "arcade.title": "Interaktive Spielhalle",
    "experience.title": "Berufserfahrung",
    "education.title": "Bildung & Nachweise",
    "contact.title": "Lass uns vernetzen",
    "contact.name": "Name",
    "contact.email": "E-Mail-Adresse",
    "contact.message": "Ihre Nachricht",
    "contact.submit": "Nachricht senden",
    "contact.sending": "Wird gesendet...",
    "contact.success": "Nachricht erfolgreich gesendet!",
    "contact.error": "Fehler beim Senden. Bitte versuchen Sie es erneut."
  },
  es: {
    "nav.home": "Inicio",
    "nav.about": "Sobre mí",
    "nav.skills": "Habilidades",
    "nav.projects": "Proyectos",
    "nav.arcade": "Arcade",
    "nav.experience": "Experiencia",
    "nav.education": "Educación",
    "nav.contact": "Contacto",
    "hero.cta.view": "Ver Proyectos",
    "hero.cta.contact": "Contáctame",
    "about.title": "Sobre mí",
    "about.bio": "Soy un desarrollador de IA full stack especializado en sistemas SaaS e IA escalables y listos para producción. Utilizo Java/Spring Boot para APIs altamente confiables.",
    "about.stats.projects": "Proyectos Creados",
    "about.stats.experience": "Años de Experiencia",
    "about.stats.certificates": "Certificaciones",
    "about.stats.education": "Títulos Completados",
    "skills.title": "Habilidades y Experiencia",
    "skills.radar": "Alineación de Habilidades",
    "projects.title": "Proyectos Destacados",
    "projects.viewDemo": "Demostración",
    "projects.github": "GitHub",
    "arcade.title": "Arcade Interactivo",
    "experience.title": "Experiencia Profesional",
    "education.title": "Educación y Credenciales",
    "contact.title": "Conectemos",
    "contact.name": "Nombre",
    "contact.email": "Correo Electrónico",
    "contact.message": "Tu Mensaje",
    "contact.submit": "Enviar Mensaje",
    "contact.sending": "Enviando...",
    "contact.success": "¡Mensaje enviado con éxito!",
    "contact.error": "Error al enviar el mensaje. Inténtalo de nuevo."
  },
  fr: {
    "nav.home": "Accueil",
    "nav.about": "À Propos",
    "nav.skills": "Compétences",
    "nav.projects": "Projets",
    "nav.arcade": "Arcade",
    "nav.experience": "Expérience",
    "nav.education": "Éducation",
    "nav.contact": "Contact",
    "hero.cta.view": "Voir les Projets",
    "hero.cta.contact": "Contactez-moi",
    "about.title": "À Propos de Moi",
    "about.bio": "Je suis un développeur IA full-stack spécialisé dans les systèmes SaaS et IA évolutifs et prêts pour la production. J'utilise Java/Spring Boot pour des API hautement fiables.",
    "about.stats.projects": "Projets Réalisés",
    "about.stats.experience": "Années d'Expérience",
    "about.stats.certificates": "Certifications",
    "about.stats.education": "Diplômes Obtenus",
    "skills.title": "Compétences & Expertise",
    "skills.radar": "Alignement des Compétences",
    "projects.title": "Projets Vedettes",
    "projects.viewDemo": "Démo en Direct",
    "projects.github": "GitHub",
    "arcade.title": "Arcade Interactive",
    "experience.title": "Expérience Professionnelle",
    "education.title": "Éducation & Diplômes",
    "contact.title": "Contactez-moi",
    "contact.name": "Nom",
    "contact.email": "Adresse E-mail",
    "contact.message": "Votre Message",
    "contact.submit": "Envoyer le Message",
    "contact.sending": "Envoi...",
    "contact.success": "Message envoyé avec succès !",
    "contact.error": "Échec de l'envoi du message. Veuillez réessayer."
  }
};

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("portfolio_locale") as Locale;
    if (saved && translations[saved]) {
      setLocaleState(saved);
    } else if (typeof window !== "undefined" && window.navigator) {
      const lang = window.navigator.language.split("-")[0] as Locale;
      if (translations[lang]) {
        setLocaleState(lang);
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("portfolio_locale", newLocale);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const t = (key: string, fallback?: string): string => {
    return translations[locale]?.[key] || translations["en"]?.[key] || fallback || key;
  };

  const isRTL = false;

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, isRTL }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
};
