// ========== VARIABLES GLOBALES ==========
let currentUser = null;
let currentView = 'login';
let riskAlertsFilters = {
    riskLevel: 'all',
    caseStatus: 'all',
    dateFrom: null,
    dateTo: null
};

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', async function() {
    // Primero, asegurar que todas las vistas estén ocultas excepto la que debe mostrarse
    initViews();
    // initDarkMode(); // Deshabilitado - modo nocturno removido
    // initLanguage(); // Deshabilitado - traducción removida
    initDemoData();
    await initHistory();
    await checkAuthAndLoadView();
    initLogin();
    initRequestDemoForm();
    initGrowthSpaceForms();
    setupHistoryNavigation();
    initLandingNavigation();
});

// ========== CONFIGURACIÓN INICIAL ==========

// Inicializar vistas - asegurar que todas estén en el estado correcto
function initViews() {
    // Ocultar todas las vistas excepto landing (que se mostrará por defecto)
    const allViews = [
        'loginView',
        'requestDemoView',
        'studentView',
        'studentMessagesView',
        'studentProfileView',
        'teacherView',
        'teacherMessagesView',
        'teacherStudentsView',
        'teacherNotificationsView',
        'teacherClassCodesView',
        'teacherGrowthSpacesView',
    ];
    
    allViews.forEach(viewId => {
        const view = document.getElementById(viewId);
        if (view) {
            view.classList.add('hidden');
        }
    });
    
    // Asegurar que landingView esté visible
    const landingView = document.getElementById('landingView');
    if (landingView) {
        landingView.classList.remove('hidden');
    }
}

// Inicializar historial del navegador
async function initHistory() {
    // Verificar si hay usuario logueado antes de establecer estado inicial
    const user = await getCurrentUser();
    if (user) {
        // Si hay usuario, el estado se establecerá en checkAuthAndLoadView según el rol
        return;
    }
    // Si no hay usuario y no hay hash, establecer landing como estado inicial
    if (window.location.hash === '' || window.location.hash === '#') {
        history.replaceState({ view: 'landing' }, '', window.location.pathname);
    }
}

// Configurar navegación con historial del navegador
function setupHistoryNavigation() {
    // Escuchar cambios en el historial (botón atrás/adelante del navegador)
    window.addEventListener('popstate', async function(event) {
        // Asegurar que currentUser esté sincronizado
        if (!currentUser) {
            currentUser = await getCurrentUser();
        }
        
        const state = event.state;
        if (state && state.view) {
            navigateToView(state.view, false);
        } else {
            // Si no hay estado, verificar hash
            const hash = window.location.hash.slice(1);
            if (hash === 'login') {
                navigateToView('login', false);
            } else {
                // Si hay usuario logueado, mantener sesión al ir a landing
                navigateToView('landing', false);
            }
        }
    });

    // Manejar hash changes si se usa
    window.addEventListener('hashchange', async function() {
        // Asegurar que currentUser esté sincronizado
        if (!currentUser) {
            currentUser = await getCurrentUser();
        }
        
        const hash = window.location.hash.slice(1);
        if (hash === 'login') {
            navigateToView('login', false);
        } else {
            navigateToView('landing', false);
        }
    });
}

// Navegar a una vista específica
async function navigateToView(view, updateHistory = false) {
    // Asegurar que currentUser esté sincronizado
    if (!currentUser) {
        currentUser = await getCurrentUser();
    }
    
    switch(view) {
        case 'login':
            showLoginView(updateHistory);
            break;
        case 'requestDemo':
        case 'request-demo':
            showRequestDemoView();
            break;
        case 'student':
            if (currentUser && currentUser.role === 'student') {
                showStudentView();
                initStudentDashboard();
                // Actualizar nombre del usuario
                updateStudentName();
            } else {
                showLandingView(updateHistory);
            }
            break;
        case 'studentProfile':
            if (currentUser && currentUser.role === 'student') {
                showStudentProfileView();
            } else {
                showLandingView(updateHistory);
            }
            break;
        case 'teacher':
            if (currentUser && currentUser.role === 'teacher') {
                showTeacherView();
                initTeacherDashboard();
                // Actualizar nombre del usuario
                updateTeacherName();
            } else {
                showLandingView(updateHistory);
            }
            break;
        case 'teacherNotifications':
            if (currentUser && currentUser.role === 'teacher') {
                showTeacherNotificationsView();
            } else {
                showLandingView(updateHistory);
            }
            break;
        case 'teacherGrowthSpaces':
        case 'growthSpaces':
            if (currentUser && currentUser.role === 'teacher') {
                showTeacherGrowthSpacesView();
            } else {
                showLandingView(updateHistory);
            }
            break;
        case 'landing':
        default:
            showLandingView(updateHistory);
            break;
    }
}

// ========== DATOS DE DEMO ==========

// Función para generar nombres aleatorios de estudiantes
function generateStudentNames(count) {
    const firstNames = {
        masculino: ['Carlos', 'Juan', 'Luis', 'Miguel', 'Javier', 'Francisco', 'José', 'Antonio', 'Manuel', 'Pedro', 'Diego', 'Alejandro', 'Fernando', 'Sergio', 'Andrés', 'Roberto', 'Daniel', 'Ricardo', 'Mario', 'Alberto', 'Eduardo', 'Raúl', 'Óscar', 'Pablo', 'Adrián', 'Víctor', 'Gabriel', 'Héctor', 'Iván', 'Jorge', 'Marcos', 'Nicolás', 'Óliver', 'Rafael', 'Tomás', 'Álvaro', 'Bruno', 'César', 'David', 'Emilio', 'Felipe', 'Gonzalo', 'Hugo', 'Ignacio', 'Joaquín', 'Leandro', 'Martín', 'Néstor', 'Óscar', 'Patricio'],
        femenino: ['María', 'Ana', 'Laura', 'Carmen', 'Isabel', 'Patricia', 'Lucía', 'Elena', 'Marta', 'Sofía', 'Paula', 'Claudia', 'Cristina', 'Andrea', 'Sara', 'Beatriz', 'Carolina', 'Diana', 'Elena', 'Fernanda', 'Gabriela', 'Helena', 'Inés', 'Julia', 'Karla', 'Lorena', 'Mariana', 'Natalia', 'Olivia', 'Paola', 'Rebeca', 'Silvia', 'Teresa', 'Valeria', 'Ximena', 'Yolanda', 'Zoe', 'Adriana', 'Bárbara', 'Camila', 'Daniela', 'Estefanía', 'Francisca', 'Gloria', 'Hortensia', 'Irene', 'Jimena', 'Karina', 'Liliana', 'Mónica']
    };
    
    const lastNames = ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Álvarez', 'Muñoz', 'Romero', 'Alonso', 'Gutiérrez', 'Navarro', 'Torres', 'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Ramírez', 'Serrano', 'Blanco', 'Suárez', 'Molina', 'Morales', 'Ortega', 'Delgado', 'Castro', 'Ortiz', 'Rubio', 'Marín', 'Sanz', 'Núñez', 'Iglesias', 'Medina', 'Garrido', 'Cortés', 'Castillo', 'Santos', 'Lozano', 'Guerrero', 'Cano', 'Prieto'];
    
    const names = [];
    const usedNames = new Set();
    
    while (names.length < count) {
        const gender = Math.random() < 0.5 ? 'masculino' : 'femenino';
        const firstName = firstNames[gender][Math.floor(Math.random() * firstNames[gender].length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const fullName = `${firstName} ${lastName}`;
        
        if (!usedNames.has(fullName)) {
            usedNames.add(fullName);
            names.push({
                name: fullName,
                gender: gender
            });
        }
    }
    
    return names;
}

// Función para generar 50 estudiantes demo con datos completos
function generate50StudentsDemo() {
    console.log('🔄 Generando 50 estudiantes demo con datos completos...');
    
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const existingClasses = JSON.parse(localStorage.getItem('classes') || '[]');
    
    // Asegurar que admin@munay.com existe
    let admin = existingUsers.find(u => u.email === 'admin@munay.com');
    if (!admin) {
        admin = {
            id: 'admin_local',
            name: 'Administrador',
            email: 'admin@munay.com',
            password: 'admin123',
            role: 'teacher',
            classCode: null,
            createdAt: new Date('2025-01-01').toISOString()
        };
        existingUsers.push(admin);
    }
    
    const classCode = 'CLSDEMO';
    
    // Eliminar estudiantes demo antiguos
    const updatedUsers = existingUsers.filter(u => 
        !(u.role === 'student' && u.classCode === classCode)
    );
    
    // Generar 50 estudiantes con nombres únicos
    const studentNames = generateStudentNames(50);
    const students = [];
    const baseTimestamp = new Date('2025-01-01').getTime();
    
    // Distribuir edades: 9-11 (30%), 12-15 (50%), 16-17 (20%)
    const ageDistribution = [];
    for (let i = 0; i < 15; i++) ageDistribution.push(9 + Math.floor(Math.random() * 3)); // 9-11
    for (let i = 0; i < 25; i++) ageDistribution.push(12 + Math.floor(Math.random() * 4)); // 12-15
    for (let i = 0; i < 10; i++) ageDistribution.push(16 + Math.floor(Math.random() * 2)); // 16-17
    
    // Mezclar distribución de edades
    for (let i = ageDistribution.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ageDistribution[i], ageDistribution[j]] = [ageDistribution[j], ageDistribution[i]];
    }
    
    for (let i = 1; i <= 50; i++) {
        const studentName = studentNames[i - 1];
        const age = ageDistribution[i - 1] || (9 + Math.floor(Math.random() * 9));
        const daysVariation = Math.floor(Math.random() * 30); // Variación en días de creación
        
        students.push({
            id: `student_demo_${i}`,
            name: studentName.name,
            email: `alumno${i}@demo.com`,
            password: 'alumno',
            role: 'student',
            classCode: classCode,
            age: age,
            gender: studentName.gender,
            createdAt: new Date(baseTimestamp + daysVariation * 24 * 60 * 60 * 1000).toISOString()
        });
    }
    
    // Actualizar o crear clase demo
    let demoClass = existingClasses.find(c => c.code === classCode);
    if (demoClass) {
        demoClass.teacherId = admin.id;
        demoClass.teacherName = admin.name;
        demoClass.name = 'Colegio Demo - 50 Estudiantes';
    } else {
        demoClass = {
            code: classCode,
            teacherId: admin.id,
            teacherName: admin.name,
            name: 'Colegio Demo - 50 Estudiantes',
            createdAt: new Date('2025-01-01').toISOString()
        };
        existingClasses.push(demoClass);
    }
    
    // Guardar usuarios actualizados
    const allUsers = [...updatedUsers, ...students];
    localStorage.setItem('users', JSON.stringify(allUsers));
    localStorage.setItem('classes', JSON.stringify(existingClasses));
    
    console.log(`✅ Creados 50 estudiantes demo`);
    console.log(`   - Distribución de edades: 9-11 años, 12-15 años, 16-17 años`);
    console.log(`   - Géneros: Masculino y Femenino`);
    
    // Generar datos de encuestas y actividades desde enero 2025 hasta 20 nov 2025
    try {
        generateDemoSurveyData2025(students, classCode);
        generateDemoActivityData2025(students, classCode);
        
        // Generar algunos mensajes anónimos (15% de los estudiantes)
        generateDemoMessages2025(students, classCode, admin);
    } catch (error) {
        console.error('❌ Error al generar datos:', error);
        if (error.name === 'QuotaExceededError') {
            console.warn('⚠️ localStorage está lleno. Limpiando datos antiguos...');
            // Limpiar datos antiguos que no sean de estos estudiantes
            const studentIds = students.map(s => s.id);
            const oldResponses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
            const oldActivities = JSON.parse(localStorage.getItem('studentActivities') || '[]');
            const oldMessages = JSON.parse(localStorage.getItem('anonymousMessages') || '[]');
            
            const cleanedResponses = oldResponses.filter(r => studentIds.includes(r.studentId));
            const cleanedActivities = oldActivities.filter(a => studentIds.includes(a.studentId));
            const cleanedMessages = oldMessages.filter(m => studentIds.includes(m.studentId));
            
            localStorage.setItem('surveyResponses', JSON.stringify(cleanedResponses));
            localStorage.setItem('studentActivities', JSON.stringify(cleanedActivities));
            localStorage.setItem('anonymousMessages', JSON.stringify(cleanedMessages));
            
            console.log('✅ Datos antiguos limpiados. Intenta recargar la página.');
        }
        throw error;
    }
    
    console.log('✅ Datos demo completos generados para 50 estudiantes');
    console.log('   Período: Enero 2025 - 20 Noviembre 2025');
    console.log('   Solo visible para: admin@munay.com');
}

// Inicializar datos de demo
function initDemoData() {
    // Verificar si ya existen datos (para no sobrescribir usuarios)
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const existingClasses = JSON.parse(localStorage.getItem('classes') || '[]');
    const existingMessages = JSON.parse(localStorage.getItem('anonymousMessages') || '[]');
    
    // Asegurar que el usuario admin exista en localStorage (fallback para cuando el backend no esté disponible)
    const adminExists = existingUsers.find(u => u.email === 'admin@munay.com');
    if (!adminExists) {
        const admin = {
            id: 'admin_local',
            name: 'Administrador',
            email: 'admin@munay.com',
            password: 'admin123',
            role: 'teacher',
            classCode: null,
            createdAt: new Date(1704067200000).toISOString()
        };
        existingUsers.push(admin);
        localStorage.setItem('users', JSON.stringify(existingUsers));
        console.log('✅ Usuario admin agregado a localStorage (fallback)');
    }
    
    // Asegurar que el usuario munay@munay.com exista (usuario personal del dueño)
    const munayOwnerExists = existingUsers.find(u => u.email === 'munay@munay.com');
    if (!munayOwnerExists) {
        const munayOwner = {
            id: 'munay_owner_local',
            name: 'Munay Owner',
            email: 'munay@munay.com',
            password: 'munay',
            role: 'teacher',
            classCode: null,
            createdAt: new Date(1704067200000).toISOString()
        };
        existingUsers.push(munayOwner);
        localStorage.setItem('users', JSON.stringify(existingUsers));
        console.log('✅ Usuario munay@munay.com agregado a localStorage');
    }
    
    // Verificar si se debe generar la versión de 50 estudiantes
    // Se activa si hay menos de 50 estudiantes demo o si se marca explícitamente
    const demoStudents = existingUsers.filter(u => u.role === 'student' && u.classCode === 'CLSDEMO');
    const shouldGenerate50 = localStorage.getItem('generate50Students') === 'true' || 
                              demoStudents.length === 0 ||
                              demoStudents.length < 50;
    
    if (shouldGenerate50) {
        console.log('🔄 Generando datos demo para 50 estudiantes...');
        console.log('   Esto puede tomar unos momentos...');
        try {
            generate50StudentsDemo();
            localStorage.setItem('generate50Students', 'false'); // Marcar como completado
            console.log('✅ Generación completada. Recarga la página para ver los datos.');
        } catch (error) {
            console.error('❌ Error al generar datos:', error);
        }
        return;
    }
    
    if (existingUsers.length > 0 && existingClasses.length > 0) {
        // Verificar y actualizar estudiantes demo si tienen IDs incorrectos
        const demoClass = existingClasses.find(c => c.code === 'CLSDEMO');
        if (demoClass) {
            const demoStudents = existingUsers.filter(u => u.role === 'student' && u.classCode === 'CLSDEMO');
            // Ya no se usa profe@profe.com, se eliminó
            
            // Verificar si los estudiantes demo tienen IDs correctos
            let needsUpdate = false;
            // Si hay menos de 50 estudiantes, actualizar a 50
            if (demoStudents.length < 50) {
                needsUpdate = true;
            } else {
                const expectedStudentIds = Array.from({ length: 50 }, (_, i) => `student_demo_${i + 1}`);
                const existingStudentIds = demoStudents.map(s => s.id);
                
                // Verificar si algún estudiante tiene ID incorrecto o falta algún estudiante
                if (demoStudents.length !== 50 || 
                    !existingStudentIds.every(id => expectedStudentIds.includes(id)) ||
                    !expectedStudentIds.every(id => existingStudentIds.includes(id))) {
                    needsUpdate = true;
                }
            }
            
            // Ya no se verifica profe@profe.com
            
            if (needsUpdate) {
                console.log('🔄 Actualizando estudiantes demo con datos consistentes...');
                // Actualizar estudiantes demo con datos fijos
                updateDemoStudents(existingUsers, existingClasses);
                return;
            }
            
            if (demoStudents.length > 0) {
                // Verificar si ya tienen encuestas (verificar si tienen menos de 10, entonces regenerar)
                const existingResponses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
                const demoStudentIds = demoStudents.map(s => s.id);
                const demoResponses = existingResponses.filter(r => demoStudentIds.includes(r.studentId));
                
                // Verificar si algún estudiante tiene pocas encuestas (menos de 10 = datos incompletos)
                const studentsWithFewSurveys = demoStudents.filter(student => {
                    const studentResponses = demoResponses.filter(r => r.studentId === student.id);
                    return studentResponses.length < 10;
                });
                
                if (studentsWithFewSurveys.length > 0 || demoResponses.length === 0) {
                    // Generar o regenerar encuestas DEMO para estudiantes existentes
                    console.log(`🔄 Regenerando datos demo para ${studentsWithFewSurveys.length > 0 ? studentsWithFewSurveys.length : demoStudents.length} estudiantes...`);
                    generateDemoSurveyData(demoStudents, 'CLSDEMO');
                    generateDemoActivityData(demoStudents, 'CLSDEMO');
                    console.log('✅ Encuestas y actividades DEMO generadas/actualizadas para estudiantes existentes');
                } else {
                    console.log('ℹ️ Los estudiantes demo ya tienen datos completos. Se mantienen los datos existentes.');
                }
                
                // Analizar mensajes demo existentes que no tengan análisis
                analyzeExistingDemoMessages();
            }
        }
        return; // Ya hay datos, no inicializar usuarios nuevos
    }

    // Generar código de clase para el docente
    const classCode = 'CLSDEMO';

    // Ya no se crea profe@profe.com - usar admin@munay.com
    // Asegurar que admin existe
    let admin = existingUsers.find(u => u.email === 'admin@munay.com');
    if (!admin) {
        admin = {
            id: 'admin_local',
            name: 'Administrador',
            email: 'admin@munay.com',
            password: 'admin123',
            role: 'teacher',
            classCode: null,
            createdAt: new Date(1704067200000).toISOString()
        };
        existingUsers.push(admin);
    }

    // Crear registro de clase (los estudiantes demo usan CLSDEMO, asociados a admin)
    const classData = {
        code: classCode,
        teacherId: admin.id,
        teacherName: admin.name,
        name: 'Clase Demo',
        createdAt: new Date().toISOString()
    };

    // Crear estudiantes (30 estudiantes DEMO) con datos fijos y consistentes
    // Lista predefinida de estudiantes con nombres, edades y géneros fijos
    const studentsData = [
        // 10 estudiantes de 9-11 años
        { name: 'Carlos', age: 10, gender: 'masculino' },
        { name: 'María', age: 9, gender: 'femenino' },
        { name: 'Juan', age: 11, gender: 'masculino' },
        { name: 'Ana', age: 10, gender: 'femenino' },
        { name: 'Luis', age: 9, gender: 'masculino' },
        { name: 'Laura', age: 11, gender: 'femenino' },
        { name: 'Miguel', age: 10, gender: 'masculino' },
        { name: 'Carmen', age: 9, gender: 'femenino' },
        { name: 'Javier', age: 11, gender: 'masculino' },
        { name: 'Isabel', age: 10, gender: 'femenino' },
        // 12 estudiantes de 12-15 años
        { name: 'Francisco', age: 13, gender: 'masculino' },
        { name: 'Patricia', age: 14, gender: 'femenino' },
        { name: 'José', age: 12, gender: 'masculino' },
        { name: 'Lucía', age: 15, gender: 'femenino' },
        { name: 'Antonio', age: 13, gender: 'masculino' },
        { name: 'Elena', age: 14, gender: 'femenino' },
        { name: 'Manuel', age: 12, gender: 'masculino' },
        { name: 'Marta', age: 15, gender: 'femenino' },
        { name: 'Pedro', age: 13, gender: 'masculino' },
        { name: 'Sofía', age: 14, gender: 'femenino' },
        { name: 'Diego', age: 12, gender: 'masculino' },
        { name: 'Paula', age: 15, gender: 'femenino' },
        // 8 estudiantes de 16-17 años
        { name: 'Alejandro', age: 16, gender: 'masculino' },
        { name: 'Claudia', age: 17, gender: 'femenino' },
        { name: 'Fernando', age: 16, gender: 'masculino' },
        { name: 'Cristina', age: 17, gender: 'femenino' },
        { name: 'Sergio', age: 16, gender: 'masculino' },
        { name: 'Andrea', age: 17, gender: 'femenino' },
        { name: 'Andrés', age: 16, gender: 'masculino' },
        { name: 'Sara', age: 17, gender: 'femenino' }
    ];
    
    const students = [];
    const baseTimestamp = 1704067200000; // Timestamp fijo para IDs consistentes (1 enero 2024)
    
    for (let i = 1; i <= 30; i++) {
        const studentData = studentsData[i - 1];
        
        // Añadir variación aleatoria en la edad (±1 año ocasionalmente)
        let age = studentData.age;
        if (Math.random() < 0.2) { // 20% probabilidad de variación
            const ageVariation = Math.random() < 0.5 ? -1 : 1;
            age = Math.max(9, Math.min(17, studentData.age + ageVariation));
        }
        
        // Variación aleatoria en la fecha de creación (distribuida en los primeros 3 meses)
        const daysVariation = Math.floor(Math.random() * 90); // 0-90 días de variación
        const studentTimestamp = baseTimestamp + (i * 1000) + (daysVariation * 24 * 60 * 60 * 1000);
        
        students.push({
            id: `student_demo_${i}`, // ID fijo y consistente
            name: studentData.name,
            email: `alumno${i}@alumno.com`,
            password: 'alumno',
            role: 'student',
            classCode: classCode,
            age: age,
            gender: studentData.gender,
            createdAt: new Date(studentTimestamp).toISOString() // Timestamp con variación
        });
    }

    // Guardar en localStorage (solo admin, no profe@profe.com)
    const allUsers = [admin, ...students];
    localStorage.setItem('users', JSON.stringify(allUsers));
    localStorage.setItem('classes', JSON.stringify([classData]));

    // Crear algunos mensajes demo para mostrar el sistema de comunicación
    const demoMessages = [
        {
            id: 'demo_msg_1',
            studentId: students[0].id, // Alumno 1 - Carlos
            studentClassCode: classCode,
            anonymousId: '1',
            content: 'Hola profesor, me gustaría hablar sobre una situación que está ocurriendo en el recreo. Algunos compañeros me están molestando frecuentemente y me hacen bullying.',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Hace 2 días
            replies: [
                {
                    id: 'demo_reply_1',
                    teacherId: admin.id,
                    teacherName: admin.name,
                    content: 'Hola, gracias por comunicarte. Es muy valiente de tu parte. Necesito más detalles para poder ayudarte mejor. ¿Puedes contarme qué tipo de molestias están ocurriendo y quiénes están involucrados? Estaré atento a tu respuesta.',
                    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // Hace 1 día
                }
            ]
        },
        {
            id: 'demo_msg_2',
            studentId: students[2].id, // Alumno 3 - Juan
            studentClassCode: classCode,
            anonymousId: '2',
            content: 'Buenos días, quería comentarle que últimamente me siento muy solo en la escuela. No tengo muchos amigos y me cuesta relacionarme con mis compañeros. Me siento aislado y triste porque nadie me habla.',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Hace 5 días
            replies: [
                {
                    id: 'demo_reply_2',
                    teacherId: admin.id,
                    teacherName: admin.name,
                    content: 'Hola, entiendo cómo te sientes. Te invito a participar en las actividades grupales que organizamos. También podemos trabajar en estrategias para mejorar tus relaciones sociales. ¿Te gustaría que hablemos más sobre esto?',
                    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // Hace 4 días
                }
            ]
        },
        {
            id: 'demo_msg_3',
            studentId: students[4].id, // Alumno 5 - Luis
            studentClassCode: classCode,
            anonymousId: '3',
            content: 'Hola, me gustaría pedir ayuda porque estoy pasando por un momento difícil. Me siento muy estresado con las clases y las tareas, y siento que no puedo con todo. Tengo mucha ansiedad y me siento agobiado.',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // Hace 1 hora
            replies: []
        },
        {
            id: 'demo_msg_4',
            studentId: students[6].id, // Alumno 7 - Miguel
            studentClassCode: classCode,
            anonymousId: '4',
            content: 'Buenas tardes profesor. Quería agradecerle por todas las actividades que hacemos. Me siento mucho mejor desde que empezamos con las actividades de bienestar.',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Hace 3 días
            replies: [
                {
                    id: 'demo_reply_3',
                    teacherId: admin.id,
                    teacherName: admin.name,
                    content: '¡Me alegra mucho saber que las actividades te están ayudando! Es muy importante cuidar nuestro bienestar emocional. Si necesitas algo más, no dudes en escribirme. ¡Sigue así!',
                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // Hace 2 días
                }
            ]
        },
        {
            id: 'demo_msg_5',
            studentId: students[8].id, // Alumno 9 - Javier (caso crítico)
            studentClassCode: classCode,
            anonymousId: '5',
            content: 'Profesor, necesito hablar con alguien. Últimamente he estado pensando mucho en la muerte y siento que no quiero vivir más. Me siento muy triste y solo, y a veces pienso en hacerme daño.',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // Hace 6 horas
            replies: []
        },
        {
            id: 'demo_msg_6',
            studentId: students[10].id, // Alumno 11 - Francisco
            studentClassCode: classCode,
            anonymousId: '6',
            content: 'Hola, quería contarle que algunos compañeros me están acosando y me hacen sentir miedo. Me pegan y me insultan, y no sé qué hacer. Tengo mucho miedo de ir al recreo.',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // Hace 12 horas
            replies: []
        },
        {
            id: 'demo_msg_7',
            studentId: students[12].id, // Alumno 13 - José
            studentClassCode: classCode,
            anonymousId: '7',
            content: 'Buenos días, últimamente me siento muy preocupado y tengo mucha ansiedad por los exámenes. No puedo dormir bien y me siento agobiado.',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Hace 1 día
            replies: []
        }
    ];

    // Analizar mensajes demo con el sistema de keywords (si está disponible)
    if (typeof keywordAnalyzer !== 'undefined') {
        demoMessages.forEach(message => {
            if (message.content) {
                message.keywordAnalysis = keywordAnalyzer.analyzeMessage(message.content);
            }
        });
        console.log('✅ Análisis de keywords aplicado a mensajes demo');
    }

    localStorage.setItem('anonymousMessages', JSON.stringify(demoMessages));

    // Generar datos de encuestas DEMO para todos los estudiantes
    generateDemoSurveyData(students, classCode);
    generateDemoActivityData(students, classCode);

    console.log('✅ Datos de demo inicializados:');
    console.log('- Estudiantes demo asociados a admin@munay.com');
    console.log('- Código de clase: ' + classCode);
    console.log('- 4 Mensajes demo de comunicación anónima creados');
    const currentDate = new Date();
    const oneYearAgoDate = new Date(currentDate);
    oneYearAgoDate.setFullYear(currentDate.getFullYear() - 1);
    console.log(`- Encuestas DEMO generadas desde ${oneYearAgoDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })} hasta ${currentDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}`);
    console.log(`- Actividades DEMO (tests y simuladores) generadas desde ${oneYearAgoDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })} hasta ${currentDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}`);
}

// Función para actualizar estudiantes demo existentes con datos consistentes
function updateDemoStudents(existingUsers, existingClasses) {
    const classCode = 'CLSDEMO';
    
    // Lista predefinida de estudiantes con datos fijos (misma que en initDemoData)
    const studentsData = [
        { name: 'Carlos', age: 10, gender: 'masculino' },
        { name: 'María', age: 9, gender: 'femenino' },
        { name: 'Juan', age: 11, gender: 'masculino' },
        { name: 'Ana', age: 10, gender: 'femenino' },
        { name: 'Luis', age: 9, gender: 'masculino' },
        { name: 'Laura', age: 11, gender: 'femenino' },
        { name: 'Miguel', age: 10, gender: 'masculino' },
        { name: 'Carmen', age: 9, gender: 'femenino' },
        { name: 'Javier', age: 11, gender: 'masculino' },
        { name: 'Isabel', age: 10, gender: 'femenino' },
        { name: 'Francisco', age: 13, gender: 'masculino' },
        { name: 'Patricia', age: 14, gender: 'femenino' },
        { name: 'José', age: 12, gender: 'masculino' },
        { name: 'Lucía', age: 15, gender: 'femenino' },
        { name: 'Antonio', age: 13, gender: 'masculino' },
        { name: 'Elena', age: 14, gender: 'femenino' },
        { name: 'Manuel', age: 12, gender: 'masculino' },
        { name: 'Marta', age: 15, gender: 'femenino' },
        { name: 'Pedro', age: 13, gender: 'masculino' },
        { name: 'Sofía', age: 14, gender: 'femenino' },
        { name: 'Diego', age: 12, gender: 'masculino' },
        { name: 'Paula', age: 15, gender: 'femenino' },
        { name: 'Alejandro', age: 16, gender: 'masculino' },
        { name: 'Claudia', age: 17, gender: 'femenino' },
        { name: 'Fernando', age: 16, gender: 'masculino' },
        { name: 'Cristina', age: 17, gender: 'femenino' },
        { name: 'Sergio', age: 16, gender: 'masculino' },
        { name: 'Andrea', age: 17, gender: 'femenino' },
        { name: 'Andrés', age: 16, gender: 'masculino' },
        { name: 'Sara', age: 17, gender: 'femenino' }
    ];
    
    // Ya no se crea profe@profe.com - usar admin@munay.com
    let admin = existingUsers.find(u => u.email === 'admin@munay.com');
    if (!admin) {
        admin = {
            id: 'admin_local',
            name: 'Administrador',
            email: 'admin@munay.com',
            password: 'admin123',
            role: 'teacher',
            classCode: null,
            createdAt: new Date(1704067200000).toISOString()
        };
        existingUsers.push(admin);
    }
    
    // Eliminar estudiantes demo antiguos
    const updatedUsers = existingUsers.filter(u => 
        !(u.role === 'student' && u.classCode === classCode)
    );
    
    // Crear estudiantes demo con datos fijos
    const students = [];
    const baseTimestamp = 1704067200000;
    
    for (let i = 1; i <= 30; i++) {
        const studentData = studentsData[i - 1];
        
        students.push({
            id: `student_demo_${i}`,
            name: studentData.name,
            email: `alumno${i}@alumno.com`,
            password: 'alumno',
            role: 'student',
            classCode: classCode,
            age: studentData.age,
            gender: studentData.gender,
            createdAt: new Date(baseTimestamp + i * 1000).toISOString()
        });
    }
    
    // Actualizar clase demo (asociada a admin, no a profe@profe.com)
    let demoClass = existingClasses.find(c => c.code === classCode);
    if (demoClass) {
        demoClass.teacherId = admin.id;
        demoClass.teacherName = admin.name;
    } else {
        demoClass = {
            code: classCode,
            teacherId: admin.id,
            teacherName: admin.name,
            name: 'Clase Demo',
            createdAt: new Date(1704067200000).toISOString()
        };
        existingClasses.push(demoClass);
    }
    
    // Guardar usuarios actualizados
    const allUsers = [...updatedUsers, ...students];
    localStorage.setItem('users', JSON.stringify(allUsers));
    localStorage.setItem('classes', JSON.stringify(existingClasses));
    
    // Actualizar referencias en mensajes demo si existen
    const existingMessages = JSON.parse(localStorage.getItem('anonymousMessages') || '[]');
    existingMessages.forEach(msg => {
        if (msg.studentClassCode === classCode) {
            const oldStudent = existingUsers.find(u => u.id === msg.studentId && u.role === 'student');
            if (oldStudent) {
                const oldEmail = oldStudent.email;
                const studentNumber = parseInt(oldEmail.match(/\d+/)?.[0] || '0');
                if (studentNumber > 0 && studentNumber <= 30) {
                    msg.studentId = students[studentNumber - 1].id;
                }
            }
        }
    });
    localStorage.setItem('anonymousMessages', JSON.stringify(existingMessages));
    
    console.log('✅ Estudiantes demo actualizados con datos consistentes');
}

// Función para generar datos de encuestas DEMO desde enero 2025 hasta 20 nov 2025
function generateDemoSurveyData2025(students, classCode) {
    const surveys = getSurveysByAgeGroup('12-15');
    const allSurveyResponses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
    
    const studentIds = students.map(s => s.id);
    const existingStudentResponses = allSurveyResponses.filter(r => studentIds.includes(r.studentId));
    
    // Eliminar respuestas existentes de estos estudiantes
    const cleanedResponses = allSurveyResponses.filter(r => !studentIds.includes(r.studentId));
    allSurveyResponses.length = 0;
    allSurveyResponses.push(...cleanedResponses);
    
    // Fechas: 1 enero 2025 hasta 20 noviembre 2025
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-11-20');
    
    // Calcular meses (enero a noviembre = 11 meses)
    const monthsToGenerate = 11;
    
    // Generar respuestas para cada estudiante
    students.forEach((student, studentIndex) => {
        // Perfil de bienestar variado para cada estudiante
        const profileTypes = ['improving', 'stable_high', 'volatile', 'stable_low', 'declining'];
        const profileType = profileTypes[studentIndex % profileTypes.length];
        
        let baseScore;
        let trend;
        
        switch(profileType) {
            case 'improving':
                baseScore = 45 + Math.floor(Math.random() * 15); // 45-60
                trend = 'up';
                break;
            case 'stable_high':
                baseScore = 70 + Math.floor(Math.random() * 10); // 70-80
                trend = 'stable';
                break;
            case 'volatile':
                baseScore = 50 + Math.floor(Math.random() * 20); // 50-70
                trend = 'volatile';
                break;
            case 'stable_low':
                baseScore = 35 + Math.floor(Math.random() * 10); // 35-45
                trend = 'stable';
                break;
            case 'declining':
                baseScore = 60 + Math.floor(Math.random() * 15); // 60-75
                trend = 'down';
                break;
        }
        
        const profile = { type: profileType, baseScore, trend };
        
        // Generar 2 encuestas por mes (22 encuestas totales por estudiante)
        for (let month = 0; month < monthsToGenerate; month++) {
            const monthStart = new Date(startDate);
            monthStart.setMonth(startDate.getMonth() + month);
            
            // Generar 2 encuestas en el mes
            for (let surveyIndex = 0; surveyIndex < 2; surveyIndex++) {
                const survey = surveys[Math.floor(Math.random() * surveys.length)];
                
                // Día aleatorio del mes (1-28)
                const dayOfMonth = 1 + Math.floor(Math.random() * 28);
                const surveyDate = new Date(monthStart);
                surveyDate.setDate(dayOfMonth);
                
                // Hora aleatoria (8 AM - 6 PM)
                const hour = 8 + Math.floor(Math.random() * 10);
                const minute = Math.floor(Math.random() * 60);
                surveyDate.setHours(hour, minute, 0, 0);
                
                // Asegurar que no pase del 20 de noviembre
                if (surveyDate > endDate) continue;
                
                // Calcular score basado en perfil y mes
                let currentScore = calculateStudentScoreForDate(profile, month, monthStart);
                
                // Variación aleatoria
                const randomVariation = Math.floor(Math.random() * 17) - 8; // -8 a +8
                currentScore += randomVariation;
                currentScore = Math.max(20, Math.min(100, currentScore));
                
                // Generar respuestas
                const responses = generateResponsesFromScore(survey, currentScore);
                
                const surveyResponse = {
                    id: `demo_survey_${student.id}_${month}_${surveyIndex}_${Date.now()}_${Math.random()}`,
                    studentId: student.id,
                    studentName: student.name,
                    surveyId: survey.id,
                    surveyTitle: survey.title,
                    responses: responses,
                    score: currentScore,
                    completedAt: surveyDate.toISOString()
                };
                
                allSurveyResponses.push(surveyResponse);
            }
        }
    });
    
    localStorage.setItem('surveyResponses', JSON.stringify(allSurveyResponses));
    
    const totalResponses = allSurveyResponses.filter(r => studentIds.includes(r.studentId)).length;
    const studentCount = students.length;
    console.log(`✅ Generadas ${totalResponses} respuestas de encuestas para ${studentCount} estudiantes`);
    console.log(`   Período: Enero 2025 - 20 Noviembre 2025`);
    console.log(`   Promedio: ~${Math.round(totalResponses / studentCount)} encuestas por estudiante`);
}

// Función para generar datos de actividades DEMO desde enero 2025 hasta 20 nov 2025
function generateDemoActivityData2025(students, classCode) {
    const allActivities = JSON.parse(localStorage.getItem('studentActivities') || '[]');
    
    const studentIds = students.map(s => s.id);
    const existingStudentActivities = allActivities.filter(a => studentIds.includes(a.studentId));
    
    // Eliminar actividades existentes de estos estudiantes
    const cleanedActivities = allActivities.filter(a => !studentIds.includes(a.studentId));
    allActivities.length = 0;
    allActivities.push(...cleanedActivities);
    
    // Fechas: 1 enero 2025 hasta 20 noviembre 2025
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-11-20');
    const monthsToGenerate = 11;
    
    const activityTypes = [
        { type: 'empathy', idPrefix: 'empathy_exercise', titlePrefix: 'Empatía' },
        { type: 'selfCare', idPrefix: 'self_care', titlePrefix: 'Autocuidado' },
        { type: 'conflict', idPrefix: 'conflict_resolution', titlePrefix: 'Resolución de Conflictos' },
        { type: 'ethical', idPrefix: 'ethical_decision_simulator', titlePrefix: 'Simulador Ético' }
    ];
    
    students.forEach((student, studentIndex) => {
        // Mismo perfil que para encuestas
        const profileTypes = ['improving', 'stable_high', 'volatile', 'stable_low', 'declining'];
        const profileType = profileTypes[studentIndex % profileTypes.length];
        
        let baseScore;
        switch(profileType) {
            case 'improving': baseScore = 45 + Math.floor(Math.random() * 15); break;
            case 'stable_high': baseScore = 70 + Math.floor(Math.random() * 10); break;
            case 'volatile': baseScore = 50 + Math.floor(Math.random() * 20); break;
            case 'stable_low': baseScore = 35 + Math.floor(Math.random() * 10); break;
            case 'declining': baseScore = 60 + Math.floor(Math.random() * 15); break;
        }
        
        const profile = { type: profileType, baseScore, trend: profileType === 'improving' ? 'up' : profileType === 'declining' ? 'down' : 'stable' };
        const ageGroup = getAgeGroup(student.age);
        
        // Generar 1-2 actividades por mes (reducido para evitar exceder localStorage)
        for (let month = 0; month < monthsToGenerate; month++) {
            const monthStart = new Date(startDate);
            monthStart.setMonth(startDate.getMonth() + month);
            
            const activitiesPerMonth = 1 + Math.floor(Math.random() * 2); // 1-2 actividades
            
            for (let actIndex = 0; actIndex < activitiesPerMonth; actIndex++) {
                const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
                
                const dayOfMonth = 1 + Math.floor(Math.random() * 28);
                const activityDate = new Date(monthStart);
                activityDate.setDate(dayOfMonth);
                
                const hour = 8 + Math.floor(Math.random() * 12);
                const minute = Math.floor(Math.random() * 60);
                activityDate.setHours(hour, minute, 0, 0);
                
                // Asegurar que no pase del 20 de noviembre
                if (activityDate > endDate) continue;
                
                let currentScore = calculateStudentScoreForDate(profile, month, monthStart);
                const randomVariation = Math.floor(Math.random() * 21) - 10;
                currentScore += randomVariation;
                currentScore = Math.max(25, Math.min(95, currentScore));
                
                const testIndex = month * 3 + actIndex;
                let activityId, activityTitle;
                
                if (activityType.type === 'empathy') {
                    activityId = `empathy_exercise_${ageGroup}_${testIndex + 1}`;
                    activityTitle = getEmpathyTitle(testIndex);
                } else if (activityType.type === 'selfCare') {
                    activityId = `self_care_${ageGroup}_${testIndex + 1}`;
                    activityTitle = getSelfCareTitle(testIndex);
                } else if (activityType.type === 'conflict') {
                    activityId = `conflict_resolution_${ageGroup}_${testIndex + 1}`;
                    activityTitle = getConflictResolutionTitle(testIndex);
                } else {
                    activityId = 'ethical_decision_simulator';
                    activityTitle = getEthicalSimulatorTitle();
                }
                
                const activity = {
                    id: `demo_activity_${student.id}_${month}_${actIndex}_${Date.now()}_${Math.random()}`,
                    studentId: student.id,
                    studentName: student.name,
                    activityId: activityId,
                    activityTitle: activityTitle,
                    completedAt: activityDate.toISOString()
                };
                
                if (activityType.type === 'ethical') {
                    activity.ethicalScore = currentScore;
                    activity.simulatorResults = {
                        averageScore: currentScore,
                        scenariosCompleted: 3,
                        decisions: []
                    };
                } else {
                    activity.testScore = currentScore;
                    // Reducir número de preguntas para ahorrar espacio
                    const numQuestions = 5 + Math.floor(Math.random() * 3); // 5-7 preguntas
                    const responses = [];
                    for (let q = 0; q < numQuestions; q++) {
                        const targetAnswer = Math.round((currentScore / 100) * 5);
                        let answer = targetAnswer + Math.floor(Math.random() * 3) - 1;
                        answer = Math.max(1, Math.min(5, answer));
                        responses.push({
                            qi: q, // Abreviado
                            a: answer // Abreviado
                        });
                    }
                    activity.responses = responses;
                }
                
                allActivities.push(activity);
            }
        }
    });
    
    // Guardar en lotes para evitar exceder la cuota
    try {
        localStorage.setItem('studentActivities', JSON.stringify(allActivities));
        const totalActivities = allActivities.filter(a => studentIds.includes(a.studentId)).length;
        const studentCount = students.length;
        console.log(`✅ Generadas ${totalActivities} actividades para ${studentCount} estudiantes`);
        console.log(`   Período: Enero 2025 - 20 Noviembre 2025`);
        console.log(`   Promedio: ~${Math.round(totalActivities / studentCount)} actividades por estudiante`);
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            console.warn('⚠️ localStorage lleno. Reduciendo número de actividades...');
            // Reducir a la mitad y guardar
            const reducedActivities = allActivities.slice(0, Math.floor(allActivities.length / 2));
            localStorage.setItem('studentActivities', JSON.stringify(reducedActivities));
            const totalActivities = reducedActivities.filter(a => studentIds.includes(a.studentId)).length;
            console.log(`✅ Generadas ${totalActivities} actividades (reducidas por límite de almacenamiento)`);
            console.log(`   Promedio: ~${Math.round(totalActivities / 200)} actividades por estudiante`);
        } else {
            throw e;
        }
    }
}

// Función para generar mensajes anónimos demo (15% de estudiantes)
function generateDemoMessages2025(students, classCode, admin) {
    const allMessages = JSON.parse(localStorage.getItem('anonymousMessages') || '[]');
    
    // Eliminar mensajes existentes de estos estudiantes
    const studentIds = students.map(s => s.id);
    const cleanedMessages = allMessages.filter(m => !studentIds.includes(m.studentId));
    allMessages.length = 0;
    allMessages.push(...cleanedMessages);
    
    // 15% de estudiantes enviarán mensajes (30 estudiantes)
    const studentsWithMessages = students.filter((_, i) => i % Math.floor(100 / 15) === 0).slice(0, 30);
    
    // Mensajes variados con diferentes niveles de riesgo y temas
    const messageTemplates = [
        // Mensajes positivos / neutros
        'Buenas tardes profesor. Quería agradecerle por todas las actividades que hacemos.',
        'Hola, quería decirle que las actividades de bienestar me están ayudando mucho.',
        'Buenos días, me siento bien en la escuela últimamente.',
        'Hola profesor, gracias por estar siempre disponible para nosotros.',
        'Buenas tardes, las clases están muy interesantes esta semana.',
        
        // Mensajes de riesgo medio - ansiedad académica
        'Buenos días, últimamente me siento muy preocupado y tengo mucha ansiedad por los exámenes.',
        'Hola, me siento muy estresado con las clases y las tareas, y siento que no puedo con todo.',
        'Profesor, tengo mucho miedo de no aprobar el examen final.',
        'Hola, estoy muy nervioso porque siento que no entiendo nada de matemáticas.',
        'Buenos días, me da mucha ansiedad pensar en las presentaciones que tengo que hacer.',
        'Hola profesor, últimamente no puedo dormir bien por la preocupación de los exámenes.',
        
        // Mensajes de riesgo medio - problemas sociales
        'Hola profesor, tengo problemas para relacionarme con mis compañeros y me siento aislado.',
        'Buenos días, quería comentarle que últimamente me siento muy solo en la escuela.',
        'Hola, algunos compañeros no me hablan y me siento excluido del grupo.',
        'Profesor, me cuesta mucho hacer amigos y me siento diferente a los demás.',
        'Buenas tardes, siento que nadie me entiende y que no encajo en ningún lado.',
        'Hola, me da miedo hablar en clase porque siento que todos se van a reír de mí.',
        
        // Mensajes de alto riesgo - acoso
        'Hola, quería contarle que algunos compañeros me están acosando y me hacen sentir miedo.',
        'Profesor, necesito ayuda. Hay un grupo de estudiantes que me molesta todos los días en el recreo.',
        'Hola, algunos compañeros me están haciendo bullying y no sé qué hacer.',
        'Buenos días, me están amenazando y me da mucho miedo venir a la escuela.',
        'Profesor, me están quitando mis cosas y me empujan en los pasillos.',
        'Hola, me están haciendo sentir muy mal con comentarios hirientes todos los días.',
        
        // Mensajes de alto riesgo - emocional
        'Hola, me gustaría pedir ayuda porque estoy pasando por un momento difícil.',
        'Buenos días, últimamente me siento muy triste y no sé por qué.',
        'Hola profesor, tengo muchos pensamientos negativos que no puedo controlar.',
        'Profesor, me siento muy vacío por dentro y nada me hace sentir bien.',
        'Hola, siento que todo me sale mal y que no valgo nada.',
        'Buenas tardes, tengo mucho miedo de todo y no puedo estar tranquilo.',
        
        // Mensajes críticos - autolesión / suicidio
        'Profesor, necesito hablar con alguien. Últimamente he estado pensando mucho en la muerte.',
        'Hola, a veces pienso que sería mejor si no existiera.',
        'Profesor, tengo pensamientos muy oscuros y me da miedo contárselos a alguien.',
        'Hola, he estado pensando en hacerme daño y necesito ayuda.',
        'Buenos días, siento que no puedo más y que todo sería mejor sin mí.',
        'Profesor, necesito hablar urgentemente. Tengo pensamientos sobre quitarme la vida.',
        
        // Mensajes críticos - violencia
        'Hola profesor, me gustaría hablar sobre una situación que está ocurriendo en el recreo.',
        'Profesor, hay un compañero que me amenazó con hacerme daño y tengo mucho miedo.',
        'Hola, vi algo muy preocupante y necesito contárselo a alguien de confianza.',
        'Buenos días, hay una situación de violencia que está ocurriendo y no sé qué hacer.',
        'Profesor, necesito contarle algo urgente sobre algo que está pasando en la escuela.',
        
        // Mensajes variados - situaciones específicas
        'Hola, mi familia está pasando por problemas y eso me está afectando mucho.',
        'Buenos días, tengo problemas en casa y no puedo concentrarme en la escuela.',
        'Hola profesor, me siento muy presionado por mis padres y no sé cómo manejarlo.',
        'Buenas tardes, tengo problemas económicos en casa y me da vergüenza contarlo.',
        'Hola, siento que nadie me escucha y que mis problemas no importan.',
        'Profesor, tengo miedo de contarle esto pero necesito ayuda urgente.',
        'Hola, me siento muy confundido sobre muchas cosas y no sé a quién acudir.',
        'Buenos días, últimamente he estado perdiendo el interés en todo lo que me gustaba.',
        'Hola, tengo problemas para comer y dormir desde hace varias semanas.',
        'Profesor, me siento muy enojado todo el tiempo y no sé por qué.'
    ];
    
    studentsWithMessages.forEach((student, index) => {
        // 1-3 mensajes por estudiante
        const numMessages = 1 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < numMessages; i++) {
            const template = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
            const daysAgo = Math.floor(Math.random() * 60); // Últimos 60 días
            const messageDate = new Date('2025-11-20');
            messageDate.setDate(messageDate.getDate() - daysAgo);
            
            const message = {
                id: `demo_msg_${student.id}_${i}_${Date.now()}`,
                studentId: student.id,
                studentClassCode: classCode,
                anonymousId: String(index * 10 + i + 1),
                content: template,
                timestamp: messageDate.toISOString(),
                replies: []
            };
            
            // Algunos mensajes tienen respuestas (30%)
            if (Math.random() < 0.3) {
                const replyDaysAgo = daysAgo - Math.floor(Math.random() * 3);
                const replyDate = new Date('2025-11-20');
                replyDate.setDate(replyDate.getDate() - replyDaysAgo);
                
                message.replies.push({
                    id: `demo_reply_${student.id}_${i}_${Date.now()}`,
                    teacherId: admin.id,
                    teacherName: admin.name,
                    content: 'Gracias por comunicarte. Estaré atento a tu situación y te ayudaré en lo que necesites.',
                    timestamp: replyDate.toISOString()
                });
            }
            
            // Analizar con keywords si está disponible
            // NOTA: No crear notificaciones aquí para evitar llenar localStorage
            // Las notificaciones se crearán cuando se analicen los mensajes existentes
            if (typeof keywordAnalyzer !== 'undefined') {
                message.keywordAnalysis = keywordAnalyzer.analyzeMessage(message.content);
                // Las notificaciones se crearán en analyzeExistingDemoMessages() para evitar QuotaExceededError
            }
            
            allMessages.push(message);
        }
    });
    
    localStorage.setItem('anonymousMessages', JSON.stringify(allMessages));
    
    const totalMessages = allMessages.filter(m => studentIds.includes(m.studentId)).length;
    console.log(`✅ Generados ${totalMessages} mensajes anónimos de ${studentsWithMessages.length} estudiantes`);
}

// Función para generar datos de encuestas DEMO
function generateDemoSurveyData(students, classCode) {
    // Usar encuestas del grupo 12-15 como default para generación DEMO
    const surveys = getSurveysByAgeGroup('12-15');
    const allSurveyResponses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
    
    // Obtener IDs de estudiantes para verificar si ya tienen encuestas
    const studentIds = students.map(s => s.id);
    const existingStudentResponses = allSurveyResponses.filter(r => studentIds.includes(r.studentId));
    
    // Filtrar estudiantes que necesitan datos (menos de 15 encuestas = conjunto incompleto)
    const studentsNeedingData = students.filter(student => {
        const studentResponses = existingStudentResponses.filter(r => r.studentId === student.id);
        return studentResponses.length < 15; // Necesitamos al menos 15 (casi el conjunto completo de 20)
    });
    
    if (studentsNeedingData.length === 0) {
        const currentDate = new Date();
        const oneYearAgoDate = new Date(currentDate);
        oneYearAgoDate.setFullYear(currentDate.getFullYear() - 1);
        console.log(`ℹ️ Todos los estudiantes DEMO ya tienen encuestas completas (desde ${oneYearAgoDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })} hasta ${currentDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}).`);
        return;
    }
    
    // Eliminar encuestas existentes de estudiantes que necesitan regeneración completa
    // para evitar duplicados y asegurar datos consistentes
    const studentsNeedingDataIds = studentsNeedingData.map(s => s.id);
    const cleanedResponses = allSurveyResponses.filter(r => !studentsNeedingDataIds.includes(r.studentId));
    const initialCount = cleanedResponses.length;
    
    // Limpiar el array y reconstruirlo con respuestas limpias
    allSurveyResponses.length = 0;
    allSurveyResponses.push(...cleanedResponses);
    
    // Fechas de inicio: hace un año hasta el mes actual
    const currentDate = new Date();
    const oneYearAgoDate = new Date(currentDate);
    oneYearAgoDate.setFullYear(currentDate.getFullYear() - 1);
    oneYearAgoDate.setDate(15); // Día 15 del mes para consistencia
    const startDate = oneYearAgoDate;
    
    // Calcular cuántos meses generar desde hace un año hasta el mes actual
    const monthsToGenerate = (currentDate.getFullYear() - oneYearAgoDate.getFullYear()) * 12 + 
                             (currentDate.getMonth() - oneYearAgoDate.getMonth()) + 1;
    
    // Generar respuestas para cada estudiante que necesita datos
    studentsNeedingData.forEach((student, studentIndex) => {
        // Encontrar índice original del estudiante para asignar perfil
        const originalIndex = students.findIndex(s => s.id === student.id);
        // Definir perfil de bienestar por estudiante (30 estudiantes con perfiles variados)
        const studentProfiles = [
            { type: 'improving', baseScore: 45, trend: 'up' },      // Estudiante 1: mejora constante
            { type: 'stable_high', baseScore: 75, trend: 'stable' }, // Estudiante 2: se mantiene alto
            { type: 'volatile', baseScore: 55, trend: 'volatile' }, // Estudiante 3: altibajos
            { type: 'improving', baseScore: 50, trend: 'up' },     // Estudiante 4: mejora gradual
            { type: 'stable_low', baseScore: 40, trend: 'stable' }, // Estudiante 5: se mantiene bajo
            { type: 'improving', baseScore: 48, trend: 'up' },     // Estudiante 6: mejora constante
            { type: 'volatile', baseScore: 60, trend: 'volatile' }, // Estudiante 7: altibajos moderados
            { type: 'stable_high', baseScore: 70, trend: 'stable' }, // Estudiante 8: se mantiene alto
            { type: 'declining', baseScore: 65, trend: 'down' },   // Estudiante 9: declina (caso de atención)
            { type: 'improving', baseScore: 52, trend: 'up' },      // Estudiante 10: mejora constante
            { type: 'stable_high', baseScore: 72, trend: 'stable' }, // Estudiante 11: se mantiene alto
            { type: 'improving', baseScore: 47, trend: 'up' },      // Estudiante 12: mejora constante
            { type: 'volatile', baseScore: 58, trend: 'volatile' }, // Estudiante 13: altibajos
            { type: 'improving', baseScore: 49, trend: 'up' },      // Estudiante 14: mejora gradual
            { type: 'stable_low', baseScore: 42, trend: 'stable' }, // Estudiante 15: se mantiene bajo
            { type: 'improving', baseScore: 51, trend: 'up' },      // Estudiante 16: mejora constante
            { type: 'volatile', baseScore: 57, trend: 'volatile' }, // Estudiante 17: altibajos moderados
            { type: 'stable_high', baseScore: 68, trend: 'stable' }, // Estudiante 18: se mantiene alto
            { type: 'improving', baseScore: 53, trend: 'up' },      // Estudiante 19: mejora constante
            { type: 'declining', baseScore: 62, trend: 'down' },   // Estudiante 20: declina (caso de atención)
            { type: 'improving', baseScore: 46, trend: 'up' },      // Estudiante 21: mejora constante
            { type: 'stable_high', baseScore: 74, trend: 'stable' }, // Estudiante 22: se mantiene alto
            { type: 'volatile', baseScore: 56, trend: 'volatile' }, // Estudiante 23: altibajos
            { type: 'improving', baseScore: 54, trend: 'up' },      // Estudiante 24: mejora gradual
            { type: 'stable_low', baseScore: 41, trend: 'stable' }, // Estudiante 25: se mantiene bajo
            { type: 'improving', baseScore: 50, trend: 'up' },      // Estudiante 26: mejora constante
            { type: 'volatile', baseScore: 59, trend: 'volatile' }, // Estudiante 27: altibajos moderados
            { type: 'stable_high', baseScore: 71, trend: 'stable' }, // Estudiante 28: se mantiene alto
            { type: 'improving', baseScore: 48, trend: 'up' },      // Estudiante 29: mejora constante
            { type: 'stable_high', baseScore: 73, trend: 'stable' }  // Estudiante 30: se mantiene alto
        ];
        
        const profile = studentProfiles[originalIndex >= 0 ? originalIndex % studentProfiles.length : studentIndex % studentProfiles.length];
        
        // Añadir variación aleatoria a los perfiles base (±3 puntos)
        const profileVariation = Math.floor(Math.random() * 7) - 3; // -3 a +3
        const adjustedBaseScore = Math.max(35, Math.min(80, profile.baseScore + profileVariation));
        const adjustedProfile = {
            ...profile,
            baseScore: adjustedBaseScore
        };
        
        // Generar respuestas desde enero hasta el mes actual
        const surveysPerMonth = 2; // Una de cada tipo (pero con variación en la generación)
        const totalSurveys = monthsToGenerate * surveysPerMonth;
        
        for (let month = 0; month < monthsToGenerate; month++) {
            // Fecha base del mes (distribuir a lo largo del mes)
            const monthStart = new Date(startDate);
            monthStart.setMonth(startDate.getMonth() + month);
            
            // Generar ambas encuestas cada mes (con variación: a veces solo 1 encuesta)
            const surveysToGenerate = Math.random() < 0.15 ? 1 : 2; // 15% probabilidad de solo 1 encuesta
            const selectedSurveys = surveysToGenerate === 2 ? surveys : [surveys[Math.floor(Math.random() * surveys.length)]];
            
            selectedSurveys.forEach((survey, surveyIndex) => {
                // Calcular día aleatorio dentro del mes (entre día 1 y 28 para mayor variación)
                const dayOfMonth = 1 + Math.floor(Math.random() * 28);
                const surveyDate = new Date(monthStart);
                surveyDate.setDate(dayOfMonth);
                
                // Añadir variación aleatoria en la hora (entre 8 AM y 6 PM)
                const hour = 8 + Math.floor(Math.random() * 10);
                const minute = Math.floor(Math.random() * 60);
                surveyDate.setHours(hour, minute, 0, 0);
                
                // Calcular score basado en el perfil del estudiante ajustado y el tiempo transcurrido
                let currentScore = calculateStudentScoreForDate(adjustedProfile, month, monthStart);
                
                // Añadir variación aleatoria más amplia (±8 puntos) para mayor diversidad
                const randomVariation = Math.floor(Math.random() * 17) - 8; // -8 a +8
                currentScore += randomVariation;
                // Añadir variación adicional ocasional (10% de probabilidad de variación extra)
                if (Math.random() < 0.1) {
                    currentScore += Math.floor(Math.random() * 11) - 5; // Variación extra de ±5
                }
                currentScore = Math.max(20, Math.min(100, currentScore)); // Mantener entre 20 y 100
                
                // Generar respuestas basadas en el score objetivo
                const responses = generateResponsesFromScore(survey, currentScore);
                
                // Crear objeto de respuesta
                const surveyResponse = {
                    id: `demo_survey_${student.id}_${month}_${surveyIndex}_${Date.now()}`,
                    studentId: student.id,
                    studentName: student.name,
                    surveyId: survey.id,
                    surveyTitle: survey.title,
                    responses: responses,
                    score: currentScore,
                    completedAt: surveyDate.toISOString()
                };
                
                allSurveyResponses.push(surveyResponse);
            });
        }
    });
    
    // Guardar todas las respuestas (las nuevas se agregaron al array)
    localStorage.setItem('surveyResponses', JSON.stringify(allSurveyResponses));
    
    const finalCount = allSurveyResponses.length;
    const newResponsesCount = finalCount - initialCount;
    const logDate = new Date();
    const logOneYearAgo = new Date(logDate);
    logOneYearAgo.setFullYear(logDate.getFullYear() - 1);
    console.log(`✅ Generadas ${newResponsesCount} respuestas de encuestas DEMO para ${studentsNeedingData.length} estudiantes`);
    console.log(`   Total de respuestas DEMO: ${finalCount} (distribuidas desde ${logOneYearAgo.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })} hasta ${logDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })})`);
    console.log(`   Promedio: ~${Math.round(newResponsesCount / studentsNeedingData.length)} encuestas por estudiante`);
}

// Función para generar datos de actividades DEMO (tests y simuladores)
function generateDemoActivityData(students, classCode) {
    const allActivities = JSON.parse(localStorage.getItem('studentActivities') || '[]');
    
    // Obtener IDs de estudiantes para verificar si ya tienen actividades
    const studentIds = students.map(s => s.id);
    const existingStudentActivities = allActivities.filter(a => studentIds.includes(a.studentId));
    
    // Filtrar estudiantes que necesitan datos (menos de 10 actividades = conjunto incompleto)
    const studentsNeedingData = students.filter(student => {
        const studentActivities = existingStudentActivities.filter(a => a.studentId === student.id);
        return studentActivities.length < 10;
    });
    
    if (studentsNeedingData.length === 0) {
        console.log('ℹ️ Todos los estudiantes DEMO ya tienen actividades completas.');
        return;
    }
    
    // Eliminar actividades existentes de estudiantes que necesitan regeneración
    const studentsNeedingDataIds = studentsNeedingData.map(s => s.id);
    const cleanedActivities = allActivities.filter(a => !studentsNeedingDataIds.includes(a.studentId));
    const initialCount = cleanedActivities.length;
    
    // Limpiar el array y reconstruirlo
    allActivities.length = 0;
    allActivities.push(...cleanedActivities);
    
    // Fechas de inicio: hace un año hasta el mes actual
    const currentDate = new Date();
    const oneYearAgoDate = new Date(currentDate);
    oneYearAgoDate.setFullYear(currentDate.getFullYear() - 1);
    oneYearAgoDate.setDate(15); // Día 15 del mes para consistencia
    const startDate = oneYearAgoDate;
    
    // Calcular cuántos meses generar desde hace un año hasta el mes actual
    const monthsToGenerate = (currentDate.getFullYear() - oneYearAgoDate.getFullYear()) * 12 + 
                             (currentDate.getMonth() - oneYearAgoDate.getMonth()) + 1;
    
    // Tipos de actividades a generar
    const activityTypes = [
        { type: 'empathy', idPrefix: 'empathy_exercise', titlePrefix: 'Empatía' },
        { type: 'selfCare', idPrefix: 'self_care', titlePrefix: 'Autocuidado' },
        { type: 'conflict', idPrefix: 'conflict_resolution', titlePrefix: 'Resolución de Conflictos' },
        { type: 'ethical', idPrefix: 'ethical_decision_simulator', titlePrefix: 'Simulador Ético' }
    ];
    
    // Generar actividades para cada estudiante
    studentsNeedingData.forEach((student, studentIndex) => {
        // Encontrar índice original del estudiante para asignar perfil
        const originalIndex = students.findIndex(s => s.id === student.id);
        
        // Usar los mismos perfiles que para las encuestas
        const studentProfiles = [
            { type: 'improving', baseScore: 45, trend: 'up' },
            { type: 'stable_high', baseScore: 75, trend: 'stable' },
            { type: 'volatile', baseScore: 55, trend: 'volatile' },
            { type: 'improving', baseScore: 50, trend: 'up' },
            { type: 'stable_low', baseScore: 40, trend: 'stable' },
            { type: 'improving', baseScore: 48, trend: 'up' },
            { type: 'volatile', baseScore: 60, trend: 'volatile' },
            { type: 'stable_high', baseScore: 70, trend: 'stable' },
            { type: 'declining', baseScore: 65, trend: 'down' },
            { type: 'improving', baseScore: 52, trend: 'up' },
            { type: 'stable_high', baseScore: 72, trend: 'stable' },
            { type: 'improving', baseScore: 47, trend: 'up' },
            { type: 'volatile', baseScore: 58, trend: 'volatile' },
            { type: 'improving', baseScore: 49, trend: 'up' },
            { type: 'stable_low', baseScore: 42, trend: 'stable' },
            { type: 'improving', baseScore: 51, trend: 'up' },
            { type: 'volatile', baseScore: 57, trend: 'volatile' },
            { type: 'stable_high', baseScore: 68, trend: 'stable' },
            { type: 'improving', baseScore: 53, trend: 'up' },
            { type: 'declining', baseScore: 62, trend: 'down' },
            { type: 'improving', baseScore: 46, trend: 'up' },
            { type: 'stable_high', baseScore: 74, trend: 'stable' },
            { type: 'volatile', baseScore: 56, trend: 'volatile' },
            { type: 'improving', baseScore: 54, trend: 'up' },
            { type: 'stable_low', baseScore: 41, trend: 'stable' },
            { type: 'improving', baseScore: 50, trend: 'up' },
            { type: 'volatile', baseScore: 59, trend: 'volatile' },
            { type: 'stable_high', baseScore: 71, trend: 'stable' },
            { type: 'improving', baseScore: 48, trend: 'up' },
            { type: 'stable_high', baseScore: 73, trend: 'stable' }
        ];
        
        const profile = studentProfiles[originalIndex >= 0 ? originalIndex % studentProfiles.length : studentIndex % studentProfiles.length];
        
        // Añadir variación aleatoria a los perfiles base para actividades (±4 puntos)
        const profileVariation = Math.floor(Math.random() * 9) - 4; // -4 a +4
        const adjustedBaseScore = Math.max(35, Math.min(80, profile.baseScore + profileVariation));
        const adjustedProfile = {
            ...profile,
            baseScore: adjustedBaseScore
        };
        
        const ageGroup = getAgeGroup(student.age);
        
        // Generar aproximadamente 1-4 actividades por mes (distribuidas entre los tipos) con mayor variación
        for (let month = 0; month < monthsToGenerate; month++) {
            const monthStart = new Date(startDate);
            monthStart.setMonth(startDate.getMonth() + month);
            
            // Generar 1-4 actividades por mes con distribución variada
            let activitiesPerMonth;
            const rand = Math.random();
            if (rand < 0.15) {
                activitiesPerMonth = 1; // 15% probabilidad de 1 actividad
            } else if (rand < 0.65) {
                activitiesPerMonth = 2; // 50% probabilidad de 2 actividades
            } else if (rand < 0.90) {
                activitiesPerMonth = 3; // 25% probabilidad de 3 actividades
            } else {
                activitiesPerMonth = 4; // 10% probabilidad de 4 actividades
            }
            
            for (let actIndex = 0; actIndex < activitiesPerMonth; actIndex++) {
                // Seleccionar tipo de actividad aleatoriamente
                const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
                
                // Calcular día aleatorio dentro del mes (mayor rango)
                const dayOfMonth = 1 + Math.floor(Math.random() * 28);
                const activityDate = new Date(monthStart);
                activityDate.setDate(dayOfMonth);
                
                // Añadir variación aleatoria en la hora (entre 8 AM y 8 PM)
                const hour = 8 + Math.floor(Math.random() * 12);
                const minute = Math.floor(Math.random() * 60);
                activityDate.setHours(hour, minute, 0, 0);
                
                // Calcular score basado en el perfil del estudiante ajustado
                let currentScore = calculateStudentScoreForDate(adjustedProfile, month, monthStart);
                
                // Ajustar score según tipo de actividad (algunos tipos pueden tener scores ligeramente diferentes)
                if (activityType.type === 'ethical') {
                    // Simulador ético puede tener scores ligeramente más altos
                    currentScore += Math.floor(Math.random() * 5);
                } else if (activityType.type === 'conflict') {
                    // Resolución de conflictos puede tener más variación
                    currentScore += Math.floor(Math.random() * 7) - 3;
                }
                
                // Añadir variación aleatoria más amplia (±10 puntos)
                const randomVariation = Math.floor(Math.random() * 21) - 10; // -10 a +10
                currentScore += randomVariation;
                // Añadir variación adicional ocasional (15% de probabilidad)
                if (Math.random() < 0.15) {
                    currentScore += Math.floor(Math.random() * 13) - 6; // Variación extra de ±6
                }
                currentScore = Math.max(25, Math.min(95, currentScore)); // Mantener entre 25 y 95
                
                // Generar ID de actividad único (similar al formato real)
                const testIndex = month * 3 + actIndex; // Índice único para rotación de nombres
                let activityId;
                let activityTitle;
                
                if (activityType.type === 'empathy') {
                    activityId = `empathy_exercise_${ageGroup}_${testIndex + 1}`;
                    activityTitle = getEmpathyTitle(testIndex);
                } else if (activityType.type === 'selfCare') {
                    activityId = `self_care_${ageGroup}_${testIndex + 1}`;
                    activityTitle = getSelfCareTitle(testIndex);
                } else if (activityType.type === 'conflict') {
                    activityId = `conflict_resolution_${ageGroup}_${testIndex + 1}`;
                    activityTitle = getConflictResolutionTitle(testIndex);
                } else {
                    activityId = 'ethical_decision_simulator';
                    activityTitle = getEthicalSimulatorTitle();
                }
                
                // Crear objeto de actividad
                const activity = {
                    id: `demo_activity_${student.id}_${month}_${actIndex}_${Date.now()}_${Math.random()}`,
                    studentId: student.id,
                    studentName: student.name,
                    activityId: activityId,
                    activityTitle: activityTitle,
                    completedAt: activityDate.toISOString()
                };
                
                // Añadir score según tipo
                if (activityType.type === 'ethical') {
                    // Simulador ético
                    activity.ethicalScore = currentScore;
                    activity.simulatorResults = {
                        averageScore: currentScore,
                        scenariosCompleted: 3,
                        decisions: []
                    };
                } else {
                    // Tests (empatía, autocuidado, resolución de conflictos)
                    activity.testScore = currentScore;
                    
                    // Generar respuestas simuladas para el test
                    const numQuestions = 10 + Math.floor(Math.random() * 5); // 10-14 preguntas
                    const responses = [];
                    for (let q = 0; q < numQuestions; q++) {
                        // Generar respuesta basada en el score objetivo
                        const targetAnswer = Math.round((currentScore / 100) * 5);
                        let answer = targetAnswer + Math.floor(Math.random() * 3) - 1;
                        answer = Math.max(1, Math.min(5, answer));
                        
                        responses.push({
                            questionIndex: q,
                            questionText: `Pregunta ${q + 1} del test`,
                            answer: answer,
                            answerValue: `Opción ${answer}`
                        });
                    }
                    activity.responses = responses;
                }
                
                allActivities.push(activity);
            }
        }
    });
    
    // Guardar todas las actividades
    localStorage.setItem('studentActivities', JSON.stringify(allActivities));
    
    const finalCount = allActivities.length;
    const newActivitiesCount = finalCount - initialCount;
    const logDate = new Date();
    const logOneYearAgo = new Date(logDate);
    logOneYearAgo.setFullYear(logDate.getFullYear() - 1);
    console.log(`✅ Generadas ${newActivitiesCount} actividades DEMO para ${studentsNeedingData.length} estudiantes`);
    console.log(`   Total de actividades DEMO: ${finalCount} (distribuidas desde ${logOneYearAgo.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })} hasta ${logDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })})`);
    console.log(`   Promedio: ~${Math.round(newActivitiesCount / studentsNeedingData.length)} actividades por estudiante`);
}

// Función auxiliar para calcular el score de un estudiante según su perfil y fecha
function calculateStudentScoreForDate(profile, monthIndex, date) {
    let baseScore = profile.baseScore;
    
    // Aplicar tendencia según el tipo de perfil
    switch(profile.type) {
        case 'improving':
            // Mejora gradual de +2 a +3 puntos por mes
            baseScore += monthIndex * (2 + Math.random());
            break;
        case 'stable_high':
        case 'stable_low':
            // Se mantiene estable con pequeña variación
            baseScore += (Math.random() - 0.5) * 5;
            break;
        case 'volatile':
            // Altibajos significativos
            baseScore += (Math.random() - 0.5) * 20;
            break;
        case 'declining':
            // Declina gradualmente (caso de atención)
            baseScore -= monthIndex * 1.5;
            break;
    }
    
    // Ajustar límites
    return Math.max(20, Math.min(95, Math.round(baseScore)));
}

// Función auxiliar para generar respuestas basadas en un score objetivo
function generateResponsesFromScore(survey, targetScore) {
    // El score normalizado está entre 0-100, basado en promedio de respuestas 1-5
    // Promedio objetivo = (targetScore / 100) * 5
    const targetAverage = (targetScore / 100) * 5;
    
    const responses = [];
    
    survey.questions.forEach((question, qIndex) => {
        // Generar respuesta cercana al promedio objetivo
        // Con variación para que algunas preguntas puedan estar por encima/abajo
        let answer = Math.round(targetAverage);
        
        // Añadir variación aleatoria pero controlada
        const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, o +1
        answer += variation;
        
        // Mantener dentro del rango 1-5
        answer = Math.max(1, Math.min(5, answer));
        
        // Ocasionalmente (20% probabilidad) permitir más variación para realismo
        if (Math.random() < 0.2) {
            answer = Math.max(1, Math.min(5, answer + (Math.random() < 0.5 ? -1 : 1)));
        }
        
        responses.push({
            questionIndex: qIndex,
            questionText: question.text,
            answer: answer,
            answerValue: question.options.find(o => o.value === answer)?.label || ''
        });
    });
    
    return responses;
}

// ========== AUTENTICACIÓN Y NAVEGACIÓN ==========

// Verificar autenticación y cargar vista
async function checkAuthAndLoadView() {
    // Asegurar que las vistas estén inicializadas
    initViews();
    
    const user = await getCurrentUser();
    if (user) {
        currentUser = user;
        // Actualizar nombre del usuario según su rol
        if (currentUser.role === 'student') {
            updateStudentName();
        } else if (currentUser.role === 'teacher') {
            updateTeacherName();
        }
        
        // Verificar si hay hash en la URL para determinar qué vista mostrar
        const hash = window.location.hash.slice(1);
        
        // Si hay hash, intentar restaurar esa vista específica
        if (hash) {
            // Verificar si es una vista de estudiante
        if (hash === 'student' && currentUser.role === 'student') {
            showStudentView();
            return;
        }
        
            if (hash === 'studentProfile' && currentUser.role === 'student') {
                showStudentProfileView();
            return;
        }
        
            // Verificar si es una vista de docente
            if (currentUser.role === 'teacher') {
                // Vistas específicas del docente
                if (hash === 'teacherMessages' || hash === 'messages') {
                    showTeacherMessagesView();
            return;
        }
                if (hash === 'teacherStudents' || hash === 'students') {
                    showTeacherStudentsView();
                    return;
                }
                if (hash === 'teacherRiskAlerts' || hash === 'riskAlerts') {
                    showTeacherRiskAlertsView();
                    return;
                }
                if (hash === 'teacherNotifications' || hash === 'notifications') {
                    showTeacherNotificationsView();
                    return;
                }
                if (hash === 'teacherClassCodes' || hash === 'classCodes') {
                    showTeacherClassCodesView();
                    return;
                }
                if (hash === 'teacherGrowthSpaces' || hash === 'growthSpaces') {
                    showTeacherGrowthSpacesView();
            return;
        }
        
                // Vista de owner
                if ((hash === 'owner' || hash === 'admin') && (currentUser.email === 'munay@munay.com' || currentUser.email === 'admin@munay.com')) {
            showOwnerView();
            return;
                }
                
                // Vista general de teacher
                if (hash === 'teacher') {
                    showTeacherView();
                    return;
                }
        }
        
        // Si hay hash de login, mostrar login
        if (hash === 'login') {
            showLoginView(false);
            return;
            }
        }
        
        // Si hay usuario logueado pero no hay hash específico, mostrar dashboard según rol
        // Esto previene que al actualizar la página se vaya a landing
        if (currentUser.role === 'student') {
            showStudentView();
            // Actualizar URL sin recargar
            history.replaceState({ view: 'student' }, '', '#student');
        } else if (currentUser.role === 'teacher') {
            // Si es munay@munay.com o admin@munay.com, SIEMPRE mostrar vista de owner
            if (currentUser.email === 'munay@munay.com' || currentUser.email === 'admin@munay.com') {
                showOwnerView();
                // Actualizar URL sin recargar
                history.replaceState({ view: 'owner' }, '', '#owner');
            } else {
                showTeacherView();
                // Actualizar URL sin recargar
                history.replaceState({ view: 'teacher' }, '', '#teacher');
            }
        } else {
            // Por defecto, mostrar landing page pero mantener sesión
            showLandingView(false);
            updateLandingPageButtons();
        }
    } else {
        // No hay usuario, verificar hash
        const hash = window.location.hash.slice(1);
        if (hash === 'login') {
            showLoginView(false);
        } else {
            showLandingView(false);
            updateLandingPageButtons();
        }
    }
}

// ========== GESTIÓN DE VISTAS ==========

// Mostrar vistas
function showLandingView(updateHistory = true) {
    // NO limpiar la sesión - mantener currentUser intacto
    document.getElementById('landingView').classList.remove('hidden');
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('requestDemoView').classList.add('hidden');
    document.getElementById('studentView').classList.add('hidden');
    document.getElementById('studentMessagesView').classList.add('hidden');
    document.getElementById('teacherView').classList.add('hidden');
    document.getElementById('teacherMessagesView').classList.add('hidden');
    document.getElementById('teacherStudentsView').classList.add('hidden');
    document.getElementById('teacherClassCodesView').classList.add('hidden');
    document.getElementById('ownerView').classList.add('hidden');
    
    currentView = 'landing';
    updateLandingPageButtons();
    
    if (updateHistory) {
        history.pushState({ view: 'landing' }, '', '#');
    }
}

// ========== CONTENIDO DE ARTÍCULOS ==========

// Artículos completos con contenido extenso y fuentes
const articlesData = {
    'article-1': {
        category: 'Prevención',
        title: 'Señales de alerta: Cómo identificar el bullying en las escuelas',
        date: '15 Enero 2025',
        readTime: '5 min',
        content: `
            <h2>Señales de alerta: Cómo identificar el bullying en las escuelas</h2>
            
            <p>El acoso escolar, también conocido como bullying, es un problema que afecta a millones de estudiantes en todo el mundo. Identificar las señales tempranas es crucial para prevenir consecuencias más graves y proteger el bienestar de los estudiantes. Como educadores, padres y miembros de la comunidad escolar, debemos estar atentos a una serie de indicadores que pueden revelar situaciones de acoso.</p>
            
            <h3>Señales físicas y comportamentales</h3>
            
            <p>Una de las formas más evidentes de detectar el bullying es a través de cambios físicos y comportamentales en los estudiantes. Los niños y adolescentes que están siendo acosados suelen mostrar:</p>
            
            <ul>
                <li><strong>Cambios físicos inexplicables:</strong> Moretones, rasguños, ropa rasgada o pertenencias dañadas o perdidas sin explicación coherente.</li>
                <li><strong>Problemas de salud recurrentes:</strong> Dolores de cabeza, estómago o malestar general que aparecen frecuentemente, especialmente los días de escuela.</li>
                <li><strong>Alteraciones en el sueño:</strong> Pesadillas, insomnio o cambios significativos en los patrones de descanso.</li>
                <li><strong>Cambios en el apetito:</strong> Pérdida de apetito o, por el contrario, aumento excesivo de la ingesta de alimentos.</li>
            </ul>
            
            <h3>Señales emocionales y sociales</h3>
            
            <p>El impacto emocional del bullying es profundo y puede manifestarse de diversas maneras:</p>
            
            <ul>
                <li><strong>Aislamiento social:</strong> El estudiante evita participar en actividades sociales, se aleja de sus compañeros o muestra reticencia a asistir a eventos escolares.</li>
                <li><strong>Cambios en el estado de ánimo:</strong> Irritabilidad, tristeza persistente, ansiedad o episodios de llanto sin causa aparente.</li>
                <li><strong>Baja autoestima:</strong> Comentarios negativos sobre sí mismo, autocrítica excesiva o creencia de que "no vale nada".</li>
                <li><strong>Miedo o ansiedad relacionada con la escuela:</strong> Nerviosismo antes de ir a clase, resistencia a asistir o expresiones de miedo relacionadas con el entorno escolar.</li>
            </ul>
            
            <h3>Señales académicas</h3>
            
            <p>El rendimiento académico puede verse significativamente afectado cuando un estudiante está siendo acosado:</p>
            
            <ul>
                <li><strong>Disminución en las calificaciones:</strong> Una caída repentina o gradual en el rendimiento académico sin causa aparente.</li>
                <li><strong>Falta de concentración:</strong> Dificultad para mantener la atención en clase o completar tareas escolares.</li>
                <li><strong>Ausentismo escolar:</strong> Faltas frecuentes o solicitudes constantes de irse antes de tiempo.</li>
                <li><strong>Pérdida de interés:</strong> Desinterés por actividades que antes disfrutaba, incluyendo asignaturas o proyectos escolares.</li>
            </ul>
            
            <h3>Señales en el uso de tecnología</h3>
            
            <p>En la era digital, el ciberacoso requiere atención especial:</p>
            
            <ul>
                <li><strong>Cambios en el uso de dispositivos:</strong> Evitar usar el teléfono o la computadora, o por el contrario, uso excesivo y ansioso.</li>
                <li><strong>Reacciones emocionales al recibir mensajes:</strong> Ansiedad, tristeza o enojo al revisar notificaciones o mensajes.</li>
                <li><strong>Secreto sobre actividades en línea:</strong> Cambiar contraseñas constantemente, ocultar la pantalla o evitar hablar sobre sus interacciones digitales.</li>
            </ul>
            
            <h3>Qué hacer cuando detectamos señales</h3>
            
            <p>Una vez identificadas las señales de alerta, es fundamental actuar de manera inmediata y apropiada:</p>
            
            <ol>
                <li><strong>Documentar las observaciones:</strong> Llevar un registro detallado de los comportamientos observados, fechas y contextos.</li>
                <li><strong>Comunicarse con el estudiante:</strong> Crear un espacio seguro y confidencial para hablar con el estudiante sin presionarlo.</li>
                <li><strong>Notificar a las autoridades escolares:</strong> Informar al coordinador, psicólogo escolar o director sobre las preocupaciones.</li>
                <li><strong>Colaborar con los padres:</strong> Mantener comunicación abierta con las familias para abordar el problema de manera integral.</li>
                <li><strong>Seguimiento continuo:</strong> Monitorear la situación y asegurar que se implementen medidas de apoyo y protección.</li>
            </ol>
            
            <p>Es importante recordar que cada estudiante es único y puede manifestar el estrés del acoso de manera diferente. La clave está en conocer bien a nuestros estudiantes y estar atentos a cualquier cambio significativo en su comportamiento, bienestar emocional o rendimiento académico.</p>
        `,
        sources: [
            'Olweus, D. (1993). Bullying at School: What We Know and What We Can Do. Blackwell Publishing.',
            'Espelage, D. L., & Swearer, S. M. (2003). Research on school bullying and victimization: What have we learned and where do we go from here? School Psychology Review, 32(3), 365-383.',
            'StopBullying.gov. (2024). Warning Signs for Bullying. U.S. Department of Health and Human Services.',
            'UNESCO. (2019). Behind the numbers: Ending school violence and bullying. UNESCO Publishing.',
            'American Psychological Association. (2021). Bullying: What parents, teachers can do to stop it. APA Monitor on Psychology.'
        ]
    },
    'article-2': {
        category: 'Investigación',
        title: 'El impacto psicológico del bullying en estudiantes de secundaria',
        date: '10 Enero 2025',
        readTime: '7 min',
        content: `
            <h2>El impacto psicológico del bullying en estudiantes de secundaria</h2>
            
            <p>El acoso escolar durante la adolescencia tiene consecuencias profundas y duraderas en la salud mental y el desarrollo psicológico de los estudiantes. Los años de secundaria representan un período crítico de formación de la identidad, y el bullying puede alterar significativamente este proceso, dejando cicatrices emocionales que pueden persistir hasta la adultez.</p>
            
            <h3>Impacto en la salud mental</h3>
            
            <p>Numerosos estudios longitudinales han demostrado que los estudiantes que experimentan bullying tienen un riesgo significativamente mayor de desarrollar trastornos de salud mental:</p>
            
            <ul>
                <li><strong>Depresión:</strong> Las investigaciones indican que los adolescentes víctimas de bullying tienen hasta 4 veces más probabilidades de desarrollar depresión clínica. Los síntomas pueden incluir tristeza persistente, pérdida de interés en actividades, cambios en el apetito y patrones de sueño, y pensamientos de desesperanza.</li>
                <li><strong>Ansiedad:</strong> El acoso escolar está fuertemente asociado con trastornos de ansiedad, incluyendo ansiedad social, trastorno de pánico y trastorno de ansiedad generalizada. Los estudiantes pueden desarrollar miedo intenso a situaciones sociales y evitar el contacto con sus compañeros.</li>
                <li><strong>Ideación suicida:</strong> Estudios alarmantes revelan que los adolescentes víctimas de bullying tienen un riesgo aumentado de ideación suicida y comportamientos autolesivos. La correlación es particularmente fuerte cuando el acoso es persistente y severo.</li>
                <li><strong>Trastorno de estrés postraumático (TEPT):</strong> Algunos estudiantes desarrollan síntomas de TEPT como resultado del trauma repetido del acoso, incluyendo flashbacks, hipervigilancia y evitación de situaciones que recuerdan el evento traumático.</li>
            </ul>
            
            <h3>Efectos en la autoestima y la identidad</h3>
            
            <p>La adolescencia es un período crucial para la formación de la autoestima y la identidad personal. El bullying puede socavar significativamente estos procesos:</p>
            
            <ul>
                <li><strong>Autoestima deteriorada:</strong> Los mensajes negativos constantes pueden internalizarse, llevando a los estudiantes a desarrollar una imagen negativa de sí mismos que puede persistir durante años.</li>
                <li><strong>Formación de identidad alterada:</strong> Los adolescentes víctimas de bullying pueden desarrollar identidades basadas en la victimización, lo que dificulta su capacidad para verse a sí mismos de manera positiva.</li>
                <li><strong>Autoconcepto académico:</strong> El acoso escolar frecuentemente afecta la forma en que los estudiantes perciben sus propias capacidades académicas, incluso cuando su rendimiento objetivo no ha cambiado.</li>
            </ul>
            
            <h3>Impacto en las relaciones sociales</h3>
            
            <p>El bullying puede alterar profundamente la capacidad de los estudiantes para formar y mantener relaciones saludables:</p>
            
            <ul>
                <li><strong>Aislamiento social:</strong> Los estudiantes víctimas de bullying pueden retirarse de las interacciones sociales por miedo a ser rechazados o humillados nuevamente.</li>
                <li><strong>Dificultades para confiar:</strong> La experiencia del acoso puede generar desconfianza hacia los demás, dificultando la formación de amistades cercanas y relaciones significativas.</li>
                <li><strong>Problemas de comunicación:</strong> El miedo a ser juzgado puede llevar a los estudiantes a evitar expresar sus opiniones o necesidades, afectando su capacidad de comunicación asertiva.</li>
            </ul>
            
            <h3>Consecuencias académicas</h3>
            
            <p>El impacto psicológico del bullying se extiende directamente al rendimiento académico:</p>
            
            <ul>
                <li><strong>Disminución del rendimiento:</strong> Los estudiantes acosados muestran calificaciones más bajas y menor participación en clase, en parte debido a la dificultad para concentrarse y la ansiedad relacionada con el entorno escolar.</li>
                <li><strong>Absentismo escolar:</strong> El miedo al acoso puede llevar a los estudiantes a evitar la escuela, lo que resulta en faltas frecuentes y pérdida de oportunidades de aprendizaje.</li>
                <li><strong>Abandono escolar:</strong> En casos extremos, el bullying puede contribuir a la decisión de abandonar los estudios completamente.</li>
            </ul>
            
            <h3>Efectos a largo plazo</h3>
            
            <p>Las investigaciones muestran que el impacto del bullying puede extenderse mucho más allá de los años escolares:</p>
            
            <ul>
                <li><strong>Problemas de salud mental en la adultez:</strong> Los estudios longitudinales han encontrado que los adultos que fueron víctimas de bullying durante la adolescencia tienen mayores tasas de depresión, ansiedad y otros trastornos mentales.</li>
                <li><strong>Dificultades laborales:</strong> El impacto en la autoestima y las habilidades sociales puede afectar el desempeño profesional y las relaciones laborales.</li>
                <li><strong>Relaciones románticas:</strong> Los problemas de confianza y autoestima pueden dificultar la formación de relaciones íntimas saludables.</li>
            </ul>
            
            <h3>Factores protectores</h3>
            
            <p>A pesar de estos impactos preocupantes, es importante reconocer que existen factores que pueden proteger a los estudiantes:</p>
            
            <ul>
                <li><strong>Apoyo familiar:</strong> Una familia comprensiva y de apoyo puede amortiguar significativamente los efectos del bullying.</li>
                <li><strong>Relaciones positivas con adultos:</strong> La presencia de al menos un adulto de confianza (maestro, consejero, familiar) puede hacer una diferencia significativa.</li>
                <li><strong>Amistades sólidas:</strong> Tener incluso un amigo cercano puede proteger contra los efectos más negativos del acoso.</li>
                <li><strong>Intervención temprana:</strong> Cuando el bullying se identifica y aborda rápidamente, los efectos a largo plazo pueden reducirse significativamente.</li>
            </ul>
            
            <p>Como educadores y miembros de la comunidad escolar, es nuestra responsabilidad reconocer la gravedad del impacto psicológico del bullying y tomar medidas proactivas para prevenir el acoso y apoyar a los estudiantes afectados. La intervención temprana y el apoyo continuo pueden hacer una diferencia significativa en la vida de los estudiantes.</p>
        `,
        sources: [
            'Copeland, W. E., Wolke, D., Angold, A., & Costello, E. J. (2013). Adult psychiatric outcomes of bullying and being bullied by peers in childhood and adolescence. JAMA Psychiatry, 70(4), 419-426.',
            'Klomek, A. B., Sourander, A., & Elonheimo, H. (2015). Bullying by peers in childhood and effects on psychopathology, suicidality, and criminality in adulthood. The Lancet Psychiatry, 2(10), 930-941.',
            'Arseneault, L. (2018). Annual Research Review: The persistent and pervasive impact of being bullied in childhood and adolescence. Journal of Child Psychology and Psychiatry, 59(4), 405-421.',
            'Ttofi, M. M., Farrington, D. P., Lösel, F., & Loeber, R. (2011). Do the victims of school bullies tend to become depressed later in life? A systematic review and meta-analysis of longitudinal studies. Journal of Aggression, Conflict and Peace Research, 3(2), 63-73.',
            'National Academies of Sciences, Engineering, and Medicine. (2016). Preventing Bullying Through Science, Policy, and Practice. The National Academies Press.'
        ]
    },
    'article-3': {
        category: 'Intervención',
        title: 'Protocolos efectivos de intervención en casos de bullying',
        date: '5 Enero 2025',
        readTime: '6 min',
        content: `
            <h2>Protocolos efectivos de intervención en casos de bullying</h2>
            
            <p>Cuando se identifica un caso de bullying, una respuesta rápida, estructurada y empática es fundamental para proteger a la víctima, abordar el comportamiento del agresor y restaurar un ambiente escolar seguro. Los protocolos de intervención efectivos se basan en principios de justicia restaurativa, apoyo emocional y prevención de futuros incidentes.</p>
            
            <h3>Fase 1: Respuesta inmediata (Primeras 24 horas)</h3>
            
            <p>La respuesta inmediata es crucial para garantizar la seguridad de todos los involucrados:</p>
            
            <ul>
                <li><strong>Separar a las partes:</strong> Asegurar que la víctima y el agresor no tengan contacto inmediato, proporcionando espacios seguros para ambos.</li>
                <li><strong>Garantizar la seguridad:</strong> Implementar medidas de supervisión adicional si es necesario, especialmente durante los períodos de recreo y transición entre clases.</li>
                <li><strong>Documentar el incidente:</strong> Registrar detalles específicos: qué ocurrió, cuándo, dónde, quiénes estuvieron involucrados y qué acciones se tomaron inmediatamente.</li>
                <li><strong>Brindar apoyo emocional:</strong> Ofrecer consuelo y validación a la víctima, asegurándole que el incidente se está tomando en serio y que se tomarán medidas.</li>
            </ul>
            
            <h3>Fase 2: Investigación y evaluación (48-72 horas)</h3>
            
            <p>Una investigación cuidadosa es esencial para comprender completamente la situación:</p>
            
            <ul>
                <li><strong>Entrevistas individuales:</strong> Hablar por separado con la víctima, el agresor, los testigos y cualquier otro adulto relevante. Crear un ambiente seguro y sin juicios.</li>
                <li><strong>Recopilar evidencia:</strong> Revisar mensajes de texto, publicaciones en redes sociales, trabajos escritos o cualquier otra evidencia documental del acoso.</li>
                <li><strong>Evaluar el contexto:</strong> Entender la historia de la relación entre las partes, patrones previos de comportamiento y factores contribuyentes.</li>
                <li><strong>Evaluar el impacto:</strong> Determinar el nivel de daño emocional, físico o académico que ha experimentado la víctima.</li>
            </ul>
            
            <h3>Fase 3: Plan de intervención</h3>
            
            <p>Basándose en la investigación, desarrollar un plan integral:</p>
            
            <h4>Apoyo para la víctima:</h4>
            <ul>
                <li><strong>Servicios de consejería:</strong> Conectar a la víctima con servicios de apoyo psicológico o consejería escolar.</li>
                <li><strong>Modificaciones académicas:</strong> Si es necesario, proporcionar acomodaciones temporales para reducir el estrés académico.</li>
                <li><strong>Estrategias de seguridad:</strong> Desarrollar un plan de seguridad personalizado que incluya rutas seguras, espacios seguros y contacto con adultos de confianza.</li>
                <li><strong>Apoyo de pares:</strong> Facilitar conexiones con compañeros de apoyo o grupos de pares positivos.</li>
            </ul>
            
            <h4>Intervención con el agresor:</h4>
            <ul>
                <li><strong>Consecuencias apropiadas:</strong> Implementar consecuencias que sean educativas y restaurativas, no solo punitivas. Esto puede incluir suspensión, pero también debe incluir educación sobre el impacto de sus acciones.</li>
                <li><strong>Programas de intervención:</strong> Inscribir al agresor en programas diseñados para abordar el comportamiento agresivo y desarrollar habilidades de empatía y resolución de conflictos.</li>
                <li><strong>Supervisión aumentada:</strong> Proporcionar monitoreo adicional para prevenir futuros incidentes.</li>
                <li><strong>Involucrar a la familia:</strong> Trabajar con los padres del agresor para abordar el comportamiento y proporcionar apoyo adicional si es necesario.</li>
            </ul>
            
            <h3>Fase 4: Comunicación con las familias</h3>
            
            <p>La comunicación transparente y empática con las familias es esencial:</p>
            
            <ul>
                <li><strong>Notificar a los padres de la víctima:</strong> Informar inmediatamente sobre el incidente, las medidas de seguridad implementadas y el plan de seguimiento.</li>
                <li><strong>Notificar a los padres del agresor:</strong> Comunicar el comportamiento de su hijo, las consecuencias aplicadas y las expectativas para el cambio.</li>
                <li><strong>Mantener confidencialidad:</strong> Respetar la privacidad de todos los involucrados mientras se mantiene la transparencia necesaria.</li>
                <li><strong>Establecer expectativas claras:</strong> Comunicar qué se espera de cada familia y cómo pueden apoyar el proceso de resolución.</li>
            </ul>
            
            <h3>Fase 5: Seguimiento y monitoreo</h3>
            
            <p>El seguimiento continuo es crucial para prevenir la recurrencia:</p>
            
            <ul>
                <li><strong>Revisión regular:</strong> Programar reuniones de seguimiento con la víctima, el agresor y sus familias para evaluar el progreso.</li>
                <li><strong>Monitoreo del ambiente escolar:</strong> Observar las interacciones en el aula, recreo y otros espacios para asegurar que no haya repetición del comportamiento.</li>
                <li><strong>Ajustes al plan:</strong> Modificar el plan de intervención según sea necesario basándose en el progreso observado.</li>
                <li><strong>Evaluación de efectividad:</strong> Determinar si las intervenciones están siendo efectivas y ajustar según sea necesario.</li>
            </ul>
            
            <h3>Principios clave de intervención efectiva</h3>
            
            <ul>
                <li><strong>Enfoque restaurativo:</strong> Enfocarse en reparar el daño y restaurar las relaciones cuando sea posible, en lugar de simplemente castigar.</li>
                <li><strong>Empatía y comprensión:</strong> Reconocer que tanto las víctimas como los agresores pueden necesitar apoyo y comprensión.</li>
                <li><strong>Intervención temprana:</strong> Actuar rápidamente antes de que la situación se intensifique.</li>
                <li><strong>Enfoque integral:</strong> Abordar el problema desde múltiples ángulos: individual, familiar, escolar y comunitario.</li>
                <li><strong>Prevención de represalias:</strong> Tomar medidas para asegurar que la víctima no enfrentará represalias por reportar el incidente.</li>
            </ul>
            
            <p>Los protocolos efectivos de intervención requieren coordinación, comunicación y compromiso de toda la comunidad escolar. Al seguir estos pasos estructurados, podemos crear ambientes más seguros y apoyar el bienestar de todos los estudiantes.</p>
        `,
        sources: [
            'Rigby, K. (2012). Bullying Interventions in Schools: Six Basic Approaches. Wiley-Blackwell.',
            'Coloroso, B. (2014). The Bully, the Bullied, and the Not-So-Innocent Bystander: From Preschool to High School and Beyond. HarperOne.',
            'Olweus, D., & Limber, S. P. (2010). Bullying in school: Evaluation and dissemination of the Olweus Bullying Prevention Program. American Journal of Orthopsychiatry, 80(1), 124-134.',
            'StopBullying.gov. (2024). Respond to Bullying. U.S. Department of Health and Human Services.',
            'UNESCO. (2019). School violence and bullying: Global status report. UNESCO Publishing.'
        ]
    },
    'article-4': {
        category: 'Ciberbullying',
        title: 'Ciberbullying: Prevención en la era digital',
        date: '28 Diciembre 2024',
        readTime: '8 min',
        content: `
            <h2>Ciberbullying: Prevención en la era digital</h2>
            
            <p>El ciberbullying, o acoso cibernético, representa uno de los desafíos más significativos de la educación moderna. A diferencia del bullying tradicional, el ciberbullying puede ocurrir las 24 horas del día, 7 días a la semana, y puede llegar a una audiencia mucho más amplia. Como educadores, debemos entender las características únicas del ciberbullying y desarrollar estrategias efectivas para prevenirlo y abordarlo.</p>
            
            <h3>¿Qué es el ciberbullying?</h3>
            
            <p>El ciberbullying se define como el uso de tecnología digital para acosar, amenazar, avergonzar o molestar a otra persona. Incluye comportamientos como:</p>
            
            <ul>
                <li><strong>Mensajes de texto hostiles:</strong> Envío repetido de mensajes amenazantes, intimidantes o humillantes.</li>
                <li><strong>Publicaciones en redes sociales:</strong> Comentarios negativos, publicación de fotos embarazosas o creación de perfiles falsos para humillar a alguien.</li>
                <li><strong>Exclusión digital:</strong> Excluir intencionalmente a alguien de grupos en línea, chats o actividades virtuales.</li>
                <li><strong>Doxing:</strong> Compartir información personal privada de alguien sin su consentimiento.</li>
                <li><strong>Suplantación de identidad:</strong> Crear cuentas falsas usando el nombre o la imagen de otra persona para dañar su reputación.</li>
            </ul>
            
            <h3>Características únicas del ciberbullying</h3>
            
            <p>El ciberbullying presenta características que lo hacen particularmente desafiante:</p>
            
            <ul>
                <li><strong>Anonimato:</strong> Los agresores pueden ocultar su identidad, lo que les da una sensación de impunidad y puede aumentar la severidad del acoso.</li>
                <li><strong>Alcance ampliado:</strong> Un solo mensaje o publicación puede llegar a cientos o miles de personas en minutos, amplificando el daño emocional.</li>
                <li><strong>Persistencia:</strong> El contenido digital puede permanecer en línea indefinidamente, causando daño continuo incluso después de que el acoso inicial haya terminado.</li>
                <li><strong>Dificultad para escapar:</strong> A diferencia del bullying en persona, los estudiantes no pueden "irse a casa" para escapar del ciberbullying, ya que la tecnología los sigue.</li>
                <li><strong>Menor supervisión de adultos:</strong> Los adultos pueden no estar presentes en los espacios digitales donde ocurre el ciberbullying.</li>
            </ul>
            
            <h3>Señales de que un estudiante está siendo ciberacosado</h3>
            
            <p>Reconocer las señales tempranas es crucial:</p>
            
            <ul>
                <li><strong>Cambios en el uso de dispositivos:</strong> Evitar usar su teléfono o computadora, o por el contrario, uso excesivo y ansioso.</li>
                <li><strong>Reacciones emocionales:</strong> Tristeza, ansiedad o enojo después de usar dispositivos o revisar mensajes.</li>
                <li><strong>Secreto sobre actividades en línea:</strong> Ocultar la pantalla, cambiar contraseñas frecuentemente o evitar hablar sobre sus interacciones digitales.</li>
                <li><strong>Retirada social:</strong> Aislarse de amigos y familiares.</li>
                <li><strong>Síntomas físicos:</strong> Dolores de cabeza, problemas de sueño o cambios en el apetito relacionados con el estrés.</li>
            </ul>
            
            <h3>Estrategias de prevención</h3>
            
            <h4>Educación digital integral:</h4>
            <ul>
                <li><strong>Ciudadanía digital:</strong> Enseñar a los estudiantes sobre el uso responsable de la tecnología, la empatía digital y el impacto de sus acciones en línea.</li>
                <li><strong>Privacidad y seguridad:</strong> Educar sobre la importancia de proteger información personal y ajustes de privacidad en plataformas sociales.</li>
                <li><strong>Pensamiento crítico:</strong> Ayudar a los estudiantes a evaluar críticamente el contenido que encuentran en línea y a reconocer información falsa o dañina.</li>
            </ul>
            
            <h4>Crear políticas claras:</h4>
            <ul>
                <li><strong>Políticas escolares:</strong> Establecer políticas claras sobre el uso de tecnología que incluyan consecuencias específicas para el ciberbullying.</li>
                <li><strong>Contratos de uso responsable:</strong> Implementar acuerdos que los estudiantes y padres firmen comprometiéndose al uso responsable de la tecnología.</li>
                <li><strong>Procedimientos de reporte:</strong> Crear canales claros y seguros para que los estudiantes reporten incidentes de ciberbullying.</li>
            </ul>
            
            <h4>Fomentar una cultura positiva:</h4>
            <ul>
                <li><strong>Promover la bondad digital:</strong> Celebrar y reconocer ejemplos de uso positivo de la tecnología.</li>
                <li><strong>Programas de mentores:</strong> Establecer programas donde estudiantes mayores modelen comportamiento digital positivo.</li>
                <li><strong>Proyectos colaborativos:</strong> Crear proyectos que utilicen tecnología de manera colaborativa y positiva.</li>
            </ul>
            
            <h3>Intervención cuando ocurre ciberbullying</h3>
            
            <p>Cuando se identifica un caso de ciberbullying:</p>
            
            <ul>
                <li><strong>Responder rápidamente:</strong> No minimizar el incidente; el ciberbullying puede tener consecuencias graves.</li>
                <li><strong>Documentar todo:</strong> Guardar capturas de pantalla, mensajes y cualquier otra evidencia del ciberbullying.</li>
                <li><strong>Notificar a las plataformas:</strong> Reportar el contenido a las plataformas de redes sociales o servicios de mensajería involucrados.</li>
                <li><strong>Involucrar a las familias:</strong> Comunicarse con los padres de todos los involucrados.</li>
                <li><strong>Proporcionar apoyo:</strong> Ofrecer recursos de consejería y apoyo emocional para la víctima.</li>
                <li><strong>Abordar al agresor:</strong> Educar sobre las consecuencias de sus acciones y proporcionar intervención apropiada.</li>
            </ul>
            
            <h3>Colaboración con las familias</h3>
            
            <p>Las familias juegan un papel crucial en la prevención del ciberbullying:</p>
            
            <ul>
                <li><strong>Educación parental:</strong> Proporcionar recursos y talleres para ayudar a los padres a entender las plataformas digitales y cómo supervisar el uso de sus hijos.</li>
                <li><strong>Límites claros:</strong> Ayudar a las familias a establecer límites apropiados sobre el uso de dispositivos y el tiempo en pantalla.</li>
                <li><strong>Comunicación abierta:</strong> Fomentar conversaciones abiertas entre padres e hijos sobre las experiencias en línea.</li>
                <li><strong>Monitoreo apropiado:</strong> Equilibrar la privacidad de los adolescentes con la necesidad de supervisión apropiada.</li>
            </ul>
            
            <h3>Recursos y herramientas</h3>
            
            <p>Existen numerosos recursos disponibles para ayudar a prevenir y abordar el ciberbullying:</p>
            
            <ul>
                <li><strong>Plataformas de reporte:</strong> Utilizar herramientas de reporte integradas en plataformas sociales.</li>
                <li><strong>Aplicaciones de monitoreo:</strong> Considerar el uso de aplicaciones que ayuden a los padres a monitorear el uso de dispositivos de manera apropiada.</li>
                <li><strong>Recursos educativos:</strong> Acceder a currículos y materiales educativos diseñados específicamente para enseñar ciudadanía digital.</li>
                <li><strong>Líneas de ayuda:</strong> Conocer y compartir recursos de líneas de ayuda para estudiantes que experimentan ciberbullying.</li>
            </ul>
            
            <p>El ciberbullying es un desafío complejo que requiere un enfoque integral que involucre a estudiantes, educadores, familias y la comunidad en general. Al educar, prevenir y responder efectivamente, podemos crear espacios digitales más seguros y positivos para todos nuestros estudiantes.</p>
        `,
        sources: [
            'Hinduja, S., & Patchin, J. W. (2020). Cyberbullying: Identification, Prevention, and Response. Cyberbullying Research Center.',
            'Tokunaga, R. S. (2010). Following you home from school: A critical review and synthesis of research on cyberbullying victimization. Computers in Human Behavior, 26(3), 277-287.',
            'Kowalski, R. M., Giumetti, G. W., Schroeder, A. N., & Lattanner, M. R. (2014). Bullying in the digital age: A critical review and meta-analysis of cyberbullying research among youth. Psychological Bulletin, 140(4), 1073-1137.',
            'Common Sense Media. (2024). Digital Citizenship Curriculum. Common Sense Education.',
            'UNESCO. (2021). Behind the numbers: Ending school violence and bullying - Focus on cyberbullying. UNESCO Publishing.'
        ]
    },
    'article-5': {
        category: 'Empatía',
        title: 'Desarrollando empatía: Herramientas para prevenir el bullying',
        date: '20 Diciembre 2024',
        readTime: '6 min',
        content: `
            <h2>Desarrollando empatía: Herramientas para prevenir el bullying</h2>
            
            <p>La empatía, la capacidad de comprender y compartir los sentimientos de otra persona, es una de las herramientas más poderosas para prevenir el bullying. Cuando los estudiantes desarrollan empatía genuina, son menos propensos a acosar a otros y más propensos a intervenir cuando ven que alguien está siendo acosado. Como educadores, podemos implementar estrategias intencionales para desarrollar esta habilidad crucial en nuestros estudiantes.</p>
            
            <h3>¿Por qué la empatía previene el bullying?</h3>
            
            <p>La investigación muestra que los estudiantes con altos niveles de empatía:</p>
            
            <ul>
                <li><strong>Comprenden el impacto de sus acciones:</strong> Pueden imaginar cómo se sentiría alguien si fueran acosados, lo que disuade el comportamiento agresivo.</li>
                <li><strong>Intervienen como defensores:</strong> Son más propensos a defender a las víctimas y reportar el bullying cuando lo observan.</li>
                <li><strong>Construyen relaciones positivas:</strong> La empatía facilita la formación de conexiones genuinas y respetuosas entre estudiantes.</li>
                <li><strong>Resuelven conflictos constructivamente:</strong> Pueden ver las situaciones desde múltiples perspectivas, facilitando la resolución pacífica de conflictos.</li>
            </ul>
            
            <h3>Actividades para desarrollar empatía emocional</h3>
            
            <p>La empatía emocional implica sentir lo que otra persona siente:</p>
            
            <h4>1. Círculos de empatía:</h4>
            <p>Reúnase en círculo y comparta momentos de la semana. Los estudiantes pueden hablar sobre una situación en la que se sintieron felices, tristes, enojados o asustados. Esto ayuda a los estudiantes a reconocer emociones en sí mismos y en otros.</p>
            
            <h4>2. Diarios de perspectiva:</h4>
            <p>Después de leer una historia o ver un video, pida a los estudiantes que escriban desde la perspectiva de diferentes personajes, explorando cómo se sintieron y por qué actuaron de cierta manera.</p>
            
            <h4>3. Mapeo de emociones:</h4>
            <p>Ayude a los estudiantes a crear "mapas emocionales" que muestren cómo diferentes situaciones pueden hacer sentir a diferentes personas. Esto ayuda a reconocer que las personas pueden tener diferentes reacciones emocionales al mismo evento.</p>
            
            <h3>Actividades para desarrollar empatía cognitiva</h3>
            
            <p>La empatía cognitiva implica entender los pensamientos y perspectivas de otra persona:</p>
            
            <h4>1. Cambio de perspectiva:</h4>
            <p>Presente escenarios de conflicto y pida a los estudiantes que exploren la situación desde múltiples puntos de vista. "¿Cómo se sentiría esta persona? ¿Qué pensaría esta otra persona?"</p>
            
            <h4>2. Entrevistas de empatía:</h4>
            <p>Asigne a los estudiantes que entrevisten a compañeros sobre sus experiencias, intereses y desafíos. Esto ayuda a los estudiantes a entender mejor a sus compañeros y reconocer su humanidad compartida.</p>
            
            <h4>3. Juegos de roles:</h4>
            <p>Use juegos de roles estructurados donde los estudiantes adopten diferentes roles en situaciones conflictivas. Esto ayuda a desarrollar la capacidad de ver situaciones desde múltiples perspectivas.</p>
            
            <h3>Integrando la empatía en el currículo</h3>
            
            <p>La empatía puede desarrollarse en todas las áreas académicas:</p>
            
            <ul>
                <li><strong>Literatura:</strong> Analizar personajes y sus motivaciones, explorar cómo diferentes personajes experimentan los mismos eventos de manera diferente.</li>
                <li><strong>Historia:</strong> Estudiar eventos históricos desde múltiples perspectivas, considerando cómo diferentes grupos experimentaron los mismos eventos.</li>
                <li><strong>Ciencias:</strong> Explorar cómo las acciones humanas afectan a otros seres vivos y al medio ambiente.</li>
                <li><strong>Matemáticas:</strong> Usar problemas de palabras que involucren situaciones sociales y requieran considerar las necesidades de diferentes personas.</li>
            </ul>
            
            <h3>Modelando empatía como educadores</h3>
            
            <p>Los educadores pueden modelar empatía de múltiples maneras:</p>
            
            <ul>
                <li><strong>Reconocer las emociones de los estudiantes:</strong> Validar los sentimientos de los estudiantes y demostrar comprensión de sus experiencias.</li>
                <li><strong>Compartir nuestras propias experiencias:</strong> Cuando sea apropiado, compartir momentos en los que experimentamos emociones similares, ayudando a los estudiantes a entender que los adultos también tienen sentimientos.</li>
                <li><strong>Escuchar activamente:</strong> Demostrar atención completa cuando los estudiantes hablan, haciendo preguntas de seguimiento y reflejando lo que escuchamos.</li>
                <li><strong>Reconocer errores:</strong> Cuando cometemos errores, reconocerlos y disculparnos modela empatía y humildad.</li>
            </ul>
            
            <h3>Creando oportunidades para la empatía en acción</h3>
            
            <p>Proporcione oportunidades para que los estudiantes practiquen la empatía:</p>
            
            <ul>
                <li><strong>Servicio comunitario:</strong> Involucre a los estudiantes en proyectos de servicio que les permitan conectarse con personas diferentes a ellos.</li>
                <li><strong>Proyectos colaborativos:</strong> Diseñe proyectos que requieran que los estudiantes trabajen juntos y consideren las necesidades y perspectivas de otros.</li>
                <li><strong>Programas de mentores:</strong> Establezca programas donde estudiantes mayores trabajen con estudiantes más jóvenes, desarrollando relaciones de cuidado y apoyo.</li>
                <li><strong>Proyectos intergeneracionales:</strong> Conecte a los estudiantes con miembros de la comunidad de diferentes edades y antecedentes.</li>
            </ul>
            
            <h3>Enfrentando desafíos al desarrollar empatía</h3>
            
            <p>Algunos estudiantes pueden tener dificultades para desarrollar empatía debido a:</p>
            
            <ul>
                <li><strong>Experiencias traumáticas:</strong> El trauma puede hacer que sea difícil para los estudiantes conectarse con las emociones de otros.</li>
                <li><strong>Trastornos del desarrollo:</strong> Algunos estudiantes con ciertas condiciones pueden necesitar apoyo adicional para desarrollar habilidades empáticas.</li>
                <li><strong>Factores culturales:</strong> Diferentes culturas pueden expresar y entender la empatía de maneras diferentes.</li>
            </ul>
            
            <p>Es importante ser paciente, proporcionar apoyo individualizado y reconocer que el desarrollo de la empatía es un proceso continuo que puede requerir tiempo y práctica.</p>
            
            <h3>Evaluación del desarrollo de la empatía</h3>
            
            <p>Monitoree el progreso en el desarrollo de la empatía mediante:</p>
            
            <ul>
                <li><strong>Observación:</strong> Observe cómo los estudiantes interactúan con otros y responden a situaciones emocionales.</li>
                <li><strong>Reflexión:</strong> Pida a los estudiantes que reflexionen sobre sus propias respuestas empáticas en situaciones específicas.</li>
                <li><strong>Autorreporte:</strong> Use cuestionarios estructurados que midan los niveles de empatía de los estudiantes.</li>
                <li><strong>Evaluación de pares:</strong> Proporcione oportunidades para que los estudiantes reconozcan comportamiento empático en sus compañeros.</li>
            </ul>
            
            <p>Desarrollar empatía en nuestros estudiantes no es solo una estrategia para prevenir el bullying; es una inversión en su desarrollo como seres humanos compasivos y socialmente responsables. Al crear oportunidades intencionales para que los estudiantes practiquen y desarrollen la empatía, estamos construyendo una base sólida para relaciones más positivas y un ambiente escolar más seguro y acogedor para todos.</p>
        `,
        sources: [
            'Decety, J., & Cowell, J. M. (2014). The complex relation between morality and empathy. Trends in Cognitive Sciences, 18(7), 337-339.',
            'Zaki, J. (2019). The War for Kindness: Building Empathy in a Fractured World. Crown Publishing.',
            'Gordon, M. (2009). Roots of Empathy: Changing the World Child by Child. The Experiment.',
            'Jolliffe, D., & Farrington, D. P. (2006). Examining the relationship between low empathy and bullying. Aggressive Behavior, 32(6), 540-550.',
            'CASEL. (2020). Core SEL Competencies: Social Awareness. Collaborative for Academic, Social, and Emotional Learning.'
        ]
    },
    'article-6': {
        category: 'Bienestar',
        title: 'Creando un clima escolar positivo: El rol de los docentes',
        date: '12 Diciembre 2024',
        readTime: '7 min',
        content: `
            <h2>Creando un clima escolar positivo: El rol de los docentes</h2>
            
            <p>Un clima escolar positivo es fundamental para prevenir el bullying y promover el bienestar de todos los estudiantes. Los docentes juegan un papel central en la creación y mantenimiento de este ambiente, ya que pasan más tiempo con los estudiantes que cualquier otro adulto en la escuela. El clima escolar no es simplemente algo que existe; es algo que debemos construir activamente cada día a través de nuestras acciones, palabras y decisiones.</p>
            
            <h3>¿Qué es un clima escolar positivo?</h3>
            
            <p>Un clima escolar positivo se caracteriza por:</p>
            
            <ul>
                <li><strong>Seguridad física y emocional:</strong> Los estudiantes se sienten seguros para expresarse, tomar riesgos académicos y ser auténticos.</li>
                <li><strong>Respeto mutuo:</strong> Todos los miembros de la comunidad escolar son tratados con dignidad y respeto, independientemente de sus diferencias.</li>
                <li><strong>Inclusión:</strong> Todos los estudiantes se sienten valorados, incluidos y parte de la comunidad escolar.</li>
                <li><strong>Comunicación abierta:</strong> Los estudiantes se sienten cómodos expresando preocupaciones y saben que serán escuchados.</li>
                <li><strong>Relaciones positivas:</strong> Conexiones fuertes y de apoyo entre estudiantes, docentes y personal escolar.</li>
                <li><strong>Sentido de pertenencia:</strong> Los estudiantes sienten que pertenecen y tienen un propósito dentro de la comunidad escolar.</li>
            </ul>
            
            <h3>Estrategias para crear un clima positivo en el aula</h3>
            
            <h4>1. Establecer rutinas y expectativas claras</h4>
            <p>Los estudiantes prosperan cuando saben qué esperar. Establezca rutinas claras y comunique expectativas de manera consistente:</p>
            <ul>
                <li>Comience cada día con una actividad de conexión.</li>
                <li>Establezca normas de clase junto con los estudiantes.</li>
                <li>Comunique claramente las consecuencias tanto positivas como negativas.</li>
                <li>Sea consistente en la aplicación de reglas y expectativas.</li>
            </ul>
            
            <h4>2. Crear conexiones auténticas</h4>
            <p>Las relaciones positivas entre docente y estudiante son fundamentales:</p>
            <ul>
                <li><strong>Conocer a los estudiantes:</strong> Tome tiempo para conocer los intereses, fortalezas y desafíos de cada estudiante.</li>
                <li><strong>Mostrar interés genuino:</strong> Haga preguntas sobre sus vidas fuera de la escuela y recuerde detalles importantes.</li>
                <li><strong>Estar disponible:</strong> Esté disponible para hablar con los estudiantes antes y después de clase, durante el recreo o en momentos informales.</li>
                <li><strong>Reconocer logros:</strong> Celebre no solo los logros académicos, sino también el crecimiento personal y el carácter positivo.</li>
            </ul>
            
            <h4>3. Fomentar la inclusión y la diversidad</h4>
            <p>Un clima positivo celebra y valora la diversidad:</p>
            <ul>
                <li><strong>Representación:</strong> Incluya materiales y ejemplos que representen diversos antecedentes, culturas y experiencias.</li>
                <li><strong>Reconocer diferencias:</strong> Celebre las diferencias como fortalezas, no como debilidades.</li>
                <li><strong>Evitar estereotipos:</strong> Cuestionar y desafiar estereotipos cuando surjan.</li>
                <li><strong>Crear espacios seguros:</strong> Establecer espacios donde todos los estudiantes puedan expresarse sin temor a juicio.</li>
            </ul>
            
            <h4>4. Modelar comportamiento positivo</h4>
            <p>Los docentes son modelos a seguir poderosos:</p>
            <ul>
                <li><strong>Tratar a todos con respeto:</strong> Modelar cómo tratar a todos los estudiantes, colegas y miembros de la comunidad con respeto.</li>
                <li><strong>Manejar el estrés:</strong> Demostrar estrategias saludables para manejar el estrés y las emociones desafiantes.</li>
                <li><strong>Admitir errores:</strong> Cuando cometemos errores, reconocerlos y disculparnos modela humildad y crecimiento.</li>
                <li><strong>Mostrar empatía:</strong> Demostrar comprensión y compasión hacia los estudiantes que están pasando por dificultades.</li>
            </ul>
            
            <h4>5. Crear oportunidades para la voz estudiantil</h4>
            <p>Los estudiantes deben sentirse escuchados y valorados:</p>
            <ul>
                <li><strong>Tomar decisiones democráticas:</strong> Involucre a los estudiantes en decisiones sobre el aula y actividades escolares.</li>
                <li><strong>Proporcionar opciones:</strong> Ofrezca opciones en asignaciones y actividades cuando sea posible.</li>
                <li><strong>Encuestas regulares:</strong> Solicite retroalimentación regular sobre el ambiente del aula y ajuste según sea necesario.</li>
                <li><strong>Comités de estudiantes:</strong> Establezca comités donde los estudiantes puedan contribuir a mejorar el ambiente escolar.</li>
            </ul>
            
            <h3>Abordar conflictos de manera constructiva</h3>
            
            <p>En cualquier ambiente escolar, surgirán conflictos. Cómo los abordamos determina si fortalecen o debilitan el clima escolar:</p>
            
            <ul>
                <li><strong>Enfoque restaurativo:</strong> En lugar de simplemente castigar, trabaje para reparar el daño y restaurar las relaciones.</li>
                <li><strong>Escuchar todas las perspectivas:</strong> Asegúrese de escuchar a todas las partes involucradas antes de tomar decisiones.</li>
                <li><strong>Enseñar habilidades de resolución de conflictos:</strong> Proporcione oportunidades para que los estudiantes aprendan y practiquen habilidades de resolución de conflictos.</li>
                <li><strong>Usar conflictos como oportunidades de aprendizaje:</strong> Ayude a los estudiantes a ver los conflictos como oportunidades para crecer y aprender.</li>
            </ul>
            
            <h3>Construir una comunidad dentro del aula</h3>
            
            <p>Un sentido de comunidad ayuda a prevenir el bullying:</p>
            
            <ul>
                <li><strong>Actividades de construcción de equipo:</strong> Incluya actividades regulares que ayuden a los estudiantes a conocerse y trabajar juntos.</li>
                <li><strong>Celebrar el éxito colectivo:</strong> Reconozca y celebre los logros del grupo, no solo los individuales.</li>
                <li><strong>Proyectos colaborativos:</strong> Diseñe proyectos que requieran que los estudiantes trabajen juntos y dependan unos de otros.</li>
                <li><strong>Rituales y tradiciones:</strong> Establezca rituales y tradiciones que creen un sentido de pertenencia e historia compartida.</li>
            </ul>
            
            <h3>Colaboración con colegas</h3>
            
            <p>Crear un clima escolar positivo requiere colaboración:</p>
            
            <ul>
                <li><strong>Compartir estrategias:</strong> Comparta estrategias exitosas con colegas y aprenda de sus experiencias.</li>
                <li><strong>Consistencia en toda la escuela:</strong> Trabaje con otros docentes para asegurar que las expectativas y enfoques sean consistentes en toda la escuela.</li>
                <li><strong>Apoyo mutuo:</strong> Apoye a los colegas cuando enfrenten desafíos y busque apoyo cuando lo necesite.</li>
                <li><strong>Desarrollo profesional conjunto:</strong> Participe en oportunidades de desarrollo profesional enfocadas en crear climas escolares positivos.</li>
            </ul>
            
            <h3>Midiendo el clima escolar</h3>
            
            <p>Es importante monitorear regularmente el clima escolar:</p>
            
            <ul>
                <li><strong>Encuestas de estudiantes:</strong> Realice encuestas regulares para medir cómo los estudiantes perciben el clima escolar.</li>
                <li><strong>Observación:</strong> Observe las interacciones entre estudiantes y cómo responden a diferentes situaciones.</li>
                <li><strong>Indicadores de comportamiento:</strong> Monitoree tasas de ausentismo, disciplina y participación en actividades escolares.</li>
                <li><strong>Reflexión continua:</strong> Reflexione regularmente sobre qué está funcionando y qué podría mejorarse.</li>
            </ul>
            
            <h3>El impacto a largo plazo</h3>
            
            <p>Un clima escolar positivo tiene beneficios que se extienden mucho más allá del aula:</p>
            
            <ul>
                <li><strong>Mejor rendimiento académico:</strong> Los estudiantes en ambientes positivos tienden a tener mejor rendimiento académico.</li>
                <li><strong>Menor bullying:</strong> Los climas escolares positivos están asociados con tasas significativamente más bajas de bullying.</li>
                <li><strong>Desarrollo socioemocional:</strong> Los estudiantes en ambientes positivos desarrollan mejores habilidades socioemocionales.</li>
                <li><strong>Bienestar a largo plazo:</strong> Las experiencias escolares positivas contribuyen al bienestar general y al éxito futuro.</li>
            </ul>
            
            <p>Crear un clima escolar positivo es un trabajo continuo que requiere intención, dedicación y reflexión constante. Como docentes, tenemos el poder de transformar el ambiente escolar y crear espacios donde todos los estudiantes puedan prosperar. Cada interacción, cada decisión y cada palabra contribuye al clima que creamos. Al priorizar el clima escolar positivo, estamos invirtiendo en el bienestar de nuestros estudiantes y en el futuro de nuestras comunidades.</p>
        `,
        sources: [
            'Cohen, J., Espelage, D. L., Berkowitz, M., & Twemlow, S. (2015). Climate change: Creating a comprehensive school climate framework for preventing school violence. Handbook of school violence and school safety: International research and practice, 2, 281-294.',
            'Thapa, A., Cohen, J., Guffey, S., & Higgins-D\'Alessandro, A. (2013). A review of school climate research. Review of Educational Research, 83(3), 357-385.',
            'Osher, D., Kendziora, K., Spier, E., & Garibaldi, M. L. (2014). School climate and social and emotional learning. In J. A. Durlak, C. E. Domitrovich, R. P. Weissberg, & T. P. Gullotta (Eds.), Handbook of social and emotional learning: Research and practice (pp. 305-319). Guilford Publications.',
            'National School Climate Center. (2024). What is school climate? National School Climate Center.',
            'CASEL. (2020). SEL and School Climate. Collaborative for Academic, Social, and Emotional Learning.'
        ]
    }
};

function openArticleModal(articleId) {
    const article = articlesData[articleId];
    if (!article) return;
    
    const modal = document.getElementById('articleModal');
    const categoryEl = document.getElementById('articleModalCategory');
    const dateEl = document.getElementById('articleModalDate');
    const readTimeEl = document.getElementById('articleModalReadTime');
    const bodyEl = document.getElementById('articleModalBody');
    
    categoryEl.textContent = article.category;
    dateEl.textContent = article.date;
    readTimeEl.textContent = article.readTime;
    
    bodyEl.innerHTML = article.content + `
        <div class="article-modal-sources">
            <h4>Referencias</h4>
            <ul>
                ${article.sources.map(source => `<li>${source}</li>`).join('')}
            </ul>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeArticleModal() {
    const modal = document.getElementById('articleModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Cerrar modal al hacer clic fuera del contenido
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('articleModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeArticleModal();
            }
        });
    }
});

async function updateLandingPageButtons() {
    const user = await getCurrentUser();
    // Seleccionar específicamente el botón de "Iniciar sesión" (el botón secundario)
    const navButton = document.querySelector('.landing-nav .nav-btn-secondary');
    const heroButtons = document.querySelectorAll('.hero-buttons button');
    
    // El botón del nav cambia según si hay usuario o no
    if (user) {
        // Usuario logueado - cambiar botón del nav para ir al dashboard
        if (navButton) {
            const text = typeof i18n !== 'undefined' ? i18n.t('dashboard.goToDashboard') : 'Ir al Dashboard';
            navButton.innerHTML = text;
            navButton.onclick = function() {
                if (user.role === 'student') {
                    showStudentView();
                } else if (user.role === 'teacher') {
                    showTeacherView();
                }
            };
        }
    } else {
        // No hay usuario - botón del nav para login (solo login, sin registro)
        if (navButton) {
            const text = typeof i18n !== 'undefined' ? i18n.t('dashboard.login') : 'Iniciar Sesión';
            navButton.textContent = text;
            // Asegurar que el onclick esté configurado
            navButton.onclick = function(e) { 
                e.preventDefault();
                showLoginView(); 
            };
            navButton.setAttribute('onclick', 'showLoginView()');
        }
    }
    
    // El botón del hero siempre es "Solicitar Demo" independientemente de la sesión
    heroButtons.forEach((btn) => {
        const text = typeof i18n !== 'undefined' ? i18n.t('dashboard.requestDemo') : 'Solicitar Demo';
        btn.innerHTML = `<span>${text}</span>`;
        btn.onclick = function() { showRequestDemoView(); };
    });
}

function showLoginView(updateHistory = true) {
    document.getElementById('landingView').classList.add('hidden');
    document.getElementById('loginView').classList.remove('hidden');
    document.getElementById('requestDemoView').classList.add('hidden');
    document.getElementById('studentView').classList.add('hidden');
    document.getElementById('studentMessagesView').classList.add('hidden');
    document.getElementById('teacherView').classList.add('hidden');
    document.getElementById('teacherMessagesView').classList.add('hidden');
    document.getElementById('teacherStudentsView').classList.add('hidden');
    document.getElementById('teacherClassCodesView').classList.add('hidden');
    currentView = 'login';
    // Solo agregar entrada al historial si no viene de popstate
    if (updateHistory && (!history.state || history.state.view !== 'login')) {
        history.pushState({ view: 'login' }, '', window.location.pathname + '#login');
    }
}

function scrollToFeatures() {
    document.querySelector('.features-section').scrollIntoView({ behavior: 'smooth' });
}

function showRequestDemoView() {
    document.getElementById('landingView').classList.add('hidden');
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('requestDemoView').classList.remove('hidden');
    document.getElementById('studentView').classList.add('hidden');
    document.getElementById('studentMessagesView').classList.add('hidden');
    document.getElementById('studentProfileView').classList.add('hidden');
    document.getElementById('teacherView').classList.add('hidden');
    document.getElementById('teacherMessagesView').classList.add('hidden');
    document.getElementById('teacherStudentsView').classList.add('hidden');
    document.getElementById('teacherClassCodesView').classList.add('hidden');
    document.getElementById('teacherNotificationsView').classList.add('hidden');
    currentView = 'requestDemo';
    if (!history.state || history.state.view !== 'requestDemo') {
        history.pushState({ view: 'requestDemo' }, '', window.location.pathname + '#request-demo');
    }
}

function showStudentView() {
    document.getElementById('landingView').classList.add('hidden');
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('studentView').classList.remove('hidden');
    document.getElementById('studentMessagesView').classList.add('hidden');
    document.getElementById('studentProfileView').classList.add('hidden');
    document.getElementById('teacherView').classList.add('hidden');
    document.getElementById('teacherMessagesView').classList.add('hidden');
    document.getElementById('teacherStudentsView').classList.add('hidden');
    document.getElementById('teacherClassCodesView').classList.add('hidden');
    currentView = 'student';
    updateStudentNavActive('dashboard');
    
    // Actualizar nombre del usuario
    updateStudentName();
    
    // Recargar datos y actualizar estadísticas
    loadSurveys();
    loadActivities();
    updateStudentDashboardStats();
    
    // Actualizar historial solo si no viene de popstate
    if (history.state?.view !== 'student') {
        history.pushState({ view: 'student' }, '', window.location.pathname);
    }
}

// Función para cambiar entre pestañas del dashboard
function switchDashboardTab(tabName) {
    // Ocultar todas las pestañas
    const allTabs = document.querySelectorAll('.dashboard-tab-content');
    allTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remover active de todos los botones de pestaña
    const allTabButtons = document.querySelectorAll('.dashboard-tab');
    allTabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar la pestaña seleccionada
    const selectedTab = document.getElementById(`tab-${tabName}`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Activar el botón de pestaña correspondiente
    const selectedButton = document.querySelector(`.dashboard-tab[data-tab="${tabName}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
    
    // Si es la pestaña de análisis, asegurar que los gráficos se rendericen
    if (tabName === 'analysis') {
        setTimeout(() => {
            // Asegurar que currentChartStudents esté disponible
            if (!currentChartStudents) {
                const students = getClassStudents();
                currentChartStudents = students;
            }
            // Verificar que los canvas estén visibles antes de renderizar
            const distributionCanvas = document.getElementById('wellbeingDistributionChart');
            const trendCanvas = document.getElementById('wellbeingTrendChart');
            const keywordsCanvas = document.getElementById('keywordsTrendsChart');
            if (distributionCanvas && trendCanvas && selectedTab.classList.contains('active')) {
                updateAnalysisChartsFilter();
                // También cargar el gráfico de keywords en esta pestaña
                if (keywordsCanvas) {
                    loadKeywordsTrends();
                }
            }
        }, 200);
    }
    
    // Si es la pestaña de valores emocionales, asegurar que se rendericen
    if (tabName === 'emotional') {
        setTimeout(() => {
            if (selectedTab.classList.contains('active')) {
                updateEmotionalValuesCharts();
            }
        }, 200);
    }
    
    // Si es la pestaña de tendencias, asegurar que se renderice
    if (tabName === 'trends') {
        setTimeout(() => {
            const keywordsCanvas = document.getElementById('keywordsTrendsChart');
            if (keywordsCanvas && selectedTab.classList.contains('active')) {
                loadKeywordsTrends();
            }
        }, 200);
    }
}

function showTeacherView() {
    document.getElementById('landingView').classList.add('hidden');
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('studentView').classList.add('hidden');
    document.getElementById('studentMessagesView').classList.add('hidden');
    document.getElementById('studentProfileView').classList.add('hidden');
    document.getElementById('teacherView').classList.remove('hidden');
    document.getElementById('teacherMessagesView').classList.add('hidden');
    document.getElementById('teacherRiskAlertsView').classList.add('hidden');
    document.getElementById('teacherStudentsView').classList.add('hidden');
    document.getElementById('teacherNotificationsView').classList.add('hidden');
    document.getElementById('teacherClassCodesView').classList.add('hidden');
    document.getElementById('teacherGrowthSpacesView').classList.add('hidden');
    
    // Actualizar filtros de mes y código de clase dinámicamente
    populateMonthFilters();
    populateClassCodeFilters();
    
    // Actualizar badge de alertas
    updateRiskAlertsBadge();
    
    // Cargar valores emocionales después de mostrar la vista
    setTimeout(() => {
        loadEmotionalValues();
    }, 100);
    currentView = 'teacher';
    updateTeacherNavActive('dashboard');
    
    // Actualizar nombre del usuario
    updateTeacherName();
    
    // Cargar datos de estudiantes primero
    loadStudentData();
    
    // Activar la primera pestaña por defecto después de que los datos se carguen
    setTimeout(() => {
        switchDashboardTab('summary');
    }, 300);
    
    // Actualizar historial
    if (history.state?.view !== 'teacher') {
        history.pushState({ view: 'teacher' }, '', window.location.pathname);
    }
}

function showStudentMessagesView() {
    document.getElementById('landingView').classList.add('hidden');
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('studentView').classList.add('hidden');
    document.getElementById('studentMessagesView').classList.remove('hidden');
    document.getElementById('studentProfileView').classList.add('hidden');
    document.getElementById('teacherView').classList.add('hidden');
    document.getElementById('teacherMessagesView').classList.add('hidden');
    document.getElementById('teacherStudentsView').classList.add('hidden');
    currentView = 'studentMessages';
    updateStudentNavActive('messages');
    
    // Actualizar nombre del usuario
    updateStudentName();
    
    // Inicializar formulario de envío de mensaje
    const sendMessageForm = document.getElementById('sendMessageForm');
    if (sendMessageForm) {
        sendMessageForm.removeEventListener('submit', handleSendMessage);
        sendMessageForm.addEventListener('submit', handleSendMessage);
    }
    
    loadStudentMessages();
}

// ========== PERFIL DE ESTUDIANTE ==========

// Lista de avatares disponibles - apropiados para niños y jóvenes en entorno educativo
const availableAvatars = [
    // Caras de niños y jóvenes
    '😊', '😄', '😃', '😁', '🙂', '😉', '😎', '🤗',
    '👦', '👧', '🧒', '👶', '😇', '🤓', '😋', '🥳',
    // Estudiantes y actividades escolares
    '🧑‍🎓', '👨‍🎓', '👩‍🎓', '📚', '📖', '✏️', '✍️', '📝',
    '📊', '📈', '📉', '🎓', '🏆', '⭐', '🌟', '💫',
    // Animales amigables
    '🐻', '🐨', '🐼', '🦊', '🐰', '🐸', '🐶', '🐱',
    '🦉', '🦄', '🐯', '🦁', '🐺', '🐹', '🐭', '🐷',
    // Deportes y actividades
    '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🏸',
    '🎮', '🎨', '🎭', '🎪', '🎬', '🎤', '🎧', '🎸',
    // Objetos y símbolos positivos
    '🌞', '🌙', '⭐', '🌟', '💫', '✨', '🌈', '🎈',
    '🎁', '🎉', '🎊', '💎', '🎯', '🎲', '🧩', '🎪'
];

function showStudentProfileView() {
    document.getElementById('landingView').classList.add('hidden');
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('studentView').classList.add('hidden');
    document.getElementById('studentMessagesView').classList.add('hidden');
    document.getElementById('studentProfileView').classList.remove('hidden');
    document.getElementById('teacherView').classList.add('hidden');
    document.getElementById('teacherMessagesView').classList.add('hidden');
    document.getElementById('teacherStudentsView').classList.add('hidden');
    document.getElementById('teacherClassCodesView').classList.add('hidden');
    currentView = 'studentProfile';
    
    // Actualizar nombre del usuario
    updateStudentName();
    
    // Cargar información del perfil
    loadStudentProfile();
    
    // Actualizar historial
    if (history.state?.view !== 'studentProfile') {
        history.pushState({ view: 'studentProfile' }, '', window.location.pathname);
    }
}

function loadStudentProfile() {
    if (!currentUser || currentUser.role !== 'student') return;
    
    // Cargar información del perfil
    const profileFullName = document.getElementById('profileFullName');
    const profileAge = document.getElementById('profileAge');
    const profileCourse = document.getElementById('profileCourse');
    const profileEmail = document.getElementById('profileEmail');
    const currentAvatarDisplay = document.getElementById('currentAvatarDisplay');
    
    if (profileFullName) {
        profileFullName.textContent = currentUser.name || 'No especificado';
    }
    
    if (profileAge) {
        const yearsText = typeof i18n !== 'undefined' ? i18n.t('profile.years') : 'años';
        const notSpecified = typeof i18n !== 'undefined' ? i18n.t('profile.notSpecified') : 'No especificado';
        profileAge.textContent = currentUser.age ? `${currentUser.age} ${yearsText}` : notSpecified;
    }
    
    if (profileCourse) {
        // Obtener el nombre de la clase desde localStorage
        const classes = JSON.parse(localStorage.getItem('classes') || '[]');
        const classData = classes.find(c => c.code === currentUser.classCode);
        const notSpecified = typeof i18n !== 'undefined' ? i18n.t('profile.notSpecified') : 'No especificado';
        profileCourse.textContent = classData ? classData.name : (currentUser.classCode || notSpecified);
    }
    
    if (profileEmail) {
        const notSpecified = typeof i18n !== 'undefined' ? i18n.t('profile.notSpecified') : 'No especificado';
        profileEmail.textContent = currentUser.email || notSpecified;
    }
    
    // Cargar avatar guardado o usar el predeterminado
    const savedAvatar = currentUser.avatar || '🧑‍🎓';
    if (currentAvatarDisplay) {
        currentAvatarDisplay.textContent = savedAvatar;
    }
}

function openAvatarSelector() {
    const modal = document.getElementById('avatarSelectorModal');
    const avatarGrid = document.getElementById('avatarGrid');
    
    if (!modal || !avatarGrid) return;
    
    // Limpiar grid anterior
    avatarGrid.innerHTML = '';
    
    // Obtener avatar actual
    const currentAvatar = currentUser?.avatar || '🧑‍🎓';
    
    // Crear botones para cada avatar
    availableAvatars.forEach(avatar => {
        const avatarButton = document.createElement('button');
        avatarButton.className = 'avatar-option';
        avatarButton.textContent = avatar;
        avatarButton.style.cssText = `
            font-size: 50px;
            width: 100px;
            height: 100px;
            border: 3px solid ${avatar === currentAvatar ? '#A3C9A8' : '#e0e0e0'};
            border-radius: 12px;
            background: ${avatar === currentAvatar ? '#f0f4ff' : 'white'};
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // Efecto hover
        avatarButton.onmouseover = function() {
            if (avatar !== currentAvatar) {
                this.style.borderColor = '#A3C9A8';
                this.style.background = '#f0f4ff';
                this.style.transform = 'scale(1.1)';
            }
        };
        avatarButton.onmouseout = function() {
            if (avatar !== currentAvatar) {
                this.style.borderColor = '#e0e0e0';
                this.style.background = 'white';
                this.style.transform = 'scale(1)';
            }
        };
        
        // Seleccionar avatar
        avatarButton.onclick = function() {
            selectAvatar(avatar);
        };
        
        avatarGrid.appendChild(avatarButton);
    });
    
    // Mostrar modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeAvatarSelector() {
    const modal = document.getElementById('avatarSelectorModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function selectAvatar(avatar) {
    if (!currentUser) return;
    
    // Guardar avatar en el usuario
    currentUser.avatar = avatar;
    
    // Actualizar en localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].avatar = avatar;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // currentUser ya está actualizado en memoria, no usar localStorage
    
    // Actualizar visualización del avatar en el perfil
    const currentAvatarDisplay = document.getElementById('currentAvatarDisplay');
    if (currentAvatarDisplay) {
        currentAvatarDisplay.textContent = avatar;
        // Animación de confirmación
        currentAvatarDisplay.style.transform = 'scale(1.2) rotate(5deg)';
        setTimeout(() => {
            currentAvatarDisplay.style.transform = 'scale(1) rotate(0deg)';
        }, 300);
    }
    
    // Actualizar avatar en el header del dashboard
    const studentAvatarHeaders = document.querySelectorAll('#studentAvatarHeader');
    studentAvatarHeaders.forEach(el => {
        el.textContent = avatar;
        // Animación de confirmación
        el.style.transform = 'scale(1.2) rotate(5deg)';
        setTimeout(() => {
            el.style.transform = 'scale(1) rotate(0deg)';
        }, 300);
    });
    
    // Cerrar modal
    closeAvatarSelector();
    
    // Mostrar mensaje de confirmación
    const message = typeof i18n !== 'undefined' ? i18n.t('success.avatarUpdated') : '¡Avatar actualizado exitosamente! 🎉';
    showSuccessMessage(message);
}

// Cerrar modal al hacer clic fuera
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('avatarSelectorModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAvatarSelector();
            }
        });
    }
});

function updateStudentNavActive(activeSection) {
    // Actualizar botones de navegación en todas las vistas del estudiante
    const views = ['studentView', 'studentMessagesView', 'studentProfileView'];
    views.forEach(viewId => {
        const view = document.getElementById(viewId);
        if (!view) return;
        
        const nav = view.querySelector('.teacher-nav');
        if (!nav) return;
        
        const buttons = nav.querySelectorAll('.nav-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            // Remover estilos de hover temporal
            btn.style.transform = '';
        });
        
        // Activar el botón correspondiente con animación
        if (activeSection === 'dashboard') {
            const dashboardBtn = nav.querySelector('.nav-btn:first-child');
            if (dashboardBtn) {
                dashboardBtn.classList.add('active');
                dashboardBtn.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    dashboardBtn.style.transform = '';
                }, 200);
            }
        } else if (activeSection === 'messages') {
            const messagesBtn = Array.from(nav.querySelectorAll('.nav-btn')).find(btn => 
                btn.textContent.includes('Comunicación')
            );
            if (messagesBtn) {
                messagesBtn.classList.add('active');
                messagesBtn.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    messagesBtn.style.transform = '';
                }, 200);
            }
        } else if (activeSection === 'rewards') {
            const rewardsBtn = Array.from(nav.querySelectorAll('.nav-btn')).find(btn => 
                btn.textContent.includes('Recompensas')
            );
            if (rewardsBtn) {
                rewardsBtn.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    rewardsBtn.style.transform = '';
                }, 200);
            }
        }
    });
}

function showTeacherMessagesView() {
    document.getElementById('landingView').classList.add('hidden');
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('studentView').classList.add('hidden');
    document.getElementById('studentMessagesView').classList.add('hidden');
    document.getElementById('studentProfileView').classList.add('hidden');
    document.getElementById('teacherView').classList.add('hidden');
    document.getElementById('teacherMessagesView').classList.remove('hidden');
    document.getElementById('teacherRiskAlertsView').classList.add('hidden');
    document.getElementById('teacherStudentsView').classList.add('hidden');
    document.getElementById('teacherNotificationsView').classList.add('hidden');
    document.getElementById('teacherClassCodesView').classList.add('hidden');
    document.getElementById('teacherGrowthSpacesView').classList.add('hidden');
    currentView = 'teacherMessages';
    updateTeacherNavActive('messages');
    
    // Actualizar nombre del usuario
    updateTeacherName();
    
    // Resetear al filtro de pendientes cuando se entra a la vista
    currentMessageFilter = 'pending';
    
    // Actualizar badge de alertas
    updateRiskAlertsBadge();
    
    loadTeacherMessages('pending');
    
    // Actualizar hash en la URL
    history.replaceState({ view: 'teacherMessages' }, '', '#teacherMessages');
}

function showTeacherStudentsView() {
    document.getElementById('landingView').classList.add('hidden');
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('studentView').classList.add('hidden');
    document.getElementById('studentMessagesView').classList.add('hidden');
    document.getElementById('studentProfileView').classList.add('hidden');
    document.getElementById('teacherView').classList.add('hidden');
    document.getElementById('teacherMessagesView').classList.add('hidden');
    document.getElementById('teacherRiskAlertsView').classList.add('hidden');
    document.getElementById('teacherStudentsView').classList.remove('hidden');
    document.getElementById('teacherNotificationsView').classList.add('hidden');
    document.getElementById('teacherClassCodesView').classList.add('hidden');
    document.getElementById('teacherGrowthSpacesView').classList.add('hidden');
    currentView = 'teacherStudents';
    updateTeacherNavActive('students');
    
    // Actualizar nombre del usuario
    updateTeacherName();
    
    // Actualizar badge de alertas
    updateRiskAlertsBadge();
    
    // Cargar selector de clases
    loadClassCodeFilter();
    
    // Cargar datos de estudiantes en la vista de estudiantes
    filterStudentsByClass();
    
    // Actualizar hash en la URL
    history.replaceState({ view: 'teacherStudents' }, '', '#teacherStudents');
}

function showTeacherClassCodesView() {
    document.getElementById('landingView').classList.add('hidden');
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('studentView').classList.add('hidden');
    document.getElementById('studentMessagesView').classList.add('hidden');
    document.getElementById('studentProfileView').classList.add('hidden');
    document.getElementById('teacherView').classList.add('hidden');
    document.getElementById('teacherMessagesView').classList.add('hidden');
    document.getElementById('teacherRiskAlertsView').classList.add('hidden');
    document.getElementById('teacherStudentsView').classList.add('hidden');
    document.getElementById('teacherNotificationsView').classList.add('hidden');
    document.getElementById('teacherClassCodesView').classList.remove('hidden');
    document.getElementById('teacherGrowthSpacesView').classList.add('hidden');
    currentView = 'teacherClassCodes';
    updateTeacherNavActive('classCodes');
    
    // Actualizar nombre del usuario
    updateTeacherName();
    
    // Cargar códigos de clase
    displayClassCodes();
    
    // Actualizar hash en la URL
    history.replaceState({ view: 'teacherClassCodes' }, '', '#teacherClassCodes');
}

function showTeacherRiskAlertsView() {
    document.getElementById('landingView').classList.add('hidden');
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('studentView').classList.add('hidden');
    document.getElementById('studentMessagesView').classList.add('hidden');
    document.getElementById('studentProfileView').classList.add('hidden');
    document.getElementById('teacherView').classList.add('hidden');
    document.getElementById('teacherMessagesView').classList.add('hidden');
    document.getElementById('teacherRiskAlertsView').classList.remove('hidden');
    document.getElementById('teacherStudentsView').classList.add('hidden');
    document.getElementById('teacherNotificationsView').classList.add('hidden');
    document.getElementById('teacherClassCodesView').classList.add('hidden');
    document.getElementById('teacherGrowthSpacesView').classList.add('hidden');
    currentView = 'teacherRiskAlerts';
    updateTeacherNavActive('riskAlerts');
    
    // Actualizar nombre del usuario
    updateTeacherName();
    
    // Cargar alertas de riesgo
    loadRiskAlerts();
    
    // Actualizar badge
    updateRiskAlertsBadge();
    
    // Actualizar hash en la URL
    history.replaceState({ view: 'teacherRiskAlerts' }, '', '#teacherRiskAlerts');
}

function showTeacherGrowthSpacesView() {
    document.getElementById('landingView').classList.add('hidden');
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('studentView').classList.add('hidden');
    document.getElementById('studentMessagesView').classList.add('hidden');
    document.getElementById('studentProfileView').classList.add('hidden');
    document.getElementById('teacherView').classList.add('hidden');
    document.getElementById('teacherMessagesView').classList.add('hidden');
    document.getElementById('teacherRiskAlertsView').classList.add('hidden');
    document.getElementById('teacherStudentsView').classList.add('hidden');
    document.getElementById('teacherNotificationsView').classList.add('hidden');
    document.getElementById('teacherClassCodesView').classList.add('hidden');
    document.getElementById('teacherGrowthSpacesView').classList.remove('hidden');
    currentView = 'teacherGrowthSpaces';
    updateTeacherNavActive('growthSpaces');
    
    // Actualizar nombre del usuario
    updateTeacherName();
    
    // Cargar espacios de crecimiento
    loadGrowthSpaces();
    
    // Actualizar hash en la URL
    history.replaceState({ view: 'teacherGrowthSpaces' }, '', '#teacherGrowthSpaces');
}


function loadClassCodeFilter() {
    const filter = document.getElementById('classCodeFilter');
    if (!filter) return;
    
    if (!currentUser || !currentUser.id) {
        console.error('❌ Error: currentUser no está definido en loadClassCodeFilter');
        return;
    }
    
    // Guardar el valor seleccionado actual
    const currentValue = filter.value;
    
    // Limpiar opciones excepto "Todas las clases"
    const allClassesText = typeof i18n !== 'undefined' ? i18n.t('filters.allClasses') : 'Todas las clases';
    filter.innerHTML = `<option value="">${allClassesText}</option>`;
    
    // Usar getClientClasses() que maneja correctamente la lógica de clientes y clases virtuales
    const teacherClasses = getClientClasses();
    
    // Si no hay clases, intentar obtener códigos únicos de los estudiantes del cliente
    if (teacherClasses.length === 0) {
        const clientStudents = getClientStudents();
        const uniqueClassCodes = [...new Set(clientStudents
            .filter(s => s.classCode)
            .map(s => s.classCode)
        )];
        
        // Crear opciones basadas en los códigos de clase de los estudiantes
        uniqueClassCodes.forEach(classCode => {
            const option = document.createElement('option');
            option.value = classCode;
            option.textContent = `Clase ${classCode} (${classCode})`;
            filter.appendChild(option);
        });
    } else {
        // Agregar cada clase del docente/cliente
    teacherClasses.forEach(classData => {
        const option = document.createElement('option');
        option.value = classData.code;
            option.textContent = `${classData.name || `Clase ${classData.code}`} (${classData.code})`;
        filter.appendChild(option);
    });
    }
    
    // Restaurar el valor seleccionado si existe
    if (currentValue) {
        const allOptions = Array.from(filter.options).map(opt => opt.value);
        if (allOptions.includes(currentValue)) {
        filter.value = currentValue;
        }
    }
}

function filterStudentsByClass() {
    const filter = document.getElementById('classCodeFilter');
    const selectedClassCode = filter ? filter.value : '';
    
    let students;
    if (selectedClassCode) {
        // Filtrar por código de clase específico
        students = getClassStudents(selectedClassCode);
    } else {
        // Mostrar todos los estudiantes del docente
        students = getClassStudents();
    }
    
    // Also apply search filter if exists
    const searchInput = document.getElementById('studentSearchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    if (searchTerm) {
        students = students.filter(student => 
            student.name.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm)
        );
    }
    
    displayStudentsTable(students);
}

// Debounced version of filterStudentsByClass
const debouncedFilterStudentsByClass = debounce(filterStudentsByClass, 300);

// Search students by name
function searchStudents() {
    const searchInput = document.getElementById('studentSearchInput');
    const classFilter = document.getElementById('classCodeFilter');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedClassCode = classFilter ? classFilter.value : '';
    
    let students;
    if (selectedClassCode) {
        students = getClassStudents(selectedClassCode);
    } else {
        students = getClassStudents();
    }
    
    if (searchTerm) {
        students = students.filter(student => 
            student.name.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm)
        );
    }
    
    displayStudentsTable(students);
}

// Debounced version of searchStudents
const debouncedSearchStudents = debounce(searchStudents, 300);

function updateTeacherNavActive(activeSection) {
    // Actualizar botones de navegación en todas las vistas del docente
    const views = ['teacherView', 'teacherMessagesView', 'teacherRiskAlertsView', 'teacherStudentsView', 'teacherNotificationsView', 'teacherClassCodesView', 'teacherGrowthSpacesView'];
    views.forEach(viewId => {
        const view = document.getElementById(viewId);
        if (!view) return;
        
        const nav = view.querySelector('.teacher-nav');
        if (!nav) return;
        
        const buttons = nav.querySelectorAll('.nav-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Activar el botón correspondiente
        if (activeSection === 'dashboard') {
            const dashboardBtn = nav.querySelector('.nav-btn:first-child');
            if (dashboardBtn) dashboardBtn.classList.add('active');
        } else if (activeSection === 'messages') {
            const messagesBtn = Array.from(nav.querySelectorAll('.nav-btn')).find(btn => 
                btn.textContent.includes('Mensajes')
            );
            if (messagesBtn) messagesBtn.classList.add('active');
        } else if (activeSection === 'riskAlerts') {
            const riskAlertsBtn = Array.from(nav.querySelectorAll('.nav-btn')).find(btn => 
                btn.textContent.includes('Alertas de Riesgo')
            );
            if (riskAlertsBtn) riskAlertsBtn.classList.add('active');
        } else if (activeSection === 'students') {
            const studentsBtn = Array.from(nav.querySelectorAll('.nav-btn')).find(btn => 
                btn.textContent.includes('Estudiantes')
            );
            if (studentsBtn) studentsBtn.classList.add('active');
        } else if (activeSection === 'notifications') {
            const notificationsBtn = Array.from(nav.querySelectorAll('.nav-btn')).find(btn => 
                btn.textContent.includes('Notificaciones')
            );
            if (notificationsBtn) notificationsBtn.classList.add('active');
        } else if (activeSection === 'classCodes') {
            const classCodesBtn = Array.from(nav.querySelectorAll('.nav-btn')).find(btn => 
                btn.textContent.includes('Códigos')
            );
            if (classCodesBtn) classCodesBtn.classList.add('active');
        } else if (activeSection === 'growthSpaces') {
            const growthSpacesBtn = Array.from(nav.querySelectorAll('.nav-btn')).find(btn => 
                btn.textContent.includes('Crecimiento')
            );
            if (growthSpacesBtn) growthSpacesBtn.classList.add('active');
        }
    });
}

// Sistema de tabs en login
function initRequestDemoForm() {
    const requestDemoForm = document.getElementById('requestDemoForm');
    if (requestDemoForm) {
        requestDemoForm.addEventListener('submit', handleRequestDemo);
    }
}

async function handleRequestDemo(e) {
    e.preventDefault();
    
    const name = document.getElementById('demoName').value.trim();
    const email = document.getElementById('demoEmail').value.trim();
    const phone = document.getElementById('demoPhone').value.trim();
    const school = document.getElementById('demoSchool').value.trim();
    
    // Validar campos
    if (!name || !email || !phone || !school) {
        showMessage('Por favor, completa todos los campos requeridos.', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showMessage('Por favor, ingresa un email válido.', 'error');
        return;
    }
    
    // Deshabilitar botón mientras se procesa
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
    }

    try {
        // Intentar primero con PHP (más simple, funciona en Hostalia)
        // Si falla, intentar con la API
        let result;
        let phpAvailable = false;
        
        try {
            // Enviar directamente al script PHP
            const formData = new FormData();
            formData.append('name', sanitizeInput(name));
            formData.append('email', sanitizeInput(email));
            formData.append('phone', sanitizeInput(phone));
            formData.append('school', sanitizeInput(school));

            const response = await fetch('send-email.php', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                result = await response.json();
                phpAvailable = true;
            } else if (response.status === 404) {
                // Archivo PHP no encontrado, usar API silenciosamente
                phpAvailable = false;
            } else {
                throw new Error('PHP no disponible, intentando con API');
            }
        } catch (phpError) {
            // Si PHP falla (404, error de red, etc.), usar la API como respaldo
            phpAvailable = false;
            // No mostrar el error en consola si es un 404 esperado
            if (!phpError.message.includes('404') && !phpError.message.includes('Failed to fetch')) {
                console.log('PHP no disponible, usando localStorage:', phpError);
            }
        }
        
        // Si PHP no está disponible, usar localStorage
        if (!phpAvailable) {
            if (typeof storage !== 'undefined' && storage.submitDemoRequest) {
                result = await storage.submitDemoRequest({
                    name: sanitizeInput(name),
                    email: sanitizeInput(email),
                    phone: sanitizeInput(phone),
                    school: sanitizeInput(school)
                });
            } else {
                // Fallback: guardar en localStorage directamente
                const demoRequests = JSON.parse(localStorage.getItem('demoRequests') || '[]');
                demoRequests.push({
                    name: sanitizeInput(name),
                    email: sanitizeInput(email),
                    phone: sanitizeInput(phone),
                    school: sanitizeInput(school),
                    timestamp: new Date().toISOString()
                });
                localStorage.setItem('demoRequests', JSON.stringify(demoRequests));
                result = { success: true, message: 'Solicitud guardada localmente' };
            }
        }

        if (result.success) {
            // Mostrar mensaje de éxito
            showMessage('✅ Tu solicitud de demo ha sido enviada exitosamente. Nos pondremos en contacto contigo pronto.', 'success');
            
            // Limpiar formulario
            e.target.reset();
            
            // Volver a la landing page después de 2 segundos
            setTimeout(() => {
                showLandingView();
            }, 2000);
        } else {
            throw new Error(result.message || 'Error al enviar solicitud');
        }
    } catch (error) {
        console.error('Error al enviar solicitud de demo:', error);
        showMessage(error.message || 'Error al enviar la solicitud. Por favor, intenta nuevamente.', 'error');
        
        // Fallback a localStorage si el servidor no está disponible
        if (error.message.includes('conectar') || error.message.includes('NetworkError')) {
            console.warn('Servidor no disponible, guardando localmente');
            const demoRequests = JSON.parse(localStorage.getItem('demoRequests') || '[]');
            const newRequest = {
                id: Date.now().toString(),
                name: sanitizeInput(name),
                email: sanitizeInput(email),
                phone: sanitizeInput(phone),
                school: sanitizeInput(school),
                timestamp: new Date().toISOString(),
                status: 'pending'
            };
            
            demoRequests.push(newRequest);
            localStorage.setItem('demoRequests', JSON.stringify(demoRequests));
            
            showMessage('✅ Solicitud guardada localmente. Se enviará cuando el servidor esté disponible.', 'info');
            
            setTimeout(() => {
                showLandingView();
            }, 2000);
        }
    } finally {
        // Restaurar botón
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    }
}

function initLogin() {
    // Ya no hay tabs ni formulario de registro, solo login
    
    // Setup real-time validation for login form
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const loginRoleGroup = document.getElementById('loginRoleGroup');
    const loginRole = document.getElementById('loginRole');
    
    // Ocultar/mostrar selector de tipo de usuario según el email
    if (loginEmail && loginRoleGroup && loginRole) {
        loginEmail.addEventListener('input', function() {
            const email = this.value.trim();
            const isOwner = email === 'munay@munay.com';
            
            if (isOwner) {
                // Ocultar el selector de tipo de usuario para el dueño
                loginRoleGroup.style.display = 'none';
                loginRole.removeAttribute('required');
                loginRole.value = 'teacher'; // Valor por defecto (no se usa realmente)
            } else {
                // Mostrar el selector para otros usuarios
                loginRoleGroup.style.display = 'block';
                loginRole.setAttribute('required', 'required');
                if (loginRole.value === 'teacher' && email !== 'munay@munay.com') {
                    loginRole.value = '';
                }
            }
        });
        
        // También verificar al cargar la página si ya hay un email
        if (loginEmail.value.trim() === 'munay@munay.com') {
            loginRoleGroup.style.display = 'none';
            loginRole.removeAttribute('required');
            loginRole.value = 'teacher';
        }
    }
    
    if (loginEmail) {
        setupRealTimeValidation(loginEmail, (value) => {
            if (!value) return validateRequired(value);
            if (!validateEmail(value)) {
                return { valid: false, message: 'Ingresa un email válido' };
            }
            return { valid: true, message: '' };
        });
    }
    
    if (loginPassword) {
        setupRealTimeValidation(loginPassword, validateRequired);
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

// Manejar login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const roleSelect = document.getElementById('loginRole');
    let role = roleSelect ? roleSelect.value : '';

    // Detectar automáticamente el tipo de usuario para el dueño
    const isOwner = email === 'munay@munay.com';
    if (isOwner) {
        // El dueño no necesita seleccionar tipo de usuario
        role = 'teacher'; // Se usa 'teacher' internamente pero es el dueño
    }

    // Deshabilitar botón mientras se procesa
    const loginBtn = document.querySelector('#loginForm button[type="submit"]');
    const originalBtnText = loginBtn ? loginBtn.textContent : '';
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.textContent = 'Iniciando sesión...';
    }

    try {
        // Validar campos antes de enviar
        if (!email || !password) {
            throw new Error('Por favor, completa todos los campos');
        }

        let result;
        let user;
        let token;

        // Validar que se haya seleccionado un rol (excepto para el dueño)
        if (!isOwner && (!role || role === '')) {
            throw new Error('Por favor, selecciona un tipo de usuario (Docente o Estudiante)');
        }

        // Usar AuthService (solo backend)
        if (typeof AuthService === 'undefined' || !AuthService.login) {
            throw new Error('El sistema de autenticación no está disponible. Por favor, recarga la página.');
        }
        
        console.log('🔄 Iniciando sesión con el backend...');
        result = await AuthService.login(email, password, role);
            
            if (!result || !result.success) {
                throw new Error(result?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
            }

        user = result.user;
        token = result.token;
            
            if (!user) {
                throw new Error('No se recibieron los datos del usuario. Por favor, intenta nuevamente.');
        }
        
        console.log('✅ Login exitoso con el backend');
        
        // Verificar que el token se haya guardado
        if (token) {
            console.log('✅ Token guardado correctamente');
        } else {
            console.warn('⚠️ No se recibió token del servidor');
        }
        
        // Verificar que el rol coincida (excepto para el dueño que se autodetecta)
        // Para el dueño, siempre es 'teacher' internamente pero se trata como owner
        if (!isOwner && user.role !== role) {
            throw new Error(`El usuario es ${user.role === 'student' ? 'estudiante' : 'profesor'}, pero seleccionaste ${role === 'student' ? 'estudiante' : 'profesor'}.`);
        }
        
        // Si es el dueño, asegurar que se trate como owner aunque tenga role 'teacher'
        if (isOwner && user.email === 'munay@munay.com') {
            console.log('✅ Autenticación del dueño detectada');
        }

        // Guardar usuario en memoria
        currentUser = user;
        
        // Restaurar botón inmediatamente
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.textContent = originalBtnText;
        }
        
        // Verificar si necesita onboarding
        if (shouldShowOnboarding(user)) {
            showOnboarding();
        } else {
            // Mostrar la vista correspondiente según el rol
            if (currentUser.role === 'student') {
                showStudentView();
                initStudentDashboard();
            } else if (currentUser.role === 'teacher') {
                // Si es munay@munay.com, mostrar vista de owner (dueño de la empresa)
                if (currentUser.email === 'munay@munay.com') {
                    showOwnerView();
                    // Actualizar URL
                    history.replaceState({ view: 'owner' }, '', '#owner');
                } else {
                    // admin@munay.com y otros profesores van al panel del docente
                    showTeacherView();
                    initTeacherDashboard();
                    // Actualizar URL
                    history.replaceState({ view: 'teacher' }, '', '#teacher');
                }
            }
        }
        
        // Mostrar mensaje de éxito
        showMessage(`¡Bienvenido, ${user.name}!`, 'success');
    } catch (error) {
        console.error('❌ Login error:', error);
        console.error('📍 Error details:', {
            message: error.message,
            stack: error.stack,
            email: email,
            role: role
        });
        
        // Mensaje de error más específico
        let errorMessage = 'Error al iniciar sesión. ';
        
        if (error.message.includes('conectar') || 
            error.message.includes('NetworkError') || 
            error.message.includes('Failed to fetch') ||
            error.message.includes('timeout') ||
            error.message.includes('TIMED_OUT') ||
            error.message.includes('El servidor no responde')) {
            errorMessage = 'No se puede conectar con el servidor backend. Verifica que el backend esté corriendo y la URL sea correcta.';
        } else if (error.message.includes('401') || error.message.includes('Credenciales')) {
            errorMessage = 'Credenciales incorrectas. Por favor, verifica tu email y contraseña.';
        } else if (error.message.includes('404')) {
            errorMessage += 'El servidor no está disponible. Por favor, contacta al administrador.';
        } else {
            errorMessage += error.message || 'Por favor, intenta nuevamente.';
        }
        
        showMessage(errorMessage, 'error');
        
        // Asegurar que el botón se restaure incluso si hay error
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.textContent = originalBtnText;
        }
    }
}

// Manejar registro
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;
    const studentCode = document.getElementById('studentCode').value.trim();
    const studentAge = document.getElementById('studentAge').value;
    const studentGender = document.getElementById('studentGender').value;

    // Deshabilitar botón mientras se procesa
    const regBtn = document.querySelector('#registerForm button[type="submit"]');
    const originalBtnText = regBtn ? regBtn.textContent : '';
    if (regBtn) {
        regBtn.disabled = true;
        regBtn.textContent = 'Registrando...';
    }

    // Validar campos requeridos
    if (!name) {
        showMessage('Por favor, ingresa tu nombre completo.', 'error');
        if (regBtn) {
            regBtn.disabled = false;
            regBtn.textContent = originalBtnText;
        }
        return;
    }

    if (!email) {
        showMessage('Por favor, ingresa tu email.', 'error');
        if (regBtn) {
            regBtn.disabled = false;
            regBtn.textContent = originalBtnText;
        }
        return;
    }

    if (!validateEmail(email)) {
        showMessage('Por favor, ingresa un email válido.', 'error');
        if (regBtn) {
            regBtn.disabled = false;
            regBtn.textContent = originalBtnText;
        }
        return;
    }

    // Validar contraseña - VALIDACIÓN CRÍTICA DE SEGURIDAD
    if (!password || typeof password !== 'string') {
        showMessage('La contraseña es obligatoria', 'error');
        document.getElementById('regPassword').focus();
        if (regBtn) {
            regBtn.disabled = false;
            regBtn.textContent = originalBtnText;
        }
        return;
    }
    
    if (password.length < 6) {
        showMessage('La contraseña debe tener al menos 6 caracteres. Por seguridad, no se permiten contraseñas cortas.', 'error');
        document.getElementById('regPassword').focus();
        document.getElementById('regPassword').classList.add('error');
        if (regBtn) {
            regBtn.disabled = false;
            regBtn.textContent = originalBtnText;
        }
        return;
    }
    
    // Validación adicional con la función
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        showMessage(passwordValidation.message, 'error');
        document.getElementById('regPassword').focus();
        document.getElementById('regPassword').classList.add('error');
        if (regBtn) {
            regBtn.disabled = false;
            regBtn.textContent = originalBtnText;
        }
        return;
    }

    if (role === 'student') {
        if (!studentCode) {
            showMessage('El código de clase es requerido para estudiantes.', 'error');
            if (regBtn) {
                regBtn.disabled = false;
                regBtn.textContent = originalBtnText;
            }
            return;
        }
        
        if (!studentAge || studentAge < 9 || studentAge > 17) {
            showMessage('Por favor, ingresa una edad válida entre 9 y 17 años.', 'error');
            if (regBtn) {
                regBtn.disabled = false;
                regBtn.textContent = originalBtnText;
            }
            return;
        }
        
        if (!studentGender) {
            showMessage('Por favor, selecciona tu género.', 'error');
            if (regBtn) {
                regBtn.disabled = false;
                regBtn.textContent = originalBtnText;
            }
            return;
        }
        
        // Verificar código de clase con localStorage
        try {
            let classResult;
            if (typeof storage !== 'undefined' && storage.getClassByCode) {
                classResult = await storage.getClassByCode(studentCode);
            } else {
                // Fallback: buscar en localStorage directamente
                const classes = JSON.parse(localStorage.getItem('classes') || '[]');
                const foundClass = classes.find(c => c.code === studentCode);
                classResult = {
                    success: !!foundClass,
                    data: foundClass || null
                };
            }
            if (!classResult.success || !classResult.data) {
                throw new Error('Código de clase no válido');
            }
        } catch (error) {
                showMessage('El código de clase no es válido.', 'error');
                if (regBtn) {
                    regBtn.disabled = false;
                    regBtn.textContent = originalBtnText;
                }
                return;
        }
    }

    // VALIDACIÓN FINAL DE SEGURIDAD
    if (!password || password.length < 6) {
        console.error('Intento de registro con contraseña inválida bloqueado');
        showMessage('Error de seguridad: La contraseña no cumple con los requisitos mínimos.', 'error');
        document.getElementById('regPassword').focus();
        if (regBtn) {
            regBtn.disabled = false;
            regBtn.textContent = originalBtnText;
        }
        return;
    }

    try {
        // Preparar datos del usuario
        const registerData = {
            name,
            email,
            password,
            role,
            classCode: role === 'student' ? studentCode : null,
            age: role === 'student' ? parseInt(studentAge) : null,
            gender: role === 'student' ? studentGender : null
        };

        let result;
        let newUser;
        let token;

        // Usar AuthService (solo backend)
        if (typeof AuthService === 'undefined' || !AuthService.register) {
            throw new Error('El sistema de autenticación no está disponible. Por favor, recarga la página.');
        }
        
        console.log('🔄 Registrando usuario con el backend...');
        result = await AuthService.register(registerData);
            
            if (!result || !result.success) {
                throw new Error(result?.message || 'Error al registrarse. Por favor, intenta nuevamente.');
            }

        newUser = result.user;
        token = result.token;
            
            if (!newUser) {
                throw new Error('No se recibieron los datos del usuario. Por favor, intenta nuevamente.');
        }

        console.log('✅ Registro exitoso con el backend');

        // Verificar que el token se haya guardado
        if (token) {
            console.log('✅ Token guardado correctamente');
        } else {
            console.warn('⚠️ No se recibió token del servidor');
        }
        
        // Guardar usuario en memoria
        currentUser = newUser;
        
        showMessage('Registro exitoso. Redirigiendo...', 'success');
        
        setTimeout(() => {
            // Mostrar onboarding para usuarios nuevos
            if (shouldShowOnboarding(newUser)) {
                showOnboarding();
            } else {
                if (role === 'student') {
                    showStudentView();
                    initStudentDashboard();
                } else if (role === 'teacher') {
                    showTeacherView();
                    initTeacherDashboard();
                }
            }
        }, 1500);
    } catch (error) {
        console.error('Register error:', error);
        showMessage(error.message || 'Error al registrar. Por favor, intenta nuevamente.', 'error');
        
        // Fallback a localStorage si el servidor no está disponible
        if (error.message.includes('conectar') || error.message.includes('NetworkError')) {
            console.warn('Servidor no disponible, usando localStorage como fallback');
            
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            if (users.find(u => u.email === email)) {
                showMessage('Este email ya está registrado localmente.', 'error');
                if (regBtn) {
                    regBtn.disabled = false;
                    regBtn.textContent = originalBtnText;
                }
                return;
            }

            const newUser = {
                id: Date.now().toString(),
                name: name,
                email: email,
                password: password,
                role: role,
                classCode: role === 'student' ? studentCode : null,
                age: role === 'student' ? parseInt(studentAge) : null,
                gender: role === 'student' ? studentGender : null,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            // No usar localStorage para currentUser, solo en memoria
            currentUser = newUser;
            
            showMessage('Registro local exitoso (modo offline).', 'info');
            
            setTimeout(() => {
                if (shouldShowOnboarding(newUser)) {
                    showOnboarding();
                } else {
                    if (role === 'student') {
                        showStudentView();
                        initStudentDashboard();
                    } else if (role === 'teacher') {
                        showTeacherView();
                        initTeacherDashboard();
                    }
                }
            }, 1500);
        }
    } finally {
        // Restaurar botón
        if (regBtn) {
            regBtn.disabled = false;
            regBtn.textContent = originalBtnText;
        }
    }
}

// Generar código de clase
function generateClassCode() {
    return 'CLS' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

// Obtener usuario actual - Solo Backend
// localStorage solo se usa para cachear el usuario después de obtenerlo del backend
async function getCurrentUser() {
    // Si ya tenemos el usuario en memoria, devolverlo
    if (currentUser) {
        return currentUser;
    }
    
    // Obtener usuario desde el backend (solo backend, sin localStorage)
    if (typeof AuthService !== 'undefined' && AuthService.getCurrentUser) {
        const user = AuthService.getCurrentUser();
        if (user) {
            currentUser = user;
            return currentUser;
        }
    }
    
    // Si no hay AuthService o no hay usuario, verificar token en localStorage
    // Si hay token, intentar obtener usuario del backend
    const token = localStorage.getItem('authToken');
    if (token && typeof apiRequest !== 'undefined') {
        try {
            const result = await apiRequest('/auth/me');
            if (result && result.success && result.data) {
                currentUser = result.data;
                // Guardar en localStorage para futuras referencias (solo lectura)
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                return currentUser;
            }
        } catch (error) {
            // Si falla, limpiar token inválido
            console.warn('Token inválido o expirado, limpiando sesión');
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            currentUser = null;
            return null;
        }
    }
    
    return null;
}

// ========== GESTIÓN DE SESIÓN ==========

// Cerrar sesión
async function logout() {
    try {
        // Limpiar sesión del backend (si AuthService está disponible)
        if (typeof AuthService !== 'undefined' && AuthService.logout) {
            AuthService.logout();
        }
        
        // Limpiar token y usuario de localStorage
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        
        // Limpiar usuario de variable global
        currentUser = null;
        
        // Ocultar todas las vistas
        document.getElementById('studentView').classList.add('hidden');
        document.getElementById('studentMessagesView').classList.add('hidden');
        document.getElementById('studentProfileView').classList.add('hidden');
        document.getElementById('teacherView').classList.add('hidden');
        document.getElementById('teacherMessagesView').classList.add('hidden');
        document.getElementById('teacherStudentsView').classList.add('hidden');
        document.getElementById('teacherNotificationsView').classList.add('hidden');
        document.getElementById('teacherClassCodesView').classList.add('hidden');
        document.getElementById('teacherGrowthSpacesView').classList.add('hidden');
        document.getElementById('ownerView').classList.add('hidden');
        
        // Mostrar landing
        showLandingView();
        
        // Forzar actualización de botones después de limpiar todo
        // Usar setTimeout para asegurar que se ejecute después de que showLandingView termine
        setTimeout(async () => {
            // Verificar que realmente no hay usuario antes de actualizar
            const user = await getCurrentUser();
            if (!user) {
                updateLandingPageButtons();
            }
        }, 100);
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        // Aún así, limpiar localmente
        if (typeof AuthService !== 'undefined' && AuthService.logout) {
            AuthService.logout();
        }
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        currentUser = null;
        showLandingView();
        setTimeout(() => {
            updateLandingPageButtons();
        }, 100);
    }
}

// ========== UTILIDADES DE INTERFAZ ==========

// Mostrar mensajes
function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    if (messageEl) {
        messageEl.textContent = text;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'block';
        
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }
}

// ========== STUDENT DASHBOARD ==========
function initStudentDashboard() {
    if (!currentUser || !currentUser.id || currentUser.role !== 'student') {
        console.warn('initStudentDashboard: currentUser no válido o no es estudiante');
        return;
    }

    // Actualizar nombre en todas las vistas de estudiante (incluye h2 de bienvenida)
    updateStudentName();
    
    loadSurveys();
    loadActivities();
    
    // Verificar y otorgar recompensas basadas en comportamientos
    // Solo después de asegurar que currentUser está correctamente establecido
    checkAndAwardRewards();
    
    // Inicializar formulario de envío de mensaje
    const sendMessageForm = document.getElementById('sendMessageForm');
    if (sendMessageForm) {
        sendMessageForm.removeEventListener('submit', handleSendMessage);
        sendMessageForm.addEventListener('submit', handleSendMessage);
    }
}

// Actualizar nombre del estudiante en todas las vistas
function updateStudentName() {
    if (!currentUser || currentUser.role !== 'student') return;
    
    // Actualizar nombre en el botón de perfil del header
    const studentNameHeaders = document.querySelectorAll('#studentNameHeader');
    studentNameHeaders.forEach(el => {
        el.textContent = currentUser.name;
    });
    
    // Actualizar avatar en el botón de perfil del header
    const studentAvatarHeaders = document.querySelectorAll('#studentAvatarHeader');
    const savedAvatar = currentUser.avatar || '🧑‍🎓';
    studentAvatarHeaders.forEach(el => {
        el.textContent = savedAvatar;
    });
    
    // Agregar efectos hover a los botones de perfil
    const profileButtons = document.querySelectorAll('.student-profile-btn');
    profileButtons.forEach(btn => {
        // Remover event listeners anteriores si existen
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        // Agregar nuevo onclick
        newBtn.onclick = function() {
            showStudentProfileView();
        };
        
        // Agregar efectos hover
        newBtn.onmouseover = function() {
            this.style.background = 'linear-gradient(135deg, #7BA680 0%, #8FC4D9 100%)';
            this.style.color = 'white';
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px rgba(163,201,168,0.3)';
            const avatar = this.querySelector('#studentAvatarHeader');
            if (avatar) {
                avatar.style.background = 'rgba(255,255,255,0.2)';
            }
        };
        newBtn.onmouseout = function() {
            this.style.background = 'linear-gradient(135deg, #f0f4ff 0%, #e8eef5 100%)';
            this.style.color = '#1a2332';
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 8px rgba(163,201,168,0.15)';
            const avatar = this.querySelector('#studentAvatarHeader');
            if (avatar) {
                avatar.style.background = 'white';
            }
        };
    });
    
    // Actualizar nombre en el h2 de bienvenida
    const welcomeNameEl = document.getElementById('welcomeName');
    if (welcomeNameEl) {
        welcomeNameEl.textContent = currentUser.name.split(' ')[0];
    }
    
    // Actualizar saludo según género
    const welcomeGreetingEl = document.getElementById('welcomeGreeting');
    if (welcomeGreetingEl) {
        if (currentUser.gender === 'femenino') {
            welcomeGreetingEl.textContent = 'Bienvenida';
        } else {
            welcomeGreetingEl.textContent = 'Bienvenido';
        }
    }
}

function loadSurveys() {
    const surveysContainer = document.getElementById('surveysContainer');
    const studentAge = currentUser && currentUser.age ? currentUser.age : null;
    const surveys = getAvailableSurveys(studentAge);
    const studentResponses = getStudentResponses();

    surveysContainer.innerHTML = '';

    if (surveys.length === 0) {
        surveysContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                <p style="font-size: 1.1em;">No hay encuestas disponibles en este momento.</p>
            </div>
        `;
        return;
    }

    surveys.forEach((survey, index) => {
        const isCompleted = studentResponses.some(r => r.surveyId === survey.id);
        // Buscar la respuesta más reciente (última fecha de completado)
        const responsesForSurvey = studentResponses.filter(r => r.surveyId === survey.id);
        const response = responsesForSurvey.length > 0 
            ? responsesForSurvey.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0]
            : null;
        const score = response ? response.score : null;
        
        const surveyCard = document.createElement('div');
        surveyCard.className = `survey-card ${isCompleted ? 'completed' : ''}`;
        surveyCard.style.opacity = '0';
        surveyCard.style.transform = 'translateY(20px)';
        surveyCard.onclick = () => openSurveyModal(survey);
        
        const icon = isCompleted ? '✅' : '📝';
        const statusIcon = isCompleted ? '✓' : '⏳';
        
        surveyCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                <h4>${icon} ${sanitizeInput(survey.title || '')}</h4>
            </div>
            <p>${sanitizeInput(survey.description || '')}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px;">
                <div class="survey-status ${isCompleted ? 'completed' : 'pending'}">
                    <span>${statusIcon}</span>
                    <span>${isCompleted ? 'Completada' : 'Pendiente'}</span>
                </div>
                ${isCompleted && response && response.completedAt ? `
                    <span style="font-size: 0.8em; color: #999;">
                        Última vez: ${new Date(response.completedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                ` : ''}
            </div>
        `;
        
        surveysContainer.appendChild(surveyCard);
        
        // Animación de entrada
        setTimeout(() => {
            surveyCard.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            surveyCard.style.opacity = '1';
            surveyCard.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // Actualizar estadísticas
    updateStudentDashboardStats();
}

function loadActivities() {
    const activitiesContainer = document.getElementById('activitiesContainer');
    const activities = getAvailableActivities();
    const studentActivities = getStudentActivities();

    activitiesContainer.innerHTML = '';

    if (activities.length === 0) {
        activitiesContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                <p style="font-size: 1.1em;">No hay actividades disponibles en este momento.</p>
            </div>
        `;
        return;
    }

    activities.forEach((activity, index) => {
        const isCompleted = studentActivities.some(a => a.activityId === activity.id);
        // Buscar la actividad más reciente (última fecha de completado)
        const activitiesForThis = studentActivities.filter(a => a.activityId === activity.id);
        const completedActivity = activitiesForThis.length > 0
            ? activitiesForThis.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0]
            : null;
        const testScore = completedActivity ? completedActivity.testScore : null;
        const simulatorScore = completedActivity && completedActivity.simulatorResults ? 
            completedActivity.simulatorResults.averageScore : null;
        const score = testScore !== undefined ? testScore : simulatorScore;
        
        const activityCard = document.createElement('div');
        activityCard.className = `activity-card ${isCompleted ? 'completed' : ''}`;
        activityCard.style.opacity = '0';
        activityCard.style.transform = 'translateY(20px)';
        activityCard.onclick = () => openActivityModal(activity);
        
        // Determinar icono según tipo
        let icon = '🎯';
        if (activity.type === 'reflection') icon = '💭';
        else if (activity.type === 'test') {
            if (activity.title.includes('Empatía')) icon = '💚';
            else if (activity.title.includes('Autocuidado')) icon = '🧘';
            else if (activity.title.includes('Conflictos')) icon = '🤝';
            else icon = '📝';
        } else if (activity.type === 'simulator') icon = '🧠';
        
        const statusIcon = isCompleted ? '✓' : '⏳';
        
        activityCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                <h4>${icon} ${sanitizeInput(activity.title || '')}</h4>
            </div>
            <p>${sanitizeInput(activity.description || '')}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px;">
                <div class="survey-status ${isCompleted ? 'completed' : 'pending'}">
                    <span>${statusIcon}</span>
                    <span>${isCompleted ? 'Completada' : 'Pendiente'}</span>
                </div>
                ${isCompleted && completedActivity && completedActivity.completedAt ? `
                    <span style="font-size: 0.8em; color: #999;">
                        Última vez: ${new Date(completedActivity.completedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                ` : ''}
            </div>
        `;
        
        activitiesContainer.appendChild(activityCard);
        
        // Animación de entrada
        setTimeout(() => {
            activityCard.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            activityCard.style.opacity = '1';
            activityCard.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // Actualizar estadísticas
    updateStudentDashboardStats();
}

// Actualizar estadísticas del dashboard del estudiante
function updateStudentDashboardStats() {
    if (!currentUser) return;
    
    const responses = getStudentResponses();
    const activities = getStudentActivities();
    const rewards = getStudentRewards();
    
    // Contar badges totales
    let badgeCount = 0;
    Object.values(rewards).forEach(category => {
        if (category) {
            Object.values(category).forEach(badge => {
                if (badge && badge.earned) badgeCount++;
            });
        }
    });
    
    // Actualizar elementos del DOM
    const surveyCountEl = document.getElementById('studentSurveyCount');
    const activityCountEl = document.getElementById('studentActivityCount');
    const badgeCountEl = document.getElementById('studentBadgeCount');
    
    if (surveyCountEl) {
        surveyCountEl.textContent = responses.length;
        surveyCountEl.style.color = responses.length > 0 ? '#A3C9A8' : '#999';
    }
    
    if (activityCountEl) {
        activityCountEl.textContent = activities.length;
        activityCountEl.style.color = activities.length > 0 ? '#A3C9A8' : '#999';
    }
    
    if (badgeCountEl) {
        badgeCountEl.textContent = badgeCount;
        badgeCountEl.style.color = badgeCount > 0 ? '#A3C9A8' : '#999';
    }
}

// ========== SISTEMA DE RECOMPENSAS EMOCIONALES ==========

// Definir categorías y badges de recompensas
function getRewardCategories() {
    return {
        'empatia': {
            title: '💚 Empatía',
            description: 'Reconocimiento por demostrar comprensión y apoyo hacia otros',
            badges: [
                { id: 'empath_first', name: 'Primer Mensaje', icon: '💬', requirement: 'send_positive_message', count: 1 },
                { id: 'empath_helper', name: 'Ayudante', icon: '🤝', requirement: 'send_positive_message', count: 5 },
                { id: 'empath_compassionate', name: 'Compasivo', icon: '❤️', requirement: 'send_positive_message', count: 10 },
                { id: 'empath_champion', name: 'Campeón', icon: '🌟', requirement: 'send_positive_message', count: 20 },
                { id: 'empath_master', name: 'Maestro', icon: '👑', requirement: 'send_positive_message', count: 50 }
            ]
        },
        'autorregulacion': {
            title: '🧘 Autorregulación',
            description: 'Reconocimiento por gestionar emociones y comportamientos de forma positiva',
            badges: [
                { id: 'reg_first_survey', name: 'Primer Paso', icon: '📝', requirement: 'complete_survey', count: 1 },
                { id: 'reg_consistent', name: 'Consistente', icon: '📊', requirement: 'complete_survey', count: 5 },
                { id: 'reg_dedicated', name: 'Dedicado', icon: '⭐', requirement: 'complete_survey', count: 10 },
                { id: 'reg_improved', name: 'Mejora Continua', icon: '📈', requirement: 'improve_score', count: 3 },
                { id: 'reg_master', name: 'Maestro', icon: '🏆', requirement: 'complete_survey', count: 20 },
                { id: 'reg_expert', name: 'Experto', icon: '🎓', requirement: 'complete_survey', count: 30 },
                { id: 'reg_grandmaster', name: 'Gran Maestro', icon: '👑', requirement: 'complete_survey', count: 50 }
            ]
        },
        'resiliencia': {
            title: '💪 Resiliencia',
            description: 'Reconocimiento por superar dificultades y mantener actitud positiva',
            badges: [
                { id: 'resil_first_activity', name: 'Iniciado', icon: '🎯', requirement: 'complete_activity', count: 1 },
                { id: 'resil_persistent', name: 'Persistente', icon: '🔥', requirement: 'complete_activity', count: 5 },
                { id: 'resil_warrior', name: 'Guerrero', icon: '⚔️', requirement: 'complete_activity', count: 10 },
                { id: 'resil_bounce_back', name: 'Recuperación', icon: '🔄', requirement: 'recover_from_low', count: 1 },
                { id: 'resil_legend', name: 'Leyenda', icon: '✨', requirement: 'complete_activity', count: 20 },
                { id: 'resil_veteran', name: 'Veterano', icon: '🎖️', requirement: 'complete_activity', count: 30 },
                { id: 'resil_champion', name: 'Campeón', icon: '🏅', requirement: 'complete_activity', count: 50 }
            ]
        },
        'continuidad': {
            title: '📅 Continuidad',
            description: 'Reconocimiento por mantener un uso constante y regular de la plataforma',
            badges: [
                { id: 'cont_day_1', name: 'Día Uno', icon: '🌱', requirement: 'days_consecutive', count: 1 },
                { id: 'cont_week_streak', name: 'Semana Activa', icon: '📆', requirement: 'days_consecutive', count: 7 },
                { id: 'cont_biweekly', name: 'Quincena', icon: '🗓️', requirement: 'days_consecutive', count: 14 },
                { id: 'cont_month_streak', name: 'Mes Completo', icon: '📅', requirement: 'days_consecutive', count: 30 },
                { id: 'cont_2months', name: 'Dos Meses', icon: '📊', requirement: 'days_consecutive', count: 60 },
                { id: 'cont_3months', name: 'Trimestre', icon: '📈', requirement: 'days_consecutive', count: 90 },
                { id: 'cont_weekly_4', name: '4 Semanas', icon: '⏰', requirement: 'weeks_consecutive', count: 4 },
                { id: 'cont_weekly_8', name: '8 Semanas', icon: '⏳', requirement: 'weeks_consecutive', count: 8 },
                { id: 'cont_monthly_3', name: '3 Meses', icon: '🗓️', requirement: 'months_consecutive', count: 3 },
                { id: 'cont_monthly_6', name: 'Semestre', icon: '📆', requirement: 'months_consecutive', count: 6 },
                { id: 'cont_monthly_12', name: 'Año Completo', icon: '🎉', requirement: 'months_consecutive', count: 12 }
            ]
        },
        'variedad': {
            title: '🎨 Variedad',
            description: 'Reconocimiento por explorar diferentes tipos de actividades y funcionalidades',
            badges: [
                { id: 'var_test_types', name: 'Explorador', icon: '🔍', requirement: 'different_test_types', count: 3 },
                { id: 'var_all_tests', name: 'Completo', icon: '✅', requirement: 'different_test_types', count: 4 },
                { id: 'var_activities', name: 'Versátil', icon: '🎭', requirement: 'different_activity_types', count: 3 },
                { id: 'var_survey_activity', name: 'Equilibrado', icon: '⚖️', requirement: 'both_survey_activity', count: 1 },
                { id: 'var_complete_all', name: 'Omnívoro', icon: '🌟', requirement: 'complete_all_types', count: 1 },
                { id: 'var_reflection', name: 'Reflexivo', icon: '💭', requirement: 'complete_reflections', count: 5 },
                { id: 'var_simulator', name: 'Estratega', icon: '🧠', requirement: 'complete_simulators', count: 3 }
            ]
        },
        'compromiso': {
            title: '🔥 Compromiso',
            description: 'Reconocimiento por dedicación y compromiso con el bienestar personal',
            badges: [
                { id: 'commit_daily_user', name: 'Usuario Diario', icon: '🌅', requirement: 'activities_7_days', count: 7 },
                { id: 'commit_active_week', name: 'Semana Activa', icon: '📊', requirement: 'activities_week', count: 5 },
                { id: 'commit_monthly_goal', name: 'Meta Mensual', icon: '🎯', requirement: 'activities_month', count: 10 },
                { id: 'commit_quarter_goal', name: 'Meta Trimestral', icon: '🏹', requirement: 'activities_quarter', count: 30 },
                { id: 'commit_total_50', name: 'Cincuentón', icon: '💯', requirement: 'total_interactions', count: 50 },
                { id: 'commit_total_100', name: 'Centenario', icon: '💎', requirement: 'total_interactions', count: 100 },
                { id: 'commit_total_200', name: 'Bicentenario', icon: '👑', requirement: 'total_interactions', count: 200 },
                { id: 'commit_total_500', name: 'Maestro Supremo', icon: '⭐', requirement: 'total_interactions', count: 500 }
            ]
        },
        'mejora': {
            title: '📈 Mejora Continua',
            description: 'Reconocimiento por mostrar progreso y crecimiento en el bienestar',
            badges: [
                { id: 'improv_streak_2', name: 'En Ascenso', icon: '⬆️', requirement: 'improve_streak', count: 2 },
                { id: 'improv_streak_5', name: 'Tendencia Positiva', icon: '📊', requirement: 'improve_streak', count: 5 },
                { id: 'improv_streak_10', name: 'Crecimiento Constante', icon: '📈', requirement: 'improve_streak', count: 10 },
                { id: 'improv_total_5', name: '5 Mejoras', icon: '🎯', requirement: 'improve_score', count: 5 },
                { id: 'improv_total_10', name: '10 Mejoras', icon: '🎖️', requirement: 'improve_score', count: 10 },
                { id: 'improv_total_20', name: '20 Mejoras', icon: '🏆', requirement: 'improve_score', count: 20 },
                { id: 'improv_high_score', name: 'Alto Rendimiento', icon: '💪', requirement: 'reach_high_score', count: 80 },
                { id: 'improv_maintain_high', name: 'Mantener Excelencia', icon: '🌟', requirement: 'maintain_high_score', count: 5 }
            ]
        }
    };
}

// Obtener recompensas del estudiante
function getStudentRewards() {
    if (!currentUser || !currentUser.id || currentUser.role !== 'student') {
        return {};
    }
    const rewards = JSON.parse(localStorage.getItem('studentRewards') || '{}');
    // Asegurar que solo retornamos recompensas del estudiante actual
    return rewards[currentUser.id] || {};
}

// Guardar recompensas del estudiante
function saveStudentRewards(rewards) {
    if (!currentUser || !currentUser.id || currentUser.role !== 'student') {
        console.warn('saveStudentRewards: currentUser no válido o no es estudiante');
        return;
    }
    const allRewards = JSON.parse(localStorage.getItem('studentRewards') || '{}');
    // Asegurar que solo guardamos recompensas para el estudiante actual
    allRewards[currentUser.id] = rewards;
    localStorage.setItem('studentRewards', JSON.stringify(allRewards));
}

// Otorgar una recompensa
function awardBadge(category, badgeId, level = 1) {
    if (!currentUser) return false;
    const rewards = getStudentRewards();
    
    if (!rewards[category]) {
        rewards[category] = {};
    }
    
    // Si ya tiene el badge, verificar si puede subir de nivel
    if (rewards[category][badgeId]) {
        const currentLevel = rewards[category][badgeId].level || 1;
        if (level > currentLevel) {
            // Subir de nivel
            rewards[category][badgeId].level = level;
            rewards[category][badgeId].levelUpDate = new Date().toISOString();
            saveStudentRewards(rewards);
            return true; // Subió de nivel
        }
        return false; // Ya tiene este nivel o superior
    }
    
    // Otorgar el badge por primera vez
    rewards[category][badgeId] = {
        earned: true,
        level: level,
        date: new Date().toISOString()
    };
    
    saveStudentRewards(rewards);
    return true; // Nuevo badge otorgado
}

// Calcular el nivel actual de una insignia basado en el progreso
function calculateBadgeLevel(badge, currentProgress) {
    if (currentProgress < badge.count) return 0; // No ha alcanzado el nivel 1
    
    // Sistema de niveles: cada nivel requiere el doble del anterior
    let level = 1;
    let requiredForLevel = badge.count;
    
    while (currentProgress >= requiredForLevel) {
        level++;
        requiredForLevel = requiredForLevel * 2; // Cada nivel requiere el doble
    }
    
    return level - 1; // Retornar el nivel máximo alcanzado
}

// Verificar y otorgar recompensas basadas en comportamientos
function checkAndAwardRewards() {
    // Validar que currentUser existe y es un estudiante
    if (!currentUser || !currentUser.id || currentUser.role !== 'student') {
        console.warn('checkAndAwardRewards: currentUser no válido o no es estudiante');
        return;
    }
    
    const categories = getRewardCategories();
    let newBadgesAwarded = [];
    
    // Verificar recompensas de EMPATÍA
    const empathyBadges = categories.empatia.badges;
    empathyBadges.forEach(badge => {
        const count = getStudentPositiveMessageCount();
        if (count >= badge.count) {
            const currentLevel = calculateBadgeLevel(badge, count);
            const existingBadge = getBadgeInfo('empatia', badge.id);
            const existingLevel = existingBadge ? (existingBadge.level || 1) : 0;
            
            if (currentLevel > existingLevel) {
                if (awardBadge('empatia', badge.id, currentLevel)) {
                    newBadgesAwarded.push({ category: 'empatia', badge: badge, level: currentLevel });
                }
            }
        }
    });
    
    // Verificar recompensas de AUTORREGULACIÓN
    const regulationBadges = categories.autorregulacion.badges;
    const surveyCount = getStudentResponses().length;
    const scoreImprovements = getScoreImprovements();
    
    regulationBadges.forEach(badge => {
        let currentProgress = 0;
        
        if (badge.requirement === 'complete_survey') {
            currentProgress = surveyCount;
        } else if (badge.requirement === 'improve_score') {
            currentProgress = scoreImprovements;
        }
        
        if (currentProgress >= badge.count) {
            const currentLevel = calculateBadgeLevel(badge, currentProgress);
            const existingBadge = getBadgeInfo('autorregulacion', badge.id);
            const existingLevel = existingBadge ? (existingBadge.level || 1) : 0;
            
            if (currentLevel > existingLevel) {
                if (awardBadge('autorregulacion', badge.id, currentLevel)) {
                    newBadgesAwarded.push({ category: 'autorregulacion', badge: badge, level: currentLevel });
                }
            }
        }
    });
    
    // Verificar recompensas de RESILIENCIA
    const resilienceBadges = categories.resiliencia.badges;
    const activityCount = getStudentActivities().length;
    const recoveries = getRecoveriesFromLow();
    
    resilienceBadges.forEach(badge => {
        let currentProgress = 0;
        
        if (badge.requirement === 'complete_activity') {
            currentProgress = activityCount;
        } else if (badge.requirement === 'recover_from_low') {
            currentProgress = recoveries;
        }
        
        if (currentProgress >= badge.count) {
            const currentLevel = calculateBadgeLevel(badge, currentProgress);
            const existingBadge = getBadgeInfo('resiliencia', badge.id);
            const existingLevel = existingBadge ? (existingBadge.level || 1) : 0;
            
            if (currentLevel > existingLevel) {
                if (awardBadge('resiliencia', badge.id, currentLevel)) {
                    newBadgesAwarded.push({ category: 'resiliencia', badge: badge, level: currentLevel });
                }
            }
        }
    });
    
    // Verificar recompensas de CONTINUIDAD
    if (categories.continuidad) {
        const continuityBadges = categories.continuidad.badges;
        const consecutiveDays = getConsecutiveDays();
        const consecutiveWeeks = getConsecutiveWeeks();
        const consecutiveMonths = getConsecutiveMonths();
        
        continuityBadges.forEach(badge => {
            let currentProgress = 0;
            
            if (badge.requirement === 'days_consecutive') {
                currentProgress = consecutiveDays;
            } else if (badge.requirement === 'weeks_consecutive') {
                currentProgress = consecutiveWeeks;
            } else if (badge.requirement === 'months_consecutive') {
                currentProgress = consecutiveMonths;
            }
            
            if (currentProgress >= badge.count) {
                const currentLevel = calculateBadgeLevel(badge, currentProgress);
                const existingBadge = getBadgeInfo('continuidad', badge.id);
                const existingLevel = existingBadge ? (existingBadge.level || 1) : 0;
                
                if (currentLevel > existingLevel) {
                    if (awardBadge('continuidad', badge.id, currentLevel)) {
                        newBadgesAwarded.push({ category: 'continuidad', badge: badge, level: currentLevel });
                    }
                }
            }
        });
    }
    
    // Verificar recompensas de VARIEDAD
    if (categories.variedad) {
        const varietyBadges = categories.variedad.badges;
        const differentTests = getDifferentTestTypes();
        const differentActivities = getDifferentActivityTypes();
        const bothTypes = hasBothSurveyAndActivity();
        const allTypes = hasCompletedAllTypes();
        const reflections = getReflectionCount();
        const simulators = getSimulatorCount();
        
        varietyBadges.forEach(badge => {
            let currentProgress = 0;
            
            if (badge.requirement === 'different_test_types') {
                currentProgress = differentTests;
            } else if (badge.requirement === 'different_activity_types') {
                currentProgress = differentActivities;
            } else if (badge.requirement === 'both_survey_activity') {
                currentProgress = bothTypes ? 1 : 0;
            } else if (badge.requirement === 'complete_all_types') {
                currentProgress = allTypes ? 1 : 0;
            } else if (badge.requirement === 'complete_reflections') {
                currentProgress = reflections;
            } else if (badge.requirement === 'complete_simulators') {
                currentProgress = simulators;
            }
            
            if (currentProgress >= badge.count) {
                const currentLevel = calculateBadgeLevel(badge, currentProgress);
                const existingBadge = getBadgeInfo('variedad', badge.id);
                const existingLevel = existingBadge ? (existingBadge.level || 1) : 0;
                
                if (currentLevel > existingLevel) {
                    if (awardBadge('variedad', badge.id, currentLevel)) {
                        newBadgesAwarded.push({ category: 'variedad', badge: badge, level: currentLevel });
                    }
                }
            }
        });
    }
    
    // Verificar recompensas de COMPROMISO
    if (categories.compromiso) {
        const commitmentBadges = categories.compromiso.badges;
        const activities7Days = getActivitiesLast7Days();
        const activitiesWeek = getActivitiesThisWeek();
        const activitiesMonth = getActivitiesThisMonth();
        const activitiesQuarter = getActivitiesThisQuarter();
        const totalInteractions = getTotalInteractions();
        
        commitmentBadges.forEach(badge => {
            let currentProgress = 0;
            
            if (badge.requirement === 'activities_7_days') {
                currentProgress = activities7Days;
            } else if (badge.requirement === 'activities_week') {
                currentProgress = activitiesWeek;
            } else if (badge.requirement === 'activities_month') {
                currentProgress = activitiesMonth;
            } else if (badge.requirement === 'activities_quarter') {
                currentProgress = activitiesQuarter;
            } else if (badge.requirement === 'total_interactions') {
                currentProgress = totalInteractions;
            }
            
            if (currentProgress >= badge.count) {
                const currentLevel = calculateBadgeLevel(badge, currentProgress);
                const existingBadge = getBadgeInfo('compromiso', badge.id);
                const existingLevel = existingBadge ? (existingBadge.level || 1) : 0;
                
                if (currentLevel > existingLevel) {
                    if (awardBadge('compromiso', badge.id, currentLevel)) {
                        newBadgesAwarded.push({ category: 'compromiso', badge: badge, level: currentLevel });
                    }
                }
            }
        });
    }
    
    // Verificar recompensas de MEJORA
    if (categories.mejora) {
        const improvementBadges = categories.mejora.badges;
        const improveStreak = getImproveStreak();
        const totalImprovements = getScoreImprovements();
        const highScoreReached = hasReachedHighScore();
        const highScoreMaintained = getMaintainedHighScore();
        
        improvementBadges.forEach(badge => {
            let currentProgress = 0;
            
            if (badge.requirement === 'improve_streak') {
                currentProgress = improveStreak;
            } else if (badge.requirement === 'improve_score') {
                currentProgress = totalImprovements;
            } else if (badge.requirement === 'reach_high_score') {
                currentProgress = highScoreReached ? 1 : 0;
            } else if (badge.requirement === 'maintain_high_score') {
                currentProgress = highScoreMaintained;
            }
            
            if (currentProgress >= badge.count) {
                const currentLevel = calculateBadgeLevel(badge, currentProgress);
                const existingBadge = getBadgeInfo('mejora', badge.id);
                const existingLevel = existingBadge ? (existingBadge.level || 1) : 0;
                
                if (currentLevel > existingLevel) {
                    if (awardBadge('mejora', badge.id, currentLevel)) {
                        newBadgesAwarded.push({ category: 'mejora', badge: badge, level: currentLevel });
                    }
                }
            }
        });
    }
    
    // Mostrar notificación si hay nuevos badges
    if (newBadgesAwarded.length > 0) {
        showBadgeNotification(newBadgesAwarded);
        // Recargar recompensas si el modal está abierto
        const rewardsModal = document.getElementById('rewardsModal');
        if (rewardsModal && rewardsModal.style.display === 'block') {
            loadRewards();
        }
    }
}

// Verificar si el estudiante tiene un badge
function hasBadge(category, badgeId) {
    const rewards = getStudentRewards();
    return rewards[category] && rewards[category][badgeId] && rewards[category][badgeId].earned;
}

// Obtener información de un badge
function getBadgeInfo(category, badgeId) {
    const rewards = getStudentRewards();
    return rewards[category] && rewards[category][badgeId] ? rewards[category][badgeId] : null;
}

// Obtener cantidad de mensajes positivos enviados
function getStudentPositiveMessageCount() {
    if (!currentUser || !currentUser.id || currentUser.role !== 'student') return 0;
    const messages = JSON.parse(localStorage.getItem('anonymousMessages') || '[]');
    // Filtrar estrictamente por el ID del estudiante actual
    const studentMessages = messages.filter(m => m.studentId === currentUser.id);
    
    // Contar todos los mensajes (análisis de keywords removido - se implementará más adelante)
    return studentMessages.length;
}

// Obtener mejoras de score
function getScoreImprovements() {
    if (!currentUser || !currentUser.id || currentUser.role !== 'student') return 0;
    const responses = getStudentResponses();
    if (responses.length < 2) return 0;
    
    // Ordenar por fecha
    const sortedResponses = responses.sort((a, b) => 
        new Date(a.completedAt) - new Date(b.completedAt)
    );
    
    let improvements = 0;
    for (let i = 1; i < sortedResponses.length; i++) {
        if (sortedResponses[i].score > sortedResponses[i-1].score + 5) {
            improvements++;
        }
    }
    
    return improvements;
}

// Obtener recuperaciones de scores bajos
function getRecoveriesFromLow() {
    if (!currentUser || !currentUser.id || currentUser.role !== 'student') return 0;
    const responses = getStudentResponses();
    if (responses.length < 2) return 0;
    
    const sortedResponses = responses.sort((a, b) => 
        new Date(a.completedAt) - new Date(b.completedAt)
    );
    
    let recoveries = 0;
    for (let i = 1; i < sortedResponses.length; i++) {
        const prevScore = sortedResponses[i-1].score;
        const currScore = sortedResponses[i].score;
        // Si tenía score bajo (< 50) y ahora tiene alto (> 60)
        if (prevScore < 50 && currScore > 60) {
            recoveries++;
        }
    }
    
    return recoveries;
}

// ========== FUNCIONES AUXILIARES PARA NUEVAS RECOMPENSAS ==========

// Obtener días consecutivos de uso
function getConsecutiveDays() {
    if (!currentUser || !currentUser.id || currentUser.role !== 'student') return 0;
    const allInteractions = getAllUserInteractions();
    if (allInteractions.length === 0) return 0;
    
    // Obtener fechas únicas ordenadas
    const uniqueDates = [...new Set(allInteractions.map(item => {
        const date = new Date(item.date || item.completedAt || item.timestamp);
        return date.toISOString().split('T')[0];
    }))].sort().reverse();
    
    if (uniqueDates.length === 0) return 0;
    
    let consecutive = 1;
    const today = new Date().toISOString().split('T')[0];
    let checkDate = today;
    
    // Si no hay actividad hoy, empezar desde ayer
    if (!uniqueDates.includes(today)) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        checkDate = yesterday.toISOString().split('T')[0];
        if (!uniqueDates.includes(checkDate)) return 0;
    }
    
    for (let i = 1; i < uniqueDates.length; i++) {
        const current = new Date(uniqueDates[i-1]);
        const previous = new Date(uniqueDates[i]);
        const diffDays = Math.floor((current - previous) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            consecutive++;
        } else {
            break;
        }
    }
    
    return consecutive;
}

// Obtener semanas consecutivas con actividad
function getConsecutiveWeeks() {
    if (!currentUser || !currentUser.id || currentUser.role !== 'student') return 0;
    const allInteractions = getAllUserInteractions();
    if (allInteractions.length === 0) return 0;
    
    const weekDates = new Set();
    allInteractions.forEach(item => {
        const date = new Date(item.date || item.completedAt || item.timestamp);
        const year = date.getFullYear();
        const week = getWeekNumber(date);
        weekDates.add(`${year}-W${week}`);
    });
    
    const sortedWeeks = Array.from(weekDates).sort().reverse();
    let consecutive = 1;
    
    for (let i = 1; i < sortedWeeks.length; i++) {
        const [year1, week1] = sortedWeeks[i-1].split('-W').map(Number);
        const [year2, week2] = sortedWeeks[i].split('-W').map(Number);
        
        const weekDiff = year1 === year2 ? week1 - week2 : (year1 - year2) * 52 + (week1 - week2);
        if (weekDiff === 1) {
            consecutive++;
        } else {
            break;
        }
    }
    
    return consecutive;
}

// Obtener meses consecutivos con actividad
function getConsecutiveMonths() {
    if (!currentUser) return 0;
    const allInteractions = getAllUserInteractions();
    if (allInteractions.length === 0) return 0;
    
    const monthDates = new Set();
    allInteractions.forEach(item => {
        const date = new Date(item.date || item.completedAt || item.timestamp);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthDates.add(monthKey);
    });
    
    const sortedMonths = Array.from(monthDates).sort().reverse();
    let consecutive = 1;
    
    for (let i = 1; i < sortedMonths.length; i++) {
        const [year1, month1] = sortedMonths[i-1].split('-').map(Number);
        const [year2, month2] = sortedMonths[i].split('-').map(Number);
        
        const monthDiff = year1 === year2 ? month1 - month2 : (year1 - year2) * 12 + (month1 - month2);
        if (monthDiff === 1) {
            consecutive++;
        } else {
            break;
        }
    }
    
    return consecutive;
}

// Obtener diferentes tipos de tests completados
function getDifferentTestTypes() {
    if (!currentUser || !currentUser.id || currentUser.role !== 'student') return 0;
    const activities = getStudentActivities();
    const testTypes = new Set();
    
    activities.forEach(activity => {
        if (activity.testScore !== undefined) {
            const title = activity.activityTitle || '';
            if (title.includes('Empatía')) testTypes.add('empatia');
            if (title.includes('Autocuidado')) testTypes.add('autocuidado');
            if (title.includes('Conflictos') || title.includes('Resolución')) testTypes.add('conflictos');
        }
    });
    
    return testTypes.size;
}

// Obtener diferentes tipos de actividades completadas
function getDifferentActivityTypes() {
    if (!currentUser || !currentUser.id || currentUser.role !== 'student') return 0;
    const activities = getStudentActivities();
    const activityTypes = new Set();
    
    activities.forEach(activity => {
        if (activity.activityId) {
            if (activity.activityId.includes('gratitude')) activityTypes.add('reflection');
            if (activity.activityId.includes('empathy')) activityTypes.add('test');
            if (activity.activityId.includes('self_care')) activityTypes.add('test');
            if (activity.activityId.includes('conflict')) activityTypes.add('test');
            if (activity.activityId.includes('ethical') || activity.activityId.includes('simulator')) activityTypes.add('simulator');
            if (activity.reflection) activityTypes.add('reflection');
        }
    });
    
    return activityTypes.size;
}

// Verificar si tiene encuestas y actividades
function hasBothSurveyAndActivity() {
    if (!currentUser) return false;
    const responses = getStudentResponses();
    const activities = getStudentActivities();
    return responses.length > 0 && activities.length > 0;
}

// Verificar si completó todos los tipos
function hasCompletedAllTypes() {
    if (!currentUser) return false;
    const responses = getStudentResponses();
    const activities = getStudentActivities();
    const testTypes = getDifferentTestTypes();
    const hasReflection = activities.some(a => a.reflection || a.activityId?.includes('gratitude'));
    const hasSimulator = activities.some(a => a.simulatorResults || a.activityId?.includes('ethical'));
    
    return responses.length > 0 && activities.length > 0 && testTypes >= 3 && hasReflection && hasSimulator;
}

// Obtener conteo de reflexiones
function getReflectionCount() {
    if (!currentUser) return 0;
    const activities = getStudentActivities();
    return activities.filter(a => a.reflection || a.activityId?.includes('gratitude')).length;
}

// Obtener conteo de simuladores
function getSimulatorCount() {
    if (!currentUser) return 0;
    const activities = getStudentActivities();
    return activities.filter(a => a.simulatorResults || a.activityId?.includes('ethical')).length;
}

// Obtener actividades en los últimos 7 días
function getActivitiesLast7Days() {
    if (!currentUser || !currentUser.id || currentUser.role !== 'student') return 0;
    const activities = getStudentActivities();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return activities.filter(a => {
        const date = new Date(a.completedAt);
        return date >= sevenDaysAgo;
    }).length;
}

// Obtener actividades esta semana
function getActivitiesThisWeek() {
    if (!currentUser || !currentUser.id || currentUser.role !== 'student') return 0;
    const activities = getStudentActivities();
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    return activities.filter(a => {
        const date = new Date(a.completedAt);
        return date >= startOfWeek;
    }).length;
}

// Obtener actividades este mes
function getActivitiesThisMonth() {
    if (!currentUser || !currentUser.id || currentUser.role !== 'student') return 0;
    const activities = getStudentActivities();
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return activities.filter(a => {
        const date = new Date(a.completedAt);
        return date >= startOfMonth;
    }).length;
}

// Obtener actividades este trimestre
function getActivitiesThisQuarter() {
    if (!currentUser) return 0;
    const activities = getStudentActivities();
    const today = new Date();
    const quarter = Math.floor(today.getMonth() / 3);
    const startOfQuarter = new Date(today.getFullYear(), quarter * 3, 1);
    
    return activities.filter(a => {
        const date = new Date(a.completedAt);
        return date >= startOfQuarter;
    }).length;
}

// Obtener total de interacciones (encuestas + actividades + mensajes)
function getTotalInteractions() {
    if (!currentUser || !currentUser.id || currentUser.role !== 'student') return 0;
    const responses = getStudentResponses();
    const activities = getStudentActivities();
    const messages = getStudentPositiveMessageCount();
    return responses.length + activities.length + messages;
}

// Obtener racha de mejoras
function getImproveStreak() {
    if (!currentUser || !currentUser.id || currentUser.role !== 'student') return 0;
    const responses = getStudentResponses();
    if (responses.length < 2) return 0;
    
    const sortedResponses = responses.sort((a, b) => 
        new Date(a.completedAt) - new Date(b.completedAt)
    );
    
    let streak = 0;
    let maxStreak = 0;
    
    for (let i = 1; i < sortedResponses.length; i++) {
        if (sortedResponses[i].score > sortedResponses[i-1].score + 5) {
            streak++;
            maxStreak = Math.max(maxStreak, streak);
        } else {
            streak = 0;
        }
    }
    
    return maxStreak;
}

// Verificar si alcanzó score alto
function hasReachedHighScore() {
    if (!currentUser || !currentUser.id || currentUser.role !== 'student') return false;
    const responses = getStudentResponses();
    return responses.some(r => r.score >= 80);
}

// Obtener cuántas veces mantuvo score alto
function getMaintainedHighScore() {
    if (!currentUser || !currentUser.id || currentUser.role !== 'student') return 0;
    const responses = getStudentResponses();
    return responses.filter(r => r.score >= 80).length;
}

// Obtener todas las interacciones del usuario
function getAllUserInteractions() {
    if (!currentUser || !currentUser.id || currentUser.role !== 'student') return [];
    const responses = getStudentResponses();
    const activities = getStudentActivities();
    const messages = JSON.parse(localStorage.getItem('anonymousMessages') || '[]')
        .filter(m => m.studentId === currentUser.id);
    
    const interactions = [];
    responses.forEach(r => interactions.push({ date: r.completedAt, type: 'survey' }));
    activities.forEach(a => interactions.push({ date: a.completedAt, type: 'activity' }));
    messages.forEach(m => interactions.push({ date: m.timestamp, type: 'message' }));
    
    return interactions;
}

// Función auxiliar para obtener número de semana
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Cargar y mostrar recompensas
function loadRewards() {
    const rewardsContainer = document.getElementById('rewardsContainer');
    if (!rewardsContainer) return;
    
    const categories = getRewardCategories();
    const studentRewards = getStudentRewards();
    
    rewardsContainer.innerHTML = '';
    
    Object.keys(categories).forEach(categoryKey => {
        const category = categories[categoryKey];
        const categoryRewards = studentRewards[categoryKey] || {};
        
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'reward-category';
        
        // Contar badges ganados
        const earnedCount = category.badges.filter(b => 
            categoryRewards[b.id] && categoryRewards[b.id].earned
        ).length;
        const totalCount = category.badges.length;
        const progress = (earnedCount / totalCount) * 100;
        
        let badgesHTML = '<div class="badges-grid">';
        category.badges.forEach(badge => {
            const badgeInfo = categoryRewards[badge.id];
            const isEarned = badgeInfo && badgeInfo.earned;
            const earnedDate = isEarned ? badgeInfo.date : null;
            const badgeLevel = isEarned ? (badgeInfo.level || 1) : 0;
            
            // Agregar onClick para mostrar detalles
            const escapedCategoryKey = escapeHtmlAttribute(categoryKey);
            const escapedBadgeId = escapeHtmlAttribute(badge.id);
            const onClickHandler = `openBadgeDetail('${escapedCategoryKey}', '${escapedBadgeId}')`;
            
            badgesHTML += `
                <div class="badge-item ${isEarned ? 'earned' : 'locked'}" 
                     onclick="${onClickHandler}"
                     style="cursor: pointer;"
                     title="Click para ver detalles${isEarned && earnedDate ? ' - Otorgado: ' + new Date(earnedDate).toLocaleDateString('es-ES') : ''}">
                    ${!isEarned ? '<span class="badge-lock-icon">🔒</span>' : ''}
                    <div class="badge-icon">${badge.icon}</div>
                    <div class="badge-name">${badge.name}${badgeLevel > 1 ? ` <span style="color: #7BA680; font-weight: 700; font-size: 0.9em;">Nv.${badgeLevel}</span>` : ''}</div>
                    ${isEarned && earnedDate ? `<div class="badge-date">${new Date(earnedDate).toLocaleDateString('es-ES')}</div>` : ''}
                </div>
            `;
        });
        badgesHTML += '</div>';
        
        categoryDiv.innerHTML = `
            <div class="reward-category-title">
                ${category.title}
            </div>
            <p style="font-size: 0.9em; color: #666; margin-bottom: 15px;">${category.description}</p>
            ${badgesHTML}
            <div class="reward-progress">
                <div class="progress-label">
                    Progreso: ${earnedCount} / ${totalCount} badges
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
        
        rewardsContainer.appendChild(categoryDiv);
    });
    
    // Agregar estadísticas generales
    const totalEarned = Object.keys(studentRewards).reduce((sum, cat) => {
        return sum + Object.keys(studentRewards[cat] || {}).filter(id => 
            studentRewards[cat][id].earned
        ).length;
    }, 0);
    
    const statsDiv = document.createElement('div');
    statsDiv.className = 'reward-category reward-stats-container';
    statsDiv.innerHTML = `
        <div class="reward-stats">
            <div class="stat-item">
                <span class="stat-value">${totalEarned}</span>
                <span class="stat-label">Badges Totales</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${getStudentPositiveMessageCount()}</span>
                <span class="stat-label">Mensajes Positivos</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${getStudentResponses().length}</span>
                <span class="stat-label">Encuestas Completadas</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${getStudentActivities().length}</span>
                <span class="stat-label">Actividades Completadas</span>
            </div>
        </div>
    `;
    
    rewardsContainer.appendChild(statsDiv);
}

// Abrir modal de recompensas
function openRewardsModal() {
    const modal = document.getElementById('rewardsModal');
    if (!modal) return;
    
    // Cargar recompensas antes de mostrar el modal
    loadRewards();
    
    // Actualizar estado activo de navegación
    updateStudentNavActive('rewards');
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Cerrar modal de recompensas
function closeRewardsModal() {
    const modal = document.getElementById('rewardsModal');
    if (!modal) return;
    
    modal.style.display = 'none';
    document.body.style.overflow = '';
    
    // Restaurar estado activo de navegación al dashboard
    if (currentView === 'student') {
        updateStudentNavActive('dashboard');
    }
}

// Abrir modal de detalles de badge
function openBadgeDetail(categoryKey, badgeId) {
    const categories = getRewardCategories();
    const category = categories[categoryKey];
    const badge = category.badges.find(b => b.id === badgeId);
    
    if (!badge) return;
    
    const studentRewards = getStudentRewards();
    const badgeInfo = studentRewards[categoryKey] && studentRewards[categoryKey][badgeId];
    const isEarned = badgeInfo && badgeInfo.earned;
    const earnedDate = isEarned ? badgeInfo.date : null;
    const currentLevel = isEarned ? (badgeInfo.level || 1) : 0;
    
    // Obtener información de progreso actual
    let currentProgress = 0;
    let progressDescription = '';
    let requirementText = '';
    
    if (badge.requirement === 'send_positive_message') {
        currentProgress = getStudentPositiveMessageCount();
        progressDescription = `Mensajes positivos enviados: ${currentProgress} / ${badge.count}`;
        requirementText = `Enviar ${badge.count} mensaje${badge.count > 1 ? 's' : ''} positivo${badge.count > 1 ? 's' : ''}`;
    } else if (badge.requirement === 'complete_survey') {
        currentProgress = getStudentResponses().length;
        progressDescription = `Encuestas completadas: ${currentProgress} / ${badge.count}`;
        requirementText = `Completar ${badge.count} encuesta${badge.count > 1 ? 's' : ''} de bienestar`;
    } else if (badge.requirement === 'complete_activity') {
        currentProgress = getStudentActivities().length;
        progressDescription = `Actividades completadas: ${currentProgress} / ${badge.count}`;
        requirementText = `Completar ${badge.count} actividad${badge.count > 1 ? 'es' : ''} lúdica${badge.count > 1 ? 's' : ''}`;
    } else if (badge.requirement === 'improve_score') {
        currentProgress = getScoreImprovements();
        progressDescription = `Mejoras consistentes logradas: ${currentProgress} / ${badge.count}`;
        requirementText = `Mostrar mejoras consistentes en tu participación en ${badge.count} ocasión${badge.count > 1 ? 'es' : ''}`;
    } else if (badge.requirement === 'recover_from_low') {
        currentProgress = getRecoveriesFromLow();
        progressDescription = `Recuperaciones: ${currentProgress} / ${badge.count}`;
        requirementText = `Mostrar recuperación y mejora en ${badge.count} ocasión${badge.count > 1 ? 'es' : ''}`;
    } else if (badge.requirement === 'days_consecutive') {
        currentProgress = getConsecutiveDays();
        progressDescription = `Días consecutivos de uso: ${currentProgress} / ${badge.count}`;
        requirementText = `Usar la plataforma ${badge.count} día${badge.count > 1 ? 's' : ''} consecutivo${badge.count > 1 ? 's' : ''}`;
    } else if (badge.requirement === 'weeks_consecutive') {
        currentProgress = getConsecutiveWeeks();
        progressDescription = `Semanas consecutivas de uso: ${currentProgress} / ${badge.count}`;
        requirementText = `Usar la plataforma ${badge.count} semana${badge.count > 1 ? 's' : ''} consecutiva${badge.count > 1 ? 's' : ''}`;
    } else if (badge.requirement === 'months_consecutive') {
        currentProgress = getConsecutiveMonths();
        progressDescription = `Meses consecutivos de uso: ${currentProgress} / ${badge.count}`;
        requirementText = `Usar la plataforma ${badge.count} mes${badge.count > 1 ? 'es' : ''} consecutivo${badge.count > 1 ? 's' : ''}`;
    } else if (badge.requirement === 'different_test_types') {
        currentProgress = getDifferentTestTypes();
        progressDescription = `Tipos de tests diferentes completados: ${currentProgress} / ${badge.count}`;
        requirementText = `Completar ${badge.count} tipo${badge.count > 1 ? 's' : ''} diferente${badge.count > 1 ? 's' : ''} de test (Empatía, Autocuidado, Resolución de Conflictos, etc.)`;
    } else if (badge.requirement === 'different_activity_types') {
        currentProgress = getDifferentActivityTypes();
        progressDescription = `Tipos de actividades diferentes completadas: ${currentProgress} / ${badge.count}`;
        requirementText = `Completar ${badge.count} tipo${badge.count > 1 ? 's' : ''} diferente${badge.count > 1 ? 's' : ''} de actividad`;
    } else if (badge.requirement === 'both_survey_activity') {
        currentProgress = hasBothSurveyAndActivity() ? 1 : 0;
        progressDescription = `${hasBothSurveyAndActivity() ? '✓ Tienes encuestas y actividades' : 'Necesitas completar al menos una encuesta y una actividad'}`;
        requirementText = `Completar al menos una encuesta y una actividad`;
    } else if (badge.requirement === 'complete_all_types') {
        currentProgress = hasCompletedAllTypes() ? 1 : 0;
        progressDescription = `${hasCompletedAllTypes() ? '✓ Has completado todos los tipos' : 'Necesitas completar encuestas, tests, reflexiones y simuladores'}`;
        requirementText = `Completar todos los tipos de actividades disponibles en la plataforma`;
    } else if (badge.requirement === 'complete_reflections') {
        currentProgress = getReflectionCount();
        progressDescription = `Reflexiones completadas: ${currentProgress} / ${badge.count}`;
        requirementText = `Completar ${badge.count} reflexión${badge.count > 1 ? 'es' : ''} (Diario de Gratitud, etc.)`;
    } else if (badge.requirement === 'complete_simulators') {
        currentProgress = getSimulatorCount();
        progressDescription = `Simuladores completados: ${currentProgress} / ${badge.count}`;
        requirementText = `Completar ${badge.count} simulador${badge.count > 1 ? 'es' : ''} de decisiones éticas`;
    } else if (badge.requirement === 'activities_7_days') {
        currentProgress = getActivitiesLast7Days();
        progressDescription = `Actividades en los últimos 7 días: ${currentProgress} / ${badge.count}`;
        requirementText = `Completar ${badge.count} actividad${badge.count > 1 ? 'es' : ''} en los últimos 7 días`;
    } else if (badge.requirement === 'activities_week') {
        currentProgress = getActivitiesThisWeek();
        progressDescription = `Actividades esta semana: ${currentProgress} / ${badge.count}`;
        requirementText = `Completar ${badge.count} actividad${badge.count > 1 ? 'es' : ''} esta semana`;
    } else if (badge.requirement === 'activities_month') {
        currentProgress = getActivitiesThisMonth();
        progressDescription = `Actividades este mes: ${currentProgress} / ${badge.count}`;
        requirementText = `Completar ${badge.count} actividad${badge.count > 1 ? 'es' : ''} este mes`;
    } else if (badge.requirement === 'activities_quarter') {
        currentProgress = getActivitiesThisQuarter();
        progressDescription = `Actividades este trimestre: ${currentProgress} / ${badge.count}`;
        requirementText = `Completar ${badge.count} actividad${badge.count > 1 ? 'es' : ''} este trimestre`;
    } else if (badge.requirement === 'total_interactions') {
        currentProgress = getTotalInteractions();
        progressDescription = `Total de interacciones: ${currentProgress} / ${badge.count}`;
        requirementText = `Tener ${badge.count} interacción${badge.count > 1 ? 'es' : ''} en total (encuestas + actividades + mensajes)`;
    } else if (badge.requirement === 'improve_streak') {
        currentProgress = getImproveStreak();
        progressDescription = `Racha de mejoras consecutivas: ${currentProgress} / ${badge.count}`;
        requirementText = `Mostrar mejoras consistentes ${badge.count} vez${badge.count > 1 ? 'ces' : ''} consecutiva${badge.count > 1 ? 's' : ''}`;
    } else if (badge.requirement === 'reach_high_score') {
        currentProgress = hasReachedHighScore() ? 1 : 0;
        progressDescription = `${hasReachedHighScore() ? '✓ Has mostrado un excelente rendimiento' : 'Continúa participando activamente'}`;
        requirementText = `Mostrar excelente participación en las actividades`;
    } else if (badge.requirement === 'maintain_high_score') {
        currentProgress = getMaintainedHighScore();
        progressDescription = `Veces con excelente participación: ${currentProgress} / ${badge.count}`;
        requirementText = `Mostrar excelente participación en ${badge.count} ocasión${badge.count > 1 ? 'es' : ''}`;
    }
    
    // Calcular progreso para el nivel actual y siguiente nivel
    let progressPercent = Math.min((currentProgress / badge.count) * 100, 100);
    let nextLevelRequired = badge.count;
    let nextLevelProgress = currentProgress;
    
    if (currentLevel > 0) {
        // Calcular requisito para el siguiente nivel
        nextLevelRequired = badge.count * Math.pow(2, currentLevel);
        nextLevelProgress = currentProgress;
        const currentLevelRequired = badge.count * Math.pow(2, currentLevel - 1);
        progressPercent = Math.min(((currentProgress - currentLevelRequired) / (nextLevelRequired - currentLevelRequired)) * 100, 100);
    }
    
    const modal = document.getElementById('badgeDetailModal');
    const content = document.getElementById('badgeDetailContent');
    
    if (!modal || !content) return;
    
    content.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 5em; margin-bottom: 20px; filter: ${isEarned ? 'none' : 'grayscale(1) opacity(0.5)'};">
                ${badge.icon}
            </div>
            <h2 style="margin-bottom: 10px; color: ${isEarned ? '#A3C9A8' : '#999'};">
                ${badge.name}${currentLevel > 1 ? ` <span style="color: #7BA680; font-size: 0.7em;">Nivel ${currentLevel}</span>` : ''}
            </h2>
            <div style="background: ${isEarned ? 'linear-gradient(135deg, #7BA680 0%, #8FC4D9 100%)' : '#f0f0f0'}; color: ${isEarned ? 'white' : '#666'}; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-bottom: 20px; font-weight: 600;">
                ${isEarned ? `✓ Desbloqueada${currentLevel > 1 ? ` - Nivel ${currentLevel}` : ''}` : '🔒 Bloqueada'}
            </div>
        </div>
        
        <div style="background: #f8f9fc; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333; font-size: 1.1em;">📋 Requisito para desbloquear:</h3>
            <p style="color: #666; font-size: 1em; line-height: 1.6;">
                ${requirementText}
            </p>
        </div>
        
        <div style="background: #f8f9fc; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333; font-size: 1.1em;">📊 Tu Progreso:</h3>
            <p style="color: #666; margin-bottom: 10px;">
                ${progressDescription}
            </p>
            <div style="background: #e0e0e0; border-radius: 8px; height: 20px; overflow: hidden; position: relative;">
                <div style="background: linear-gradient(90deg, #7BA680 0%, #8FC4D9 100%); height: 100%; width: ${progressPercent}%; transition: width 0.3s ease; border-radius: 8px;"></div>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 0.85em; font-weight: 600; color: ${progressPercent > 50 ? 'white' : '#333'};">
                    ${currentProgress} / ${currentLevel > 0 ? nextLevelRequired : badge.count}
                </div>
            </div>
            ${currentLevel > 0 ? `
                <p style="color: #7BA680; margin-top: 10px; font-weight: 600; font-size: 0.95em;">
                    Nivel Actual: ${currentLevel} | Próximo Nivel: ${nextLevelRequired} ${badge.requirement === 'send_positive_message' ? 'mensajes' : badge.requirement === 'complete_survey' ? 'encuestas' : badge.requirement === 'complete_activity' ? 'actividades' : 'requisitos'}
                </p>
            ` : ''}
            ${progressPercent === 100 && !isEarned ? '<p style="color: #28a745; margin-top: 10px; font-weight: 600;">¡Cumples los requisitos! Esta insignia debería desbloquearse pronto.</p>' : ''}
        </div>
        
        ${isEarned ? `
            <div style="background: linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%); border-left: 4px solid #A3C9A8; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #A3C9A8; font-size: 1.1em;">🎉 ¡Insignia Desbloqueada!</h3>
                <p style="color: #666; margin-bottom: 10px;">
                    Desbloqueaste esta insignia el ${earnedDate ? new Date(earnedDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Fecha no disponible'}
                </p>
                <p style="color: #666; font-size: 0.95em;">
                    ${getBadgeFeedback(categoryKey, badgeId)}
                </p>
            </div>
        ` : `
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #856404; font-size: 1.1em;">💡 ¿Cómo desbloquear esta insignia?</h3>
                <p style="color: #856404; margin: 0;">
                    ${getBadgeTip(categoryKey, badgeId)}
                </p>
            </div>
        `}
        
        <div style="text-align: center; margin-top: 30px;">
            <button onclick="closeBadgeDetailModal()" class="btn-primary" style="padding: 12px 30px;">
                Cerrar
            </button>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Cerrar modal de detalles de badge
function closeBadgeDetailModal() {
    const modal = document.getElementById('badgeDetailModal');
    if (!modal) return;
    
    modal.style.display = 'none';
}

// Mostrar mensaje de éxito personalizado
function showSuccessMessage(message) {
    const modal = document.getElementById('successMessageModal');
    const content = document.getElementById('successMessageContent');
    if (modal && content) {
        // Permitir HTML en el mensaje para mejor formato
        content.innerHTML = message;
        modal.style.display = 'block';
    }
}

// Cerrar modal de mensaje de éxito
function closeSuccessMessageModal() {
    document.getElementById('successMessageModal').style.display = 'none';
}

// ========== UTILITY FUNCTIONS FOR IMPROVEMENTS ==========

// Confirmation Modal
let confirmationPromise = null;
let confirmationResolve = null;

function showConfirmation(message) {
    return new Promise((resolve) => {
        confirmationResolve = resolve;
        const modal = document.getElementById('confirmationModal');
        const messageEl = document.getElementById('confirmationMessage');
        if (modal && messageEl) {
            // Si el mensaje contiene HTML (etiquetas), usarlo directamente; si no, sanitizar y convertir saltos de línea
            if (message.includes('<') && message.includes('>')) {
                messageEl.innerHTML = message;
            } else {
                messageEl.innerHTML = sanitizeInput(message).replace(/\n/g, '<br>');
            }
            modal.style.display = 'block';
        }
    });
}

function closeConfirmationModal(confirmed) {
    const modal = document.getElementById('confirmationModal');
    if (modal) {
        modal.style.display = 'none';
    }
    if (confirmationResolve) {
        confirmationResolve(confirmed);
        confirmationResolve = null;
    }
}

// Loading Spinner
function showLoading(message = 'Cargando...') {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        const messageEl = spinner.querySelector('p');
        if (messageEl) messageEl.textContent = message;
        spinner.style.display = 'block';
    }
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

// Sanitize Input to prevent XSS
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Sanitize HTML (allows safe HTML)
function sanitizeHTML(html) {
    if (typeof html !== 'string') return html;
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

// Escape HTML attribute values to prevent XSS and syntax errors
function escapeHtmlAttribute(value) {
    if (value == null) return '';
    const str = String(value);
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Data Cache System
const dataCache = {
    cache: {},
    ttl: 5 * 60 * 1000, // 5 minutes default TTL
    
    set(key, data, ttl = null) {
        this.cache[key] = {
            data: data,
            timestamp: Date.now(),
            ttl: ttl || this.ttl
        };
    },
    
    get(key) {
        const item = this.cache[key];
        if (!item) return null;
        
        const now = Date.now();
        if (now - item.timestamp > item.ttl) {
            delete this.cache[key];
            return null;
        }
        
        return item.data;
    },
    
    clear(key) {
        if (key) {
            delete this.cache[key];
        } else {
            this.cache = {};
        }
    },
    
    clearPattern(pattern) {
        Object.keys(this.cache).forEach(key => {
            if (key.includes(pattern)) {
                delete this.cache[key];
            }
        });
    }
};

// Debounce Function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle Function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Real-time Form Validation
function setupRealTimeValidation(input, validator) {
    if (!input || typeof validator !== 'function') return;
    
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;
    
    let validationMessage = formGroup.querySelector('.validation-message');
    if (!validationMessage) {
        validationMessage = document.createElement('span');
        validationMessage.className = 'validation-message';
        formGroup.appendChild(validationMessage);
    }
    
    const validate = () => {
        const value = input.value.trim();
        const result = validator(value);
        
        if (result.valid) {
            input.classList.remove('error');
            input.classList.add('success');
            validationMessage.textContent = result.message || '';
            validationMessage.className = 'validation-message success';
        } else {
            input.classList.remove('success');
            input.classList.add('error');
            validationMessage.textContent = result.message || '';
            validationMessage.className = 'validation-message error';
        }
        
        return result.valid;
    };
    
    input.addEventListener('blur', validate);
    input.addEventListener('input', debounce(validate, 300));
    
    return validate;
}

// Email Validator
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Password Validator
function validatePassword(password) {
    if (!password || password.trim() === '') {
        return { valid: false, message: 'La contraseña es obligatoria' };
    }
    if (password.length < 6) {
        return { valid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }
    return { valid: true, message: '✓ Contraseña válida' };
}

// Age Validator
function validateAge(age) {
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 9 || ageNum > 17) {
        return { valid: false, message: 'La edad debe estar entre 9 y 17 años' };
    }
    return { valid: true, message: '' };
}

// Required Field Validator
function validateRequired(value) {
    if (!value || value.trim() === '') {
        return { valid: false, message: 'Este campo es obligatorio' };
    }
    return { valid: true, message: '' };
}

// ========== ERROR HANDLING AND STORAGE HELPERS ==========

// Safe localStorage getter with error handling
function safeGetItem(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        if (item === null) return defaultValue;
        return JSON.parse(item);
    } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        const errorMsg = typeof i18n !== 'undefined' ? i18n.t('errors.readDataError') : '⚠️ Error al leer datos. Por favor, recarga la página.';
        showSuccessMessage(errorMsg);
        return defaultValue;
    }
}

// Safe localStorage setter with error handling
function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error writing localStorage key "${key}":`, error);
        const errorMsg = typeof i18n !== 'undefined' ? i18n.t('errors.saveDataError') : '⚠️ Error al guardar datos. El almacenamiento puede estar lleno.';
        showSuccessMessage(errorMsg);
        return false;
    }
}

// Tooltip System
function initTooltips() {
    // Add tooltips to elements with data-tooltip attribute
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', function(e) {
            const tooltipText = this.getAttribute('data-tooltip');
            if (!tooltipText) return;
            
            const tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = tooltipText;
            tooltip.style.cssText = `
                position: absolute;
                background: #1a2332;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 0.85em;
                z-index: 10000;
                pointer-events: none;
                white-space: nowrap;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                opacity: 0;
                transition: opacity 0.2s ease;
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
            
            // Adjust if tooltip goes off screen
            if (tooltip.offsetLeft < 0) {
                tooltip.style.left = '10px';
            }
            if (tooltip.offsetLeft + tooltip.offsetWidth > window.innerWidth) {
                tooltip.style.left = (window.innerWidth - tooltip.offsetWidth - 10) + 'px';
            }
            
            setTimeout(() => {
                tooltip.style.opacity = '1';
            }, 10);
            
            this._tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                this._tooltip.style.opacity = '0';
                setTimeout(() => {
                    if (this._tooltip && this._tooltip.parentNode) {
                        this._tooltip.parentNode.removeChild(this._tooltip);
                    }
                    this._tooltip = null;
                }, 200);
            }
        });
    });
}

// Initialize tooltips on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTooltips);
} else {
    initTooltips();
}

// Obtener feedback personalizado del badge desbloqueado
function getBadgeFeedback(categoryKey, badgeId) {
    const categories = getRewardCategories();
    const badge = categories[categoryKey].badges.find(b => b.id === badgeId);
    
    const feedbackMessages = {
        'empatia': {
            'empath_first': '¡Excelente! Enviaste tu primer mensaje positivo. Esto muestra empatía y preocupación por el bienestar de otros.',
            'empath_helper': '¡Increíble! Has enviado 5 mensajes positivos. Tu capacidad de apoyo y empatía está creciendo.',
            'empath_compassionate': '¡Fantástico! Has enviado 10 mensajes positivos. Eres una persona muy compasiva y empática.',
            'empath_champion': '¡Extraordinario! Has enviado 20 mensajes positivos. Eres un verdadero campeón de la empatía.',
            'empath_master': '¡Maestro de la Empatía! Has enviado 50 mensajes positivos. Tu capacidad de apoyo y comprensión es ejemplar.'
        },
        'autorregulacion': {
            'reg_first_survey': '¡Bien hecho! Completaste tu primera encuesta. Este es el primer paso hacia una mejor autorregulación emocional.',
            'reg_consistent': '¡Excelente! Has completado 5 encuestas. Tu consistencia muestra un compromiso con tu bienestar.',
            'reg_dedicated': '¡Fantástico! Has completado 10 encuestas. Tu dedicación a conocerte mejor es admirable.',
            'reg_improved': '¡Increíble! Has mejorado tu score 3 veces. Esto muestra una excelente capacidad de autorregulación y crecimiento personal.',
            'reg_master': '¡Maestro de la Autorregulación! Has completado 20 encuestas. Tu capacidad de gestión emocional es excepcional.',
            'reg_expert': '¡Experto! Has completado 30 encuestas. Tu compromiso con el bienestar es extraordinario.',
            'reg_grandmaster': '¡Gran Maestro! Has completado 50 encuestas. Eres un verdadero experto en autorregulación emocional.'
        },
        'resiliencia': {
            'resil_first_activity': '¡Bien hecho! Completaste tu primera actividad. Esto muestra iniciativa y resiliencia.',
            'resil_persistent': '¡Excelente! Has completado 5 actividades. Tu persistencia es admirable.',
            'resil_warrior': '¡Fantástico! Has completado 10 actividades. Eres un verdadero guerrero de la resiliencia.',
            'resil_bounce_back': '¡Increíble! Te recuperaste de un score bajo. Esto demuestra una resiliencia extraordinaria y capacidad de superación.',
            'resil_legend': '¡Leyenda de la Resiliencia! Has completado 20 actividades. Tu capacidad de perseverar y superar dificultades es ejemplar.',
            'resil_veteran': '¡Veterano! Has completado 30 actividades. Tu experiencia en resiliencia es notable.',
            'resil_champion': '¡Campeón! Has completado 50 actividades. Eres un verdadero campeón de la resiliencia.'
        },
        'continuidad': {
            'cont_day_1': '¡Bien hecho! Usaste la plataforma hoy. Mantén esta racha de continuidad.',
            'cont_week_streak': '¡Excelente! Has usado la plataforma 7 días consecutivos. Tu constancia es admirable.',
            'cont_biweekly': '¡Fantástico! Has mantenido una racha de 14 días. Tu compromiso con el bienestar es sólido.',
            'cont_month_streak': '¡Increíble! Has usado la plataforma 30 días seguidos. Tu dedicación es ejemplar.',
            'cont_2months': '¡Extraordinario! Has mantenido una racha de 60 días. Eres un modelo de constancia.',
            'cont_3months': '¡Excepcional! Has usado la plataforma 90 días consecutivos. Tu compromiso es notable.',
            'cont_weekly_4': '¡Excelente! Has usado la plataforma 4 semanas consecutivas. Tu regularidad es admirable.',
            'cont_weekly_8': '¡Fantástico! Has mantenido 8 semanas de uso continuo. Tu perseverancia es ejemplar.',
            'cont_monthly_3': '¡Increíble! Has usado la plataforma 3 meses seguidos. Tu compromiso es excepcional.',
            'cont_monthly_6': '¡Extraordinario! Has mantenido 6 meses de uso consecutivo. Eres un modelo de dedicación.',
            'cont_monthly_12': '¡Leyenda! Has usado la plataforma durante todo un año. Tu constancia es extraordinaria.'
        },
        'variedad': {
            'var_test_types': '¡Explorador! Has probado diferentes tipos de tests. Explorar diferentes áreas es excelente para tu crecimiento.',
            'var_all_tests': '¡Completo! Has completado todos los tipos de tests. Tu versatilidad en el aprendizaje es admirable.',
            'var_activities': '¡Versátil! Has explorado diferentes tipos de actividades. Esto enriquece tu experiencia.',
            'var_survey_activity': '¡Equilibrado! Has combinado encuestas y actividades. Tu enfoque balanceado es excelente.',
            'var_complete_all': '¡Omnívoro! Has completado todos los tipos de contenido. Tu versatilidad es excepcional.',
            'var_reflection': '¡Reflexivo! Has completado varias reflexiones. La autorreflexión es clave para el crecimiento personal.',
            'var_simulator': '¡Estratega! Has completado varios simuladores. Tu capacidad de tomar decisiones éticas es notable.'
        },
        'compromiso': {
            'commit_daily_user': '¡Usuario Diario! Has usado la plataforma todos los días de la semana. Tu compromiso es admirable.',
            'commit_active_week': '¡Semana Activa! Has completado varias actividades esta semana. Mantén este ritmo.',
            'commit_monthly_goal': '¡Meta Mensual! Has alcanzado tu meta mensual de actividades. ¡Excelente trabajo!',
            'commit_quarter_goal': '¡Meta Trimestral! Has superado tu meta trimestral. Tu dedicación es excepcional.',
            'commit_total_50': '¡Cincuentón! Has alcanzado 50 interacciones totales. Tu compromiso con el bienestar es notable.',
            'commit_total_100': '¡Centenario! Has llegado a 100 interacciones. Tu dedicación es extraordinaria.',
            'commit_total_200': '¡Bicentenario! Has alcanzado 200 interacciones. Eres un verdadero líder en bienestar.',
            'commit_total_500': '¡Maestro Supremo! Has llegado a 500 interacciones. Eres un verdadero experto y modelo a seguir.'
        },
        'mejora': {
            'improv_streak_2': '¡En Ascenso! Has mejorado tu score 2 veces seguidas. Tu progreso es constante.',
            'improv_streak_5': '¡Tendencia Positiva! Has mejorado 5 veces consecutivas. Tu crecimiento es notable.',
            'improv_streak_10': '¡Crecimiento Constante! Has mejorado 10 veces seguidas. Tu desarrollo es excepcional.',
            'improv_total_5': '¡5 Mejoras! Has mejorado tu bienestar 5 veces. Tu progreso es admirable.',
            'improv_total_10': '¡10 Mejoras! Has mejorado 10 veces en total. Tu evolución es notable.',
            'improv_total_20': '¡20 Mejoras! Has mejorado 20 veces. Tu crecimiento personal es excepcional.',
            'improv_high_score': '¡Alto Rendimiento! Has alcanzado un score alto. Tu bienestar está en excelente nivel.',
            'improv_maintain_high': '¡Mantener Excelencia! Has mantenido scores altos consistentemente. Tu bienestar es estable y sólido.'
        }
    };
    
    return feedbackMessages[categoryKey] && feedbackMessages[categoryKey][badgeId] 
        ? feedbackMessages[categoryKey][badgeId] 
        : 'Has demostrado excelencia en esta área. ¡Sigue así!';
}

// Obtener consejo para desbloquear badge
function getBadgeTip(categoryKey, badgeId) {
    const categories = getRewardCategories();
    const badge = categories[categoryKey].badges.find(b => b.id === badgeId);
    
    const tips = {
        'empatia': {
            'empath_first': 'Envía un mensaje positivo en el Canal de Comunicación. Usa palabras como "apoyo", "compañerismo", "solidaridad".',
            'empath_helper': 'Sigue enviando mensajes positivos. Muestra comprensión y apoyo hacia tus compañeros.',
            'empath_compassionate': 'Continúa demostrando empatía. Cada mensaje positivo ayuda a crear un ambiente más saludable.',
            'empath_champion': 'Eres un gran ejemplo. Sigue compartiendo mensajes positivos y de apoyo.',
            'empath_master': 'Estás cerca de convertirte en maestro de la empatía. Sigue inspirando a otros con tus mensajes positivos.'
        },
        'autorregulacion': {
            'reg_first_survey': 'Completa una encuesta de bienestar para comenzar tu viaje de autorregulación.',
            'reg_consistent': 'Completa más encuestas. La consistencia en el autoconocimiento es clave para la autorregulación.',
            'reg_dedicated': 'Continúa completando encuestas. Cada una te ayuda a conocerte mejor.',
            'reg_improved': 'Enfócate en mejorar tu bienestar. Reflexiona sobre tus respuestas y trabaja en áreas de mejora.',
            'reg_master': 'Estás muy cerca. Sigue completando encuestas y monitoreando tu bienestar emocional.',
            'reg_expert': 'Continúa con tu excelente trabajo. Completa más encuestas para alcanzar el nivel de experto.',
            'reg_grandmaster': 'Estás cerca de convertirte en Gran Maestro. Mantén tu constancia y compromiso.'
        },
        'resiliencia': {
            'resil_first_activity': 'Completa una actividad lúdica. Las actividades te ayudan a desarrollar resiliencia.',
            'resil_persistent': 'Sigue completando actividades. La persistencia es fundamental para la resiliencia.',
            'resil_warrior': 'Continúa con las actividades. Cada una te fortalece más.',
            'resil_bounce_back': 'Si tu score está bajo, no te desanimes. Completa encuestas y actividades para recuperarte. ¡Puedes hacerlo!',
            'resil_legend': 'Estás muy cerca de convertirte en leyenda. Sigue completando actividades y demostrando tu capacidad de superación.',
            'resil_veteran': 'Continúa completando actividades. Tu experiencia te está convirtiendo en un veterano de la resiliencia.',
            'resil_champion': 'Estás cerca de convertirte en campeón. Mantén tu dedicación y sigue superando desafíos.'
        },
        'continuidad': {
            'cont_day_1': 'Usa la plataforma todos los días para mantener una racha. La constancia es clave.',
            'cont_week_streak': 'Intenta usar la plataforma todos los días de la semana. Cada día cuenta para mantener tu racha.',
            'cont_biweekly': 'Mantén el ritmo diario. Estás construyendo un excelente hábito de bienestar.',
            'cont_month_streak': 'Usa la plataforma diariamente sin faltar. Un mes completo está a tu alcance.',
            'cont_2months': 'Mantén tu racha diaria. Dos meses consecutivos requieren constancia y dedicación.',
            'cont_3months': 'Continúa usando la plataforma todos los días. Un trimestre completo es un logro notable.',
            'cont_weekly_4': 'Usa la plataforma al menos una vez por semana. La regularidad semanal es importante.',
            'cont_weekly_8': 'Mantén el uso semanal constante. Ocho semanas muestran un compromiso sólido.',
            'cont_monthly_3': 'Usa la plataforma al menos una vez al mes. Tres meses consecutivos demuestran compromiso.',
            'cont_monthly_6': 'Mantén tu uso mensual. Seis meses consecutivos es un semestre completo de compromiso.',
            'cont_monthly_12': 'Usa la plataforma cada mes sin faltar. Un año completo requiere dedicación excepcional.'
        },
        'variedad': {
            'var_test_types': 'Prueba diferentes tipos de tests: Empatía, Autocuidado, y Resolución de Conflictos.',
            'var_all_tests': 'Completa todos los tipos de tests disponibles. Esto ampliará tu perspectiva del bienestar.',
            'var_activities': 'Explora diferentes tipos de actividades: tests, reflexiones y simuladores.',
            'var_survey_activity': 'Combina encuestas con actividades. Un enfoque balanceado es mejor para tu crecimiento.',
            'var_complete_all': 'Completa al menos una encuesta, un test, una reflexión y un simulador.',
            'var_reflection': 'Completa actividades de reflexión como el Diario de Gratitud. La autorreflexión es poderosa.',
            'var_simulator': 'Completa simuladores de decisiones éticas. Te ayudan a desarrollar habilidades sociales.'
        },
        'compromiso': {
            'commit_daily_user': 'Usa la plataforma todos los días de la semana. La constancia diaria es clave.',
            'commit_active_week': 'Completa varias actividades esta semana. Mantén un ritmo activo.',
            'commit_monthly_goal': 'Establece una meta mensual y cúmplela. Planifica tus actividades durante el mes.',
            'commit_quarter_goal': 'Mantén un ritmo constante durante el trimestre. Planea tus actividades con anticipación.',
            'commit_total_50': 'Combina encuestas, actividades y mensajes. Cada interacción te acerca a tu meta.',
            'commit_total_100': 'Mantén la constancia. Cada interacción suma hacia este logro importante.',
            'commit_total_200': 'Continúa con tu excelente compromiso. Tu dedicación te está llevando lejos.',
            'commit_total_500': 'Sé constante y dedicado. Este es un logro extraordinario que requiere compromiso a largo plazo.'
        },
        'mejora': {
            'improv_streak_2': 'Enfócate en mejorar tu bienestar continuamente. Cada mejora cuenta.',
            'improv_streak_5': 'Mantén una tendencia positiva. Reflexiona sobre qué te ayuda a mejorar.',
            'improv_streak_10': 'Continúa mejorando consecutivamente. Identifica patrones que te ayudan a crecer.',
            'improv_total_5': 'Cada vez que mejoras tu score, estás creciendo. Sigue trabajando en tu bienestar.',
            'improv_total_10': 'Has demostrado capacidad de mejora continua. Mantén este enfoque positivo.',
            'improv_total_20': 'Tu trayectoria de mejora es excepcional. Continúa aplicando lo que has aprendido.',
            'improv_high_score': 'Enfócate en alcanzar un score de 80 o más en alguna encuesta o actividad.',
            'improv_maintain_high': 'Una vez que alcances scores altos, trabaja para mantenerlos consistentemente.'
        }
    };
    
    return tips[categoryKey] && tips[categoryKey][badgeId] 
        ? tips[categoryKey][badgeId] 
        : 'Continúa participando en las actividades para desbloquear esta insignia.';
}


// Mostrar notificación de nuevo badge
function showBadgeNotification(newBadges) {
    newBadges.forEach(({ category, badge, level }) => {
        // Crear notificación visual
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #7BA680 0%, #8FC4D9 100%);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideInRight 0.5s ease-out;
            max-width: 350px;
        `;
        
        const isLevelUp = level && level > 1;
        const notificationTitle = isLevelUp ? `¡Subiste a Nivel ${level}!` : '¡Nueva Insignia Desbloqueada!';
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="font-size: 3em;">${badge.icon}</div>
                <div>
                    <div style="font-weight: 600; font-size: 1.1em; margin-bottom: 5px;">
                        ${notificationTitle}
                    </div>
                    <div style="font-size: 0.95em; opacity: 0.95;">
                        ${badge.name}${level > 1 ? ` - Nivel ${level}` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-out';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, 4000);
    });
}

function openSurveyModal(survey) {
    const modal = document.getElementById('surveyModal');
    const title = document.getElementById('modalSurveyTitle');
    const questionsDiv = document.getElementById('surveyQuestions');
    
    title.textContent = survey.title;
    
    // Usar el mismo sistema de navegación que los tests
    initSurveyNavigation(survey, questionsDiv);
    
    modal.style.display = 'block';
}

// Inicializar navegación pregunta por pregunta para encuestas
function initSurveyNavigation(survey, container) {
    const totalQuestions = survey.questions.length;
    window.currentSurveyQuestionIndex = 0;
    let answers = {};
    
    // Guardar encuesta en scope global para submit
    window.currentSurvey = survey;
    window.currentSurveyAnswers = answers;
    window.currentSurveyTotalQuestions = totalQuestions;
    
    function renderQuestion(index) {
        const question = survey.questions[index];
        const isFirst = index === 0;
        const isLast = index === totalQuestions - 1;
        const progress = ((index + 1) / totalQuestions) * 100;
        const currentAnswers = window.currentSurveyAnswers || {};
        
        // Mezclar aleatoriamente las opciones para fomentar la lectura completa
        const shuffledOptions = [...question.options];
        
        // Crear un seed único basado en el índice y contenido de la pregunta
        let seed = index * 7919;
        for (let i = 0; i < Math.min(question.text.length, 20); i++) {
            seed = ((seed << 5) - seed) + question.text.charCodeAt(i);
            seed = seed & seed; // Convert to 32bit integer
        }
        seed = Math.abs(seed);
        
        // Función de hash simple para generar números pseudoaleatorios determinísticos
        const hash = (num) => {
            let value = ((num << 5) - num) + seed;
            value = value & value; // Convert to 32bit integer
            return Math.abs(value) / 2147483647; // Normalize to 0-1
        };
        
        // Algoritmo Fisher-Yates con seed determinístico
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
            const j = Math.floor(hash(i * 9973) * (i + 1));
            [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }
        
        container.innerHTML = `
            <div class="test-navigation-container" style="max-width: 750px; margin: 0 auto; padding: 0 10px;">
                <!-- Barra de progreso -->
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 0.85em; color: #A3C9A8; font-weight: 600;">Pregunta ${index + 1} de ${totalQuestions}</span>
                        <span style="font-size: 0.85em; color: #666;">${Math.round(progress)}% completado</span>
                    </div>
                    <div style="width: 100%; height: 6px; background: #e8eef5; border-radius: 10px; overflow: hidden;">
                        <div id="surveyProgressBar" style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #7BA680 0%, #8FC4D9 100%); border-radius: 10px; transition: width 0.5s ease;"></div>
                    </div>
                </div>
                
                <!-- Contenedor de pregunta con animación -->
                <div id="surveyQuestionContainer" class="question-slide" style="background: white; padding: 25px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-bottom: 20px; transition: all 0.4s ease;">
                    <div style="margin-bottom: 18px;">
                        <h3 style="font-size: 1.2em; color: #1a2332; line-height: 1.5; margin: 0; font-weight: 600;">
                            ${sanitizeInput(question.text || '')}
                        </h3>
                    </div>
                    
                    <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fc; border-radius: 8px; border-left: 4px solid #A3C9A8;">
                        <p style="margin: 0; font-size: 0.85em; color: #555; font-style: italic;">
                            💡 Lee todas las opciones antes de seleccionar tu respuesta
                        </p>
                    </div>
                    
                    <div id="surveyOptionsContainer" class="options-container" style="display: flex; flex-direction: column; gap: 10px;">
                        ${shuffledOptions.map((option, oIndex) => {
                            const isSelected = currentAnswers[index] === option.value;
                            return `
                                <div 
                                    class="test-option ${isSelected ? 'selected' : ''}" 
                                    data-value="${option.value}"
                                    onclick="selectSurveyOption(${index}, ${option.value})"
                                    style="
                                        padding: 14px 16px; 
                                        background: ${isSelected ? '#f0f4ff' : 'white'}; 
                                        border: 2px solid ${isSelected ? '#A3C9A8' : '#e8eef5'}; 
                                        border-radius: 12px; 
                                        cursor: pointer; 
                                        transition: all 0.3s ease;
                                        display: flex;
                                        align-items: center;
                                        font-size: 0.95em;
                                        color: #333;
                                        opacity: 0;
                                        transform: translateY(10px);
                                        animation: fadeInOption 0.4s ease forwards;
                                        animation-delay: ${oIndex * 0.1}s;
                                        box-shadow: ${isSelected ? '0 2px 8px rgba(163,201,168,0.2)' : '0 1px 3px rgba(0,0,0,0.05)'};
                                    "
                                    onmouseover="if(!this.classList.contains('selected')) { this.style.borderColor='#A3C9A8'; this.style.background='#f8f9fc'; this.style.transform='translateX(5px) translateY(0)'; this.style.boxShadow='0 4px 12px rgba(163,201,168,0.15)'; }"
                                    onmouseout="if(!this.classList.contains('selected')) { this.style.borderColor='#e8eef5'; this.style.background='white'; this.style.transform='translateX(0) translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.05)'; }"
                                >
                                    <div style="
                                        width: 26px; 
                                        height: 26px; 
                                        border-radius: 50%; 
                                        border: 2px solid ${isSelected ? '#A3C9A8' : '#ccc'}; 
                                        background: ${isSelected ? '#A3C9A8' : 'white'};
                                        margin-right: 12px;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        flex-shrink: 0;
                                        transition: all 0.3s ease;
                                        font-weight: 600;
                                        font-size: 0.8em;
                                        color: ${isSelected ? 'white' : '#999'};
                                    ">
                                        ${isSelected ? '<span style="color: white; font-size: 14px;">✓</span>' : String.fromCharCode(65 + oIndex)}
                                    </div>
                                    <span style="flex: 1; font-weight: 500; line-height: 1.4;">${sanitizeInput(option.label || '')}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- Botones de navegación -->
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 15px;">
                    <button 
                        id="surveyPrevBtn"
                        onclick="navigateSurveyQuestion(${index - 1})"
                        style="
                            padding: 12px 30px; 
                            background: ${isFirst ? '#f0f0f0' : 'white'}; 
                            color: ${isFirst ? '#999' : '#A3C9A8'}; 
                            border: 2px solid ${isFirst ? '#e0e0e0' : '#A3C9A8'}; 
                            border-radius: 8px; 
                            cursor: ${isFirst ? 'not-allowed' : 'pointer'}; 
                            font-weight: 600;
                            transition: all 0.3s ease;
                            opacity: ${isFirst ? '0.5' : '1'};
                        "
                        ${isFirst ? 'disabled' : ''}
                        onmouseover="if(!this.disabled) { this.style.background='#f0f4ff'; }"
                        onmouseout="if(!this.disabled) { this.style.background='white'; }"
                    >
                        ← Anterior
                    </button>
                    
                    <div style="flex: 1; text-align: center;">
                        <span style="color: #666; font-size: 0.9em;">${index + 1} / ${totalQuestions}</span>
                    </div>
                    
                    ${isLast ? `
                        <button 
                            id="surveySubmitBtn"
                            onclick="submitSurveyActivity('${escapeHtmlAttribute(survey.id)}')"
                            style="
                                padding: 12px 30px; 
                                background: linear-gradient(135deg, #7BA680 0%, #8FC4D9 100%); 
                                color: white; 
                                border: none; 
                                border-radius: 8px; 
                                cursor: pointer; 
                                font-weight: 600;
                                transition: all 0.3s ease;
                                opacity: 0.5;
                            "
                            disabled
                            onmouseover="if(!this.disabled) { this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(163,201,168,0.3)'; }"
                            onmouseout="if(!this.disabled) { this.style.transform='translateY(0)'; this.style.boxShadow='none'; }"
                        >
                            Finalizar Encuesta
                        </button>
                    ` : `
                        <button 
                            id="surveyNextBtn"
                            onclick="navigateSurveyQuestion(${index + 1})"
                            style="
                                padding: 12px 30px; 
                                background: white; 
                                color: #A3C9A8; 
                                border: 2px solid #A3C9A8; 
                                border-radius: 8px; 
                                cursor: not-allowed; 
                                font-weight: 600;
                                transition: all 0.3s ease;
                                opacity: 0.5;
                            "
                            disabled
                            onmouseover="if(!this.disabled) { this.style.background='#f0f4ff'; }"
                            onmouseout="if(!this.disabled) { this.style.background='white'; }"
                        >
                            Siguiente →
                        </button>
                    `}
                </div>
            </div>
        `;
        
        // Actualizar estado del botón siguiente
        updateSurveyNextButtonState();
    }
    
    // Función para actualizar estado del botón siguiente
    function updateSurveyNextButtonState() {
        const nextBtn = document.getElementById('surveyNextBtn');
        const submitBtn = document.getElementById('surveySubmitBtn');
        const hasAnswer = window.currentSurveyAnswers[window.currentSurveyQuestionIndex] !== undefined;
        
        if (nextBtn) {
            nextBtn.disabled = !hasAnswer;
            nextBtn.style.opacity = hasAnswer ? '1' : '0.5';
            nextBtn.style.cursor = hasAnswer ? 'pointer' : 'not-allowed';
        }
        
        if (submitBtn) {
            submitBtn.disabled = !hasAnswer;
            submitBtn.style.opacity = hasAnswer ? '1' : '0.5';
            submitBtn.style.cursor = hasAnswer ? 'pointer' : 'not-allowed';
        }
    }
    
    // Función global para seleccionar opción
    window.selectSurveyOption = function(questionIndex, value) {
        answers[questionIndex] = value;
        window.currentSurveyAnswers = answers;
        
        // Actualizar visualización de opciones
        const options = document.querySelectorAll('#surveyOptionsContainer .test-option');
        options.forEach(opt => {
            const optValue = parseInt(opt.getAttribute('data-value'));
            if (optValue === value) {
                opt.classList.add('selected');
                opt.style.background = '#f0f4ff';
                opt.style.borderColor = '#A3C9A8';
                const circle = opt.querySelector('div');
                if (circle) {
                    circle.style.background = '#A3C9A8';
                    circle.style.borderColor = '#A3C9A8';
                    circle.innerHTML = '<span style="color: white; font-size: 16px;">✓</span>';
                }
            } else {
                opt.classList.remove('selected');
                opt.style.background = 'white';
                opt.style.borderColor = '#e8eef5';
                const circle = opt.querySelector('div');
                if (circle) {
                    circle.style.background = 'white';
                    circle.style.borderColor = '#ccc';
                    const letterIndex = Array.from(opt.parentElement.children).indexOf(opt);
                    circle.innerHTML = String.fromCharCode(65 + letterIndex);
                }
            }
        });
        
        // Habilitar botón siguiente después de un breve delay para feedback visual
        setTimeout(() => {
            updateSurveyNextButtonState();
        }, 200);
    };
    
    // Función global para navegar entre preguntas
    window.navigateSurveyQuestion = function(newIndex) {
        if (newIndex < 0 || newIndex >= totalQuestions) return;
        
        // Si se intenta avanzar, verificar que la pregunta actual esté respondida
        if (newIndex > window.currentSurveyQuestionIndex && window.currentSurveyAnswers[window.currentSurveyQuestionIndex] === undefined) {
            return;
        }
        
        // Animación de salida
        const questionContainer = document.getElementById('surveyQuestionContainer');
        if (questionContainer) {
            questionContainer.style.opacity = '0';
            questionContainer.style.transform = newIndex > window.currentSurveyQuestionIndex ? 'translateX(-20px)' : 'translateX(20px)';
        }
        
        setTimeout(() => {
            window.currentSurveyQuestionIndex = newIndex;
            renderQuestion(window.currentSurveyQuestionIndex);
        }, 200);
    };
    
    // Función global para enviar encuesta
    window.submitSurveyActivity = function(surveyId) {
        // Verificar que todas las preguntas estén respondidas
        if (Object.keys(window.currentSurveyAnswers).length !== totalQuestions) {
            const msg = typeof i18n !== 'undefined' ? i18n.t('validation.answerAllQuestions') : 'Por favor, responda todas las preguntas antes de finalizar.';
            showSuccessMessage(msg);
            return;
        }
        
        // Recopilar respuestas en el formato esperado
        const responses = [];
        window.currentSurvey.questions.forEach((question, qIndex) => {
            const answer = window.currentSurveyAnswers[qIndex];
            if (answer !== undefined) {
                responses.push({
                    questionIndex: qIndex,
                    questionText: question.text,
                    answer: answer,
                    answerValue: question.options.find(o => o.value === answer)?.label || ''
                });
            }
        });
        
        // Guardar respuestas temporalmente
        window.tempSurveyResponses = responses;
        
        // Llamar a la función submit original
        submitSurvey(window.currentSurvey);
    };
    
    // Renderizar primera pregunta
    renderQuestion(0);
}

function closeSurveyModal() {
    document.getElementById('surveyModal').style.display = 'none';
    
    // Limpiar variables globales de encuesta
    if (window.currentSurvey) {
        delete window.currentSurvey;
    }
    if (window.currentSurveyAnswers) {
        delete window.currentSurveyAnswers;
    }
    if (window.currentSurveyQuestionIndex !== undefined) {
        delete window.currentSurveyQuestionIndex;
    }
    if (window.currentSurveyTotalQuestions) {
        delete window.currentSurveyTotalQuestions;
    }
    if (window.tempSurveyResponses) {
        delete window.tempSurveyResponses;
    }
}

function submitSurvey(survey) {
    let responses = [];
    
    // Verificar si hay respuestas de la nueva interfaz de navegación
    if (window.tempSurveyResponses && window.tempSurveyResponses.length > 0) {
        responses = window.tempSurveyResponses;
        // Limpiar variable temporal
        delete window.tempSurveyResponses;
    } else {
        // Fallback al formulario antiguo (por compatibilidad)
        const form = document.getElementById('surveyForm');
        const formData = new FormData(form);
        
        survey.questions.forEach((question, qIndex) => {
            const answer = formData.get(`question_${qIndex}`);
            if (answer) {
                responses.push({
                    questionIndex: qIndex,
                    questionText: question.text,
                    answer: parseInt(answer),
                    answerValue: question.options.find(o => o.value === answer)?.label || ''
                });
            }
        });
    }
    
    if (responses.length !== survey.questions.length) {
        const msg = typeof i18n !== 'undefined' ? i18n.t('validation.answerAllQuestionsSubmit') : 'Por favor, responda todas las preguntas antes de enviar.';
        showSuccessMessage(msg);
        return;
    }
    
    const score = calculateSurveyScore(survey, responses);
    
    const surveyResponse = {
        id: Date.now().toString(),
        studentId: currentUser.id,
        studentName: currentUser.name,
        surveyId: survey.id,
        surveyTitle: survey.title,
        responses: responses,
        score: score,
        completedAt: new Date().toISOString()
    };
    
    const allResponses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
    allResponses.push(surveyResponse);
    localStorage.setItem('surveyResponses', JSON.stringify(allResponses));
    
    // Crear notificación para el docente cuando un estudiante completa una encuesta
    createSurveyNotification(currentUser.id, survey.title, surveyResponse);
    
    closeSurveyModal();
    loadSurveys();
    
    // Verificar y otorgar recompensas después de completar encuesta
    checkAndAwardRewards();
    
    // Actualizar estadísticas del dashboard
    updateStudentDashboardStats();
    
    const msg = typeof i18n !== 'undefined' ? i18n.t('success.surveySubmitted') : '¡Gracias por tu participación! 🙏\n\nTu respuesta es muy importante para nosotros. Cada encuesta que completas nos ayuda a entender mejor cómo crear un ambiente escolar más seguro y acogedor para todos.\n\n¡Valoramos mucho tu tiempo y honestidad!';
    showSuccessMessage(msg);
}

function calculateSurveyScore(survey, responses) {
    const total = responses.reduce((sum, r) => sum + r.answer, 0);
    const average = total / responses.length;
    const normalizedScore = (average / 5) * 100;
    // Asegurar que el score esté entre 0 y 100
    return Math.max(0, Math.min(100, Math.round(normalizedScore)));
}

function calculateActivityTestScore(responses) {
    const total = responses.reduce((sum, r) => sum + r.answer, 0);
    const average = total / responses.length;
    const normalizedScore = (average / 5) * 100;
    // Asegurar que el score esté entre 0 y 100
    return Math.max(0, Math.min(100, Math.round(normalizedScore)));
}

function openActivityModal(activity) {
    const modal = document.getElementById('activityModal');
    const title = document.getElementById('modalActivityTitle');
    const content = document.getElementById('activityContent');
    
    title.textContent = activity.title;
    
    if (activity.type === 'reflection') {
        content.innerHTML = `
            <div class="activity-content">
                <p>${activity.description}</p>
                <div class="form-group" style="margin-top: 20px;">
                    <label>¿Quieres escribir algo? (Opcional)</label>
                    <textarea id="reflectionText" rows="6" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px;" placeholder="${activity.placeholder || 'Comparte tus pensamientos...'}"></textarea>
                </div>
                <button class="btn-primary" onclick="submitActivity('${escapeHtmlAttribute(activity.id)}')">Marcar como Completada</button>
            </div>
        `;
    } else if (activity.type === 'exercise') {
        content.innerHTML = `
            <div class="activity-content">
                <p>${activity.description}</p>
                <div class="activity-item">
                    <h4>Instrucciones:</h4>
                    <p>${activity.instructions}</p>
                </div>
                <div class="form-group" style="margin-top: 20px;">
                    <label>¿Quieres escribir algo sobre esta actividad? (Opcional)</label>
                    <textarea id="reflectionText" rows="6" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px;" placeholder="Comparte tus pensamientos o experiencias sobre esta actividad..."></textarea>
                </div>
                <button class="btn-primary" onclick="submitActivity('${escapeHtmlAttribute(activity.id)}')">Marcar como Completada</button>
            </div>
        `;
    } else if (activity.type === 'test') {
        // Renderizar test con navegación pregunta por pregunta
        initTestNavigation(activity, content);
    } else if (activity.type === 'simulator') {
        initEthicalSimulator(content, activity.id);
    }
    
    modal.style.display = 'block';
}

// Inicializar navegación de test pregunta por pregunta
function initTestNavigation(activity, container) {
    window.currentTestQuestionIndex = 0;
    const totalQuestions = activity.questions.length;
    const answers = {}; // Almacenar respuestas
    
    // Guardar actividad en scope global para submit
    window.currentTestActivity = activity;
    window.currentTestAnswers = answers;
    window.currentTestTotalQuestions = totalQuestions;
    
    function renderQuestion(index) {
        const question = activity.questions[index];
        const isFirst = index === 0;
        const isLast = index === totalQuestions - 1;
        const progress = ((index + 1) / totalQuestions) * 100;
        const currentAnswers = window.currentTestAnswers || {};
        
        // Mezclar aleatoriamente las opciones para fomentar la lectura completa
        // Usar un seed determinístico basado en el índice de la pregunta y el texto
        // para que cada pregunta tenga un orden único pero consistente
        const shuffledOptions = [...question.options];
        
        // Crear un seed único basado en el índice y contenido de la pregunta
        let seed = index * 7919;
        for (let i = 0; i < Math.min(question.text.length, 20); i++) {
            seed = ((seed << 5) - seed) + question.text.charCodeAt(i);
            seed = seed & seed; // Convert to 32bit integer
        }
        seed = Math.abs(seed);
        
        // Función de hash simple para generar números pseudoaleatorios determinísticos
        const hash = (num) => {
            let value = ((num << 5) - num) + seed;
            value = value & value; // Convert to 32bit integer
            return Math.abs(value) / 2147483647; // Normalize to 0-1
        };
        
        // Algoritmo Fisher-Yates con seed determinístico
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
            const j = Math.floor(hash(i * 9973) * (i + 1));
            [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }
        
        container.innerHTML = `
            <div class="test-navigation-container" style="max-width: 750px; margin: 0 auto; padding: 0 10px;">
                <!-- Barra de progreso -->
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 0.85em; color: #A3C9A8; font-weight: 600;">Pregunta ${index + 1} de ${totalQuestions}</span>
                        <span style="font-size: 0.85em; color: #666;">${Math.round(progress)}% completado</span>
                    </div>
                    <div style="width: 100%; height: 6px; background: #e8eef5; border-radius: 10px; overflow: hidden;">
                        <div id="progressBar" style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #7BA680 0%, #8FC4D9 100%); border-radius: 10px; transition: width 0.5s ease;"></div>
                    </div>
                </div>
                
                <!-- Contenedor de pregunta con animación -->
                <div id="questionContainer" class="question-slide" style="background: white; padding: 25px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-bottom: 20px; transition: all 0.4s ease;">
                    <div style="margin-bottom: 18px;">
                        <h3 style="font-size: 1.2em; color: #1a2332; line-height: 1.5; margin: 0; font-weight: 600;">
                            ${sanitizeInput(question.text || '')}
                        </h3>
                    </div>
                    
                    <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fc; border-radius: 8px; border-left: 4px solid #A3C9A8;">
                        <p style="margin: 0; font-size: 0.85em; color: #555; font-style: italic;">
                            💡 Lee todas las opciones antes de seleccionar tu respuesta
                        </p>
                    </div>
                    
                    <div id="optionsContainer" class="options-container" style="display: flex; flex-direction: column; gap: 10px;">
                        ${shuffledOptions.map((option, oIndex) => {
                            const isSelected = currentAnswers[index] === option.value;
                            return `
                                <div 
                                    class="test-option ${isSelected ? 'selected' : ''}" 
                                    data-value="${option.value}"
                                    onclick="selectTestOption(${index}, ${option.value})"
                                    style="
                                        padding: 14px 16px; 
                                        background: ${isSelected ? '#f0f4ff' : 'white'}; 
                                        border: 2px solid ${isSelected ? '#A3C9A8' : '#e8eef5'}; 
                                        border-radius: 12px; 
                                        cursor: pointer; 
                                        transition: all 0.3s ease;
                                        display: flex;
                                        align-items: center;
                                        font-size: 0.95em;
                                        color: #333;
                                        opacity: 0;
                                        transform: translateY(10px);
                                        animation: fadeInOption 0.4s ease forwards;
                                        animation-delay: ${oIndex * 0.1}s;
                                        box-shadow: ${isSelected ? '0 2px 8px rgba(163,201,168,0.2)' : '0 1px 3px rgba(0,0,0,0.05)'};
                                    "
                                    onmouseover="if(!this.classList.contains('selected')) { this.style.borderColor='#A3C9A8'; this.style.background='#f8f9fc'; this.style.transform='translateX(5px) translateY(0)'; this.style.boxShadow='0 4px 12px rgba(163,201,168,0.15)'; }"
                                    onmouseout="if(!this.classList.contains('selected')) { this.style.borderColor='#e8eef5'; this.style.background='white'; this.style.transform='translateX(0) translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.05)'; }"
                                >
                                    <div style="
                                        width: 26px; 
                                        height: 26px; 
                                        border-radius: 50%; 
                                        border: 2px solid ${isSelected ? '#A3C9A8' : '#ccc'}; 
                                        background: ${isSelected ? '#A3C9A8' : 'white'};
                                        margin-right: 12px;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        flex-shrink: 0;
                                        transition: all 0.3s ease;
                                        font-weight: 600;
                                        font-size: 0.8em;
                                        color: ${isSelected ? 'white' : '#999'};
                                    ">
                                        ${isSelected ? '<span style="color: white; font-size: 14px;">✓</span>' : String.fromCharCode(65 + oIndex)}
                                    </div>
                                    <span style="flex: 1; font-weight: 500; line-height: 1.4;">${sanitizeInput(option.label || '')}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- Botones de navegación -->
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 15px;">
                    <button 
                        id="prevBtn"
                        onclick="navigateTestQuestion(${index - 1})"
                        style="
                            padding: 12px 30px; 
                            background: ${isFirst ? '#f0f0f0' : 'white'}; 
                            color: ${isFirst ? '#999' : '#A3C9A8'}; 
                            border: 2px solid ${isFirst ? '#e0e0e0' : '#A3C9A8'}; 
                            border-radius: 8px; 
                            cursor: ${isFirst ? 'not-allowed' : 'pointer'}; 
                            font-weight: 600;
                            transition: all 0.3s ease;
                            opacity: ${isFirst ? '0.5' : '1'};
                        "
                        ${isFirst ? 'disabled' : ''}
                        onmouseover="if(!this.disabled) { this.style.background='#f0f4ff'; }"
                        onmouseout="if(!this.disabled) { this.style.background='white'; }"
                    >
                        ← Anterior
                    </button>
                    
                    <div style="flex: 1; text-align: center;">
                        <span style="color: #666; font-size: 0.9em;">${index + 1} / ${totalQuestions}</span>
                    </div>
                    
                    ${isLast ? `
                        <button 
                            id="submitBtn"
                            onclick="submitTestActivity('${escapeHtmlAttribute(activity.id)}')"
                            style="
                                padding: 12px 30px; 
                                background: linear-gradient(135deg, #7BA680 0%, #8FC4D9 100%); 
                                color: white; 
                                border: none; 
                                border-radius: 8px; 
                                cursor: pointer; 
                                font-weight: 600;
                                transition: all 0.3s ease;
                                box-shadow: 0 4px 12px rgba(163,201,168,0.3);
                            "
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(163,201,168,0.4)';"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(163,201,168,0.3)';"
                        >
                            Finalizar Test ✓
                        </button>
                    ` : `
                        <button 
                            id="nextBtn"
                            onclick="navigateTestQuestion(${index + 1})"
                            style="
                                padding: 12px 30px; 
                                background: linear-gradient(135deg, #7BA680 0%, #8FC4D9 100%); 
                                color: white; 
                                border: none; 
                                border-radius: 8px; 
                                cursor: pointer; 
                                font-weight: 600;
                                transition: all 0.3s ease;
                                box-shadow: 0 4px 12px rgba(163,201,168,0.3);
                            "
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(163,201,168,0.4)';"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(163,201,168,0.3)';"
                        >
                            Siguiente →
                        </button>
                    `}
                </div>
            </div>
        `;
        
        // Actualizar estado del botón siguiente
        updateNextButtonState();
    }
    
    function updateNextButtonState() {
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        const hasAnswer = answers[window.currentTestQuestionIndex] !== undefined;
        
        if (nextBtn) {
            nextBtn.disabled = !hasAnswer;
            nextBtn.style.opacity = hasAnswer ? '1' : '0.5';
            nextBtn.style.cursor = hasAnswer ? 'pointer' : 'not-allowed';
        }
        
        if (submitBtn) {
            submitBtn.disabled = !hasAnswer;
            submitBtn.style.opacity = hasAnswer ? '1' : '0.5';
            submitBtn.style.cursor = hasAnswer ? 'pointer' : 'not-allowed';
        }
    }
    
    // Función global para seleccionar opción
    window.selectTestOption = function(questionIndex, value) {
        answers[questionIndex] = value;
        window.currentTestAnswers = answers;
        
        // Actualizar visualización de opciones
        const options = document.querySelectorAll('.test-option');
        options.forEach(opt => {
            const optValue = parseInt(opt.getAttribute('data-value'));
            if (optValue === value) {
                opt.classList.add('selected');
                opt.style.background = '#f0f4ff';
                opt.style.borderColor = '#A3C9A8';
                const circle = opt.querySelector('div');
                if (circle) {
                    circle.style.background = '#A3C9A8';
                    circle.style.borderColor = '#A3C9A8';
                    circle.innerHTML = '<span style="color: white; font-size: 14px;">✓</span>';
                }
            } else {
                opt.classList.remove('selected');
                opt.style.background = 'white';
                opt.style.borderColor = '#e8eef5';
                const circle = opt.querySelector('div');
                if (circle) {
                    circle.style.background = 'white';
                    circle.style.borderColor = '#ccc';
                    circle.innerHTML = '';
                }
            }
        });
        
        // Habilitar botón siguiente después de un breve delay para feedback visual
        setTimeout(() => {
            updateNextButtonState();
        }, 200);
    };
    
    // Función global para navegar entre preguntas
    window.navigateTestQuestion = function(newIndex) {
        if (newIndex < 0 || newIndex >= window.currentTestTotalQuestions) return;
        
        const currentIndex = window.currentTestQuestionIndex || 0;
        const answers = window.currentTestAnswers || {};
        
        // Validar que hay respuesta en la pregunta actual antes de avanzar
        if (newIndex > currentIndex && answers[currentIndex] === undefined) {
            const msg = typeof i18n !== 'undefined' ? i18n.t('validation.selectAnswer') : 'Por favor, selecciona una respuesta antes de continuar.';
            showSuccessMessage(msg);
            return;
        }
        
        // Animación de salida
        const questionContainer = document.getElementById('questionContainer');
        if (questionContainer) {
            questionContainer.style.opacity = '0';
            questionContainer.style.transform = newIndex > currentIndex ? 'translateX(-30px)' : 'translateX(30px)';
        }
        
        window.currentTestQuestionIndex = newIndex;
        
        // Renderizar nueva pregunta después de la animación
        setTimeout(() => {
            renderQuestion(window.currentTestQuestionIndex);
            
            // Animación de entrada
            setTimeout(() => {
                const newQuestionContainer = document.getElementById('questionContainer');
                if (newQuestionContainer) {
                    newQuestionContainer.style.opacity = '0';
                    newQuestionContainer.style.transform = newIndex > currentIndex ? 'translateX(30px)' : 'translateX(-30px)';
                    
                    setTimeout(() => {
                        newQuestionContainer.style.transition = 'all 0.4s ease';
                        newQuestionContainer.style.opacity = '1';
                        newQuestionContainer.style.transform = 'translateX(0)';
                    }, 50);
                }
            }, 50);
        }, 300);
    };
    
    // Función global para enviar el test
    window.submitTestActivity = function(activityId) {
        const activity = window.currentTestActivity;
        const answers = window.currentTestAnswers || {};
        
        if (!activity) {
            const msg = typeof i18n !== 'undefined' ? i18n.t('errors.processTestError') : 'Error al procesar el test. Por favor, intenta de nuevo.';
            showSuccessMessage(msg);
            return;
        }
        
        // Validar que todas las preguntas tienen respuesta
        const allAnswered = activity.questions.every((q, idx) => answers[idx] !== undefined);
        
        if (!allAnswered) {
            const msg = typeof i18n !== 'undefined' ? i18n.t('validation.answerAllQuestionsTest') : 'Por favor, responde todas las preguntas antes de finalizar el test.';
            showSuccessMessage(msg);
            return;
        }
        
        // Convertir respuestas al formato esperado
        const responses = activity.questions.map((question, qIndex) => {
            const answerValue = answers[qIndex];
            const option = question.options.find(o => o.value === answerValue);
            return {
                questionIndex: qIndex,
                questionText: question.text,
                answer: answerValue,
                answerValue: option ? option.label : ''
            };
        });
        
        // Guardar respuestas temporalmente y llamar a submitActivity
        window.tempTestResponses = responses;
        submitActivity(activityId);
    };
    
    // Renderizar primera pregunta
    renderQuestion(0);
}

// Inicializar el simulador de decisiones éticas
function initEthicalSimulator(container, activityId) {
    const scenarios = getEthicalScenarios();
    let currentScenarioIndex = window.currentScenarioIndex !== undefined ? window.currentScenarioIndex : 0;
    let decisions = window.simulatorDecisions || [];
    
    // Resetear si estamos empezando de nuevo
    if (currentScenarioIndex === 0 && decisions.length === 0) {
        window.simulatorDecisions = [];
        decisions = [];
    }
    
    // Variable para almacenar la selección temporal del escenario actual
    let currentSelection = null;
    
    function renderScenario() {
        const scenario = scenarios[currentScenarioIndex];
        const isLast = currentScenarioIndex === scenarios.length - 1;
        
        // Verificar si ya hay una decisión guardada para este escenario
        const existingDecision = decisions.find(d => d.scenarioId === scenario.id);
        if (existingDecision) {
            currentSelection = existingDecision;
        } else {
            currentSelection = null;
        }
        const selectedOptionId = currentSelection ? currentSelection.optionId : null;
        
        container.innerHTML = `
            <div class="activity-content" id="simulatorContent" style="max-width: 800px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #7BA680 0%, #8FC4D9 100%); padding: 20px; border-radius: 12px; margin-bottom: 25px; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h3 style="margin: 0; font-size: 1.4em;">${scenario.title}</h3>
                        <span style="background: rgba(255,255,255,0.3); padding: 5px 15px; border-radius: 20px; font-size: 0.9em;">
                            Escenario ${currentScenarioIndex + 1} de ${scenarios.length}
                        </span>
                    </div>
                </div>
                
                <div style="background: #f8f9fc; padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #A3C9A8;">
                    <p style="font-size: 1.1em; line-height: 1.8; color: #333; margin: 0;">
                        ${sanitizeInput(scenario.scenario || '')}
                    </p>
                </div>
                
                <div id="optionsContainer" style="margin-bottom: 25px;">
                    ${scenario.options.map((option, idx) => {
                        const escapedOptionId = escapeHtmlAttribute(option.id);
                        const escapedActivityId = escapeHtmlAttribute(activityId);
                        const sanitizedOptionText = sanitizeInput(option.text || '');
                        const isSelected = selectedOptionId === option.id;
                        return `
                        <button 
                            class="option-btn" 
                            data-option-id="${escapedOptionId}"
                            onclick="selectDecision(${currentScenarioIndex}, '${escapedOptionId}', ${idx}, '${escapedActivityId}')"
                            style="width: 100%; padding: 18px 20px; margin-bottom: 12px; background: ${isSelected ? '#f0f4ff' : 'white'}; border: 2px solid ${isSelected ? '#A3C9A8' : '#e8eef5'}; border-radius: 10px; text-align: left; cursor: pointer; transition: all 0.3s ease; font-size: 1em; color: #333; font-weight: ${isSelected ? '600' : '400'};"
                            onmouseover="if (!this.classList.contains('selected')) { this.style.borderColor='#A3C9A8'; this.style.boxShadow='0 2px 8px rgba(163,201,168,0.2)'; }"
                            onmouseout="if (!this.classList.contains('selected')) { this.style.borderColor='#e8eef5'; this.style.boxShadow='none'; }"
                        >
                            <span style="font-weight: 600; margin-right: 10px; color: #A3C9A8;">${String.fromCharCode(65 + idx)}.</span>
                            ${sanitizedOptionText}
                            ${isSelected ? '<span style="float: right; color: #A3C9A8; font-size: 1.2em;">✓</span>' : ''}
                        </button>
                    `;
                    }).join('')}
                </div>
                
                <div id="feedbackContainer" style="margin-top: 25px;">
                    ${selectedOptionId ? `
                        <div style="margin-top: 20px; text-align: center;">
                            ${currentScenarioIndex < scenarios.length - 1 ? `
                                <button 
                                    onclick="advanceToNextScenario('${escapeHtmlAttribute(actId)}')" 
                                    class="btn-primary"
                                    style="padding: 12px 30px; font-size: 1.1em; font-weight: 600; border-radius: 8px; background: linear-gradient(135deg, #7BA680 0%, #8FC4D9 100%); border: none; color: white; cursor: pointer; box-shadow: 0 4px 12px rgba(163,201,168,0.3); transition: all 0.3s ease;"
                                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(163,201,168,0.4)'"
                                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(163,201,168,0.3)'"
                                >
                                    Siguiente Escenario →
                                </button>
                            ` : `
                                <button 
                                    onclick="completeSimulator('${escapeHtmlAttribute(actId)}')" 
                                    class="btn-primary"
                                    style="padding: 12px 30px; font-size: 1.1em; font-weight: 600; border-radius: 8px; background: linear-gradient(135deg, #7BA680 0%, #8FC4D9 100%); border: none; color: white; cursor: pointer; box-shadow: 0 4px 12px rgba(163,201,168,0.3); transition: all 0.3s ease;"
                                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(163,201,168,0.4)'"
                                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(163,201,168,0.3)'"
                                >
                                    Finalizar Simulador ✓
                                </button>
                            `}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    // Guardar función para avanzar en el scope global
    window.selectDecision = function(scenarioIdx, optionId, optionIndex, actId) {
        const scenario = scenarios[scenarioIdx];
        const selectedOption = scenario.options.find(opt => opt.id === optionId);
        
        if (!selectedOption) return;
        
        // Actualizar selección temporal
        currentSelection = {
            scenarioId: scenario.id,
            scenarioTitle: scenario.title,
            optionId: optionId,
            optionText: selectedOption.text,
            ethicalScore: selectedOption.ethicalScore,
            feedback: selectedOption.feedback,
            tags: selectedOption.tags
        };
        
        // Actualizar visualización de botones (permitir cambiar selección)
        const optionsContainer = document.getElementById('optionsContainer');
        const buttons = optionsContainer.querySelectorAll('.option-btn');
        buttons.forEach((btn, idx) => {
            const btnOptionId = btn.getAttribute('data-option-id');
            if (btnOptionId === optionId) {
                // Marcar como seleccionado
                btn.classList.add('selected');
                btn.style.borderColor = '#A3C9A8';
                btn.style.backgroundColor = '#f0f4ff';
                btn.style.fontWeight = '600';
                btn.style.boxShadow = '0 2px 8px rgba(163,201,168,0.3)';
                // Agregar checkmark si no existe
                if (!btn.querySelector('span[style*="float: right"]')) {
                    const checkmark = document.createElement('span');
                    checkmark.style.cssText = 'float: right; color: #A3C9A8; font-size: 1.2em;';
                    checkmark.textContent = '✓';
                    btn.appendChild(checkmark);
                }
            } else {
                // Desmarcar otros botones
                btn.classList.remove('selected');
                btn.style.borderColor = '#e8eef5';
                btn.style.backgroundColor = 'white';
                btn.style.fontWeight = '400';
                btn.style.boxShadow = 'none';
                // Remover checkmark si existe
                const checkmark = btn.querySelector('span[style*="float: right"]');
                if (checkmark) {
                    checkmark.remove();
                }
            }
        });
        
        // Verificar si ya existe una decisión para este escenario
        const existingDecisionIndex = decisions.findIndex(d => d.scenarioId === scenario.id);
        if (existingDecisionIndex !== -1) {
            // Actualizar decisión existente
            decisions[existingDecisionIndex] = currentSelection;
        } else {
            // Agregar nueva decisión
            decisions.push(currentSelection);
        }
        
        // Mostrar botón para continuar
        const feedbackContainer = document.getElementById('feedbackContainer');
        feedbackContainer.innerHTML = `
            <div style="margin-top: 20px; text-align: center;">
                ${currentScenarioIndex < scenarios.length - 1 ? `
                    <button 
                        onclick="advanceToNextScenario('${escapeHtmlAttribute(actId)}')" 
                        class="btn-primary"
                        style="padding: 12px 30px; font-size: 1.1em; font-weight: 600; border-radius: 8px; background: linear-gradient(135deg, #7BA680 0%, #8FC4D9 100%); border: none; color: white; cursor: pointer; box-shadow: 0 4px 12px rgba(163,201,168,0.3); transition: all 0.3s ease;"
                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(163,201,168,0.4)'"
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(163,201,168,0.3)'"
                    >
                        Siguiente Escenario →
                    </button>
                ` : `
                    <button 
                        onclick="completeSimulator('${escapeHtmlAttribute(actId)}')" 
                        class="btn-primary"
                        style="padding: 12px 30px; font-size: 1.1em; font-weight: 600; border-radius: 8px; background: linear-gradient(135deg, #7BA680 0%, #8FC4D9 100%); border: none; color: white; cursor: pointer; box-shadow: 0 4px 12px rgba(163,201,168,0.3); transition: all 0.3s ease;"
                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(163,201,168,0.4)'"
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(163,201,168,0.3)'"
                    >
                        Finalizar Simulador ✓
                    </button>
                `}
            </div>
        `;
        
        feedbackContainer.style.display = 'block';
        
        // Guardar decisiones en window para acceso global
        window.simulatorDecisions = decisions;
        window.currentScenarioIndex = currentScenarioIndex;
        window.simulatorActivityId = actId;
    };
    
    window.advanceToNextScenario = function(actId) {
        if (currentScenarioIndex < scenarios.length - 1) {
            // Guardar la decisión actual antes de avanzar
            if (currentSelection) {
                const existingDecisionIndex = decisions.findIndex(d => d.scenarioId === currentSelection.scenarioId);
                if (existingDecisionIndex !== -1) {
                    decisions[existingDecisionIndex] = currentSelection;
                } else {
                    decisions.push(currentSelection);
                }
            }
            window.simulatorDecisions = decisions;
            window.currentScenarioIndex = currentScenarioIndex + 1;
            const container = document.getElementById('activityContent');
            if (container) {
                initEthicalSimulator(container, actId);
            }
        }
    };
    
    window.completeSimulator = function(actId) {
        // Guardar la decisión actual antes de finalizar
        if (currentSelection) {
            const existingDecisionIndex = decisions.findIndex(d => d.scenarioId === currentSelection.scenarioId);
            if (existingDecisionIndex !== -1) {
                decisions[existingDecisionIndex] = currentSelection;
            } else {
                decisions.push(currentSelection);
            }
        }
        // Asegurar que las decisiones estén guardadas
        window.simulatorDecisions = decisions;
        
        // Calcular score promedio (solo para guardar internamente, no se muestra al estudiante)
        const avgScore = decisions.length > 0 ? decisions.reduce((sum, d) => sum + d.ethicalScore, 0) / decisions.length : 0;
        
        // Guardar resultados en localStorage temporal para submitActivity
        window.simulatorResults = {
            decisions: decisions,
            averageScore: Math.round(avgScore),
            completedScenarios: decisions.length,
            totalScenarios: scenarios.length
        };
        
        // Mostrar mensaje de completado sin scores ni detalles
        container.innerHTML = `
            <div class="activity-content" style="max-width: 800px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #7BA680 0%, #8FC4D9 100%); padding: 30px; border-radius: 12px; margin-bottom: 25px; color: white; text-align: center; box-shadow: 0 4px 12px rgba(163,201,168,0.3);">
                    <h2 style="margin: 0 0 10px 0; font-size: 2em;">🎉 ¡Simulador Completado!</h2>
                    <p style="margin: 0; font-size: 1.1em; opacity: 0.9;">Has completado todos los escenarios. ¡Excelente trabajo!</p>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <div style="text-align: center; padding: 20px;">
                        <div style="font-size: 3em; margin-bottom: 15px;">✨</div>
                        <p style="font-size: 1.1em; line-height: 1.8; color: #333; margin-bottom: 20px;">
                            Gracias por participar en este simulador de decisiones éticas. Cada decisión que tomaste es valiosa y contribuye a tu crecimiento personal y al bienestar de nuestra comunidad escolar.
                        </p>
                        <p style="font-size: 1em; line-height: 1.8; color: #666;">
                            Has completado <strong>${decisions.length}</strong> escenario${decisions.length !== 1 ? 's' : ''}. ¡Sigue practicando la toma de decisiones responsables!
                        </p>
                    </div>
                    
                    <div style="margin-top: 25px;">
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 10px; color: #333; font-weight: 500;">¿Quieres escribir una reflexión sobre esta experiencia? (Opcional)</label>
                            <textarea id="reflectionText" rows="5" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-family: inherit; resize: vertical;" placeholder="Comparte tus pensamientos sobre esta experiencia y lo que aprendiste..."></textarea>
                        </div>
                        <button class="btn-primary" onclick="submitActivity('${escapeHtmlAttribute(actId)}')" style="width: 100%; padding: 15px; font-size: 1.1em; font-weight: 600; margin-top: 15px; border-radius: 8px; background: linear-gradient(135deg, #7BA680 0%, #8FC4D9 100%); border: none; color: white; cursor: pointer; box-shadow: 0 4px 12px rgba(163,201,168,0.3); transition: all 0.3s ease;">
                            Guardar y Completar Actividad
                        </button>
                    </div>
                </div>
            </div>
        `;
    };
    
    // Renderizar primer escenario
    renderScenario();
}

function closeActivityModal() {
    document.getElementById('activityModal').style.display = 'none';
    
    // Limpiar variables globales del test
    if (window.currentTestActivity) {
        delete window.currentTestActivity;
        delete window.currentTestAnswers;
        delete window.currentTestQuestionIndex;
        delete window.currentTestTotalQuestions;
        delete window.tempTestResponses;
    }
}

async function submitActivity(activityId) {
    const activities = getAvailableActivities();
    const activity = activities.find(a => a.id === activityId);
    
    if (!activity) return;
    
    let activityData = {
        id: Date.now().toString(),
        studentId: currentUser.id,
        studentName: currentUser.name,
        activityId: activityId,
        activityTitle: activity.title,
        completedAt: new Date().toISOString()
    };
    
    // Si es tipo test, calcular score
    if (activity.type === 'test') {
        let responses = [];
        
        // Verificar si hay respuestas de la nueva interfaz de navegación
        if (window.tempTestResponses && window.tempTestResponses.length > 0) {
            responses = window.tempTestResponses;
            // Limpiar variable temporal
            delete window.tempTestResponses;
        } else {
            // Fallback al formulario antiguo (por compatibilidad)
            const form = document.getElementById('activityTestForm');
            if (!form) {
                const msg = typeof i18n !== 'undefined' ? i18n.t('validation.completeAllQuestions') : 'Por favor, completa todas las preguntas antes de continuar.';
                showSuccessMessage(msg);
                return;
            }
            
            const formData = new FormData(form);
            
            activity.questions.forEach((question, qIndex) => {
                const answer = formData.get(`activity_question_${qIndex}`);
                if (!answer) {
                    const msg = typeof i18n !== 'undefined' ? i18n.t('validation.completeAllQuestions') : 'Por favor, responda todas las preguntas antes de continuar.';
                    showSuccessMessage(msg);
                    return;
                }
                responses.push({
                    questionIndex: qIndex,
                    questionText: question.text,
                    answer: parseInt(answer),
                    answerValue: question.options.find(o => o.value === parseInt(answer))?.label || ''
                });
            });
        }
        
        if (responses.length !== activity.questions.length) {
            const msg = typeof i18n !== 'undefined' ? i18n.t('validation.answerAllQuestionsRequired') : 'Por favor, responda todas las preguntas.';
            showSuccessMessage(msg);
            return;
        }
        
        // Calcular score similar a las encuestas
        const score = calculateActivityTestScore(responses);
        activityData.testScore = score;
        activityData.responses = responses;
        
        // Guardar también en surveyResponses para que se incluya en el cálculo de bienestar
        const testResponse = {
            id: Date.now().toString(),
            studentId: currentUser.id,
            studentName: currentUser.name,
            surveyId: activity.id,
            surveyTitle: activity.title,
            responses: responses,
            score: score,
            completedAt: new Date().toISOString(),
            isActivityTest: true
        };
        
        const allResponses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
        allResponses.push(testResponse);
        localStorage.setItem('surveyResponses', JSON.stringify(allResponses));
        
    } else if (activity.type === 'simulator' && window.simulatorResults) {
        // Si es el simulador, guardar resultados del simulador
        activityData.simulatorResults = window.simulatorResults;
        activityData.ethicalScore = window.simulatorResults.averageScore;
        
        // Guardar también en surveyResponses para que se incluya en el cálculo de bienestar
        const simulatorResponse = {
            id: Date.now().toString(),
            studentId: currentUser.id,
            studentName: currentUser.name,
            surveyId: activity.id,
            surveyTitle: activity.title,
            score: window.simulatorResults.averageScore,
            completedAt: new Date().toISOString(),
            isSimulator: true,
            simulatorResults: window.simulatorResults
        };
        
        const allResponses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
        allResponses.push(simulatorResponse);
        localStorage.setItem('surveyResponses', JSON.stringify(allResponses));
        
        // Analizar keywords de las decisiones si hay reflexión
        const reflectionTextElement = document.getElementById('reflectionText');
        if (reflectionTextElement) {
            const reflectionText = reflectionTextElement.value.trim();
            if (reflectionText) {
                activityData.reflection = reflectionText;
                // Análisis de keywords removido - se implementará más adelante
            }
        }
    } else {
        // Todas las actividades ahora pueden tener texto opcional
        const reflectionTextElement = document.getElementById('reflectionText');
        if (reflectionTextElement) {
            const reflectionText = reflectionTextElement.value.trim();
            if (reflectionText) {
                activityData.reflection = reflectionText;
                // Análisis de keywords removido - se implementará más adelante
            }
        }
    }
    
    const allActivities = JSON.parse(localStorage.getItem('studentActivities') || '[]');
    allActivities.push(activityData);
    localStorage.setItem('studentActivities', JSON.stringify(allActivities));
    
    // Crear notificación para el docente si el estudiante pertenece a su clase
    createActivityNotification(currentUser.id, activity.title, activity.type, activityData);
    
    // Limpiar variables globales del simulador
    if (window.simulatorResults) {
        delete window.simulatorResults;
        delete window.simulatorDecisions;
        delete window.currentScenarioIndex;
    }
    
    closeActivityModal();
    loadActivities();
    
    // Verificar y otorgar recompensas después de completar actividad
    checkAndAwardRewards();
    
    // Actualizar estadísticas del dashboard
    updateStudentDashboardStats();
    
    // Recargar recompensas si el modal está abierto
    const rewardsModal = document.getElementById('rewardsModal');
    if (rewardsModal && rewardsModal.style.display === 'block') {
        loadRewards();
    }
    
    // Mostrar mensaje empático sin revelar el score específico
    if (activity.type === 'test') {
        const msg = typeof i18n !== 'undefined' ? i18n.t('success.activityCompleted') : '¡Excelente trabajo! 🎉\n\nHas completado la actividad con dedicación. Tu participación es muy valiosa y nos ayuda a crear un ambiente de bienestar en la escuela.\n\n¡Gracias por tomarte el tiempo de reflexionar sobre estas importantes situaciones!';
        showSuccessMessage(msg);
    } else {
        const msg = typeof i18n !== 'undefined' ? i18n.t('success.activityCompletedSimple') : '¡Actividad completada exitosamente! 🎉\n\nGracias por participar y contribuir al bienestar de nuestra comunidad escolar.';
        showSuccessMessage(msg);
    }
}

// Crear notificación para el docente cuando un estudiante completa una actividad
function createActivityNotification(studentId, activityTitle, activityType, activityData) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const student = users.find(u => u.id === studentId && u.role === 'student');
    
    if (!student) return;
    
    let teacherId = null;
    
    // Intentar encontrar el docente por clase primero
    if (student.classCode) {
    const classData = classes.find(c => c.code === student.classCode);
        if (classData && classData.teacherId) {
            teacherId = classData.teacherId;
        }
    }
    
    // Si no se encontró por clase, buscar por clientId o dominio del email
    if (!teacherId) {
        if (student.clientId) {
            // Buscar profesores del mismo cliente
            const clientTeachers = users.filter(u => 
                u.role === 'teacher' && u.clientId === student.clientId
            );
            if (clientTeachers.length > 0) {
                // Usar el primer profesor del cliente
                teacherId = clientTeachers[0].id;
            }
        } else if (student.email) {
            // Buscar por dominio del email como fallback
            const studentDomain = student.email.split('@')[1];
            const clientTeachers = users.filter(u => 
                u.role === 'teacher' && u.email.includes(`@${studentDomain}`)
            );
            if (clientTeachers.length > 0) {
                teacherId = clientTeachers[0].id;
            }
        }
    }
    
    // Si aún no se encontró un profesor, no crear notificación
    if (!teacherId) {
        console.warn('⚠️ No se encontró profesor para el estudiante:', studentId);
        return;
    }
    
    // Obtener o crear array de notificaciones
    let notifications = JSON.parse(localStorage.getItem('teacherNotifications') || '[]');
    
    // Crear la notificación (SIN incluir score para mantener privacidad)
    const notification = {
        id: Date.now().toString(),
        teacherId: teacherId,
        studentId: studentId,
        studentName: student.name,
        activityTitle: activityTitle,
        activityType: activityType,
        activityId: activityData.id,
        // NO incluir score - el docente solo debe saber que se completó la actividad
        completedAt: activityData.completedAt,
        read: false,
        createdAt: new Date().toISOString()
    };
    
    try {
    notifications.push(notification);
    localStorage.setItem('teacherNotifications', JSON.stringify(notifications));
        
        // Actualizar notificaciones si el docente está viendo el dashboard
        if (currentUser && currentUser.role === 'teacher' && currentUser.id === teacherId) {
            loadTeacherNotifications();
        }
        
        console.log('✅ Notificación creada para profesor:', teacherId, 'Estudiante:', student.name, 'Actividad:', activityTitle);
    } catch (error) {
        console.error('❌ Error al crear notificación:', error);
    }
}

// Crear notificación urgente cuando se detecta riesgo en un mensaje
function createUrgentNotificationFromMessage(studentId, message, keywordAnalysis) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const student = users.find(u => u.id === studentId && u.role === 'student');
    
    if (!student) return;
    
    let teacherId = null;
    
    // Intentar encontrar el docente por clase primero
    if (student.classCode) {
    const classData = classes.find(c => c.code === student.classCode);
        if (classData && classData.teacherId) {
            teacherId = classData.teacherId;
        }
    }
    
    // Si no se encontró por clase, buscar por clientId o dominio del email
    if (!teacherId) {
        if (student.clientId) {
            // Buscar profesores del mismo cliente
            const clientTeachers = users.filter(u => 
                u.role === 'teacher' && u.clientId === student.clientId
            );
            if (clientTeachers.length > 0) {
                // Usar el primer profesor del cliente
                teacherId = clientTeachers[0].id;
            }
        } else if (student.email) {
            // Buscar por dominio del email como fallback
            const studentDomain = student.email.split('@')[1];
            const clientTeachers = users.filter(u => 
                u.role === 'teacher' && u.email.includes(`@${studentDomain}`)
            );
            if (clientTeachers.length > 0) {
                teacherId = clientTeachers[0].id;
            }
        }
    }
    
    // Si aún no se encontró un profesor, no crear notificación
    if (!teacherId) {
        console.warn('⚠️ No se encontró profesor para el estudiante:', studentId);
        return;
    }
    
    // Obtener o crear array de notificaciones
    let notifications = JSON.parse(localStorage.getItem('teacherNotifications') || '[]');
    
    // Determinar tipo y título según nivel de riesgo
    // IMPORTANTE: Los mensajes son ANÓNIMOS, NO revelar el nombre del estudiante
    const isCritical = keywordAnalysis.nivelRiesgo === 'CRITICO';
    const title = isCritical 
        ? `⚠️ ALERTA CRÍTICA: Mensaje Anónimo`
        : `🔴 ALERTA: Mensaje Anónimo requiere atención`;
    
    // Crear la notificación urgente
    // IMPORTANTE: NO incluir studentName para mantener el anonimato
    const notification = {
        id: `urgent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        teacherId: teacherId,
        studentId: studentId, // Se guarda internamente pero NO se muestra
        studentName: null, // NO incluir nombre para mantener anonimato
        type: 'message_urgent',
        title: title,
        message: keywordAnalysis.sugerencia || 'Mensaje requiere atención inmediata',
        activityTitle: 'Mensaje Anónimo',
        activityType: 'message',
        activityId: message.id,
        messageId: message.id,
        anonymousId: message.anonymousId,
        nivelRiesgo: keywordAnalysis.nivelRiesgo,
        categoria: keywordAnalysis.categoria,
        keywordsDetectadas: keywordAnalysis.keywordsDetectadas,
        urgencia: keywordAnalysis.urgencia,
        razon: keywordAnalysis.razon,
        sugerencia: keywordAnalysis.sugerencia,
        completedAt: message.timestamp,
        read: false,
        isUrgent: true,
        isAnonymous: true, // Marcar como anónimo
        createdAt: new Date().toISOString()
    };
    
    try {
        notifications.push(notification);
        localStorage.setItem('teacherNotifications', JSON.stringify(notifications));
        
        // Actualizar notificaciones si el docente está viendo el dashboard
        if (currentUser && currentUser.role === 'teacher' && currentUser.id === teacherId) {
            loadTeacherNotifications();
            updateRiskAlertsBadge();
        }
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            console.warn('⚠️ localStorage lleno. No se puede crear la notificación.');
            // Intentar limpiar notificaciones antiguas (más de 30 días)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const cleanedNotifications = notifications.filter(n => {
                const notifDate = new Date(n.createdAt || n.completedAt || 0);
                return notifDate > thirtyDaysAgo;
            });
            
            try {
                cleanedNotifications.push(notification);
                localStorage.setItem('teacherNotifications', JSON.stringify(cleanedNotifications));
                console.log('✅ Notificación creada después de limpiar notificaciones antiguas');
            } catch (retryError) {
                console.error('❌ No se pudo crear la notificación incluso después de limpiar:', retryError);
            }
        } else {
            console.error('❌ Error al crear notificación:', error);
        }
    }
}

// Cargar y mostrar notificaciones del docente
function loadTeacherNotifications() {
    if (!currentUser || currentUser.role !== 'teacher') return;
    
    // Si el usuario es admin@munay.com o munay@munay.com, usar lógica especial
    const isAdmin = currentUser.email === 'admin@munay.com' || currentUser.email === 'munay@munay.com';
    
    let teacherNotifications;
    if (isAdmin) {
        // El admin ve todas las notificaciones de estudiantes demo
        const notifications = JSON.parse(localStorage.getItem('teacherNotifications') || '[]');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const demoStudentIds = users
            .filter(u => u.role === 'student' && u.classCode === 'CLSDEMO')
            .map(u => u.id);
        teacherNotifications = notifications
            .filter(n => demoStudentIds.includes(n.studentId))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
        // Para otros docentes: usar notificaciones del cliente
        const clientNotifications = getClientNotifications();
        teacherNotifications = clientNotifications
            .filter(n => {
                // Si la notificación tiene teacherId, debe coincidir
                if (n.teacherId) {
                    return n.teacherId === currentUser.id;
                }
                // Si no tiene teacherId, incluir todas las notificaciones del cliente
                return true;
            })
            .sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp));
    }
    
    // Actualizar badge con punto rojo (sin número) para notificaciones no leídas
    const unreadCount = teacherNotifications.filter(n => !n.read).length;
    // Actualizar todos los badges de notificaciones en el nav
    const badges = document.querySelectorAll('.notification-badge-nav');
    badges.forEach(badge => {
        if (badge) {
            if (unreadCount > 0) {
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }
    });
    
    // Cargar notificaciones en la vista si está visible
    const notificationsView = document.getElementById('teacherNotificationsView');
    if (notificationsView && !notificationsView.classList.contains('hidden')) {
        renderNotifications(teacherNotifications);
    } else {
        // Si la vista no está visible, guardar las notificaciones para cuando se muestre
        // Esto asegura que se carguen cuando se abra la vista
        window.pendingNotifications = teacherNotifications;
    }
}

// Renderizar notificaciones en el panel
function renderNotifications(notifications) {
    const container = document.getElementById('notificationsList');
    if (!container) return;
    
    if (notifications.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #666;">
                <p style="font-size: 1.1em; margin-bottom: 10px;">📭</p>
                <p style="font-size: 1.05em; margin-bottom: 5px; color: #333;">${typeof i18n !== 'undefined' ? i18n.t('stats.noNotifications') : 'No hay notificaciones'}</p>
                <p style="font-size: 0.9em;">${typeof i18n !== 'undefined' ? i18n.t('stats.noNotificationsDesc') : 'Tus estudiantes aún no han completado actividades.'}</p>
            </div>
        `;
        return;
    }
    
    // Función para obtener la etiqueta de fecha
    function getDateLabel(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const notificationDate = new Date(date);
        notificationDate.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (notificationDate.getTime() === today.getTime()) {
            return 'Hoy';
        } else if (notificationDate.getTime() === yesterday.getTime()) {
            return 'Ayer';
        } else {
            return notificationDate.toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
        }
    }
    
    // Agrupar notificaciones por fecha
    const groupedByDate = {};
    notifications.forEach(notification => {
        // Usar completedAt o createdAt como fallback
        const notificationDate = notification.completedAt || notification.createdAt || new Date().toISOString();
        const date = new Date(notificationDate);
        const dateKey = date.toDateString(); // Clave única por día
        
        if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = [];
        }
        groupedByDate[dateKey].push(notification);
    });
    
    // Ordenar fechas de más reciente a más antigua
    const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
        return new Date(b) - new Date(a);
    });
    
    let html = '';
    
    // Iterar sobre cada fecha
    sortedDates.forEach(dateKey => {
        const dateNotifications = groupedByDate[dateKey];
        const notificationDate = dateNotifications[0].completedAt || dateNotifications[0].createdAt || new Date().toISOString();
        const dateLabel = getDateLabel(notificationDate);
        
        // Separar notificaciones anónimas (mensajes) de no anónimas (actividades)
        const anonymousNotifications = dateNotifications.filter(n => n.isAnonymous || n.type === 'message_urgent' || n.activityType === 'message');
        const regularNotifications = dateNotifications.filter(n => !n.isAnonymous && n.type !== 'message_urgent' && n.activityType !== 'message');
        
        // Bloque de fecha
        html += `
            <div style="margin-bottom: 30px;">
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #e8eef5;
                ">
                    <span style="font-size: 1.2em;">📅</span>
                    <h3 style="
                        margin: 0;
                        font-size: 1.1em;
                        font-weight: 600;
                        color: #1a2332;
                    ">${dateLabel}</h3>
                    <span style="
                        background: #f0f4ff;
                        color: #A3C9A8;
                        padding: 4px 12px;
                        border-radius: 12px;
                        font-size: 0.85em;
                        font-weight: 600;
                    ">${dateNotifications.length} actividad${dateNotifications.length !== 1 ? 'es' : ''}</span>
                </div>
        `;
        
        // PRIMERO: Mostrar notificaciones anónimas (mensajes) SIN agrupar por estudiante
        if (anonymousNotifications.length > 0) {
            anonymousNotifications.sort((a, b) => {
                const dateA = a.completedAt || a.createdAt || '';
                const dateB = b.completedAt || b.createdAt || '';
                return new Date(dateB) - new Date(dateA);
            });
            
            anonymousNotifications.forEach(notification => {
                const date = new Date(notification.completedAt || notification.createdAt || new Date());
                const isRead = notification.read;
                const isCritical = notification.nivelRiesgo === 'CRITICO';
                const isHigh = notification.nivelRiesgo === 'ALTO';
                const urgencyBg = isCritical ? '#dc3545' : isHigh ? '#ff9800' : '#A3C9A8';
                
                html += `
                    <div class="notification-item" style="
                        padding: 14px;
                        background: #ffffff;
                        border-left: 4px solid ${urgencyBg};
                        border-radius: 8px;
                        margin-bottom: 12px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    " 
                    onmouseover="this.style.transform='translateX(4px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.1)'"
                    onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.05)'"
                    onclick="markNotificationAsRead('${escapeHtmlAttribute(notification.id)}')"
                    >
                        <div style="display: flex; justify-content: space-between; align-items: start; gap: 12px;">
                            <div style="flex: 1;">
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                    <span style="font-size: 1.2em;">${isCritical ? '⚠️' : isHigh ? '🔴' : '📩'}</span>
                                    <h4 style="
                                        margin: 0;
                                        font-size: 0.95em;
                                        font-weight: 600;
                                        color: #1a2332;
                                    ">${sanitizeInput(notification.title || 'Mensaje Anónimo')}</h4>
                                    ${!isRead ? `
                                        <span style="
                                            background: ${urgencyBg};
                                            color: white;
                                            border-radius: 50%;
                                            width: 8px;
                                            height: 8px;
                                            display: inline-block;
                                        "></span>
                                    ` : ''}
                                </div>
                                <p style="
                                    margin: 0 0 8px 0;
                                    font-size: 0.9em;
                                    color: #666;
                                    line-height: 1.4;
                                ">${sanitizeInput(notification.message || notification.sugerencia || 'Mensaje requiere atención')}</p>
                                ${notification.keywordsDetectadas && notification.keywordsDetectadas.length > 0 ? `
                                    <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;">
                                        ${notification.keywordsDetectadas.slice(0, 3).map(kw => {
                                            const sanitizedKeyword = sanitizeInput(String(kw || ''));
                                            return `<span style="
                                                background: ${urgencyBg}20;
                                                color: ${urgencyBg};
                                                padding: 3px 8px;
                                                border-radius: 12px;
                                                font-size: 0.75em;
                                                font-weight: 600;
                                            ">${sanitizedKeyword}</span>`;
                                        }).join('')}
                                        ${notification.keywordsDetectadas.length > 3 ? `<span style="font-size: 0.75em; color: #999;">+${notification.keywordsDetectadas.length - 3} más</span>` : ''}
                                    </div>
                                ` : ''}
                                <p style="
                                    margin: 8px 0 0 0;
                                    font-size: 0.8em;
                                    color: #999;
                                ">${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        
        // SEGUNDO: Mostrar notificaciones regulares (actividades) agrupadas por estudiante
        if (regularNotifications.length > 0) {
            // Agrupar notificaciones regulares por estudiante
            const groupedByStudent = {};
            regularNotifications.forEach(notification => {
                if (!groupedByStudent[notification.studentId]) {
                    groupedByStudent[notification.studentId] = [];
                }
                groupedByStudent[notification.studentId].push(notification);
            });
            
            // Iterar sobre cada estudiante
            Object.keys(groupedByStudent).forEach(studentId => {
                // Ordenar notificaciones del estudiante por hora (más reciente primero)
                const studentNotifications = groupedByStudent[studentId].sort((a, b) => {
                    return new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt);
                });
                const studentName = studentNotifications[0].studentName || 'Estudiante';
                const unreadCount = studentNotifications.filter(n => !n.read).length;
            
            // Bloque de estudiante con acordeón
            const studentBlockId = `student-notifications-${studentId}-${dateKey.replace(/\s/g, '-')}`;
            html += `
                <div style="
                    margin-bottom: 20px;
                    background: #f8f9fc;
                    border-radius: 12px;
                    padding: 15px;
                    border-left: 4px solid #A3C9A8;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                ">
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 0;
                    ">
                        <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                            <button 
                                onclick="toggleStudentNotifications('${escapeHtmlAttribute(studentBlockId)}')"
                                style="
                                    background: transparent;
                                    border: none;
                                    cursor: pointer;
                                    padding: 4px 8px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    transition: transform 0.3s ease;
                                    color: #A3C9A8;
                                    font-size: 1.2em;
                                "
                                id="toggle-btn-${escapeHtmlAttribute(studentBlockId)}"
                                title="Expandir/Contraer notificaciones"
                            >
                                <span id="toggle-icon-${escapeHtmlAttribute(studentBlockId)}" style="transition: transform 0.3s ease;">▼</span>
                            </button>
                            <span style="font-size: 1.3em;">👤</span>
                            <h4 style="
                                margin: 0;
                                font-size: 1em;
                                font-weight: 600;
                                color: #1a2332;
                                flex: 1;
                            ">${studentName}</h4>
                            ${unreadCount > 0 ? `
                                <span style="
                                    background: #A3C9A8;
                                    color: white;
                                    border-radius: 50%;
                                    width: 20px;
                                    height: 20px;
                                    display: inline-flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 0.75em;
                                    font-weight: 600;
                                ">${unreadCount}</span>
                            ` : ''}
                        </div>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            ${unreadCount > 0 ? `
                                <button 
                                    onclick="event.stopPropagation(); markStudentNotificationsAsRead('${escapeHtmlAttribute(studentId)}', '${escapeHtmlAttribute(dateKey)}')"
                                    style="
                                        padding: 6px 14px;
                                        font-size: 0.85em;
                                        background: linear-gradient(135deg, #7BA680 0%, #8FC4D9 100%);
                                        border: none;
                                        color: white;
                                        border-radius: 20px;
                                        cursor: pointer;
                                        font-weight: 600;
                                        transition: all 0.3s ease;
                                        box-shadow: 0 2px 4px rgba(123, 166, 128, 0.2);
                                    "
                                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(123, 166, 128, 0.3)'"
                                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(123, 166, 128, 0.2)'"
                                    title="Marcar todas las notificaciones de ${escapeHtmlAttribute(studentName)} como leídas"
                                >
                                    ✓ Marcar como leídas
                                </button>
                            ` : ''}
                            ${!studentNotifications[0].isAnonymous ? `
                                <button 
                                    class="btn-secondary" 
                                    onclick="viewStudentFromNotification('${escapeHtmlAttribute(studentId)}')"
                                    style="
                                        padding: 6px 12px;
                                        font-size: 0.85em;
                                        background: white;
                                        border: 1px solid #A3C9A8;
                                        color: #A3C9A8;
                                        border-radius: 20px;
                                        transition: all 0.3s ease;
                                    "
                                    onmouseover="this.style.background='#A3C9A8'; this.style.color='white'"
                                    onmouseout="this.style.background='white'; this.style.color='#A3C9A8'"
                                >
                                    Ver perfil
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div 
                        id="${escapeHtmlAttribute(studentBlockId)}"
                        style="
                            display: flex;
                            flex-direction: column;
                            gap: 10px;
                            margin-top: 15px;
                            max-height: 1000px;
                            overflow: hidden;
                            transition: max-height 0.4s ease, opacity 0.3s ease;
                            opacity: 1;
                        "
                    >
            `;
            
            // Mostrar cada notificación del estudiante
            studentNotifications.forEach(notification => {
                const date = new Date(notification.completedAt);
                const isRead = notification.read;
                const hoverBg = isRead ? '#f8f9fc' : '#f0f4ff';
                html += `
                    <div class="notification-item" style="
                        padding: 14px;
                        background: #ffffff;
                        border-left: 3px solid ${isRead ? '#ccc' : '#A3C9A8'};
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                        ${!isRead ? 'border: 1px solid #e0e7ff;' : ''}
                    " 
                    onclick="viewStudentFromNotification('${escapeHtmlAttribute(notification.studentId)}')"
                    onmouseover="this.style.background='${hoverBg}'; this.style.transform='translateX(2px)'"
                    onmouseout="this.style.background='#ffffff'; this.style.transform='translateX(0)'"
                    >
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                            <div style="flex: 1;">
                                <p style="margin: 0; font-weight: ${isRead ? '500' : '600'}; color: #1A1A1A; font-size: 0.95em; line-height: 1.4;">
                                    <strong>${notification.activityTitle}</strong>
                                </p>
                                <p style="margin: 4px 0 0 0; font-size: 0.85em; color: #666;">
                                    Actividad completada
                                </p>
                            </div>
                            ${!isRead ? `
                                <span style="background: #A3C9A8; color: white; border-radius: 50%; width: 8px; height: 8px; display: inline-block; margin-left: 10px; flex-shrink: 0;"></span>
                            ` : ''}
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                            <span style="font-size: 0.8em; color: #999;">
                                ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <button class="btn-secondary" onclick="event.stopPropagation(); markNotificationAsRead('${escapeHtmlAttribute(notification.id)}')" style="padding: 4px 10px; font-size: 0.8em;">
                                ${isRead ? '✓ Leída' : 'Marcar como leída'}
                            </button>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
            });
        }
        
        html += `</div>`;
    });
    
    container.innerHTML = html;
}

// Mostrar vista de notificaciones
function showTeacherNotificationsView() {
    document.getElementById('landingView').classList.add('hidden');
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('studentView').classList.add('hidden');
    document.getElementById('studentMessagesView').classList.add('hidden');
    document.getElementById('studentProfileView').classList.add('hidden');
    document.getElementById('teacherView').classList.add('hidden');
    document.getElementById('teacherMessagesView').classList.add('hidden');
    document.getElementById('teacherRiskAlertsView').classList.add('hidden');
    document.getElementById('teacherStudentsView').classList.add('hidden');
    document.getElementById('teacherNotificationsView').classList.remove('hidden');
    document.getElementById('teacherClassCodesView').classList.add('hidden');
    document.getElementById('teacherGrowthSpacesView').classList.add('hidden');
    currentView = 'teacherNotifications';
    updateTeacherNavActive('notifications');
    
    // Actualizar nombre del usuario
    updateTeacherName();
    
    // Actualizar hash en la URL
    history.replaceState({ view: 'teacherNotifications' }, '', '#teacherNotifications');
    
    // Cargar notificaciones - usar setTimeout para asegurar que el DOM esté listo
    setTimeout(() => {
        loadTeacherNotifications();
        // Si hay notificaciones pendientes, renderizarlas también
        if (window.pendingNotifications) {
            renderNotifications(window.pendingNotifications);
            window.pendingNotifications = null;
        }
    }, 100);
    
    updateRiskAlertsBadge();
    
    // Actualizar historial
    if (history.state?.view !== 'teacherNotifications') {
        history.pushState({ view: 'teacherNotifications' }, '', window.location.pathname);
    }
}

// Marcar notificación como leída
function markNotificationAsRead(notificationId) {
    let notifications = JSON.parse(localStorage.getItem('teacherNotifications') || '[]');
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        localStorage.setItem('teacherNotifications', JSON.stringify(notifications));
        loadTeacherNotifications();
    updateRiskAlertsBadge();
    }
}

// Marcar todas las notificaciones como leídas
function markAllNotificationsAsRead() {
    if (!currentUser || currentUser.role !== 'teacher') {
        console.warn('⚠️ markAllNotificationsAsRead: Usuario no autorizado');
        return;
    }
    
    const notifications = JSON.parse(localStorage.getItem('teacherNotifications') || '[]');
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Si el usuario es admin@munay.com, marcar todas las notificaciones de estudiantes demo
    const isAdmin = currentUser.email === 'admin@munay.com';
    let updated = false;
    
    const updatedNotifications = notifications.map(n => {
        let shouldMark = false;
        
        if (isAdmin) {
            // Para admin, marcar todas las notificaciones de estudiantes demo
            const demoStudentIds = users
                .filter(u => u.role === 'student' && u.classCode === 'CLSDEMO')
                .map(u => u.id);
            if (demoStudentIds.includes(n.studentId) && !n.read) {
                shouldMark = true;
            }
        } else {
            // Para docente normal, marcar solo las suyas
            if (n.teacherId === currentUser.id && !n.read) {
                shouldMark = true;
            }
        }
        
        if (shouldMark) {
            n.read = true;
            updated = true;
        }
        
        return n;
    });
    
    if (updated) {
        localStorage.setItem('teacherNotifications', JSON.stringify(updatedNotifications));
        console.log('✅ Todas las notificaciones marcadas como leídas');
        
        // Mostrar mensaje de éxito
        if (typeof i18n !== 'undefined') {
            showSuccessMessage(i18n.t('success.allNotificationsMarkedRead') || '✅ Todas las notificaciones marcadas como leídas');
        } else {
            showSuccessMessage('✅ Todas las notificaciones marcadas como leídas');
        }
        
        loadTeacherNotifications();
        updateRiskAlertsBadge();
    } else {
        console.log('ℹ️ No hay notificaciones para marcar como leídas');
        // No mostrar mensaje si no hay notificaciones, solo log en consola
    }
}

// Toggle para expandir/contraer notificaciones de un estudiante
function toggleStudentNotifications(blockId) {
    const block = document.getElementById(blockId);
    const toggleIcon = document.getElementById(`toggle-icon-${blockId}`);
    
    if (!block) return;
    
    // Verificar el estado actual
    const isExpanded = block.style.maxHeight && block.style.maxHeight !== '0px' && block.style.maxHeight !== '';
    const computedStyle = window.getComputedStyle(block);
    const currentMaxHeight = block.style.maxHeight || computedStyle.maxHeight;
    
    if (currentMaxHeight === '0px' || (!block.style.maxHeight && computedStyle.maxHeight === '0px')) {
        // Expandir - calcular altura real del contenido
        block.style.maxHeight = 'none';
        const scrollHeight = block.scrollHeight;
        block.style.maxHeight = '0px';
        
        // Forzar reflow
        void block.offsetHeight;
        
        // Animar a la altura real
        block.style.maxHeight = scrollHeight + 'px';
        block.style.opacity = '1';
        block.style.marginTop = '15px';
        if (toggleIcon) {
            toggleIcon.textContent = '▼';
            toggleIcon.style.transform = 'rotate(0deg)';
        }
    } else {
        // Contraer
        block.style.maxHeight = '0px';
        block.style.opacity = '0';
        block.style.marginTop = '0px';
        if (toggleIcon) {
            toggleIcon.textContent = '▶';
            toggleIcon.style.transform = 'rotate(0deg)';
        }
    }
}

// Marcar todas las notificaciones de un estudiante como leídas
function markStudentNotificationsAsRead(studentId, dateKey) {
    if (!currentUser || currentUser.role !== 'teacher') return;
    
    let notifications = JSON.parse(localStorage.getItem('teacherNotifications') || '[]');
    let updated = false;
    
    notifications = notifications.map(n => {
        if (n.teacherId === currentUser.id && 
            n.studentId === studentId && 
            !n.read) {
            const notificationDate = new Date(n.completedAt);
            const notificationDateKey = notificationDate.toDateString();
            
            if (dateKey && notificationDateKey === dateKey) {
                // Solo marcar las de esta fecha si se especifica dateKey
                n.read = true;
                updated = true;
            } else if (!dateKey) {
                // Marcar todas las del estudiante si no se especifica fecha
                n.read = true;
                updated = true;
            }
        }
        return n;
    });
    
    if (updated) {
        localStorage.setItem('teacherNotifications', JSON.stringify(notifications));
        loadTeacherNotifications();
    updateRiskAlertsBadge();
        const studentName = notifications.find(n => n.studentId === studentId)?.studentName || (typeof i18n !== 'undefined' ? i18n.t('common.student') : 'estudiante');
        const msg = typeof i18n !== 'undefined' ? i18n.t('success.notificationsMarkedRead', { name: studentName }) : `✅ Notificaciones de ${studentName} marcadas como leídas.`;
        showSuccessMessage(msg);
    }
}

// Ver estudiante desde notificación
function viewStudentFromNotification(studentId) {
    showTeacherStudentsView();
    setTimeout(() => {
        viewStudentDetail(studentId);
    }, 300);
}

function getStudentResponses() {
    if (!currentUser || !currentUser.id || currentUser.role !== 'student') {
        return [];
    }
    const allResponses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
    // Filtrar estrictamente por el ID del estudiante actual
    return allResponses.filter(r => r.studentId === currentUser.id);
}

function getStudentActivities() {
    if (!currentUser || !currentUser.id || currentUser.role !== 'student') {
        return [];
    }
    const allActivities = JSON.parse(localStorage.getItem('studentActivities') || '[]');
    // Filtrar estrictamente por el ID del estudiante actual
    return allActivities.filter(a => a.studentId === currentUser.id);
}

// Función auxiliar para determinar el grupo de edad
function getAgeGroup(age) {
    if (!age) return '12-15'; // Default si no hay edad
    if (age >= 9 && age <= 11) return '9-11';
    if (age >= 12 && age <= 15) return '12-15';
    if (age >= 16 && age <= 17) return '16-17';
    return '12-15'; // Default
}

function getAvailableSurveys(studentAge = null) {
    const ageGroup = getAgeGroup(studentAge);
    return getSurveysByAgeGroup(ageGroup);
}

// Función que retorna encuestas adaptadas por grupo de edad
function getSurveysByAgeGroup(ageGroup) {
    if (ageGroup === '9-11') {
        return getSurveysFor9to11();
    } else if (ageGroup === '12-15') {
        return getSurveysFor12to15();
    } else {
        return getSurveysFor16to17();
    }
}

// Encuestas para niños de 9-11 años (lenguaje simple y cuidadoso)
function getSurveysFor9to11() {
    return [
        {
            id: 'wellbeing_survey',
            title: 'Cómo me siento en la escuela',
            description: 'Cuéntanos cómo te sientes cuando estás en la escuela',
            questions: [
                {
                    text: '¿Cómo te sientes cuando vas a la escuela?',
                    options: [
                        { value: 1, label: 'Muy triste' },
                        { value: 2, label: 'Un poco triste' },
                        { value: 3, label: 'Normal' },
                        { value: 4, label: 'Contento/a' },
                        { value: 5, label: 'Muy contento/a' }
                    ]
                },
                {
                    text: '¿Tus compañeros son amables contigo?',
                    options: [
                        { value: 1, label: 'Nunca' },
                        { value: 2, label: 'Pocas veces' },
                        { value: 3, label: 'A veces' },
                        { value: 4, label: 'Muchas veces' },
                        { value: 5, label: 'Siempre' }
                    ]
                },
                {
                    text: '¿Tienes amigos con quienes jugar en el recreo?',
                    options: [
                        { value: 1, label: 'Nunca tengo amigos' },
                        { value: 2, label: 'Pocas veces' },
                        { value: 3, label: 'A veces' },
                        { value: 4, label: 'Muchas veces' },
                        { value: 5, label: 'Siempre tengo amigos' }
                    ]
                },
                {
                    text: '¿Te han dicho cosas que te hicieron sentir mal?',
                    options: [
                        { value: 1, label: 'Muchas veces' },
                        { value: 2, label: 'Algunas veces' },
                        { value: 3, label: 'Pocas veces' },
                        { value: 4, label: 'Casi nunca' },
                        { value: 5, label: 'Nunca' }
                    ]
                },
                {
                    text: '¿Puedes contar tus problemas a un adulto (maestro, mamá, papá)?',
                    options: [
                        { value: 1, label: 'Nunca puedo' },
                        { value: 2, label: 'Pocas veces' },
                        { value: 3, label: 'A veces' },
                        { value: 4, label: 'Muchas veces' },
                        { value: 5, label: 'Siempre puedo' }
                    ]
                },
                {
                    text: '¿Te gusta estar en la escuela?',
                    options: [
                        { value: 1, label: 'No me gusta nada' },
                        { value: 2, label: 'Poco' },
                        { value: 3, label: 'Un poco' },
                        { value: 4, label: 'Mucho' },
                        { value: 5, label: 'Me encanta' }
                    ]
                }
            ]
        },
        {
            id: 'bullying_prevention',
            title: 'Cómo ayudarnos a estar seguros',
            description: 'Ayúdanos a saber si todos nos tratamos bien',
            questions: [
                {
                    text: '¿Has visto que algún compañero trate mal a otro?',
                    options: [
                        { value: 1, label: 'Muchas veces' },
                        { value: 2, label: 'Algunas veces' },
                        { value: 3, label: 'Pocas veces' },
                        { value: 4, label: 'Casi nunca' },
                        { value: 5, label: 'Nunca' }
                    ]
                },
                {
                    text: 'Cuando ves que tratan mal a alguien, ¿qué haces?',
                    options: [
                        { value: 1, label: 'No hago nada' },
                        { value: 2, label: 'Me alejo' },
                        { value: 3, label: 'Le digo a un adulto (maestro, director)' },
                        { value: 4, label: 'Le digo que pare' },
                        { value: 5, label: 'Ayudo a quien está triste' }
                    ]
                },
                {
                    text: '¿Sabes qué hacer si alguien te trata mal?',
                    options: [
                        { value: 1, label: 'No sé qué hacer' },
                        { value: 2, label: 'Sé un poco' },
                        { value: 3, label: 'Sé algunas cosas' },
                        { value: 4, label: 'Sé bastante' },
                        { value: 5, label: 'Sé muy bien qué hacer' }
                    ]
                },
                {
                    text: '¿Todos en tu clase se tratan con respeto y amabilidad?',
                    options: [
                        { value: 1, label: 'No, nunca' },
                        { value: 2, label: 'Pocas veces' },
                        { value: 3, label: 'A veces' },
                        { value: 4, label: 'Muchas veces' },
                        { value: 5, label: 'Siempre' }
                    ]
                }
            ]
        }
    ];
}

// Encuestas para adolescentes de 12-15 años
function getSurveysFor12to15() {
    return [
        {
            id: 'wellbeing_survey',
            title: 'Encuesta de Bienestar General',
            description: 'Evalúa tu nivel de bienestar y satisfacción en el entorno escolar',
            questions: [
                {
                    text: '¿Cómo te sientes cuando estás en la escuela?',
                    options: [
                        { value: 1, label: 'Muy incómodo/a' },
                        { value: 2, label: 'Incómodo/a' },
                        { value: 3, label: 'Neutral' },
                        { value: 4, label: 'Cómodo/a' },
                        { value: 5, label: 'Muy cómodo/a' }
                    ]
                },
                {
                    text: '¿Con qué frecuencia te sientes feliz en la escuela?',
                    options: [
                        { value: 1, label: 'Nunca' },
                        { value: 2, label: 'Rara vez' },
                        { value: 3, label: 'A veces' },
                        { value: 4, label: 'A menudo' },
                        { value: 5, label: 'Siempre' }
                    ]
                },
                {
                    text: '¿Te sientes apoyado/a por tus compañeros?',
                    options: [
                        { value: 1, label: 'Nunca' },
                        { value: 2, label: 'Rara vez' },
                        { value: 3, label: 'A veces' },
                        { value: 4, label: 'A menudo' },
                        { value: 5, label: 'Siempre' }
                    ]
                },
                {
                    text: '¿Has experimentado situaciones de acoso o bullying?',
                    options: [
                        { value: 1, label: 'Sí, frecuentemente' },
                        { value: 2, label: 'Sí, algunas veces' },
                        { value: 3, label: 'Rara vez' },
                        { value: 4, label: 'Nunca' },
                        { value: 5, label: 'No estoy seguro/a' }
                    ]
                },
                {
                    text: '¿Te sientes seguro/a expresando tus emociones?',
                    options: [
                        { value: 1, label: 'Nunca' },
                        { value: 2, label: 'Rara vez' },
                        { value: 3, label: 'A veces' },
                        { value: 4, label: 'A menudo' },
                        { value: 5, label: 'Siempre' }
                    ]
                },
                {
                    text: '¿Cómo calificarías tu relación con tus compañeros?',
                    options: [
                        { value: 1, label: 'Muy mala' },
                        { value: 2, label: 'Mala' },
                        { value: 3, label: 'Regular' },
                        { value: 4, label: 'Buena' },
                        { value: 5, label: 'Excelente' }
                    ]
                }
            ]
        },
        {
            id: 'bullying_prevention',
            title: 'Prevención del Bullying',
            description: 'Ayúdanos a identificar situaciones de riesgo en el aula',
            questions: [
                {
                    text: '¿Has presenciado actos de bullying hacia otros compañeros?',
                    options: [
                        { value: 1, label: 'Muy frecuentemente' },
                        { value: 2, label: 'Algunas veces' },
                        { value: 3, label: 'Rara vez' },
                        { value: 4, label: 'Nunca' },
                        { value: 5, label: 'No estoy seguro/a' }
                    ]
                },
                {
                    text: '¿Cómo reaccionas cuando presencias una situación de bullying?',
                    options: [
                        { value: 1, label: 'No hago nada' },
                        { value: 2, label: 'Me alejo' },
                        { value: 3, label: 'Busco ayuda de un adulto' },
                        { value: 4, label: 'Intervengo directamente' },
                        { value: 5, label: 'Apoyo a la víctima' }
                    ]
                },
                {
                    text: '¿Te sientes preparado/a para reconocer situaciones de bullying?',
                    options: [
                        { value: 1, label: 'No, para nada' },
                        { value: 2, label: 'Un poco' },
                        { value: 3, label: 'Moderadamente' },
                        { value: 4, label: 'Bastante' },
                        { value: 5, label: 'Completamente' }
                    ]
                },
                {
                    text: '¿Crees que el ambiente en tu clase es respetuoso?',
                    options: [
                        { value: 1, label: 'No para nada' },
                        { value: 2, label: 'Poco' },
                        { value: 3, label: 'Moderadamente' },
                        { value: 4, label: 'Bastante' },
                        { value: 5, label: 'Totalmente' }
                    ]
                }
            ]
        }
    ];
}

// Encuestas para jóvenes de 16-17 años (más maduros y específicos)
function getSurveysFor16to17() {
    return [
        {
            id: 'wellbeing_survey',
            title: 'Encuesta de Bienestar General',
            description: 'Evalúa tu nivel de bienestar y satisfacción en el entorno escolar',
            questions: [
                {
                    text: '¿Cómo evalúas tu bienestar emocional general en el entorno escolar?',
                    options: [
                        { value: 1, label: 'Muy bajo' },
                        { value: 2, label: 'Bajo' },
                        { value: 3, label: 'Moderado' },
                        { value: 4, label: 'Alto' },
                        { value: 5, label: 'Muy alto' }
                    ]
                },
                {
                    text: '¿Con qué frecuencia experimentas emociones positivas en la escuela?',
                    options: [
                        { value: 1, label: 'Nunca' },
                        { value: 2, label: 'Rara vez' },
                        { value: 3, label: 'Ocasionalmente' },
                        { value: 4, label: 'Frecuentemente' },
                        { value: 5, label: 'Constantemente' }
                    ]
                },
                {
                    text: '¿Qué nivel de apoyo percibes de tu grupo de compañeros?',
                    options: [
                        { value: 1, label: 'Ninguno' },
                        { value: 2, label: 'Muy poco' },
                        { value: 3, label: 'Moderado' },
                        { value: 4, label: 'Considerable' },
                        { value: 5, label: 'Excelente' }
                    ]
                },
                {
                    text: '¿Has sido víctima de acoso, hostigamiento o discriminación en el entorno escolar?',
                    options: [
                        { value: 1, label: 'Sí, de forma sistemática' },
                        { value: 2, label: 'Sí, ocasionalmente' },
                        { value: 3, label: 'Rara vez' },
                        { value: 4, label: 'No, nunca' },
                        { value: 5, label: 'No estoy seguro/a' }
                    ]
                },
                {
                    text: '¿Qué tan cómodo/a te sientes expresando tus emociones y preocupaciones?',
                    options: [
                        { value: 1, label: 'Muy incómodo/a' },
                        { value: 2, label: 'Incómodo/a' },
                        { value: 3, label: 'Moderadamente cómodo/a' },
                        { value: 4, label: 'Cómodo/a' },
                        { value: 5, label: 'Muy cómodo/a' }
                    ]
                },
                {
                    text: '¿Cómo describirías la calidad de tus relaciones interpersonales con tus compañeros?',
                    options: [
                        { value: 1, label: 'Muy deficiente' },
                        { value: 2, label: 'Deficiente' },
                        { value: 3, label: 'Aceptable' },
                        { value: 4, label: 'Buena' },
                        { value: 5, label: 'Excelente' }
                    ]
                }
            ]
        },
        {
            id: 'bullying_prevention',
            title: 'Prevención del Bullying',
            description: 'Ayúdanos a identificar situaciones de riesgo y mejorar el clima escolar',
            questions: [
                {
                    text: '¿Con qué frecuencia presencias actos de bullying, hostigamiento o discriminación?',
                    options: [
                        { value: 1, label: 'Muy frecuentemente' },
                        { value: 2, label: 'Regularmente' },
                        { value: 3, label: 'Ocasionalmente' },
                        { value: 4, label: 'Rara vez' },
                        { value: 5, label: 'Nunca' }
                    ]
                },
                {
                    text: 'Cuando presencias una situación de acoso, ¿cuál es tu reacción típica?',
                    options: [
                        { value: 1, label: 'No intervengo' },
                        { value: 2, label: 'Me alejo de la situación' },
                        { value: 3, label: 'Busco ayuda de una figura de autoridad' },
                        { value: 4, label: 'Intervengo de manera directa' },
                        { value: 5, label: 'Apoyo activamente a la víctima y busco ayuda' }
                    ]
                },
                {
                    text: '¿Qué tan preparado/a te sientes para identificar y responder a situaciones de bullying?',
                    options: [
                        { value: 1, label: 'No preparado/a en absoluto' },
                        { value: 2, label: 'Poco preparado/a' },
                        { value: 3, label: 'Moderadamente preparado/a' },
                        { value: 4, label: 'Bien preparado/a' },
                        { value: 5, label: 'Muy bien preparado/a' }
                    ]
                },
                {
                    text: '¿Cómo evaluarías el nivel de respeto y tolerancia en tu entorno escolar?',
                    options: [
                        { value: 1, label: 'Muy bajo' },
                        { value: 2, label: 'Bajo' },
                        { value: 3, label: 'Moderado' },
                        { value: 4, label: 'Alto' },
                        { value: 5, label: 'Muy alto' }
                    ]
                }
            ]
        }
    ];
}

// ========== SIMULADOR DE DECISIONES ÉTICAS ==========

function getEthicalScenarios() {
    if (!cachedEthicalScenarios) {
        cachedEthicalScenarios = generateEthicalScenarios();
    }
    
    const monthIndex = getCurrentMonthIndex();
    // Devolver un subconjunto de escenarios basado en el mes para rotación
    // Cada mes muestra diferentes escenarios sin repetir
    const scenariosPerMonth = 10; // 10 escenarios por mes = 100 escenarios en 10 meses
    const startIndex = (monthIndex * scenariosPerMonth) % cachedEthicalScenarios.length;
    const endIndex = startIndex + scenariosPerMonth;
    
    // Retornar los escenarios del mes actual
    return cachedEthicalScenarios.slice(startIndex, endIndex);
}

function getEthicalScenariosAll() {
    // Función legacy que devuelve todos los escenarios (para compatibilidad)
    return [
        {
            id: 1,
            title: 'El Nuevo Estudiante',
            scenario: 'Ves que un grupo de estudiantes se está burlando de un nuevo compañero que llegó hace una semana. Lo están excluyendo y haciendo comentarios despectivos sobre su forma de vestir. ¿Qué harías?',
            options: [
                {
                    id: 'a',
                    text: 'Intervenir directamente y decirles que dejen de molestar',
                    feedback: 'Excelente decisión. Intervenir de manera directa pero respetuosa muestra valentía y empatía. Esta acción puede detener el bullying y hacer que el nuevo estudiante se sienta apoyado. Recuerda que siempre puedes pedir ayuda a un adulto si la situación se vuelve difícil.',
                    ethicalScore: 95,
                    tags: ['valentía', 'empatía', 'acción directa']
                },
                {
                    id: 'b',
                    text: 'Hablar con el nuevo estudiante después para ofrecerle tu amistad',
                    feedback: 'Buena iniciativa. Ofrecer amistad y apoyo es importante, pero considera que mientras tanto el bullying puede continuar. Lo ideal sería combinar esta acción con comunicar la situación a un adulto o intervenir cuando sea seguro hacerlo.',
                    ethicalScore: 75,
                    tags: ['empatía', 'apoyo', 'comunicación']
                },
                {
                    id: 'c',
                    text: 'Contarle a un profesor o adulto responsable',
                    feedback: 'Muy bien. Informar a un adulto es una decisión responsable, especialmente si no te sientes seguro interviniendo directamente. Los adultos están preparados para manejar estas situaciones y pueden tomar medidas apropiadas. Combinar esto con apoyo al estudiante afectado sería ideal.',
                    ethicalScore: 85,
                    tags: ['responsabilidad', 'búsqueda de ayuda', 'seguridad']
                },
                {
                    id: 'd',
                    text: 'No hacer nada para evitar problemas',
                    feedback: 'Entiendo que puede ser intimidante, pero no actuar permite que el bullying continúe. El silencio puede hacer que el estudiante afectado se sienta aún más aislado. Considera al menos hablar con un adulto de confianza - incluso de forma anónima si es necesario. Tu voz puede hacer la diferencia.',
                    ethicalScore: 30,
                    tags: ['pasividad', 'necesita mejora']
                }
            ]
        },
        {
            id: 2,
            title: 'El Rumor Falso',
            scenario: 'Escuchas un rumor falso sobre un compañero que está afectando su reputación. El rumor se está esparciendo rápidamente por el grupo. ¿Cuál es tu respuesta?',
            options: [
                {
                    id: 'a',
                    text: 'Aclarar el rumor con tus compañeros cuando lo escuches',
                    feedback: 'Excelente. Aclarar rumores falsos es crucial para prevenir daño emocional. Al corregir información incorrecta, proteges la reputación y bienestar de tu compañero. Esto muestra integridad y valentía moral.',
                    ethicalScore: 90,
                    tags: ['integridad', 'valentía moral', 'protección']
                },
                {
                    id: 'b',
                    text: 'Hablar directamente con el estudiante afectado para ver cómo está',
                    feedback: 'Buena decisión. Mostrar preocupación y apoyo al estudiante afectado es importante. Sin embargo, también sería valioso que ayudes a detener la propagación del rumor hablando con otros cuando lo escuches.',
                    ethicalScore: 70,
                    tags: ['empatía', 'apoyo', 'comunicación directa']
                },
                {
                    id: 'c',
                    text: 'Ignorar el rumor para no involucrarte',
                    feedback: 'Comprendo que puedas querer evitar el conflicto, pero ignorar rumores dañinos permite que continúen causando daño. Considera al menos no participar en difundirlos y, si es posible, aclarar la verdad cuando la conozcas.',
                    ethicalScore: 40,
                    tags: ['pasividad', 'necesita acción']
                },
                {
                    id: 'd',
                    text: 'Contarle a un adulto sobre la situación',
                    feedback: 'Buena opción. Informar a un adulto puede ayudar a manejar la situación de manera apropiada. Esto es especialmente importante si el rumor está causando angustia significativa al estudiante afectado.',
                    ethicalScore: 80,
                    tags: ['responsabilidad', 'búsqueda de ayuda']
                }
            ]
        },
        {
            id: 3,
            title: 'La Exclusión en el Grupo',
            scenario: 'Tu grupo de amigos está excluyendo deliberadamente a una compañera de las actividades del recreo. Ella parece estar triste pero no dice nada. ¿Qué harías?',
            options: [
                {
                    id: 'a',
                    text: 'Invitar a la compañera excluida a unirte a ti en otra actividad',
                    feedback: 'Excelente decisión. Incluir activamente a alguien que está siendo excluido muestra empatía y valentía. Tu acción puede hacer una diferencia real en cómo se siente esa compañera. También podrías hablar con tus amigos sobre la importancia de la inclusión.',
                    ethicalScore: 90,
                    tags: ['inclusión', 'empatía', 'acción positiva']
                },
                {
                    id: 'b',
                    text: 'Hablar con tus amigos sobre por qué están excluyendo a la compañera',
                    feedback: 'Muy bien. Abordar la situación con tus amigos puede ayudar a crear conciencia sobre el impacto de sus acciones. Esto muestra liderazgo positivo y puede llevar a un cambio en el comportamiento del grupo.',
                    ethicalScore: 85,
                    tags: ['liderazgo', 'comunicación', 'conciencia social']
                },
                {
                    id: 'c',
                    text: 'Preguntarle a la compañera si está bien y ofrecerle apoyo',
                    feedback: 'Buena iniciativa. Mostrar preocupación y ofrecer apoyo es importante. Combinar esto con acciones para incluirla activamente sería ideal. También considera hablar con tus amigos sobre la importancia de ser inclusivos.',
                    ethicalScore: 75,
                    tags: ['empatía', 'apoyo emocional']
                },
                {
                    id: 'd',
                    text: 'No hacer nada para no perder la amistad de tu grupo',
                    feedback: 'Entiendo la preocupación, pero priorizar la popularidad sobre el bienestar de otros puede tener consecuencias negativas. Una verdadera amistad debería incluir valores como la inclusión y el respeto. Considera que tu valentía moral puede inspirar a otros a ser mejores personas.',
                    ethicalScore: 35,
                    tags: ['necesita reflexión', 'valores']
                }
            ]
        },
        {
            id: 4,
            title: 'El Cyberbullying',
            scenario: 'Ves que alguien publicó una foto humillante de un compañero en las redes sociales con comentarios negativos. Varios estudiantes están riéndose y compartiendo la publicación. ¿Cuál es tu acción?',
            options: [
                {
                    id: 'a',
                    text: 'Reportar la publicación a la plataforma y contarle a un adulto',
                    feedback: 'Excelente decisión. El cyberbullying es serio y reportarlo es crucial. Informar a adultos responsables puede ayudar a proteger al estudiante afectado y prevenir futuros incidentes. Esta es la respuesta más ética y responsable.',
                    ethicalScore: 95,
                    tags: ['responsabilidad', 'protección', 'acción correcta']
                },
                {
                    id: 'b',
                    text: 'No participar en compartir o comentar la publicación',
                    feedback: 'Bien, no participar es importante, pero el cyberbullying requiere una respuesta más activa. El estudiante afectado necesita apoyo y la publicación debería ser reportada. Considera también ofrecer apoyo directo a la persona afectada.',
                    ethicalScore: 60,
                    tags: ['pasividad', 'necesita acción']
                },
                {
                    id: 'c',
                    text: 'Contactar al estudiante afectado para ofrecerle apoyo emocional',
                    feedback: 'Muy bien. Ofrecer apoyo emocional es importante y muestra empatía. Sin embargo, también deberías considerar reportar el incidente a un adulto, ya que el cyberbullying puede tener consecuencias graves y necesita intervención apropiada.',
                    ethicalScore: 70,
                    tags: ['empatía', 'apoyo', 'necesita reporte']
                },
                {
                    id: 'd',
                    text: 'Ignorar la situación',
                    feedback: 'Ignorar el cyberbullying permite que continúe causando daño. Este tipo de acoso puede tener efectos graves en la autoestima y bienestar emocional. Por favor, considera al menos reportar el incidente a un adulto responsable, incluso de forma anónima si es necesario.',
                    ethicalScore: 25,
                    tags: ['pasividad', 'necesita acción urgente']
                }
            ]
        },
        {
            id: 5,
            title: 'El Testigo del Acoso',
            scenario: 'Presencias que un estudiante está siendo acosado físicamente en los pasillos. El acosador es conocido por ser agresivo. ¿Cómo responderías?',
            options: [
                {
                    id: 'a',
                    text: 'Buscar inmediatamente ayuda de un adulto (profesor, director, etc.)',
                    feedback: 'Excelente. Buscar ayuda de un adulto inmediatamente es la respuesta más segura y apropiada en situaciones de acoso físico. Los adultos están entrenados para manejar estas situaciones de manera efectiva y pueden proteger a todos los involucrados.',
                    ethicalScore: 95,
                    tags: ['seguridad', 'responsabilidad', 'acción correcta']
                },
                {
                    id: 'b',
                    text: 'Intervenir verbalmente si te sientes seguro, y luego buscar ayuda',
                    feedback: 'Valiente, pero considera tu seguridad primero. Si decides intervenir verbalmente, asegúrate de hacerlo de manera que no te ponga en peligro. La prioridad debe ser obtener ayuda de un adulto inmediatamente. Tu seguridad es importante.',
                    ethicalScore: 65,
                    tags: ['valentía', 'necesita considerar seguridad']
                },
                {
                    id: 'c',
                    text: 'Reunir a otros estudiantes para que juntos intervengan',
                    feedback: 'La idea de buscar apoyo es buena, pero en situaciones de acoso físico, el tiempo es crucial. Lo más seguro y efectivo es obtener ayuda inmediata de un adulto. Los adultos tienen la autoridad y recursos para manejar estas situaciones adecuadamente.',
                    ethicalScore: 55,
                    tags: ['necesita acción más directa']
                },
                {
                    id: 'd',
                    text: 'No hacer nada por miedo a represalias',
                    feedback: 'Entiendo el miedo, pero no actuar permite que el acoso continúe. Hay formas seguras de ayudar: puedes informar a un adulto de manera anónima o después de que la situación haya pasado. Tu voz puede hacer la diferencia y proteger a alguien que necesita ayuda.',
                    ethicalScore: 40,
                    tags: ['miedo', 'necesita apoyo', 'búsqueda de ayuda segura']
                }
            ]
        }
    ];
}

// ========== GENERADOR DE TESTS - 100 DE CADA TIPO ==========

// Obtener el índice del mes para rotación (0-11)
function getCurrentMonthIndex() {
    return new Date().getMonth();
}

// Obtener el índice del test basado en el mes (asegura rotación sin repetición)
function getActivityIndexForMonth(totalActivities, monthIndex) {
    // Usa el mes como offset para rotar los tests
    return monthIndex % totalActivities;
}

// Obtener índice de rotación mensual (0-11 para cada mes)
function getMonthlyRotationIndex() {
    const now = new Date();
    return now.getMonth(); // 0-11 (enero-diciembre)
}

// Obtener nombre motivador para ejercicios de empatía (rotación mensual)
function getEmpathyTitle(testIndex) {
    const monthIndex = getMonthlyRotationIndex();
    const titles = [
        // Enero
        ['Descubre tu capacidad de comprensión', 'Ponerse en los zapatos del otro', 'El arte de entender a los demás', 'Conexión emocional', 'Miradas que comprenden', 'Corazones que sienten juntos', 'La magia de la empatía', 'Entendiendo sin palabras'],
        // Febrero
        ['Aprende a sentir con otros', 'Construyendo puentes emocionales', 'El poder de la comprensión', 'Escuchando con el corazón', 'Juntos en las emociones', 'La empatía nos une', 'Sentimientos compartidos', 'Comprender es crecer'],
        // Marzo
        ['Desarrolla tu sensibilidad', 'Conectando con las emociones', 'El valor de entender', 'Mi corazón, tu corazón', 'La empatía transforma', 'Entendiendo diferentes perspectivas', 'Creciendo juntos', 'La compasión en acción'],
        // Abril
        ['Explora tu capacidad empática', 'El don de comprender', 'Sentir como otros sienten', 'La empatía es un superpoder', 'Construyendo comprensión', 'Juntos en el camino', 'El arte de la conexión', 'Entendiendo desde el corazón'],
        // Mayo
        ['Fortalece tu empatía', 'La magia de entender', 'Conectando emocionalmente', 'El poder de la compasión', 'Juntos crecemos', 'La empatía nos hace mejores', 'Entendiendo sin juzgar', 'Corazones que se conectan'],
        // Junio
        ['Descubre la empatía en ti', 'El valor de comprender', 'Sentimientos que unen', 'La empatía transforma vidas', 'Construyendo puentes', 'El arte de sentir juntos', 'Creciendo en comprensión', 'Juntos somos más fuertes'],
        // Julio
        ['Desarrolla tu sensibilidad emocional', 'El poder de la empatía', 'Conectando con otros', 'La magia de entender', 'Sentimientos compartidos', 'La empatía nos une', 'Entendiendo diferentes realidades', 'Corazones que sienten'],
        // Agosto
        ['Fortalece tu capacidad empática', 'El don de comprender', 'Sentir como otros sienten', 'La empatía es transformadora', 'Construyendo comprensión mutua', 'Juntos en las emociones', 'El arte de la conexión emocional', 'Entendiendo desde el corazón'],
        // Septiembre
        ['Explora tu empatía', 'La magia de entender a otros', 'Conectando emocionalmente', 'El poder de la compasión', 'Juntos crecemos', 'La empatía nos hace mejores personas', 'Entendiendo sin prejuicios', 'Corazones que se conectan'],
        // Octubre
        ['Descubre tu sensibilidad', 'El valor de comprender', 'Sentimientos que unen', 'La empatía transforma', 'Construyendo puentes emocionales', 'El arte de sentir juntos', 'Creciendo en comprensión', 'Juntos somos más'],
        // Noviembre
        ['Desarrolla tu empatía', 'El poder de entender', 'Conectando con las emociones', 'La magia de la compasión', 'Sentimientos compartidos', 'La empatía nos une', 'Entendiendo diferentes perspectivas', 'Corazones que sienten juntos'],
        // Diciembre
        ['Fortalece tu comprensión', 'El don de la empatía', 'Sentir como otros sienten', 'La empatía es un regalo', 'Construyendo comprensión', 'Juntos en el camino', 'El arte de la conexión', 'Entendiendo desde el corazón']
    ];
    
    const monthTitles = titles[monthIndex] || titles[0];
    return monthTitles[testIndex % monthTitles.length];
}

// Obtener nombre motivador para ejercicios de autocuidado (rotación mensual)
function getSelfCareTitle(testIndex) {
    const monthIndex = getMonthlyRotationIndex();
    const titles = [
        // Enero
        ['Cuídate, te lo mereces', 'Tu bienestar es importante', 'Momentos para ti', 'El autocuidado es amor', 'Cuidando de mí mismo', 'Mi tiempo, mi bienestar', 'El arte de cuidarse', 'Priorizando mi salud'],
        // Febrero
        ['Aprende a quererte', 'Tu bienestar es prioridad', 'Tiempo para cuidarte', 'El autocuidado transforma', 'Cuidando mi cuerpo y mente', 'Mi salud, mi tesoro', 'El poder del autocuidado', 'Amándome a mí mismo'],
        // Marzo
        ['Desarrolla tu autocuidado', 'El valor de cuidarse', 'Momentos de bienestar', 'La importancia de ti', 'Cuidando mi energía', 'Mi bienestar, mi elección', 'El autocuidado es sabiduría', 'Priorizando mi felicidad'],
        // Abril
        ['Explora tu bienestar', 'El don de cuidarse', 'Tiempo para mí', 'El autocuidado es esencial', 'Cuidando mi salud mental', 'Mi cuerpo, mi templo', 'El arte del bienestar', 'Entendiendo mis necesidades'],
        // Mayo
        ['Fortalece tu autocuidado', 'La magia de cuidarse', 'Momentos de paz', 'El autocuidado es poder', 'Cuidando mi equilibrio', 'Mi bienestar, mi responsabilidad', 'El poder de priorizarme', 'Amándome cada día'],
        // Junio
        ['Descubre tu bienestar', 'El valor de cuidarse', 'Tiempo para relajarte', 'El autocuidado transforma vidas', 'Cuidando mi salud integral', 'Mi felicidad, mi prioridad', 'El arte de cuidarse', 'Priorizando mi paz'],
        // Julio
        ['Desarrolla tu bienestar', 'El poder del autocuidado', 'Momentos para recargar', 'La importancia de cuidarse', 'Cuidando mi energía vital', 'Mi salud, mi riqueza', 'El autocuidado es amor propio', 'Entendiendo mi valor'],
        // Agosto
        ['Fortalece tu autocuidado', 'El don de cuidarse', 'Tiempo para renovarte', 'El autocuidado es sabiduría', 'Cuidando mi mente y cuerpo', 'Mi bienestar, mi elección', 'El poder de cuidarme', 'Amándome incondicionalmente'],
        // Septiembre
        ['Explora tu bienestar personal', 'La magia de cuidarse', 'Momentos de tranquilidad', 'El autocuidado es esencial', 'Cuidando mi salud emocional', 'Mi cuerpo, mi hogar', 'El arte del autocuidado', 'Priorizando mi ser'],
        // Octubre
        ['Descubre tu autocuidado', 'El valor de priorizarse', 'Tiempo para sanar', 'El autocuidado transforma', 'Cuidando mi equilibrio interno', 'Mi felicidad, mi responsabilidad', 'El poder de cuidarse', 'Entendiendo mi importancia'],
        // Noviembre
        ['Desarrolla tu bienestar integral', 'El poder de cuidarse', 'Momentos de autocuidado', 'La importancia de ti mismo', 'Cuidando mi salud completa', 'Mi bienestar, mi tesoro', 'El autocuidado es regalo', 'Amándome cada momento'],
        // Diciembre
        ['Fortalece tu autocuidado', 'El don del bienestar', 'Tiempo para cuidarte', 'El autocuidado es amor', 'Cuidando mi salud holística', 'Mi paz, mi prioridad', 'El arte de cuidarse', 'Priorizando mi felicidad']
    ];
    
    const monthTitles = titles[monthIndex] || titles[0];
    return monthTitles[testIndex % monthTitles.length];
}

// Obtener nombre motivador para resolución de conflictos (rotación mensual)
function getConflictResolutionTitle(testIndex) {
    const monthIndex = getMonthlyRotationIndex();
    const titles = [
        // Enero
        ['Resolver con sabiduría', 'El arte de la paz', 'Construyendo soluciones', 'Diálogo que transforma', 'Resolviendo juntos', 'El poder de la comunicación', 'Encontrando acuerdos', 'La paz es posible'],
        // Febrero
        ['Aprende a resolver pacíficamente', 'El valor del diálogo', 'Construyendo puentes', 'Resolviendo con respeto', 'Juntos encontramos soluciones', 'El arte de negociar', 'La comunicación sana', 'Encontrando el equilibrio'],
        // Marzo
        ['Desarrolla tu capacidad de resolver', 'El poder de la mediación', 'Construyendo acuerdos', 'Resolviendo sin violencia', 'El diálogo transforma', 'Juntos construimos paz', 'El arte de conciliar', 'Encontrando soluciones'],
        // Abril
        ['Explora la resolución pacífica', 'El don de mediar', 'Construyendo entendimiento', 'Resolviendo con empatía', 'El diálogo es clave', 'Juntos resolvemos', 'El poder de la negociación', 'Encontrando puntos en común'],
        // Mayo
        ['Fortalece tu resolución de conflictos', 'La magia del diálogo', 'Construyendo soluciones', 'Resolviendo con sabiduría', 'El arte de resolver', 'Juntos encontramos el camino', 'La comunicación efectiva', 'Encontrando acuerdos justos'],
        // Junio
        ['Descubre tu capacidad de resolver', 'El valor de la mediación', 'Construyendo paz', 'Resolviendo con calma', 'El diálogo transforma vidas', 'Juntos construimos soluciones', 'El arte de la conciliación', 'Encontrando el equilibrio'],
        // Julio
        ['Desarrolla tu resolución pacífica', 'El poder del diálogo', 'Construyendo acuerdos', 'Resolviendo con respeto', 'El arte de mediar', 'Juntos encontramos respuestas', 'La comunicación sana', 'Encontrando soluciones creativas'],
        // Agosto
        ['Fortalece tu capacidad de resolver', 'El don de la negociación', 'Construyendo entendimiento', 'Resolviendo sin conflicto', 'El diálogo es poder', 'Juntos resolvemos', 'El arte de la paz', 'Encontrando puntos de encuentro'],
        // Septiembre
        ['Explora la resolución efectiva', 'La magia del diálogo', 'Construyendo soluciones', 'Resolviendo con empatía', 'El poder de comunicar', 'Juntos construimos acuerdos', 'El arte de conciliar', 'Encontrando el camino'],
        // Octubre
        ['Descubre tu resolución pacífica', 'El valor de mediar', 'Construyendo paz', 'Resolviendo con sabiduría', 'El diálogo transforma', 'Juntos encontramos soluciones', 'El arte de negociar', 'Encontrando equilibrio'],
        // Noviembre
        ['Desarrolla tu capacidad de resolver', 'El poder de la comunicación', 'Construyendo acuerdos', 'Resolviendo con respeto', 'El diálogo es clave', 'Juntos resolvemos', 'El arte de la mediación', 'Encontrando soluciones'],
        // Diciembre
        ['Fortalece tu resolución pacífica', 'El don del diálogo', 'Construyendo entendimiento', 'Resolviendo juntos', 'El arte de resolver', 'Juntos construimos paz', 'La comunicación efectiva', 'Encontrando acuerdos']
    ];
    
    const monthTitles = titles[monthIndex] || titles[0];
    return monthTitles[testIndex % monthTitles.length];
}

// Obtener nombre motivador para simulador ético (rotación mensual)
function getEthicalSimulatorTitle() {
    const monthIndex = getMonthlyRotationIndex();
    const titles = [
        'Aventuras Éticas', 'Decisiones que Importan', 'El Camino Correcto', 'Historias de Valores',
        'Elige con Sabiduría', 'Momentos de Decisión', 'El Poder de Elegir Bien', 'Aventuras Morales',
        'Decisiones Transformadoras', 'El Arte de Decidir', 'Valores en Acción', 'Elige tu Camino'
    ];
    return titles[monthIndex] || titles[0];
}

// Generar 100 tests de Ejercicio de Empatía adaptados por edad
function generateEmpathyTests(ageGroup = '12-15') {
    const tests = [];
    
    // Plantillas adaptadas por edad
    let questionTemplates;
    if (ageGroup === '9-11') {
        questionTemplates = [
            {
                variations: [
                    'Cuando notas que un compañero está {emocion}, ¿cómo te sientes al pensar en cómo se siente?',
                    'Si alguien está {emocion}, ¿qué tan fácil te resulta imaginar cómo se siente?',
                    'Cuando ves que alguien está {emocion}, ¿qué tan bien puedes entender cómo se siente esa persona?'
                ],
                emotions: ['triste', 'preocupado', 'solo', 'asustado', 'confundido', 'molesto', 'nervioso', 'decepcionado']
            },
            {
                variations: [
                    '¿Qué tan a menudo intentas imaginar cómo se sienten {persona}?',
                    '¿Con qué frecuencia piensas en cómo podrían sentirse {persona}?',
                    '¿Qué tan seguido intentas ponerte en el lugar de {persona}?'
                ],
                personas: ['tus compañeros', 'otros', 'tus amigos', 'quienes te rodean', 'los demás']
            },
            {
                variations: [
                    'Cuando alguien está pasando por un momento difícil, ¿qué tan bien crees que puedes {accion}?',
                    'Si alguien necesita ayuda, ¿qué tan bien sientes que puedes {accion}?',
                    'Cuando alguien tiene problemas, ¿qué tan bien crees que puedes {accion}?'
                ],
                acciones: ['ayudarlo', 'consolarlo', 'apoyarlo', 'entenderlo', 'animarlo']
            },
            {
                variations: [
                    '¿Qué tan bien crees que puedes reconocer cuando {persona} están contentos o tristes?',
                    '¿Qué tan bien sientes que puedes saber cómo se sienten {persona}?',
                    '¿Qué tan bien crees que puedes notar cuando {persona} están felices o tristes?'
                ],
                personas: ['tus compañeros', 'tus amigos', 'otros estudiantes', 'quienes te rodean']
            },
            {
                variations: [
                    '¿Qué tan importante crees que es {valor}?',
                    '¿Qué tan importante sientes que es {valor}?',
                    '¿Qué tan importante piensas que es {valor}?'
                ],
                valores: [
                    'entender cómo se sienten tus compañeros',
                    'ponerte en el lugar de otros',
                    'ayudar a quien está triste',
                    'ser amable con los demás',
                    'entender a tus amigos'
                ]
            }
        ];
    } else if (ageGroup === '12-15') {
        questionTemplates = [
            {
                variations: [
                    'Cuando veo a un compañero {emocion}, ¿qué tan bien puedo entender cómo se siente?',
                    '¿Qué tan bien comprendo los sentimientos de otros cuando están {emocion}?',
                    'Cuando alguien está {emocion}, ¿qué tan efectivo soy para reconocer su estado emocional?',
                    '¿Qué tan bien puedo ponerme en el lugar de alguien que está {emocion}?'
                ],
                emotions: ['triste', 'frustrado', 'ansioso', 'nervioso', 'preocupado', 'solo', 'asustado', 'confundido', 'decepcionado', 'molesto']
            },
            {
                variations: [
                    '¿Con qué frecuencia intentas ver las situaciones desde la perspectiva de {persona}?',
                    '¿Qué tan a menudo te esfuerzas por entender el punto de vista de {persona}?',
                    '¿Con qué frecuencia consideras cómo se sienten {persona} en diferentes situaciones?'
                ],
                personas: ['otros', 'tus compañeros', 'las personas que te rodean', 'quienes te rodean', 'los demás', 'otros estudiantes']
            },
            {
                variations: [
                    'Cuando alguien está pasando por un momento difícil, ¿qué tan efectivo eres para {accion}?',
                    '¿Qué tan bien puedes {accion} cuando alguien necesita apoyo?',
                    'Cuando alguien tiene problemas, ¿qué tan efectivo eres para {accion}?'
                ],
                acciones: ['ofrecer apoyo', 'dar consuelo', 'brindar ayuda', 'mostrar comprensión', 'proporcionar aliento', 'expresar empatía']
            },
            {
                variations: [
                    '¿Qué tan bien reconoces las emociones de {persona}?',
                    '¿Qué tan efectivo eres para identificar cómo se sienten {persona}?',
                    '¿Qué tan bien puedes percibir el estado emocional de {persona}?'
                ],
                personas: ['tus compañeros', 'otros estudiantes', 'las personas que te rodean', 'quienes te rodean', 'los demás', 'otras personas']
            },
            {
                variations: [
                    '¿Qué tan importante crees que es {valor}?',
                    '¿Qué tan relevante consideras {valor} en tus relaciones?',
                    '¿Qué tan significativo es para ti {valor}?'
                ],
                valores: [
                    'entender los sentimientos de otros',
                    'ponerte en el lugar de los demás',
                    'mostrar empatía hacia otros',
                    'comprender las emociones ajenas',
                    'ser empático con quienes te rodean',
                    'reconocer las necesidades emocionales de otros'
                ]
            }
        ];
    } else { // 16-17
        questionTemplates = [
            {
                variations: [
                    'Cuando observas que un compañero está experimentando {emocion}, ¿qué tan efectivo eres para comprender su estado emocional?',
                    '¿Qué tan hábil eres para comprender los sentimientos de otros cuando están {emocion}?',
                    'Cuando alguien está experimentando {emocion}, ¿qué tan efectivo eres para reconocer y comprender su estado emocional?',
                    '¿Qué tan bien puedes adoptar la perspectiva de alguien que está {emocion}?'
                ],
                emotions: ['tristeza', 'frustración', 'ansiedad', 'nerviosismo', 'preocupación', 'soledad', 'miedo', 'confusión', 'decepción', 'molestia']
            },
            {
                variations: [
                    '¿Con qué frecuencia te esfuerzas por adoptar la perspectiva de {persona} en diferentes situaciones?',
                    '¿Qué tan a menudo intentas comprender el punto de vista de {persona}?',
                    '¿Con qué frecuencia consideras las experiencias emocionales de {persona} en diversos contextos?'
                ],
                personas: ['otros', 'tus compañeros', 'las personas que te rodean', 'quienes te rodean', 'los demás', 'otros estudiantes']
            },
            {
                variations: [
                    'Cuando alguien está enfrentando dificultades, ¿qué tan efectivo eres para {accion}?',
                    '¿Qué tan hábil eres para {accion} cuando alguien requiere apoyo emocional?',
                    'Cuando alguien está experimentando problemas, ¿qué tan efectivo eres para {accion}?'
                ],
                acciones: ['proporcionar apoyo emocional', 'ofrecer consuelo', 'brindar ayuda', 'demostrar comprensión', 'proporcionar aliento', 'expresar empatía']
            },
            {
                variations: [
                    '¿Qué tan hábil eres para identificar y reconocer las emociones de {persona}?',
                    '¿Qué tan efectivo eres para percibir el estado emocional de {persona}?',
                    '¿Qué tan bien puedes discernir las emociones de {persona}?'
                ],
                personas: ['tus compañeros', 'otros estudiantes', 'las personas que te rodean', 'quienes te rodean', 'los demás', 'otras personas']
            },
            {
                variations: [
                    '¿Qué nivel de importancia asignas a {valor}?',
                    '¿Qué tan relevante consideras {valor} en tus relaciones interpersonales?',
                    '¿Qué tan significativo es para ti {valor}?'
                ],
                valores: [
                    'comprender los sentimientos y necesidades emocionales de otros',
                    'adoptar la perspectiva de los demás',
                    'demostrar empatía hacia otros',
                    'comprender las experiencias emocionales ajenas',
                    'ser empático con quienes te rodean',
                    'reconocer y responder a las necesidades emocionales de otros'
                ]
            }
        ];
    }

    for (let i = 0; i < 100; i++) {
        const questions = [];
        const usedTemplates = new Set();
        
        // Generar 5 preguntas únicas para cada test
        while (questions.length < 5) {
            const templateIndex = Math.floor(Math.random() * questionTemplates.length);
            if (usedTemplates.has(templateIndex)) continue;
            usedTemplates.add(templateIndex);
            
            const template = questionTemplates[templateIndex];
            const variation = template.variations[Math.floor(Math.random() * template.variations.length)];
            const replacements = template.emotions || template.personas || template.acciones || template.valores;
            const replacement = replacements[i % replacements.length];
            
            const questionText = variation.replace('{emocion}', replacement)
                                        .replace('{persona}', replacement)
                                        .replace('{accion}', replacement)
                                        .replace('{valor}', replacement);
            
            // Determinar tipo de opciones según el template y el texto de la pregunta
            let optionType = 'understanding';
            const questionTextLower = variation.toLowerCase();
            
            // Si la pregunta pregunta sobre habilidad, usar tipo 'skill'
            if (questionTextLower.includes('hábil') || questionTextLower.includes('habilidad') || questionTextLower.includes('efectivo')) {
                optionType = 'skill';
            } else if (template.personas && !template.emotions) {
                optionType = 'frequency';
            } else if (template.acciones) {
                optionType = 'quality';
            } else if (template.valores) {
                optionType = 'importance';
            }
            
            questions.push({
                text: questionText,
                options: getResponseOptionsByAge(ageGroup, optionType)
            });
        }

        tests.push({
            id: `empathy_exercise_${ageGroup}_${i + 1}`,
            title: getEmpathyTitle(i),
            description: 'Evalúa tu capacidad para ponerte en el lugar de otros',
            type: 'test',
            questions: questions
        });
    }

    return tests;
}

// Generar 100 tests de Autocuidado adaptados por edad
function generateSelfCareTests(ageGroup = '12-15') {
    const tests = [];
    
    // Plantillas adaptadas por edad
    let questionTemplates;
    if (ageGroup === '9-11') {
        questionTemplates = [
            {
                variations: [
                    '¿Qué tan seguido haces cosas que {beneficio}?',
                    '¿Con qué frecuencia haces actividades que {beneficio}?',
                    '¿Qué tan a menudo haces cosas que {beneficio}?'
                ],
                beneficios: ['te gustan y te hacen sentir bien', 'te hacen feliz', 'te ayudan a sentirte mejor', 'te relajan', 'te divierten', 'te hacen sentir tranquilo']
            },
            {
                variations: [
                    '¿Qué tan bien crees que cuidas tu {aspecto}?',
                    '¿Qué tan bien sientes que te cuidas en {aspecto}?',
                    '¿Qué tan bien crees que te ocupas de tu {aspecto}?'
                ],
                aspectos: ['descanso y sueño', 'salud', 'comida', 'higiene', 'tiempo para jugar', 'tiempo para relajarte', 'rutina diaria']
            },
            {
                variations: [
                    '¿Qué tan seguido haces {habito}?',
                    '¿Con qué frecuencia haces {habito}?',
                    '¿Qué tan a menudo practicas {habito}?'
                ],
                habitos: [
                    'ejercicio o juegos activos',
                    'cosas que te gustan',
                    'actividades para mantenerte saludable',
                    'cosas que te hacen sentir bien',
                    'actividades divertidas',
                    'cosas buenas para tu salud'
                ]
            },
            {
                variations: [
                    '¿Qué tan bien crees que sabes cuándo necesitas {necesidad}?',
                    '¿Qué tan bien sientes que reconoces cuando necesitas {necesidad}?',
                    '¿Qué tan bien crees que sabes si necesitas {necesidad}?'
                ],
                necesidades: ['descansar', 'relajarte', 'tomar un descanso', 'cuidarte', 'dedicarte tiempo', 'parar un momento']
            },
            {
                variations: [
                    '¿Qué tan importante crees que es {aspecto}?',
                    '¿Qué tan importante sientes que es {aspecto}?',
                    '¿Qué tan importante piensas que es {aspecto}?'
                ],
                aspectos: [
                    'cuidar de ti mismo',
                    'estar saludable',
                    'sentirte bien',
                    'descansar bien',
                    'hacer cosas que te gustan',
                    'estar bien contigo mismo'
                ]
            }
        ];
    } else if (ageGroup === '12-15') {
        questionTemplates = [
            {
                variations: [
                    '¿Con qué frecuencia realizas actividades que {beneficio}?',
                    '¿Qué tan a menudo practicas actividades que {beneficio}?',
                    '¿Con qué regularidad realizas actividades que {beneficio}?'
                ],
                beneficios: ['disfrutas y te relajan', 'te hacen sentir bien', 'mejoran tu estado de ánimo', 'te ayudan a desconectar', 'te proporcionan bienestar', 'te dan paz mental']
            },
            {
                variations: [
                    '¿Qué tan bien cuidas tu {aspecto}?',
                    '¿Qué tan efectivo eres para mantener tu {aspecto}?',
                    '¿Qué tan bien gestionas tu {aspecto}?'
                ],
                aspectos: ['descanso y sueño', 'salud física', 'alimentación', 'higiene personal', 'tiempo libre', 'espacios de relajación', 'rutina diaria', 'equilibrio vida-estudio']
            },
            {
                variations: [
                    '¿Con qué frecuencia practicas {habito}?',
                    '¿Qué tan a menudo realizas {habito}?',
                    '¿Con qué regularidad practicas {habito}?'
                ],
                habitos: [
                    'hábitos saludables (ejercicio, alimentación, etc.)',
                    'rutinas de bienestar personal',
                    'actividades físicas',
                    'técnicas de relajación',
                    'actividades que te gustan',
                    'cuidados básicos de salud'
                ]
            },
            {
                variations: [
                    '¿Qué tan bien reconoces cuando necesitas {necesidad}?',
                    '¿Qué tan efectivo eres para identificar cuando necesitas {necesidad}?',
                    '¿Qué tan consciente eres de cuándo necesitas {necesidad}?'
                ],
                necesidades: ['tomar un descanso', 'reducir el estrés', 'pausar y relajarte', 'cuidar de ti mismo', 'dedicarte tiempo', 'reducir la carga']
            },
            {
                variations: [
                    '¿Qué tan importante consideras el {aspecto} para tu bienestar?',
                    '¿Qué tan relevante es para ti el {aspecto}?',
                    '¿Qué tan significativo consideras el {aspecto}?'
                ],
                aspectos: [
                    'autocuidado',
                    'cuidado personal',
                    'bienestar físico',
                    'bienestar emocional',
                    'equilibrio personal',
                    'salud integral'
                ]
            }
        ];
    } else { // 16-17
        questionTemplates = [
            {
                variations: [
                    '¿Con qué frecuencia participas en actividades que {beneficio}?',
                    '¿Qué tan a menudo te involucras en actividades que {beneficio}?',
                    '¿Con qué regularidad realizas actividades que {beneficio}?'
                ],
                beneficios: ['disfrutas y que contribuyen a tu bienestar emocional', 'te proporcionan satisfacción personal', 'mejoran tu estado de ánimo', 'te ayudan a desconectar del estrés', 'contribuyen a tu bienestar integral', 'te proporcionan paz mental y equilibrio']
            },
            {
                variations: [
                    '¿Qué tan efectivo eres para mantener y cuidar tu {aspecto}?',
                    '¿Qué tan hábil eres para gestionar tu {aspecto}?',
                    '¿Qué tan bien mantienes tu {aspecto}?'
                ],
                aspectos: ['descanso y sueño adecuado', 'salud física', 'alimentación balanceada', 'higiene personal', 'tiempo libre y ocio', 'espacios de relajación', 'rutina diaria estructurada', 'equilibrio entre vida personal y académica']
            },
            {
                variations: [
                    '¿Con qué frecuencia practicas {habito}?',
                    '¿Qué tan a menudo te involucras en {habito}?',
                    '¿Con qué regularidad realizas {habito}?'
                ],
                habitos: [
                    'rutinas de bienestar personal que incluyen ejercicio y alimentación',
                    'prácticas de autocuidado integral',
                    'actividades físicas regulares',
                    'técnicas de relajación y manejo del estrés',
                    'actividades que disfrutas y que contribuyen a tu desarrollo',
                    'cuidados preventivos de salud'
                ]
            },
            {
                variations: [
                    '¿Qué tan consciente eres de cuándo necesitas {necesidad}?',
                    '¿Qué tan efectivo eres para identificar cuando requieres {necesidad}?',
                    '¿Qué tan hábil eres para reconocer cuándo necesitas {necesidad}?'
                ],
                necesidades: ['tomar un descanso', 'reducir el estrés', 'pausar y relajarte', 'cuidar de ti mismo', 'dedicarte tiempo personal', 'reducir la carga académica o personal']
            },
            {
                variations: [
                    '¿Qué nivel de importancia asignas al {aspecto} para tu bienestar?',
                    '¿Qué tan relevante consideras el {aspecto} en tu vida?',
                    '¿Qué tan significativo es para ti el {aspecto}?'
                ],
                aspectos: [
                    'autocuidado',
                    'cuidado personal integral',
                    'bienestar físico',
                    'bienestar emocional',
                    'equilibrio personal',
                    'salud integral'
                ]
            }
        ];
    }

    for (let i = 0; i < 100; i++) {
        const questions = [];
        const usedTemplates = new Set();
        
        while (questions.length < 5) {
            const templateIndex = Math.floor(Math.random() * questionTemplates.length);
            if (usedTemplates.has(templateIndex)) continue;
            usedTemplates.add(templateIndex);
            
            const template = questionTemplates[templateIndex];
            const variation = template.variations[Math.floor(Math.random() * template.variations.length)];
            const replacements = template.beneficios || template.aspectos || template.habitos || template.necesidades;
            const replacement = replacements[i % replacements.length];
            
            const questionText = variation.replace('{beneficio}', replacement)
                                        .replace('{aspecto}', replacement)
                                        .replace('{habito}', replacement)
                                        .replace('{necesidad}', replacement);
            
            // Determinar tipo de opciones según el template y el texto de la pregunta
            let optionType = 'frequency';
            const questionTextLower = variation.toLowerCase();
            
            // Si la pregunta pregunta sobre habilidad, usar tipo 'skill'
            if (questionTextLower.includes('hábil') || questionTextLower.includes('habilidad') || questionTextLower.includes('efectivo') || questionTextLower.includes('consciente')) {
                optionType = 'skill';
            } else if (template.aspectos && !template.beneficios && !template.habitos && !template.necesidades) {
                optionType = 'quality';
            } else if (template.necesidades) {
                optionType = 'skill';
            } else if (template.aspectos && (template.aspectos.includes('autocuidado') || template.aspectos.includes('bienestar'))) {
                optionType = 'importance';
            }
            
            questions.push({
                text: questionText,
                options: getResponseOptionsByAge(ageGroup, optionType)
            });
        }

        tests.push({
            id: `self_care_${ageGroup}_${i + 1}`,
            title: getSelfCareTitle(i),
            description: 'Evalúa tus prácticas de autocuidado y bienestar personal',
            type: 'test',
            questions: questions
        });
    }

    return tests;
}

// Generar 100 tests de Resolución de Conflictos adaptados por edad
function generateConflictResolutionTests(ageGroup = '12-15') {
    const tests = [];
    
    // Plantillas adaptadas por edad
    let questionTemplates;
    if (ageGroup === '9-11') {
        questionTemplates = [
            {
                variations: [
                    'Cuando tienes un problema con alguien, ¿qué tan bien crees que puedes {habilidad}?',
                    'Si hay un problema, ¿qué tan bien sientes que puedes {habilidad}?',
                    'Cuando hay un conflicto, ¿qué tan bien crees que puedes {habilidad}?'
                ],
                habilidades: ['mantener la calma', 'controlar tus emociones', 'pensar bien', 'mantenerte tranquilo', 'resolver sin pelear', 'hablar de forma respetuosa']
            },
            {
                variations: [
                    '¿Qué tan seguido buscas {solucion} cuando hay un problema?',
                    '¿Con qué frecuencia intentas {solucion} cuando hay un conflicto?',
                    '¿Qué tan a menudo quieres {solucion} cuando hay un problema?'
                ],
                soluciones: [
                    'una solución que sea buena para todos',
                    'un acuerdo donde todos estén de acuerdo',
                    'resolver sin pelear',
                    'encontrar cosas en común',
                    'una solución justa',
                    'resolver juntos'
                ]
            },
            {
                variations: [
                    'Cuando hay un problema, ¿qué tan bien crees que puedes {accion}?',
                    'Si hay un conflicto, ¿qué tan bien sientes que puedes {accion}?',
                    'Cuando hay un problema, ¿qué tan bien crees que puedes {accion}?'
                ],
                acciones: [
                    'escuchar lo que dice la otra persona',
                    'entender el punto de vista del otro',
                    'hablar de forma clara y respetuosa',
                    'decir cómo te sientes sin pelear',
                    'buscar un acuerdo',
                    'resolver el problema sin pelear'
                ]
            },
            {
                variations: [
                    '¿Qué tan bien crees que puedes {habilidad} con alguien con quien no estás de acuerdo?',
                    'Cuando no estás de acuerdo con alguien, ¿qué tan bien sientes que puedes {habilidad}?',
                    'Si no estás de acuerdo, ¿qué tan bien crees que puedes {habilidad}?'
                ],
                habilidades: [
                    'encontrar cosas en común',
                    'llegar a un acuerdo',
                    'hablar de forma respetuosa',
                    'resolver las diferencias',
                    'entenderte con la otra persona',
                    'trabajar juntos para resolver'
                ]
            },
            {
                variations: [
                    '¿Qué tan importante crees que es {valor}?',
                    '¿Qué tan importante sientes que es {valor}?',
                    '¿Qué tan importante piensas que es {valor}?'
                ],
                valores: [
                    'resolver problemas sin pelear',
                    'encontrar soluciones que sean buenas para todos',
                    'hablar de forma respetuosa',
                    'mantener la calma cuando hay problemas',
                    'entender al otro antes de que te entiendan',
                    'resolver diferencias sin pelear'
                ]
            }
        ];
    } else if (ageGroup === '12-15') {
        questionTemplates = [
            {
                variations: [
                    'Cuando tienes un conflicto con alguien, ¿qué tan bien puedes {habilidad}?',
                    'Durante un conflicto, ¿qué tan efectivo eres para {habilidad}?',
                    'En situaciones de conflicto, ¿qué tan bien puedes {habilidad}?'
                ],
                habilidades: ['mantener la calma', 'controlar tus emociones', 'pensar con claridad', 'mantener la compostura', 'resolver sin agresión', 'comunicarte de forma respetuosa']
            },
            {
                variations: [
                    '¿Con qué frecuencia buscas {solucion} en un conflicto?',
                    '¿Qué tan a menudo intentas {solucion} cuando hay un conflicto?',
                    '¿Con qué regularidad procuras {solucion} en situaciones conflictivas?'
                ],
                soluciones: [
                    'una solución que beneficie a ambas partes',
                    'un acuerdo mutuo',
                    'una resolución pacífica',
                    'encontrar puntos en común',
                    'una solución justa para todos',
                    'resolver de manera colaborativa'
                ]
            },
            {
                variations: [
                    '¿Qué tan efectivo eres para {accion} durante un conflicto?',
                    '¿Qué tan bien puedes {accion} cuando hay un conflicto?',
                    '¿Qué tan hábil eres para {accion} en situaciones conflictivas?'
                ],
                acciones: [
                    'escuchar la perspectiva de la otra persona',
                    'entender el punto de vista opuesto',
                    'comunicarte de manera clara y respetuosa',
                    'expresar tus sentimientos sin agresión',
                    'buscar compromisos',
                    'resolver diferencias de forma pacífica'
                ]
            },
            {
                variations: [
                    '¿Qué tan bien puedes {habilidad} con alguien con quien tienes un desacuerdo?',
                    '¿Qué tan efectivo eres para {habilidad} cuando hay desacuerdos?',
                    '¿Qué tan hábil eres para {habilidad} en situaciones de desacuerdo?'
                ],
                habilidades: [
                    'encontrar puntos en común',
                    'llegar a un acuerdo',
                    'mantener una comunicación respetuosa',
                    'resolver diferencias',
                    'construir un entendimiento mutuo',
                    'trabajar hacia una solución'
                ]
            },
            {
                variations: [
                    '¿Qué tan importante consideras {valor}?',
                    '¿Qué tan relevante es para ti {valor}?',
                    '¿Qué tan significativo consideras {valor}?'
                ],
                valores: [
                    'resolver conflictos de manera pacífica y respetuosa',
                    'encontrar soluciones mutuamente beneficiosas',
                    'comunicarte de forma asertiva pero respetuosa',
                    'mantener la calma durante desacuerdos',
                    'buscar entender antes de ser entendido',
                    'resolver diferencias sin agresión'
                ]
            }
        ];
    } else { // 16-17
        questionTemplates = [
            {
                variations: [
                    'Cuando enfrentas un conflicto interpersonal, ¿qué tan efectivo eres para {habilidad}?',
                    'Durante un conflicto, ¿qué tan hábil eres para {habilidad}?',
                    'En situaciones de conflicto, ¿qué tan efectivo eres para {habilidad}?'
                ],
                habilidades: ['mantener la calma y la compostura', 'controlar tus emociones', 'pensar con claridad y objetividad', 'mantener la serenidad', 'resolver sin agresión', 'comunicarte de forma respetuosa y asertiva']
            },
            {
                variations: [
                    '¿Con qué frecuencia buscas {solucion} cuando te encuentras en situaciones conflictivas?',
                    '¿Qué tan a menudo procuras {solucion} cuando hay un conflicto?',
                    '¿Con qué regularidad intentas {solucion} en situaciones de conflicto?'
                ],
                soluciones: [
                    'soluciones mutuamente beneficiosas',
                    'acuerdos consensuados',
                    'resoluciones pacíficas y constructivas',
                    'puntos de convergencia',
                    'soluciones equitativas para todas las partes',
                    'resoluciones colaborativas'
                ]
            },
            {
                variations: [
                    '¿Qué tan efectivo eres para {accion} durante un conflicto?',
                    '¿Qué tan hábil eres para {accion} cuando enfrentas un conflicto?',
                    '¿Qué tan competente eres para {accion} en situaciones conflictivas?'
                ],
                acciones: [
                    'escuchar activamente la perspectiva de la otra persona',
                    'comprender el punto de vista opuesto',
                    'comunicarte de manera clara, respetuosa y asertiva',
                    'expresar tus sentimientos sin agresión',
                    'buscar compromisos constructivos',
                    'resolver diferencias de forma pacífica y colaborativa'
                ]
            },
            {
                variations: [
                    '¿Qué tan hábil eres para {habilidad} con alguien con quien tienes un desacuerdo?',
                    '¿Qué tan efectivo eres para {habilidad} cuando hay desacuerdos?',
                    '¿Qué tan competente eres para {habilidad} en situaciones de desacuerdo?'
                ],
                habilidades: [
                    'encontrar puntos de convergencia',
                    'llegar a acuerdos consensuados',
                    'mantener una comunicación respetuosa y constructiva',
                    'resolver diferencias de manera efectiva',
                    'construir un entendimiento mutuo',
                    'trabajar colaborativamente hacia una solución'
                ]
            },
            {
                variations: [
                    '¿Qué nivel de importancia asignas a {valor}?',
                    '¿Qué tan relevante consideras {valor} en tus relaciones interpersonales?',
                    '¿Qué tan significativo es para ti {valor}?'
                ],
                valores: [
                    'resolver conflictos de manera pacífica, respetuosa y constructiva',
                    'encontrar soluciones mutuamente beneficiosas',
                    'comunicarte de forma asertiva pero respetuosa',
                    'mantener la calma y la objetividad durante desacuerdos',
                    'buscar entender antes de ser entendido',
                    'resolver diferencias sin agresión ni confrontación'
                ]
            }
        ];
    }

    for (let i = 0; i < 100; i++) {
        const questions = [];
        const usedTemplates = new Set();
        
        while (questions.length < 5) {
            const templateIndex = Math.floor(Math.random() * questionTemplates.length);
            if (usedTemplates.has(templateIndex)) continue;
            usedTemplates.add(templateIndex);
            
            const template = questionTemplates[templateIndex];
            const variation = template.variations[Math.floor(Math.random() * template.variations.length)];
            const replacements = template.habilidades || template.soluciones || template.acciones || template.valores;
            const replacement = replacements[i % replacements.length];
            
            const questionText = variation.replace('{habilidad}', replacement)
                                        .replace('{solucion}', replacement)
                                        .replace('{accion}', replacement)
                                        .replace('{valor}', replacement);
            
            // Determinar tipo de opciones según el template y el texto de la pregunta
            let optionType = 'quality';
            const questionTextLower = variation.toLowerCase();
            
            // Si la pregunta pregunta sobre habilidad, usar tipo 'skill'
            if (questionTextLower.includes('hábil') || questionTextLower.includes('habilidad') || questionTextLower.includes('efectivo')) {
                optionType = 'skill';
            } else if (template.soluciones) {
                optionType = 'frequency';
            } else if (template.valores) {
                optionType = 'importance';
            }
            
            questions.push({
                text: questionText,
                options: getResponseOptionsByAge(ageGroup, optionType)
            });
        }

        tests.push({
            id: `conflict_resolution_${ageGroup}_${i + 1}`,
            title: getConflictResolutionTitle(i),
            description: 'Evalúa tu capacidad para resolver conflictos de manera pacífica',
            type: 'test',
            questions: questions
        });
    }

    return tests;
}

// Generar 100 escenarios para Simulador de Decisiones Éticas
function generateEthicalScenarios() {
    const scenarios = [];
    
    const scenarioTemplates = [
        {
            titles: [
                'El Nuevo Estudiante', 'El Estudiante Excluido', 'El Compañero Marginado',
                'El Estudiante Solitario', 'El Recién Llegado', 'El Estudiante Diferente',
                'El Compañero Aislado', 'El Estudiante Nuevo', 'El Marginado del Grupo'
            ],
            scenarios: [
                'Ves que un grupo de estudiantes se está burlando de un nuevo compañero que llegó hace una semana.',
                'Observas que varios compañeros están excluyendo a un estudiante nuevo de las actividades.',
                'Notas que un grupo está haciendo comentarios despectivos sobre un compañero nuevo.',
                'Ves que un estudiante recién llegado está siendo objeto de burlas constantes.',
                'Observas que un nuevo compañero está siendo ignorado y excluido deliberadamente.',
                'Notas que algunos estudiantes se están riendo de un compañero nuevo por sus diferencias.'
            ],
            goodOptions: [
                'Intervenir directamente y decirles que dejen de molestar',
                'Hablar con el nuevo estudiante después para ofrecerle tu amistad',
                'Contarle a un profesor o adulto responsable'
            ],
            badOptions: [
                'No hacer nada para evitar problemas',
                'Ignorar la situación',
                'Unirse al grupo para no ser excluido'
            ]
        },
        {
            titles: [
                'El Rumor Falso', 'El Rumor Dañino', 'La Información Falsa',
                'El Chisme Malicioso', 'El Rumor Destructivo', 'La Calumnia',
                'El Falso Testimonio', 'La Información Incorrecta', 'El Rumor Malicioso'
            ],
            scenarios: [
                'Escuchas un rumor falso sobre un compañero que está afectando su reputación.',
                'Te enteras de información falsa que se está esparciendo sobre un compañero.',
                'Observas que un rumor sin fundamento está dañando la reputación de un estudiante.',
                'Notas que chismes falsos sobre un compañero se están propagando rápidamente.'
            ],
            goodOptions: [
                'Aclarar el rumor con tus compañeros cuando lo escuches',
                'Hablar directamente con el estudiante afectado para ver cómo está',
                'Contarle a un adulto sobre la situación'
            ],
            badOptions: [
                'Ignorar el rumor para no involucrarte',
                'Participar en difundir el rumor',
                'No hacer nada al respecto'
            ]
        },
        {
            titles: [
                'La Exclusión en el Grupo', 'El Grupo Excluyente', 'La Marginación',
                'La Exclusión Deliberada', 'El Aislamiento Social', 'La Exclusión Intencional',
                'El Rechazo del Grupo', 'La Marginación Deliberada', 'La Exclusión Activa'
            ],
            scenarios: [
                'Tu grupo de amigos está excluyendo deliberadamente a una compañera de las actividades.',
                'Observas que tu grupo está dejando fuera a un compañero intencionalmente.',
                'Notas que tus amigos están evitando incluir a alguien en sus actividades.',
                'Ves que un compañero está siendo excluido activamente del grupo.'
            ],
            goodOptions: [
                'Invitar a la compañera excluida a unirte a ti en otra actividad',
                'Hablar con tus amigos sobre por qué están excluyendo a la compañera',
                'Preguntarle a la compañera si está bien y ofrecerle apoyo'
            ],
            badOptions: [
                'No hacer nada para no perder la amistad de tu grupo',
                'Ignorar la situación',
                'Unirse a la exclusión para mantener tu lugar en el grupo'
            ]
        },
        {
            titles: [
                'El Cyberbullying', 'El Acoso Digital', 'El Hostigamiento Online',
                'La Agresión Virtual', 'El Bullying en Redes', 'El Acoso Cibernético',
                'El Hostigamiento Digital', 'La Intimidación Online', 'El Acoso en Internet'
            ],
            scenarios: [
                'Ves que alguien publicó una foto humillante de un compañero en las redes sociales.',
                'Observas comentarios negativos y dañinos sobre un compañero en redes sociales.',
                'Notas que se está difundiendo contenido humillante sobre un estudiante online.',
                'Ves que un compañero está siendo objeto de cyberbullying en las redes sociales.'
            ],
            goodOptions: [
                'Reportar la publicación a la plataforma y contarle a un adulto',
                'Contactar al estudiante afectado para ofrecerle apoyo emocional',
                'No participar en compartir o comentar la publicación'
            ],
            badOptions: [
                'Ignorar la situación',
                'Participar compartiendo o comentando',
                'No hacer nada al respecto'
            ]
        },
        {
            titles: [
                'El Testigo del Acoso', 'El Acoso Físico', 'La Agresión Presenciada',
                'El Bullying Presenciado', 'La Intimidación Física', 'El Acoso Observado',
                'La Agresión Directa', 'El Hostigamiento Presenciado', 'El Acoso Testificado'
            ],
            scenarios: [
                'Presencias que un estudiante está siendo acosado físicamente en los pasillos.',
                'Observas una situación de acoso físico entre estudiantes.',
                'Eres testigo de que un estudiante está siendo agredido por otros.',
                'Presencias una situación de bullying físico hacia un compañero.'
            ],
            goodOptions: [
                'Buscar inmediatamente ayuda de un adulto (profesor, director, etc.)',
                'Intervenir verbalmente si te sientes seguro, y luego buscar ayuda',
                'Reunir a otros estudiantes para que juntos intervengan'
            ],
            badOptions: [
                'No hacer nada por miedo a represalias',
                'Ignorar la situación completamente',
                'Alejarte sin hacer nada'
            ]
        }
    ];

    for (let i = 0; i < 100; i++) {
        const templateIndex = i % scenarioTemplates.length;
        const template = scenarioTemplates[templateIndex];
        
        // Variar títulos y escenarios para mayor diversidad
        const titleIndex = Math.floor(i / scenarioTemplates.length) % template.titles.length;
        const scenarioIndex = Math.floor(i / scenarioTemplates.length) % template.scenarios.length;
        const title = template.titles[titleIndex];
        const scenario = template.scenarios[scenarioIndex];
        
        // Mezclar opciones para mayor variación
        const shuffledGoodOptions = [...template.goodOptions].sort(() => Math.random() - 0.5);
        const shuffledBadOptions = [...template.badOptions].sort(() => Math.random() - 0.5);
        
        scenarios.push({
            id: i + 1,
            title: title,
            scenario: scenario + ' ¿Qué harías?',
            options: [
                {
                    id: 'a',
                    text: shuffledGoodOptions[0],
                    feedback: generateFeedback('excelente', title),
                    ethicalScore: 85 + Math.floor(Math.random() * 15),
                    tags: ['valentía', 'empatía', 'acción correcta']
                },
                {
                    id: 'b',
                    text: shuffledGoodOptions[1] || shuffledGoodOptions[0],
                    feedback: generateFeedback('buena', title),
                    ethicalScore: 65 + Math.floor(Math.random() * 20),
                    tags: ['empatía', 'apoyo', 'comunicación']
                },
                {
                    id: 'c',
                    text: shuffledGoodOptions[2] || shuffledGoodOptions[1] || shuffledGoodOptions[0],
                    feedback: generateFeedback('moderada', title),
                    ethicalScore: 50 + Math.floor(Math.random() * 20),
                    tags: ['responsabilidad', 'búsqueda de ayuda']
                },
                {
                    id: 'd',
                    text: shuffledBadOptions[0],
                    feedback: generateFeedback('necesita_mejora', title),
                    ethicalScore: 20 + Math.floor(Math.random() * 25),
                    tags: ['pasividad', 'necesita acción']
                }
            ]
        });
    }

    return scenarios;
}

// Función auxiliar para generar feedback dinámico
function generateFeedback(type, context) {
    const feedbacks = {
        excelente: [
            'Excelente decisión. Esta acción muestra valentía y empatía. Puede hacer una diferencia real en la situación.',
            'Muy bien pensado. Esta es la respuesta más ética y responsable en esta situación.',
            'Excelente. Tu acción puede proteger y apoyar a quien lo necesita.'
        ],
        buena: [
            'Buena iniciativa. Esta acción es valiosa, aunque podrías considerar combinarla con otras formas de ayuda.',
            'Muy bien. Esto muestra empatía. Considera también otras acciones complementarias.',
            'Buena decisión. Mostrar apoyo es importante y puede ayudar significativamente.'
        ],
        moderada: [
            'Entiendo tu perspectiva. Sin embargo, considera que podrías tomar acciones más directas para ayudar.',
            'Esto es un paso, pero la situación podría requerir una respuesta más activa.',
            'Bien, pero hay formas más efectivas de ayudar en esta situación.'
        ],
        necesita_mejora: [
            'Entiendo que puede ser difícil, pero no actuar permite que la situación continúe. Considera formas seguras de ayudar.',
            'Comprendo tu preocupación, pero el silencio puede empeorar la situación. Tu voz puede hacer la diferencia.',
            'Es importante actuar. Hay formas seguras de ayudar sin ponerte en riesgo.'
        ]
    };
    
    const options = feedbacks[type] || feedbacks.necesita_mejora;
    return options[Math.floor(Math.random() * options.length)];
}

// Generar todos los tests una vez (caché)
let cachedEmpathyTests = {};
let cachedSelfCareTests = {};
let cachedConflictResolutionTests = {};
let cachedEthicalScenarios = null;

// Obtener opciones de respuesta según edad
function getResponseOptionsByAge(ageGroup, type = 'frequency') {
    if (ageGroup === '9-11') {
        if (type === 'frequency') {
            return [
                { value: 1, label: 'Nunca' },
                { value: 2, label: 'Pocas veces' },
                { value: 3, label: 'A veces' },
                { value: 4, label: 'Muchas veces' },
                { value: 5, label: 'Siempre' }
            ];
        } else if (type === 'quality') {
            return [
                { value: 1, label: 'Muy mal' },
                { value: 2, label: 'Regular' },
                { value: 3, label: 'Bien' },
                { value: 4, label: 'Muy bien' },
                { value: 5, label: 'Excelente' }
            ];
        } else if (type === 'understanding') {
            return [
                { value: 1, label: 'No lo entiendo nada' },
                { value: 2, label: 'Lo entiendo un poco' },
                { value: 3, label: 'Lo entiendo bastante' },
                { value: 4, label: 'Lo entiendo bien' },
                { value: 5, label: 'Lo entiendo muy bien' }
            ];
        } else if (type === 'importance') {
            return [
                { value: 1, label: 'No es importante' },
                { value: 2, label: 'Poco importante' },
                { value: 3, label: 'Algo importante' },
                { value: 4, label: 'Muy importante' },
                { value: 5, label: 'Súper importante' }
            ];
        } else if (type === 'skill') {
            return [
                { value: 1, label: 'No soy hábil' },
                { value: 2, label: 'Poco hábil' },
                { value: 3, label: 'Algo hábil' },
                { value: 4, label: 'Muy hábil' },
                { value: 5, label: 'Súper hábil' }
            ];
        }
    } else if (ageGroup === '12-15') {
        if (type === 'frequency') {
            return [
                { value: 1, label: 'Nunca' },
                { value: 2, label: 'Rara vez' },
                { value: 3, label: 'A veces' },
                { value: 4, label: 'A menudo' },
                { value: 5, label: 'Siempre' }
            ];
        } else if (type === 'quality') {
            return [
                { value: 1, label: 'Muy mal' },
                { value: 2, label: 'Regular' },
                { value: 3, label: 'Bien' },
                { value: 4, label: 'Muy bien' },
                { value: 5, label: 'Excelente' }
            ];
        } else if (type === 'understanding') {
            return [
                { value: 1, label: 'No lo entiendo en absoluto' },
                { value: 2, label: 'A veces lo entiendo' },
                { value: 3, label: 'Lo entiendo moderadamente' },
                { value: 4, label: 'Lo entiendo bien' },
                { value: 5, label: 'Lo entiendo muy bien' }
            ];
        } else if (type === 'importance') {
            return [
                { value: 1, label: 'Muy poco importante' },
                { value: 2, label: 'Poco importante' },
                { value: 3, label: 'Moderadamente importante' },
                { value: 4, label: 'Importante' },
                { value: 5, label: 'Muy importante' }
            ];
        } else if (type === 'skill') {
            return [
                { value: 1, label: 'No soy hábil' },
                { value: 2, label: 'Poco hábil' },
                { value: 3, label: 'Moderadamente hábil' },
                { value: 4, label: 'Muy hábil' },
                { value: 5, label: 'Extremadamente hábil' }
            ];
        }
    } else { // 16-17
        if (type === 'frequency') {
            return [
                { value: 1, label: 'Nunca' },
                { value: 2, label: 'Rara vez' },
                { value: 3, label: 'Ocasionalmente' },
                { value: 4, label: 'Frecuentemente' },
                { value: 5, label: 'Constantemente' }
            ];
        } else if (type === 'quality') {
            return [
                { value: 1, label: 'Muy deficiente' },
                { value: 2, label: 'Deficiente' },
                { value: 3, label: 'Aceptable' },
                { value: 4, label: 'Buena' },
                { value: 5, label: 'Excelente' }
            ];
        } else if (type === 'understanding') {
            return [
                { value: 1, label: 'No lo comprendo en absoluto' },
                { value: 2, label: 'Ocasionalmente lo comprendo' },
                { value: 3, label: 'Lo comprendo moderadamente' },
                { value: 4, label: 'Lo comprendo bien' },
                { value: 5, label: 'Lo comprendo muy bien' }
            ];
        } else if (type === 'importance') {
            return [
                { value: 1, label: 'Muy bajo' },
                { value: 2, label: 'Bajo' },
                { value: 3, label: 'Moderado' },
                { value: 4, label: 'Alto' },
                { value: 5, label: 'Muy alto' }
            ];
        } else if (type === 'skill') {
            return [
                { value: 1, label: 'Muy poco hábil' },
                { value: 2, label: 'Poco hábil' },
                { value: 3, label: 'Moderadamente hábil' },
                { value: 4, label: 'Muy hábil' },
                { value: 5, label: 'Extremadamente hábil' }
            ];
        }
    }
    // Default
    return [
        { value: 1, label: 'Nunca' },
        { value: 2, label: 'Rara vez' },
        { value: 3, label: 'A veces' },
        { value: 4, label: 'A menudo' },
        { value: 5, label: 'Siempre' }
    ];
}

function getEmpathyTests(ageGroup = '12-15') {
    const cacheKey = `empathy_${ageGroup}`;
    if (!cachedEmpathyTests || !cachedEmpathyTests[ageGroup]) {
        if (!cachedEmpathyTests) cachedEmpathyTests = {};
        cachedEmpathyTests[ageGroup] = generateEmpathyTests(ageGroup);
    }
    return cachedEmpathyTests[ageGroup];
}

function getSelfCareTests(ageGroup = '12-15') {
    const cacheKey = `selfcare_${ageGroup}`;
    if (!cachedSelfCareTests || !cachedSelfCareTests[ageGroup]) {
        if (!cachedSelfCareTests) cachedSelfCareTests = {};
        cachedSelfCareTests[ageGroup] = generateSelfCareTests(ageGroup);
    }
    return cachedSelfCareTests[ageGroup];
}

function getConflictResolutionTests(ageGroup = '12-15') {
    const cacheKey = `conflict_${ageGroup}`;
    if (!cachedConflictResolutionTests || !cachedConflictResolutionTests[ageGroup]) {
        if (!cachedConflictResolutionTests) cachedConflictResolutionTests = {};
        cachedConflictResolutionTests[ageGroup] = generateConflictResolutionTests(ageGroup);
    }
    return cachedConflictResolutionTests[ageGroup];
}

function getAvailableActivities() {
    const monthIndex = getCurrentMonthIndex();
    const year = new Date().getFullYear();
    
    // Obtener la edad del estudiante actual
    const studentAge = currentUser && currentUser.age ? currentUser.age : null;
    const ageGroup = getAgeGroup(studentAge);
    
    // Combinar año y mes para tener rotación única cada mes de cada año
    // Esto asegura que el mismo mes de diferentes años mostrará diferentes tests
    const rotationSeed = year * 12 + monthIndex;
    
    // Obtener los tests para el mes actual usando rotación, adaptados por edad
    const empathyTests = getEmpathyTests(ageGroup);
    const selfCareTests = getSelfCareTests(ageGroup);
    const conflictResolutionTests = getConflictResolutionTests(ageGroup);
    
    // Seleccionar el test del mes actual (rotación mensual sin repetir)
    // Usa saltos diferentes para cada tipo de test para evitar que coincidan
    const empathyTestIndex = rotationSeed % empathyTests.length;
    const selfCareTestIndex = (rotationSeed + 33) % selfCareTests.length;
    const conflictResolutionTestIndex = (rotationSeed + 67) % conflictResolutionTests.length;
    
    const currentEmpathyTest = empathyTests[empathyTestIndex];
    const currentSelfCareTest = selfCareTests[selfCareTestIndex];
    const currentConflictResolutionTest = conflictResolutionTests[conflictResolutionTestIndex];
    
    return [
        {
            id: 'gratitude_journal',
            title: 'Diario de Gratitud',
            description: 'Escribe sobre las cosas por las que estás agradecido/a',
            type: 'reflection',
            placeholder: 'Hoy estoy agradecido/a por...'
        },
        currentEmpathyTest,
        currentSelfCareTest,
        currentConflictResolutionTest,
        {
            id: 'ethical_decision_simulator',
            title: getEthicalSimulatorTitle(),
            description: 'Experiencias interactivas donde debes resolver conflictos sociales y recibir retroalimentación sobre tus elecciones',
            type: 'simulator'
        }
    ];
}

// Función legacy para mantener compatibilidad
function getAvailableActivitiesOld() {
    return [
        {
            id: 'gratitude_journal',
            title: 'Diario de Gratitud',
            description: 'Escribe sobre las cosas por las que estás agradecido/a',
            type: 'reflection',
            placeholder: 'Hoy estoy agradecido/a por...'
        },
        {
            id: 'empathy_exercise',
            title: 'Ejercicio de Empatía',
            description: 'Evalúa tu capacidad para ponerte en el lugar de otros',
            type: 'test',
            questions: [
                {
                    text: 'Cuando veo a un compañero triste, ¿qué tan bien puedo entender cómo se siente?',
                    options: [
                        { value: 1, label: 'No lo entiendo en absoluto' },
                        { value: 2, label: 'A veces lo entiendo' },
                        { value: 3, label: 'Lo entiendo moderadamente' },
                        { value: 4, label: 'Lo entiendo bien' },
                        { value: 5, label: 'Lo entiendo muy bien' }
                    ]
                },
                {
                    text: '¿Con qué frecuencia intentas ver las situaciones desde la perspectiva de otros?',
                    options: [
                        { value: 1, label: 'Nunca' },
                        { value: 2, label: 'Rara vez' },
                        { value: 3, label: 'A veces' },
                        { value: 4, label: 'A menudo' },
                        { value: 5, label: 'Siempre' }
                    ]
                },
                {
                    text: 'Cuando alguien está pasando por un momento difícil, ¿cómo de efectivo eres para ofrecer apoyo?',
                    options: [
                        { value: 1, label: 'No sé cómo ayudar' },
                        { value: 2, label: 'A veces puedo ayudar' },
                        { value: 3, label: 'Puedo ayudar moderadamente' },
                        { value: 4, label: 'Suelo ser efectivo ayudando' },
                        { value: 5, label: 'Soy muy efectivo ayudando' }
                    ]
                },
                {
                    text: '¿Qué tan bien reconoces las emociones de tus compañeros?',
                    options: [
                        { value: 1, label: 'Muy mal' },
                        { value: 2, label: 'Regular' },
                        { value: 3, label: 'Bien' },
                        { value: 4, label: 'Muy bien' },
                        { value: 5, label: 'Excelente' }
                    ]
                },
                {
                    text: '¿Qué tan importante crees que es entender los sentimientos de otros?',
                    options: [
                        { value: 1, label: 'No es importante' },
                        { value: 2, label: 'Poco importante' },
                        { value: 3, label: 'Moderadamente importante' },
                        { value: 4, label: 'Muy importante' },
                        { value: 5, label: 'Extremadamente importante' }
                    ]
                }
            ]
        },
        {
            id: 'self_care',
            title: 'Autocuidado',
            description: 'Evalúa tus prácticas de autocuidado y bienestar personal',
            type: 'test',
            questions: [
                {
                    text: '¿Con qué frecuencia realizas actividades que disfrutas y te relajan?',
                    options: [
                        { value: 1, label: 'Nunca' },
                        { value: 2, label: 'Rara vez' },
                        { value: 3, label: 'A veces' },
                        { value: 4, label: 'A menudo' },
                        { value: 5, label: 'Siempre' }
                    ]
                },
                {
                    text: '¿Qué tan bien cuidas tu descanso y sueño?',
                    options: [
                        { value: 1, label: 'Muy mal' },
                        { value: 2, label: 'Regular' },
                        { value: 3, label: 'Bien' },
                        { value: 4, label: 'Muy bien' },
                        { value: 5, label: 'Excelente' }
                    ]
                },
                {
                    text: '¿Con qué frecuencia practicas hábitos saludables (ejercicio, alimentación, etc.)?',
                    options: [
                        { value: 1, label: 'Nunca' },
                        { value: 2, label: 'Rara vez' },
                        { value: 3, label: 'A veces' },
                        { value: 4, label: 'A menudo' },
                        { value: 5, label: 'Siempre' }
                    ]
                },
                {
                    text: '¿Qué tan bien reconoces cuando necesitas tomar un descanso o reducir el estrés?',
                    options: [
                        { value: 1, label: 'Muy mal' },
                        { value: 2, label: 'Regular' },
                        { value: 3, label: 'Bien' },
                        { value: 4, label: 'Muy bien' },
                        { value: 5, label: 'Excelente' }
                    ]
                },
                {
                    text: '¿Qué tan importante consideras el autocuidado para tu bienestar?',
                    options: [
                        { value: 1, label: 'No es importante' },
                        { value: 2, label: 'Poco importante' },
                        { value: 3, label: 'Moderadamente importante' },
                        { value: 4, label: 'Muy importante' },
                        { value: 5, label: 'Extremadamente importante' }
                    ]
                }
            ]
        },
        {
            id: 'conflict_resolution',
            title: 'Resolución de Conflictos',
            description: 'Evalúa tu capacidad para resolver conflictos de manera pacífica',
            type: 'test',
            questions: [
                {
                    text: 'Cuando tienes un conflicto con alguien, ¿qué tan bien puedes mantener la calma?',
                    options: [
                        { value: 1, label: 'Muy mal' },
                        { value: 2, label: 'Regular' },
                        { value: 3, label: 'Bien' },
                        { value: 4, label: 'Muy bien' },
                        { value: 5, label: 'Excelente' }
                    ]
                },
                {
                    text: '¿Con qué frecuencia buscas una solución que beneficie a ambas partes en un conflicto?',
                    options: [
                        { value: 1, label: 'Nunca' },
                        { value: 2, label: 'Rara vez' },
                        { value: 3, label: 'A veces' },
                        { value: 4, label: 'A menudo' },
                        { value: 5, label: 'Siempre' }
                    ]
                },
                {
                    text: '¿Qué tan efectivo eres para escuchar la perspectiva de la otra persona durante un conflicto?',
                    options: [
                        { value: 1, label: 'Muy inefectivo' },
                        { value: 2, label: 'Poco efectivo' },
                        { value: 3, label: 'Moderadamente efectivo' },
                        { value: 4, label: 'Muy efectivo' },
                        { value: 5, label: 'Extremadamente efectivo' }
                    ]
                },
                {
                    text: '¿Qué tan bien puedes encontrar puntos en común con alguien con quien tienes un desacuerdo?',
                    options: [
                        { value: 1, label: 'Muy mal' },
                        { value: 2, label: 'Regular' },
                        { value: 3, label: 'Bien' },
                        { value: 4, label: 'Muy bien' },
                        { value: 5, label: 'Excelente' }
                    ]
                },
                {
                    text: '¿Qué tan importante consideras resolver conflictos de manera pacífica y respetuosa?',
                    options: [
                        { value: 1, label: 'No es importante' },
                        { value: 2, label: 'Poco importante' },
                        { value: 3, label: 'Moderadamente importante' },
                        { value: 4, label: 'Muy importante' },
                        { value: 5, label: 'Extremadamente importante' }
                    ]
                }
            ]
        },
        {
            id: 'ethical_decision_simulator',
            title: getEthicalSimulatorTitle(),
            description: 'Experiencias interactivas donde debes resolver conflictos sociales y recibir retroalimentación sobre tus elecciones',
            type: 'simulator'
        }
    ];
}

// ========== TEACHER DASHBOARD ==========
// ========== FUNCIONES HELPER PARA FILTRAR POR CLIENTE ==========

// Obtener el clientId del docente actual
function getCurrentTeacherClientId() {
    if (!currentUser) return null;
    
    // Si el docente tiene clientId, usarlo
    if (currentUser.clientId) {
        return currentUser.clientId;
    }
    
    // Si es admin@munay.com, retornar null (ve todo)
    if (currentUser.email === 'admin@munay.com' || currentUser.email === 'munay@munay.com') {
        return null;
    }
    
    // Si no tiene clientId, buscar por dominio del email
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const teacherDomain = currentUser.email.split('@')[1];
    
    // Buscar cliente por dominio del email de contacto
    const client = clients.find(c => {
        const contactDomain = c.contactEmail.split('@')[1];
        return contactDomain === teacherDomain;
    });
    
    return client ? client.id : null;
}

// Obtener todos los usuarios del cliente del docente actual
function getClientUsers() {
    const clientId = getCurrentTeacherClientId();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Si es admin o no tiene cliente, retornar todos los usuarios
    if (!clientId || currentUser.email === 'admin@munay.com' || currentUser.email === 'munay@munay.com') {
        return users;
    }
    
    // Filtrar usuarios del cliente
    return users.filter(u => u.clientId === clientId);
}

// Obtener estudiantes del cliente del docente actual
function getClientStudents() {
    const clientUsers = getClientUsers();
    return clientUsers.filter(u => u.role === 'student');
}

// Obtener clases del cliente del docente actual
function getClientClasses() {
    const clientId = getCurrentTeacherClientId();
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Si es admin o no tiene cliente, retornar todas las clases del docente
    if (!clientId || currentUser.email === 'admin@munay.com' || currentUser.email === 'munay@munay.com') {
        return classes.filter(c => {
            const teacher = users.find(u => u.id === c.teacherId);
            return teacher && (teacher.id === currentUser.id || teacher.email === currentUser.email);
        });
    }
    
    // Filtrar clases donde el profesor pertenece al cliente
    const clientUsers = getClientUsers();
    const clientUserIds = clientUsers.map(u => u.id);
    
    let clientClasses = classes.filter(c => clientUserIds.includes(c.teacherId));
    
    // Si no hay clases creadas, crear clases virtuales basadas en los classCode de los estudiantes del cliente
    if (clientClasses.length === 0) {
        const clientStudents = getClientStudents();
        const uniqueClassCodes = [...new Set(clientStudents
            .filter(s => s.classCode)
            .map(s => s.classCode)
        )];
        
        // Crear clases virtuales para cada classCode único
        clientClasses = uniqueClassCodes.map(classCode => {
            // Buscar si ya existe una clase con ese código (aunque no esté asociada al docente)
            const existingClass = classes.find(c => c.code === classCode);
            if (existingClass) {
                return existingClass;
            }
            
            // Crear clase virtual
            return {
                id: `class_${classCode}_${clientId}`,
                code: classCode,
                name: `Clase ${classCode}`,
                teacherId: currentUser.id,
                teacherName: currentUser.name,
                createdAt: new Date().toISOString()
            };
        });
    }
    
    return clientClasses;
}

// Obtener encuestas del cliente del docente actual
function getClientSurveyResponses() {
    const clientStudents = getClientStudents();
    const studentIds = clientStudents.map(s => s.id);
    const surveyResponses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
    
    return surveyResponses.filter(r => studentIds.includes(r.studentId));
}

// Obtener actividades del cliente del docente actual
function getClientActivities() {
    const clientStudents = getClientStudents();
    const studentIds = clientStudents.map(s => s.id);
    const activities = JSON.parse(localStorage.getItem('studentActivities') || '[]');
    
    return activities.filter(a => studentIds.includes(a.studentId));
}

// Obtener mensajes del cliente del docente actual
function getClientMessages() {
    const clientClasses = getClientClasses();
    const classCodes = clientClasses.map(c => c.code);
    const messages = JSON.parse(localStorage.getItem('anonymousMessages') || '[]');
    
    return messages.filter(m => classCodes.includes(m.studentClassCode));
}

// Obtener notificaciones del cliente del docente actual
function getClientNotifications() {
    const clientStudents = getClientStudents();
    const studentIds = clientStudents.map(s => s.id);
    const notifications = JSON.parse(localStorage.getItem('teacherNotifications') || '[]');
    
    return notifications.filter(n => studentIds.includes(n.studentId));
}

function initTeacherDashboard() {
    if (!currentUser || currentUser.role !== 'teacher') return;

    // Actualizar nombre en todas las vistas de docente (incluye h2 de bienvenida)
    updateTeacherName();
    
    // Analizar mensajes existentes que no tengan análisis
    if (typeof analyzeExistingDemoMessages === 'function') {
        analyzeExistingDemoMessages();
    }
    
    displayClassCodes();
    loadStudentData();
    loadKeywordsTrends();
    loadTeacherNotifications();
    loadEmotionalValues();
    updateRiskAlertsBadge();
    
    // Inicializar formulario de crear código de clase
    const createClassCodeForm = document.getElementById('createClassCodeForm');
    if (createClassCodeForm) {
        createClassCodeForm.removeEventListener('submit', handleCreateClassCode);
        createClassCodeForm.addEventListener('submit', handleCreateClassCode);
    }
    
    // Inicializar formulario de respuesta
    const replyMessageForm = document.getElementById('replyMessageForm');
    if (replyMessageForm) {
        replyMessageForm.removeEventListener('submit', handleReplyMessage);
        replyMessageForm.addEventListener('submit', handleReplyMessage);
    }
}

// Actualizar nombre del docente en todas las vistas
function updateTeacherName() {
    if (!currentUser || currentUser.role !== 'teacher') return;
    const teacherNameElements = document.querySelectorAll('#teacherName');
    teacherNameElements.forEach(el => {
        el.textContent = currentUser.name;
    });
    
    // Actualizar nombre en el h2 de bienvenida
    const welcomeTeacherNameEl = document.getElementById('welcomeTeacherName');
    if (welcomeTeacherNameEl) {
        welcomeTeacherNameEl.textContent = currentUser.name.split(' ')[0];
    }
    
    // Actualizar saludo según género
    const welcomeTeacherGreetingEl = document.getElementById('welcomeTeacherGreeting');
    if (welcomeTeacherGreetingEl) {
        if (typeof i18n !== 'undefined') {
            if (currentUser.gender === 'femenino') {
                welcomeTeacherGreetingEl.textContent = i18n.t('dashboard.welcomeFeminine');
            } else {
                welcomeTeacherGreetingEl.textContent = i18n.t('dashboard.welcome');
            }
        } else {
        if (currentUser.gender === 'femenino') {
            welcomeTeacherGreetingEl.textContent = 'Bienvenida';
        } else {
            welcomeTeacherGreetingEl.textContent = 'Bienvenido';
        }
        }
    }
    
    // Actualizar subtítulo del dashboard
    const welcomeSubtitle = document.querySelector('#teacherView .welcome-section p');
    if (welcomeSubtitle && typeof i18n !== 'undefined') {
        welcomeSubtitle.textContent = i18n.t('dashboard.welcomeSubtitle');
    }
}

function displayClassCodes() {
    const classCodesList = document.getElementById('classCodesList');
    if (!classCodesList) return;
    
    if (!currentUser || !currentUser.id) {
        console.error('❌ Error: currentUser no está definido en displayClassCodes');
        return;
    }
    
    // Obtener clases del profesor actual (solo del cliente)
    let teacherClasses = getClientClasses().filter(c => c.teacherId === currentUser.id);
    
    // Caso especial para admin@munay.com: incluir CLSDEMO si existe
    const isAdmin = currentUser.email === 'admin@munay.com' || currentUser.email === 'munay@munay.com';
    if (isAdmin) {
        const classes = JSON.parse(localStorage.getItem('classes') || '[]');
        // Buscar CLSDEMO en las clases existentes
        const clsDemo = classes.find(c => c.code === 'CLSDEMO');
        if (clsDemo) {
            // Si CLSDEMO existe pero no está en teacherClasses, agregarlo
            if (!teacherClasses.some(c => c.code === 'CLSDEMO')) {
                teacherClasses.push(clsDemo);
            }
        } else {
            // Si CLSDEMO no existe en las clases, crearlo virtualmente para mostrarlo
            teacherClasses.push({
                code: 'CLSDEMO',
                name: 'Colegio Demo - 50 Estudiantes',
                teacherId: currentUser.id,
                teacherName: currentUser.name
            });
        }
    }
    
    if (teacherClasses.length === 0) {
        classCodesList.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #666;">
                <p>No tienes códigos de clase creados aún.</p>
                <p style="font-size: 0.9em; margin-top: 10px;">Crea tu primer código para que tus estudiantes se registren.</p>
            </div>
        `;
        return;
    }
    
    classCodesList.innerHTML = '';
    
    teacherClasses.forEach(classData => {
        // Contar estudiantes de esta clase (solo del cliente)
        const clientStudents = getClientStudents();
        const studentsInClass = clientStudents.filter(u => 
            u.classCode === classData.code
        );
        
        const codeItem = document.createElement('div');
        codeItem.className = 'class-code-item';
        codeItem.innerHTML = `
            <div class="class-code-info">
                <div class="class-code-name">${classData.name || 'Sin nombre'}</div>
                <div class="class-code-value">${classData.code}</div>
                <div class="class-code-stats">${studentsInClass.length} estudiante${studentsInClass.length !== 1 ? 's' : ''} registrado${studentsInClass.length !== 1 ? 's' : ''}</div>
                ${studentsInClass.length > 0 ? `
                    <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e8eef5;">
                        <button class="btn-secondary" onclick="toggleStudentsList('${escapeHtmlAttribute(classData.code)}')" style="font-size: 0.85em; padding: 6px 12px;">
                            👥 Ver estudiantes
                        </button>
                        <div id="students-list-${escapeHtmlAttribute(classData.code)}" style="display: none; margin-top: 10px; padding: 10px; background: #f8f9fc; border-radius: 8px; max-height: 200px; overflow-y: auto;">
                            ${studentsInClass.map(s => `
                                <div style="padding: 6px 0; border-bottom: 1px solid #e8eef5; display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 1.2em;">${s.avatar || '👤'}</span>
                                    <div>
                                        <div style="font-weight: 600; color: #1a2332;">${escapeHtmlAttribute(s.name)}</div>
                                        <div style="font-size: 0.8em; color: #666;">${escapeHtmlAttribute(s.email)}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
            <div class="class-code-actions">
                <button class="btn-secondary" onclick="copyClassCode('${escapeHtmlAttribute(classData.code)}')">${typeof i18n !== 'undefined' ? i18n.t('classCodes.copy') : 'Copiar'}</button>
                ${teacherClasses.length > 1 && classData.code !== 'CLSDEMO' ? `<button class="btn-secondary" onclick="deleteClassCode('${escapeHtmlAttribute(classData.code)}')" style="background: #dc3545; color: white; border-color: #dc3545;">Eliminar</button>` : ''}
            </div>
        `;
        classCodesList.appendChild(codeItem);
    });
}

function copyClassCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        const msg = typeof i18n !== 'undefined' ? i18n.t('success.codeCopied', { code: code }) : `✅ Código "${code}" copiado al portapapeles`;
        showSuccessMessage(msg);
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        const msg = typeof i18n !== 'undefined' ? i18n.t('success.codeCopied', { code: code }) : `✅ Código "${code}" copiado al portapapeles`;
        showSuccessMessage(msg);
    });
}

// Toggle mostrar/ocultar lista de estudiantes de una clase
function toggleStudentsList(classCode) {
    const studentsList = document.getElementById(`students-list-${classCode}`);
    if (studentsList) {
        const isVisible = studentsList.style.display !== 'none';
        studentsList.style.display = isVisible ? 'none' : 'block';
        
        // Actualizar texto del botón
        const button = event.target;
        if (button) {
            button.textContent = isVisible ? '👥 Ver estudiantes' : '👥 Ocultar estudiantes';
        }
    }
}

function openCreateClassCodeModal() {
    document.getElementById('createClassCodeModal').style.display = 'block';
}

function closeCreateClassCodeModal() {
    document.getElementById('createClassCodeModal').style.display = 'none';
    document.getElementById('createClassCodeForm').reset();
}

function handleCreateClassCode(e) {
    e.preventDefault();
    
    // Verificar que currentUser esté definido
    if (!currentUser || !currentUser.id) {
        console.error('❌ Error: currentUser no está definido');
        alert('Error: No se pudo identificar al usuario. Por favor, recarga la página.');
        return;
    }
    
    const className = document.getElementById('className').value.trim();
    let classCode = generateClassCode();
    
    if (!localStorage.getItem('classes')) {
        localStorage.setItem('classes', '[]');
    }
    
    const classes = JSON.parse(localStorage.getItem('classes'));
    
    // Verificar que no exista un código duplicado
    let existingCode = classes.find(c => c.code === classCode);
    while (existingCode) {
        // Si existe, generar uno nuevo
        classCode = generateClassCode();
        existingCode = classes.find(c => c.code === classCode);
    }
    
    const newClass = {
        code: classCode,
        teacherId: currentUser.id,
        teacherName: currentUser.name,
        name: className || null,
        createdAt: new Date().toISOString()
    };
    
    classes.push(newClass);
    
    try {
        localStorage.setItem('classes', JSON.stringify(classes));
        
        closeCreateClassCodeModal();
        displayClassCodes();
        
        // Actualizar el filtro de estudiantes si estamos en la vista de estudiantes
        if (currentView === 'teacherStudents') {
            loadClassCodeFilter();
            filterStudentsByClass();
        }
        
        const namePart = className ? `\nNombre: ${className}` : '';
        const msg = `✅ Código de clase "${classCode}" creado exitosamente.${namePart}`;
        
        // Usar showMessage si existe, sino usar alert
        if (typeof showMessage === 'function') {
            showMessage(msg, 'success');
        } else if (typeof showSuccessMessage === 'function') {
            showSuccessMessage(msg);
        } else {
            alert(msg);
        }
    } catch (error) {
        console.error('❌ Error al guardar código de clase:', error);
        alert('Error al guardar el código de clase. Por favor, intenta nuevamente.');
    }
}

async function deleteClassCode(code) {
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const classData = classes.find(c => c.code === code);
    
    if (!classData) return;
    
    const students = JSON.parse(localStorage.getItem('users') || '[]').filter(
        u => u.role === 'student' && u.classCode === code
    );
    
    let message;
    if (students.length > 0) {
        const studentWord = students.length === 1 
            ? (typeof i18n !== 'undefined' ? i18n.t('classCodes.student') : 'estudiante')
            : (typeof i18n !== 'undefined' ? i18n.t('classCodes.students') : 'estudiantes');
        const registeredWord = students.length === 1
            ? (typeof i18n !== 'undefined' ? i18n.t('classCodes.registered') : 'registrado')
            : (typeof i18n !== 'undefined' ? i18n.t('classCodes.registeredPlural') : 'registrados');
        message = typeof i18n !== 'undefined' 
            ? i18n.t('classCodes.deleteConfirmWithStudents', { code: code, count: students.length, studentWord: studentWord, registeredWord: registeredWord })
            : `¿Estás seguro de que deseas eliminar el código "${code}"?\n\nHay ${students.length} ${studentWord} ${registeredWord} en esta clase. Esta acción no se puede deshacer.`;
    } else {
        message = typeof i18n !== 'undefined' 
            ? i18n.t('classCodes.deleteConfirm', { code: code })
            : `¿Estás seguro de que deseas eliminar el código "${code}"?`;
    }
    
    const confirmed = await showConfirmation(message);
    if (!confirmed) return;
    
    const updatedClasses = classes.filter(c => c.code !== code);
    localStorage.setItem('classes', JSON.stringify(updatedClasses));
    
    // Clear cache when data changes
    dataCache.clearPattern('students');
    
    displayClassCodes();
    
    // Actualizar el filtro de estudiantes si estamos en la vista de estudiantes
    if (currentView === 'teacherStudents') {
        loadClassCodeFilter();
        filterStudentsByClass();
    }
    
    // Recargar datos si es necesario
    if (currentView === 'teacher') {
        loadStudentData();
    }
    
    showSuccessMessage('✅ Código de clase eliminado exitosamente.');
}

// ========== SISTEMA DE ESPACIOS DE CRECIMIENTO ==========

// Variables globales para espacios de crecimiento
let currentGrowthSpaceId = null;
let selectedStudentsForSpace = new Set();

// Cargar espacios de crecimiento del docente
function loadGrowthSpaces() {
    const container = document.getElementById('growthSpacesContainer');
    const noSpacesMessage = document.getElementById('noGrowthSpacesMessage');
    
    if (!container) return;
    
    const growthSpaces = getGrowthSpaces();
    
    if (growthSpaces.length === 0) {
        container.innerHTML = '';
        if (noSpacesMessage) noSpacesMessage.style.display = 'block';
        return;
    }
    
    if (noSpacesMessage) noSpacesMessage.style.display = 'none';
    
    container.innerHTML = '';
    
    growthSpaces.forEach(space => {
        const spaceCard = createGrowthSpaceCard(space);
        container.appendChild(spaceCard);
    });
}

// Crear tarjeta de espacio de crecimiento
function createGrowthSpaceCard(space) {
    const card = document.createElement('div');
    card.className = 'growth-space-card';
    card.style.cssText = 'background: linear-gradient(135deg, #ffffff 0%, #f8f9fc 100%); border: 2px solid #CDE7F0; border-radius: 16px; padding: 25px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); transition: all 0.3s ease;';
    
    const students = getStudentsInSpace(space.id);
    const avgScore = calculateSpaceAverageScore(space.id);
    
    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; flex-wrap: wrap; gap: 15px;">
            <div style="flex: 1; min-width: 250px;">
                <h3 style="margin: 0 0 8px 0; color: #1a2332; font-size: 1.3em; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.2em;">🌱</span>
                    <span>${escapeHtmlAttribute(space.name)}</span>
                </h3>
                ${space.description ? `<p style="color: #5a6c7d; margin: 0; font-size: 0.95em; line-height: 1.5;">${sanitizeHTML(space.description)}</p>` : ''}
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="btn-secondary" onclick="openAddStudentsToSpaceModal('${escapeHtmlAttribute(space.id)}')" style="padding: 10px 20px; font-size: 0.9em;">
                    + Añadir Estudiantes
                </button>
                <button class="btn-secondary" onclick="deleteGrowthSpace('${escapeHtmlAttribute(space.id)}')" style="padding: 10px 20px; font-size: 0.9em; background: #fff; border: 2px solid #e74c3c; color: #e74c3c;">
                    Eliminar
                </button>
            </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e8eef5;">
            <div style="text-align: center;">
                <div style="font-size: 2em; font-weight: 700; color: #7BA680; margin-bottom: 5px;">${students.length}</div>
                <div style="color: #5a6c7d; font-size: 0.9em;">Estudiantes</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 2em; font-weight: 700; color: ${avgScore !== null ? (avgScore >= 70 ? '#28a745' : avgScore >= 50 ? '#ffc107' : '#dc3545') : '#999'}; margin-bottom: 5px;">
                    ${avgScore !== null ? `${avgScore}/100` : '-'}
                </div>
                <div style="color: #5a6c7d; font-size: 0.9em;">Score Promedio</div>
            </div>
        </div>
        <div id="studentsInSpace_${escapeHtmlAttribute(space.id)}" style="margin-top: 20px;">
            ${renderStudentsInSpace(space.id)}
        </div>
    `;
    
    card.onmouseenter = function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.12)';
    };
    card.onmouseleave = function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
    };
    
    return card;
}

// Renderizar estudiantes en un espacio
function renderStudentsInSpace(spaceId) {
    const students = getStudentsInSpace(spaceId);
    
    if (students.length === 0) {
        return '<p style="color: #999; text-align: center; padding: 20px; font-style: italic;">Aún no hay estudiantes en este espacio.</p>';
    }
    
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; margin-top: 15px;">';
    
    students.forEach(student => {
        const score = calculateAverageScore(student.id);
        const scoreClass = score !== null ? (score >= 70 ? 'high' : score >= 50 ? 'medium' : 'low') : '';
        const scoreText = score !== null ? `${score}/100` : 'Sin datos';
        
        html += `
            <div style="background: #ffffff; border: 1px solid #e8eef5; border-radius: 12px; padding: 15px; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s ease; position: relative;">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; color: #1a2332; margin-bottom: 5px; word-wrap: break-word;">${escapeHtmlAttribute(student.name)}</div>
                    <div style="font-size: 0.85em; color: #5a6c7d; word-wrap: break-word;">${escapeHtmlAttribute(student.email)}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
                    <div style="text-align: right;">
                        <div style="font-weight: 600; font-size: 1.1em; color: ${score !== null ? (score >= 70 ? '#28a745' : score >= 50 ? '#ffc107' : '#dc3545') : '#999'};">
                            ${scoreText}
                        </div>
                    </div>
                    <button onclick="removeStudentFromSpace('${escapeHtmlAttribute(spaceId)}', '${escapeHtmlAttribute(student.id)}')" 
                            style="background: #fff; border: 1px solid #e74c3c; color: #e74c3c; border-radius: 8px; padding: 6px 12px; font-size: 0.85em; cursor: pointer; transition: all 0.2s ease; white-space: nowrap;"
                            onmouseover="this.style.background='#e74c3c'; this.style.color='#fff';"
                            onmouseout="this.style.background='#fff'; this.style.color='#e74c3c';"
                            title="Excluir estudiante del espacio">
                        ✕
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

// Obtener espacios de crecimiento del docente
function getGrowthSpaces() {
    if (!currentUser || currentUser.role !== 'teacher') return [];
    const allSpaces = JSON.parse(localStorage.getItem('growthSpaces') || '[]');
    return allSpaces.filter(space => space.teacherId === currentUser.id);
}

// Guardar espacios de crecimiento
function saveGrowthSpaces(spaces) {
    localStorage.setItem('growthSpaces', JSON.stringify(spaces));
}

// Obtener estudiantes en un espacio
function getStudentsInSpace(spaceId) {
    // Usar estudiantes del cliente del docente
    const clientStudents = getClientStudents();
    const growthSpaces = getGrowthSpaces();
    const space = growthSpaces.find(s => s.id === spaceId);
    
    if (!space || !space.studentIds || space.studentIds.length === 0) return [];
    
    return clientStudents.filter(s => space.studentIds.includes(s.id));
}

// Calcular score promedio de un espacio
function calculateSpaceAverageScore(spaceId) {
    const students = getStudentsInSpace(spaceId);
    if (students.length === 0) return null;
    
    const scores = students.map(s => calculateAverageScore(s.id)).filter(s => s !== null);
    if (scores.length === 0) return null;
    
    const total = scores.reduce((sum, score) => sum + score, 0);
    return Math.round(total / scores.length);
}

// Abrir modal para crear espacio
function openCreateGrowthSpaceModal() {
    const modal = document.getElementById('createGrowthSpaceModal');
    if (modal) {
        modal.style.display = 'block';
        document.getElementById('growthSpaceName').value = '';
        document.getElementById('growthSpaceDescription').value = '';
    }
}

// Cerrar modal de crear espacio
function closeCreateGrowthSpaceModal() {
    const modal = document.getElementById('createGrowthSpaceModal');
    if (modal) {
        modal.style.display = 'none';
        const form = document.getElementById('createGrowthSpaceForm');
        if (form) form.reset();
    }
}

// Manejar creación de espacio
function handleCreateGrowthSpace(e) {
    e.preventDefault();
    
    const name = document.getElementById('growthSpaceName').value.trim();
    const description = document.getElementById('growthSpaceDescription').value.trim();
    
    if (!name) {
        showMessage('Por favor, ingresa un nombre para el espacio.', 'error');
        return;
    }
    
    const growthSpaces = getGrowthSpaces();
    const newSpace = {
        id: `growth_space_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        teacherId: currentUser.id,
        name: sanitizeInput(name),
        description: sanitizeInput(description),
        studentIds: [],
        createdAt: new Date().toISOString()
    };
    
    growthSpaces.push(newSpace);
    saveGrowthSpaces(growthSpaces);
    
    showMessage('✅ Espacio de crecimiento creado exitosamente.', 'success');
    closeCreateGrowthSpaceModal();
    loadGrowthSpaces();
}

// Abrir modal para añadir estudiantes
function openAddStudentsToSpaceModal(spaceId) {
    currentGrowthSpaceId = spaceId;
    selectedStudentsForSpace = new Set();
    
    const modal = document.getElementById('addStudentsToSpaceModal');
    const title = document.getElementById('addStudentsModalTitle');
    const space = getGrowthSpaces().find(s => s.id === spaceId);
    
    if (modal && title && space) {
        title.textContent = `Añadir Estudiantes a: ${space.name}`;
        modal.style.display = 'block';
        loadStudentsForSpace();
    }
}

// Cerrar modal de añadir estudiantes
function closeAddStudentsToSpaceModal() {
    const modal = document.getElementById('addStudentsToSpaceModal');
    if (modal) {
        modal.style.display = 'none';
        currentGrowthSpaceId = null;
        selectedStudentsForSpace = new Set();
        const searchInput = document.getElementById('searchStudentsForSpace');
        if (searchInput) searchInput.value = '';
    }
}

// Cargar estudiantes para añadir al espacio
function loadStudentsForSpace() {
    if (!currentGrowthSpaceId) return;
    
    const space = getGrowthSpaces().find(s => s.id === currentGrowthSpaceId);
    if (!space) return;
    
    const allStudents = JSON.parse(localStorage.getItem('users') || '[]').filter(u => u.role === 'student');
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    
    // Si el usuario es admin@munay.com, mostrar TODOS los estudiantes demo
    const isAdmin = currentUser && currentUser.email === 'admin@munay.com';
    
    let availableStudents;
    if (isAdmin) {
        // El admin puede ver todos los estudiantes demo
        availableStudents = allStudents.filter(s => s.classCode === 'CLSDEMO');
    } else {
        const teacherClasses = classes.filter(c => c.teacherId === currentUser.id);
        const teacherClassCodes = teacherClasses.map(c => c.code);
        
        // Filtrar estudiantes que pertenecen a las clases del docente
        availableStudents = allStudents.filter(s => {
            if (!s.classCode) return false;
            return teacherClassCodes.includes(s.classCode);
        });
    }
    
    // Excluir estudiantes que ya están en el espacio
    const studentsToShow = availableStudents.filter(s => !space.studentIds.includes(s.id));
    
    renderStudentsForSpace(studentsToShow);
}

// Renderizar estudiantes para añadir
function renderStudentsForSpace(students) {
    const container = document.getElementById('studentsForSpaceList');
    const noStudentsMsg = document.getElementById('noStudentsForSpaceMessage');
    
    if (!container) return;
    
    if (students.length === 0) {
        container.innerHTML = '';
        if (noStudentsMsg) noStudentsMsg.style.display = 'block';
        return;
    }
    
    if (noStudentsMsg) noStudentsMsg.style.display = 'none';
    
    container.innerHTML = '';
    
    students.forEach(student => {
        const score = calculateAverageScore(student.id);
        const scoreClass = score !== null ? (score >= 70 ? 'high' : score >= 50 ? 'medium' : 'low') : '';
        const scoreText = score !== null ? `${score}/100` : 'Sin datos';
        const isSelected = selectedStudentsForSpace.has(student.id);
        
        const studentCard = document.createElement('div');
        studentCard.style.cssText = `background: ${isSelected ? '#E8F5E9' : '#ffffff'}; border: 2px solid ${isSelected ? '#7BA680' : '#e8eef5'}; border-radius: 12px; padding: 15px; cursor: pointer; transition: all 0.2s ease; display: flex; justify-content: space-between; align-items: center;`;
        
        studentCard.innerHTML = `
            <div style="flex: 1; display: flex; align-items: center; gap: 15px;">
                <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleStudentForSpace('${escapeHtmlAttribute(student.id)}')" style="width: 20px; height: 20px; cursor: pointer;">
                <div>
                    <div style="font-weight: 600; color: #1a2332; margin-bottom: 3px;">${escapeHtmlAttribute(student.name)}</div>
                    <div style="font-size: 0.85em; color: #5a6c7d;">${escapeHtmlAttribute(student.email)}</div>
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 600; font-size: 1.1em; color: ${score !== null ? (score >= 70 ? '#28a745' : score >= 50 ? '#ffc107' : '#dc3545') : '#999'};">
                    ${scoreText}
                </div>
                <div style="font-size: 0.75em; color: #999; margin-top: 3px;">Score</div>
            </div>
        `;
        
        studentCard.onclick = function(e) {
            if (e.target.type !== 'checkbox') {
                toggleStudentForSpace(student.id);
            }
        };
        
        container.appendChild(studentCard);
    });
}

// Toggle selección de estudiante
function toggleStudentForSpace(studentId) {
    if (selectedStudentsForSpace.has(studentId)) {
        selectedStudentsForSpace.delete(studentId);
    } else {
        selectedStudentsForSpace.add(studentId);
    }
    loadStudentsForSpace();
}

// Filtrar estudiantes en el modal
function filterStudentsForSpace() {
    const searchTerm = document.getElementById('searchStudentsForSpace').value.toLowerCase().trim();
    
    if (!currentGrowthSpaceId) return;
    
    const space = getGrowthSpaces().find(s => s.id === currentGrowthSpaceId);
    if (!space) return;
    
    const allStudents = JSON.parse(localStorage.getItem('users') || '[]').filter(u => u.role === 'student');
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const teacherClasses = classes.filter(c => c.teacherId === currentUser.id);
    const teacherClassCodes = teacherClasses.map(c => c.code);
    
    let availableStudents = allStudents.filter(s => {
        if (!s.classCode) return false;
        return teacherClassCodes.includes(s.classCode);
    });
    
    availableStudents = availableStudents.filter(s => !space.studentIds.includes(s.id));
    
    if (searchTerm) {
        availableStudents = availableStudents.filter(s => 
            s.name.toLowerCase().includes(searchTerm) || 
            s.email.toLowerCase().includes(searchTerm)
        );
    }
    
    renderStudentsForSpace(availableStudents);
}

// Confirmar añadir estudiantes
function confirmAddStudentsToSpace() {
    if (!currentGrowthSpaceId || selectedStudentsForSpace.size === 0) {
        showMessage('Por favor, selecciona al menos un estudiante.', 'error');
        return;
    }
    
    const growthSpaces = getGrowthSpaces();
    const space = growthSpaces.find(s => s.id === currentGrowthSpaceId);
    
    if (!space) {
        showMessage('Error: No se encontró el espacio.', 'error');
        return;
    }
    
    // Añadir estudiantes al espacio (evitar duplicados)
    selectedStudentsForSpace.forEach(studentId => {
        if (!space.studentIds.includes(studentId)) {
            space.studentIds.push(studentId);
        }
    });
    
    saveGrowthSpaces(growthSpaces);
    showMessage(`✅ ${selectedStudentsForSpace.size} estudiante(s) añadido(s) exitosamente.`, 'success');
    closeAddStudentsToSpaceModal();
    loadGrowthSpaces();
}

// Eliminar espacio de crecimiento
async function deleteGrowthSpace(spaceId) {
    // Obtener información del espacio para el mensaje
    const growthSpaces = getGrowthSpaces();
    const space = growthSpaces.find(s => s.id === spaceId);
    const spaceName = space ? space.name : 'este espacio';
    
    const confirmed = await showConfirmation(
        `¿Estás seguro de que deseas eliminar el espacio de crecimiento <strong>"${escapeHtmlAttribute(spaceName)}"</strong>?<br><br>` +
        `<span style="color: #666; font-size: 0.9em;">Esta acción no se puede deshacer. Los estudiantes seguirán siendo parte de tu clase, solo se eliminará este espacio específico.</span>`
    );
    
    if (!confirmed) {
        return;
    }
    
    const filtered = growthSpaces.filter(s => s.id !== spaceId);
    saveGrowthSpaces(filtered);
    
    showSuccessMessage('✅ Espacio de crecimiento eliminado exitosamente.');
    loadGrowthSpaces();
}

// Remover estudiante de un espacio de crecimiento
async function removeStudentFromSpace(spaceId, studentId) {
    // Obtener el nombre del estudiante para el mensaje
    const allStudents = JSON.parse(localStorage.getItem('users') || '[]');
    const student = allStudents.find(s => s.id === studentId);
    const studentName = student ? student.name : 'este estudiante';
    
    const confirmed = await showConfirmation(
        `¿Deseas retirar a <strong>${escapeHtmlAttribute(studentName)}</strong> de este espacio de crecimiento?<br><br>` +
        `<span style="color: #666; font-size: 0.9em;">El estudiante seguirá siendo parte de tu clase, solo se retirará de este espacio específico.</span>`
    );
    
    if (!confirmed) {
        return;
    }
    
    const growthSpaces = getGrowthSpaces();
    const space = growthSpaces.find(s => s.id === spaceId);
    
    if (!space) {
        showMessage('Error: No se encontró el espacio.', 'error');
        return;
    }
    
    // Remover el estudiante del array
    if (space.studentIds && Array.isArray(space.studentIds)) {
        space.studentIds = space.studentIds.filter(id => id !== studentId);
        saveGrowthSpaces(growthSpaces);
        
        // Mostrar mensaje de éxito atractivo
        showSuccessMessage(
            `<div style="text-align: center; padding: 20px;">
                <div style="font-size: 4em; margin-bottom: 15px;">✨</div>
                <h3 style="color: #1a2332; margin-bottom: 15px; font-size: 1.5em;">¡Cambio Realizado!</h3>
                <p style="color: #5a6c7d; font-size: 1.1em; line-height: 1.6; margin-bottom: 10px;">
                    <strong>${escapeHtmlAttribute(studentName)}</strong> ha sido retirado del espacio de crecimiento.
                </p>
                <p style="color: #7BA680; font-size: 0.95em; font-weight: 600; margin-top: 15px;">
                    El estudiante sigue siendo parte de tu clase y podrás añadirlo nuevamente cuando lo consideres necesario.
                </p>
            </div>`
        );
        
        // Actualizar la visualización del espacio
        const studentsContainer = document.getElementById(`studentsInSpace_${escapeHtmlAttribute(spaceId)}`);
        if (studentsContainer) {
            studentsContainer.innerHTML = renderStudentsInSpace(spaceId);
        }
        
        // Recargar todos los espacios para actualizar estadísticas
        loadGrowthSpaces();
    } else {
        showMessage('Error: El espacio no tiene estudiantes asignados.', 'error');
    }
}

// Inicializar formulario de crear espacio
function initGrowthSpaceForms() {
    const createForm = document.getElementById('createGrowthSpaceForm');
    if (createForm) {
        createForm.addEventListener('submit', handleCreateGrowthSpace);
    }
}

let resizeTimeout;
let currentChartStudents = null;

function loadStudentData() {
    showLoading('Cargando datos de estudiantes...');
    
    // Obtener filtro de código de clase si está disponible
    const analysisClassCodeFilter = document.getElementById('analysisClassCodeFilter');
    const classCodeFilter = analysisClassCodeFilter?.value || '';
    
    // Use cache if available (pero invalidar si cambió el filtro)
    const cacheKey = `students_${currentUser?.id}_${classCodeFilter}`;
    let students = dataCache.get(cacheKey);
    
    if (!students) {
        students = getClassStudents(classCodeFilter || null);
        dataCache.set(cacheKey, students, 2 * 60 * 1000); // Cache for 2 minutes
    }
    
    currentChartStudents = students;
    updateStats(students);
    updateActionResources(students);
    displayStudentsTable(students);
    
    // Renderizar gráficos después de un pequeño delay para asegurar que el DOM está listo
    // Solo renderizar si la pestaña correspondiente está activa
    setTimeout(() => {
        // Verificar qué pestaña está activa
        const activeTab = document.querySelector('.dashboard-tab.active');
        if (activeTab) {
            const activeTabName = activeTab.getAttribute('data-tab');
            
            // Solo renderizar gráficos de análisis si la pestaña de análisis está activa
            if (activeTabName === 'analysis') {
                renderCharts(students);
                // También cargar el gráfico de keywords en esta pestaña
                loadKeywordsTrends();
            }
        } else {
            // Si no hay pestaña activa (primera carga), verificar pestañas directamente
            const analysisTab = document.getElementById('tab-analysis');
            
            if (analysisTab && analysisTab.classList.contains('active')) {
                renderCharts(students);
                // También cargar el gráfico de keywords en esta pestaña
                loadKeywordsTrends();
            }
        }
        hideLoading();
    }, 100);
}

// Redibujar gráficos cuando cambia el tamaño de la ventana (solo una vez)
if (!window.chartResizeHandlerAdded) {
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (currentChartStudents && currentView === 'teacher') {
                renderCharts(currentChartStudents);
            }
        }, 200);
    });
    window.chartResizeHandlerAdded = true;
}

function getClassStudents(filterClassCode = null) {
    if (!currentUser || !currentUser.id) {
        console.error('❌ Error: currentUser no está definido en getClassStudents');
        return [];
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    
    // Caso especial para admin@munay.com: todos los estudiantes demo tienen classCode 'CLSDEMO'
    const isAdmin = currentUser.email === 'admin@munay.com' || currentUser.email === 'munay@munay.com';
    
    if (isAdmin) {
        // Para admin@munay.com, mostrar todos los estudiantes con classCode 'CLSDEMO'
        if (filterClassCode) {
            // Si se especifica un filtro, verificar que sea CLSDEMO o una clase válida del admin
            if (filterClassCode === 'CLSDEMO') {
                return users.filter(u => 
                    u.role === 'student' && 
                    u.classCode === 'CLSDEMO'
                );
            }
            // Si es otra clase, verificar que pertenezca al admin
            const adminClasses = classes.filter(c => {
                const teacher = users.find(u => u.id === c.teacherId);
                return teacher && (teacher.email === 'admin@munay.com' || teacher.email === 'munay@munay.com');
            });
            const adminClassCodes = adminClasses.map(c => c.code);
            if (adminClassCodes.includes(filterClassCode)) {
                return users.filter(u => 
                    u.role === 'student' && 
                    u.classCode === filterClassCode
                );
            }
            return [];
        }
        
        // Sin filtro: mostrar todos los estudiantes con CLSDEMO y cualquier otra clase del admin
        const adminClasses = classes.filter(c => {
            const teacher = users.find(u => u.id === c.teacherId);
            return teacher && teacher.email === 'admin@munay.com';
        });
        const adminClassCodes = adminClasses.map(c => c.code);
        adminClassCodes.push('CLSDEMO'); // Asegurar que CLSDEMO esté incluido
        
        return users.filter(u => 
            u.role === 'student' && 
            u.classCode &&
            adminClassCodes.includes(u.classCode)
        );
    }
    
    // Para otros docentes: usar getClientStudents() que ya maneja la lógica de clientes
    const clientStudents = getClientStudents();
    
    // Si hay un filtro de código de clase, aplicarlo
    if (filterClassCode) {
        // Obtener las clases del cliente para validar el filtro
        const clientClasses = getClientClasses();
        const validClassCodes = clientClasses.map(c => c.code);
        
        // Si el filtro no es válido, retornar vacío
        if (!validClassCodes.includes(filterClassCode)) {
            return [];
        }
        
        // Filtrar estudiantes por código de clase
        return clientStudents.filter(s => s.classCode === filterClassCode);
    }
    
    // Sin filtro: retornar todos los estudiantes del cliente
    return clientStudents;
}

function updateStats(students) {
    // Obtener todas las encuestas y filtrar por los estudiantes pasados
    const allResponses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
    const studentIds = students.map(s => s.id);
    const studentResponses = allResponses.filter(r => studentIds.includes(r.studentId));
    
    const totalStudents = students.length;
    
    const studentsWithResponses = new Set(
        studentResponses.map(r => r.studentId)
    );
    const completedSurveys = studentsWithResponses.size;
    
    let attentionNeeded = 0;
    let goodWellbeing = 0;
    
    students.forEach(student => {
        const avgScore = calculateAverageScore(student.id);
        if (avgScore !== null) {
            if (avgScore < 50) {
                attentionNeeded++;
            } else if (avgScore >= 70) {
                goodWellbeing++;
            }
        }
    });
    
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('completedSurveys').textContent = completedSurveys;
    document.getElementById('attentionNeeded').textContent = attentionNeeded;
    document.getElementById('goodWellbeing').textContent = goodWellbeing;
}

// Actualizar recursos de acción según los scores de los estudiantes
function updateActionResources(students) {
    const resourcesGrid = document.getElementById('actionResourcesGrid');
    if (!resourcesGrid) return;

    // Categorizar estudiantes por nivel de score
    let criticalCount = 0;
    let moderateCount = 0;
    let optimalCount = 0;
    let noDataCount = 0;

    students.forEach(student => {
        const avgScore = calculateAverageScore(student.id);
        if (avgScore === null) {
            noDataCount++;
        } else if (avgScore < 50) {
            criticalCount++;
        } else if (avgScore < 70) {
            moderateCount++;
        } else {
            optimalCount++;
        }
    });

    // Definir recursos para cada categoría
    const resources = [];

    // Función helper para obtener traducciones
    const getActionResource = (type) => {
        if (typeof i18n !== 'undefined') {
            return i18n.t(`actionResources.${type}`);
        }
        // Fallback en español
        const fallbacks = {
            critical: {
            title: 'Requieren Atención Inmediata',
            items: [
                'Contactar a orientación escolar o psicólogo',
                'Entrevista individual con el estudiante',
                'Contactar a padres o tutores inmediatamente',
                'Documentar observaciones y comportamientos',
                'Monitoreo diario del bienestar',
                'Evaluar necesidad de intervención externa'
            ]
            },
            moderate: {
            title: 'Monitoreo y Apoyo',
            items: [
                'Conversaciones de seguimiento semanales',
                'Promover actividades de bienestar en clase',
                'Crear grupos de apoyo entre pares',
                'Revisar factores ambientales (clima escolar)',
                'Involucrar a la familia en estrategias de apoyo',
                'Monitoreo mensual del progreso'
            ]
            },
            optimal: {
            title: 'Fortalecimiento Proactivo',
            items: [
                'Reforzar habilidades socioemocionales',
                'Promover liderazgo positivo y mentoría',
                'Mantener actividades de bienestar continuas',
                'Celebrar logros y contribuciones',
                'Fomentar espacios de expresión positiva',
                'Prevención y detección temprana'
            ]
            },
            noData: {
            title: 'Fomentar Participación',
            items: [
                'Motivar a completar encuestas y actividades',
                'Explicar la importancia de la participación',
                'Crear un ambiente seguro y confidencial',
                'Recordatorios amigables sobre encuestas pendientes',
                'Involucrar a estudiantes líderes como ejemplo',
                'Revisar barreras de acceso técnico'
            ]
            }
        };
        return fallbacks[type] || { title: '', items: [] };
    };

    // Recursos para estudiantes que requieren atención crítica
    if (criticalCount > 0) {
        const resource = getActionResource('critical');
        resources.push({
            type: 'critical',
            title: resource.title,
            icon: '🚨',
            count: criticalCount,
            items: resource.items
        });
    }

    // Recursos para estudiantes con bienestar moderado
    if (moderateCount > 0) {
        const resource = getActionResource('moderate');
        resources.push({
            type: 'moderate',
            title: resource.title,
            icon: '⚠️',
            count: moderateCount,
            items: resource.items
        });
    }

    // Recursos para estudiantes con bienestar óptimo
    if (optimalCount > 0) {
        const resource = getActionResource('optimal');
        resources.push({
            type: 'optimal',
            title: resource.title,
            icon: '✅',
            count: optimalCount,
            items: resource.items
        });
    }

    // Recursos para estudiantes sin datos
    if (noDataCount > 0) {
        const resource = getActionResource('noData');
        resources.push({
            type: 'no-data',
            title: resource.title,
            icon: '📋',
            count: noDataCount,
            items: resource.items
        });
    }

    // Si no hay estudiantes, mostrar mensaje
    if (resources.length === 0) {
        const noStudentsMsg = typeof i18n !== 'undefined' ? i18n.t('stats.noStudentsRegistered') : 'No hay estudiantes registrados aún.';
        resourcesGrid.innerHTML = `
            <div class="action-resource-card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <p style="color: #666666; font-size: 1em;">${noStudentsMsg}</p>
            </div>
        `;
        return;
    }

    // Renderizar tarjetas de recursos
    resourcesGrid.innerHTML = resources.map(resource => `
        <div class="action-resource-card ${resource.type}">
            <div class="action-resource-header">
                <span class="action-resource-icon">${resource.icon}</span>
                <h4 class="action-resource-title">
                    ${resource.title}
                    <span class="action-resource-count">${resource.count}</span>
                </h4>
            </div>
            <ul class="action-resource-list">
                ${resource.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>
    `).join('');
}

// Calcular score promedio de un estudiante (incluye encuestas, reflexiones y actividades)
function calculateAverageScore(studentId) {
    // Obtener todas las encuestas, reflexiones y actividades del estudiante
    // Si el estudiante está en la lista, significa que pertenece al cliente
    const allResponses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
    const allReflections = JSON.parse(localStorage.getItem('reflectionAnalyses') || '[]');
    const allActivities = JSON.parse(localStorage.getItem('studentActivities') || '[]');
    
    const studentResponses = allResponses.filter(r => r.studentId === studentId);
    const studentReflections = allReflections.filter(r => r.studentId === studentId);
    const studentActivities = allActivities.filter(a => a.studentId === studentId);
    
    // Combinar scores de encuestas, reflexiones y actividades
    const allScores = [];
    studentResponses.forEach(r => {
        if (r.score !== undefined && r.score !== null) {
            allScores.push(r.score);
        }
    });
    studentReflections.forEach(r => {
        if (r.score !== undefined && r.score !== null) {
            allScores.push(r.score);
        }
    });
    // Agregar scores de tests y simuladores de actividades
    studentActivities.forEach(a => {
        if (a.testScore !== undefined && a.testScore !== null) {
            allScores.push(a.testScore);
        } else if (a.ethicalScore !== undefined && a.ethicalScore !== null) {
            allScores.push(a.ethicalScore);
        } else if (a.simulatorResults && a.simulatorResults.averageScore !== undefined && a.simulatorResults.averageScore !== null) {
            allScores.push(a.simulatorResults.averageScore);
        }
    });
    
    if (allScores.length === 0) return null;
    
    const totalScore = allScores.reduce((sum, score) => sum + score, 0);
    return Math.round(totalScore / allScores.length);
}

function displayStudentsTable(students) {
    // Buscar la tabla en la vista actual (puede estar en teacherView o teacherStudentsView)
    let tableBody = null;
    let noStudentsMessage = null;
    
    const teacherView = document.getElementById('teacherView');
    const teacherStudentsView = document.getElementById('teacherStudentsView');
    
    if (teacherStudentsView && !teacherStudentsView.classList.contains('hidden')) {
        tableBody = teacherStudentsView.querySelector('#studentsTableBody');
        noStudentsMessage = teacherStudentsView.querySelector('#noStudentsMessage');
    } else if (teacherView && !teacherView.classList.contains('hidden')) {
        tableBody = teacherView.querySelector('#studentsTableBody');
        noStudentsMessage = teacherView.querySelector('#noStudentsMessage');
    }
    
    // Fallback al método anterior si no se encuentra
    if (!tableBody) {
        tableBody = document.getElementById('studentsTableBody');
        noStudentsMessage = document.getElementById('noStudentsMessage');
    }
    
    if (!tableBody) return;
    
    if (students.length === 0) {
        tableBody.innerHTML = '';
        noStudentsMessage.style.display = 'block';
        return;
    }
    
    noStudentsMessage.style.display = 'none';
    const allResponses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
    tableBody.innerHTML = '';
    
    students.forEach(student => {
        const studentResponses = allResponses.filter(r => r.studentId === student.id);
        const avgScore = calculateAverageScore(student.id);
        const latestResponse = studentResponses.length > 0
            ? studentResponses.sort((a, b) => 
                new Date(b.completedAt) - new Date(a.completedAt)
            )[0]
            : null;
        
        const row = document.createElement('tr');
        
        let wellbeingStatus = 'optimal';
        let statusText = 'Óptimo';
        let scoreClass = 'high';
        
        if (avgScore === null) {
            wellbeingStatus = '';
            statusText = 'Sin datos';
            scoreClass = '';
        } else if (avgScore < 50) {
            wellbeingStatus = 'attention';
            statusText = 'Requiere atención';
            scoreClass = 'low';
        } else if (avgScore < 70) {
            wellbeingStatus = 'moderate';
            statusText = 'Moderado';
            scoreClass = 'medium';
        }
        
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>
                ${avgScore !== null 
                    ? `<span class="wellbeing-score ${scoreClass}">${avgScore}/100</span>`
                    : '<span style="color: #999;">-</span>'
                }
            </td>
            <td>
                ${avgScore !== null
                    ? `<span class="wellbeing-status ${wellbeingStatus}">${statusText}</span>`
                    : '<span style="color: #999;">-</span>'
                }
            </td>
            <td>
                ${latestResponse 
                    ? new Date(latestResponse.completedAt).toLocaleDateString('es-ES')
                    : '<span style="color: #999;">N/A</span>'
                }
            </td>
            <td>
                <button class="btn-secondary btn-small" onclick="viewStudentDetail('${escapeHtmlAttribute(student.id)}')">
                    ${typeof i18n !== 'undefined' ? i18n.t('students.viewDetails') : 'Ver Detalles'}
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function viewStudentDetail(studentId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const student = users.find(u => u.id === studentId);
    
    if (!student) return;
    
    const allResponses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
    const allActivities = JSON.parse(localStorage.getItem('studentActivities') || '[]');
    
    const studentResponses = allResponses.filter(r => r.studentId === studentId);
    const studentActivities = allActivities.filter(a => a.studentId === studentId);
    const avgScore = calculateAverageScore(studentId);
    
    const modal = document.getElementById('studentDetailModal');
    const nameEl = document.getElementById('detailStudentName');
    const emailEl = document.getElementById('detailStudentEmail');
    const initialEl = document.getElementById('detailStudentInitial');
    const contentEl = document.getElementById('studentDetailContent');
    
    // Configurar header
    nameEl.textContent = student.name;
    const ageText = student.age ? ` • ${typeof i18n !== 'undefined' ? i18n.t('students.age') : 'Edad:'} ${student.age} ${typeof i18n !== 'undefined' ? i18n.t('students.years') : 'años'}` : '';
    emailEl.textContent = student.email + ageText;
    initialEl.textContent = student.name.charAt(0).toUpperCase();
    
    // Construir contenido del dashboard
    let contentHTML = `
        <div class="dashboard-stats-grid">
            <div class="dashboard-stat-card">
                <div class="dashboard-stat-value" style="color: ${avgScore !== null ? (avgScore < 50 ? '#dc3545' : avgScore < 70 ? '#ffc107' : '#28a745') : '#A3C9A8'};">
                    ${avgScore !== null ? avgScore : '—'}
                </div>
                <div class="dashboard-stat-label">${typeof i18n !== 'undefined' ? i18n.t('students.wellbeingScore') : 'Score de Bienestar'}</div>
            </div>
            <button class="dashboard-stat-card clickable-stat-card" onclick="toggleHistory('unified-history-${escapeHtmlAttribute(studentId)}')" style="cursor: pointer; border: 2px solid #E5E5E5; transition: all 0.2s ease;">
                <div class="dashboard-stat-value">${studentResponses.length + studentActivities.length}</div>
                <div class="dashboard-stat-label">${typeof i18n !== 'undefined' ? i18n.t('students.totalActivities') : 'Total de Actividades'}</div>
                <div style="margin-top: 8px; font-size: 0.75em; color: #666666;">
                    ${studentResponses.length + studentActivities.length > 0 ? (typeof i18n !== 'undefined' ? i18n.t('students.clickForHistory') : '👆 Clic para ver historial completo') : (typeof i18n !== 'undefined' ? i18n.t('students.noActivity') : 'Sin actividad')}
                </div>
                <div style="margin-top: 4px; font-size: 0.7em; color: #999;">
                    ${studentResponses.length} ${typeof i18n !== 'undefined' ? i18n.t('students.surveys') : 'encuestas'} • ${studentActivities.length} ${typeof i18n !== 'undefined' ? i18n.t('students.activities') : 'actividades'}
                </div>
            </button>
        </div>
    `;
    
    // Mostrar gráfico de progreso mensual si hay datos
    if (studentResponses.length > 0 || studentActivities.length > 0) {
        const monthlyProgress = getMonthlyProgress(studentId);
        if (monthlyProgress.length > 0) {
            contentHTML += `
                <div class="dashboard-card" style="margin-top: 24px;">
                    <div class="dashboard-card-title">
                        <span>📈</span>
                        <span>${typeof i18n !== 'undefined' ? i18n.t('students.monthlyProgress') : 'Progreso Mensual'}</span>
                    </div>
                    <canvas id="studentProgressChart_${studentId}" style="width: 100%; height: 300px;"></canvas>
                </div>
            `;
        }
    }
    
    // Historial unificado de encuestas y actividades
    if (studentResponses.length > 0 || studentActivities.length > 0) {
        // Combinar encuestas y actividades en un solo array
        const allItems = [];
        const seenIds = new Set(); // Para evitar duplicados
        
        // Agregar encuestas con tipo identificado (sin duplicados)
        // EXCLUIR respuestas que son actividades (isActivityTest o isSimulator)
        // porque ya están en studentActivities
        studentResponses.forEach(response => {
            // Saltar respuestas que son actividades guardadas como encuestas
            if (response.isActivityTest || response.isSimulator) {
                return; // Ya están en studentActivities, no duplicar
            }
            
            const uniqueId = `survey_${response.id}_${response.completedAt}`;
            if (!seenIds.has(uniqueId)) {
                seenIds.add(uniqueId);
                allItems.push({
                    type: 'survey',
                    id: response.id,
                    title: response.surveyTitle,
                    completedAt: response.completedAt,
                    score: response.score,
                    data: response
                });
            }
        });
        
        // Agregar actividades con tipo identificado (sin duplicados)
        studentActivities.forEach(activity => {
            const uniqueId = `activity_${activity.id}_${activity.completedAt}`;
            if (!seenIds.has(uniqueId)) {
                seenIds.add(uniqueId);
                const isSimulator = activity.activityId === 'ethical_decision_simulator' || activity.simulatorResults;
                const isTest = activity.testScore !== undefined && activity.testScore !== null;
                const score = isTest ? activity.testScore : (isSimulator && activity.ethicalScore !== undefined ? activity.ethicalScore : null);
                
                allItems.push({
                    type: 'activity',
                    id: activity.id,
                    title: activity.activityTitle,
                    completedAt: activity.completedAt,
                    score: score,
                    data: activity
                });
            }
        });
        
        // Ordenar por fecha (más reciente primero)
        allItems.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
        
        // Agrupar por mes/año
        const groupedItems = {};
        allItems.forEach(item => {
            const date = new Date(item.completedAt);
            const monthKey = date.toLocaleString(typeof i18n !== 'undefined' && i18n.currentLanguage === 'en' ? 'en-US' : 'es-ES', { month: 'long', year: 'numeric' });
            const monthKeyForSort = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!groupedItems[monthKeyForSort]) {
                groupedItems[monthKeyForSort] = {
                    label: monthKey.charAt(0).toUpperCase() + monthKey.slice(1),
                    items: []
                };
            }
            groupedItems[monthKeyForSort].items.push(item);
        });
        
        // Ordenar meses de más reciente a más antiguo
        const sortedMonths = Object.keys(groupedItems).sort((a, b) => b.localeCompare(a));
        
        contentHTML += `
            <div class="dashboard-card" id="unified-history-${studentId}" style="display: none; margin-top: 24px;">
                <div class="dashboard-card-title" style="margin-bottom: 20px;">
                    <span>📚</span>
                    <span>${typeof i18n !== 'undefined' ? i18n.t('students.completeHistory') : 'Historial Completo'}</span>
                    <span style="margin-left: auto; font-size: 0.85em; color: #666; font-weight: normal;">Total: ${allItems.length} (${studentResponses.length} ${typeof i18n !== 'undefined' ? i18n.t('students.surveys') : 'encuestas'} • ${studentActivities.length} ${typeof i18n !== 'undefined' ? i18n.t('students.activities') : 'actividades'})</span>
                </div>
        `;
        
        sortedMonths.forEach((monthKey, monthIndex) => {
            const monthData = groupedItems[monthKey];
            const surveysInMonth = monthData.items.filter(i => i.type === 'survey');
            const activitiesInMonth = monthData.items.filter(i => i.type === 'activity');
            
            // Calcular promedios
            const scoresInMonth = monthData.items.filter(i => i.score !== null && i.score !== undefined);
            const avgScore = scoresInMonth.length > 0
                ? Math.round(scoresInMonth.reduce((sum, i) => sum + i.score, 0) / scoresInMonth.length)
                : null;
            
            contentHTML += `
                <div style="margin-bottom: ${monthIndex < sortedMonths.length - 1 ? '30px' : '0'};">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #E5E5E5;">
                        <h4 style="margin: 0; font-size: 1.05em; color: #1A1A1A; font-weight: 600;">
                            ${monthData.label}
                        </h4>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <span style="font-size: 0.85em; color: #666;">
                                ${monthData.items.length} ${monthData.items.length === 1 ? (typeof i18n !== 'undefined' ? i18n.t('students.item') : 'item') : (typeof i18n !== 'undefined' ? i18n.t('students.items') : 'items')} (${surveysInMonth.length} ${typeof i18n !== 'undefined' ? i18n.t('students.surveys') : 'encuestas'} • ${activitiesInMonth.length} ${typeof i18n !== 'undefined' ? i18n.t('students.activities') : 'actividades'})
                            </span>
                            ${avgScore !== null ? `
                                <span style="font-size: 0.9em; color: #666; font-weight: 500;">
                                    ${typeof i18n !== 'undefined' ? i18n.t('students.average') : 'Promedio'}: <span style="color: ${avgScore < 50 ? '#dc3545' : avgScore < 70 ? '#ffc107' : '#28a745'}; font-weight: 600;">${avgScore}/100</span>
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px;">
            `;
            
            monthData.items.forEach(item => {
                const itemDate = new Date(item.completedAt);
                const scoreColor = item.score !== null && item.score !== undefined ? (item.score < 50 ? '#dc3545' : item.score < 70 ? '#ffc107' : '#28a745') : '#A3C9A8';
                const scoreBgColor = item.score !== null && item.score !== undefined ? (item.score < 50 ? '#ffebee' : item.score < 70 ? '#fff8e1' : '#e8f5e9') : '#f5f5f5';
                
                let contextInfo;
                let typeBadge;
                
                if (item.type === 'survey') {
                    contextInfo = getSurveyContextInfo(item.data);
                    typeBadge = '<span style="background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 10px; font-size: 0.7em; font-weight: 600; margin-right: 6px;">📋 ENCUESTA</span>';
                } else {
                    contextInfo = getActivityContextInfo(item.data);
                    const activity = item.data;
                    const isSimulator = activity.activityId === 'ethical_decision_simulator' || activity.simulatorResults;
                    typeBadge = '<span style="background: #f3e5f5; color: #7b1fa2; padding: 2px 8px; border-radius: 10px; font-size: 0.7em; font-weight: 600; margin-right: 6px;">🎯 ACTIVIDAD</span>';
                    
                    // Agregar información adicional para simuladores
                    if (isSimulator && activity.simulatorResults) {
                        const scenariosText = typeof i18n !== 'undefined' ? i18n.t('forms.scenarios') : 'escenarios';
                        typeBadge += `<span style="background: #e7f3ff; color: #A3C9A8; padding: 2px 8px; border-radius: 10px; font-size: 0.7em; font-weight: 500; margin-right: 6px;">${activity.simulatorResults.completedScenarios || activity.simulatorResults.scenariosCompleted || 0} ${scenariosText}</span>`;
                    }
                }
                
                contentHTML += `
                    <div style="background: #FFFFFF; border: 1px solid #E5E5E5; border-radius: 8px; padding: 14px; transition: all 0.2s ease; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                            <div style="flex: 1;">
                                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 6px; flex-wrap: wrap;">
                                    ${typeBadge}
                                </div>
                                <p style="margin: 0 0 6px 0; font-weight: 600; color: #1A1A1A; font-size: 0.95em; line-height: 1.4;">
                                    ${item.title}
                                </p>
                                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                                    <span style="font-size: 0.85em;">${contextInfo.icon}</span>
                                    <span style="font-size: 0.8em; color: #7BA680; font-weight: 500;">${contextInfo.type}</span>
                                </div>
                                <p style="margin: 0; font-size: 0.75em; color: #666; line-height: 1.3; font-style: italic;">
                                    ${contextInfo.description}
                                </p>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #f0f0f0;">
                            <div style="display: flex; align-items: center; gap: 6px;">
                                ${item.score !== null && item.score !== undefined ? `
                                    <span style="background: ${scoreBgColor}; color: ${scoreColor}; padding: 4px 10px; border-radius: 12px; font-size: 0.85em; font-weight: 600;">
                                        ${Math.round(item.score)}/100
                                    </span>
                                ` : ''}
                            </div>
                            <span style="font-size: 0.8em; color: #999;">
                                ${itemDate.toLocaleDateString(typeof i18n !== 'undefined' && i18n.currentLanguage === 'en' ? 'en-US' : 'es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                `;
            });
            
            contentHTML += `
                    </div>
                </div>
            `;
        });
        
        contentHTML += `</div>`;
    }
    
    if (studentResponses.length === 0 && studentActivities.length === 0) {
        contentHTML += `
            <div class="dashboard-card">
                <div style="text-align: center; padding: 40px 20px; color: #666;">
                    <p style="font-size: 1.1em; margin-bottom: 10px;">📭</p>
                    <p style="font-size: 1.05em; margin-bottom: 5px; color: #333;">${typeof i18n !== 'undefined' ? i18n.t('students.noActivityRegistered') : 'Sin actividad registrada'}</p>
                    <p style="font-size: 0.9em;">${typeof i18n !== 'undefined' ? i18n.t('students.noActivityDesc') : 'Este estudiante aún no ha completado ninguna encuesta o actividad.'}</p>
                </div>
            </div>
        `;
    }
    
    contentEl.innerHTML = contentHTML;
    
    // Renderizar gráfico de progreso si existe
    if (studentResponses.length > 0 || studentActivities.length > 0) {
        const monthlyProgress = getMonthlyProgress(studentId);
        if (monthlyProgress.length > 0) {
            setTimeout(() => {
                const canvas = document.getElementById(`studentProgressChart_${studentId}`);
                if (canvas) {
                    renderStudentProgressChart(canvas, monthlyProgress);
                }
            }, 100);
        }
    }
    
    // Asegurar que el modal se muestre correctamente
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body
}

function closeStudentDetailModal() {
    const modal = document.getElementById('studentDetailModal');
    modal.classList.add('closing');
    document.body.style.overflow = ''; // Restaurar scroll del body
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('closing');
    }, 300);
}

// Función para obtener información contextual de una actividad
function getActivityContextInfo(activity) {
    const activityId = activity.activityId || '';
    const activityTitle = activity.activityTitle || '';
    
    if (activityId.includes('empathy_exercise') || activityTitle.toLowerCase().includes('empatía') || activityTitle.toLowerCase().includes('empatia')) {
        return {
            type: 'Empatía',
            icon: '💚',
            description: 'Evalúa la capacidad del estudiante para entender y compartir los sentimientos de otros',
            aspect: 'Comprensión emocional y conexión con los demás'
        };
    } else if (activityId.includes('self_care') || activityTitle.toLowerCase().includes('autocuidado') || activityTitle.toLowerCase().includes('cuidado')) {
        return {
            type: 'Autocuidado',
            icon: '🧘',
            description: 'Evalúa las prácticas de bienestar personal y cuidado de la salud física y emocional',
            aspect: 'Bienestar personal y hábitos saludables'
        };
    } else if (activityId.includes('conflict_resolution') || activityTitle.toLowerCase().includes('conflicto') || activityTitle.toLowerCase().includes('resolución')) {
        return {
            type: 'Resolución de Conflictos',
            icon: '🤝',
            description: 'Evalúa la capacidad para resolver problemas de manera pacífica y constructiva',
            aspect: 'Habilidades de comunicación y negociación'
        };
    } else if (activityId === 'ethical_decision_simulator' || activityTitle.toLowerCase().includes('ético') || activityTitle.toLowerCase().includes('ética') || activityTitle.toLowerCase().includes('decisión')) {
        return {
            type: 'Toma de Decisiones Éticas',
            icon: '⚖️',
            description: 'Evalúa la capacidad para tomar decisiones basadas en valores éticos y morales',
            aspect: 'Razonamiento ético y valores personales'
        };
    }
    
    return {
        type: 'Actividad',
        icon: '🎯',
        description: 'Actividad lúdica de desarrollo socioemocional',
        aspect: 'Desarrollo personal'
    };
}

// Función para obtener información contextual de una encuesta
function getSurveyContextInfo(response) {
    const surveyId = response.surveyId || '';
    const surveyTitle = response.surveyTitle || '';
    
    if (surveyId === 'wellbeing_survey' || surveyTitle.toLowerCase().includes('bienestar') || surveyTitle.toLowerCase().includes('me siento')) {
        return {
            type: 'Bienestar General',
            icon: '📊',
            description: 'Evalúa el bienestar emocional general del estudiante en el contexto escolar',
            aspect: 'Estado emocional y satisfacción escolar'
        };
    } else if (surveyId === 'bullying_prevention' || surveyTitle.toLowerCase().includes('bullying') || surveyTitle.toLowerCase().includes('seguro') || surveyTitle.toLowerCase().includes('tratamos')) {
        return {
            type: 'Prevención de Bullying',
            icon: '🛡️',
            description: 'Evalúa la percepción del estudiante sobre la seguridad y el trato en el entorno escolar',
            aspect: 'Seguridad y clima escolar'
        };
    }
    
    return {
        type: 'Encuesta de Bienestar',
        icon: '📝',
        description: 'Encuesta de evaluación socioemocional',
        aspect: 'Desarrollo socioemocional'
    };
}

// Calcular progreso mensual de un estudiante
function getMonthlyProgress(studentId) {
    const allResponses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
    const allReflections = JSON.parse(localStorage.getItem('reflectionAnalyses') || '[]');
    const allActivities = JSON.parse(localStorage.getItem('studentActivities') || '[]');
    
    // Combinar todos los scores del estudiante
    const studentScores = [];
    
    // Agregar scores de encuestas
    allResponses
        .filter(r => r.studentId === studentId && r.score !== undefined)
        .forEach(r => {
            studentScores.push({
                date: new Date(r.completedAt),
                score: r.score
            });
        });
    
    // Agregar scores de reflexiones
    allReflections
        .filter(r => r.studentId === studentId && r.score !== undefined)
        .forEach(r => {
            studentScores.push({
                date: new Date(r.timestamp || r.completedAt),
                score: r.score
            });
        });
    
    // Agregar scores de tests y simuladores de actividades
    allActivities
        .filter(a => a.studentId === studentId && (a.testScore !== undefined || a.ethicalScore !== undefined || (a.simulatorResults && a.simulatorResults.averageScore !== undefined)))
        .forEach(a => {
            let score = null;
            if (a.testScore !== undefined) {
                score = a.testScore;
            } else if (a.ethicalScore !== undefined) {
                score = a.ethicalScore;
            } else if (a.simulatorResults && a.simulatorResults.averageScore !== undefined) {
                score = a.simulatorResults.averageScore;
            }
            
            if (score !== null) {
                studentScores.push({
                    date: new Date(a.completedAt),
                    score: score
                });
            }
        });
    
    if (studentScores.length === 0) return [];
    
    // Agrupar por mes
    const monthlyData = {};
    
    studentScores.forEach(item => {
        const date = item.date;
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleString('es-ES', { month: 'short', year: 'numeric' });
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                label: monthLabel,
                scores: []
            };
        }
        monthlyData[monthKey].scores.push(item.score);
    });
    
    // Convertir a array y calcular promedios
    const months = Object.keys(monthlyData).sort();
    return months.map(monthKey => ({
        month: monthKey,
        label: monthlyData[monthKey].label,
        averageScore: Math.round(
            monthlyData[monthKey].scores.reduce((a, b) => a + b, 0) / monthlyData[monthKey].scores.length
        )
    }));
}

// Renderizar gráfico de progreso mensual del estudiante
function renderStudentProgressChart(canvas, monthlyData) {
    if (!canvas || monthlyData.length === 0) return;
    
    const { ctx, width, height } = setupHighQualityCanvas(canvas);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    const padding = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const scores = monthlyData.map(d => d.averageScore);
    const maxScore = 100;
    const minScore = Math.max(0, Math.min(...scores) - 10);
    const scoreRange = maxScore - minScore || 100;
    
    // Gridlines horizontales
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
        const y = padding.top + (chartHeight / gridLines) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
        
        // Etiquetas del eje Y
        const score = Math.round(maxScore - (scoreRange / gridLines) * i);
        ctx.fillStyle = '#666';
        ctx.font = '11px Segoe UI, Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(score, padding.left - 10, y + 4);
    }
    
    // Ejes
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();
    
    // Área bajo la curva con gradiente
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(163, 201, 168, 0.3)');
    gradient.addColorStop(1, 'rgba(163, 201, 168, 0.05)');
    
    ctx.beginPath();
    monthlyData.forEach((data, index) => {
        const x = padding.left + (index / (monthlyData.length - 1 || 1)) * chartWidth;
        const y = padding.top + chartHeight - ((data.averageScore - minScore) / scoreRange) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, height - padding.bottom);
            ctx.lineTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        if (index === monthlyData.length - 1) {
            ctx.lineTo(x, height - padding.bottom);
            ctx.closePath();
        }
    });
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Línea de tendencia
    ctx.strokeStyle = '#A3C9A8';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    
    monthlyData.forEach((data, index) => {
        const x = padding.left + (index / (monthlyData.length - 1 || 1)) * chartWidth;
        const y = padding.top + chartHeight - ((data.averageScore - minScore) / scoreRange) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // Puntos en la línea
    monthlyData.forEach((data, index) => {
        const x = padding.left + (index / (monthlyData.length - 1 || 1)) * chartWidth;
        const y = padding.top + chartHeight - ((data.averageScore - minScore) / scoreRange) * chartHeight;
        
        // Círculo exterior
        ctx.fillStyle = '#A3C9A8';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Círculo interior blanco
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Mostrar valor del score
        ctx.fillStyle = '#1A1A1A';
        ctx.font = 'bold 10px Segoe UI, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(data.averageScore, x, y - 12);
    });
    
    // Etiquetas del eje X
    ctx.fillStyle = '#666';
    ctx.font = '10px Segoe UI, Arial, sans-serif';
    ctx.textAlign = 'center';
    
    monthlyData.forEach((data, index) => {
        const x = padding.left + (index / (monthlyData.length - 1 || 1)) * chartWidth;
        ctx.fillText(data.label, x, height - padding.bottom + 20);
    });
    
    // Título del eje Y
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#666';
    ctx.font = 'bold 11px Segoe UI, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Score de Bienestar', 0, 0);
    ctx.restore();
}

function toggleHistory(historyId) {
    const historyElement = document.getElementById(historyId);
    if (!historyElement) return;

    // Mostrar/ocultar el historial
    const isHidden = historyElement.style.display === 'none' || historyElement.style.display === '';
    if (isHidden) {
        historyElement.style.display = 'block';
        historyElement.style.animation = 'fadeInUp 0.3s ease-out';
    } else {
        historyElement.style.display = 'none';
    }
}

// ========== FUNCIONES DE GRÁFICOS ==========
// Función helper para configurar canvas de alta calidad
function setupHighQualityCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.textBaseline = 'middle';
    
    return { ctx, width: rect.width, height: rect.height, dpr };
}

// Variable global para el filtro de mes del análisis visual
let currentAnalysisMonthFilter = '';

// Función auxiliar para obtener el nombre del mes
function getMonthName(monthKey) {
    let monthNames;
    if (typeof i18n !== 'undefined' && i18n.currentLanguage === 'en') {
        monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
    } else {
        monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    }
    const monthNum = parseInt(monthKey.split('-')[1]);
    return monthNames[monthNum - 1] || monthKey;
}

// Función para actualizar los gráficos de análisis visual cuando cambia el filtro
function updateAnalysisChartsFilter() {
    // NO repoblar los filtros aquí para evitar parpadeo
    // Los filtros solo se poblan cuando se carga la vista inicialmente
    
    const analysisFilter = document.getElementById('analysisMonthFilter');
    if (analysisFilter) {
        currentAnalysisMonthFilter = analysisFilter.value;
    }
    
    // Si cambió el filtro de código de clase, recargar los datos de estudiantes
    const classCodeFilter = document.getElementById('analysisClassCodeFilter')?.value || '';
    
    // Obtener estudiantes filtrados sin mostrar loading (evita parpadeo)
    const students = classCodeFilter ? getClassStudents(classCodeFilter) : getClassStudents();
    currentChartStudents = students;
    
    // Renderizar gráficos sin mostrar loading
    renderCharts(students);
    // También actualizar el gráfico de keywords
    loadKeywordsTrends();
}

// Debounced version of updateAnalysisChartsFilter
const debouncedUpdateAnalysisChartsFilter = debounce(updateAnalysisChartsFilter, 300);

function renderCharts(students) {
    // Aplicar filtros de código de clase, edad y género a los estudiantes antes de renderizar
    let filteredStudents = students;
    
    // Filtro por código de clase
    const classCodeFilter = document.getElementById('analysisClassCodeFilter');
    if (classCodeFilter && classCodeFilter.value) {
        filteredStudents = filteredStudents.filter(student => {
            return student.classCode === classCodeFilter.value;
        });
    }
    
    // Filtro por edad
    const ageFilter = document.getElementById('analysisAgeFilter');
    if (ageFilter && ageFilter.value) {
        const ageRange = ageFilter.value;
        filteredStudents = filteredStudents.filter(student => {
            if (!student.age) return false;
            if (ageRange === '9-11') return student.age >= 9 && student.age <= 11;
            if (ageRange === '12-15') return student.age >= 12 && student.age <= 15;
            if (ageRange === '16-17') return student.age >= 16 && student.age <= 17;
            return true;
        });
    }
    
    // Filtro por género
    const genderFilter = document.getElementById('analysisGenderFilter');
    if (genderFilter && genderFilter.value) {
        filteredStudents = filteredStudents.filter(student => {
            return student.gender === genderFilter.value;
        });
    }
    
    // Renderizar gráficos con estudiantes filtrados
    // Verificar que la pestaña de análisis esté activa antes de renderizar
    const analysisTab = document.getElementById('tab-analysis');
    if (analysisTab && analysisTab.classList.contains('active')) {
        renderWellbeingDistribution(filteredStudents);
        renderWellbeingTrend(filteredStudents);
    }
}

function renderWellbeingDistribution(students) {
    const canvas = document.getElementById('wellbeingDistributionChart');
    if (!canvas) return;
    
    // Verificar que el canvas esté visible (no en una pestaña oculta)
    const tabContent = canvas.closest('.dashboard-tab-content');
    if (tabContent && !tabContent.classList.contains('active')) {
        return; // No renderizar si la pestaña está oculta
    }
    
    const { ctx, width, height } = setupHighQualityCanvas(canvas);
    
    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    let allResponses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
    let allReflections = JSON.parse(localStorage.getItem('reflectionAnalyses') || '[]');
    
    // Primero filtrar por estudiantes (edad y género ya aplicados en renderCharts)
    const studentIds = students.map(s => s.id);
    allResponses = allResponses.filter(r => studentIds.includes(r.studentId));
    allReflections = allReflections.filter(r => studentIds.includes(r.studentId));
    
    // Aplicar filtro de mes si existe (aplica a ambos gráficos)
    if (currentAnalysisMonthFilter) {
        allResponses = allResponses.filter(item => {
            const date = new Date(item.completedAt || item.timestamp);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            return monthKey === currentAnalysisMonthFilter;
        });
        allReflections = allReflections.filter(item => {
            const date = new Date(item.timestamp || item.completedAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            return monthKey === currentAnalysisMonthFilter;
        });
    }
    
    // Categorizar scores usando los datos filtrados (mes + edad + género)
    const excellentLabel = typeof i18n !== 'undefined' ? i18n.t('stats.excellent') : 'Excelente';
    const goodLabel = typeof i18n !== 'undefined' ? i18n.t('stats.good') : 'Bueno';
    const regularLabel = typeof i18n !== 'undefined' ? i18n.t('stats.regular') : 'Regular';
    const lowLabel = typeof i18n !== 'undefined' ? i18n.t('stats.low') : 'Bajo';
    
    const categories = {
        [excellentLabel]: 0,
        [goodLabel]: 0,
        [regularLabel]: 0,
        [lowLabel]: 0
    };
    
    students.forEach(student => {
        // Usar solo los datos filtrados (que ya tienen el filtro de mes aplicado)
        const studentResponses = allResponses.filter(r => r.studentId === student.id);
        const studentReflections = allReflections.filter(r => r.studentId === student.id);
        
        // Combinar todos los scores del estudiante usando datos filtrados
        const allScores = [];
        studentResponses.forEach(r => allScores.push(r.score));
        studentReflections.forEach(r => allScores.push(r.score));
        
        if (allScores.length > 0) {
            const finalScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;
            
            if (finalScore >= 70) categories[excellentLabel]++;
            else if (finalScore >= 50) categories[goodLabel]++;
            else if (finalScore >= 30) categories[regularLabel]++;
            else categories[lowLabel]++;
        }
    });
    
    // Datos para el gráfico
    const categoriesArray = Object.keys(categories);
    const values = Object.values(categories);
    const maxValue = Math.max(...values, 1);
    
    const padding = { top: 60, right: 40, bottom: 80, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const barSpacing = 20;
    const barWidth = (chartWidth - (barSpacing * (categoriesArray.length - 1))) / categoriesArray.length;
    
    // Colores con gradiente
    const colorStops = [
        ['#28a745', '#34ce57'],
        ['#ffc107', '#ffd54f'],
        ['#ff9800', '#ffb74d'],
        ['#dc3545', '#e57373']
    ];
    
    // Gridlines horizontales
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
        const y = padding.top + (chartHeight / gridLines) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
        
        // Etiquetas del eje Y
        ctx.fillStyle = '#666';
        ctx.font = '11px Segoe UI, Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxValue - (maxValue / gridLines) * i), padding.left - 10, y);
    }
    
    // Dibujar barras
    categoriesArray.forEach((cat, index) => {
        const barHeight = (values[index] / maxValue) * chartHeight;
        const x = padding.left + index * (barWidth + barSpacing);
        const y = padding.top + chartHeight - barHeight;
        
        // Gradiente para la barra
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, colorStops[index][0]);
        gradient.addColorStop(1, colorStops[index][1]);
        
        // Sombra
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
        
        // Dibujar barra con esquinas redondeadas
        const radius = 4;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, y + barHeight);
        ctx.lineTo(x, y + barHeight);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
        
        // Valor encima de la barra
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Segoe UI, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'transparent';
        ctx.fillText(values[index], x + barWidth / 2, y - 10);
        
        // Etiqueta categoría
        ctx.fillStyle = '#555';
        ctx.font = '12px Segoe UI, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(cat, x + barWidth / 2, height - padding.bottom + 22);
        
        // Rango de score
        const ranges = ['70-100', '50-69', '30-49', '0-29'];
        ctx.fillStyle = '#888';
        ctx.font = '10px Segoe UI, Arial, sans-serif';
        ctx.fillText(`(${ranges[index]})`, x + barWidth / 2, height - padding.bottom + 36);
    });
    
    // Título del eje Y
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#666';
    ctx.font = 'bold 11px Segoe UI, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(typeof i18n !== 'undefined' ? i18n.t('stats.numberOfStudents') : 'Número de Estudiantes', 0, 0);
    ctx.restore();
}

function renderWellbeingTrend(students) {
    const canvas = document.getElementById('wellbeingTrendChart');
    if (!canvas) return;
    
    // Verificar que el canvas esté visible (no en una pestaña oculta)
    const tabContent = canvas.closest('.dashboard-tab-content');
    if (tabContent && !tabContent.classList.contains('active')) {
        return; // No renderizar si la pestaña está oculta
    }
    
    const { ctx, width, height } = setupHighQualityCanvas(canvas);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    let allResponses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
    let allReflections = JSON.parse(localStorage.getItem('reflectionAnalyses') || '[]');
    
    // Primero filtrar por estudiantes (edad y género ya aplicados en renderCharts)
    const studentIds = students.map(s => s.id);
    allResponses = allResponses.filter(r => studentIds.includes(r.studentId));
    allReflections = allReflections.filter(r => studentIds.includes(r.studentId));
    
    // Aplicar filtro de mes si existe (aplica a ambos gráficos)
    if (currentAnalysisMonthFilter) {
        allResponses = allResponses.filter(item => {
            const date = new Date(item.completedAt || item.timestamp);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            return monthKey === currentAnalysisMonthFilter;
        });
        allReflections = allReflections.filter(item => {
            const date = new Date(item.timestamp || item.completedAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            return monthKey === currentAnalysisMonthFilter;
        });
    }
    
    // Agrupar por mes (solo datos de estudiantes filtrados)
    const monthlyData = {};
    
    [...allResponses, ...allReflections].forEach(item => {
        const date = new Date(item.completedAt || item.timestamp);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { scores: [], count: 0 };
        }
        monthlyData[monthKey].scores.push(item.score);
        monthlyData[monthKey].count++;
    });
    
    let months = Object.keys(monthlyData).sort();
    
    // Si hay filtro, mostrar solo ese mes; si no, últimos 6 meses
    if (currentAnalysisMonthFilter && months.includes(currentAnalysisMonthFilter)) {
        months = [currentAnalysisMonthFilter];
    } else if (currentAnalysisMonthFilter) {
        months = [];
    } else {
        months = months.slice(-6); // Últimos 6 meses si no hay filtro
    }
    
    if (months.length === 0) {
        ctx.fillStyle = '#999';
        ctx.font = '16px Segoe UI, Arial, sans-serif';
        ctx.textAlign = 'center';
        const message = currentAnalysisMonthFilter ? `No hay datos para ${getMonthName(currentAnalysisMonthFilter)}` : 'No hay datos suficientes';
        ctx.fillText(message, width / 2, height / 2);
        return;
    }
    
    const averages = months.map(month => {
        const scores = monthlyData[month].scores;
        return scores.reduce((a, b) => a + b, 0) / scores.length;
    });
    
    const padding = { top: 50, right: 40, bottom: 70, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const maxScore = 100;
    const minScore = Math.max(0, Math.min(...averages) - 10);
    const scoreRange = maxScore - minScore || 100;
    
    // Gridlines horizontales
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
        const y = padding.top + (chartHeight / gridLines) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
        
        // Etiquetas del eje Y
        const score = Math.round(maxScore - (scoreRange / gridLines) * i);
        ctx.fillStyle = '#666';
        ctx.font = '11px Segoe UI, Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(score, padding.left - 10, y);
    }
    
    // Ejes
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();
    
    // Área bajo la curva con gradiente
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(163, 201, 168, 0.3)');
    gradient.addColorStop(1, 'rgba(163, 201, 168, 0.05)');
    
    ctx.beginPath();
    months.forEach((month, index) => {
        const x = padding.left + (index / (months.length - 1 || 1)) * chartWidth;
        const y = padding.top + chartHeight - ((averages[index] - minScore) / scoreRange) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, height - padding.bottom);
            ctx.lineTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        if (index === months.length - 1) {
            ctx.lineTo(x, height - padding.bottom);
            ctx.closePath();
        }
    });
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Línea de tendencia
    ctx.strokeStyle = '#A3C9A8';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    
    months.forEach((month, index) => {
        const x = padding.left + (index / (months.length - 1 || 1)) * chartWidth;
        const y = padding.top + chartHeight - ((averages[index] - minScore) / scoreRange) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // Puntos en la línea
    months.forEach((month, index) => {
        const x = padding.left + (index / (months.length - 1 || 1)) * chartWidth;
        const y = padding.top + chartHeight - ((averages[index] - minScore) / scoreRange) * chartHeight;
        
        // Sombra del punto
        ctx.save();
        ctx.shadowColor = 'rgba(163, 201, 168, 0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Punto exterior
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Punto interior
        ctx.fillStyle = '#A3C9A8';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Valor del punto
        ctx.fillStyle = '#333';
        ctx.font = 'bold 11px Segoe UI, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(averages[index]), x, y - 15);
    });
    
    // Etiquetas de meses
    ctx.fillStyle = '#666';
    ctx.font = '11px Segoe UI, Arial, sans-serif';
    ctx.textAlign = 'center';
    months.forEach((month, index) => {
        const x = padding.left + (index / (months.length - 1 || 1)) * chartWidth;
        const monthNum = parseInt(month.substring(5)) - 1;
        let monthNames;
        if (typeof i18n !== 'undefined' && i18n.currentLanguage === 'en') {
            monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        } else {
            monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        }
        ctx.fillText(monthNames[monthNum] + ' ' + month.substring(0, 4), x, height - padding.bottom + 20);
    });
}

function renderRiskLevelChart(students) {
    const canvas = document.getElementById('riskLevelChart');
    if (!canvas) return;
    
    const { ctx, width, height } = setupHighQualityCanvas(canvas);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    const allResponses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
    const allReflections = JSON.parse(localStorage.getItem('reflectionAnalyses') || '[]');
    
    const riskLevels = { high: 0, medium: 0, low: 0, none: 0 };
    
    students.forEach(student => {
        const avgScore = calculateAverageScore(student.id);
        const reflectionRisks = allReflections
            .filter(r => r.studentId === student.id)
            .map(r => r.riskLevel);
        
        let finalRisk = 'none';
        if (avgScore !== null) {
            if (avgScore < 30) finalRisk = 'high';
            else if (avgScore < 50) finalRisk = 'medium';
            else if (avgScore < 70) finalRisk = 'low';
        }
        
        reflectionRisks.forEach(risk => {
            if (risk === 'high' || (risk === 'medium' && finalRisk !== 'high')) {
                finalRisk = risk;
            }
        });
        
        riskLevels[finalRisk]++;
    });
    
    const total = Object.values(riskLevels).reduce((a, b) => a + b, 0);
    if (total === 0) {
        ctx.fillStyle = '#999';
        ctx.font = '16px Segoe UI, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No hay datos', width / 2, height / 2);
        return;
    }
    
    const centerX = width / 2;
    const centerY = height / 2 - 20;
    const radius = Math.min(width, height) / 2 - 60;
    
    const colors = {
        high: ['#dc3545', '#c82333'],
        medium: ['#ff9800', '#f57c00'],
        low: ['#ffc107', '#ffb300'],
        none: ['#28a745', '#218838']
    };
    const labels = { high: 'Alto Riesgo', medium: 'Riesgo Medio', low: 'Riesgo Bajo', none: 'Sin Riesgo' };
    
    let currentAngle = -Math.PI / 2;
    
    Object.keys(riskLevels).forEach((risk, index) => {
        const value = riskLevels[risk];
        if (value === 0) return;
        
        const sliceAngle = (value / total) * Math.PI * 2;
        const midAngle = currentAngle + sliceAngle / 2;
        
        // Sombra
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Gradiente para el sector
        const gradient = ctx.createLinearGradient(
            centerX + Math.cos(midAngle) * radius,
            centerY + Math.sin(midAngle) * radius,
            centerX,
            centerY
        );
        gradient.addColorStop(0, colors[risk][0]);
        gradient.addColorStop(1, colors[risk][1]);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
        
        // Borde
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(currentAngle) * radius, centerY + Math.sin(currentAngle) * radius);
        ctx.stroke();
        if (index === Object.keys(riskLevels).length - 1 || riskLevels[Object.keys(riskLevels)[index + 1]] === 0) {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + Math.cos(currentAngle + sliceAngle) * radius, centerY + Math.sin(currentAngle + sliceAngle) * radius);
            ctx.stroke();
        }
        
        // Etiqueta con porcentaje
        const labelX = centerX + Math.cos(midAngle) * (radius * 0.65);
        const labelY = centerY + Math.sin(midAngle) * (radius * 0.65);
        const percentage = Math.round((value / total) * 100);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Segoe UI, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.fillText(value, labelX, labelY - 8);
        ctx.font = '12px Segoe UI, Arial, sans-serif';
        ctx.fillText(`${percentage}%`, labelX, labelY + 10);
        ctx.shadowColor = 'transparent';
        
        // Leyenda mejorada
        const legendX = 30;
        const legendY = 50 + index * 35;
        
        // Cuadro de color con gradiente
        const legGradient = ctx.createLinearGradient(legendX, legendY - 12, legendX + 18, legendY + 3);
        legGradient.addColorStop(0, colors[risk][0]);
        legGradient.addColorStop(1, colors[risk][1]);
        ctx.fillStyle = legGradient;
        ctx.fillRect(legendX, legendY - 12, 18, 18);
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.strokeRect(legendX, legendY - 12, 18, 18);
        
        // Texto de leyenda
        ctx.fillStyle = '#333';
        ctx.font = 'bold 13px Segoe UI, Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(labels[risk], legendX + 28, legendY);
        ctx.font = '11px Segoe UI, Arial, sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText(`${value} estudiantes`, legendX + 28, legendY + 16);
        
        currentAngle += sliceAngle;
    });
}

function renderActivitiesChart(students) {
    const canvas = document.getElementById('activitiesChart');
    if (!canvas) return;
    
    const { ctx, width, height } = setupHighQualityCanvas(canvas);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    const allActivities = JSON.parse(localStorage.getItem('studentActivities') || '[]');
    const activityTypes = {};
    
    allActivities.forEach(activity => {
        if (students.some(s => s.id === activity.studentId)) {
            if (!activityTypes[activity.activityTitle]) {
                activityTypes[activity.activityTitle] = 0;
            }
            activityTypes[activity.activityTitle]++;
        }
    });
    
    const activities = Object.keys(activityTypes);
    const values = Object.values(activityTypes);
    
    if (activities.length === 0) {
        ctx.fillStyle = '#999';
        ctx.font = '16px Segoe UI, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No hay actividades completadas', width / 2, height / 2);
        return;
    }
    
    const padding = { top: 30, right: 80, bottom: 30, left: 180 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const maxValue = Math.max(...values, 1);
    const barHeight = (chartHeight - (activities.length - 1) * 12) / activities.length;
    const barSpacing = 12;
    
    const colors = [
        ['#A3C9A8', '#CDE7F0'],
        ['#A3C9A8', '#CDE7F0'],
        ['#f093fb', '#f5576c'],
        ['#4facfe', '#00f2fe']
    ];
    
    // Gridlines verticales
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
        const x = padding.left + (chartWidth / gridLines) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, height - padding.bottom);
        ctx.stroke();
    }
    
    activities.forEach((activity, index) => {
        const barWidth = (values[index] / maxValue) * chartWidth;
        const y = padding.top + index * (barHeight + barSpacing);
        
        // Gradiente para la barra
        const gradient = ctx.createLinearGradient(padding.left, y, padding.left + barWidth, y);
        gradient.addColorStop(0, colors[index % colors.length][0]);
        gradient.addColorStop(1, colors[index % colors.length][1]);
        
        // Sombra
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 0;
        
        // Barra con bordes redondeados (manual)
        ctx.beginPath();
        const radius = 6;
        const bx = padding.left;
        ctx.moveTo(bx + radius, y);
        ctx.lineTo(bx + barWidth - radius, y);
        ctx.quadraticCurveTo(bx + barWidth, y, bx + barWidth, y + radius);
        ctx.lineTo(bx + barWidth, y + barHeight - radius);
        ctx.quadraticCurveTo(bx + barWidth, y + barHeight, bx + barWidth - radius, y + barHeight);
        ctx.lineTo(bx + radius, y + barHeight);
        ctx.quadraticCurveTo(bx, y + barHeight, bx, y + barHeight - radius);
        ctx.lineTo(bx, y + radius);
        ctx.quadraticCurveTo(bx, y, bx + radius, y);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
        
        // Borde
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx + radius, y);
        ctx.lineTo(bx + barWidth - radius, y);
        ctx.quadraticCurveTo(bx + barWidth, y, bx + barWidth, y + radius);
        ctx.lineTo(bx + barWidth, y + barHeight - radius);
        ctx.quadraticCurveTo(bx + barWidth, y + barHeight, bx + barWidth - radius, y + barHeight);
        ctx.lineTo(bx + radius, y + barHeight);
        ctx.quadraticCurveTo(bx, y + barHeight, bx, y + barHeight - radius);
        ctx.lineTo(bx, y + radius);
        ctx.quadraticCurveTo(bx, y, bx + radius, y);
        ctx.closePath();
        ctx.stroke();
        
        // Valor
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Segoe UI, Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.shadowColor = 'transparent';
        ctx.fillText(values[index], padding.left + barWidth + 15, y + barHeight / 2 + 4);
        
        // Etiqueta de actividad
        const label = activity.length > 20 ? activity.substring(0, 17) + '...' : activity;
        ctx.fillStyle = '#333';
        ctx.font = '12px Segoe UI, Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(label, padding.left - 15, y + barHeight / 2 + 4);
    });
    
    // Título del eje X
    ctx.fillStyle = '#666';
    ctx.font = 'bold 11px Segoe UI, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Número de Completaciones', width / 2, height - 10);
}

// ========== ANÁLISIS DE KEYWORDS PARA PREVENCIÓN ==========

// Obtener alertas de riesgo de un estudiante específico
function getStudentRiskAlerts(studentId) {
    const messages = JSON.parse(localStorage.getItem('anonymousMessages') || '[]');
    const activities = JSON.parse(localStorage.getItem('studentActivities') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const student = users.find(u => u.id === studentId);
    
    const criticalAlerts = [];
    const mediumAlerts = [];
    
    // Analizar mensajes del estudiante
    const studentMessages = messages.filter(m => m.studentId === studentId);
    
    studentMessages.forEach(message => {
        // Si el mensaje ya tiene análisis guardado, usarlo
        let analysis = message.keywordAnalysis;
        
        // Si no tiene análisis, analizarlo ahora
        if (!analysis && typeof keywordAnalyzer !== 'undefined' && message.content) {
            analysis = keywordAnalyzer.analyzeMessage(message.content);
            // Guardar el análisis en el mensaje para futuras referencias
            message.keywordAnalysis = analysis;
        }
        
        if (analysis) {
            const alert = {
                id: message.id,
                type: 'message',
                timestamp: message.timestamp,
                content: message.content,
                anonymousId: message.anonymousId,
                nivelRiesgo: analysis.nivelRiesgo,
                categoria: analysis.categoria,
                keywords: analysis.keywordsDetectadas,
                keywordsDetalladas: analysis.keywordsDetalladas || [],
                sentimiento: analysis.sentimiento,
                urgencia: analysis.urgencia,
                razon: analysis.razon,
                sugerencia: analysis.sugerencia,
                score: analysis.score
            };
            
            if (analysis.nivelRiesgo === 'CRITICO' || analysis.urgencia >= 8) {
                criticalAlerts.push(alert);
            } else if (analysis.nivelRiesgo === 'ALTO' || analysis.urgencia >= 5) {
                mediumAlerts.push(alert);
            }
        }
    });
    
    // Guardar mensajes actualizados con análisis
    if (studentMessages.some(m => m.keywordAnalysis && !messages.find(msg => msg.id === m.id && msg.keywordAnalysis))) {
        localStorage.setItem('anonymousMessages', JSON.stringify(messages));
    }
    
    return {
        critical: criticalAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
        medium: mediumAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    };
}

// Analizar mensajes demo existentes que no tengan análisis de keywords
// Re-analiza todos los mensajes para aplicar el nuevo sistema sin detección de duplicados
function analyzeExistingDemoMessages() {
    if (typeof keywordAnalyzer === 'undefined') {
        console.warn('⚠️ keywordAnalyzer no está disponible. El análisis de keywords no se aplicará.');
        return;
    }
    
    const messages = JSON.parse(localStorage.getItem('anonymousMessages') || '[]');
    let updated = false;
    let reanalyzed = 0;
    
    // Usar for loop en lugar de forEach para poder usar break
    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        
        // Re-analizar todos los mensajes con contenido para aplicar el nuevo sistema sin duplicados
        if (message.content) {
            const previousAnalysis = message.keywordAnalysis;
            message.keywordAnalysis = keywordAnalyzer.analyzeMessage(message.content);
            updated = true;
            reanalyzed++;
            
            // Crear notificaciones solo para mensajes CRÍTICOS (no ALTO para evitar llenar localStorage)
            // Limitar a máximo 20 notificaciones para evitar QuotaExceededError
            if (message.keywordAnalysis && 
                message.keywordAnalysis.nivelRiesgo === 'CRITICO' &&
                message.studentId && message.studentClassCode) {
                
                // Verificar si ya existe notificación para este mensaje
                const notifications = JSON.parse(localStorage.getItem('teacherNotifications') || '[]');
                const existingNotif = notifications.find(n => n.messageId === message.id);
                
                // Solo crear notificación si no existe y no hemos excedido el límite
                if (!existingNotif && notifications.length < 20) {
                    try {
                        createUrgentNotificationFromMessage(message.studentId, message, message.keywordAnalysis);
                    } catch (error) {
                        if (error.name === 'QuotaExceededError') {
                            console.warn('⚠️ localStorage lleno. No se pueden crear más notificaciones.');
                            break; // Salir del loop si localStorage está lleno
                        }
                    }
                }
            }
        }
    }
    
    if (updated) {
        localStorage.setItem('anonymousMessages', JSON.stringify(messages));
        console.log(`✅ Re-analizados ${reanalyzed} mensajes con el nuevo sistema (sin detección de duplicados)`);
        
        // Si el docente está viendo el dashboard, actualizar
        if (currentUser && currentUser.role === 'teacher') {
            setTimeout(() => {
                loadKeywordsTrends();
                loadTeacherNotifications();
                updateRiskAlertsBadge();
            }, 500);
        }
    }
}

// Cargar alertas críticas basadas en keywords
function loadCriticalAlerts() {
    const container = document.getElementById('criticalAlertsContainer');
    if (!container) return;
    
    const students = getClassStudents();
    const messages = JSON.parse(localStorage.getItem('anonymousMessages') || '[]');
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    
    // Si el usuario es admin@munay.com, usar la clase demo
    const isAdmin = currentUser && currentUser.email === 'admin@munay.com';
    const teacherClassCodes = isAdmin 
        ? ['CLSDEMO'] 
        : classes.filter(c => c.teacherId === currentUser.id).map(c => c.code);
    
    const criticalAlerts = [];
    const mediumAlerts = [];
    
    // Analizar mensajes de estudiantes de las clases del docente
    const teacherMessages = messages.filter(m => teacherClassCodes.includes(m.studentClassCode));
    
    teacherMessages.forEach(message => {
        // Analizar mensaje si no tiene análisis
        let analysis = message.keywordAnalysis;
        if (!analysis && typeof keywordAnalyzer !== 'undefined' && message.content) {
            analysis = keywordAnalyzer.analyzeMessage(message.content);
            message.keywordAnalysis = analysis;
        }
        
        if (analysis && (analysis.nivelRiesgo === 'CRITICO' || analysis.nivelRiesgo === 'ALTO' || analysis.nivelRiesgo === 'MEDIO')) {
            const alert = {
                id: message.id,
                studentId: message.studentId,
                anonymousId: message.anonymousId,
                timestamp: message.timestamp,
                content: message.content,
                nivelRiesgo: analysis.nivelRiesgo,
                categoria: analysis.categoria,
                keywords: analysis.keywordsDetectadas,
                urgencia: analysis.urgencia,
                razon: analysis.razon,
                sugerencia: analysis.sugerencia
            };
            
            if (analysis.nivelRiesgo === 'CRITICO' || analysis.urgencia >= 8) {
                criticalAlerts.push(alert);
            } else if (analysis.nivelRiesgo === 'ALTO' || analysis.urgencia >= 5) {
                mediumAlerts.push(alert);
            }
        }
    });
    
    // Guardar mensajes actualizados
    localStorage.setItem('anonymousMessages', JSON.stringify(messages));
    
    // Ordenar por urgencia y fecha
    criticalAlerts.sort((a, b) => {
        if (b.urgencia !== a.urgencia) return b.urgencia - a.urgencia;
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    mediumAlerts.sort((a, b) => {
        if (b.urgencia !== a.urgencia) return b.urgencia - a.urgencia;
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    // Mostrar alertas
    if (criticalAlerts.length === 0 && mediumAlerts.length === 0) {
    container.innerHTML = `
        <div style="text-align: center; padding: 30px; color: #666; background: #f8f9fc; border-radius: 12px; border: 2px dashed #e8eef5;">
                <p style="font-size: 1.1em; margin-bottom: 8px;">✅ No hay alertas de riesgo</p>
                <p style="font-size: 0.9em;">Todos los mensajes analizados muestran niveles de riesgo bajo.</p>
        </div>
    `;
        return;
    }
    
    let html = '';
    
    // Alertas críticas
    if (criticalAlerts.length > 0) {
        html += `<div style="margin-bottom: 30px;">`;
        html += `<h4 style="color: #dc3545; margin-bottom: 15px; font-size: 1.2em;">⚠️ Alertas Críticas (${criticalAlerts.length})</h4>`;
        criticalAlerts.forEach(alert => {
            html += renderRiskAlert(alert, 'critical');
        });
        html += `</div>`;
    }
    
    // Alertas de riesgo medio/alto
    if (mediumAlerts.length > 0) {
        html += `<div>`;
        html += `<h4 style="color: #ff9800; margin-bottom: 15px; font-size: 1.2em;">🔴 Alertas de Atención (${mediumAlerts.length})</h4>`;
        mediumAlerts.forEach(alert => {
            html += renderRiskAlert(alert, 'medium');
        });
        html += `</div>`;
    }
    
    container.innerHTML = html;
}

// Renderizar alertas agrupadas por estado
function renderAlertsByStatus(alerts, status) {
    if (alerts.length === 0) {
        const statusLabels = {
            pending: 'Pendiente',
            inProgress: 'En Proceso',
            resolved: 'Resuelto'
        };
        const statusMessages = {
            pending: 'No hay alertas pendientes. ¡Excelente trabajo!',
            inProgress: 'No hay alertas en proceso en este momento.',
            resolved: 'No hay alertas resueltas aún.'
        };
        return `
            <div style="text-align: center; padding: 40px 20px; color: #999;">
                <p style="font-size: 1.1em; margin-bottom: 8px;">📋</p>
                <p style="font-size: 0.95em; font-weight: 600; color: #666; margin-bottom: 4px;">${statusLabels[status]}</p>
                <p style="font-size: 0.85em;">${statusMessages[status]}</p>
            </div>
        `;
    }
    
    // Separar alertas críticas y de atención
    const criticalAlerts = alerts.filter(a => a.nivelRiesgo === 'CRITICO' || a.urgencia >= 8);
    const mediumAlerts = alerts.filter(a => a.nivelRiesgo !== 'CRITICO' && a.urgencia < 8);
    
    let html = '';
    
    // Alertas críticas
    if (criticalAlerts.length > 0) {
        html += `<div style="margin-bottom: 30px;">`;
        html += `<div style="
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 2px solid #dc3545;
        ">
            <div style="
                width: 44px;
                height: 44px;
                background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(220, 53, 69, 0.25);
            ">
                <span style="font-size: 1.6em;">⚠️</span>
            </div>
            <div>
                <h3 style="
                    margin: 0 0 2px 0;
                    color: #dc3545;
                    font-size: 1.2em;
                    font-weight: 700;
                    letter-spacing: -0.3px;
                ">
                    Alertas Críticas
                </h3>
                <p style="margin: 0; color: #666; font-size: 0.85em; font-weight: 500;">
                    ${criticalAlerts.length} ${criticalAlerts.length === 1 ? 'alerta requiere' : 'alertas requieren'} atención inmediata
                </p>
            </div>
        </div>`;
        criticalAlerts.forEach(alert => {
            html += renderRiskAlert(alert, 'critical');
        });
        html += `</div>`;
    }
    
    // Alertas de riesgo medio/alto
    if (mediumAlerts.length > 0) {
        html += `<div>`;
        html += `<div style="
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 2px solid #ff9800;
        ">
            <div style="
                width: 44px;
                height: 44px;
                background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(255, 152, 0, 0.25);
            ">
                <span style="font-size: 1.6em;">🔴</span>
            </div>
            <div>
                <h3 style="
                    margin: 0 0 2px 0;
                    color: #ff9800;
                    font-size: 1.2em;
                    font-weight: 700;
                    letter-spacing: -0.3px;
                ">
                    Alertas de Atención
                </h3>
                <p style="margin: 0; color: #666; font-size: 0.85em; font-weight: 500;">
                    ${mediumAlerts.length} ${mediumAlerts.length === 1 ? 'alerta requiere' : 'alertas requieren'} seguimiento prioritario
                </p>
            </div>
        </div>`;
        mediumAlerts.forEach(alert => {
            html += renderRiskAlert(alert, 'medium');
        });
        html += `</div>`;
    }
    
    return html;
}

// Cambiar entre pestañas de alertas de riesgo
function switchRiskAlertsTab(status) {
    // Ocultar todas las pestañas
    document.querySelectorAll('.risk-alert-tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Desactivar todos los botones
    document.querySelectorAll('.risk-alert-tab').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = 'transparent';
        btn.style.color = '#666';
        btn.style.borderBottomColor = 'transparent';
    });
    
    // Mostrar la pestaña seleccionada
    const tabContent = document.getElementById(`tab-content-${status}`);
    if (tabContent) {
        tabContent.style.display = 'block';
    }
    
    // Activar el botón correspondiente
    const tabButton = document.getElementById(`tab-${status}`);
    if (tabButton) {
        tabButton.classList.add('active');
        tabButton.style.background = 'white';
        tabButton.style.color = '#1a2332';
        tabButton.style.borderBottomColor = status === 'pending' ? '#ff9800' : status === 'inProgress' ? '#2196F3' : '#4CAF50';
    }
}

// Renderizar una alerta de riesgo
function renderRiskAlert(alert, type) {
    const isCritical = type === 'critical';
    const gradientStart = isCritical ? '#ffebee' : '#fff8e1';
    const gradientEnd = isCritical ? '#ffcdd2' : '#ffe082';
    const borderColor = isCritical ? '#dc3545' : '#ff9800';
    const textColor = isCritical ? '#721c24' : '#856404';
    const iconBg = isCritical ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' : 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)';
    const urgencyBg = isCritical ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' : 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)';
    
    // Determinar etiqueta de riesgo
    let riskLabel = '';
    let riskIcon = '';
    if (alert.nivelRiesgo === 'CRITICO') {
        riskLabel = typeof i18n !== 'undefined' ? i18n.t('riskAlerts.riskCritical') : 'Riesgo Crítico - Atención Inmediata';
        riskIcon = '⚠️';
    } else if (alert.nivelRiesgo === 'ALTO') {
        riskLabel = typeof i18n !== 'undefined' ? i18n.t('riskAlerts.riskHigh') : 'Riesgo Alto - Requiere Atención Prioritaria';
        riskIcon = '🔴';
    } else {
        riskLabel = typeof i18n !== 'undefined' ? i18n.t('riskAlerts.riskModerate') : 'Riesgo Moderado - Requiere Monitoreo';
        riskIcon = '🟡';
    }
    
    // Filtrar keywords para mostrar solo frases completas (más de 2 palabras) o frases contextuales
    const meaningfulKeywords = alert.keywords ? alert.keywords.filter(kw => {
        if (!kw) return false;
        const wordCount = kw.trim().split(/\s+/).length;
        // Mostrar solo frases de 2+ palabras o palabras muy específicas
        return wordCount >= 2 || kw.length > 8;
    }) : [];
    
    // Calcular tiempo transcurrido
    const alertDate = new Date(alert.timestamp);
    const now = new Date();
    const diffMs = now - alertDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    let timeAgo = '';
    if (typeof i18n !== 'undefined') {
        if (diffDays > 0) {
            timeAgo = `${i18n.t('time.ago')} ${diffDays} ${diffDays > 1 ? i18n.t('time.daysPlural') : i18n.t('time.days')}`;
        } else if (diffHours > 0) {
            timeAgo = `${i18n.t('time.ago')} ${diffHours} ${diffHours > 1 ? i18n.t('time.hoursPlural') : i18n.t('time.hours')}`;
        } else {
            const diffMins = Math.floor(diffMs / (1000 * 60));
            timeAgo = diffMins > 0 ? `${i18n.t('time.ago')} ${diffMins} ${diffMins > 1 ? i18n.t('time.minutesPlural') : i18n.t('time.minutes')}` : i18n.t('time.moments');
        }
    } else {
        if (diffDays > 0) {
            timeAgo = `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
        } else if (diffHours > 0) {
            timeAgo = `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        } else {
            const diffMins = Math.floor(diffMs / (1000 * 60));
            timeAgo = diffMins > 0 ? `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}` : 'hace unos momentos';
        }
    }
    
    return `
        <div style="
            background: linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%);
            border: 2px solid ${borderColor};
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        ">
            <!-- Decoración de fondo -->
            <div style="
                position: absolute;
                top: -30px;
                right: -30px;
                width: 100px;
                height: 100px;
                background: ${isCritical ? 'rgba(220, 53, 69, 0.08)' : 'rgba(255, 152, 0, 0.08)'};
                border-radius: 50%;
                z-index: 0;
            "></div>
            
            <div style="position: relative; z-index: 1;">
                <!-- Header de la alerta -->
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                            <div style="
                                width: 40px;
                                height: 40px;
                                background: ${iconBg};
                                border-radius: 10px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                box-shadow: 0 2px 8px ${isCritical ? 'rgba(220, 53, 69, 0.25)' : 'rgba(255, 152, 0, 0.25)'};
                                flex-shrink: 0;
                            ">
                                <span style="font-size: 1.4em;">${riskIcon}</span>
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <h5 style="
                                    margin: 0 0 4px 0;
                                    color: ${textColor};
                                    font-size: 1em;
                                    font-weight: 700;
                                    letter-spacing: -0.2px;
                                ">
                                    ${riskLabel}
                                </h5>
                                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                    <span style="
                                        background: rgba(255, 255, 255, 0.9);
                                        color: ${textColor};
                                        padding: 3px 10px;
                                        border-radius: 10px;
                                        font-size: 0.8em;
                                        font-weight: 600;
                                        border: 1px solid ${borderColor};
                                    ">
                                        ${typeof i18n !== 'undefined' ? i18n.t('riskAlerts.anonymousId') : 'ID Anónimo'}: ${escapeHtmlAttribute(alert.anonymousId)}
                                    </span>
                                    <span style="
                                        color: #666;
                                        font-size: 0.8em;
                                        font-weight: 500;
                                    ">
                                        ${timeAgo}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="text-align: right; flex-shrink: 0; margin-left: 12px;">
                        <div style="
                            background: ${urgencyBg};
                            color: white;
                            padding: 6px 12px;
                            border-radius: 10px;
                            font-size: 0.85em;
                            font-weight: 700;
                            box-shadow: 0 2px 8px ${isCritical ? 'rgba(220, 53, 69, 0.25)' : 'rgba(255, 152, 0, 0.25)'};
                            white-space: nowrap;
                        ">
                            ${typeof i18n !== 'undefined' ? i18n.t('riskAlerts.urgency') : 'Urgencia'} ${alert.urgencia}/10
                        </div>
                    </div>
                </div>
                
                <!-- Mensaje del estudiante -->
                <div style="
                    background: rgba(255, 255, 255, 0.95);
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 12px;
                    border-left: 4px solid ${borderColor};
                    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
                ">
                    <p style="
                        margin: 0;
                        color: #333;
                        line-height: 1.5;
                        font-size: 0.9em;
                        font-style: italic;
                    ">
                        "${sanitizeHTML(alert.content.substring(0, 200))}${alert.content.length > 200 ? '...' : ''}"
                    </p>
                </div>
                
                ${meaningfulKeywords.length > 0 ? `
                    <div style="margin-bottom: 12px;">
                        <p style="
                            font-weight: 700;
                            color: ${textColor};
                            margin-bottom: 6px;
                            font-size: 0.85em;
                            display: flex;
                            align-items: center;
                            gap: 4px;
                        ">
                            <span>🔍</span> ${typeof i18n !== 'undefined' ? i18n.t('riskAlerts.phrasesDetected') : 'Frases detectadas'}
                        </p>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            ${meaningfulKeywords.map(kw => {
                                const sanitizedKeyword = sanitizeInput(String(kw || ''));
                                return `<span style="
                                    background: ${urgencyBg};
                                    color: white;
                                    padding: 4px 10px;
                                    border-radius: 16px;
                                    font-size: 0.8em;
                                    font-weight: 600;
                                    box-shadow: 0 1px 4px ${isCritical ? 'rgba(220, 53, 69, 0.2)' : 'rgba(255, 152, 0, 0.2)'};
                                ">${sanitizedKeyword}</span>`;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Análisis y recomendación en grid -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px;">
                    <div style="
                        background: rgba(255, 255, 255, 0.95);
                        padding: 10px;
                        border-radius: 8px;
                        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
                    ">
                        <p style="
                            margin: 0 0 6px 0;
                            font-weight: 700;
                            color: ${textColor};
                            font-size: 0.85em;
                            display: flex;
                            align-items: center;
                            gap: 4px;
                        ">
                            <span>📋</span> ${typeof i18n !== 'undefined' ? i18n.t('riskAlerts.analysis') : 'Análisis'}
                        </p>
                        <p style="margin: 0; color: #555; font-size: 0.8em; line-height: 1.4;">
                            ${sanitizeHTML(alert.razon || 'Se detectaron señales de preocupación en el mensaje.')}
                        </p>
                    </div>
                    
                    <div style="
                        background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
                        padding: 10px;
                        border-radius: 8px;
                        border-left: 3px solid #4caf50;
                        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
                    ">
                        <p style="
                            margin: 0 0 6px 0;
                            font-weight: 700;
                            color: #2e7d32;
                            font-size: 0.85em;
                            display: flex;
                            align-items: center;
                            gap: 4px;
                        ">
                            <span>💡</span> ${typeof i18n !== 'undefined' ? i18n.t('riskAlerts.recommendation') : 'Recomendación'}
                        </p>
                        <p style="margin: 0; color: #333; font-size: 0.8em; line-height: 1.4;">
                            ${sanitizeHTML(alert.sugerencia || 'Mantener comunicación y seguimiento cercano.')}
                        </p>
                    </div>
                </div>
                
                <!-- Fecha y botón de resolución -->
                <div style="
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 1px solid rgba(0, 0, 0, 0.08);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <label style="font-size: 0.8em; font-weight: 600; color: ${textColor}; margin-right: 4px;">${typeof i18n !== 'undefined' ? i18n.t('riskAlerts.caseStatus') : 'Estado'}:</label>
                        <select id="caseStatusSelect_${alert.id}" onchange="changeCaseStatus('${alert.id}', this.value)" aria-label="Cambiar estado del caso" style="
                            padding: 6px 10px;
                            border: 1px solid ${borderColor};
                            border-radius: 8px;
                            font-size: 0.8em;
                            font-weight: 600;
                            cursor: pointer;
                            background: white;
                            color: ${textColor};
                        " value="${alert.caseStatus || 'pending'}">
                            <option value="pending" ${(alert.caseStatus || 'pending') === 'pending' ? 'selected' : ''}>${typeof i18n !== 'undefined' ? i18n.t('caseStatus.pending') : 'Pendiente'}</option>
                            <option value="inProgress" ${alert.caseStatus === 'inProgress' ? 'selected' : ''}>${typeof i18n !== 'undefined' ? i18n.t('caseStatus.inProgress') : 'En Proceso'}</option>
                            <option value="resolved" ${alert.caseStatus === 'resolved' ? 'selected' : ''}>${typeof i18n !== 'undefined' ? i18n.t('caseStatus.resolved') : 'Resuelto'}</option>
                        </select>
                    </div>
                    <span style="
                        color: #888;
                        font-size: 0.75em;
                        font-weight: 500;
                    ">
                        ${new Date(alert.timestamp).toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                </div>
            </div>
        </div>
    `;
}

// Cargar alertas de riesgo en la vista dedicada (anónimas)
function loadRiskAlerts() {
    const container = document.getElementById('riskAlertsContainer');
    if (!container) return;
    
    // Si el usuario es admin@munay.com, usar la clase demo
    const isAdmin = currentUser && (currentUser.email === 'admin@munay.com' || currentUser.email === 'munay@munay.com');
    
    let teacherMessages;
    if (isAdmin) {
        const messages = JSON.parse(localStorage.getItem('anonymousMessages') || '[]');
        teacherMessages = messages.filter(m => m.studentClassCode === 'CLSDEMO');
    } else {
        // Para otros docentes: usar mensajes del cliente
        teacherMessages = getClientMessages();
        const clientClasses = getClientClasses();
        const teacherClassCodes = clientClasses
            .filter(c => c.teacherId === currentUser.id)
            .map(c => c.code);
        teacherMessages = teacherMessages.filter(m => teacherClassCodes.includes(m.studentClassCode));
    }
    
    const criticalAlerts = [];
    const mediumAlerts = [];
    
    teacherMessages.forEach(message => {
        // Obtener estado del caso (siempre obtener el más reciente de localStorage)
        const caseStatus = getCaseStatus(message.id);
        
        // Analizar mensaje si no tiene análisis
        let analysis = message.keywordAnalysis;
        if (!analysis && typeof keywordAnalyzer !== 'undefined' && message.content) {
            analysis = keywordAnalyzer.analyzeMessage(message.content);
            message.keywordAnalysis = analysis;
        }
        
        if (analysis && (analysis.nivelRiesgo === 'CRITICO' || analysis.nivelRiesgo === 'ALTO' || analysis.nivelRiesgo === 'MEDIO')) {
            // Aplicar filtros ANTES de crear el objeto alert
            if (riskAlertsFilters.riskLevel !== 'all' && analysis.nivelRiesgo !== riskAlertsFilters.riskLevel) {
                return;
            }
            // Filtrar por estado del caso (usar caseStatus actualizado)
            if (riskAlertsFilters.caseStatus !== 'all' && caseStatus !== riskAlertsFilters.caseStatus) {
                return;
            }
            if (riskAlertsFilters.dateFrom) {
                const alertDate = new Date(message.timestamp);
                const filterFrom = new Date(riskAlertsFilters.dateFrom);
                if (alertDate < filterFrom) return;
            }
            if (riskAlertsFilters.dateTo) {
                const alertDate = new Date(message.timestamp);
                const filterTo = new Date(riskAlertsFilters.dateTo);
                filterTo.setHours(23, 59, 59, 999);
                if (alertDate > filterTo) return;
            }
            
            // Asegurar que keywordsDetectadas sea un array
            const keywords = Array.isArray(analysis.keywordsDetectadas) 
                ? analysis.keywordsDetectadas 
                : (analysis.keywordsDetectadas ? [analysis.keywordsDetectadas] : []);
            
            // Crear el objeto alert con el estado actualizado (obtenerlo nuevamente para asegurar que esté actualizado)
            const currentCaseStatus = getCaseStatus(message.id);
            const alert = {
                id: message.id,
                studentId: message.studentId,
                anonymousId: message.anonymousId,
                timestamp: message.timestamp,
                content: message.content,
                nivelRiesgo: analysis.nivelRiesgo,
                categoria: analysis.categoria,
                keywords: keywords,
                urgencia: analysis.urgencia,
                razon: analysis.razon,
                sugerencia: analysis.sugerencia,
                caseStatus: currentCaseStatus // Usar el estado más reciente
            };
            
            if (analysis.nivelRiesgo === 'CRITICO' || analysis.urgencia >= 8) {
                criticalAlerts.push(alert);
            } else if (analysis.nivelRiesgo === 'ALTO' || analysis.urgencia >= 5) {
                mediumAlerts.push(alert);
            }
        }
    });
    
    // Guardar mensajes actualizados con análisis
    const allMessages = JSON.parse(localStorage.getItem('anonymousMessages') || '[]');
    teacherMessages.forEach(updatedMessage => {
        const index = allMessages.findIndex(m => m.id === updatedMessage.id);
        if (index !== -1) {
            allMessages[index] = updatedMessage;
        }
    });
    localStorage.setItem('anonymousMessages', JSON.stringify(allMessages));
    
    // Combinar todas las alertas
    const allAlerts = [...criticalAlerts, ...mediumAlerts];
    
    // Ordenar por urgencia y fecha
    allAlerts.sort((a, b) => {
        if (b.urgencia !== a.urgencia) return b.urgencia - a.urgencia;
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    // Agrupar alertas por estado
    const alertsByStatus = {
        pending: allAlerts.filter(a => (a.caseStatus || 'pending') === 'pending'),
        inProgress: allAlerts.filter(a => a.caseStatus === 'inProgress'),
        resolved: allAlerts.filter(a => a.caseStatus === 'resolved')
    };
    
    // Contar alertas por estado
    const counts = {
        pending: alertsByStatus.pending.length,
        inProgress: alertsByStatus.inProgress.length,
        resolved: alertsByStatus.resolved.length
    };
    
    // Crear interfaz con pestañas
    let html = `
        <div style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
            <!-- Pestañas -->
            <div style="display: flex; border-bottom: 2px solid #e8eef5; background: #f8f9fc;">
                <button 
                    id="tab-pending" 
                    onclick="switchRiskAlertsTab('pending')"
                    class="risk-alert-tab"
                    style="
                        flex: 1;
                        padding: 16px 20px;
                        border: none;
                        background: transparent;
                        cursor: pointer;
                        font-size: 0.95em;
                        font-weight: 600;
                        color: #666;
                        border-bottom: 3px solid transparent;
                        transition: all 0.3s ease;
                        position: relative;
                    "
                    onmouseover="this.style.background='#f0f4ff'"
                    onmouseout="if(this.classList.contains('active')) { this.style.background='white'; } else { this.style.background='transparent'; }"
                >
                    Pendiente
                </button>
                <button 
                    id="tab-inProgress" 
                    onclick="switchRiskAlertsTab('inProgress')"
                    class="risk-alert-tab"
                    style="
                        flex: 1;
                        padding: 16px 20px;
                        border: none;
                        background: transparent;
                        cursor: pointer;
                        font-size: 0.95em;
                        font-weight: 600;
                        color: #666;
                        border-bottom: 3px solid transparent;
                        transition: all 0.3s ease;
                    "
                    onmouseover="this.style.background='#f0f4ff'"
                    onmouseout="if(this.classList.contains('active')) { this.style.background='white'; } else { this.style.background='transparent'; }"
                >
                    En Proceso
                </button>
                <button 
                    id="tab-resolved" 
                    onclick="switchRiskAlertsTab('resolved')"
                    class="risk-alert-tab"
                    style="
                        flex: 1;
                        padding: 16px 20px;
                        border: none;
                        background: transparent;
                        cursor: pointer;
                        font-size: 0.95em;
                        font-weight: 600;
                        color: #666;
                        border-bottom: 3px solid transparent;
                        transition: all 0.3s ease;
                    "
                    onmouseover="this.style.background='#f0f4ff'"
                    onmouseout="if(this.classList.contains('active')) { this.style.background='white'; } else { this.style.background='transparent'; }"
                >
                    Resuelto
                </button>
            </div>
            
            <!-- Contenido de pestañas -->
            <div style="padding: 20px;">
                <!-- Pestaña Pendiente -->
                <div id="tab-content-pending" class="risk-alert-tab-content" style="display: none;">
                    ${renderAlertsByStatus(alertsByStatus.pending, 'pending')}
                </div>
                
                <!-- Pestaña En Proceso -->
                <div id="tab-content-inProgress" class="risk-alert-tab-content" style="display: none;">
                    ${renderAlertsByStatus(alertsByStatus.inProgress, 'inProgress')}
            </div>
                
                <!-- Pestaña Resuelto -->
                <div id="tab-content-resolved" class="risk-alert-tab-content" style="display: none;">
                    ${renderAlertsByStatus(alertsByStatus.resolved, 'resolved')}
            </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Activar siempre la pestaña "Pendiente" por defecto
    switchRiskAlertsTab('pending');
    
    // Actualizar badge después de cargar alertas
    updateRiskAlertsBadge();
}

// Marcar alerta como resuelta (mantener para compatibilidad, ahora usa setCaseStatus)
function markAlertAsResolved(messageId) {
    if (!messageId) return;
    setCaseStatus(messageId, 'resolved');
    
    // También agregar a resolvedAlerts para mantener compatibilidad
    const resolvedAlerts = JSON.parse(localStorage.getItem('resolvedRiskAlerts') || '[]');
    if (!resolvedAlerts.includes(messageId)) {
        resolvedAlerts.push(messageId);
        localStorage.setItem('resolvedRiskAlerts', JSON.stringify(resolvedAlerts));
    }
}

// Actualizar badge de alertas de riesgo en el nav (punto rojo minimalista)
function updateRiskAlertsBadge() {
    if (!currentUser || currentUser.role !== 'teacher') return;
    
    const badge = document.getElementById('riskAlertsBadge');
    if (!badge) return;
    
    const resolvedAlerts = JSON.parse(localStorage.getItem('resolvedRiskAlerts') || '[]');
    
    // Si el usuario es admin@munay.com, usar la clase demo
    const isAdmin = currentUser && (currentUser.email === 'admin@munay.com' || currentUser.email === 'munay@munay.com');
    
    let teacherMessages;
    if (isAdmin) {
        const messages = JSON.parse(localStorage.getItem('anonymousMessages') || '[]');
        teacherMessages = messages.filter(m => m.studentClassCode === 'CLSDEMO');
    } else {
        // Para otros docentes: usar mensajes del cliente
        teacherMessages = getClientMessages();
        const clientClasses = getClientClasses();
        const teacherClassCodes = clientClasses
            .filter(c => c.teacherId === currentUser.id)
            .map(c => c.code);
        teacherMessages = teacherMessages.filter(m => teacherClassCodes.includes(m.studentClassCode));
    }
    
    // Verificar si hay alertas no resueltas
    let hasUnresolvedAlerts = false;
    teacherMessages.forEach(message => {
        // Si ya está resuelta, no contar
        if (resolvedAlerts.includes(message.id)) return;
        
        let analysis = message.keywordAnalysis;
        if (!analysis && typeof keywordAnalyzer !== 'undefined' && message.content) {
            analysis = keywordAnalyzer.analyzeMessage(message.content);
        }
        
        if (analysis && (analysis.nivelRiesgo === 'CRITICO' || analysis.nivelRiesgo === 'ALTO' || analysis.nivelRiesgo === 'MEDIO')) {
            hasUnresolvedAlerts = true;
        }
    });
    
    if (hasUnresolvedAlerts) {
        // Mostrar punto rojo minimalista
        badge.innerHTML = '';
        badge.style.display = 'block';
        badge.style.width = '8px';
        badge.style.height = '8px';
        badge.style.minWidth = '8px';
        badge.style.borderRadius = '50%';
        badge.style.background = '#dc3545';
        badge.style.boxShadow = 'none';
        badge.style.animation = 'none';
        badge.style.padding = '0';
        badge.style.lineHeight = '8px';
    } else {
        badge.style.display = 'none';
    }
}

// Cargar tendencias de keywords en el tiempo
function loadKeywordsTrends() {
    const canvas = document.getElementById('keywordsTrendsChart');
    if (!canvas) return;
    
    // Verificar que el canvas esté visible (no en una pestaña oculta)
    const tabContent = canvas.closest('.dashboard-tab-content');
    if (tabContent && !tabContent.classList.contains('active')) {
        return; // No renderizar si la pestaña está oculta
    }
    
    // Obtener filtro de código de clase si está disponible
    const analysisClassCodeFilter = document.getElementById('analysisClassCodeFilter');
    const classCodeFilter = analysisClassCodeFilter?.value || '';
    
    const students = getClassStudents(classCodeFilter || null);
    // Usar mensajes y actividades del cliente
    const messages = getClientMessages();
    const activities = getClientActivities();
    const classes = getClientClasses();
    
    // Si el usuario es admin@munay.com, usar la clase demo
    const isAdmin = currentUser && (currentUser.email === 'admin@munay.com' || currentUser.email === 'munay@munay.com');
    let teacherClassCodes = isAdmin 
        ? ['CLSDEMO'] 
        : classes.filter(c => c.teacherId === currentUser.id).map(c => c.code);
    
    // Si hay filtro de código de clase, usar solo ese código
    if (classCodeFilter) {
        teacherClassCodes = [classCodeFilter];
    }
    
    // Agrupar por mes (últimos 6 meses)
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push({
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            label: date.toLocaleDateString(typeof i18n !== 'undefined' && i18n.currentLanguage === 'en' ? 'en-US' : 'es-ES', { month: 'short', year: 'numeric' })
        });
    }
    
    const negativeTrend = months.map(m => ({ month: m.label, count: 0 }));
    const positiveTrend = months.map(m => ({ month: m.label, count: 0 }));
    
    // Procesar mensajes con análisis de keywords
    const teacherMessages = messages.filter(m => teacherClassCodes.includes(m.studentClassCode));
    
    teacherMessages.forEach(message => {
        // Analizar mensaje si no tiene análisis
        let analysis = message.keywordAnalysis;
        if (!analysis && typeof keywordAnalyzer !== 'undefined' && message.content) {
            analysis = keywordAnalyzer.analyzeMessage(message.content);
            message.keywordAnalysis = analysis;
        }
        
        if (analysis) {
            const itemDate = new Date(message.timestamp);
        const monthIndex = months.findIndex(m => 
            m.month === itemDate.getMonth() + 1 && m.year === itemDate.getFullYear()
        );
        
        if (monthIndex >= 0) {
                // Contar keywords negativas (riesgo)
                if (analysis.nivelRiesgo === 'CRITICO' || analysis.nivelRiesgo === 'ALTO' || analysis.nivelRiesgo === 'MEDIO') {
                    negativeTrend[monthIndex].count += analysis.keywordsDetectadas.length;
                }
                
                // Contar indicadores positivos
                if (analysis.sentimiento === 'positivo' || analysis.nivelRiesgo === 'BAJO') {
                    positiveTrend[monthIndex].count += 1;
                }
            }
        }
    });
    
    // Guardar mensajes actualizados
    localStorage.setItem('anonymousMessages', JSON.stringify(messages));
    
    renderKeywordsTrendsChart(canvas, negativeTrend, positiveTrend);
}

function renderKeywordsTrendsChart(canvas, negativeTrend, positiveTrend) {
    const { ctx, width, height } = setupHighQualityCanvas(canvas);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    const padding = { top: 30, right: 40, bottom: 50, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const maxValue = Math.max(
        ...negativeTrend.map(d => d.count),
        ...positiveTrend.map(d => d.count),
        1
    );
    
    // Ejes
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.stroke();
    
    // Líneas de grid
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
        const y = padding.top + (chartHeight / gridLines) * i;
        ctx.strokeStyle = '#f0f0f0';
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartWidth, y);
        ctx.stroke();
        
        ctx.fillStyle = '#666';
        ctx.font = '11px Segoe UI, Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxValue - (maxValue / gridLines) * i).toString(), padding.left - 10, y + 4);
    }
    
    // Dibujar líneas
    const pointSpacing = chartWidth / (negativeTrend.length - 1);
    
    // Línea negativa
    ctx.strokeStyle = '#dc3545';
    ctx.lineWidth = 3;
    ctx.beginPath();
    negativeTrend.forEach((point, index) => {
        const x = padding.left + index * pointSpacing;
        const y = padding.top + chartHeight - (point.count / maxValue) * chartHeight;
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // Puntos negativos
    ctx.fillStyle = '#dc3545';
    negativeTrend.forEach((point, index) => {
        const x = padding.left + index * pointSpacing;
        const y = padding.top + chartHeight - (point.count / maxValue) * chartHeight;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#dc3545';
    });
    
    // Línea positiva
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 3;
    ctx.beginPath();
    positiveTrend.forEach((point, index) => {
        const x = padding.left + index * pointSpacing;
        const y = padding.top + chartHeight - (point.count / maxValue) * chartHeight;
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // Puntos positivos
    ctx.fillStyle = '#28a745';
    positiveTrend.forEach((point, index) => {
        const x = padding.left + index * pointSpacing;
        const y = padding.top + chartHeight - (point.count / maxValue) * chartHeight;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#28a745';
    });
    
    // Etiquetas de meses
    ctx.fillStyle = '#666';
    ctx.font = '11px Segoe UI, Arial, sans-serif';
    ctx.textAlign = 'center';
    negativeTrend.forEach((point, index) => {
        const x = padding.left + index * pointSpacing;
        ctx.fillText(point.month, x, padding.top + chartHeight + 20);
    });
    
    // Leyenda
    const legendY = padding.top - 20;
    ctx.fillStyle = '#dc3545';
    ctx.fillRect(padding.left, legendY, 15, 12);
    ctx.fillStyle = '#333';
    ctx.font = '12px Segoe UI, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Keywords Negativas', padding.left + 20, legendY + 9);
    
    ctx.fillStyle = '#28a745';
    ctx.fillRect(padding.left + 150, legendY, 15, 12);
    ctx.fillStyle = '#333';
    ctx.fillText('Keywords Positivas', padding.left + 170, legendY + 9);
}

// ========== SISTEMA DE COMUNICACIÓN ANÓNIMA ==========
function openSendMessageModal() {
    document.getElementById('sendMessageModal').style.display = 'block';
    document.getElementById('messageContent').value = '';
}

function closeSendMessageModal() {
    document.getElementById('sendMessageModal').style.display = 'none';
}

function openReplyMessageModal(messageId) {
    const messages = JSON.parse(localStorage.getItem('anonymousMessages') || '[]');
    const message = messages.find(m => m.id === messageId);
    
    if (!message) {
        showSuccessMessage('❌ Error: No se encontró el mensaje.');
        return;
    }
    
    const modal = document.getElementById('replyMessageModal');
    if (!modal) {
        showSuccessMessage('❌ Error: No se pudo encontrar el modal de respuesta.');
        return;
    }
    
    const originalContent = document.getElementById('originalMessageContent');
    if (!originalContent) {
        showSuccessMessage('❌ Error: No se pudo encontrar el contenedor del mensaje original.');
        return;
    }
    
    originalContent.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong style="color: #666;">Mensaje anónimo #${message.anonymousId}:</strong>
        </div>
        <div style="color: #333; white-space: pre-wrap;">${sanitizeHTML(message.content)}</div>
        <div style="margin-top: 10px; font-size: 0.85em; color: #999;">
            ${new Date(message.timestamp).toLocaleString('es-ES')}
        </div>
    `;
    
    const replyContentInput = document.getElementById('replyContent');
    if (replyContentInput) {
        replyContentInput.value = '';
    }
    
    modal.dataset.messageId = messageId;
    modal.style.display = 'block';
    
    // Asegurar que el event listener esté registrado
    const replyMessageForm = document.getElementById('replyMessageForm');
    if (replyMessageForm) {
        // Remover listener anterior si existe para evitar duplicados
        replyMessageForm.removeEventListener('submit', handleReplyMessage);
        // Agregar el listener
        replyMessageForm.addEventListener('submit', handleReplyMessage);
    }
}

function closeReplyMessageModal() {
    document.getElementById('replyMessageModal').style.display = 'none';
}

async function handleSendMessage(e) {
    e.preventDefault();
    
    if (!currentUser || currentUser.role !== 'student') {
        showSuccessMessage('❌ Error: Debes estar autenticado como estudiante para enviar mensajes.');
        return;
    }
    
    if (!currentUser.classCode) {
        showSuccessMessage('❌ Error: No tienes un código de clase asignado. Por favor, contacta al docente.');
        return;
    }
    
    const content = document.getElementById('messageContent').value.trim();
    if (!content) {
        showSuccessMessage('Por favor, escribe un mensaje antes de enviar.');
        return;
    }
    
    // Sanitize message content
    const sanitizedContent = sanitizeInput(content);
    
    const messages = JSON.parse(localStorage.getItem('anonymousMessages') || '[]');
    
    // Obtener el último anonymousId para generar uno nuevo (basado en todos los mensajes de la misma clase)
    const classMessages = messages.filter(m => m.studentClassCode === currentUser.classCode);
    const lastMessage = classMessages.length > 0 
        ? classMessages.sort((a, b) => parseInt(b.anonymousId || 0) - parseInt(a.anonymousId || 0))[0]
        : null;
    const lastAnonymousId = lastMessage ? parseInt(lastMessage.anonymousId) || 0 : 0;
    const newAnonymousId = String(lastAnonymousId + 1);
    
    // Análisis de keywords con el sistema inteligente
    let keywordAnalysis = null;
    if (typeof keywordAnalyzer !== 'undefined') {
        keywordAnalysis = keywordAnalyzer.analyzeMessage(sanitizedContent);
    }
    
    const newMessage = {
        id: Date.now().toString(),
        studentId: currentUser.id,
        studentClassCode: currentUser.classCode, // El estudiante tiene un classCode específico
        anonymousId: newAnonymousId,
        content: sanitizedContent,
        timestamp: new Date().toISOString(),
        replies: [],
        keywordAnalysis: keywordAnalysis // Guardar análisis de keywords
    };
    
    // Los mensajes anónimos NO se registran en notificaciones
    // (Eliminado: createUrgentNotificationFromMessage)
    
    messages.push(newMessage);
    localStorage.setItem('anonymousMessages', JSON.stringify(messages));
    
    // Clear cache when data changes
    dataCache.clearPattern('students');
    
    // Actualizar badge de alertas si el docente está viendo
    if (currentUser && currentUser.role === 'teacher') {
        updateRiskAlertsBadge();
    }
    
    // Verificar y otorgar recompensas (basado en mensajes enviados, no en análisis de keywords)
    checkAndAwardRewards();
    
    // Recargar recompensas si el modal está abierto
    const rewardsModal = document.getElementById('rewardsModal');
    if (rewardsModal && rewardsModal.style.display === 'block') {
        loadRewards();
    }
    
    closeSendMessageModal();
    
    // Recargar mensajes si estamos en la vista de mensajes
    if (currentView === 'studentMessages') {
        loadStudentMessages();
    }
    
    showSuccessMessage('¡Mensaje enviado exitosamente! ✅\n\nTu mensaje es completamente anónimo. El docente verá solo un número de identificación, pero nunca tu nombre o información personal.\n\nGracias por confiar en nosotros para comunicarte de forma segura.');
}

function handleReplyMessage(e) {
    e.preventDefault();
    
    if (!currentUser || currentUser.role !== 'teacher') {
        showSuccessMessage('❌ Error: Debes estar autenticado como docente para responder mensajes.');
        return;
    }
    
    const modal = document.getElementById('replyMessageModal');
    if (!modal) {
        showSuccessMessage('❌ Error: No se pudo encontrar el modal de respuesta.');
        return;
    }
    
    const messageId = modal.dataset.messageId;
    const replyContentInput = document.getElementById('replyContent');
    
    if (!replyContentInput) {
        showSuccessMessage('❌ Error: No se pudo encontrar el campo de respuesta.');
        return;
    }
    
    const replyContent = replyContentInput.value.trim();
    
    if (!replyContent) {
        showSuccessMessage('Por favor, escribe una respuesta antes de enviar.');
        return;
    }
    
    if (!messageId) {
        showSuccessMessage('❌ Error: No se pudo identificar el mensaje a responder.');
        return;
    }
    
    // Sanitize reply content
    const sanitizedContent = sanitizeInput(replyContent);
    
    const messages = JSON.parse(localStorage.getItem('anonymousMessages') || '[]');
    const messageIndex = messages.findIndex(m => m.id === messageId);
    
    if (messageIndex === -1) {
        showSuccessMessage('❌ Error: No se encontró el mensaje a responder.');
        return;
    }
    
    const reply = {
        id: Date.now().toString(),
        teacherId: currentUser.id,
        teacherName: currentUser.name,
        content: sanitizedContent,
        timestamp: new Date().toISOString()
    };
    
    if (!messages[messageIndex].replies) {
        messages[messageIndex].replies = [];
    }
    
    messages[messageIndex].replies.push(reply);
    localStorage.setItem('anonymousMessages', JSON.stringify(messages));
    
    // Clear cache when data changes
    dataCache.clearPattern('students');
    
    // Limpiar el campo de respuesta
    replyContentInput.value = '';
    
    closeReplyMessageModal();
    
    // Recargar mensajes si estamos en las vistas de mensajes
    if (currentView === 'teacherMessages') {
        loadTeacherMessages(currentMessageFilter);
    }
    if (currentView === 'studentMessages') {
        loadStudentMessages();
    }
    
    showSuccessMessage('¡Respuesta enviada exitosamente! ✅\n\nTu respuesta ha sido enviada al estudiante. El mensaje quedará registrado en la conversación.');
}

function loadStudentMessages() {
    if (!currentUser || currentUser.role !== 'student') return;
    
    const container = document.getElementById('studentMessagesContainer');
    if (!container) return;
    
    const messages = JSON.parse(localStorage.getItem('anonymousMessages') || '[]');
    const studentMessages = messages.filter(m => 
        m.studentId === currentUser.id && 
        m.studentClassCode === currentUser.classCode
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (studentMessages.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No has enviado ningún mensaje aún.</p>';
        return;
    }
    
    container.innerHTML = studentMessages.map(message => {
        const replies = message.replies || [];
        const hasReplies = replies.length > 0;
        
        let html = `
            <div class="message-card" style="background: #fff; border: 1px solid #e8eef5; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <div>
                        <strong style="color: #A3C9A8;">Tu mensaje #${message.anonymousId}</strong>
                        <div style="font-size: 0.85em; color: #999; margin-top: 5px;">
                            ${new Date(message.timestamp).toLocaleString('es-ES')}
                        </div>
                    </div>
                    ${hasReplies ? '<span style="background: #28a745; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85em;">Respondido</span>' : '<span style="background: #ffc107; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85em;">Pendiente</span>'}
                </div>
                <div style="color: #333; white-space: pre-wrap; margin-bottom: 15px; line-height: 1.6;">${message.content}</div>
        `;
        
        if (hasReplies) {
            html += '<div style="border-top: 1px solid #e8eef5; padding-top: 15px; margin-top: 15px;">';
            html += '<strong style="color: #A3C9A8; display: block; margin-bottom: 10px;">Respuesta del docente:</strong>';
            
            replies.forEach(reply => {
                html += `
                    <div style="background: #f8f9fc; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
                        <div style="color: #333; white-space: pre-wrap; line-height: 1.6;">${reply.content}</div>
                        <div style="font-size: 0.85em; color: #999; margin-top: 8px;">
                            ${reply.teacherName} - ${new Date(reply.timestamp).toLocaleString('es-ES')}
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
        }
        
        html += '</div>';
        return html;
    }).join('');
}

// Variable global para mantener el filtro activo
let currentMessageFilter = 'pending'; // 'pending' o 'replied'

// Search messages function
function searchMessages() {
    if (currentView === 'teacherMessages') {
        loadTeacherMessages(currentMessageFilter);
    }
}

// Debounced version of searchMessages
const debouncedSearchMessages = debounce(searchMessages, 300);

function showPendingMessages() {
    currentMessageFilter = 'pending';
    updateMessageFilterButtons();
    loadTeacherMessages('pending');
}

function showRepliedMessages() {
    currentMessageFilter = 'replied';
    updateMessageFilterButtons();
    loadTeacherMessages('replied');
}

function updateMessageFilterButtons() {
    const pendingBtn = document.getElementById('pendingMessagesBtn');
    const repliedBtn = document.getElementById('repliedMessagesBtn');
    
    if (!pendingBtn || !repliedBtn) return;
    
    if (currentMessageFilter === 'pending') {
        pendingBtn.className = 'btn-primary';
        repliedBtn.className = 'btn-secondary';
    } else {
        pendingBtn.className = 'btn-secondary';
        repliedBtn.className = 'btn-primary';
    }
}

function loadTeacherMessages(filter = null) {
    if (!currentUser || currentUser.role !== 'teacher') return;
    
    const container = document.getElementById('teacherMessagesContainer');
    if (!container) return;
    
    // Usar el filtro pasado o el filtro actual
    const activeFilter = filter || currentMessageFilter;
    
    // Get search term
    const searchInput = document.getElementById('messageSearchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    // Si el usuario es admin@munay.com, mostrar TODOS los mensajes demo
    const isAdmin = currentUser.email === 'admin@munay.com' || currentUser.email === 'munay@munay.com';
    
    let teacherMessages;
    if (isAdmin) {
        // El admin ve todos los mensajes de la clase demo
        const messages = JSON.parse(localStorage.getItem('anonymousMessages') || '[]');
        teacherMessages = messages.filter(m => 
            m.studentClassCode === 'CLSDEMO'
        ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else {
        // Para otros docentes: usar mensajes del cliente
        const clientMessages = getClientMessages();
        const clientClasses = getClientClasses();
        
        // Obtener todos los códigos de clase del docente del cliente
        const teacherClassCodes = clientClasses
            .filter(c => c.teacherId === currentUser.id)
            .map(c => c.code);
        
        // Filtrar mensajes de todas las clases del docente del cliente
        teacherMessages = clientMessages.filter(m => 
            teacherClassCodes.includes(m.studentClassCode)
        ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    
    // Apply search filter if exists
    if (searchTerm) {
        teacherMessages = teacherMessages.filter(m => {
            const messageContent = m.content.toLowerCase();
            const repliesContent = (m.replies || []).map(r => r.content.toLowerCase()).join(' ');
            return messageContent.includes(searchTerm) || repliesContent.includes(searchTerm);
        });
    }
    
    // Separar mensajes en respondidos y pendientes
    const pendingMessages = teacherMessages.filter(m => !m.replies || m.replies.length === 0);
    const repliedMessages = teacherMessages.filter(m => m.replies && m.replies.length > 0);
    
    // Determinar qué mensajes mostrar según el filtro
    let messagesToShow = [];
    let sectionTitle = '';
    let sectionColor = '';
    let emptyMessage = '';
    
    if (activeFilter === 'pending') {
        messagesToShow = pendingMessages;
        sectionTitle = typeof i18n !== 'undefined' ? i18n.t('messages.pending') : 'Mensajes Pendientes';
        sectionColor = '#dc3545';
        emptyMessage = searchTerm 
            ? (typeof i18n !== 'undefined' ? i18n.t('messages.noPendingFound') : 'No se encontraron mensajes pendientes que coincidan con tu búsqueda.')
            : (typeof i18n !== 'undefined' ? i18n.t('messages.noPending') : 'No hay mensajes pendientes de responder.');
    } else {
        messagesToShow = repliedMessages;
        sectionTitle = typeof i18n !== 'undefined' ? i18n.t('messages.replied') : 'Mensajes Respondidos';
        sectionColor = '#28a745';
        emptyMessage = searchTerm 
            ? (typeof i18n !== 'undefined' ? i18n.t('messages.noRepliedFound') : 'No se encontraron mensajes respondidos que coincidan con tu búsqueda.')
            : (typeof i18n !== 'undefined' ? i18n.t('messages.noReplied') : 'Aún no has respondido ningún mensaje.');
    }
    
    if (messagesToShow.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 3em; margin-bottom: 20px; opacity: 0.3;">
                    ${activeFilter === 'pending' ? '⏳' : '✅'}
                </div>
                <p style="color: #666; font-size: 1.1em;">${emptyMessage}</p>
            </div>
        `;
        return;
    }
    
    // Función para renderizar un mensaje
    const renderMessage = (message) => {
        const replies = message.replies || [];
        const hasReplies = replies.length > 0;
        
        // Análisis del mensaje
        const analysis = message.analysis || null;
        const riskLevel = analysis ? analysis.riskLevel : 'none';
        const riskColor = riskLevel === 'high' ? '#dc3545' : riskLevel === 'medium' ? '#ff9800' : riskLevel === 'low' ? '#ffc107' : '#28a745';
        const riskBg = riskLevel === 'high' ? '#fee' : riskLevel === 'medium' ? '#fff8e1' : riskLevel === 'low' ? '#fffbf0' : '#e8f5e9';
        
        let html = `
            <div class="message-card" style="background: #fff; border: 1px solid #e8eef5; border-radius: 12px; padding: 25px; margin-bottom: 20px; transition: all 0.3s ease;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <strong style="color: #A3C9A8; font-size: 1.1em;">${typeof i18n !== 'undefined' ? i18n.t('messages.anonymousMessage') : 'Mensaje Anónimo #'}${message.anonymousId}</strong>
                        <div style="font-size: 0.85em; color: #999; margin-top: 5px;">
                            ${new Date(message.timestamp).toLocaleString(typeof i18n !== 'undefined' && i18n.currentLanguage === 'en' ? 'en-US' : 'es-ES')}
                        </div>
                        ${analysis && analysis.riskLevel !== 'none' ? `
                            <div style="margin-top: 8px;">
                                <span style="background: ${riskBg}; color: ${riskColor}; padding: 4px 10px; border-radius: 12px; font-size: 0.85em; font-weight: 600; border: 1px solid ${riskColor};">
                                    ${typeof i18n !== 'undefined' ? i18n.t('messages.risk') : 'Riesgo'}: ${riskLevel === 'high' ? (typeof i18n !== 'undefined' ? i18n.t('messages.riskHigh') : 'Alto') : riskLevel === 'medium' ? (typeof i18n !== 'undefined' ? i18n.t('messages.riskMedium') : 'Medio') : (typeof i18n !== 'undefined' ? i18n.t('messages.riskLow') : 'Bajo')}
                                </span>
                                ${analysis.score !== null ? `
                                    <span style="margin-left: 8px; color: #666; font-size: 0.85em;">${typeof i18n !== 'undefined' ? i18n.t('messages.score') : 'Score'}: ${analysis.score}/100</span>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                    ${hasReplies ? `<span style="background: #28a745; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.9em; font-weight: 500;">${typeof i18n !== 'undefined' ? i18n.t('messages.replied') : 'Respondido'}</span>` : `<span style="background: #dc3545; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.9em; font-weight: 500;">${typeof i18n !== 'undefined' ? i18n.t('messages.pending') : 'Pendiente'}</span>`}
                </div>
                <div style="color: #333; white-space: pre-wrap; margin-bottom: 20px; line-height: 1.7; font-size: 1.05em;">${sanitizeInput(message.content || '')}</div>
        `;
        
        // Mostrar keywords detectadas
        // Análisis de keywords removido - se implementará más adelante
        
        if (hasReplies) {
            html += '<div style="border-top: 2px solid #e8eef5; padding-top: 20px; margin-top: 20px;">';
            html += `<strong style="color: #A3C9A8; display: block; margin-bottom: 15px; font-size: 1.05em;">${typeof i18n !== 'undefined' ? i18n.t('messages.yourReplies') : 'Tus respuestas:'}</strong>`;
            
            replies.forEach(reply => {
                html += `
                    <div style="background: linear-gradient(135deg, #f8f9fc 0%, #ffffff 100%); padding: 15px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #A3C9A8;">
                        <div style="color: #333; white-space: pre-wrap; line-height: 1.7;">${sanitizeInput(reply.content || '')}</div>
                        <div style="font-size: 0.85em; color: #666; margin-top: 10px; font-weight: 500;">
                            ${new Date(reply.timestamp).toLocaleString(typeof i18n !== 'undefined' && i18n.currentLanguage === 'en' ? 'en-US' : 'es-ES')}
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
        }
        
        html += `
            <div style="margin-top: 20px;">
                <button class="btn-primary" onclick="openReplyMessageModal('${escapeHtmlAttribute(message.id)}')" style="padding: 10px 25px; font-size: 1em;">
                    ${hasReplies ? (typeof i18n !== 'undefined' ? i18n.t('messages.viewAddReply') : 'Ver/Agregar Respuesta') : (typeof i18n !== 'undefined' ? i18n.t('messages.reply') : 'Responder')}
                </button>
            </div>
        `;
        
        html += '</div>';
        return html;
    };
    
    // Construir HTML con la sección seleccionada
    let html = `
        <div>
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 3px solid ${sectionColor};">
                <h3 style="color: #1a2332; font-size: 1.5em; font-weight: 700; margin: 0;">${sectionTitle}</h3>
                <span style="background: ${sectionColor}; color: white; padding: 6px 15px; border-radius: 20px; font-size: 0.9em; font-weight: 600;">
                    ${messagesToShow.length} ${messagesToShow.length === 1 ? (typeof i18n !== 'undefined' ? i18n.t('messages.message') : 'mensaje') : (typeof i18n !== 'undefined' ? i18n.t('messages.messages') : 'mensajes')}
                </span>
            </div>
            <div>
                ${messagesToShow.map(message => renderMessage(message)).join('')}
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Actualizar botones al cargar
    updateMessageFilterButtons();
}

// Cerrar modales al hacer click fuera
window.onclick = function(event) {
    const surveyModal = document.getElementById('surveyModal');
    const activityModal = document.getElementById('activityModal');
    const studentModal = document.getElementById('studentDetailModal');
    const sendMessageModal = document.getElementById('sendMessageModal');
    const replyMessageModal = document.getElementById('replyMessageModal');
    const rewardsModal = document.getElementById('rewardsModal');
    const createGrowthSpaceModal = document.getElementById('createGrowthSpaceModal');
    const addStudentsToSpaceModal = document.getElementById('addStudentsToSpaceModal');
    if (event.target === surveyModal) {
        closeSurveyModal();
    }
    if (event.target === activityModal) {
        closeActivityModal();
    }
    if (event.target === studentModal) {
        closeStudentDetailModal();
    }
    if (event.target === createGrowthSpaceModal) {
        closeCreateGrowthSpaceModal();
    }
    if (event.target === addStudentsToSpaceModal) {
        closeAddStudentsToSpaceModal();
    }
    if (event.target === sendMessageModal) {
        closeSendMessageModal();
    }
    if (event.target === replyMessageModal) {
        closeReplyMessageModal();
    }
    if (event.target === rewardsModal) {
        closeRewardsModal();
    }
    
    const badgeDetailModal = document.getElementById('badgeDetailModal');
    if (event.target === badgeDetailModal) {
        closeBadgeDetailModal();
    }
    
    const createClassCodeModal = document.getElementById('createClassCodeModal');
    if (event.target === createClassCodeModal) {
        closeCreateClassCodeModal();
    }
}

// ========== SISTEMA DE CALIFICACIONES ACADÉMICAS ==========

// Obtener todas las calificaciones
function getAllGrades() {
    return JSON.parse(localStorage.getItem('academicGrades') || '[]');
}

// Guardar calificaciones
function saveGrades(grades) {
    localStorage.setItem('academicGrades', JSON.stringify(grades));
}

// Obtener calificaciones de estudiantes del docente actual
function getTeacherGrades() {
    if (!currentUser || currentUser.role !== 'teacher') return [];
    
    const grades = getAllGrades();
    const students = getClassStudents();
    const studentIds = students.map(s => s.id);
    
    return grades.filter(g => studentIds.includes(g.studentId));
}

// Obtener nombre de asignatura
function getSubjectName(subject) {
    const names = {
        'matematicas': 'Matemáticas',
        'lengua': 'Lengua',
        'ciencias': 'Ciencias',
        'sociales': 'Ciencias Sociales',
        'ingles': 'Inglés',
        'educacion_fisica': 'Educación Física'
    };
    return names[subject] || subject;
}

// Abrir modal de agregar calificación
function openAddGradeModal() {
    const modal = document.getElementById('addGradeModal');
    const select = document.getElementById('gradeStudentSelect');
    
    if (!modal || !select) return;
    
    // Cargar estudiantes
    const students = getClassStudents();
    select.innerHTML = '<option value="">Seleccionar estudiante...</option>';
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = student.name;
        select.appendChild(option);
    });
    
    // Establecer fecha por defecto
    document.getElementById('gradeDateInput').valueAsDate = new Date();
    
    modal.style.display = 'block';
    
    // Agregar event listener al formulario
    const form = document.getElementById('addGradeForm');
    form.onsubmit = handleAddGrade;
}

// Cerrar modal de agregar calificación
function closeAddGradeModal() {
    const modal = document.getElementById('addGradeModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('addGradeForm').reset();
    }
}

// Manejar agregar calificación
function handleAddGrade(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('gradeStudentSelect').value;
    const subject = document.getElementById('gradeSubjectSelect').value;
    const grade = parseFloat(document.getElementById('gradeInput').value);
    const type = document.getElementById('gradeTypeSelect').value;
    const date = document.getElementById('gradeDateInput').value;
    const notes = document.getElementById('gradeNotesInput').value.trim();
    
    if (!studentId || !subject || grade === undefined) {
        showMessage('Por favor completa todos los campos requeridos.', 'error');
        return;
    }
    
    const grades = getAllGrades();
    const newGrade = {
        id: Date.now().toString(),
        studentId: studentId,
        subject: subject,
        grade: grade,
        type: type,
        date: date,
        notes: notes,
        timestamp: new Date().toISOString()
    };
    
    grades.push(newGrade);
    saveGrades(grades);
    
    closeAddGradeModal();
    loadGradesData();
    
    showSuccessMessage('✅ Calificación agregada exitosamente.');
}

// Cargar datos de calificaciones
function loadGradesData() {
    loadAcademicAlerts();
    loadGradesStats();
    loadGradesTable();
}

// Cargar alertas académicas
function loadAcademicAlerts() {
    const container = document.getElementById('academicAlertsContainer');
    if (!container) return;
    
    const alerts = generateAcademicAlerts();
    
    if (alerts.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;"><p>✅ No hay alertas académicas en este momento.</p></div>';
        return;
    }
    
    container.innerHTML = '';
    
    alerts.forEach(alert => {
        const alertCard = document.createElement('div');
        alertCard.className = `alert-card ${alert.severity}`;
        alertCard.style.marginBottom = '16px';
        
        alertCard.innerHTML = `
            <div class="alert-title">${alert.title}</div>
            <div class="alert-message">${alert.message}</div>
            <div style="margin-top: 12px; font-size: 0.85em; color: #666;">
                <strong>Estudiante:</strong> ${alert.studentName} | 
                <strong>Asignatura:</strong> ${alert.subject} |
                <strong>Score de Bienestar:</strong> ${alert.wellbeingScore !== null ? alert.wellbeingScore : 'N/A'}
            </div>
        `;
        
        container.appendChild(alertCard);
    });
}

// Generar alertas académicas
function generateAcademicAlerts() {
    const alerts = [];
    const students = getClassStudents();
    const grades = getTeacherGrades();
    
    students.forEach(student => {
        const studentGrades = grades.filter(g => g.studentId === student.id);
        if (studentGrades.length === 0) return;
        
        // Agrupar por asignatura
        const subjects = [...new Set(studentGrades.map(g => g.subject))];
        
        subjects.forEach(subject => {
            const subjectGrades = studentGrades
                .filter(g => g.subject === subject)
                .sort((a, b) => new Date(a.date) - new Date(b.date));
            
            if (subjectGrades.length < 2) return;
            
            // Calcular promedio reciente vs anterior
            const recentGrades = subjectGrades.slice(-3);
            const previousGrades = subjectGrades.slice(-6, -3);
            
            if (recentGrades.length === 0) return;
            
            const recentAvg = recentGrades.reduce((sum, g) => sum + g.grade, 0) / recentGrades.length;
            const previousAvg = previousGrades.length > 0 
                ? previousGrades.reduce((sum, g) => sum + g.grade, 0) / previousGrades.length
                : recentAvg;
            
            const drop = previousAvg - recentAvg;
            const dropPercentage = previousAvg > 0 ? (drop / previousAvg) * 100 : 0;
            
            // Alerta por caída significativa
            if (dropPercentage > 20 && recentAvg < 70) {
                alerts.push({
                    studentId: student.id,
                    studentName: student.name,
                    subject: getSubjectName(subject),
                    severity: 'critical',
                    title: `⚠️ Caída Crítica en ${getSubjectName(subject)}`,
                    message: `${student.name} ha tenido una caída del ${dropPercentage.toFixed(1)}% en ${getSubjectName(subject)}. Promedio actual: ${recentAvg.toFixed(1)}/100`,
                    wellbeingScore: calculateAverageScore(student.id)
                });
            } else if (dropPercentage > 15) {
                alerts.push({
                    studentId: student.id,
                    studentName: student.name,
                    subject: getSubjectName(subject),
                    severity: 'moderate',
                    title: `📉 Caída Moderada en ${getSubjectName(subject)}`,
                    message: `${student.name} muestra una tendencia descendente en ${getSubjectName(subject)}. Diferencia: ${dropPercentage.toFixed(1)}%`,
                    wellbeingScore: calculateAverageScore(student.id)
                });
            }
            
            // Alerta por bajo rendimiento sostenido
            if (recentAvg < 60 && subjectGrades.length >= 3) {
                alerts.push({
                    studentId: student.id,
                    studentName: student.name,
                    subject: getSubjectName(subject),
                    severity: 'critical',
                    title: `🔴 Bajo Rendimiento en ${getSubjectName(subject)}`,
                    message: `${student.name} mantiene un promedio bajo (${recentAvg.toFixed(1)}/100) en ${getSubjectName(subject)} durante las últimas evaluaciones.`,
                    wellbeingScore: calculateAverageScore(student.id)
                });
            }
        });
        
        // Alerta por tendencia descendente general
        const allGrades = studentGrades.sort((a, b) => new Date(a.date) - new Date(b.date));
        if (allGrades.length >= 4) {
            const recent = allGrades.slice(-3);
            const previous = allGrades.slice(-6, -3);
            
            if (previous.length > 0) {
                const recentAvg = recent.reduce((sum, g) => sum + g.grade, 0) / recent.length;
                const previousAvg = previous.reduce((sum, g) => sum + g.grade, 0) / previous.length;
                const drop = previousAvg - recentAvg;
                
                if (drop > 10) {
                    alerts.push({
                        studentId: student.id,
                        studentName: student.name,
                        subject: 'General',
                        severity: 'moderate',
                        title: `📉 Tendencia Descendente General`,
                        message: `${student.name} muestra una tendencia descendente en su rendimiento académico general.`,
                        wellbeingScore: calculateAverageScore(student.id)
                    });
                }
            }
        }
    });
    
    // Ordenar por severidad
    const severityOrder = { critical: 0, moderate: 1, info: 2 };
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    
    return alerts;
}

// Cargar estadísticas de calificaciones
function loadGradesStats() {
    const container = document.getElementById('gradesStatsContainer');
    if (!container) return;
    
    const grades = getTeacherGrades();
    const students = getClassStudents();
    const avgGrade = grades.length > 0
        ? grades.reduce((sum, g) => sum + g.grade, 0) / grades.length
        : 0;
    const alerts = generateAcademicAlerts();
    
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-number">${grades.length}</div>
            <div class="stat-label">Total Calificaciones</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${students.length}</div>
            <div class="stat-label">Estudiantes</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${avgGrade.toFixed(1)}</div>
            <div class="stat-label">Promedio General</div>
        </div>
        <div class="stat-card ${alerts.length > 0 ? 'warning' : 'success'}">
            <div class="stat-number">${alerts.length}</div>
            <div class="stat-label">Alertas Activas</div>
        </div>
    `;
}

// Cargar tabla de calificaciones
function loadGradesTable() {
    const tbody = document.getElementById('gradesTableBody');
    if (!tbody) return;
    
    const grades = getTeacherGrades().sort((a, b) => new Date(b.date) - new Date(a.date));
    const students = getClassStudents();
    
    if (grades.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #666;">No hay calificaciones registradas aún.</td></tr>';
        return;
    }
    
    tbody.innerHTML = grades.slice(0, 20).map(grade => {
        const student = students.find(s => s.id === grade.studentId);
        const studentName = student ? student.name : 'Desconocido';
        const badgeClass = grade.grade >= 90 ? 'grade-excellent' : 
                         grade.grade >= 75 ? 'grade-good' : 
                         grade.grade >= 60 ? 'grade-warning' : 'grade-danger';
        
        return `
            <tr>
                <td>${studentName}</td>
                <td>${getSubjectName(grade.subject)}</td>
                <td><span class="grade-badge ${badgeClass}">${grade.grade}</span></td>
                <td>${grade.type}</td>
                <td>${new Date(grade.date).toLocaleDateString('es-ES')}</td>
                <td>
                    <button class="btn-secondary" onclick="deleteGrade('${escapeHtmlAttribute(grade.id)}')" style="padding: 4px 12px; font-size: 0.85em;">Eliminar</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Eliminar calificación
async function deleteGrade(gradeId) {
    const confirmed = await showConfirmation('¿Estás seguro de que deseas eliminar esta calificación?');
    if (!confirmed) return;
    
    const grades = getAllGrades();
    const filtered = grades.filter(g => g.id !== gradeId);
    saveGrades(filtered);
    
    loadGradesData();
    showSuccessMessage('✅ Calificación eliminada exitosamente.');
}

// Agregar estilos CSS para alertas académicas si no existen
if (!document.querySelector('#academicAlertsStyles')) {
    const style = document.createElement('style');
    style.id = 'academicAlertsStyles';
    style.textContent = `
        .alert-card {
            background: #FFF8E1;
            border-left: 4px solid #FFB800;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
        }
        .alert-card.critical {
            background: #FFEBEE;
            border-left-color: #DC3545;
        }
        .alert-card.moderate {
            background: #FFF8E1;
            border-left-color: #FFB800;
        }
        .alert-card.info {
            background: #E3F2FD;
            border-left-color: #2196F3;
        }
        .alert-title {
            font-weight: 600;
            margin-bottom: 8px;
            color: #1A1A1A;
        }
        .alert-message {
            color: #666;
            font-size: 0.9em;
        }
        .grade-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.9em;
        }
        .grade-excellent {
            background: #E8F5E9;
            color: #28A745;
        }
        .grade-good {
            background: #E3F2FD;
            color: #2196F3;
        }
        .grade-warning {
            background: #FFF8E1;
            color: #FFB800;
        }
        .grade-danger {
            background: #FFEBEE;
            color: #DC3545;
        }
    `;
    document.head.appendChild(style);
}

// ========== ANÁLISIS DE VALORES EMOCIONALES ==========

// Analizar valores emocionales basados en las respuestas de los tests y encuestas de bienestar
function analyzeEmotionalValues(monthFilter = '', ageFilter = '', genderFilter = '', classCodeFilter = '') {
    // Usar datos del cliente del docente
    const allActivities = getClientActivities();
    const allSurveyResponses = getClientSurveyResponses();
    const teacherStudents = getClassStudents(classCodeFilter || null);
    
    // Si el usuario es admin@munay.com, usar la clase demo
    const isAdmin = currentUser && (currentUser.email === 'admin@munay.com' || currentUser.email === 'munay@munay.com');
    let teacherClasses = isAdmin 
        ? ['CLSDEMO']
        : getClientClasses()
            .filter(c => c.teacherId === currentUser.id)
            .map(c => c.code);
    
    // Si hay filtro de código de clase, usar solo ese código
    if (classCodeFilter) {
        teacherClasses = [classCodeFilter];
    }
    
    // Función auxiliar para filtrar por mes, edad y género
    const matchesFilters = (item, student, dateField = 'completedAt') => {
        if (!teacherStudents.some(s => s.id === item.studentId)) return false;
        if (!student) return false;
        
        // Filtro por mes
        if (monthFilter) {
            const itemDate = new Date(item[dateField]);
            const itemMonth = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
            if (itemMonth !== monthFilter) return false;
        }
        
        // Filtro por edad
        if (ageFilter) {
            const ageGroup = getAgeGroup(student.age);
            if (ageGroup !== ageFilter) return false;
        }
        
        // Filtro por género
        if (genderFilter && student.gender !== genderFilter) return false;
        
        return true;
    };
    
    // Filtrar actividades por mes, edad y género
    let filteredActivities = allActivities.filter(activity => {
        const student = teacherStudents.find(s => s.id === activity.studentId);
        return matchesFilters(activity, student);
    });
    
    // Filtrar encuestas de bienestar por mes, edad y género
    let filteredSurveys = allSurveyResponses.filter(survey => {
        const student = teacherStudents.find(s => s.id === survey.studentId);
        return matchesFilters(survey, student, 'completedAt');
    });
    
    // Inicializar valores emocionales
    const emotionalValues = {
        empathy: { scores: [], count: 0 },
        selfCare: { scores: [], count: 0 },
        conflictResolution: { scores: [], count: 0 },
        compassion: { scores: [], count: 0 },
        selfAwareness: { scores: [], count: 0 },
        emotionalRegulation: { scores: [], count: 0 }
    };
    
    // Analizar encuestas de bienestar
    // Las encuestas de bienestar contribuyen principalmente a autocuidado, autoconocimiento y regulación emocional
    filteredSurveys.forEach(survey => {
        if (survey.score !== undefined && survey.score !== null) {
            // Limitar el score a 0-100 antes de usarlo
            const score = Math.max(0, Math.min(100, survey.score));
            
            // Autocuidado - las encuestas de bienestar miden directamente el autocuidado
            emotionalValues.selfCare.scores.push(score);
            emotionalValues.selfCare.count++;
            
            // Autoconocimiento - el bienestar general refleja autoconocimiento
            emotionalValues.selfAwareness.scores.push(score);
            emotionalValues.selfAwareness.count++;
            
            // Regulación Emocional - el bienestar está relacionado con la capacidad de regular emociones
            emotionalValues.emotionalRegulation.scores.push(score);
            emotionalValues.emotionalRegulation.count++;
            
            // También puede contribuir a empatía y compasión (bienestar emocional facilita la empatía)
            // Pero con un peso menor (70% del score para reflejar que es indirecto)
            const indirectScore = Math.max(0, Math.min(100, Math.round(score * 0.7)));
            emotionalValues.empathy.scores.push(indirectScore);
            emotionalValues.empathy.count++;
            emotionalValues.compassion.scores.push(indirectScore);
            emotionalValues.compassion.count++;
        }
    });
    
    // Analizar cada actividad
    filteredActivities.forEach(activity => {
        const activityTitle = (activity.activityTitle || '').toLowerCase();
        const activityId = (activity.activityId || '').toLowerCase();
        
        // Empatía - de tests de empatía
        // Detectar por ID o por palabras clave en el título
        if (activityId.includes('empathy') || 
            activityId.includes('empatía') || 
            activityId.includes('empatia') ||
            activityTitle.includes('empatía') || 
            activityTitle.includes('empatia') ||
            activityTitle.includes('comprensión') ||
            activityTitle.includes('entender') ||
            activityTitle.includes('conexión emocional') ||
            activityTitle.includes('corazones que sienten')) {
            if (activity.testScore !== undefined && activity.testScore !== null) {
                const score = Math.max(0, Math.min(100, activity.testScore));
                emotionalValues.empathy.scores.push(score);
                emotionalValues.empathy.count++;
            }
        }
        
        // Autocuidado - de tests de autocuidado
        if (activityId.includes('self_care') || 
            activityId.includes('autocuidado') ||
            activityTitle.includes('autocuidado') ||
            activityTitle.includes('bienestar') ||
            activityTitle.includes('cuidar') ||
            activityTitle.includes('cuídate') ||
            activityTitle.includes('salud')) {
            if (activity.testScore !== undefined && activity.testScore !== null) {
                const score = Math.max(0, Math.min(100, activity.testScore));
                emotionalValues.selfCare.scores.push(score);
                emotionalValues.selfCare.count++;
            }
        }
        
        // Resolución de Conflictos - de tests de resolución
        if (activityId.includes('conflict') || 
            activityId.includes('resolución') ||
            activityTitle.includes('conflictos') || 
            activityTitle.includes('resolución') ||
            activityTitle.includes('resolver') ||
            activityTitle.includes('diálogo') ||
            activityTitle.includes('paz') ||
            activityTitle.includes('mediación')) {
            if (activity.testScore !== undefined && activity.testScore !== null) {
                const score = Math.max(0, Math.min(100, activity.testScore));
                emotionalValues.conflictResolution.scores.push(score);
                emotionalValues.conflictResolution.count++;
            }
        }
        
        // Compasión - del simulador ético
        if (activityId.includes('ethical') || 
            activityId.includes('simulator') || 
            activity.ethicalScore !== undefined ||
            activityTitle.includes('ético') ||
            activityTitle.includes('decisiones') ||
            activityTitle.includes('aventuras') ||
            activityTitle.includes('valores')) {
            const rawScore = activity.ethicalScore || activity.simulatorResults?.averageScore;
            if (rawScore !== undefined && rawScore !== null) {
                const score = Math.max(0, Math.min(100, rawScore));
                emotionalValues.compassion.scores.push(score);
                emotionalValues.compassion.count++;
            }
        }
        
        // Autoconocimiento - promedio de todos los tests
        if (activity.testScore !== undefined && activity.testScore !== null) {
            const score = Math.max(0, Math.min(100, activity.testScore));
            emotionalValues.selfAwareness.scores.push(score);
            emotionalValues.selfAwareness.count++;
        }
        
        // Regulación Emocional - basado en respuestas de resolución de conflictos y autocuidado
        if ((activityId.includes('conflict') || 
             activityId.includes('self_care') ||
             activityTitle.includes('conflictos') ||
             activityTitle.includes('resolución') ||
             activityTitle.includes('autocuidado') ||
             activityTitle.includes('bienestar')) && 
            activity.testScore !== undefined && activity.testScore !== null) {
            const score = Math.max(0, Math.min(100, activity.testScore));
            emotionalValues.emotionalRegulation.scores.push(score);
            emotionalValues.emotionalRegulation.count++;
        }
    });
    
    // Calcular promedios
    const results = {};
    Object.keys(emotionalValues).forEach(key => {
        const data = emotionalValues[key];
        if (data.scores.length > 0) {
            // Filtrar y limitar scores a 0-100 antes de calcular el promedio
            const validScores = data.scores
                .map(score => Math.max(0, Math.min(100, score))) // Limitar cada score a 0-100
                .filter(score => !isNaN(score) && isFinite(score)); // Eliminar valores inválidos
            
            if (validScores.length > 0) {
                const average = validScores.reduce((a, b) => a + b, 0) / validScores.length;
                // Asegurar que el promedio también esté entre 0 y 100
                results[key] = {
                    average: Math.max(0, Math.min(100, Math.round(average))),
                    count: validScores.length,
                    scores: validScores
                };
            } else {
                results[key] = {
                    average: 0,
                    count: 0,
                    scores: []
                };
            }
        } else {
            results[key] = {
                average: 0,
                count: 0,
                scores: []
            };
        }
    });
    
    return results;
}

// Cargar y mostrar valores emocionales
// Función para generar opciones de mes dinámicamente
function generateMonthOptions() {
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    
    // Generar desde enero 2025 hasta el mes actual
    const startYear = 2025;
    const startMonth = 0; // Enero
    
    const options = [];
    let year = startYear;
    let month = startMonth;
    
    while (year < currentYear || (year === currentYear && month <= currentMonth)) {
        const monthValue = `${year}-${String(month + 1).padStart(2, '0')}`;
        const monthLabel = `${monthNames[month]} ${year}`;
        options.push({ value: monthValue, label: monthLabel });
        
        month++;
        if (month > 11) {
            month = 0;
            year++;
        }
    }
    
    return options;
}

// Función para poblar los selects de mes
// Poblar filtros de código de clase
function populateClassCodeFilters() {
    if (!currentUser || !currentUser.id) {
        console.error('❌ Error: currentUser no está definido en populateClassCodeFilters');
        return;
    }
    
    // Caso especial para admin@munay.com: incluir CLSDEMO
    const isAdmin = currentUser.email === 'admin@munay.com' || currentUser.email === 'munay@munay.com';
    
    // Obtener todas las clases del docente actual (solo del cliente)
    let teacherClasses = getClientClasses().filter(c => c.teacherId === currentUser.id);
    
    if (isAdmin) {
        const classes = JSON.parse(localStorage.getItem('classes') || '[]');
        const clsDemo = classes.find(c => c.code === 'CLSDEMO');
        if (clsDemo && !teacherClasses.some(c => c.code === 'CLSDEMO')) {
            teacherClasses.push(clsDemo);
        } else if (!clsDemo) {
            // Si CLSDEMO no existe, crearlo virtualmente
            teacherClasses.push({
                code: 'CLSDEMO',
                name: 'Colegio Demo - 50 Estudiantes',
                teacherId: currentUser.id,
                teacherName: currentUser.name
            });
        }
    }
    
    // Poblar el filtro de análisis visual
    const analysisClassCodeFilter = document.getElementById('analysisClassCodeFilter');
    if (analysisClassCodeFilter) {
        const currentValue = analysisClassCodeFilter.value;
        const allClassesText = typeof i18n !== 'undefined' ? i18n.t('filters.allClasses') : 'Todas las clases';
        analysisClassCodeFilter.innerHTML = `<option value="">${allClassesText}</option>`;
        
        teacherClasses.forEach(classData => {
            const opt = document.createElement('option');
            opt.value = classData.code;
            opt.textContent = `${classData.name || 'Sin nombre'} (${classData.code})`;
            analysisClassCodeFilter.appendChild(opt);
        });
        
        // Restaurar el valor seleccionado si existe
        if (currentValue && teacherClasses.some(c => c.code === currentValue)) {
            analysisClassCodeFilter.value = currentValue;
        }
    }
    
    // Poblar el filtro de valores emocionales
    const emotionalValuesClassCodeFilter = document.getElementById('emotionalValuesClassCodeFilter');
    if (emotionalValuesClassCodeFilter) {
        const currentValue = emotionalValuesClassCodeFilter.value;
        const allClassesText = typeof i18n !== 'undefined' ? i18n.t('filters.allClasses') : 'Todas las clases';
        emotionalValuesClassCodeFilter.innerHTML = `<option value="">${allClassesText}</option>`;
        
        teacherClasses.forEach(classData => {
            const opt = document.createElement('option');
            opt.value = classData.code;
            opt.textContent = `${classData.name || 'Sin nombre'} (${classData.code})`;
            emotionalValuesClassCodeFilter.appendChild(opt);
        });
        
        // Restaurar el valor seleccionado si existe
        if (currentValue && teacherClasses.some(c => c.code === currentValue)) {
            emotionalValuesClassCodeFilter.value = currentValue;
        }
    }
}

function populateMonthFilters() {
    const monthOptions = generateMonthOptions();
    
    // Poblar el filtro de análisis visual
    const analysisMonthFilter = document.getElementById('analysisMonthFilter');
    if (analysisMonthFilter) {
        const currentValue = analysisMonthFilter.value;
        const allMonthsText = typeof i18n !== 'undefined' ? i18n.t('filters.allMonths') : 'Todos los meses';
        analysisMonthFilter.innerHTML = `<option value="">${allMonthsText}</option>`;
        monthOptions.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.label;
            analysisMonthFilter.appendChild(opt);
        });
        // Restaurar el valor seleccionado si existe
        if (currentValue) {
            analysisMonthFilter.value = currentValue;
        }
    }
    
    // Poblar el filtro de valores emocionales
    const emotionalValuesMonthFilter = document.getElementById('emotionalValuesMonthFilter');
    if (emotionalValuesMonthFilter) {
        const currentValue = emotionalValuesMonthFilter.value;
        const allMonthsText = typeof i18n !== 'undefined' ? i18n.t('filters.allMonths') : 'Todos los meses';
        emotionalValuesMonthFilter.innerHTML = `<option value="">${allMonthsText}</option>`;
        monthOptions.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.label;
            emotionalValuesMonthFilter.appendChild(opt);
        });
        // Restaurar el valor seleccionado si existe
        if (currentValue) {
            emotionalValuesMonthFilter.value = currentValue;
        }
    }
}

function loadEmotionalValues() {
    if (!currentUser || currentUser.role !== 'teacher') return;
    
    // NO repoblar los filtros aquí para evitar parpadeo
    // Los filtros solo se poblan cuando se carga la vista inicialmente
    
    // Verificar que la sección esté visible
    const emotionalSection = document.getElementById('emotionalValuesSection');
    if (!emotionalSection || emotionalSection.offsetParent === null) {
        // Si no está visible, intentar de nuevo después de un breve delay
        setTimeout(loadEmotionalValues, 100);
        return;
    }
    
    const classCodeFilter = document.getElementById('emotionalValuesClassCodeFilter')?.value || '';
    const monthFilter = document.getElementById('emotionalValuesMonthFilter')?.value || '';
    const ageFilter = document.getElementById('emotionalValuesAgeFilter')?.value || '';
    const genderFilter = document.getElementById('emotionalValuesGenderFilter')?.value || '';
    
    const values = analyzeEmotionalValues(monthFilter, ageFilter, genderFilter, classCodeFilter);
    
    // Actualizar valores numéricos con verificación de existencia
    const empathyEl = document.getElementById('empathyValue');
    const selfCareEl = document.getElementById('selfCareValue');
    const conflictEl = document.getElementById('conflictResolutionValue');
    const compassionEl = document.getElementById('compassionValue');
    const selfAwarenessEl = document.getElementById('selfAwarenessValue');
    const emotionalRegEl = document.getElementById('emotionalRegulationValue');
    
    // Actualizar valores numéricos con formato mejorado
    const updateValue = (el, value, countEl, count, progressFillEl) => {
        if (el) {
            if (value > 0) {
                el.textContent = `${value}/100`;
                el.style.display = 'block';
            } else {
                el.textContent = '-';
                el.style.display = 'block';
            }
        }
        if (countEl) {
            if (count > 0) {
                if (typeof i18n !== 'undefined') {
                    const evaluationsText = count !== 1 ? i18n.t('stats.evaluations') : i18n.t('stats.evaluation');
                    countEl.textContent = `${count} ${evaluationsText}`;
                } else {
                    countEl.textContent = `${count} evaluación${count !== 1 ? 'es' : ''}`;
                }
            } else {
                const noDataText = typeof i18n !== 'undefined' ? i18n.t('forms.noData') : 'Sin datos';
                countEl.textContent = noDataText;
            }
        }
        if (progressFillEl && value > 0) {
            progressFillEl.style.width = `${value}%`;
        } else if (progressFillEl) {
            progressFillEl.style.width = '0%';
        }
    };
    
    updateValue(empathyEl, values.empathy.average, document.getElementById('empathyCount'), values.empathy.count, document.getElementById('empathyProgressFill'));
    updateValue(selfCareEl, values.selfCare.average, document.getElementById('selfCareCount'), values.selfCare.count, document.getElementById('selfCareProgressFill'));
    updateValue(conflictEl, values.conflictResolution.average, document.getElementById('conflictResolutionCount'), values.conflictResolution.count, document.getElementById('conflictResolutionProgressFill'));
    updateValue(compassionEl, values.compassion.average, document.getElementById('compassionCount'), values.compassion.count, document.getElementById('compassionProgressFill'));
    updateValue(selfAwarenessEl, values.selfAwareness.average, document.getElementById('selfAwarenessCount'), values.selfAwareness.count, document.getElementById('selfAwarenessProgressFill'));
    updateValue(emotionalRegEl, values.emotionalRegulation.average, document.getElementById('emotionalRegulationCount'), values.emotionalRegulation.count, document.getElementById('emotionalRegulationProgressFill'));
    
    // Renderizar gráficos individuales con un pequeño delay para asegurar que los canvas estén listos
    setTimeout(() => {
        renderEmotionalValueChart('empathyChart', values.empathy.scores, '#28a745');
        renderEmotionalValueChart('selfCareChart', values.selfCare.scores, '#A3C9A8');
        renderEmotionalValueChart('conflictResolutionChart', values.conflictResolution.scores, '#ffc107');
        renderEmotionalValueChart('compassionChart', values.compassion.scores, '#dc3545');
        renderEmotionalValueChart('selfAwarenessChart', values.selfAwareness.scores, '#17a2b8');
        renderEmotionalValueChart('emotionalRegulationChart', values.emotionalRegulation.scores, '#6f42c1');
    }, 50);
}

// Renderizar gráfico de distribución para un valor emocional (mejorado)
function renderEmotionalValueChart(canvasId, scores, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const { ctx, width, height } = setupHighQualityCanvas(canvas);
    
    // Fondo con gradiente sutil
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#ffffff');
    bgGradient.addColorStop(1, '#f8f9fc');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    if (scores.length === 0) {
        ctx.fillStyle = '#999';
        ctx.font = '11px Nunito, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Sin datos disponibles', width / 2, height / 2);
        return;
    }
    
    // Crear histograma con rangos más detallados
    const bins = [0, 20, 40, 60, 80, 100];
    const binCounts = new Array(bins.length - 1).fill(0);
    
    scores.forEach(score => {
        for (let i = 0; i < bins.length - 1; i++) {
            if (score >= bins[i] && score < bins[i + 1]) {
                binCounts[i]++;
                break;
            }
        }
        if (score === 100) binCounts[binCounts.length - 1]++;
    });
    
    const maxCount = Math.max(...binCounts, 1);
    const padding = { top: 15, right: 10, bottom: 35, left: 10 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const barWidth = chartWidth / binCounts.length;
    const barSpacing = 4;
    
    // Dibujar línea de referencia en el medio
    ctx.strokeStyle = '#e8eef5';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartHeight / 2);
    ctx.lineTo(width - padding.right, padding.top + chartHeight / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Dibujar barras mejoradas
    binCounts.forEach((count, index) => {
        const barHeight = (count / maxCount) * chartHeight;
        const x = padding.left + index * barWidth + barSpacing / 2;
        const y = padding.top + chartHeight - barHeight;
        const actualBarWidth = barWidth - barSpacing;
        
        // Gradiente para la barra
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color + 'CC');
        
        // Sombra sutil
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(x + 1, y + 1, actualBarWidth, barHeight);
        
        // Barra principal
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, actualBarWidth, barHeight);
        
        // Borde superior redondeado (simulado)
        ctx.fillStyle = color;
        ctx.fillRect(x, y, actualBarWidth, 2);
        
        // Etiqueta del rango
        ctx.fillStyle = '#666';
        ctx.font = '9px Nunito, Arial, sans-serif';
        ctx.textAlign = 'center';
        const rangeText = index === bins.length - 2 ? '80-100' : `${bins[index]}-${bins[index + 1]}`;
        ctx.fillText(rangeText, x + actualBarWidth / 2, height - 15);
        
        // Mostrar cantidad si hay datos (con etiqueta más clara)
        if (count > 0) {
            ctx.fillStyle = '#333';
            ctx.font = 'bold 10px Nunito, Arial, sans-serif';
            ctx.textAlign = 'center';
            // Mostrar el número sobre la barra
            ctx.fillText(count.toString(), x + actualBarWidth / 2, y - 5);
            
            // Mostrar porcentaje debajo del rango para mayor claridad
            const percentage = ((count / scores.length) * 100).toFixed(1);
            ctx.fillStyle = '#7BA680';
            ctx.font = '8px Nunito, Arial, sans-serif';
            ctx.fillText(`${percentage}%`, x + actualBarWidth / 2, height - 2);
        }
    });
}

// Actualizar gráficos cuando cambian los filtros
function updateEmotionalValuesCharts() {
    loadEmotionalValues();
}

// ========== ONBOARDING SYSTEM ==========

let currentOnboardingStep = 1;
let totalOnboardingSteps = 4; // Por defecto para estudiantes

// Verificar si debe mostrarse el onboarding
function shouldShowOnboarding(user) {
    if (!user) return false;
    
    // Verificar si ya completó el onboarding
    const completedOnboarding = localStorage.getItem(`onboarding_completed_${user.id}`);
    return !completedOnboarding;
}

// Mostrar onboarding
function showOnboarding() {
    if (!currentUser) return;
    
    // Determinar qué modal mostrar según el rol
    if (currentUser.role === 'teacher') {
        showTeacherOnboarding();
    } else if (currentUser.role === 'student') {
        showStudentOnboarding();
    }
}

// Mostrar onboarding de estudiantes
function showStudentOnboarding() {
    const modal = document.getElementById('onboardingModal');
    if (!modal) return;
    
    modal.classList.remove('hidden');
    currentOnboardingStep = 1;
    totalOnboardingSteps = 4;
    
    // Personalizar contenido para estudiantes
    customizeStudentOnboardingContent();
    
    // Actualizar UI
    updateOnboardingUI();
}

// Mostrar onboarding de docentes
function showTeacherOnboarding() {
    const modal = document.getElementById('teacherOnboardingModal');
    if (!modal) return;
    
    modal.classList.remove('hidden');
    currentOnboardingStep = 1;
    totalOnboardingSteps = 7;
    
    // Actualizar UI
    updateTeacherOnboardingUI();
}

// Personalizar contenido para estudiantes
function customizeStudentOnboardingContent() {
    if (!currentUser || currentUser.role !== 'student') return;
    
    // Paso 2 - Bienestar
    document.getElementById('onboardingIcon2').textContent = '📊';
    document.getElementById('onboardingTitle2').textContent = 'Tu Bienestar es Importante';
    document.getElementById('onboardingDesc2').textContent = 'Completa las encuestas de bienestar para que podamos conocerte mejor y ofrecerte el apoyo que necesitas. Tus respuestas son privadas y confidenciales.';
    
    // Paso 3 - Actividades
    document.getElementById('onboardingIcon3').textContent = '🎮';
    document.getElementById('onboardingTitle3').textContent = 'Actividades Lúdicas';
    document.getElementById('onboardingDesc3').textContent = 'Participa en actividades interactivas que te ayudarán a desarrollar habilidades emocionales y sociales de manera divertida. ¡Gana recompensas mientras aprendes!';
    
    // Paso 4 - Comunicación
    document.getElementById('onboardingIcon4').textContent = '💬';
    document.getElementById('onboardingTitle4').textContent = 'Comunicación Anónima';
    document.getElementById('onboardingDesc4').textContent = 'Si necesitas ayuda o quieres compartir algo, puedes enviar mensajes anónimos a tu docente. Tu privacidad está completamente protegida.';
}

// Actualizar UI del onboarding
function updateOnboardingUI() {
    // Actualizar barra de progreso
    const progress = (currentOnboardingStep / totalOnboardingSteps) * 100;
    const progressBar = document.getElementById('onboardingProgress');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    
    // Actualizar texto del paso
    const stepText = document.getElementById('onboardingStepText');
    if (stepText) {
        const stepText_i18n = typeof i18n !== 'undefined' ? i18n.t('stats.step') : 'Paso';
        const ofText_i18n = typeof i18n !== 'undefined' ? i18n.t('stats.of') : 'de';
        stepText.textContent = `${stepText_i18n} ${currentOnboardingStep} ${ofText_i18n} ${totalOnboardingSteps}`;
    }
    
    // Mostrar/ocultar slides
    for (let i = 1; i <= totalOnboardingSteps; i++) {
        const slide = document.getElementById(`onboardingSlide${i}`);
        if (slide) {
            if (i === currentOnboardingStep) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        }
    }
    
    // Actualizar botones
    const prevBtn = document.getElementById('onboardingPrevBtn');
    const nextBtn = document.getElementById('onboardingNextBtn');
    const completeBtn = document.getElementById('onboardingCompleteBtn');
    
    if (prevBtn) {
        prevBtn.style.display = currentOnboardingStep > 1 ? 'block' : 'none';
    }
    
    if (nextBtn) {
        nextBtn.style.display = currentOnboardingStep < totalOnboardingSteps ? 'block' : 'none';
    }
    
    if (completeBtn) {
        completeBtn.style.display = currentOnboardingStep === totalOnboardingSteps ? 'block' : 'none';
    }
}

// Siguiente paso
function nextOnboardingStep() {
    if (currentOnboardingStep < totalOnboardingSteps) {
        currentOnboardingStep++;
        updateOnboardingUI();
    }
}

// Paso anterior
function previousOnboardingStep() {
    if (currentOnboardingStep > 1) {
        currentOnboardingStep--;
        updateOnboardingUI();
    }
}

// Completar onboarding
function completeOnboarding() {
    if (!currentUser) return;
    
    // Marcar como completado
    localStorage.setItem(`onboarding_completed_${currentUser.id}`, 'true');
    
    // Ocultar modales
    const studentModal = document.getElementById('onboardingModal');
    const teacherModal = document.getElementById('teacherOnboardingModal');
    
    if (studentModal) {
        studentModal.classList.add('hidden');
    }
    if (teacherModal) {
        teacherModal.classList.add('hidden');
    }
    
    // Mostrar dashboard según el rol
    if (currentUser.role === 'student') {
        updateStudentName();
        showStudentView();
        initStudentDashboard();
    } else if (currentUser.role === 'teacher') {
        updateTeacherName();
        showTeacherView();
        initTeacherDashboard();
    }
}

// Omitir onboarding
function skipOnboarding() {
    completeOnboarding();
}

// Actualizar UI del onboarding de docentes
function updateTeacherOnboardingUI() {
    // Actualizar barra de progreso
    const progress = (currentOnboardingStep / totalOnboardingSteps) * 100;
    const progressBar = document.getElementById('teacherOnboardingProgress');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    
    // Actualizar texto del paso
    const stepText = document.getElementById('teacherOnboardingStepText');
    if (stepText) {
        const stepText_i18n = typeof i18n !== 'undefined' ? i18n.t('stats.step') : 'Paso';
        const ofText_i18n = typeof i18n !== 'undefined' ? i18n.t('stats.of') : 'de';
        stepText.textContent = `${stepText_i18n} ${currentOnboardingStep} ${ofText_i18n} ${totalOnboardingSteps}`;
    }
    
    // Mostrar/ocultar slides
    for (let i = 1; i <= totalOnboardingSteps; i++) {
        const slide = document.getElementById(`teacherOnboardingSlide${i}`);
        if (slide) {
            if (i === currentOnboardingStep) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        }
    }
    
    // Actualizar botones
    const prevBtn = document.getElementById('teacherOnboardingPrevBtn');
    const nextBtn = document.getElementById('teacherOnboardingNextBtn');
    const completeBtn = document.getElementById('teacherOnboardingCompleteBtn');
    
    if (prevBtn) {
        prevBtn.style.display = currentOnboardingStep > 1 ? 'block' : 'none';
    }
    
    if (nextBtn) {
        nextBtn.style.display = currentOnboardingStep < totalOnboardingSteps ? 'block' : 'none';
    }
    
    if (completeBtn) {
        completeBtn.style.display = currentOnboardingStep === totalOnboardingSteps ? 'block' : 'none';
    }
}

// Navegación del onboarding de docentes
function nextTeacherOnboardingStep() {
    if (currentOnboardingStep < totalOnboardingSteps) {
        currentOnboardingStep++;
        updateTeacherOnboardingUI();
    }
}

function previousTeacherOnboardingStep() {
    if (currentOnboardingStep > 1) {
        currentOnboardingStep--;
        updateTeacherOnboardingUI();
    }
}

// ========== MODO OSCURO ==========
// Funciones de modo oscuro deshabilitadas - removidas del proyecto principal
/*
function initDarkMode() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        updateDarkModeToggle();
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    updateDarkModeToggle();
}

function updateDarkModeToggle() {
    const toggle = document.getElementById('darkModeToggle');
    if (toggle) {
        const isDark = document.body.classList.contains('dark-mode');
        toggle.textContent = isDark ? '☀️' : '🌙';
        toggle.title = isDark ? 'Modo Claro' : 'Modo Oscuro';
    }
}
*/

// ========== MULTI-IDIOMA ==========
// Funciones de traducción deshabilitadas - removidas del proyecto principal
/*
function initLanguage() {
    if (typeof i18n !== 'undefined') {
        // Asegurar que el idioma se haya inicializado desde localStorage
        if (!i18n.currentLanguage || i18n.currentLanguage === 'es') {
            const savedLang = localStorage.getItem('preferredLanguage');
            if (savedLang && i18n.translations[savedLang]) {
                i18n.currentLanguage = savedLang;
            }
        }
        
        // Actualizar todos los selectores de idioma en la página
        const selectors = document.querySelectorAll('#languageSelector');
        selectors.forEach(selector => {
            selector.value = i18n.currentLanguage;
        });
        
        // Aplicar el idioma a la página si aún no se ha aplicado
        updatePageLanguage();
    }
}

function changeLanguage(lang) {
    if (typeof i18n !== 'undefined' && i18n.setLanguage(lang)) {
        // Actualizar todos los selectores de idioma en la página
        const selectors = document.querySelectorAll('#languageSelector');
        selectors.forEach(selector => {
            selector.value = lang;
        });
        updatePageLanguage();
    }
}
*/

function updatePageLanguage() {
    if (typeof i18n === 'undefined') return;
    
    // Actualizar textos de la vista de alertas
    const title = document.getElementById('riskAlertsTitle');
    const subtitle = document.getElementById('riskAlertsSubtitle');
    if (title) title.textContent = i18n.t('riskAlerts.title');
    if (subtitle) subtitle.textContent = i18n.t('riskAlerts.subtitle');
    
    // Actualizar filtros
    const riskLevelLabel = document.getElementById('filterRiskLevelLabel');
    const caseStatusLabel = document.getElementById('filterCaseStatusLabel');
    const dateFromLabel = document.getElementById('filterDateFromLabel');
    const dateToLabel = document.getElementById('filterDateToLabel');
    const applyBtn = document.getElementById('applyFiltersBtn');
    const clearBtn = document.getElementById('clearFiltersBtn');
    
    if (riskLevelLabel) riskLevelLabel.textContent = i18n.t('filters.riskLevel') || 'Nivel de Riesgo';
    if (caseStatusLabel) caseStatusLabel.textContent = i18n.t('filters.status') || 'Estado del Caso';
    if (dateFromLabel) dateFromLabel.textContent = i18n.t('filters.from') || 'Desde';
    if (dateToLabel) dateToLabel.textContent = i18n.t('filters.to') || 'Hasta';
    if (applyBtn) applyBtn.textContent = i18n.t('filters.apply') || 'Aplicar Filtros';
    if (clearBtn) clearBtn.textContent = i18n.t('filters.clear') || 'Limpiar';
    
    // Actualizar opciones de filtros
    const riskLevelSelect = document.getElementById('filterRiskLevel');
    const caseStatusSelect = document.getElementById('filterCaseStatus');
    if (riskLevelSelect) {
        const currentValue = riskLevelSelect.value;
        riskLevelSelect.innerHTML = `
            <option value="all">${i18n.t('filters.all')}</option>
            <option value="CRITICO">${i18n.t('filters.critical')}</option>
            <option value="ALTO">${i18n.t('filters.high')}</option>
            <option value="MEDIO">${i18n.t('filters.medium')}</option>
        `;
        riskLevelSelect.value = currentValue;
    }
    if (caseStatusSelect) {
        const currentValue = caseStatusSelect.value;
        caseStatusSelect.innerHTML = `
            <option value="all">${i18n.t('caseStatus.all')}</option>
            <option value="pending">${i18n.t('caseStatus.pending')}</option>
            <option value="inProgress">${i18n.t('caseStatus.inProgress')}</option>
            <option value="resolved">${i18n.t('caseStatus.resolved')}</option>
        `;
        caseStatusSelect.value = currentValue;
    }
    
    // Selector de idioma removido
    // const selector = document.getElementById('languageSelector');
    // if (selector) selector.value = i18n.currentLanguage;

    // Actualizar placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (key) {
            el.placeholder = i18n.t(key);
        }
    });

    // Actualizar navegación
    updateNavigationTexts();

    // Actualizar todos los elementos con data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key) {
            el.textContent = i18n.t(key);
        }
    });
    
    // Actualizar botón de cerrar sesión
    const logoutButtons = document.querySelectorAll('button[onclick="logout()"]');
    logoutButtons.forEach(btn => {
        if (btn.textContent.includes('Cerrar Sesión') || btn.textContent.includes('Logout')) {
            btn.textContent = i18n.t('buttons.logout');
        }
    });
    
    // Actualizar welcome subtitle si existe
    const welcomeSubtitle = document.querySelector('#teacherView .welcome-section p');
    if (welcomeSubtitle) {
        welcomeSubtitle.textContent = i18n.t('dashboard.welcomeSubtitle');
    }
    
    // Actualizar saludo del docente si está logueado
    if (currentUser && currentUser.role === 'teacher') {
        updateTeacherName();
    }
    
    // Recargar alertas si estamos en esa vista
    if (currentView === 'teacherRiskAlerts') {
        loadRiskAlerts();
    }
}

// Actualizar textos de navegación
function updateNavigationTexts() {
    if (typeof i18n === 'undefined') return;
    
    // Actualizar botones de navegación del docente
    const navButtons = document.querySelectorAll('.teacher-nav .nav-btn');
    navButtons.forEach(btn => {
        const spans = btn.querySelectorAll('span:not(.nav-icon):not(#riskAlertsBadge):not(.notification-badge-nav)');
        spans.forEach(span => {
            const text = span.textContent.trim();
            // Buscar por texto conocido y actualizar
            if (text === 'Dashboard') {
                span.textContent = i18n.t('nav.dashboard');
            } else if (text === 'Mensajes Anónimos' || text === 'Anonymous Messages') {
                span.textContent = i18n.t('nav.messages');
            } else if (text === 'Alertas de Riesgo' || text === 'Risk Alerts') {
                span.textContent = i18n.t('nav.riskAlerts');
            } else if (text === 'Lista de Estudiantes' || text === 'Student List') {
                span.textContent = i18n.t('nav.students');
            } else if (text === 'Notificaciones' || text === 'Notifications') {
                span.textContent = i18n.t('nav.notifications');
            } else if (text === 'Mis Códigos de Clase' || text === 'My Class Codes') {
                span.textContent = i18n.t('nav.classCodes');
            } else if (text === 'Espacios de Crecimiento' || text === 'Growth Spaces') {
                span.textContent = i18n.t('nav.growthSpaces');
            }
        });
    });
    
    // Actualizar botones de navegación del estudiante
    const studentNavButtons = document.querySelectorAll('.student-nav .nav-btn');
    studentNavButtons.forEach(btn => {
        const spans = btn.querySelectorAll('span:not(.nav-icon)');
        spans.forEach(span => {
            const text = span.textContent.trim();
            if (text === 'Dashboard' || text === 'Mensajes Anónimos' || text === 'Anonymous Messages') {
                span.textContent = i18n.t('nav.dashboard');
            } else if (text === 'Mensajes Anónimos' || text === 'Anonymous Messages') {
                span.textContent = i18n.t('nav.messages');
            } else if (text === 'Mi Perfil' || text === 'My Profile') {
                span.textContent = i18n.t('nav.profile');
            } else if (text === 'Mis Recompensas' || text === 'My Rewards') {
                span.textContent = i18n.t('nav.rewards');
            } else if (text === 'Canal de Comunicación' || text === 'Communication Channel') {
                span.textContent = i18n.t('nav.communication');
            }
        });
    });
}

// Escuchar cambios de idioma
if (typeof window !== 'undefined') {
    window.addEventListener('languageChanged', () => {
        updatePageLanguage();
    });
}

// ========== PANEL DE ADMINISTRACIÓN (OWNER) ==========

// Mostrar vista del owner/administrador
function showOwnerView() {
    document.getElementById('landingView').classList.add('hidden');
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('studentView').classList.add('hidden');
    document.getElementById('studentMessagesView').classList.add('hidden');
    document.getElementById('studentProfileView').classList.add('hidden');
    document.getElementById('teacherView').classList.add('hidden');
    document.getElementById('teacherMessagesView').classList.add('hidden');
    document.getElementById('teacherRiskAlertsView').classList.add('hidden');
    document.getElementById('teacherStudentsView').classList.add('hidden');
    document.getElementById('teacherNotificationsView').classList.add('hidden');
    document.getElementById('teacherClassCodesView').classList.add('hidden');
    document.getElementById('teacherGrowthSpacesView').classList.add('hidden');
    document.getElementById('ownerView').classList.remove('hidden');
    
    currentView = 'owner';
    
    // Actualizar nombre del usuario
    if (currentUser) {
        const ownerNameEl = document.getElementById('ownerName');
        if (ownerNameEl) {
            ownerNameEl.textContent = currentUser.name || 'Administrador';
        }
    }
    
    // Cargar datos del dashboard
    loadOwnerDashboard();
    
    // Actualizar historial
    if (history.state?.view !== 'owner') {
        history.pushState({ view: 'owner' }, '', window.location.pathname);
    }
}

// Cargar datos del dashboard del owner
async function loadOwnerDashboard() {
    try {
        showLoading('Cargando estadísticas...');
        
        // Verificar si estamos en modo offline (file://)
        const isFileProtocol = window.location.protocol === 'file:';
        
        if (isFileProtocol) {
            // Modo offline: usar localStorage directamente
            loadOwnerDashboardFromLocalStorage();
            hideLoading();
            return;
        }
        
        // Obtener token JWT si está disponible
        const token = localStorage.getItem('authToken');
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Intentar cargar desde API primero
        const apiConfig = typeof window !== 'undefined' && window.API_CONFIG ? window.API_CONFIG : null;
        const apiEnabled = apiConfig && apiConfig.ENABLED;
        const apiBaseUrl = apiConfig ? apiConfig.BASE_URL : null;
        
        if (apiEnabled && apiBaseUrl && (apiBaseUrl.startsWith('http://') || apiBaseUrl.startsWith('https://'))) {
            try {
                const response = await fetch(`${apiBaseUrl}/admin/dashboard`, {
                    method: 'GET',
                    headers: headers
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        renderOwnerDashboard(result.data);
                        hideLoading();
                        return;
                    }
                }
            } catch (error) {
                console.warn('⚠️ Error al cargar desde API, usando localStorage:', error.message);
            }
        }
        
        // Fallback: cargar desde localStorage (datos agregados)
        loadOwnerDashboardFromLocalStorage();
        hideLoading();
        
    } catch (error) {
        console.error('❌ Error al cargar dashboard del owner:', error);
        hideLoading();
        // Fallback a localStorage en caso de error
        loadOwnerDashboardFromLocalStorage();
    }
}

// Cargar dashboard desde localStorage (fallback)
function loadOwnerDashboardFromLocalStorage() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const surveyResponses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
    const activities = JSON.parse(localStorage.getItem('studentActivities') || '[]');
    const messages = JSON.parse(localStorage.getItem('anonymousMessages') || '[]');
    const notifications = JSON.parse(localStorage.getItem('teacherNotifications') || '[]');
    
    // Calcular estadísticas agregadas (solo los números solicitados)
    const totalStudents = users.filter(u => u.role === 'student').length;
    const totalTeachers = users.filter(u => u.role === 'teacher').length;
    const totalClasses = classes.length;
    const totalSurveyResponses = surveyResponses.length;
    const totalActivities = activities.length;
    const totalMessages = messages.length;
    
    // Agrupar por dominio de email (clientes)
    // Excluir munay@munay.com (es el dueño, no un cliente)
    const clientsMap = new Map();
    
    users.filter(u => u.role === 'teacher' && u.email !== 'munay@munay.com').forEach(teacher => {
        // Para admin@munay.com, usar un dominio especial "demo.munay.com" para separarlo
        let domain = teacher.email.split('@')[1];
        let displayDomain = domain;
        
        // Si es admin@munay.com, tratarlo como cliente especial "Demo"
        if (teacher.email === 'admin@munay.com') {
            displayDomain = 'demo.munay.com';
            domain = 'demo.munay.com'; // Usar dominio especial para evitar conflicto
        }
        
        if (!clientsMap.has(domain)) {
            clientsMap.set(domain, {
                domain: displayDomain, // Dominio para mostrar
                internalDomain: domain, // Dominio interno para cálculos
                primaryContact: teacher.name,
                primaryEmail: teacher.email,
                stats: {
                    teachers: 0,
                    students: 0,
                    classes: 0,
                    surveyResponses: 0,
                    activities: 0,
                    messages: 0
                }
            });
        }
        clientsMap.get(domain).stats.teachers++;
    });
    
    // Calcular estadísticas por cliente
    // Primero, crear un mapa de clases a dominios y emails de profesores
    const classToDomainMap = new Map();
    const classToTeacherEmailMap = new Map();
    classes.forEach(cls => {
        const teacher = users.find(u => u.id === cls.teacherId);
        if (teacher) {
            const teacherDomain = teacher.email.split('@')[1];
            classToDomainMap.set(cls.code, teacherDomain);
            classToTeacherEmailMap.set(cls.code, teacher.email);
        }
    });
    
    clientsMap.forEach((client, internalDomain) => {
        // Para admin@munay.com, buscar usuarios específicamente asociados a admin
        let clientUsers, clientClassCodes, clientStudents;
        
        if (client.primaryEmail === 'admin@munay.com') {
            // Cliente especial: admin@munay.com (demos)
            // Incluir admin@munay.com y TODOS sus estudiantes (de todas sus clases)
            clientUsers = users.filter(u => u.email === 'admin@munay.com');
            const classCodesFromClasses = classes
                .filter(c => {
                    const teacher = users.find(u => u.id === c.teacherId);
                    return teacher && teacher.email === 'admin@munay.com';
                })
                .map(c => c.code);
            
            // Eliminar duplicados de las clases
            clientClassCodes = [...new Set(classCodesFromClasses)];
            
            // TODOS los estudiantes que pertenecen a clases de admin@munay.com (no solo CLSDEMO)
            clientStudents = users.filter(u => {
                if (u.role !== 'student') return false;
                if (u.classCode && classToTeacherEmailMap.get(u.classCode) === 'admin@munay.com') return true;
                return false;
            });
        } else {
            // Clientes normales: usuarios con el mismo dominio
            // Obtener el dominio real del email del profesor principal
            const realDomain = client.primaryEmail.split('@')[1];
            
            clientUsers = users.filter(u => {
                const userDomain = u.email.split('@')[1];
                return userDomain === realDomain;
            });
            
            // Clases asociadas a profesores de este dominio
            const classCodesFromClasses = classes
                .filter(c => {
                    const teacher = users.find(u => u.id === c.teacherId);
                    if (!teacher) return false;
                    const teacherDomain = teacher.email.split('@')[1];
                    return teacherDomain === realDomain;
                })
                .map(c => c.code);
            
            // Eliminar duplicados de las clases
            clientClassCodes = [...new Set(classCodesFromClasses)];
            
            // Estudiantes que pertenecen a clases de profesores de este dominio
            clientStudents = users.filter(u => {
                if (u.role !== 'student') return false;
                // Si el estudiante tiene el mismo dominio, incluirlo
                const userDomain = u.email.split('@')[1];
                if (userDomain === realDomain) return true;
                // Si el estudiante pertenece a una clase de un profesor de este dominio, incluirlo
                if (u.classCode && classToDomainMap.get(u.classCode) === realDomain) return true;
                return false;
            });
        }
        
        const clientUserIds = clientUsers.map(u => u.id);
        const clientStudentIds = clientStudents.map(u => u.id);
        const clientStudentClassCodes = clientStudents
            .filter(u => u.classCode)
            .map(u => u.classCode);
        
        // Obtener códigos de clase únicos de los estudiantes del cliente
        // Esto es más preciso que usar clientClassCodes que viene de la tabla classes
        const uniqueStudentClassCodes = [...new Set(clientStudentClassCodes)];
        
        // Combinar códigos de clases creadas con códigos únicos de estudiantes
        // Esto asegura que se cuenten todas las clases, incluso si no están en la tabla classes
        const allUniqueClassCodes = [...new Set([...clientClassCodes, ...uniqueStudentClassCodes])];
        
        // Debug: verificar que se estén usando códigos únicos
        console.log(`📊 Cliente: ${client.primaryEmail || client.domain}`);
        console.log(`   - Códigos de clase de tabla classes: ${clientClassCodes.length} (${clientClassCodes.join(', ')})`);
        console.log(`   - Códigos únicos de estudiantes: ${uniqueStudentClassCodes.length} (${uniqueStudentClassCodes.join(', ')})`);
        console.log(`   - Total códigos únicos: ${allUniqueClassCodes.length} (${allUniqueClassCodes.join(', ')})`);
        
        client.stats.teachers = clientUsers.filter(u => u.role === 'teacher').length;
        client.stats.students = clientStudents.length;
        client.stats.classes = allUniqueClassCodes.length;
        client.stats.surveyResponses = surveyResponses.filter(r => clientStudentIds.includes(r.studentId)).length;
        client.stats.activities = activities.filter(a => clientStudentIds.includes(a.studentId)).length;
        client.stats.messages = messages.filter(m => clientStudentClassCodes.includes(m.studentClassCode)).length;
        
        // Calcular score de bienestar general del cliente
        const allReflections = JSON.parse(localStorage.getItem('reflectionAnalyses') || '[]');
        const allScores = [];
        
        // Obtener scores de todos los estudiantes del cliente
        clientStudents.forEach(student => {
            const studentResponses = surveyResponses.filter(r => r.studentId === student.id);
            const studentReflections = allReflections.filter(r => r.studentId === student.id);
            const studentActivities = activities.filter(a => a.studentId === student.id);
            
            // Scores de encuestas
            studentResponses.forEach(r => {
                if (r.score !== undefined && r.score !== null) {
                    allScores.push(r.score);
                }
            });
            
            // Scores de reflexiones
            studentReflections.forEach(r => {
                if (r.score !== undefined && r.score !== null) {
                    allScores.push(r.score);
                }
            });
            
            // Scores de actividades
            studentActivities.forEach(a => {
                if (a.testScore !== undefined && a.testScore !== null) {
                    allScores.push(a.testScore);
                } else if (a.ethicalScore !== undefined && a.ethicalScore !== null) {
                    allScores.push(a.ethicalScore);
                } else if (a.simulatorResults && a.simulatorResults.averageScore !== undefined && a.simulatorResults.averageScore !== null) {
                    allScores.push(a.simulatorResults.averageScore);
                }
            });
        });
        
        // Calcular promedio de bienestar
        if (allScores.length > 0) {
            const totalScore = allScores.reduce((sum, score) => sum + score, 0);
            client.stats.wellbeingScore = Math.round(totalScore / allScores.length);
        } else {
            client.stats.wellbeingScore = null;
        }
    });
    
    const clients = Array.from(clientsMap.values());
    
    // Renderizar dashboard (solo los números solicitados)
    renderOwnerDashboard({
        overview: {
            totalTeachers,
            totalStudents,
            totalClasses,
            totalSurveyResponses,
            totalActivities,
            totalMessages
        },
        clients: clients
    });
}

// Renderizar dashboard del owner
function renderOwnerDashboard(data) {
    // Renderizar estadísticas generales (solo los números solicitados)
    const statsGrid = document.getElementById('ownerStatsGrid');
    if (statsGrid && data.overview) {
        const stats = data.overview;
        statsGrid.innerHTML = `
            <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size: 2.5em; font-weight: bold; margin-bottom: 10px;">${stats.totalTeachers || 0}</div>
                <div style="font-size: 1em; opacity: 0.9;">Profesores</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size: 2.5em; font-weight: bold; margin-bottom: 10px;">${stats.totalStudents || 0}</div>
                <div style="font-size: 1em; opacity: 0.9;">Estudiantes</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size: 2.5em; font-weight: bold; margin-bottom: 10px;">${stats.totalClasses || 0}</div>
                <div style="font-size: 1em; opacity: 0.9;">Clases</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size: 2.5em; font-weight: bold; margin-bottom: 10px;">${stats.totalSurveyResponses || 0}</div>
                <div style="font-size: 1em; opacity: 0.9;">Encuestas</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size: 2.5em; font-weight: bold; margin-bottom: 10px;">${stats.totalActivities || 0}</div>
                <div style="font-size: 1em; opacity: 0.9;">Actividades</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #1a2332; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size: 2.5em; font-weight: bold; margin-bottom: 10px;">${stats.totalMessages || 0}</div>
                <div style="font-size: 1em; opacity: 0.8;">Mensajes</div>
            </div>
        `;
    }
    
    // Renderizar lista de clientes
    const clientsList = document.getElementById('clientsList');
    if (clientsList && data.clients) {
        if (data.clients.length === 0) {
            clientsList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #999; background: #f8f9fa; border-radius: 12px;">
                    <p style="font-size: 1.2em; margin-bottom: 10px;">No hay clientes registrados aún</p>
                    <p>Carga usuarios de tus clientes para ver sus estadísticas aquí</p>
                </div>
            `;
        } else {
            clientsList.innerHTML = data.clients.map(client => `
                <div class="client-card" style="background: white; border: 2px solid #e8eef5; border-radius: 12px; padding: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
                        <div>
                            <h4 style="margin: 0 0 5px 0; color: #1a2332; font-size: 1.3em;">${client.domain}</h4>
                            <p style="margin: 0; color: #666; font-size: 0.9em;">Contacto: ${client.primaryContact || 'N/A'}</p>
                        </div>
                        <div style="text-align: right;">
                            <span style="background: #4CAF50; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.85em; font-weight: 600;">Activo</span>
                        </div>
                    </div>
                    ${client.stats.wellbeingScore !== null && client.stats.wellbeingScore !== undefined ? `
                    <div style="margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <div>
                                <div style="font-size: 0.9em; opacity: 0.9; margin-bottom: 5px;">Score de Bienestar General</div>
                                <div style="font-size: 2.5em; font-weight: bold;">${client.stats.wellbeingScore}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 0.85em; opacity: 0.9; margin-bottom: 5px;">${client.stats.wellbeingScore >= 80 ? 'Excelente' : client.stats.wellbeingScore >= 60 ? 'Bueno' : client.stats.wellbeingScore >= 40 ? 'Regular' : 'Bajo'}</div>
                                <div style="font-size: 0.75em; opacity: 0.8;">/ 100</div>
                            </div>
                        </div>
                        <div style="background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; overflow: hidden; margin-top: 10px;">
                            <div style="background: white; height: 100%; width: ${client.stats.wellbeingScore}%; transition: width 0.3s ease;"></div>
                        </div>
                    </div>
                    ` : `
                    <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 12px; text-align: center; color: #999;">
                        <div style="font-size: 0.9em; margin-bottom: 5px;">Score de Bienestar General</div>
                        <div style="font-size: 1.2em;">Sin datos suficientes</div>
                    </div>
                    `}
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-top: 20px;">
                        <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                            <div style="font-size: 1.8em; font-weight: bold; color: #667eea; margin-bottom: 5px;">${client.stats.teachers || 0}</div>
                            <div style="font-size: 0.85em; color: #666;">Profesores</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                            <div style="font-size: 1.8em; font-weight: bold; color: #f5576c; margin-bottom: 5px;">${client.stats.students || 0}</div>
                            <div style="font-size: 0.85em; color: #666;">Estudiantes</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                            <div style="font-size: 1.8em; font-weight: bold; color: #4facfe; margin-bottom: 5px;">${client.stats.classes || 0}</div>
                            <div style="font-size: 0.85em; color: #666;">Clases</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                            <div style="font-size: 1.8em; font-weight: bold; color: #43e97b; margin-bottom: 5px;">${client.stats.surveyResponses || 0}</div>
                            <div style="font-size: 0.85em; color: #666;">Encuestas</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                            <div style="font-size: 1.8em; font-weight: bold; color: #fa709a; margin-bottom: 5px;">${client.stats.activities || 0}</div>
                            <div style="font-size: 0.85em; color: #666;">Actividades</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                            <div style="font-size: 1.8em; font-weight: bold; color: #30cfd0; margin-bottom: 5px;">${client.stats.messages || 0}</div>
                            <div style="font-size: 0.85em; color: #666;">Mensajes</div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
}

// ========== SISTEMA DE SEGUIMIENTO DE CASOS ==========
function getCaseStatus(messageId) {
    if (!messageId) {
        console.warn('⚠️ getCaseStatus: messageId faltante');
        return 'pending';
    }
    const caseStatuses = JSON.parse(localStorage.getItem('caseStatuses') || '{}');
    const status = caseStatuses[messageId] || 'pending';
    return status;
}

function setCaseStatus(messageId, status) {
    if (!messageId || !status) {
        console.error('❌ setCaseStatus: messageId o status faltante', { messageId, status });
        return;
    }
    
    const caseStatuses = JSON.parse(localStorage.getItem('caseStatuses') || '{}');
    caseStatuses[messageId] = status;
    localStorage.setItem('caseStatuses', JSON.stringify(caseStatuses));
    
    console.log('✅ Estado actualizado:', { messageId, status, caseStatuses });
    
    // Recargar alertas
    if (currentView === 'teacherRiskAlerts') {
        setTimeout(() => {
            loadRiskAlerts();
        }, 100);
    }
    
    // Mostrar mensaje
    if (typeof i18n !== 'undefined') {
        showSuccessMessage(i18n.t('riskAlerts.statusUpdated'));
    } else {
        showSuccessMessage('Estado actualizado correctamente');
    }
}

function changeCaseStatus(messageId, newStatus) {
    console.log('🔄 Cambiando estado:', { messageId, newStatus });
    if (!messageId || !newStatus) {
        console.error('❌ changeCaseStatus: parámetros inválidos', { messageId, newStatus });
        return;
    }
    
    // Actualizar estado inmediatamente
    setCaseStatus(messageId, newStatus);
    
    // Actualizar el select visualmente sin esperar
    const selectElement = document.getElementById(`caseStatusSelect_${messageId}`);
    if (selectElement) {
        selectElement.value = newStatus;
    }
    
    // Recargar alertas después de un pequeño delay para asegurar que localStorage se actualizó
    // Esto también aplicará los filtros y ocultará/mostrará las alertas según corresponda
    setTimeout(() => {
        loadRiskAlerts();
        // Cambiar automáticamente a la pestaña correspondiente al nuevo estado
        switchRiskAlertsTab(newStatus);
    }, 100);
}

// ========== FILTROS DE ALERTAS ==========
function applyRiskAlertsFilters() {
    const riskLevel = document.getElementById('filterRiskLevel')?.value || 'all';
    const caseStatus = document.getElementById('filterCaseStatus')?.value || 'all';
    const dateFrom = document.getElementById('filterDateFrom')?.value || null;
    const dateTo = document.getElementById('filterDateTo')?.value || null;
    
    riskAlertsFilters = {
        riskLevel,
        caseStatus,
        dateFrom,
        dateTo
    };
    
    loadRiskAlerts();
}

function clearRiskAlertsFilters() {
    riskAlertsFilters = {
        riskLevel: 'all',
        caseStatus: 'all',
        dateFrom: null,
        dateTo: null
    };
    
    const riskLevel = document.getElementById('filterRiskLevel');
    const caseStatus = document.getElementById('filterCaseStatus');
    const dateFrom = document.getElementById('filterDateFrom');
    const dateTo = document.getElementById('filterDateTo');
    
    if (riskLevel) riskLevel.value = 'all';
    if (caseStatus) caseStatus.value = 'all';
    if (dateFrom) dateFrom.value = '';
    if (dateTo) dateTo.value = '';
    
    loadRiskAlerts();
}

// ========== NAVEGACIÓN LANDING PAGE ==========
function initLandingNavigation() {
    // Scroll suave para los enlaces de navegación
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
    
    // Efecto de scroll en la navegación
    const nav = document.querySelector('.landing-nav');
    if (nav) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }
}

// Función auxiliar para scroll suave a secciones
function scrollToSection(sectionId) {
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        const navHeight = document.querySelector('.landing-nav')?.offsetHeight || 80;
        const targetPosition = targetSection.offsetTop - navHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// ========== GESTIÓN DE CLIENTES (OWNER) ==========

let currentEditingClientId = null;
let currentImportingClientId = null;
let csvFileData = null;

// Cargar lista de clientes
async function loadClients() {
    try {
        // Verificar si estamos en un entorno válido (no file://)
        const isFileProtocol = window.location.protocol === 'file:';
        if (isFileProtocol) {
            console.warn('⚠️ Abriendo desde file:// - Usando modo offline');
            loadClientsFromLocalStorage();
            return;
        }
        
        const token = localStorage.getItem('authToken');
        const apiConfig = window.API_CONFIG || {};
        const apiBaseUrl = apiConfig.BASE_URL || 'http://localhost:3000/api';
        
        // Verificar que la URL sea válida
        if (!apiBaseUrl.startsWith('http://') && !apiBaseUrl.startsWith('https://')) {
            console.warn('⚠️ URL de API inválida - Usando modo offline');
            loadClientsFromLocalStorage();
            return;
        }
        
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        try {
            const response = await fetch(`${apiBaseUrl}/clients`, {
                method: 'GET',
                headers: headers
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    renderClientsList(result.data);
                    return;
                }
            }
        } catch (fetchError) {
            console.warn('⚠️ Error al conectar con el backend:', fetchError.message);
            // Continuar con fallback
        }
        
        // Fallback: cargar desde localStorage
        loadClientsFromLocalStorage();
    } catch (error) {
        console.error('Error al cargar clientes:', error);
        loadClientsFromLocalStorage();
    }
}

// Cargar clientes desde localStorage (fallback)
function loadClientsFromLocalStorage() {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    
    // Verificar si existe admin@munay.com y crear cliente demo automáticamente
    const adminUser = users.find(u => u.email === 'admin@munay.com');
    if (adminUser) {
        // Buscar si ya existe el cliente demo
        let demoClient = clients.find(c => c.contactEmail === 'admin@munay.com' || c.name === 'Cliente Demo');
        
        if (!demoClient) {
            // Crear cliente demo automáticamente
            const adminClasses = classes.filter(c => {
                const teacher = users.find(u => u.id === c.teacherId);
                return teacher && (teacher.email === 'admin@munay.com' || teacher.email === 'munay@munay.com');
            });
            
            const adminStudents = users.filter(u => {
                if (u.role !== 'student') return false;
                if (u.classCode && adminClasses.some(c => c.code === u.classCode)) return true;
                return false;
            });
            
            const adminTeachers = users.filter(u => u.email === 'admin@munay.com');
            
            demoClient = {
                id: `client_demo_${Date.now()}`,
                name: 'Cliente Demo',
                contactEmail: 'admin@munay.com',
                contactPhone: null,
                contactName: adminUser.name || 'Administrador',
                notes: 'Cliente demo con datos de prueba',
                status: 'active',
                totalUsers: adminStudents.length + adminTeachers.length,
                totalStudents: adminStudents.length,
                totalTeachers: adminTeachers.length,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            clients.push(demoClient);
            localStorage.setItem('clients', JSON.stringify(clients));
        } else {
            // Actualizar estadísticas del cliente demo
            const adminClasses = classes.filter(c => {
                const teacher = users.find(u => u.id === c.teacherId);
                return teacher && (teacher.email === 'admin@munay.com' || teacher.email === 'munay@munay.com');
            });
            
            const adminStudents = users.filter(u => {
                if (u.role !== 'student') return false;
                if (u.classCode && adminClasses.some(c => c.code === u.classCode)) return true;
                return false;
            });
            
            const adminTeachers = users.filter(u => u.email === 'admin@munay.com');
            
            demoClient.totalUsers = adminStudents.length + adminTeachers.length;
            demoClient.totalStudents = adminStudents.length;
            demoClient.totalTeachers = adminTeachers.length;
            demoClient.updatedAt = new Date().toISOString();
            
            // Actualizar en el array
            const index = clients.findIndex(c => c.id === demoClient.id);
            if (index !== -1) {
                clients[index] = demoClient;
                localStorage.setItem('clients', JSON.stringify(clients));
            }
        }
    }
    
    if (clients.length === 0) {
        document.getElementById('clientsList').innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <p style="margin-bottom: 16px;">No hay clientes registrados.</p>
                <p style="font-size: 14px; color: #999;">Crea tu primer cliente para comenzar.</p>
                <p style="font-size: 12px; color: #999; margin-top: 20px;">
                    ⚠️ Modo offline: Los datos se guardan localmente. Para usar el backend, abre la página desde un servidor HTTP.
                </p>
            </div>
        `;
    } else {
        renderClientsList(clients);
    }
}

// Calcular estadísticas completas de un cliente
function calculateClientStats(client) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const surveyResponses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
    const activities = JSON.parse(localStorage.getItem('studentActivities') || '[]');
    const messages = JSON.parse(localStorage.getItem('anonymousMessages') || '[]');
    const reflections = JSON.parse(localStorage.getItem('reflectionAnalyses') || '[]');
    
    // Identificar usuarios del cliente
    let clientUsers = [];
    let clientStudents = [];
    let clientTeachers = [];
    let clientClassCodes = [];
    
    // Si es el cliente demo (admin@munay.com)
    if (client.contactEmail === 'admin@munay.com') {
        clientTeachers = users.filter(u => u.email === 'admin@munay.com');
        const classCodesFromClasses = classes
            .filter(c => {
                const teacher = users.find(u => u.id === c.teacherId);
                return teacher && teacher.email === 'admin@munay.com';
            })
            .map(c => c.code);
        
        clientStudents = users.filter(u => {
            if (u.role !== 'student') return false;
            return u.classCode && classCodesFromClasses.includes(u.classCode);
        });
        
        // Obtener códigos únicos de estudiantes
        const studentClassCodes = clientStudents
            .filter(s => s.classCode)
            .map(s => s.classCode);
        
        // Combinar y eliminar duplicados
        clientClassCodes = [...new Set([...classCodesFromClasses, ...studentClassCodes])];
    } else {
        // Clientes normales: buscar por clientId PRIMERO (usuarios importados)
        clientUsers = users.filter(u => u.clientId === client.id);
        
        // Si no hay usuarios con clientId, buscar por dominio del email (fallback para compatibilidad)
        if (clientUsers.length === 0) {
            const domain = client.contactEmail.split('@')[1];
            clientUsers = users.filter(u => u.email.includes(`@${domain}`));
        }
        
        clientTeachers = clientUsers.filter(u => u.role === 'teacher');
        clientStudents = clientUsers.filter(u => u.role === 'student');
        
        // Obtener códigos de clase de los profesores del cliente
        clientClassCodes = classes
            .filter(c => {
                const teacher = users.find(u => u.id === c.teacherId);
                return teacher && clientTeachers.some(t => t.id === teacher.id);
            })
            .map(c => c.code);
        
        // También incluir clases de estudiantes del cliente (por si no tienen profesor asociado)
        const studentClassCodes = clientStudents
            .filter(s => s.classCode)
            .map(s => s.classCode);
        
        // Combinar y eliminar duplicados usando Set
        clientClassCodes = [...new Set([...clientClassCodes, ...studentClassCodes])];
    }
    
    const clientStudentIds = clientStudents.map(s => s.id);
    
    // Calcular estadísticas
    const stats = {
        teachers: clientTeachers.length,
        students: clientStudents.length,
        classes: clientClassCodes.length, // Ya está sin duplicados gracias al Set
        surveys: surveyResponses.filter(r => clientStudentIds.includes(r.studentId)).length,
        activities: activities.filter(a => clientStudentIds.includes(a.studentId)).length,
        messages: messages.filter(m => clientClassCodes.includes(m.studentClassCode)).length
    };
    
    // Calcular score de bienestar
    const allScores = [];
    clientStudents.forEach(student => {
        const studentResponses = surveyResponses.filter(r => r.studentId === student.id);
        const studentReflections = reflections.filter(r => r.studentId === student.id);
        const studentActivities = activities.filter(a => a.studentId === student.id);
        
        // Scores de encuestas
        studentResponses.forEach(r => {
            if (r.score !== undefined && r.score !== null) {
                allScores.push(r.score);
            }
        });
        
        // Scores de reflexiones
        studentReflections.forEach(r => {
            if (r.score !== undefined && r.score !== null) {
                allScores.push(r.score);
            }
        });
        
        // Scores de actividades
        studentActivities.forEach(a => {
            if (a.testScore !== undefined && a.testScore !== null) {
                allScores.push(a.testScore);
            } else if (a.ethicalScore !== undefined && a.ethicalScore !== null) {
                allScores.push(a.ethicalScore);
            } else if (a.simulatorResults && a.simulatorResults.averageScore !== undefined && a.simulatorResults.averageScore !== null) {
                allScores.push(a.simulatorResults.averageScore);
            }
        });
    });
    
    const wellbeingScore = allScores.length > 0 
        ? Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length)
        : null;
    
    return { ...stats, wellbeingScore };
}

// Obtener etiqueta del score de bienestar
function getWellbeingLabel(score) {
    if (score === null) return 'Sin datos';
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bueno';
    if (score >= 40) return 'Regular';
    return 'Bajo';
}

// Obtener color del score de bienestar
function getWellbeingColor(score) {
    if (score === null) return '#999';
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#8BC34A';
    if (score >= 40) return '#FFC107';
    return '#F44336';
}

// Renderizar lista de clientes
function renderClientsList(clients) {
    const clientsListEl = document.getElementById('clientsList');
    
    if (!clients || clients.length === 0) {
        clientsListEl.innerHTML = '<p style="color: #666; text-align: center; padding: 40px;">No hay clientes registrados. Crea tu primer cliente para comenzar.</p>';
        return;
    }
    
    clientsListEl.innerHTML = clients.map(client => {
        const stats = calculateClientStats(client);
        const wellbeingScore = stats.wellbeingScore;
        const wellbeingLabel = getWellbeingLabel(wellbeingScore);
        const wellbeingColor = getWellbeingColor(wellbeingScore);
        
        return `
        <div class="client-card" style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                        <h4 style="margin: 0; color: #1a2332; font-size: 20px; font-weight: 600;">${escapeHtml(client.name)}</h4>
                        <span style="padding: 4px 12px; background: ${client.status === 'active' ? '#d4edda' : '#f8d7da'}; color: ${client.status === 'active' ? '#155724' : '#721c24'}; border-radius: 12px; font-size: 12px; font-weight: 500;">
                            ${client.status === 'active' ? 'Activo' : client.status === 'inactive' ? 'Inactivo' : 'Pendiente'}
                        </span>
                    </div>
                    <div style="color: #666; font-size: 14px; margin-bottom: 4px;">
                        <strong>Contacto:</strong> ${escapeHtml(client.contactName || 'N/A')}
                    </div>
                    <div style="color: #666; font-size: 14px; margin-bottom: 4px;">
                        <strong>Email:</strong> ${escapeHtml(client.contactEmail)}
                    </div>
                    ${client.contactPhone ? `<div style="color: #666; font-size: 14px; margin-bottom: 4px;">
                        <strong>Teléfono:</strong> ${escapeHtml(client.contactPhone)}
                    </div>` : ''}
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-secondary" onclick="openEditClientModal('${client.id}')" style="padding: 8px 16px; font-size: 14px;">Editar</button>
                    <button class="btn-primary" onclick="openImportCSVModal('${client.id}', '${escapeHtml(client.name)}')" style="padding: 8px 16px; font-size: 14px;">Importar CSV</button>
                </div>
            </div>
            
            <!-- Score de Bienestar -->
            ${wellbeingScore !== null ? `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 20px; margin-bottom: 20px; color: white;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Score de Bienestar General</div>
                        <div style="display: flex; align-items: baseline; gap: 12px;">
                            <div style="font-size: 48px; font-weight: bold;">${wellbeingScore}</div>
                            <div style="font-size: 18px; opacity: 0.9;">${wellbeingLabel}</div>
                            <div style="font-size: 14px; opacity: 0.7;">/ 100</div>
                        </div>
                    </div>
                </div>
                <div style="margin-top: 12px; height: 8px; background: rgba(255,255,255,0.3); border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; width: ${wellbeingScore}%; background: white; border-radius: 4px; transition: width 0.3s ease;"></div>
                </div>
            </div>
            ` : `
            <div style="background: #f5f7fa; border-radius: 12px; padding: 20px; margin-bottom: 20px; text-align: center; color: #666;">
                <div style="font-size: 14px; margin-bottom: 8px;">Score de Bienestar General</div>
                <div style="font-size: 24px;">Sin datos disponibles</div>
            </div>
            `}
            
            <!-- Estadísticas -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 16px;">
                <div style="text-align: center; padding: 16px; background: #e3f2fd; border-radius: 8px;">
                    <div style="font-size: 32px; font-weight: bold; color: #1976d2; margin-bottom: 4px;">${stats.teachers}</div>
                    <div style="font-size: 12px; color: #666; font-weight: 500;">Profesores</div>
                </div>
                <div style="text-align: center; padding: 16px; background: #ffebee; border-radius: 8px;">
                    <div style="font-size: 32px; font-weight: bold; color: #d32f2f; margin-bottom: 4px;">${stats.students}</div>
                    <div style="font-size: 12px; color: #666; font-weight: 500;">Estudiantes</div>
                </div>
                <div style="text-align: center; padding: 16px; background: #e3f2fd; border-radius: 8px;">
                    <div style="font-size: 32px; font-weight: bold; color: #1976d2; margin-bottom: 4px;">${stats.classes}</div>
                    <div style="font-size: 12px; color: #666; font-weight: 500;">Clases</div>
                </div>
                <div style="text-align: center; padding: 16px; background: #e8f5e9; border-radius: 8px;">
                    <div style="font-size: 32px; font-weight: bold; color: #388e3c; margin-bottom: 4px;">${stats.surveys}</div>
                    <div style="font-size: 12px; color: #666; font-weight: 500;">Encuestas</div>
                </div>
                <div style="text-align: center; padding: 16px; background: #ffebee; border-radius: 8px;">
                    <div style="font-size: 32px; font-weight: bold; color: #d32f2f; margin-bottom: 4px;">${stats.activities}</div>
                    <div style="font-size: 12px; color: #666; font-weight: 500;">Actividades</div>
                </div>
                <div style="text-align: center; padding: 16px; background: #e0f2f1; border-radius: 8px;">
                    <div style="font-size: 32px; font-weight: bold; color: #00796b; margin-bottom: 4px;">${stats.messages}</div>
                    <div style="font-size: 12px; color: #666; font-weight: 500;">Mensajes</div>
                </div>
            </div>
            
            ${client.notes ? `<div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e8eef5; color: #666; font-size: 14px;">
                <strong>Notas:</strong> ${escapeHtml(client.notes)}
            </div>` : ''}
        </div>
        `;
    }).join('');
}

// Abrir modal para crear cliente
function openCreateClientModal() {
    currentEditingClientId = null;
    document.getElementById('clientModalTitle').textContent = 'Nuevo Cliente';
    document.getElementById('clientForm').reset();
    document.getElementById('clientModal').style.display = 'flex';
}

// Abrir modal para editar cliente
async function openEditClientModal(clientId) {
    try {
        currentEditingClientId = clientId;
        
        // Verificar si estamos en modo offline
        const isFileProtocol = window.location.protocol === 'file:';
        
        if (isFileProtocol) {
            // Modo offline: cargar desde localStorage
            const clients = JSON.parse(localStorage.getItem('clients') || '[]');
            const client = clients.find(c => c.id === clientId);
            
            if (client) {
                document.getElementById('clientModalTitle').textContent = 'Editar Cliente';
                document.getElementById('clientName').value = client.name || '';
                document.getElementById('clientContactEmail').value = client.contactEmail || '';
                document.getElementById('clientContactPhone').value = client.contactPhone || '';
                document.getElementById('clientContactName').value = client.contactName || '';
                document.getElementById('clientNotes').value = client.notes || '';
                document.getElementById('clientModal').style.display = 'flex';
            } else {
                showMessage('Cliente no encontrado', 'error');
            }
            return;
        }
        
        const token = localStorage.getItem('authToken');
        const apiConfig = window.API_CONFIG || {};
        const apiBaseUrl = apiConfig.BASE_URL || 'http://localhost:3000/api';
        
        // Verificar que la URL sea válida
        if (!apiBaseUrl.startsWith('http://') && !apiBaseUrl.startsWith('https://')) {
            // Fallback a localStorage
            const clients = JSON.parse(localStorage.getItem('clients') || '[]');
            const client = clients.find(c => c.id === clientId);
            if (client) {
                document.getElementById('clientModalTitle').textContent = 'Editar Cliente';
                document.getElementById('clientName').value = client.name || '';
                document.getElementById('clientContactEmail').value = client.contactEmail || '';
                document.getElementById('clientContactPhone').value = client.contactPhone || '';
                document.getElementById('clientContactName').value = client.contactName || '';
                document.getElementById('clientNotes').value = client.notes || '';
                document.getElementById('clientModal').style.display = 'flex';
            }
            return;
        }
        
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        try {
            const response = await fetch(`${apiBaseUrl}/clients/${clientId}`, {
                method: 'GET',
                headers: headers
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    const client = result.data;
                    document.getElementById('clientModalTitle').textContent = 'Editar Cliente';
                    document.getElementById('clientName').value = client.name;
                    document.getElementById('clientContactEmail').value = client.contactEmail;
                    document.getElementById('clientContactPhone').value = client.contactPhone || '';
                    document.getElementById('clientContactName').value = client.contactName || '';
                    document.getElementById('clientNotes').value = client.notes || '';
                    document.getElementById('clientModal').style.display = 'flex';
                    return;
                }
            }
        } catch (fetchError) {
            console.warn('⚠️ Error al conectar con el backend, usando localStorage:', fetchError.message);
        }
        
        // Fallback a localStorage
        const clients = JSON.parse(localStorage.getItem('clients') || '[]');
        const client = clients.find(c => c.id === clientId);
        if (client) {
            document.getElementById('clientModalTitle').textContent = 'Editar Cliente';
            document.getElementById('clientName').value = client.name || '';
            document.getElementById('clientContactEmail').value = client.contactEmail || '';
            document.getElementById('clientContactPhone').value = client.contactPhone || '';
            document.getElementById('clientContactName').value = client.contactName || '';
            document.getElementById('clientNotes').value = client.notes || '';
            document.getElementById('clientModal').style.display = 'flex';
        } else {
            showMessage('Cliente no encontrado', 'error');
        }
    } catch (error) {
        console.error('Error al cargar cliente:', error);
        showMessage('Error al cargar el cliente', 'error');
    }
}

// Cerrar modal de cliente
function closeClientModal() {
    document.getElementById('clientModal').style.display = 'none';
    currentEditingClientId = null;
}

// Manejar envío del formulario de cliente
async function handleClientSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('clientName').value.trim(),
        contactEmail: document.getElementById('clientContactEmail').value.trim(),
        contactPhone: document.getElementById('clientContactPhone').value.trim() || null,
        contactName: document.getElementById('clientContactName').value.trim() || null,
        notes: document.getElementById('clientNotes').value.trim() || null
    };
    
    // Validar campos requeridos
    if (!formData.name || !formData.contactEmail) {
        showMessage('Por favor, completa los campos requeridos (Nombre y Email)', 'error');
        return;
    }
    
    // Verificar si estamos en modo offline
    const isFileProtocol = window.location.protocol === 'file:';
    
    if (isFileProtocol) {
        // Modo offline: guardar en localStorage
        saveClientToLocalStorage(formData);
        return;
    }
    
    try {
        const token = localStorage.getItem('authToken');
        const apiConfig = window.API_CONFIG || {};
        const apiBaseUrl = apiConfig.BASE_URL || 'http://localhost:3000/api';
        
        // Verificar que la URL sea válida
        if (!apiBaseUrl.startsWith('http://') && !apiBaseUrl.startsWith('https://')) {
            saveClientToLocalStorage(formData);
            return;
        }
        
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const url = currentEditingClientId 
            ? `${apiBaseUrl}/clients/${currentEditingClientId}`
            : `${apiBaseUrl}/clients`;
        const method = currentEditingClientId ? 'PUT' : 'POST';
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    showMessage(currentEditingClientId ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente', 'success');
                    closeClientModal();
                    loadClients();
                    return;
                } else {
                    showMessage(result.message || 'Error al guardar cliente', 'error');
                    return;
                }
            } else {
                const error = await response.json();
                showMessage(error.message || 'Error al guardar cliente', 'error');
                return;
            }
        } catch (fetchError) {
            console.warn('⚠️ Error al conectar con el backend, guardando localmente:', fetchError.message);
            saveClientToLocalStorage(formData);
        }
    } catch (error) {
        console.error('Error al guardar cliente:', error);
        saveClientToLocalStorage(formData);
    }
}

// Guardar cliente en localStorage (modo offline)
function saveClientToLocalStorage(formData) {
    try {
        const clients = JSON.parse(localStorage.getItem('clients') || '[]');
        
        if (currentEditingClientId) {
            // Editar cliente existente
            const index = clients.findIndex(c => c.id === currentEditingClientId);
            if (index !== -1) {
                clients[index] = {
                    ...clients[index],
                    ...formData,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Crear nuevo cliente
            const newClient = {
                id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                ...formData,
                status: 'active',
                totalUsers: 0,
                totalStudents: 0,
                totalTeachers: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            clients.push(newClient);
        }
        
        localStorage.setItem('clients', JSON.stringify(clients));
        showMessage(
            currentEditingClientId ? 'Cliente actualizado exitosamente (modo offline)' : 'Cliente creado exitosamente (modo offline)',
            'success'
        );
        closeClientModal();
        loadClients();
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
        showMessage('Error al guardar cliente', 'error');
    }
}

// Abrir modal para importar CSV
function openImportCSVModal(clientId, clientName) {
    currentImportingClientId = clientId;
    document.getElementById('importCSVClientName').textContent = `Cliente: ${clientName}`;
    document.getElementById('csvFileInput').value = '';
    document.getElementById('csvPreview').style.display = 'none';
    document.getElementById('csvImportStatus').style.display = 'none';
    document.getElementById('importCSVBtn').disabled = true;
    csvFileData = null;
    document.getElementById('importCSVModal').style.display = 'flex';
}

// Cerrar modal de importar CSV
function closeImportCSVModal() {
    document.getElementById('importCSVModal').style.display = 'none';
    currentImportingClientId = null;
    csvFileData = null;
}

// Manejar selección de archivo CSV
function handleCSVFileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            const lines = csv.trim().split('\n');
            if (lines.length < 2) {
                showMessage('El CSV debe tener al menos una fila de encabezados y una fila de datos', 'error');
                return;
            }
            
            const headers = lines[0].split(',').map(h => h.trim());
            const preview = [];
            
            for (let i = 1; i < Math.min(lines.length, 6); i++) {
                const values = lines[i].split(',').map(v => v.trim());
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                preview.push(row);
            }
            
            // Parsear todo el CSV
            const users = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                if (values.length === headers.length) {
                    const user = {};
                    headers.forEach((header, index) => {
                        const value = values[index];
                        // Para password, mantener string vacío si no hay valor (se generará automáticamente)
                        if (header === 'password') {
                            user[header] = value || '';
                        } else {
                            user[header] = value === '' ? null : value;
                        }
                    });
                    users.push(user);
                }
            }
            
            csvFileData = users;
            
            // Mostrar preview
            const previewContent = preview.map((row, idx) => 
                `<div style="margin-bottom: 8px; padding: 8px; background: white; border-radius: 4px;">
                    <strong>Fila ${idx + 2}:</strong> ${row.name || 'N/A'} (${row.email || 'N/A'}) - ${row.role || 'N/A'}
                </div>`
            ).join('');
            
            document.getElementById('csvPreviewContent').innerHTML = previewContent;
            document.getElementById('csvPreview').style.display = 'block';
            document.getElementById('importCSVBtn').disabled = false;
            
            if (users.length > preview.length) {
                document.getElementById('csvPreviewContent').innerHTML += `<div style="margin-top: 8px; color: #666; font-style: italic;">... y ${users.length - preview.length} fila(s) más</div>`;
            }
        } catch (error) {
            console.error('Error al procesar CSV:', error);
            showMessage('Error al procesar el archivo CSV', 'error');
        }
    };
    reader.readAsText(file);
}

// Importar CSV a cliente
async function importCSVToClient() {
    if (!csvFileData || !currentImportingClientId) {
        showMessage('Por favor, selecciona un archivo CSV válido', 'error');
        return;
    }
    
    // Verificar si estamos en modo offline
    const isFileProtocol = window.location.protocol === 'file:';
    
    if (isFileProtocol) {
        // Modo offline: guardar usuarios en localStorage
        importCSVToLocalStorage();
        return;
    }
    
    try {
        const token = localStorage.getItem('authToken');
        const apiConfig = window.API_CONFIG || {};
        const apiBaseUrl = apiConfig.BASE_URL || 'http://localhost:3000/api';
        
        // Verificar que la URL sea válida
        if (!apiBaseUrl.startsWith('http://') && !apiBaseUrl.startsWith('https://')) {
            importCSVToLocalStorage();
            return;
        }
        
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        document.getElementById('importCSVBtn').disabled = true;
        document.getElementById('importCSVBtn').textContent = 'Importando...';
        
        try {
            const response = await fetch(`${apiBaseUrl}/clients/${currentImportingClientId}/import-users`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ users: csvFileData })
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    const summary = result.summary;
                    document.getElementById('csvImportStatus').innerHTML = `
                        <div style="padding: 15px; background: #d4edda; border-radius: 8px; color: #155724;">
                            <strong>✅ Importación completada</strong><br>
                            Total: ${summary.total} | Creados: ${summary.created} | Errores: ${summary.errors} | Saltados: ${summary.skipped}<br>
                            Estudiantes: ${summary.students} | Profesores: ${summary.teachers}
                        </div>
                    `;
                    document.getElementById('csvImportStatus').style.display = 'block';
                    showMessage('Usuarios importados exitosamente', 'success');
                    
                    // Recargar clientes después de 2 segundos
                    setTimeout(() => {
                        loadClients();
                        closeImportCSVModal();
                    }, 2000);
                    return;
                } else {
                    showMessage(result.message || 'Error al importar usuarios', 'error');
                }
            } else {
                const error = await response.json();
                showMessage(error.message || 'Error al importar usuarios', 'error');
            }
        } catch (fetchError) {
            console.warn('⚠️ Error al conectar con el backend, guardando localmente:', fetchError.message);
            importCSVToLocalStorage();
        }
    } catch (error) {
        console.error('Error al importar CSV:', error);
        importCSVToLocalStorage();
    } finally {
        document.getElementById('importCSVBtn').disabled = false;
        document.getElementById('importCSVBtn').textContent = 'Importar Usuarios';
    }
}

// Importar CSV a localStorage (modo offline)
function importCSVToLocalStorage() {
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const clients = JSON.parse(localStorage.getItem('clients') || '[]');
        
        const client = clients.find(c => c.id === currentImportingClientId);
        if (!client) {
            showMessage('Cliente no encontrado', 'error');
            return;
        }
        
        let created = 0;
        let skipped = 0;
        let errors = 0;
        let studentsCount = 0;
        let teachersCount = 0;
        
        csvFileData.forEach(userData => {
            try {
                // Validar datos requeridos
                if (!userData.email || !userData.name || !userData.role) {
                    errors++;
                    return;
                }
                
                // Verificar si el usuario ya existe
                if (users.find(u => u.email === userData.email)) {
                    skipped++;
                    return;
                }
                
                // Crear usuario
                // Limpiar y normalizar datos
                const cleanEmail = (userData.email || '').trim().toLowerCase();
                const cleanPassword = (userData.password || '').trim();
                const cleanName = (userData.name || '').trim();
                
                const newUser = {
                    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name: cleanName,
                    email: cleanEmail,
                    password: cleanPassword || `temp${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
                    role: (userData.role || '').trim().toLowerCase(),
                    clientId: currentImportingClientId,
                    classCode: userData.classCode ? (userData.classCode || '').trim() : null,
                    age: userData.age ? parseInt(userData.age) : null,
                    gender: userData.gender ? (userData.gender || '').trim() : null,
                    avatar: 'student',
                    createdAt: new Date().toISOString()
                };
                
                users.push(newUser);
                created++;
                
                if (userData.role === 'student') {
                    studentsCount++;
                } else {
                    teachersCount++;
                }
            } catch (error) {
                errors++;
            }
        });
        
        // Actualizar contadores del cliente
        client.totalUsers = (client.totalUsers || 0) + created;
        client.totalStudents = (client.totalStudents || 0) + studentsCount;
        client.totalTeachers = (client.totalTeachers || 0) + teachersCount;
        
        // Guardar
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('clients', JSON.stringify(clients));
        
        // Mostrar resumen
        document.getElementById('csvImportStatus').innerHTML = `
            <div style="padding: 15px; background: #d4edda; border-radius: 8px; color: #155724;">
                <strong>✅ Importación completada (modo offline)</strong><br>
                Total: ${csvFileData.length} | Creados: ${created} | Errores: ${errors} | Saltados: ${skipped}<br>
                Estudiantes: ${studentsCount} | Profesores: ${teachersCount}
            </div>
        `;
        document.getElementById('csvImportStatus').style.display = 'block';
        showMessage('Usuarios importados exitosamente (modo offline)', 'success');
        
        // Actualizar contadores del cliente en localStorage
        client.totalUsers = (client.totalUsers || 0) + created;
        client.totalStudents = (client.totalStudents || 0) + studentsCount;
        client.totalTeachers = (client.totalTeachers || 0) + teachersCount;
        client.updatedAt = new Date().toISOString();
        
        // Actualizar cliente en el array
        const clientIndex = clients.findIndex(c => c.id === client.id);
        if (clientIndex !== -1) {
            clients[clientIndex] = client;
            localStorage.setItem('clients', JSON.stringify(clients));
        }
        
        // Recargar clientes después de 2 segundos
        setTimeout(() => {
            loadClients();
            closeImportCSVModal();
        }, 2000);
    } catch (error) {
        console.error('Error al importar CSV a localStorage:', error);
        showMessage('Error al importar usuarios', 'error');
    }
}

// Función auxiliar para escapar HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Actualizar loadOwnerDashboard para cargar clientes
const originalLoadOwnerDashboard = loadOwnerDashboard;
loadOwnerDashboard = async function() {
    await originalLoadOwnerDashboard();
    await loadClients();
};
