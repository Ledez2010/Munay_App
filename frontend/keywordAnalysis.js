// ========== SISTEMA DE ANÁLISIS DE KEYWORDS INTELIGENTE ==========
// Análisis 100% local y gratuito para detección de riesgo

class KeywordAnalyzer {
  constructor() {
    // Keywords categorizadas por nivel de riesgo
    this.keywords = {
      // RIESGO CRÍTICO - Requiere atención inmediata
      critical: {
        suicidio: [
          'quiero suicidarme', 'pensar en suicidarme', 'tengo ganas de suicidarme', 'quiero quitarme la vida',
          'quiero acabar con mi vida', 'no quiero vivir más', 'no quiero seguir viviendo', 'no quiero existir',
          'sería mejor si no existiera', 'el mundo estaría mejor sin mí', 'todos estarían mejor sin mí',
          'nadie me extrañaría si me fuera', 'no valgo nada', 'no merezco vivir', 'no merezco estar aquí',
          'mi vida no tiene sentido', 'no veo razón para vivir', 'prefiero estar muerto', 'prefiero morir',
          'ojalá nunca hubiera nacido', 'quiero desaparecer para siempre', 'no quiero despertar mañana'
        ],
        autolesion: [
          'me corto', 'me corté', 'me estoy cortando', 'quiero cortarme', 'me hago daño a mí mismo',
          'me hago daño a mí misma', 'me lastimo', 'me estoy lastimando', 'me quemo', 'me estoy quemando',
          'me golpeo a mí mismo', 'me golpeo a mí misma', 'me araño', 'me estoy arañando',
          'quiero hacerme daño', 'tengo ganas de hacerme daño', 'me autolesiono', 'me autolesioné',
          'pensar en hacerme daño', 'a veces me hago daño', 'me lastimo cuando estoy triste'
        ],
        muerte: [
          'quiero morir', 'espero morir', 'ojalá me muera', 'ojalá me muera pronto', 'quiero estar muerto',
          'quiero estar muerta', 'prefiero estar muerto', 'prefiero estar muerta', 'quiero desaparecer',
          'quiero desaparecer para siempre', 'no quiero estar aquí', 'no quiero existir', 'no quiero vivir',
          'sería mejor si estuviera muerto', 'sería mejor si estuviera muerta', 'la muerte sería mejor',
          'espero que algo me mate', 'no me importa si muero', 'me da igual si muero'
        ],
        abuso: [
          'me abusaron', 'fui abusado', 'fui abusada', 'me están abusando', 'sufro abuso',
          'me violaron', 'fui violado', 'fui violada', 'me están violando', 'sufro violación',
          'me tocaron sin permiso', 'me tocan sin permiso', 'me tocan de forma inapropiada',
          'acoso sexual', 'sufro acoso sexual', 'me acosan sexualmente', 'acoso físico',
          'sufro acoso físico', 'me acosan físicamente', 'me hacen cosas que no quiero',
          'alguien me hace daño', 'alguien me lastima', 'tengo miedo de alguien que me hace daño'
        ]
      },
      
      // RIESGO ALTO - Requiere atención prioritaria
      high: {
        bullying: [
          'me hacen bullying', 'me están haciendo bullying', 'sufro bullying', 'me acosan',
          'me están acosando', 'me pegan', 'me están pegando', 'me golpean', 'me están golpeando',
          'me insultan', 'me están insultando', 'me humillan', 'me están humillando',
          'me excluyen', 'me están excluyendo', 'no me dejan en paz', 'me persiguen',
          'me están persiguiendo', 'me amenazan', 'me están amenazando', 'me molestan frecuentemente',
          'me hacen daño', 'me están haciendo daño', 'me roban mis cosas', 'me rompen mis cosas',
          'me hacen burla', 'se burlan de mí', 'me hacen sentir mal', 'me hacen llorar',
          'me hacen sentir inferior', 'me tratan mal', 'me hacen sentir que no valgo nada',
          'me hacen sentir que no pertenezco', 'me hacen sentir excluido', 'me hacen sentir excluida'
        ],
        violencia: [
          'me pegan', 'me están pegando', 'me golpean', 'me están golpeando', 'conflicto violento',
          'hay violencia', 'sufro violencia', 'me agreden', 'me están agrediendo', 'hay peleas',
          'me amenazan con violencia', 'tengo miedo de que me peguen', 'me hacen daño físico',
          'me lastiman físicamente', 'me hacen daño a propósito', 'me golpean sin razón'
        ],
        miedo: [
          'tengo miedo', 'me da miedo', 'tengo mucho miedo', 'estoy asustado', 'estoy asustada',
          'tengo pánico', 'siento terror', 'tengo miedo de', 'tengo miedo constante',
          'vivo con miedo', 'tengo miedo todo el tiempo', 'me da mucho miedo', 'tengo miedo de ir a la escuela',
          'tengo miedo de mis compañeros', 'tengo miedo de que me hagan daño', 'tengo miedo de que me peguen',
          'tengo miedo de que me molesten', 'siento miedo todo el día', 'no puedo dejar de tener miedo'
        ],
        soledad: [
          'me siento solo', 'me siento sola', 'me siento muy solo', 'me siento muy sola',
          'nadie me habla', 'no tengo amigos', 'nadie me quiere', 'nadie me entiende',
          'me siento aislado', 'me siento aislada', 'estoy solo', 'estoy sola', 'me siento completamente solo',
          'me siento completamente sola', 'nadie quiere estar conmigo', 'nadie quiere ser mi amigo',
          'nadie quiere ser mi amiga', 'me siento rechazado', 'me siento rechazada', 'me siento excluido',
          'me siento excluida', 'nadie me incluye', 'me siento invisible', 'nadie me nota',
          'me siento como si no existiera', 'nadie se preocupa por mí', 'me siento abandonado',
          'me siento abandonada', 'no tengo a nadie', 'no tengo con quién hablar', 'me siento desconectado',
          'me siento desconectada', 'me siento apartado', 'me siento apartada'
        ],
        tristeza_profunda: [
          'muy triste', 'tristeza profunda', 'estoy deprimido', 'estoy deprimida', 'me siento desesperado',
          'me siento desesperada', 'sin esperanza', 'sin ganas', 'sin ánimo', 'sin energía',
          'muy triste últimamente', 'me siento muy triste', 'estoy muy triste', 'me siento deprimido',
          'me siento deprimida', 'siento depresión', 'me siento sin esperanza', 'no tengo esperanza',
          'me siento sin ganas de nada', 'no tengo ganas de nada', 'me siento vacío', 'me siento vacía',
          'me siento sin propósito', 'no veo sentido a nada', 'me siento sin ilusión', 'me siento hundido',
          'me siento hundida', 'me siento en un pozo', 'me siento atrapado', 'me siento atrapada',
          'me siento sin salida', 'no veo salida', 'me siento perdido', 'me siento perdida'
        ]
      },
      
      // RIESGO MEDIO - Requiere seguimiento
      medium: {
        tristeza: [
          'me siento triste', 'estoy triste', 'me siento melancólico', 'me siento melancólica',
          'quiero llorar', 'tengo ganas de llorar', 'me dan ganas de llorar', 'lloro mucho',
          'lloro frecuentemente', 'me siento lloroso', 'me siento llorosa', 'me siento nostálgico',
          'me siento nostálgica', 'me siento apenado', 'me siento apenada', 'me siento decaído',
          'me siento decaída', 'me siento bajo de ánimo', 'me siento desanimado', 'me siento desanimada'
        ],
        ansiedad: [
          'tengo ansiedad', 'me siento ansioso', 'me siento ansiosa', 'estoy nervioso', 'estoy nerviosa',
          'muy preocupado', 'muy preocupada', 'me siento agobiado', 'me siento agobiada', 'siento ansiedad',
          'me da ansiedad', 'tengo mucha ansiedad', 'me siento muy nervioso', 'me siento muy nerviosa',
          'me siento inquieto', 'me siento inquieta', 'me siento intranquilo', 'me siento intranquila',
          'me siento angustiado', 'me siento angustiada', 'me siento tenso', 'me siento tensa',
          'me siento preocupado constantemente', 'me siento preocupada constantemente', 'tengo pensamientos ansiosos',
          'me preocupa todo', 'me preocupo mucho', 'me siento sobrecargado de preocupaciones',
          'me siento sobrecargada de preocupaciones', 'no puedo dejar de preocuparme'
        ],
        estres: [
          'estoy estresado', 'estoy estresada', 'muy estresado', 'muy estresada', 'siento presión',
          'me siento presionado', 'me siento presionada', 'estoy sobrecargado', 'estoy sobrecargada',
          'muy agotado', 'muy agotada', 'tengo mucho estrés', 'me siento estresado', 'me siento estresada',
          'siento mucho estrés', 'me siento abrumado', 'me siento abrumada', 'me siento agobiado por el trabajo',
          'me siento agobiada por el trabajo', 'tengo demasiadas cosas que hacer', 'no puedo con todas las tareas',
          'me siento presionado por las tareas', 'me siento presionada por las tareas', 'tengo mucha presión académica',
          'me siento agotado mentalmente', 'me siento agotada mentalmente', 'me siento quemado', 'me siento quemada'
        ],
        dificultades: [
          'no puedo con todo', 'no puedo más', 'no sé cómo hacerlo', 'no entiendo nada', 'me siento confundido',
          'me siento confundida', 'es muy difícil', 'tengo problemas', 'no puedo resolver mis problemas',
          'me siento incapaz', 'me siento incompetente', 'no sé qué hacer', 'no sé cómo resolver esto',
          'me siento perdido con las tareas', 'me siento perdida con las tareas', 'todo me parece difícil',
          'me siento frustrado', 'me siento frustrada', 'me siento bloqueado', 'me siento bloqueada',
          'no puedo avanzar', 'me siento estancado', 'me siento estancada', 'tengo dificultades académicas',
          'me cuesta mucho estudiar', 'no entiendo las clases', 'me siento atrasado', 'me siento atrasada'
        ],
        rechazo: [
          'me rechazan', 'me excluyen', 'me ignoran', 'no me aceptan', 'no me quieren',
          'me siento rechazado', 'me siento rechazada', 'me siento ignorado', 'me siento ignorada',
          'nadie me acepta', 'no me incluyen', 'me siento apartado', 'me siento apartada',
          'me siento como un extraño', 'me siento como una extraña', 'no encajo', 'no pertenezco',
          'me siento diferente', 'me siento fuera de lugar', 'no me siento parte del grupo',
          'me siento como si no encajara', 'me siento como un bicho raro'
        ],
        problemas_familiares: [
          'tengo problemas en casa', 'hay problemas en mi familia', 'mi familia tiene problemas',
          'me siento mal en casa', 'no me siento bien en casa', 'hay conflictos en mi familia',
          'mis padres pelean', 'mis padres discuten mucho', 'me siento mal con mi familia',
          'no me entienden en casa', 'me siento solo en casa', 'me siento sola en casa',
          'tengo problemas con mis padres', 'tengo problemas con mi familia', 'me siento incomprendido en casa',
          'me siento incomprendida en casa', 'no me apoyan en casa', 'me siento juzgado en casa',
          'me siento juzgada en casa'
        ],
        problemas_academicos: [
          'me va mal en la escuela', 'no entiendo las clases', 'me siento perdido en clase',
          'me siento perdida en clase', 'tengo malas notas', 'me siento fracasado académicamente',
          'me siento fracasada académicamente', 'no puedo seguir el ritmo', 'me siento atrasado',
          'me siento atrasada', 'tengo miedo de reprobar', 'me siento presionado por las notas',
          'me siento presionada por las notas', 'no puedo concentrarme', 'me cuesta estudiar',
          'me siento abrumado por las tareas', 'me siento abrumada por las tareas'
        ]
      },
      
      // RIESGO BAJO - Seguimiento preventivo
      low: {
        preocupacion: [
          'tengo preocupación', 'estoy preocupado', 'estoy preocupada', 'siento inquietud', 'tengo dudas',
          'me preocupa', 'tengo algunas preocupaciones', 'me siento un poco preocupado',
          'me siento un poco preocupada', 'tengo inquietudes', 'me genera dudas'
        ],
        cansancio: [
          'estoy cansado', 'estoy cansada', 'siento fatiga', 'tengo agotamiento', 'me siento sin fuerzas',
          'me siento cansado', 'me siento cansada', 'estoy un poco cansado', 'estoy un poco cansada',
          'me siento fatigado', 'me siento fatigada', 'me falta energía', 'me siento sin energía'
        ],
        dificultad_menor: [
          'es complicado', 'es complejo', 'es desafiante', 'es un poco difícil', 'me cuesta un poco',
          'es retador', 'me presenta desafíos', 'requiere esfuerzo'
        ]
      }
    };
    
    // Frases de contexto que aumentan el riesgo
    this.contextPhrases = {
      critical: [
        'no quiero vivir más', 'no quiero seguir viviendo', 'no quiero vivir',
        'sería mejor si no existiera', 'sería mejor sin mí', 'el mundo estaría mejor sin mí',
        'nadie me extrañaría', 'nadie me extrañaría si me fuera', 'nadie notaría si me fuera',
        'todos estarían mejor sin mí', 'todos estarían mejor si no existiera',
        'quiero desaparecer', 'quiero desaparecer para siempre', 'quiero que me desaparezca',
        'no aguanto más', 'ya no aguanto más', 'no puedo aguantar más',
        'estoy harto de todo', 'estoy harta de todo', 'estoy cansado de todo', 'estoy cansada de todo',
        'ya no puedo más', 'no puedo más con esto', 'no soporto más', 'no aguanto esta situación',
        'quiero que todo termine', 'quiero que acabe todo', 'no veo salida', 'no hay salida para mí',
        'mi vida no tiene sentido', 'no tiene sentido vivir', 'no vale la pena vivir'
      ],
      high: [
        'me siento muy solo', 'me siento muy sola', 'me siento completamente solo',
        'me siento completamente sola', 'nadie me entiende', 'nadie me comprende',
        'todos me odian', 'todos me rechazan', 'todos están en mi contra',
        'no tengo a nadie', 'no tengo a nadie que me entienda', 'no tengo apoyo',
        'me siento perdido', 'me siento perdida', 'me siento sin rumbo',
        'no sé qué hacer', 'no sé qué hacer con mi vida', 'no sé cómo seguir',
        'todo está mal', 'todo me sale mal', 'nada me sale bien',
        'nada tiene sentido', 'nada tiene sentido en mi vida', 'no le veo sentido a nada',
        'me siento sin esperanza', 'no tengo esperanza', 'no veo futuro',
        'me siento atrapado', 'me siento atrapada', 'me siento sin salida',
        'no puedo con esto', 'no puedo manejar esto', 'esto es demasiado para mí',
        'me siento abrumado', 'me siento abrumada', 'me siento sobrecargado',
        'me siento sobrecargada', 'tengo demasiados problemas', 'mis problemas son demasiados'
      ],
      medium: [
        'me siento triste últimamente', 'me siento un poco triste', 'estoy pasando por un momento difícil',
        'me siento preocupado', 'me siento preocupada', 'tengo algunas preocupaciones',
        'me siento estresado', 'me siento estresada', 'tengo mucho que hacer',
        'me siento agobiado', 'me siento agobiada', 'tengo muchas responsabilidades',
        'me cuesta un poco', 'me está costando', 'es un poco difícil para mí',
        'me siento confundido', 'me siento confundida', 'no estoy seguro', 'no estoy segura'
      ]
    };
    
    // Palabras y frases positivas que pueden reducir el riesgo (si aparecen junto con negativas)
    this.positiveIndicators = [
      // Mejora y progreso
      'mejor', 'mejorando', 'me siento mejor', 'estoy mejor', 'voy mejorando', 'cada vez mejor',
      'progreso', 'estoy progresando', 'hago progresos', 'avanzar', 'estoy avanzando', 'avanzando',
      'superar', 'estoy superando', 'puedo superar', 'superación', 'mejorar', 'quiero mejorar',
      'cambiar', 'quiero cambiar', 'estoy cambiando', 'cambio positivo', 'mejoría',
      
      // Apoyo y ayuda
      'ayuda', 'me ayuda', 'me están ayudando', 'recibo ayuda', 'tengo ayuda',
      'apoyo', 'tengo apoyo', 'me apoyan', 'me siento apoyado', 'me siento apoyada',
      'hablar', 'puedo hablar', 'hablar ayuda', 'hablar con alguien', 'compartir',
      'puedo compartir', 'compartir ayuda', 'entender', 'me entienden', 'me siento entendido',
      'me siento entendida', 'comunicación', 'puedo comunicarme',
      
      // Esperanza y futuro
      'esperanza', 'tengo esperanza', 'me da esperanza', 'esperanzado', 'esperanzada',
      'futuro', 'mi futuro', 'veo futuro', 'tengo futuro', 'mejor futuro',
      'optimista', 'me siento optimista', 'positivo', 'me siento positivo', 'me siento positiva',
      
      // Fortaleza y capacidad
      'puedo', 'soy capaz', 'puedo hacerlo', 'puedo lograrlo', 'soy fuerte',
      'tengo fuerza', 'puedo superar', 'puedo manejar', 'puedo enfrentar',
      'confianza', 'tengo confianza', 'me siento capaz', 'soy competente',
      
      // Bienestar y satisfacción
      'bien', 'me siento bien', 'estoy bien', 'me siento bien conmigo',
      'feliz', 'me siento feliz', 'estoy feliz', 'contento', 'contenta',
      'satisfecho', 'satisfecha', 'me siento satisfecho', 'me siento satisfecha',
      'orgulloso', 'orgullosa', 'me siento orgulloso', 'me siento orgullosa',
      
      // Conexión y pertenencia
      'amigos', 'tengo amigos', 'mis amigos', 'amistad', 'tengo amistades',
      'pertenezco', 'me siento parte de', 'me incluyen', 'me aceptan',
      'me quieren', 'me aprecian', 'me valoran', 'me respetan',
      
      // Aprendizaje y crecimiento
      'aprender', 'estoy aprendiendo', 'aprendo', 'crecer', 'estoy creciendo',
      'desarrollo', 'me desarrollo', 'evoluciono', 'maduro', 'madura',
      'experiencia', 'aprendo de', 'me enseña', 'me ayuda a crecer',
      
      // Gratitud y reconocimiento
      'gracias', 'agradecido', 'agradecida', 'me siento agradecido', 'me siento agradecida',
      'reconocimiento', 'me reconocen', 'me valoran', 'aprecio', 'aprecian',
      
      // Solución y resolución
      'solución', 'encontré solución', 'hay solución', 'puedo resolver',
      'resolver', 'puedo solucionar', 'encontrar salida', 'hay salida',
      'mejorar la situación', 'cambiar la situación', 'superar el problema'
    ];
  }
  
  // Normalizar texto para análisis
  normalizeText(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .trim();
  }
  
  // Analizar mensaje completo
  analyzeMessage(messageContent) {
    if (!messageContent || typeof messageContent !== 'string') {
      return {
        nivelRiesgo: 'BAJO',
        categoria: 'otro',
        keywordsDetectadas: [],
        sentimiento: 'neutral',
        urgencia: 1,
        razon: 'Mensaje vacío o inválido',
        sugerencia: 'No se requiere acción',
        score: 0
      };
    }
    
    const normalizedText = this.normalizeText(messageContent);
    const detectedKeywords = [];
    let maxRiskLevel = 'BAJO';
    let maxUrgency = 1;
    let categories = [];
    let totalScore = 0;
    
    // Función auxiliar para ordenar keywords por longitud (más largas primero)
    const sortByLength = (a, b) => b.length - a.length;
    
    // PRIMERO: Analizar frases de contexto (tienen máxima prioridad)
    // Ordenar por longitud (más largas primero) para evitar detectar subcadenas
    const criticalPhrases = [...this.contextPhrases.critical].sort(sortByLength);
    for (const phrase of criticalPhrases) {
      if (normalizedText.includes(phrase)) {
        if (maxRiskLevel !== 'CRITICO') {
          maxRiskLevel = 'CRITICO';
          maxUrgency = 10;
          totalScore += 100;
        }
        detectedKeywords.push({ keyword: phrase, category: 'contexto_critico', level: 'CRITICAL' });
        // Marcar el texto como procesado para evitar detectar subcadenas
        // No continuar buscando en esta sección una vez encontrada una frase
        break;
      }
    }
    
    const highPhrases = [...this.contextPhrases.high].sort(sortByLength);
    for (const phrase of highPhrases) {
      if (normalizedText.includes(phrase)) {
        if (maxRiskLevel === 'BAJO' || maxRiskLevel === 'MEDIO') {
          maxRiskLevel = 'ALTO';
          maxUrgency = Math.max(maxUrgency, 7);
          totalScore += 50;
        }
        detectedKeywords.push({ keyword: phrase, category: 'contexto_alto', level: 'HIGH' });
        // No continuar buscando en esta sección una vez encontrada una frase
        break;
      }
    }
    
    const mediumPhrases = [...this.contextPhrases.medium].sort(sortByLength);
    for (const phrase of mediumPhrases) {
      if (normalizedText.includes(phrase)) {
        if (maxRiskLevel === 'BAJO') {
          maxRiskLevel = 'MEDIO';
          maxUrgency = Math.max(maxUrgency, 5);
          totalScore += 25;
        }
        detectedKeywords.push({ keyword: phrase, category: 'contexto_medio', level: 'MEDIUM' });
        // No continuar buscando en esta sección una vez encontrada una frase
        break;
      }
    }
    
    // SEGUNDO: Analizar keywords críticas (ordenadas por longitud, frases primero)
    if (maxRiskLevel !== 'CRITICO') {
      for (const [category, keywordList] of Object.entries(this.keywords.critical)) {
        // Ordenar por longitud (frases más largas primero)
        const sortedKeywords = [...keywordList].sort(sortByLength);
        for (const keyword of sortedKeywords) {
          if (normalizedText.includes(keyword)) {
            detectedKeywords.push({ keyword, category, level: 'CRITICAL' });
            maxRiskLevel = 'CRITICO';
            maxUrgency = 10;
            categories.push(category);
            totalScore += 100;
            // Detectar todas las keywords, no solo la primera
          }
        }
      }
    }
    
    // TERCERO: Analizar keywords de alto riesgo (ordenadas por longitud)
    if (maxRiskLevel !== 'CRITICO') {
      for (const [category, keywordList] of Object.entries(this.keywords.high)) {
        const sortedKeywords = [...keywordList].sort(sortByLength);
        for (const keyword of sortedKeywords) {
          if (normalizedText.includes(keyword)) {
            detectedKeywords.push({ keyword, category, level: 'HIGH' });
            if (maxRiskLevel === 'BAJO' || maxRiskLevel === 'MEDIO') {
              maxRiskLevel = 'ALTO';
              maxUrgency = Math.max(maxUrgency, 7);
            }
            categories.push(category);
            totalScore += 50;
            // Detectar todas las keywords, no solo la primera
          }
        }
      }
    }
    
    // CUARTO: Analizar keywords de riesgo medio (ordenadas por longitud)
    if (maxRiskLevel === 'BAJO' || maxRiskLevel === 'MEDIO') {
      for (const [category, keywordList] of Object.entries(this.keywords.medium)) {
        const sortedKeywords = [...keywordList].sort(sortByLength);
        for (const keyword of sortedKeywords) {
          if (normalizedText.includes(keyword)) {
            detectedKeywords.push({ keyword, category, level: 'MEDIUM' });
            if (maxRiskLevel === 'BAJO') {
              maxRiskLevel = 'MEDIO';
              maxUrgency = Math.max(maxUrgency, 5);
            }
            categories.push(category);
            totalScore += 25;
            // Detectar todas las keywords, no solo la primera
          }
        }
      }
    }
    
    // Verificar indicadores positivos (pueden reducir el riesgo ligeramente)
    let positiveCount = 0;
    for (const positive of this.positiveIndicators) {
      if (normalizedText.includes(positive)) {
        positiveCount++;
      }
    }
    
    // Si hay muchos indicadores positivos y pocos negativos, reducir riesgo
    if (positiveCount > detectedKeywords.length && detectedKeywords.length > 0) {
      if (maxRiskLevel === 'CRITICO') {
        maxRiskLevel = 'ALTO';
        maxUrgency = Math.max(7, maxUrgency - 1);
      } else if (maxRiskLevel === 'ALTO') {
        maxRiskLevel = 'MEDIO';
        maxUrgency = Math.max(5, maxUrgency - 1);
      }
    }
    
    // Determinar sentimiento
    let sentimiento = 'neutral';
    if (detectedKeywords.length > 0) {
      if (maxRiskLevel === 'CRITICO' || maxRiskLevel === 'ALTO') {
        sentimiento = 'negativo';
      } else {
        sentimiento = 'ligeramente_negativo';
      }
    } else if (positiveCount > 2) {
      sentimiento = 'positivo';
    }
    
    // Categoría principal
    const categoriaPrincipal = categories.length > 0 ? categories[0] : 'otro';
    
    // Eliminar duplicados y subcadenas de keywords
    // Primero ordenar por longitud (más largas primero) para detectar subcadenas correctamente
    const sortedKeywords = [...detectedKeywords].sort((a, b) => {
      // Ordenar por longitud (más largas primero), luego alfabéticamente para consistencia
      if (b.keyword.length !== a.keyword.length) {
        return b.keyword.length - a.keyword.length;
      }
      return a.keyword.localeCompare(b.keyword);
    });
    
    const uniqueKeywords = [];
    const seenKeywords = new Set();
    const normalizedSeen = new Set(); // Para comparaciones normalizadas
    
    for (const kw of sortedKeywords) {
      const normalizedKw = this.normalizeText(kw.keyword);
      
      // Verificar si esta keyword ya fue agregada (duplicado exacto normalizado)
      if (normalizedSeen.has(normalizedKw)) {
        continue;
      }
      
      // Verificar si esta keyword está contenida en alguna keyword más larga ya agregada
      let isSubstring = false;
      for (const normalizedExisting of normalizedSeen) {
        // Si la keyword actual está contenida en una keyword más larga, descartarla
        // O si una keyword más larga está contenida en la actual (no debería pasar por el orden)
        if (normalizedExisting.length > normalizedKw.length && normalizedExisting.includes(normalizedKw)) {
          isSubstring = true;
          break;
        }
        // También verificar el caso inverso (por si acaso)
        if (normalizedKw.length > normalizedExisting.length && normalizedKw.includes(normalizedExisting)) {
          // Si encontramos una keyword más larga que contiene una ya agregada, 
          // debemos remover la más corta y agregar la más larga
          // Pero como estamos iterando de más largas a más cortas, esto no debería pasar
          // Dejamos este check por seguridad
        }
      }
      
      // Si no es duplicado ni subcadena, agregarla
      if (!isSubstring) {
        normalizedSeen.add(normalizedKw);
        seenKeywords.add(kw.keyword);
        uniqueKeywords.push(kw);
      }
    }
    
    // Generar sugerencia basada en el análisis
    const sugerencia = this.generateSuggestion(maxRiskLevel, categoriaPrincipal, uniqueKeywords.length);
    
    // Razon del análisis
    const razon = this.generateReason(maxRiskLevel, uniqueKeywords, normalizedText);
    
    return {
      nivelRiesgo: maxRiskLevel,
      categoria: categoriaPrincipal,
      keywordsDetectadas: [...new Set(uniqueKeywords.map(kw => kw.keyword))], // Eliminar duplicados exactos también
      keywordsDetalladas: uniqueKeywords,
      sentimiento: sentimiento,
      urgencia: maxUrgency,
      razon: razon,
      sugerencia: sugerencia,
      score: Math.min(100, totalScore),
      timestamp: new Date().toISOString()
    };
  }
  
  // Generar sugerencia para el docente
  generateSuggestion(nivelRiesgo, categoria, keywordCount) {
    const suggestions = {
      CRITICO: {
        suicidio: '⚠️ ATENCIÓN INMEDIATA: Contactar inmediatamente con el estudiante y el equipo de apoyo psicológico. Este es un caso de máxima prioridad.',
        autolesion: '⚠️ ATENCIÓN INMEDIATA: El estudiante menciona autolesión. Contactar con apoyo psicológico y realizar seguimiento cercano.',
        muerte: '⚠️ ATENCIÓN INMEDIATA: El estudiante expresa pensamientos sobre la muerte. Requiere intervención profesional inmediata.',
        abuso: '⚠️ ATENCIÓN INMEDIATA: Posible caso de abuso detectado. Contactar con autoridades competentes y apoyo especializado.',
        default: '⚠️ ATENCIÓN INMEDIATA: Se detectaron señales de riesgo crítico. Contactar con el estudiante y el equipo de apoyo lo antes posible.'
      },
      ALTO: {
        bullying: '🔴 PRIORIDAD ALTA: El estudiante reporta situaciones de bullying. Investigar la situación y proporcionar apoyo inmediato.',
        violencia: '🔴 PRIORIDAD ALTA: Se detectaron referencias a violencia. Monitorear la situación y ofrecer apoyo.',
        miedo: '🔴 PRIORIDAD ALTA: El estudiante expresa miedo significativo. Ofrecer un espacio seguro para conversar.',
        soledad: '🔴 PRIORIDAD ALTA: El estudiante se siente aislado. Facilitar conexiones sociales y apoyo emocional.',
        tristeza_profunda: '🔴 PRIORIDAD ALTA: El estudiante muestra signos de tristeza profunda. Considerar apoyo psicológico.',
        default: '🔴 PRIORIDAD ALTA: Se detectaron múltiples señales de riesgo. Realizar seguimiento cercano y ofrecer apoyo.'
      },
      MEDIO: {
        tristeza: '🟡 SEGUIMIENTO: El estudiante muestra signos de tristeza. Mantener comunicación abierta y ofrecer apoyo.',
        ansiedad: '🟡 SEGUIMIENTO: El estudiante expresa ansiedad. Proporcionar estrategias de manejo y apoyo emocional.',
        estres: '🟡 SEGUIMIENTO: El estudiante reporta estrés. Ayudar con técnicas de manejo de estrés.',
        dificultades: '🟡 SEGUIMIENTO: El estudiante enfrenta dificultades. Ofrecer apoyo académico y emocional.',
        default: '🟡 SEGUIMIENTO: Se detectaron algunas señales de preocupación. Mantener comunicación y observación.'
      },
      BAJO: {
        default: '🟢 OBSERVACIÓN: El mensaje no muestra señales de riesgo significativo. Continuar con el seguimiento regular.'
      }
    };
    
    const nivel = nivelRiesgo.toUpperCase();
    if (suggestions[nivel] && suggestions[nivel][categoria]) {
      return suggestions[nivel][categoria];
    }
    if (suggestions[nivel] && suggestions[nivel].default) {
      return suggestions[nivel].default;
    }
    return suggestions.BAJO.default;
  }
  
  // Generar razón del análisis
  generateReason(nivelRiesgo, detectedKeywords, normalizedText) {
    if (detectedKeywords.length === 0) {
      return 'No se detectaron keywords de riesgo en el mensaje.';
    }
    
    const keywordCount = detectedKeywords.length;
    const mainKeywords = detectedKeywords.slice(0, 3).map(kw => kw.keyword).join(', ');
    
    if (nivelRiesgo === 'CRITICO') {
      return `Se detectaron ${keywordCount} keyword(s) de riesgo crítico: ${mainKeywords}. Requiere atención inmediata.`;
    } else if (nivelRiesgo === 'ALTO') {
      return `Se detectaron ${keywordCount} keyword(s) de alto riesgo: ${mainKeywords}. Requiere seguimiento prioritario.`;
    } else if (nivelRiesgo === 'MEDIO') {
      return `Se detectaron ${keywordCount} keyword(s) de riesgo medio: ${mainKeywords}. Requiere seguimiento.`;
    }
    
    return `Se detectaron ${keywordCount} keyword(s) relacionadas con preocupaciones menores.`;
  }
  
  // Analizar múltiples mensajes para detectar tendencias
  analyzeTrends(messages, days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentMessages = messages.filter(msg => 
      new Date(msg.timestamp) >= cutoffDate
    );
    
    const analyses = recentMessages.map(msg => ({
      ...this.analyzeMessage(msg.content),
      timestamp: msg.timestamp,
      studentId: msg.studentId
    }));
    
    // Agrupar por nivel de riesgo
    const riskDistribution = {
      CRITICO: analyses.filter(a => a.nivelRiesgo === 'CRITICO').length,
      ALTO: analyses.filter(a => a.nivelRiesgo === 'ALTO').length,
      MEDIO: analyses.filter(a => a.nivelRiesgo === 'MEDIO').length,
      BAJO: analyses.filter(a => a.nivelRiesgo === 'BAJO').length
    };
    
    // Categorías más frecuentes
    const categoryCounts = {};
    analyses.forEach(analysis => {
      if (analysis.categoria !== 'otro') {
        categoryCounts[analysis.categoria] = (categoryCounts[analysis.categoria] || 0) + 1;
      }
    });
    
    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));
    
    // Keywords más frecuentes
    const keywordCounts = {};
    analyses.forEach(analysis => {
      analysis.keywordsDetectadas.forEach(kw => {
        keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
      });
    });
    
    const topKeywords = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));
    
    return {
      totalMessages: recentMessages.length,
      analyzedMessages: analyses.length,
      riskDistribution,
      topCategories,
      topKeywords,
      averageUrgency: analyses.length > 0 
        ? analyses.reduce((sum, a) => sum + a.urgencia, 0) / analyses.length 
        : 0,
      criticalCount: riskDistribution.CRITICO,
      highCount: riskDistribution.ALTO
    };
  }
}

// Crear instancia global
const keywordAnalyzer = new KeywordAnalyzer();

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = keywordAnalyzer;
}

