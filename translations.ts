
export type Language = 'en' | 'de' | 'fr' | 'es';

export const translations = {
  en: {
    sidebar: {
      chat: 'Chat Bots',
      chatDesc: 'Agency knowledge AI',
      thumb: 'ThumbGen',
      thumbDesc: 'YT, IG, FB Thumbnails',
      story: 'StoryGen',
      storyDesc: 'Visual storyboards',
      image: 'ImageGen',
      imageDesc: 'T2I & I2I generation',
      video: 'VideoGen',
      videoDesc: 'Cinema quality video',
      storage: 'Storage Status',
      used: 'used'
    },
    dashboard: {
      heroBadge: 'Empowering Next-Gen Creators',
      heroTitle: 'Unified PX-AIssitent Protocol.',
      heroDesc: 'Welcome to PX-AIssitent. A comprehensive suite of surgical-grade AI tools designed to transform concepts into production-ready assets instantly.',
      secureEnv: 'Secure Environment',
      enginePowered: 'Gemini 3 Powered',
      toolEcosystem: 'Tool Ecosystem',
      selectOperation: 'Select an Operation to Begin',
      initWorkflow: 'Initialize Workflow',
      proTipTitle: 'Pro Tip: Multi-Modal Context',
      proTipDesc: 'Use the **Media Analyst** bot in the Chat Hub to analyze storyboard frames before sending them to the video engine for improved prompt consistency.',
      performance: 'System Performance',
      loadReady: '98% Load Ready',
      clustersResponsive: 'Global AI Clusters Responsive',
      toolBadges: {
        logic: 'Advanced Logic',
        click: 'Click-Ready',
        prod: 'Production Hub',
        artisan: 'Artisan Quality',
        veo: 'Veo 3.1 Pro'
      },
      features: {
        chat: ['Multi-Bot Support', 'Document Analysis', 'Context Awareness'],
        thumb: ['Preset Templates', 'In-front Text Placement', 'UI-Free Output'],
        story: ['Character Casting', 'Shotlist Synthesis', 'Full Script Export'],
        image: ['Precision Inpainting', 'Mask Editing', 'Style Presets'],
        video: ['Cinematic T2V', 'Dynamic I2V', 'High Temporal Logic']
      }
    },
    story: {
      targetDuration: 'Total Target Duration (sec)',
      durationPlaceholder: 'Auto-estimate based on story',
      step2Title: 'Step 2: Story Core & Timing',
      numShots: 'Desired Number of Shots',
      numShotsPlaceholder: 'e.g. 5',
      aiAssist: 'AI Assist',
      aiAssistDesc: 'Completing shot logic...',
      assetPrompt: 'Visual AI Prompt (optional)'
    },
    chat: {
      title: "Director's Chat Hub",
      subtitle: 'Select a specialized bot to initialize a conversation.',
      newGen: 'New Generation',
      history: 'Chat History',
      noSessions: 'No sessions yet',
      active: 'Active',
      synthesizing: 'is synthesizing response...',
      placeholder: 'Consult with',
      secure: 'Secure End-to-End Agency Protocol',
      authOnly: 'Authorized Agency Access Only',
      bots: {
        normal: {
          name: 'Gemini General',
          desc: 'All-round agency knowledge.',
          system: 'You are an expert agency consultant. Respond in English.'
        },
        coding: {
          name: 'DevX Assistant',
          desc: 'Coding expert and debugger.',
          system: 'You are a senior software engineer. Respond in English.'
        },
        content: {
          name: 'Content Strategist',
          desc: 'Campaigns and visual planning.',
          system: 'You are a world-class content strategist. Respond in English.'
        },
        analysis: {
          name: 'Media Analyst',
          desc: 'Analyze docs, images & PDFs.',
          system: 'You are a world-class Media & Document Analyst. You can describe images, summarize PDFs, explain complex texts, and extract insights from multi-modal data. Respond in English.'
        }
      }
    },
    common: {
      generate: 'Generate',
      download: 'Download',
      upload: 'Upload',
      style: 'Style',
      ratio: 'Ratio',
      model: 'Model',
      fast: 'Fast',
      pro: 'Pro',
      error: 'Error',
      selectKey: 'Select Key'
    }
  },
  de: {
    sidebar: {
      chat: 'ChatBots',
      chatDesc: 'Agenturwissen KI',
      thumb: 'ThumbGen',
      thumbDesc: 'YT, IG, FB Thumbnails',
      story: 'StoryGen',
      storyDesc: 'Visuelle Storyboards',
      image: 'ImageGen',
      imageDesc: 'T2I & I2I Generierung',
      video: 'VideoGen',
      videoDesc: 'Kino-Qualität Video',
      storage: 'Speicherstatus',
      used: 'belegt'
    },
    dashboard: {
      heroBadge: 'Unterstützung für Creator der nächsten Generation',
      heroTitle: 'Einheitliches PX-AIssitent Protokoll.',
      heroDesc: 'Willkommen bei PX-AIssitent. Eine umfassende Suite chirurgisch präziser KI-Tools, die Konzepte sofort in produktionsreife Assets verwandeln.',
      secureEnv: 'Sichere Umgebung',
      enginePowered: 'Gemini 3 Power',
      toolEcosystem: 'Tool-Ökosystem',
      selectOperation: 'Wählen Sie eine Operation zum Starten',
      initWorkflow: 'Workflow initialisieren',
      proTipTitle: 'Profi-Tipp: Multi-Modaler Kontext',
      proTipDesc: 'Verwenden Sie den **Media Analyst** Bot im Chat Hub, um Storyboard-Frames zu analysieren, bevor Sie sie an die Video-Engine senden.',
      performance: 'Systemleistung',
      loadReady: '98% Betriebsbereit',
      clustersResponsive: 'Globale KI-Cluster antworten',
      toolBadges: {
        logic: 'Erweiterte Logik',
        click: 'Click-Ready',
        prod: 'Produktions-Hub',
        artisan: 'Handwerkliche Qualität',
        veo: 'Veo 3.1 Pro'
      },
      features: {
        chat: ['Multi-Bot Support', 'Dokumentenanalyse', 'Kontextbewusstsein'],
        thumb: ['Vorlagen-Presets', 'Textplatzierung', 'Clean Output'],
        story: ['Charakter-Casting', 'Shotlist-Synthese', 'Skript-Export'],
        image: ['Präzises Inpainting', 'Masken-Editor', 'Stil-Presets'],
        video: ['Cinematisch T2V', 'Dynamisch I2V', 'Hohe Temporale Logik']
      }
    },
    story: {
      targetDuration: 'Gesamte Ziel-Dauer (Sek.)',
      durationPlaceholder: 'Auto-Schätzung basierend auf Story',
      step2Title: 'Schritt 2: Story-Kern & Timing',
      numShots: 'Gewünschte Anzahl Shots',
      numShotsPlaceholder: 'z.B. 5',
      aiAssist: 'KI Hilfe',
      aiAssistDesc: 'Vervollständige Shot-Logik...',
      assetPrompt: 'Visueller KI-Prompt (optional)'
    },
    chat: {
      title: 'Director\'s Chat Hub',
      subtitle: 'Wähle einen spezialisierten Bot, um ein Gespräch zu beginnen.',
      newGen: 'Neue Generation',
      history: 'Chat-Verlauf',
      noSessions: 'Noch keine Sitzungen',
      active: 'Aktiv',
      synthesizing: 'synthetisiert Antwort...',
      placeholder: 'Konsultiere',
      secure: 'Sicheres End-to-End Agenturprotokoll',
      authOnly: 'Nur autorisierter Agenturzugriff',
      bots: {
        normal: {
          name: 'Gemini General',
          desc: 'Allround-Agenturwissen.',
          system: 'Du bist ein erfahrener Agenturberater. Antworte auf Deutsch.'
        },
        coding: {
          name: 'DevX Assistent',
          desc: 'Coding-Experte und Debugger.',
          system: 'Du bist ein Senior Software Engineer. Antworte auf Deutsch.'
        },
        content: {
          name: 'Content-Stratege',
          desc: 'Kampagnen und visuelle Planung.',
          system: 'Du bist ein Weltklasse-Content-Stratege. Antworte auf Deutsch.'
        },
        analysis: {
          name: 'Medien-Analyst',
          desc: 'Analysiere Docs, Bilder & PDFs.',
          system: 'Du bist ein Weltklasse-Medien- und Dokumentenanalyst. Du kannst Bilder beschreiben, PDFs zusammenfassen, komplexe Texte erklären und Erkenntnisse aus multimodalen Daten gewinnen. Antworte auf Deutsch.'
        }
      }
    },
    common: {
      generate: 'Generieren',
      download: 'Herunterladen',
      upload: 'Hochladen',
      style: 'Stil',
      ratio: 'Format',
      model: 'Modell',
      fast: 'Schnell',
      pro: 'Pro',
      error: 'Fehler',
      selectKey: 'Key wählen'
    }
  },
  fr: {
    sidebar: {
      chat: 'ChatBots',
      chatDesc: 'IA de connaissances agence',
      thumb: 'ThumbGen',
      thumbDesc: 'Miniatures YT, IG, FB',
      story: 'StoryGen',
      storyDesc: 'Storyboards visuels',
      image: 'ImageGen',
      imageDesc: 'Génération T2I & I2I',
      video: 'VideoGen',
      videoDesc: 'Vidéo qualité cinéma',
      storage: 'État du stockage',
      used: 'utilisé'
    },
    dashboard: {
      heroBadge: 'Soutenir les créateurs de nouvelle génération',
      heroTitle: 'Protocole unifié PX-AIssitent.',
      heroDesc: 'Bienvenue sur PX-AIssitent. Une suite complète d\'outils d\'IA de précision conçus pour transformer instantanément vos concepts en actifs prêts pour la production.',
      secureEnv: 'Environnement sécurisé',
      enginePowered: 'Propulsé par Gemini 3',
      toolEcosystem: 'Écosystème d\'outils',
      selectOperation: 'Sélectionnez une opération pour commencer',
      initWorkflow: 'Initialiser le flux de travail',
      proTipTitle: 'Conseil de pro : contexte multimodal',
      proTipDesc: 'Utilisez le bot **Media Analyst** pour analyser les cadres du storyboard avant de les envoyer au moteur vidéo.',
      performance: 'Performance du système',
      loadReady: '98% prêt à l\'emploi',
      clustersResponsive: 'Clusters IA mondiaux réactifs',
      toolBadges: {
        logic: 'Logique avancée',
        click: 'Prêt pour le clic',
        prod: 'Hub de production',
        artisan: 'Qualité artisanale',
        veo: 'Veo 3.1 Pro'
      },
      features: {
        chat: ['Support Multi-Bot', 'Analyse de documents', 'Conscience du contexte'],
        thumb: ['Modèles prédéfinis', 'Placement du texte', 'Rendu propre'],
        story: ['Casting de personnages', 'Synthèse de plans', 'Export de script'],
        image: ['Inpainting de précision', 'Édition de masque', 'Styles prédéfinis'],
        video: ['T2V Cinématographique', 'I2V Dynamique', 'Logique temporelle']
      }
    },
    story: {
      targetDuration: 'Durée Totale Cible (sec)',
      durationPlaceholder: 'Estimation auto selon l\'histoire',
      step2Title: 'Étape 2: Cœur de l\'histoire et Timing',
      numShots: 'Nombre de plans souhaité',
      numShotsPlaceholder: 'ex: 5',
      aiAssist: 'Assist. IA',
      aiAssistDesc: 'Complétion du plan...',
      assetPrompt: 'Prompt IA Visuel (optionnel)'
    },
    chat: {
      title: 'Hub de Chat du Directeur',
      subtitle: 'Sélectionnez un bot spécialisé pour commencer.',
      newGen: 'Nouvelle Génération',
      history: 'Historique des chats',
      noSessions: 'Aucune session',
      active: 'Actif',
      synthesizing: 'synthétise la réponse...',
      placeholder: 'Consulter',
      secure: 'Protocole d\'agence sécurisé',
      authOnly: 'Accès agence autorisé uniquement',
      bots: {
        normal: {
          name: 'Gemini Général',
          desc: 'Connaissances agence 360°.',
          system: 'Vous êtes un consultant expert en agence. Répondez en français.'
        },
        coding: {
          name: 'Assistant DevX',
          desc: 'Expert code et débogage.',
          system: 'Vous êtes un ingénieur logiciel senior. Répondez en français.'
        },
        content: {
          name: 'Stratège Contenu',
          desc: 'Campagnes et visuels.',
          system: 'Vous êtes un stratège de contenu de classe mondiale. Répondez en français.'
        },
        analysis: {
          name: 'Analyste Médias',
          desc: 'Analysez docs, images & PDFs.',
          system: 'Vous êtes un analyste de documents et de médias de classe mondiale. Vous pouvez décrire des images, résumer des PDF, expliquer des textes complexes et extraire des informations de données multimodales. Répondez en français.'
        }
      }
    },
    common: {
      generate: 'Générer',
      download: 'Télécharger',
      upload: 'Téléverser',
      style: 'Style',
      ratio: 'Ratio',
      model: 'Modèle',
      fast: 'Rapide',
      pro: 'Pro',
      error: 'Erreur',
      selectKey: 'Clé'
    }
  },
  es: {
    sidebar: {
      chat: 'ChatBots',
      chatDesc: 'IA de conocimiento agencial',
      thumb: 'ThumbGen',
      thumbDesc: 'Miniaturas YT, IG, FB',
      story: 'StoryGen',
      storyDesc: 'Storyboards visuales',
      image: 'ImageGen',
      imageDesc: 'Generación T2I y I2I',
      video: 'VideoGen',
      videoDesc: 'Video calidad cine',
      storage: 'Estado del almacenamiento',
      used: 'usado'
    },
    dashboard: {
      heroBadge: 'Empoderando a los creadores de nueva generación',
      heroTitle: 'Protocolo unificado PX-AIssitent.',
      heroDesc: 'Bienvenido a PX-AIssitent. Una suite completa de herramientas de IA de grado quirúrgico diseñadas para transformar conceptos en activos listos para la producción.',
      secureEnv: 'Entorno seguro',
      enginePowered: 'Con tecnología Gemini 3',
      toolEcosystem: 'Ecosistema de herramientas',
      selectOperation: 'Seleccione una operación para comenzar',
      initWorkflow: 'Inicializar flujo de trabajo',
      proTipTitle: 'Consejo profesional: contexto multimodal',
      proTipDesc: 'Utiliza el bot **Media Analyst** para analizar fotogramas antes de enviarlos al motor de video.',
      performance: 'Rendimiento del sistema',
      loadReady: '98% listo para carga',
      clustersResponsive: 'Clusters globales de IA receptivos',
      toolBadges: {
        logic: 'Lógica avanzada',
        click: 'Listo para clics',
        prod: 'Centro de producción',
        artisan: 'Calidad artesanal',
        veo: 'Veo 3.1 Pro'
      },
      features: {
        chat: ['Soporte Multi-Bot', 'Análisis de documentos', 'Conciencia del contexto'],
        thumb: ['Plantillas preestablecidas', 'Ubicación de texto', 'Salida limpia'],
        story: ['Casting de personajes', 'Síntesis de lista de tomas', 'Exportación de guion'],
        image: ['Inpainting de precisión', 'Edición de máscara', 'Ajustes de estilo'],
        video: ['T2V Cinematográfico', 'I2V Dinámico', 'Lógica temporal alta']
      }
    },
    story: {
      targetDuration: 'Duración Total Objetivo (seg)',
      durationPlaceholder: 'Estimación automática según la historia',
      step2Title: 'Paso 2: Núcleo de la historia y tiempo',
      numShots: 'Número de tomas deseado',
      numShotsPlaceholder: 'ej. 5',
      aiAssist: 'Asist. IA',
      aiAssistDesc: 'Completando toma...',
      assetPrompt: 'Prompt de IA visual (opcional)'
    },
    chat: {
      title: 'Centro de Chat del Director',
      subtitle: 'Seleccione un bot especializado para comenzar.',
      newGen: 'Nueva Generación',
      history: 'Historial de chat',
      noSessions: 'Sin sesiones aún',
      active: 'Activo',
      synthesizing: 'está sintetizando respuesta...',
      placeholder: 'Consultar con',
      secure: 'Protocolo de agencia seguro',
      authOnly: 'Acceso autorizado solo para agencias',
      bots: {
        normal: {
          name: 'Gemini General',
          desc: 'Conocimiento agencial total.',
          system: 'Eres un consultor experto en agencias. Responde en español.'
        },
        coding: {
          name: 'Asistente DevX',
          desc: 'Experto en código y depuración.',
          system: 'Eres un ingeniero de software sénior. Responde en español.'
        },
        content: {
          name: 'Estratega de Contenido',
          desc: 'Campagnes y diseño visual.',
          system: 'Eres un estratega de contenido de clase mundial. Responde en español.'
        },
        analysis: {
          name: 'Analista de Medios',
          desc: 'Analiza docs, imágenes y PDFs.',
          system: 'Eres un analista de medios y documentos de clase mundial. Puedes describir imágenes, resumir archivos PDF, explicar textos complejos y extraer información de datos multimodales. Responde en español.'
        }
      }
    },
    common: {
      generate: 'Generar',
      download: 'Descargar',
      upload: 'Subir',
      style: 'Estilo',
      ratio: 'Ratio',
      model: 'Modelo',
      fast: 'Rápido',
      pro: 'Pro',
      error: 'Error',
      selectKey: 'Clave'
    }
  }
};
