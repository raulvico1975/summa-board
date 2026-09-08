# Sistema de mesura de posicionament, visites i contactes

## Accés analític operatiu — 08/09/2026 11:13 Europe/Madrid

Bloqueig resolt en aquest fil amb instrucció de Raül de continuar al navegador intern. Administrador verificat `summasocialapp@gmail.com`, projecte `summa-social-agents` / `189230633984`. S’ha afegit només `raul.vico.ferre@gmail.com` als usuaris de prova i verificat la fila. Aplicació conservada en estat Prueba, sense publicar ni canviar branding/IAM. S’han habilitat i verificat com «Habilitada» només `searchconsole.googleapis.com` i `analyticsdata.googleapis.com`; no s’ha activat facturació.

OAuth complet amb compte Raül i client installed existent; PKCE/state validats i scopes exactes `webmasters.readonly` + `analytics.readonly`. Autorització renovable local fora del repositori, mode600, sota `~/.config/summa-social-marketing`; cap valor de token als documents. Renovació provada sense navegador: access token només en memòria/entorn efímer. Limitació vigent: l’app continua en mode extern Prueba; Google fixa caducitat de 7 dies al refresh token amb aquests scopes. Caldrà renovar el consentiment o tramitar separadament el pas a producció de l’app OAuth, que no s’ha autoritzat ni executat. Font: https://developers.google.com/identity/protocols/oauth2#expiration.

**Prova real reeixida:** informe `--require-analytics --no-hosting`, codi **0**, GSC i GA4 disponibles. Artefactes: `tmp/marketing/seo-20260908/summa-marketing-2026-09-06-14d.md` i `.json` en aquest worktree. Finestra 24/08–06/09 versus 10/08–23/08: impressions **147 / 128**, clics **1 / 1**, posició mitjana **29,5 / 37,4**, sessions **4 / 2**, usuaris actius **3 / 1**, pàgines vistes **4 / 3**. Esdeveniments de contacte observats: 0; no equival a absència de converses comercials per altres canals. No atribuir causalitat als canvis ni al sitemap enviat el 07/09, posterior al període.

Fonts: navegador autenticat Google Auth Platform i APIs/serveis; informe real de les dues API. Aprovacions registrades del supervisor: `20260908T090540Z-raul-demana-continua-tu-al-nav-intern-despres-in` i `20260908T090937Z-tester-afegit-i-fila-verificada-oauth-complet-co`. Cap merge, push, deploy ni canvi de codi de projecte. El paquet de contacte CA/ES continua local. Pròxim pas: publicar-lo quan Raül ho autoritzi i comparar noves finestres quan hi hagi dades suficients. No s’ha creat cap monitor programat.

### Antecedent del bloqueig, resolt pel registre anterior


Raül ha autoritzat explícitament els dos scopes de lectura i conservar l’autorització local fora del repositori. No cal tornar a demanar aquesta mateixa autorització. Intent executat amb client installed existent `summa-social-agents`; Google identifica l’aplicació com **summa-drive-desktop**. El compte `raul.vico.ferre@gmail.com` rep **403 access_denied**: aplicació en proves, accés reservat als testers aprovats. Desenvolupador indicat per Google: `summasocialapp@gmail.com`.

Comprovació directa de https://console.cloud.google.com/auth/audience?project=summa-social-agents amb el compte de Raül: «Necesitas acceso adicional»; falten `oauthconfig.testusers.get`, `oauthconfig.verification.get` i `resourcemanager.projects.get`. No s’ha modificat públic, IAM ni cap altre permís. Pròxim pas: l’administrador del projecte ha d’afegir `raul.vico.ferre@gmail.com` als usuaris de prova de l’aplicació. Després es pot reprendre la connexió de només lectura ja autoritzada.

No s’ha obtingut ni guardat cap token, no s’ha executat l’informe i el servidor de retorn local s’ha aturat. El camí gcloud s’ha descartat perquè exigia `cloud-platform`; no s’ha demanat ni concedit aquest scope. Alternativa local preparada amb Python estàndard, PKCE, state i retorn 127.0.0.1, aprovada pel supervisor al paquet `20260908T084855Z-ajust-procediment-oauth-autoritzat-gcloud-no-lau`; cap dependència ni canvi de codi al repositori. Fitxer auxiliar sense credencials incrustades: `~/.config/summa-social-marketing/connect-readonly.py`.

### Preparació anterior del mateix dia (substituïda pel resultat anterior)


S’ha localitzat un client OAuth de tipus `installed` del projecte `summa-social-agents`, amb retorn `http://localhost`, al fitxer local de Downloads amb sufix `91f2apnmvmgf9kjdr6n31c1qm830fc60.apps.googleusercontent.com.json`. Només s’han llegit metadades; cap secret copiat al document. Cal verificar la identitat presentada per Google durant el consentiment abans de concedir accés; el fitxer local no acredita per si sol la vigència del client.

Proposta concreta pendent d’autorització: utilitzar aquest client per concedir exclusivament `webmasters.readonly` i `analytics.readonly` al compte de Raül, per consultar `sc-domain:summasocial.app` i GA4 `547126832`. Els permisos poden llegir altres propietats accessibles al compte. Conservar l’autorització localment fora del repositori en una configuració específica d’analítica, sense substituir les credencials generals que utilitzen altres projectes. No s’ha iniciat OAuth ni s’ha creat cap credencial nova.

La documentació instal·lada de Google Cloud confirma `--client-id-file` i `--scopes`, i adverteix que l’accés ADC habitual sobreescriu credencials prèvies: per això el procediment ha d’aïllar la configuració. Font: `gcloud auth application-default login --help` i https://docs.cloud.google.com/docs/authentication/application-default-credentials. Següent pas: autorització explícita de Raül i revisió del supervisor abans d’iniciar el flux. La publicació del paquet local continua pendent i no forma part d’aquesta autorització.

## Estat verificat el 7 de setembre de 2026

### Primer paquet iniciat després de «comença»

Treball local a `codex/marketing-20260907-185955`, worktree `/Users/raulvico/Documents/summa-social-worktrees/codex-marketing-20260907-185955`. Els dos documents de la revisió s’hi han traslladat sense pèrdua, amb còpia i hashes verificats. El repositori de control no conté aquestes modificacions fins a una futura integració autoritzada.

Inspecció autenticada de quatre URL ES, 07/09/2026 entre 18:58 i 19:06 Europe/Madrid. Totes indiquen «La URL está en Google», rastreig/indexació permesos, obtenció correcta, HTTPS i Google selecciona com a canonical la mateixa URL declarada:

| URL | Últim rastreig mostrat per Google | Sitemap a la inspecció |
|---|---|---|
| `/es/control-donacions-ong` | 05/08/2026 01:24:27 | Error temporal de processament |
| `/es/software-gestion-ong` | 01/08/2026 01:11:56 | Error temporal de processament |
| `/es/certificats-donacio` | 03/09/2026 10:35:55 | Error temporal de processament |
| `/es/devolucions-rebuts-socis` | 02/08/2026 02:46:51 | Cap sitemap de referència detectat |

Les hores de rastreig es transcriuen tal com les mostra Google; no se n’ha confirmat la zona horària. Fonts: inspecció de cada URL a [Search Console](https://search.google.com/search-console?resource_id=sc-domain%3Asummasocial.app). Això explica per què no es pot assumir que els textos del 31/08 ja estiguin processats a l’índex. No és un motiu per modificar canonical ni tornar a crear URL.

Enviament autoritzat per Raül («sí») i executat el 07/09/2026 19:18 Europe/Madrid. Propietat verificada: `sc-domain:summasocial.app`; URL exacta: `https://summasocial.app/sitemap.xml`; acció: `submitted`. La taula inicial de [Sitemaps](https://search.google.com/search-console/sitemaps?resource_id=sc-domain%3Asummasocial.app) era buida. XML públic validat: 92 URL HTTPS del domini. Google confirma «Se ha enviado el sitemap correctamente» i la taula final mostra tipus Sitemap, enviat 7 sept 2026, última lectura 7 sept 2026, estat **Correcto**, **92 pàgines descobertes**, 0 vídeos. Aquesta evidència substitueix l’estat anterior sense sitemap enviat; no acredita millora de posició ni indexació de totes les URL. No s’ha fet reindexació individual, OAuth nou ni canvi de permisos. Autorització del supervisor registrada al paquet `20260907T171443Z-raul-autoritza-explicitament-si-a-enviar-https-s`.

Millores locals implementades:

- `--require-analytics` afegit al lector: conserva l’informe diagnòstic però retorna codi 2 si GSC o GA4 no estan disponibles. Evita considerar reeixida una execució que no pot mesurar impacte. Sense l’opció conserva el comportament anterior.
- Explicació CA/ES dels tres passos de demo al contacte, sense canviar enviament, destinatari, promeses temporals ni plans.
- Proves de consentiment explícit, denegació, retirada i emmagatzematge bloquejat, sense cap petició externa.

Validació: 9/9 proves d’informes (incloent simulacions de cada API fallida i zero activitat realment disponible), 5/5 d’analítica, typecheck i i18n correctes. Navegador local CA/ES verificat; formulari buit rebutjat amb «Escriu un nom vàlid». Preview iniciada amb analítica i enviament de correu desactivats. Això no acredita recepció de formulari ni DebugView en producció. GSC no disposa de dades de Core Web Vitals ni mòbil ni escriptori; la prova mòbil de laboratori queda pendent.

Prova real del lector nou el 07/09: codi 2, API GSC i GA4 encara denegades per scopes. Evidència generada: `tmp/marketing/seo-20260907/summa-marketing-2026-09-05-14d.{md,json}` dins el worktree. Cap credencial als artefactes.

Accés analític pendent d’autorització explícita:

1. Autoritzar accés OAuth separat de només lectura per a l’informe: `https://www.googleapis.com/auth/webmasters.readonly` i `https://www.googleapis.com/auth/analytics.readonly`. Objectiu: llegir la propietat `sc-domain:summasocial.app` i GA4 `547126832`; aquests scopes poden donar lectura a altres propietats accessibles al compte, encara que el lector només consulti Summa. No concedir permisos d’edició ni guardar tokens al repositori. Cal concretar el client OAuth abans del consentiment.
Sitemap: enviament completat segons el registre anterior. Cap reindexació individual sol·licitada.

El primer paquet local queda aprovat pel supervisor el 07/09/2026 (paquet `20260907T170721Z-20260907t165554z-seo-setembre-primer-paquet-de-m`, resposta completa registrada, `APPROVE`, `LOOP_CONTROL: COMPLETE`); no hi ha merge, push, deploy, permisos nous, enviaments de contacte ni publicacions externes.

Search Console i GA4 són accessibles amb la sessió autenticada del navegador. L’informe automàtic continua fallant a les dues API per `Request had insufficient authentication scopes.`; això no vol dir que no hi hagi dades. No s’han modificat permisos ni configuració.

Comparació llegida a la UI: 23/08–05/09 contra 09/08–22/08, darrers 14 dies disponibles a Search Console. GSC Web, tots els països/dispositius: impressions 142 contra 122; clics 1 contra 1; CTR 0,7% contra 0,8%; posició 29,8 contra 37,2. GA4: sessions 4 contra 2 (orgàniques 1 contra 0); sessions amb interacció 1 contra 2; esdeveniments clau 0 contra 0. Són dades observades amb les limitacions del consentiment i de la instrumentació, no un recompte de tots els contactes comercials.

El paquet SEO del 31/08 és visible en el títol/H1/metadades de donacions i en les respostes 404/noindex a sondes PHP. Però el tram 01–05/09 contra 25–29/08 mostra 50 contra 57 impressions i 0 contra 1 clic: no s’ha demostrat impacte positiu atribuïble al paquet.

Fonts autenticades: [Search Console, comparació](https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3Asummasocial.app&start_date=20260823&end_date=20260905&compare_start_date=20260809&compare_end_date=20260822) i [GA4, propietat 547126832](https://analytics.google.com/analytics/web/#/a402384810p547126832/reports/intelligenthome), informe d’adquisició de trànsit amb aquestes dates. Detall, límits i pla vigent a [pla SEO i autoritat](seo-autoritat-externa-pla-90-dies-2026-07.md).

Següent pas: reparar l’accés automatitzat de només lectura amb l’autorització de permisos que correspongui; validar el circuit consentiment → contacte amb prova autoritzada. No s’ha comprovat DebugView ni enviament/recepció real del formulari en aquesta revisió. Els registres de juliol inferiors són antecedents i no certifiquen l’estat actual del desplegament.

## Decisió que ha de suportar

Aquest sistema serveix per decidir si el web públic de Summa Social:

1. guanya visibilitat per problemes reals d’entitats;
2. rep visites qualificades;
3. converteix aquestes visites en converses.

No serveix per prometre posicions ni per confondre activitat de robots amb demanda real.

## Fonts canòniques

| Pregunta | Font | Mètrica |
|---|---|---|
| Google ens mostra més? | Search Console | impressions, clics, CTR i posició |
| Hi entra gent real? | Google Analytics 4 | usuaris actius, sessions i pàgines vistes |
| El web genera converses? | Google Analytics 4 | `generate_lead` i `contact_intent` |
| El servidor està rebent activitat? | App Hosting | peticions agregades, robots i pàgines |

Els logs d’App Hosting són una comprovació auxiliar. Les peticions de pàgina, les IP i les IP-dia no equivalen a visites, sessions ni persones.

## KPI seleccionats

### 1. Visibilitat orgànica

- **Resultat principal:** impressions no vinculades a marca.
- **Diagnòstic:** clics, CTR i posició mitjana.
- **Font:** Search Console.
- **Cadència:** comparació de 7 dies per detectar canvis i de 28 dies per decidir.
- **Cautela:** amb menys de 100 impressions per període no s’ha d’interpretar una variació percentual com una tendència consolidada.

### 2. Trànsit qualificat

- **Resultat principal:** sessions al web públic.
- **Diagnòstic:** usuaris actius, pàgines vistes, pàgina d’entrada i font/mitjà.
- **Font:** GA4.
- **Cadència:** 28 dies contra els 28 anteriors.
- **Cautela:** només es mesuren les persones que accepten expressament l’analítica.

### 3. Converses generades

- **Resultat principal:** `generate_lead`, només després que l’API confirmi l’enviament del formulari.
- **Indicador previ:** `contact_intent` per clics cap a contacte, correu, telèfon o WhatsApp.
- **Font:** GA4.
- **Cadència:** mensual.
- **Cautela:** un clic no és una conversa; només `generate_lead` acredita un formulari enviat.

## Privacitat i qualitat

- Implementació de consentiment bàsic: l’etiqueta de Google no es descarrega abans de l’acceptació.
- Publicitat i personalització queden desactivades.
- No s’envien noms, correus, organitzacions, telèfons ni missatges.
- La preferència es pot retirar des de la política de privacitat.
- Sense `NEXT_PUBLIC_GA_MEASUREMENT_ID`, el sistema de captura queda completament inactiu.

## Informe operatiu

Comanda:

```bash
npm run marketing:report -- --days 28
```

Per exigir dades de les dues fonts abans de considerar l’execució reeixida (opció preparada en el primer paquet local de setembre):

```bash
npm run marketing:report -- --days 14 --no-hosting --require-analytics
```

Un codi 2 significa que l’informe és incomplet, encara que els artefactes diagnòstics s’hagin escrit. No vol dir zero visites.

Per defecte genera:

- `tmp/marketing/summa-marketing-<data>-28d.md`
- `tmp/marketing/summa-marketing-<data>-28d.json`

L’informe compara dos períodes consecutius i declara cada font com a disponible o no disponible. No substitueix una font absent per una mètrica més feble.

Variables:

```bash
export GOOGLE_MARKETING_ACCESS_TOKEN="<token OAuth temporal>"
export SEARCH_CONSOLE_SITE_URL="sc-domain:summasocial.app"
export GA4_PROPERTY_ID="547126832"
```

Si no es defineix `GOOGLE_MARKETING_ACCESS_TOKEN`, l’informe prova de reutilitzar el
token actiu de `gcloud auth print-access-token`. Si no es defineix `GA4_PROPERTY_ID`,
usa per defecte la propietat `547126832`. L’accés continua sent de només lectura i
requereix els àmbits `webmasters.readonly` i `analytics.readonly`.

El token necessita els àmbits de només lectura:

- `https://www.googleapis.com/auth/webmasters.readonly`
- `https://www.googleapis.com/auth/analytics.readonly`

No s’ha de guardar el token al repositori ni als artefactes.

## Antecedent de posada en marxa — juliol de 2026

Configuració creada el 27 de juliol de 2026:

- compte GA4 `Summa Social` (`402384810`);
- propietat `Summa Social – Web` (`547126832`);
- flux `Summa Social – Web públic` (`15329958834`);
- ID de mesura `G-C5NJMM8S5P`;
- zona horària d’Espanya, moneda euro i retenció d’esdeveniments de 14 mesos;
- mesura millorada activa;
- `generate_lead` creat amb codi i marcat com a esdeveniment clau, sense valor monetari predeterminat.

Passos registrats aleshores (estat històric, no pendent vigent acreditat):

1. [x] Afegir `NEXT_PUBLIC_GA_MEASUREMENT_ID` a `apphosting.yaml`.
2. [x] Validar en local que rebutjar no genera cap petició a Google.
3. [ ] Obtenir autorització explícita de desplegament i executar `npm run publica`.
4. [ ] Validar amb DebugView que acceptar registra una sola visita i que el formulari només genera el lead després d’un `2xx`.

## Línia base històrica verificada — juliol de 2026

Search Console, comparació del 18–24 de juliol de 2026 contra l’11–17 de juliol:

| Mètrica | 11–17 jul. | 18–24 jul. |
|---|---:|---:|
| Clics | 1 | 3 |
| Impressions | 20 | 31 |
| CTR | 5% | 9,7% |
| Posició mitjana | 12,3 | 7,0 |

És un senyal inicial positiu, però encara no una tendència consolidada.
