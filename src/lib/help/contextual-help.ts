import type { I18nLocale } from "@/src/i18n/config";
import { stripLocalePrefix } from "@/src/i18n/routing";
import { applyProductBranding } from "@/src/lib/product/branding";

export type ContextualHelpArticle = {
  title: string;
  summary: string;
  whatYouSee: string[];
  whatToDo: string[];
  outcome: string;
  note?: string;
};

type HelpArticleKey =
  | "home"
  | "login"
  | "signup"
  | "verifyEmail"
  | "forgotPassword"
  | "billing"
  | "dashboard"
  | "archive"
  | "newPoll"
  | "pollManage"
  | "ownerMeeting"
  | "ops"
  | "publicVote"
  | "publicResults"
  | "privacy"
  | "terms"
  | "generic";

const helpArticles: Record<I18nLocale, Record<HelpArticleKey, ContextualHelpArticle>> = {
  ca: {
    home: {
      title: "Com començar",
      summary:
        "Aquesta és la portada de Summa Reu. Des d'aquí pots entrar com a entitat o donar d'alta un espai nou.",
      whatYouSee: [
        "La proposta de valor del servei: consensuar dates, fer la reunió i obtenir l'acta.",
        "Els accessos principals per entrar o registrar l'entitat.",
        "Informació bàsica de funcionament, facturació i preguntes freqüents.",
      ],
      whatToDo: [
        "Si ja tens entitat, prem Accés entitat.",
        "Si encara no tens espai, prem Donar d'alta entitat i completa el registre.",
        "Un cop dins, ves a Convocar reunió per començar la primera proposta de dates.",
      ],
      outcome: "Arribaràs al punt d'entrada correcte per començar a operar sense suport manual.",
    },
    login: {
      title: "Accés de l'entitat",
      summary: "Aquí entren les persones responsables de l'entitat amb el seu correu i contrasenya.",
      whatYouSee: [
        "El formulari d'accés principal.",
        "L'accés a recuperació de contrasenya i reenviament de verificació.",
      ],
      whatToDo: [
        "Escriu el correu i la contrasenya de l'entitat.",
        "Si encara no has verificat el correu, obre Reenviar correu de verificació.",
        "Si no recordes la contrasenya, obre Has oblidat la contrasenya?.",
      ],
      outcome: "Quan l'accés sigui correcte entraràs al tauler de reunions i votacions.",
    },
    signup: {
      title: "Alta de l'entitat",
      summary:
        "Aquesta pantalla serveix per crear l'espai de treball de l'entitat i deixar-lo preparat per començar a convocar reunions.",
      whatYouSee: [
        "Un resum del pla i dels beneficis inclosos.",
        "El formulari amb les dades bàsiques de l'entitat i de la persona responsable.",
        "L'acceptació legal mínima per activar l'espai.",
      ],
      whatToDo: [
        "Completa el nom de l'entitat, la persona responsable, el correu i la contrasenya.",
        "Accepta privacitat i condicions.",
        "Envia el formulari i revisa el correu per verificar l'accés abans d'entrar.",
      ],
      outcome: "L'entitat quedarà creada i preparada per validar el correu i activar la subscripció.",
    },
    verifyEmail: {
      title: "Verificació del correu",
      summary: "Aquesta pantalla et serveix per reenviar el correu de verificació si encara no has pogut accedir.",
      whatYouSee: [
        "Un formulari molt curt per indicar el correu d'accés.",
        "El missatge que confirma si l'enviament s'ha fet correctament.",
      ],
      whatToDo: [
        "Escriu el correu amb què vas donar d'alta l'entitat.",
        "Prem el botó d'enviament i revisa la safata d'entrada.",
        "Quan el correu estigui verificat, torna a la pantalla d'accés.",
      ],
      outcome: "Recuperaràs l'accés sense necessitat d'intervenció manual.",
    },
    forgotPassword: {
      title: "Recuperar la contrasenya",
      summary: "Si no recordes la contrasenya, aquí pots demanar un correu segur per restablir-la.",
      whatYouSee: [
        "Un formulari per indicar el correu d'accés de l'entitat.",
        "El missatge que confirma que el correu de recuperació s'ha enviat.",
      ],
      whatToDo: [
        "Escriu el correu de l'entitat.",
        "Demana l'enllaç de recuperació.",
        "Obre el correu i defineix una contrasenya nova abans de tornar a entrar.",
      ],
      outcome: "Podràs tornar a entrar a l'espai sense suport humà.",
    },
    billing: {
      title: "Subscripció i facturació",
      summary:
        "Aquesta pantalla serveix per activar la subscripció o obrir el portal segur de Stripe per gestionar-la.",
      whatYouSee: [
        "L'estat actual de la subscripció de l'entitat.",
        "L'accés al checkout o al portal de facturació, segons l'estat del compte.",
      ],
      whatToDo: [
        "Si l'espai encara no està actiu, prem Activar subscripció.",
        "Si ja està actiu, prem Gestionar subscripció per revisar cobrament o mètode de pagament.",
        "Quan la subscripció estigui activa, torna al tauler per convocar reunions.",
      ],
      outcome: "L'espai queda activat i llest per començar a convocar reunions.",
    },
    dashboard: {
      title: "Tauler principal",
      summary:
        "Aquí pots començar una convocatòria nova, seguir les que tens obertes i anar a l'arxiu quan necessitis recuperar documentació.",
      whatYouSee: [
        "El botó principal per convocar una reunió nova.",
        "Les convocatòries actives i les reunions ja convocades per avui o més endavant.",
        "L'accés directe a l'arxiu d'actes i reunions passades.",
      ],
      whatToDo: [
        "Per començar un nou procés, prem Convocar reunió.",
        "Per continuar una convocatòria oberta, prem Gestionar sobre la targeta corresponent.",
        "Per recuperar una acta o una reunió antiga, obre l'arxiu.",
      ],
      outcome: "Des d'aquí pots entrar a qualsevol punt del cicle sense perdre't.",
    },
    archive: {
      title: "Arxiu de reunions i actes",
      summary:
        "Aquesta pantalla reuneix l'històric de reunions ja celebrades perquè puguis localitzar documentació sense saturar el tauler principal.",
      whatYouSee: [
        "El recompte de reunions arxivades, actes disponibles i reunions encara sense acta.",
        "La llista completa de reunions passades amb el seu estat d'acta.",
        "Accessos directes per obrir la reunió, l'acta, els resultats o exportar el document.",
      ],
      whatToDo: [
        "Obre l'acta quan necessitis revisar o compartir la documentació d'una reunió passada.",
        "Entra a la reunió si vols comprovar la transcripció o editar el contingut.",
        "Utilitza els resultats o la gestió quan necessitis recuperar el context de la convocatòria original.",
      ],
      outcome: "Tindràs un repositori únic i ordenat per consultar l'històric sense allargar la portada.",
    },
    newPoll: {
      title: "Convocar reunió",
      summary:
        "Aquesta pantalla és el primer pas del procés: proposes dates i hores perquè la junta, assemblea o patronat indiquin disponibilitat.",
      whatYouSee: [
        "Els camps per definir títol i context de la reunió.",
        "La graella per seleccionar dies i hores candidates.",
        "La previsualització de les opcions que rebran les persones participants.",
      ],
      whatToDo: [
        "Posa un títol clar i, si cal, una descripció breu.",
        "Selecciona les franges de data i hora que vols sotmetre a disponibilitat.",
        "Desa la convocatòria per generar l'enllaç públic que compartiràs amb les persones participants.",
      ],
      outcome: "Obtindràs una proposta de dates llesta per compartir i començar a recollir disponibilitat.",
    },
    pollManage: {
      title: "Gestionar convocatòria",
      summary:
        "Aquesta pantalla et deixa seguir la disponibilitat rebuda, tancar la proposta i preparar la convocatòria definitiva.",
      whatYouSee: [
        "Els passos següents del procés, el recompte de respostes i els accessos ràpids.",
        "La taula de resultats amb totes les opcions de data i hora.",
        "Quan la convocatòria ja està tancada, l'enllaç final de reunió i l'ICS per enviar-la.",
      ],
      whatToDo: [
        "Comparteix l'enllaç de votació si encara estàs recollint disponibilitat.",
        "Revisa quina opció guanya i tanca la convocatòria amb la millor data.",
        "Quan hi hagi reunió preparada, copia la invitació final o descarrega l'ICS per enviar-ho al grup.",
      ],
      outcome: "Sortiràs d'aquí amb una data consensuada i la reunió final preparada per convocar-se.",
    },
    ownerMeeting: {
      title: "Realitzar la reunió i obtenir l'acta",
      summary:
        "Des d'aquí pots entrar a la sala, gravar la reunió i revisar la transcripció i l'acta.",
      whatYouSee: [
        "La informació bàsica de la reunió i el panell de control per entrar-hi o gravar-la.",
        "La convocatòria final amb l'enllaç de reunió i l'arxiu ICS.",
        "La transcripció, l'estat del processament i l'editor de l'acta.",
      ],
      whatToDo: [
        "Obre la sala de reunió i fes que les persones participants s'hi connectin.",
        "Inicia i atura la gravació quan correspongui, informant prèviament les persones assistents.",
        "Quan acabi el processament, revisa la transcripció i edita l'acta abans d'exportar-la.",
      ],
      outcome: "Podràs celebrar la reunió, obtenir l'esborrany d'acta i deixar-lo validat des del mateix espai.",
      note: "Si veus l'estat de processament actiu, espera uns instants i la pantalla s'actualitzarà sola.",
    },
    ops: {
      title: "Incidències i processament",
      summary:
        "Aquest espai serveix per revisar incidències de gravacions o processos que s'hagin quedat aturats. No cal fer-lo servir en el dia a dia.",
      whatYouSee: [
        "Alertes recents i estat general de l'espai.",
        "Els últims jobs de processament de gravacions.",
        "Accions de reintent o drenatge si alguna reunió ha quedat encallada.",
      ],
      whatToDo: [
        "Entra aquí només si una gravació o una acta no avança correctament.",
        "Revisa l'estat del job afectat i el missatge d'error, si n'hi ha.",
        "Utilitza les accions de reintent només per reprendre un processament que ha fallat.",
      ],
      outcome: "Podràs reprendre processos encallats sense tocar dades manualment.",
    },
    publicVote: {
      title: "Respondre disponibilitat",
      summary:
        "Aquesta és la pantalla que veu una persona participant. Aquí només ha d'indicar en quines dates o hores pot assistir.",
      whatYouSee: [
        "El títol i la descripció de la reunió proposada.",
        "Les opcions de data i hora disponibles per marcar.",
        "L'accés als resultats públics, si cal veure com va la proposta.",
      ],
      whatToDo: [
        "Escriu el teu nom.",
        "Marca totes les opcions en què pots assistir.",
        "Envia la resposta i, si cal, torna a obrir l'enllaç per revisar o ajustar la teva disponibilitat.",
      ],
      outcome: "La teva disponibilitat quedarà registrada perquè l'entitat pugui consensuar la millor data.",
    },
    publicResults: {
      title: "Resultats de disponibilitat",
      summary:
        "Aquesta pantalla mostra com està quedant la proposta de dates perquè es pugui visualitzar quines opcions tenen més consens.",
      whatYouSee: [
        "El recompte de disponibilitat per a cada opció.",
        "La identificació visual de les franges amb més suport.",
        "L'estat de la convocatòria: oberta, en procés o tancada.",
      ],
      whatToDo: [
        "Consulta quines opcions concentren més disponibilitat.",
        "Si ets participant, espera que l'entitat decideixi la data final.",
        "Si ets responsable de l'entitat, torna a Gestionar per tancar la convocatòria quan ja tinguis prou respostes.",
      ],
      outcome: "Tindràs una lectura ràpida del consens abans de fixar la reunió definitiva.",
    },
    privacy: {
      title: "Privacitat",
      summary: "Aquí pots revisar com es tracten les dades personals i les gravacions dins del servei.",
      whatYouSee: [
        "La política de privacitat vigent.",
        "La informació sobre tractament de dades, gravacions i finalitats del servei.",
      ],
      whatToDo: [
        "Llegeix aquest text si necessites validar l'encaix legal del servei dins de la teva entitat.",
        "Utilitza'l també abans d'acceptar el registre o d'informar les persones participants sobre gravació.",
      ],
      outcome: "Disposaràs del text de referència per operar amb més seguretat jurídica.",
    },
    terms: {
      title: "Condicions del servei",
      summary: "Aquesta pantalla recull les condicions d'ús i el marc general del servei per a l'entitat.",
      whatYouSee: [
        "El text de condicions vigent.",
        "Les regles generals d'ús, responsabilitats i abast del servei.",
      ],
      whatToDo: [
        "Revisa aquest contingut abans de donar d'alta l'entitat o si has de compartir les condicions amb el teu equip.",
        "Torna aquí sempre que necessitis comprovar els termes vigents del servei.",
      ],
      outcome: "Tindràs una referència clara de les condicions aplicables a l'espai de l'entitat.",
    },
    generic: {
      title: "Ajuda d'aquesta pantalla",
      summary:
        "Aquesta ajuda canvia segons la pantalla on et trobes. Si aquí veus un missatge general, continua seguint el menú principal del producte.",
      whatYouSee: [
        "La informació i les accions pròpies de la pantalla actual.",
        "Els accessos principals al menú superior per continuar el procés.",
      ],
      whatToDo: [
        "Llegeix el títol principal de la pantalla per confirmar on ets.",
        "Si estàs preparant una reunió, segueix el recorregut Tauler > Convocar reunió > Gestionar > Reunió.",
        "Si tens una incidència d'accés o facturació, fes servir les pantalles específiques del menú.",
      ],
      outcome: "Podràs reprendre el procés principal encara que arribis a una pantalla menys freqüent.",
    },
  },
  es: {
    home: {
      title: "Cómo empezar",
      summary:
        "Esta es la portada de Summa Reu. Desde aquí puedes entrar como entidad o dar de alta un espacio nuevo.",
      whatYouSee: [
        "La propuesta de valor del servicio: consensuar fechas, hacer la reunión y obtener el acta.",
        "Los accesos principales para entrar o registrar la entidad.",
        "Información básica de funcionamiento, facturación y preguntas frecuentes.",
      ],
      whatToDo: [
        "Si ya tienes entidad, pulsa Acceso entidad.",
        "Si todavía no tienes espacio, pulsa Dar de alta entidad y completa el registro.",
        "Una vez dentro, ve a Convocar reunión para empezar la primera propuesta de fechas.",
      ],
      outcome: "Llegarás al punto de entrada correcto para empezar a operar sin soporte manual.",
    },
    login: {
      title: "Acceso de la entidad",
      summary: "Aquí entran las personas responsables de la entidad con su correo y contraseña.",
      whatYouSee: [
        "El formulario de acceso principal.",
        "El acceso a recuperación de contraseña y reenvío de verificación.",
      ],
      whatToDo: [
        "Escribe el correo y la contraseña de la entidad.",
        "Si aún no has verificado el correo, abre Reenviar correo de verificación.",
        "Si no recuerdas la contraseña, abre Has olvidado la contraseña?.",
      ],
      outcome: "Cuando el acceso sea correcto entrarás al panel de reuniones y votaciones.",
    },
    signup: {
      title: "Alta de la entidad",
      summary:
        "Esta pantalla sirve para crear el espacio de trabajo de la entidad y dejarlo preparado para empezar a convocar reuniones.",
      whatYouSee: [
        "Un resumen del plan y de los beneficios incluidos.",
        "El formulario con los datos básicos de la entidad y de la persona responsable.",
        "La aceptación legal mínima para activar el espacio.",
      ],
      whatToDo: [
        "Completa el nombre de la entidad, la persona responsable, el correo y la contraseña.",
        "Acepta privacidad y condiciones.",
        "Envía el formulario y revisa el correo para verificar el acceso antes de entrar.",
      ],
      outcome: "La entidad quedará creada y preparada para validar el correo y activar la suscripción.",
    },
    verifyEmail: {
      title: "Verificación del correo",
      summary: "Esta pantalla te sirve para reenviar el correo de verificación si todavía no has podido acceder.",
      whatYouSee: [
        "Un formulario muy corto para indicar el correo de acceso.",
        "El mensaje que confirma si el envío se ha hecho correctamente.",
      ],
      whatToDo: [
        "Escribe el correo con el que diste de alta la entidad.",
        "Pulsa el botón de envío y revisa la bandeja de entrada.",
        "Cuando el correo esté verificado, vuelve a la pantalla de acceso.",
      ],
      outcome: "Recuperarás el acceso sin necesidad de intervención manual.",
    },
    forgotPassword: {
      title: "Recuperar la contraseña",
      summary: "Si no recuerdas la contraseña, aquí puedes pedir un correo seguro para restablecerla.",
      whatYouSee: [
        "Un formulario para indicar el correo de acceso de la entidad.",
        "El mensaje que confirma que el correo de recuperación se ha enviado.",
      ],
      whatToDo: [
        "Escribe el correo de la entidad.",
        "Pide el enlace de recuperación.",
        "Abre el correo y define una contraseña nueva antes de volver a entrar.",
      ],
      outcome: "Podrás volver a entrar al espacio sin soporte humano.",
    },
    billing: {
      title: "Suscripción y facturación",
      summary:
        "Esta pantalla sirve para activar la suscripción o abrir el portal seguro de Stripe para gestionarla.",
      whatYouSee: [
        "El estado actual de la suscripción de la entidad.",
        "El acceso al checkout o al portal de facturación, según el estado de la cuenta.",
      ],
      whatToDo: [
        "Si el espacio aún no está activo, pulsa Activar suscripción.",
        "Si ya está activo, pulsa Gestionar suscripción para revisar cobro o método de pago.",
        "Cuando la suscripción esté activa, vuelve al panel para convocar reuniones.",
      ],
      outcome: "El espacio queda activado y listo para empezar a convocar reuniones.",
    },
    dashboard: {
      title: "Panel principal",
      summary:
        "Aquí puedes empezar una convocatoria nueva, seguir las que tienes abiertas e ir al archivo cuando necesites recuperar documentación.",
      whatYouSee: [
        "El botón principal para convocar una reunión nueva.",
        "Las convocatorias activas y las reuniones ya convocadas para hoy o más adelante.",
        "El acceso directo al archivo de actas y reuniones pasadas.",
      ],
      whatToDo: [
        "Para empezar un nuevo proceso, pulsa Convocar reunión.",
        "Para continuar una convocatoria abierta, pulsa Gestionar sobre la tarjeta correspondiente.",
        "Para recuperar un acta o una reunión antigua, abre el archivo.",
      ],
      outcome: "Desde aquí puedes entrar en cualquier punto del ciclo sin perderte.",
    },
    archive: {
      title: "Archivo de reuniones y actas",
      summary:
        "Esta pantalla reúne el histórico de reuniones ya celebradas para que puedas localizar documentación sin saturar el panel principal.",
      whatYouSee: [
        "El recuento de reuniones archivadas, actas disponibles y reuniones todavía sin acta.",
        "La lista completa de reuniones pasadas con su estado de acta.",
        "Accesos directos para abrir la reunión, el acta, los resultados o exportar el documento.",
      ],
      whatToDo: [
        "Abre el acta cuando necesites revisar o compartir la documentación de una reunión pasada.",
        "Entra en la reunión si quieres comprobar la transcripción o editar el contenido.",
        "Utiliza los resultados o la gestión cuando necesites recuperar el contexto de la convocatoria original.",
      ],
      outcome: "Tendrás un repositorio único y ordenado para consultar el histórico sin alargar la portada.",
    },
    newPoll: {
      title: "Convocar reunión",
      summary:
        "Esta pantalla es el primer paso del proceso: propones fechas y horas para que la junta, asamblea o patronato indiquen disponibilidad.",
      whatYouSee: [
        "Los campos para definir título y contexto de la reunión.",
        "La cuadrícula para seleccionar días y horas candidatas.",
        "La previsualización de las opciones que recibirán las personas participantes.",
      ],
      whatToDo: [
        "Pon un título claro y, si hace falta, una descripción breve.",
        "Selecciona las franjas de fecha y hora que quieres someter a disponibilidad.",
        "Guarda la convocatoria para generar el enlace público que compartirás con las personas participantes.",
      ],
      outcome: "Obtendrás una propuesta de fechas lista para compartir y empezar a recoger disponibilidad.",
    },
    pollManage: {
      title: "Gestionar convocatoria",
      summary:
        "Esta pantalla te permite seguir la disponibilidad recibida, cerrar la propuesta y preparar la convocatoria definitiva.",
      whatYouSee: [
        "Los siguientes pasos del proceso, el recuento de respuestas y los accesos rápidos.",
        "La tabla de resultados con todas las opciones de fecha y hora.",
        "Cuando la convocatoria ya está cerrada, el enlace final de reunión y el ICS para enviarla.",
      ],
      whatToDo: [
        "Comparte el enlace de votación si todavía estás recogiendo disponibilidad.",
        "Revisa qué opción gana y cierra la convocatoria con la mejor fecha.",
        "Cuando haya reunión preparada, copia la invitación final o descarga el ICS para enviarlo al grupo.",
      ],
      outcome: "Saldrás de aquí con una fecha consensuada y la reunión final preparada para convocarse.",
    },
    ownerMeeting: {
      title: "Realizar la reunión y obtener el acta",
      summary:
        "Desde aquí puedes entrar en la sala, grabar la reunión y revisar la transcripción y el acta.",
      whatYouSee: [
        "La información básica de la reunión y el panel de control para entrar o grabarla.",
        "La convocatoria final con el enlace de reunión y el archivo ICS.",
        "La transcripción, el estado del procesamiento y el editor del acta.",
      ],
      whatToDo: [
        "Abre la sala de reunión y haz que las personas participantes se conecten.",
        "Inicia y detén la grabación cuando corresponda, informando previamente a las personas asistentes.",
        "Cuando termine el procesamiento, revisa la transcripción y edita el acta antes de exportarla.",
      ],
      outcome: "Podrás celebrar la reunión, obtener el borrador de acta y dejarlo validado desde el mismo espacio.",
      note: "Si ves el estado de procesamiento activo, espera unos instantes y la pantalla se actualizará sola.",
    },
    ops: {
      title: "Incidencias y procesamiento",
      summary:
        "Este espacio sirve para revisar incidencias de grabaciones o procesos que se hayan quedado atascados. No hace falta usarlo en el día a día.",
      whatYouSee: [
        "Alertas recientes y estado general del espacio.",
        "Los últimos jobs de procesamiento de grabaciones.",
        "Acciones de reintento o drenaje si alguna reunión ha quedado atascada.",
      ],
      whatToDo: [
        "Entra aquí solo si una grabación o un acta no avanza correctamente.",
        "Revisa el estado del job afectado y el mensaje de error, si existe.",
        "Utiliza las acciones de reintento solo para reanudar un procesamiento que ha fallado.",
      ],
      outcome: "Podrás reanudar procesos atascados sin tocar datos manualmente.",
    },
    publicVote: {
      title: "Responder disponibilidad",
      summary:
        "Esta es la pantalla que ve una persona participante. Aquí solo tiene que indicar en qué fechas u horas puede asistir.",
      whatYouSee: [
        "El título y la descripción de la reunión propuesta.",
        "Las opciones de fecha y hora disponibles para marcar.",
        "El acceso a los resultados públicos, si hace falta ver cómo va la propuesta.",
      ],
      whatToDo: [
        "Escribe tu nombre.",
        "Marca todas las opciones en las que puedes asistir.",
        "Envía la respuesta y, si hace falta, vuelve a abrir el enlace para revisar o ajustar tu disponibilidad.",
      ],
      outcome: "Tu disponibilidad quedará registrada para que la entidad pueda consensuar la mejor fecha.",
    },
    publicResults: {
      title: "Resultados de disponibilidad",
      summary:
        "Esta pantalla muestra cómo está quedando la propuesta de fechas para visualizar qué opciones tienen más consenso.",
      whatYouSee: [
        "El recuento de disponibilidad para cada opción.",
        "La identificación visual de las franjas con más apoyo.",
        "El estado de la convocatoria: abierta, en proceso o cerrada.",
      ],
      whatToDo: [
        "Consulta qué opciones concentran más disponibilidad.",
        "Si eres participante, espera a que la entidad decida la fecha final.",
        "Si eres responsable de la entidad, vuelve a Gestionar para cerrar la convocatoria cuando ya tengas suficientes respuestas.",
      ],
      outcome: "Tendrás una lectura rápida del consenso antes de fijar la reunión definitiva.",
    },
    privacy: {
      title: "Privacidad",
      summary: "Aquí puedes revisar cómo se tratan los datos personales y las grabaciones dentro del servicio.",
      whatYouSee: [
        "La política de privacidad vigente.",
        "La información sobre tratamiento de datos, grabaciones y finalidades del servicio.",
      ],
      whatToDo: [
        "Lee este texto si necesitas validar el encaje legal del servicio dentro de tu entidad.",
        "Úsalo también antes de aceptar el registro o de informar a las personas participantes sobre grabación.",
      ],
      outcome: "Dispondrás del texto de referencia para operar con más seguridad jurídica.",
    },
    terms: {
      title: "Condiciones del servicio",
      summary: "Esta pantalla recoge las condiciones de uso y el marco general del servicio para la entidad.",
      whatYouSee: [
        "El texto de condiciones vigente.",
        "Las reglas generales de uso, responsabilidades y alcance del servicio.",
      ],
      whatToDo: [
        "Revisa este contenido antes de dar de alta la entidad o si tienes que compartir las condiciones con tu equipo.",
        "Vuelve aquí siempre que necesites comprobar los términos vigentes del servicio.",
      ],
      outcome: "Tendrás una referencia clara de las condiciones aplicables al espacio de la entidad.",
    },
    generic: {
      title: "Ayuda de esta pantalla",
      summary:
        "Esta ayuda cambia según la pantalla en la que estás. Si aquí ves un mensaje general, sigue usando el menú principal del producto.",
      whatYouSee: [
        "La información y las acciones propias de la pantalla actual.",
        "Los accesos principales del menú superior para continuar el proceso.",
      ],
      whatToDo: [
        "Lee el título principal de la pantalla para confirmar dónde estás.",
        "Si estás preparando una reunión, sigue el recorrido Panel > Convocar reunión > Gestionar > Reunión.",
        "Si tienes una incidencia de acceso o facturación, utiliza las pantallas específicas del menú.",
      ],
      outcome: "Podrás retomar el proceso principal aunque llegues a una pantalla menos frecuente.",
    },
  },
};

const helpRouteMatchers: Array<{ key: HelpArticleKey; pattern: RegExp }> = [
  { key: "publicResults", pattern: /^\/p\/[^/]+\/results\/?$/ },
  { key: "publicVote", pattern: /^\/p\/[^/]+\/?$/ },
  { key: "ownerMeeting", pattern: /^\/owner\/meetings\/[^/]+\/?$/ },
  { key: "ownerMeeting", pattern: /^\/meetings\/[^/]+\/?$/ },
  { key: "newPoll", pattern: /^\/polls\/new\/?$/ },
  { key: "pollManage", pattern: /^\/polls\/[^/]+\/?$/ },
  { key: "dashboard", pattern: /^\/dashboard\/?$/ },
  { key: "archive", pattern: /^\/archive\/?$/ },
  { key: "billing", pattern: /^\/billing\/?$/ },
  { key: "ops", pattern: /^\/ops\/?$/ },
  { key: "login", pattern: /^\/login\/?$/ },
  { key: "signup", pattern: /^\/signup\/?$/ },
  { key: "verifyEmail", pattern: /^\/verify-email\/?$/ },
  { key: "forgotPassword", pattern: /^\/forgot-password\/?$/ },
  { key: "privacy", pattern: /^\/privacy\/?$/ },
  { key: "terms", pattern: /^\/terms\/?$/ },
  { key: "home", pattern: /^\/$/ },
];

function normalizeHelpPathname(pathname: string): string {
  const withoutQuery = pathname.split("?")[0] ?? pathname;
  const stripped = stripLocalePrefix(withoutQuery || "/");
  if (stripped.length > 1 && stripped.endsWith("/")) {
    return stripped.slice(0, -1);
  }

  return stripped || "/";
}

export function resolveContextualHelpKey(pathname: string): HelpArticleKey {
  const normalizedPath = normalizeHelpPathname(pathname);
  const matched = helpRouteMatchers.find((item) => item.pattern.test(normalizedPath));
  return matched?.key ?? "generic";
}

export function resolveContextualHelp(pathname: string, locale: I18nLocale): ContextualHelpArticle {
  return applyProductBranding(helpArticles[locale][resolveContextualHelpKey(pathname)], locale);
}
