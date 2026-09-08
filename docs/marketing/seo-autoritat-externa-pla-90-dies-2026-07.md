# Pla SEO i d’autoritat per a un SaaS inicial — 90 dies

## Revisió vigent — 7 de setembre de 2026

Aquesta revisió substitueix el pla pendent de juliol. La secció històrica inferior conserva antecedents, no autoritzacions noves. Model: Astra; anàlisi i coordinació en el fil existent, sense eina disponible per canviar model/esforç.

**Conclusió:** la visibilitat de la quinzena ha millorat lleument, però no els clics. No es pot atribuir una millora al paquet SEO del 31 d’agost: en els cinc dies complets posteriors disponibles, els indicadors són inferiors als dels mateixos dies de la setmana anterior. Prioritat: mesura fiable, millor aprofitament de quatre pàgines existents i autoritat sectorial externa.

### Impacte de les darreres dues setmanes

Lectura autenticada de Search Console i GA4 el 07/09/2026. Es compara el 23/08–05/09 amb el 09/08–22/08: són els últims 14 dies disponibles a l’informe de Search Console consultat, no dades fins al mateix dia 7. Search Console: cerca Web, tots els països i dispositius; no són mètriques exclusivament de marca, Espanya o Catalunya.

| Indicador | 09–22 agost | 23 agost–5 setembre | Lectura |
|---|---:|---:|---|
| Impressions Google | 122 | 142 | +20; +16,4% |
| Clics Google | 1 | 1 | Sense creixement |
| CTR | 0,8% | 0,7% | Lleu baixada; valors arrodonits de la UI |
| Posició mitjana | 37,2 | 29,8 | Millora agregada de 7,4 posicions |
| Sessions GA4 | 2 | 4 | Només +2 sessions mesurades |
| Sessions orgàniques GA4 | 0 | 1 | Mostra mínima |
| Sessions amb interacció GA4 | 2 | 1 | No acompanya la pujada de sessions |
| Esdeveniments clau GA4 | 0 | 0 | Cap conversió clau registrada |

GA4 només observa trànsit amb consentiment i la instrumentació disponible: zero esdeveniments clau no prova zero converses per correu, telèfon o WhatsApp. No s’han consultat missatges privats ni enviat formularis de prova. No es pot valorar conversió comercial amb aquesta mostra.

El paquet integrat el 31/08 (`b71725288`, canvi `2598f3c5e`) modifica títols, descripcions i contingut de donacions/software ONG, textos d’enllaços relacionats i respostes 404 a sondes PHP/WordPress; també millora el lector d’analítica. El registre local de deploy inclou la publicació de les 15:05 del 31/08. Avui s’ha verificat directament la presència dels nous títol, H1, descripció, canonical i hreflang CA/ES a `/es/control-donacions-ong`, i `404` amb `noindex` a `/wp-login.php`. Això acredita aquests comportaments públics, no tota la revisió desplegada.

Comparació més propera al canvi, excloent el dia del desplegament i igualant dies de setmana:

| Search Console | 25–29 agost | 1–5 setembre |
|---|---:|---:|
| Impressions | 57 | 50 |
| Clics | 1 | 0 |
| CTR | 1,8% | 0% |
| Posició mitjana | 24,6 | 35,0 |

**No hi ha impacte positiu demostrable del paquet del 31/08. Tampoc hi ha prou evidència per atribuir-li un perjudici.** Cinc dies, un sol clic de referència, canvis en la barreja de consultes i estacionalitat impedeixen una conclusió causal. No s’han de revertir títols basant-se només en això. La millora de posició agregada de la quinzena no equival a millorar cadascuna de les consultes.

Detall de pàgines de la quinzena (anterior → actual):

- `/es/control-donacions-ong`: 20 → 20 impressions; 0 → 1 clic. L’únic clic actual és anterior al tram 1–5/09.
- `/es/software-gestion-ong`: 58 → 60 impressions; 0 clics als dos períodes.
- Article ES de devolucions: 3 → 15 impressions; 0 clics.
- `/es/certificats-donacio`: 9 → 14 impressions; 0 clics.
- Article ES d’imputació de personal: 1 → 8 impressions; 0 clics.

Consultes visibles: `software de gestion para ong` 27 → 32 impressions; `programa gestion ong` 21 → 21; `gestion de donaciones` 17 → 14. Totes amb 0 clics. Les consultes visibles no cobreixen necessàriament els totals del domini per les omissions de Search Console.

### Auditoria del web i de la presència pública

**Actius ja disponibles, verificats al web viu:** portada amb preus i enfocament operatiu; pestanya Socis i donants funcional; blog amb peça del 26/08 sobre tancament trimestral i article de devolucions amb títol revisat; cas Flores; pàgina de confiança; enllaç a plantilla de conciliació; correu, telèfon i WhatsApp públics. No cal tornar a proposar la creació del cas o la pàgina de confiança: existeixen.

**Friccions a corregir:**

1. La portada no dona la mateixa visibilitat al cas real, confiança i plantilla que el peu del blog. Afegir aquests enllaços prop de la proposta de valor i del contacte.
2. El titular principal animat posa el focus en donacions/quotes/informes. Provar un titular estable que expliqui la categoria: «Gestió econòmica per a associacions i ONG, del banc a la justificació», conservant una descripció precisa del producte.
3. «Demanar una demo» porta al formulari de contacte genèric. Donar continuïtat al text del formulari: què veurem, quina informació cal i quin és el següent pas. No prometre terminis que no es puguin sostenir. La recepció efectiva del formulari queda pendent d’una prova autoritzada.
4. El peu encara diu que LinkedIn i Instagram arribaran aviat. Posar només canals realment actius; prioritzar LinkedIn i presència sectorial abans d’obrir més fronts.
5. Aprofitar captures i demos existents a les landings. A la portada, un recorregut curt que mostri extracte → moviment → document → informe pot explicar millor el producte. Mesurar-lo, no assumir que convertirà millor.

**SEO tècnic observat:** sitemap públic amb 92 URL; metadades de donacions coherents i indexables; robots permet contingut públic i restringeix rutes internes. Search Console (actualització 04/09) mostra 92 pàgines indexades i 96 excloses: 27 redireccions, 21 no trobades, 13 noindex, 1 bloquejada per robots, 1 alternativa canònica, 30 rastrejades sense indexar i 3 amb canonical diferent escollit per Google. Els 92 elements del sitemap i les 92 pàgines indexades no s’han creuat URL a URL: no es pot afirmar que coincideixen. Revisar primer si entre les 30 i les 3 hi ha pàgines comercials prioritàries. No intentar indexar accessos, duplicats o 404 deliberats.

**Autoritat externa:** l’informe d’enllaços de Search Console mostra 7 enllaços externs, tots cap a `/ca`, agrupats en blogspot.com (3), netlify.app (3) i vercel.app (1). És una mostra de Google, no un cens complet; aquests dominis allotjadors no permeten jutjar la qualitat dels llocs sense obrir-los. No es proposa desautoritzar-los. Falta evidència de referències sectorials sòlides en aquest informe.

La cerca pública localitza un comentari de Raül al post de SinergiaTIC sobre SinergiaR3S, convidant a afegir Summa. És una interacció pròpia visible, no una recomanació editorial ni una alta confirmada al directori, i no acredita activitat nova en aquesta quinzena. Altres resultats amb noms similars corresponen a una agència de màrqueting i a una institució educativa: no atribuir-ne ressenyes, seguidors ni interaccions a aquest producte. Cal mantenir nom + descriptor + domini consistents.

### Posicionament recomanat

**Summa Social: gestió econòmica per a entitats que necessiten relacionar bancs, donants, documents i justificacions.** Catalunya com a mercat de relació i contingut en català; castellà per captar les consultes que ja generen impressions. Validar aquesta prioritat comercial amb Raül abans d’ampliar mercats.

Berrly comunica gestió de socis, cobraments, comunicacions i esdeveniments; SinergiaCRM presenta una gestió integral de la base social. L’oportunitat de Summa és demostrar el seu circuit econòmic amb exemples concrets, no proclamar una superioritat funcional sense prova. No es disposa d’un rànquing comparatiu geolocalitzat ni d’una auditoria completa dels competidors.

Prioritat de contingut comercial: donacions/donants, software de gestió econòmica, certificats i devolucions. Conservar URL existents; diferenciar intenció informativa dels articles i intenció comercial de les landings. Revisar possibles solapaments entre gestió de donants, control de donacions i gestió econòmica abans de crear més pàgines.

### Pla d’execució proposat — 90 dies a partir de l’aprovació

| Termini | Acció concreta | Responsable proposat | Evidència de finalització |
|---|---|---|---|
| Dies 1–7 | Reparar l’accés de lectura automàtica a GSC/GA4; conservar comparació manual mentre falla; separar marca/no marca, Espanya, CA/ES, pàgina i dispositiu | Responsable tècnic; Raül si cal autoritzar permisos | Informe amb fonts disponibles i períodes exactes |
| Dies 1–7 | Inspeccionar les 4 pàgines prioritàries a Google i creuar-les amb les exclusions; comprovar consentiment i esdeveniments de contacte; prova mòbil i rendiment | Responsable tècnic | Indexació/canonical de cada URL i prova documentada; cap enviament real sense autorització |
| Dies 8–21 | Millorar les 4 pàgines existents amb resposta inicial clara, captura/demo útil, procés real, preguntes de compra, límits i CTA coherent | Responsable tècnic prepara; Raül valida missatge | Paquet revisable CA/ES, validació visual i deploy autoritzat |
| Dies 8–21 | Portar cas Flores, confiança i recurs a portada; substituir l’anunci de xarxes futures per canals verificats | Responsable tècnic | Recorregut portada → prova → contacte verificat |
| Dies 15–30 | Reforçar la plantilla existent i la checklist trimestral amb exemple sintètic complet, autoria i data de revisió | Responsable editorial amb coneixement del sector | 1 recurs que resol un problema i enllaça amb la solució corresponent; revisió experta del contingut fiscal |
| Dies 15–45 | Preparar 10 relacions sectorials reals; començar per verificar l’estat de SinergiaR3S, ecosistema Semilla i col·laboradors coneguts | Raül selecciona/autoritzacions; Codex prepara | Fitxa de cada contacte, encaix, peça útil i missatge; sense enviaments automàtics |
| Dies 22–60 | Publicar amb autorització 1 peça pràctica setmanal a LinkedIn i proposar 1 sessió demostrativa amb un aliat | Raül/editorial | Converses amb professionals identificats, visites referides i demos; no només reaccions |
| Dies 45–90 | Buscar 3 mencions editorials rellevants i 1 col·laboració formativa; reforçar només temes amb resposta comercial | Raül i aliats, sense compromís previ de tercers | Mencions publicades i verificades, pàgines de destinació i contactes atribuïbles |
| Dies 30, 60 i 90 | Revisar consultes i conversions; decidir què aprofundir, corregir o aturar | Raül + responsable tècnic | Comparació de 28 dies i decisió basada en nombres absoluts |

Cap compra de trànsit, eina, enllaç o subscripció prevista. Estimació de planificació, no pressupost: 2–3 jornades inicials de mesura/UX/SEO i 3–4 hores setmanals d’edició i distribució durant 12 setmanes. Si només es disposa de 2 hores setmanals, prioritzar dues landings i relacions càlides; ajornar vídeo nou i Instagram.

### Objectius i criteris de decisió

Objectiu de negoci: converses qualificades amb responsables d’entitats amb necessitat, encaix i voluntat de valorar una demo. Un clic o una visita no ho acredita.

- Dia 7: poder llegir mètriques de manera reproduïble i saber quines pàgines prioritàries estan indexades.
- Dia 30: quatre recorreguts comercials clars, recurs útil distribuïble i línia base segmentada.
- Dia 90, objectius de treball, no previsions: 3 mencions sectorials verificades, 1 sessió amb un aliat i 3 converses qualificades atribuïdes a orgànic/referència. Revisar aquestes metes al dia 30 amb el volum real.
- Aspiració a 6–12 mesos: entrar al top 3 d’un conjunt curt de consultes específiques i optar al primer lloc on hi hagi demanda i encaix. Definir les consultes, país, idioma i dispositiu després de recuperar una línia base suficient; no prometre «número 1 als cercadors» en general.
- Mesurar clics/impressions no de marca, posició per consulta i landing, sessions orgàniques, intents de contacte, formularis confirmats i demos qualificades. Amb aquestes mostres, mostrar xifres absolutes abans de percentatges.
- Revisió inicial del paquet del 31/08: comparar 01–14/09 amb 18–31/08 quan les dades siguin completes, indicant que el control inclou el dia del canvi. Per una lectura més estable, 01–28/09 contra 03–30/08, amb cautela per estacionalitat i altres canvis. Sense atribució causal automàtica.

Per ser citables per cercadors amb IA: respostes comprensibles en HTML, autoria, exemples originals, fonts, identitat coherent i referències externes. Ni `llms.txt`, ni IndexNow, ni visites de robots acrediten recomanacions o contactes. Google indica que les bases SEO continuen aplicant-se a les seves funcions generatives.

### Fonts, límits i següent pas

- [Search Console: comparació quinzenal](https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3Asummasocial.app&start_date=20260823&end_date=20260905&compare_start_date=20260809&compare_end_date=20260822).
- [Search Console: tram posterior al canvi](https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3Asummasocial.app&start_date=20260901&end_date=20260905&compare_start_date=20260825&compare_end_date=20260829).
- [GA4, propietat 547126832](https://analytics.google.com/analytics/web/#/a402384810p547126832/reports/intelligenthome): adquisició de trànsit, dates 23/08–05/09 contra 09–22/08 llegides a la UI. L’enllaç no fixa dates.
- [Indexació](https://search.google.com/search-console/index?resource_id=sc-domain%3Asummasocial.app) i [enllaços](https://search.google.com/search-console/links?resource_id=sc-domain%3Asummasocial.app), llegits autenticadament el 07/09.
- Web viu: [portada](https://summasocial.app/ca), [blog](https://summasocial.app/ca/blog), [donacions](https://summasocial.app/es/control-donacions-ong), [cas Flores](https://summasocial.app/ca/casos/flores-de-kiskeya), [confiança](https://summasocial.app/ca/confianza), [sitemap](https://summasocial.app/sitemap.xml).
- [Interacció indexada al post de SinergiaTIC](https://es.linkedin.com/posts/sinergiatic_inicio-sinergiar3s-activity-7457339212527292416-w9kD). Mostra de cerca pública, no auditoria completa de perfils socials.
- [Berrly: associacions](https://www.berrly.com/es/solucion/software-asociaciones/) i [SinergiaCRM](https://www.sinergiatic.org/es/sinergiacrm/): missatge comercial propi, no prova independent de funcionalitat.
- [Google: evolució dels resultats i terminis](https://developers.google.com/search/docs/appearance/core-updates?hl=en), [SEO per a funcions generatives](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).
- Fonts locals: `git show b71725288`, `docs/DEPLOY-LOG.md`, `scripts/marketing/marketing-report.mjs`; lectura automàtica avui falla per `insufficient authentication scopes` a GSC i GA4, resolta per a aquesta revisió mitjançant lectura al navegador, no reparada tècnicament.

Alguns resultats del cercador mostren versions antigues de les pàgines: s’ha prioritzat el navegador i l’HTML viu per diagnosticar el web. No s’han mesurat Core Web Vitals ni provat tot el web en mòbil. No hi ha comprovació d’enviament/recepció del formulari, rendiment privat de xarxes ni cens complet de backlinks.

Raül ha indicat «comença» el 07/09 i s’ha iniciat el primer paquet en el worktree `codex-marketing-20260907-185955`, amb aprovació registrada del supervisor. S’han verificat quatre landings indexades/canonical coherent, preparat el mode d’informe que falla si no hi ha analítica i millorat localment l’explicació de la demo al contacte CA/ES. Proves enfocades 14/14, typecheck, i18n i comprovació local CA/ES correctes. Els dos documents del pla s’han preservat i traslladat a aquest worktree abans de tocar codi.

Revisió final del supervisor aprovada i registrada el 07/09/2026, paquet `20260907T170721Z-20260907t165554z-seo-setembre-primer-paquet-de-m`. Primer paquet local complet. Següent pas: autorització dels passos externs de lectura OAuth i enviament del sitemap, detallats a [estat de mesura](mesura-posicionament-visites-2026-07.md). Les pàgines de donacions i software ONG encara mostren rastrejos anteriors al canvi del 31/08; no modificar-ne canonical ni atribuir-los millores prematures. No hi ha merge, push, deploy, permisos nous ni enviaments. La resta del pla de 90 dies continua pendent; aquest paquet no l’acaba.

## Antecedent històric — pla de juliol de 2026

El que segueix documenta el punt de partida de juliol. Les tasques i autoritzacions descrites pertanyen a aquell paquet, no al nou pla de setembre.

## Punt de partida

Summa Social és un SaaS nou amb dues entitats usuàries reals. Això canvia l’estratègia: encara no hi ha prou volum de clients, dades o marca per competir amb garanties per cerques molt àmplies com `software ONG`.

Durant els pròxims 90 dies l’objectiu no és prometre primers llocs, sinó construir tres actius que permetin créixer amb credibilitat:

1. una prova d’ús real publicable;
2. pàgines comercials clares i prudents, amb confiança verificable;
3. distribució sectorial basada en relacions reals i contingut útil.

## Lectura actual de Search Console

La revisió del 27 de juliol de 2026 confirma que el web ja té senyals inicials, però encara poc volum: 275 impressions, 11 clics, un CTR del 4% i una posició mitjana de 8,8 en els darrers tres mesos.

La primera oportunitat no és una consulta genèrica de software. La landing castellana de certificats de donació acumula 54 impressions i 3 clics, mentre que un article sobre devolucions de rebuts acumula 52 impressions i cap clic. Per tant, el primer paquet d’optimització ha de reforçar certificats, donants, remeses i devolucions abans de crear noves URL.

Search Console també mostra 42 URL rastrejades però no indexades. La majoria de landings comercials ja limiten correctament la indexació a CA/ES; cal reforçar els enllaços interns cap a aquestes versions i evitar que els recursos auxiliars, com els subtítols `.vtt`, apareguin com a candidats de contingut.

## Mercat i intencions prioritàries

El focus comercial és Catalunya i Espanya. Les pàgines catalanes i castellanes han de respondre problemes concrets de responsables d’administració, coordinació i tresoreria d’entitats socials.

| Intenció | Pàgina catalana | Pàgina castellana |
|---|---|---|
| Software de gestió per a ONG | `/ca/software-gestion-ong` | `/es/software-gestion-ong` |
| Programa per a associacions | `/ca/programa-associacions` | `/es/programa-associacions` |
| Gestió econòmica d’entitats | `/ca/gestio-economica-ong` | `/es/gestio-economica-ong` |
| Conciliació, donants, remeses i fiscalitat | Landing específica del procés | Landing específica del procés |
| Prova d’ús real | `/ca/casos/flores-de-kiskeya` | `/es/casos/flores-de-kiskeya` |
| Confiança i dades | `/ca/confianza` | `/es/confianza` |

No s’han de crear traduccions o articles només per augmentar el nombre d’URL. Cada pàgina nova ha de respondre una pregunta observada en converses reals.

## Les tres modificacions prioritàries

### 1. Convertir l’ús real en prova pública creïble

Publicar un únic cas identificat: **Fundación Flores de Kiskeya**.

Abast publicable actual:

- és una entitat usuària real de Summa Social;
- ús qualitatiu relacionat amb moviments bancaris, documentació i control economicoadministratiu;
- enllaç a la web oficial de l’entitat;
- connexió amb les pàgines de gestió econòmica i contacte.

Límits:

- cap xifra interna, captura, document o dada d’operació;
- cap cita o testimonial sense consentiment específic;
- cap logotip sense autorització d’ús;
- cap resultat quantitatiu o estalvi de temps no mesurat i validat;
- no presentar Flores com un aval comercial formal.

Amb només dues entitats usuàries, un cas honest és més valuós que tres casos incomplets. La segona entitat només s’ha d’incorporar quan hi hagi permís i una història verificable.

### 2. Reforçar confiança i precisió abans de generar més contingut

Accions sobre el web:

- retirar textos interns o editorials visibles al públic;
- substituir promeses absolutes —com `sense errors` o `pràcticament sol`— per beneficis defensables: menys feina manual, millor control i passos de revisió;
- publicar una pàgina CA/ES de confiança basada en funcionalitats i documents vigents;
- explicar permisos, traçabilitat documental, suport i sortida de dades sense inventar certificacions ni auditories;
- enllaçar el cas real i la pàgina de confiança des de superfícies públiques rellevants;
- mantenir canonical, hreflang i sitemap coherents en CA/ES.

No es publicarà encara una guia fiscal. Qualsevol recurs sobre Model 182, Model 347 o tancament anual necessita revisió fiscal i editorial específica abans d’indexar-se.

### 3. Distribuir coneixement útil dins del sector, sense una campanya artificial d’enllaços

Durant 90 dies, prioritzar converses càlides amb entitats, assessories, federacions i persones que ja coneixen l’equip. L’objectiu de cada conversa és entendre una fricció i, només si hi ha encaix editorial, compartir una pàgina útil.

Ritme operatiu proposat:

- preparar una llista curta de fins a 10 relacions reals;
- registrar les preguntes que es repeteixen en demos i suport;
- actualitzar primer una landing existent quan la resposta ja hi encaixa;
- publicar com a màxim una peça nova si resol una pregunta recurrent i pot ser revisada per una persona experta;
- proposar una menció o enllaç només quan aporta context a una pàgina real d’un aliat;
- no comprar enllaços, no usar directoris massius i no repetir textos d’ancoratge exactes.

Qualsevol correu, contacte extern o petició d’enllaç requereix autorització prèvia de Raül. Aquest pla prepara la selecció i els textos, però no autoritza enviaments.

## Seqüència de 90 dies

### Dies 1–30: base verificable

- publicar el cas Flores i la pàgina de confiança;
- corregir claims absoluts i textos interns;
- verificar indexabilitat, canonical, hreflang i sitemap;
- establir una línia base de Search Console, si l’accés està disponible;
- anotar la font dels contactes comercials de manera simple, sense afegir eines noves.

### Dies 31–60: aprenentatge comercial

- revisar les consultes i pàgines amb impressions no vinculades a marca;
- agrupar preguntes repetides de demos i suport;
- millorar una o dues landings existents amb aquestes preguntes;
- preparar una possible peça de referència i sotmetre-la a revisió experta abans de publicar;
- seleccionar relacions càlides on compartir el cas o una guia aporti valor real.

### Dies 61–90: distribució i decisió

- executar només els contactes autoritzats;
- comprovar si les mencions generen visites o converses qualificades;
- decidir si convé aprofundir en una intenció concreta o aturar contingut que no aporta demanda;
- preparar un segon cas només si hi ha permís, evidència i una història diferent de la de Flores.

## Mesura

Les mètriques serveixen per decidir, no per prometre posicions.

### Indicadors mensuals

- impressions i clics no vinculats a `Summa Social` a Espanya;
- consultes en català i rendiment de les pàgines `/ca/` com a aproximació al mercat català;
- pàgines que comencen a rebre impressions per problemes concrets;
- contactes i demos qualificades procedents de cerca orgànica o referència;
- mencions editorials noves i visites que generen;
- preguntes comercials que es repeteixen i poden millorar el producte o el web.

Search Console permet filtrar per país, però no dona una lectura completa i exacta de Catalunya. La posició catalana s’ha de contrastar amb consultes en català, pàgines CA i, si cal, una mostra manual o una eina de seguiment geolocalitzada.

### Consultes de treball

- `software gestió ONG` / `software gestión ONG`;
- `programa gestió associacions` / `programa gestión asociaciones`;
- `gestió econòmica ONG` / `gestión económica ONG`;
- `conciliació bancària ONG` / `conciliación bancaria ONG`;
- `gestió donants ONG` / `gestión donantes ONG`;
- `remeses SEPA associacions` / `remesas SEPA asociaciones`;
- `Model 182 ONG` / `Modelo 182 ONG`.

No cal intentar posicionar totes les consultes alhora. Cada mes s’ha de prioritzar la intenció que mostri millor combinació d’impressions, encaix de producte i converses qualificades.

## Autoritzacions i límits vigents

Autoritzat:

- publicar el nom de Fundación Flores de Kiskeya com a entitat usuària real;
- desplegar els canvis SEO CA/ES aprovats.

No autoritzat sense confirmació addicional:

- logotip, captures, cites, xifres o dades internes de Flores;
- enviament de correus o peticions d’enllaç;
- publicació d’una guia fiscal sense revisió específica;
- afirmacions de resultats, certificacions o garanties no verificades.
