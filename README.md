# restApi
# https://swagger.io/specification/v3.2/#introduction
# https://editor.swagger.io/
# Permet d'executer des commandes sur un terminal powershell => Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Unrestricted
**Auteur :** 26sdc106b.wierzbicki

---

## C'est quoi la méthode CRAFT ?

La méthode **CRAFT** est un cadre pour écrire de bons prompts pour les IA génératives.
C'est un acronyme (les lettres varient un peu selon les sources) :

| Lettre | Signification | Description |
|---|---|---|
| **C** | Contexte | La situation, les infos que l'IA doit connaître |
| **R** | Rôle | Le rôle que doit jouer l'IA (« Agis comme un développeur backend senior… ») |
| **A** | Action | La tâche précise à réaliser |
| **F** | Format | La forme de la réponse (tableau, liste, code, JSON, nombre de mots…) |
| **T** | Ton / Cible (*Target*) | Le ton et le public visé (formel/décontracté, débutant/expert) |

### Exemple appliqué à une API REST

> **Contexte** : je développe une API REST en Node.js/Express pour gérer des utilisateurs.\
> **Rôle** : agis comme un développeur backend expérimenté.\
> **Action** : écris la route `POST /users` avec validation des données.\
> **Format** : donne le code commenté, puis une courte explication en 3 points.\
> **Ton** : pédagogique, pour un développeur junior.

Un prompt structuré ainsi donne des réponses bien plus précises qu'une demande vague
comme « fais-moi une route pour créer un user ».

### Variantes

- **T** peut aussi signifier *Tâche* ou *Tone*, et **A** parfois *Audience*.
- À ne pas confondre avec le **Software Craftsmanship** (artisanat logiciel : code propre,
  TDD, refactoring), qui est une autre notion.

---

## Principes de conception sécurisée

### 1. Conception du moindre privilège (*Least Privilege*)

Chaque utilisateur, programme ou service reçoit **uniquement les droits dont il a besoin**
pour sa tâche, et seulement pendant le temps nécessaire.

**Pourquoi :** si un compte ou un composant est compromis, les dégâts sont limités à ses droits.

**Exemples dans une API REST :**

- L'utilisateur de la base de données de l'API a les droits `SELECT/INSERT/UPDATE` sur ses
  tables, mais pas `DROP` ni l'accès admin.
- Un token d'API « lecture seule » ne peut pas appeler `DELETE /users/:id`.
- Le serveur Node ne tourne pas en `root` ou en administrateur.

### 2. Conception ouverte (*Open Design*)

La sécurité d'un système **ne doit pas reposer sur le secret de son fonctionnement**.
Seules les **clés et les mots de passe** doivent rester secrets.

**Pourquoi :** le code finit toujours par fuiter ou par être analysé. C'est l'inverse de la
« sécurité par l'obscurité ».

**Exemples :**

- Utiliser des algorithmes publics et éprouvés (bcrypt, JWT signé HS256/RS256, TLS)
  plutôt qu'un chiffrement « maison ».
- Cacher une route d'admin sous `/api/x7k9-secret-admin` ne protège rien :
  il faut une vraie authentification.

### 3. Médiation complète (*Complete Mediation*)

**Chaque accès** à chaque ressource doit être **vérifié à chaque fois**, sans se contenter
d'une vérification unique ni réutiliser aveuglément un résultat en cache.

**Pourquoi :** les droits peuvent changer (utilisateur banni, rôle retiré, token révoqué), et
un seul chemin non contrôlé suffit à contourner toute la sécurité.

**Exemples :**

- Un middleware d'authentification/autorisation s'applique à **toutes** les routes protégées.
- Sur `GET /orders/42`, on vérifie le token **et** que la commande 42 appartient bien à
  l'utilisateur (sinon : faille **IDOR**).
- Un endpoint « oublié » (`/api/v1/old-export`) ne doit pas échapper au contrôle.

### 4. Zero Trust (« ne jamais faire confiance, toujours vérifier »)

**Aucune confiance implicite**, que la requête vienne de l'extérieur ou de l'intérieur du
réseau. Chaque requête est authentifiée, autorisée et chiffrée, quelle que soit son origine.

**Pourquoi :** le modèle « château fort » (pare-feu dehors, confiance totale dedans) ne tient
plus face au cloud, au télétravail et aux attaquants qui se déplacent une fois entrés.

**Exemples :**

- Les microservices s'authentifient entre eux (mTLS, tokens de service), même en interne.
- Un appel venant de `localhost` ou du VPN n'est pas automatiquement de confiance.
- Authentification forte (MFA), vérification de l'appareil, droits minimaux,
  journalisation des accès.

### Résumé

| Principe | Question clé | Réponse |
|---|---|---|
| Moindre privilège | *Combien* de droits donner ? | Le strict minimum. |
| Conception ouverte | *Sur quoi* repose la sécurité ? | Sur les clés, pas sur le secret du code. |
| Médiation complète | *Quand* vérifier ? | À chaque accès. |
| Zero Trust | *Qui* croire d'office ? | Personne, même à l'intérieur. |

Le Zero Trust est une mise en pratique moderne des trois autres (surtout du moindre
privilège et de la médiation complète), appliquée à toute l'architecture.

---

## Les codes HTTP courants

Un code HTTP est un nombre à 3 chiffres renvoyé par le serveur.
**Le premier chiffre donne la catégorie** de la réponse.

| Plage | Catégorie | En résumé |
|---|---|---|
| **1xx** | Information | « Je traite ta demande, continue » (rare en pratique) |
| **2xx** | Succès | « C'est bon » |
| **3xx** | Redirection | « Va voir ailleurs » |
| **4xx** | Erreur client | « C'est **ta** faute » (requête invalide) |
| **5xx** | Erreur serveur | « C'est **ma** faute » (bug, panne) |

### 2xx : succès

| Code | Nom | Quand l'utiliser (API REST) |
|---|---|---|
| **200** | OK | `GET` réussi, ou `PUT`/`PATCH` qui renvoie la ressource |
| **201** | Created | `POST` qui a créé une ressource (avec idéalement un en-tête `Location: /users/42`) |
| **204** | No Content | Succès sans corps de réponse, typiquement après un `DELETE` |

### 3xx : redirection

| Code | Nom | Quand |
|---|---|---|
| **301** | Moved Permanently | La ressource a changé d'URL **définitivement** (utile pour le SEO) |
| **302** | Found | Redirection **temporaire** (par exemple après un login) |
| **304** | Not Modified | La ressource n'a pas changé : le navigateur réutilise son cache |

### 4xx : erreurs client

| Code | Nom | Quand |
|---|---|---|
| **400** | Bad Request | Requête mal formée : JSON invalide, champ manquant, mauvais type |
| **401** | Unauthorized | **Pas authentifié** : token absent, invalide ou expiré |
| **403** | Forbidden | **Authentifié mais pas autorisé** : pas les droits sur cette ressource |
| **404** | Not Found | La ressource ou la route n'existe pas |
| **405** | Method Not Allowed | Méthode non supportée sur la route (`DELETE` sur `/login`, par exemple) |
| **409** | Conflict | Conflit avec l'état actuel : email déjà utilisé, doublon |
| **422** | Unprocessable Entity | Syntaxe correcte mais données invalides métier (email au mauvais format, âge négatif…) |
| **429** | Too Many Requests | Trop de requêtes : limitation de débit (*rate limiting*) |

### 5xx : erreurs serveur

| Code | Nom | Quand |
|---|---|---|
| **500** | Internal Server Error | Erreur inattendue côté serveur (exception non gérée, bug) |
| **502** | Bad Gateway | Un proxy ou une gateway a reçu une mauvaise réponse du serveur derrière lui |
| **503** | Service Unavailable | Serveur surchargé ou en maintenance |
| **504** | Gateway Timeout | Le serveur derrière le proxy a mis trop de temps à répondre |

### Les pièges classiques

- **401 ou 403 ?**
  - 401 veut dire « Qui es-tu ? » : il faut se connecter.
  - 403 veut dire « Je sais qui tu es, mais tu n'as pas le droit. »
- **400 ou 422 ?**
  - 400 : la requête est illisible (JSON cassé).
  - 422 : la requête est lisible mais les données ne sont pas valides.
    Beaucoup d'API utilisent simplement 400 pour les deux cas.
- **Ne jamais renvoyer 200 avec `{ "error": "..." }`.** Le code doit refléter le vrai résultat.
- **Sécurité :** une erreur 500 ne doit jamais exposer la stack trace au client.
  On limite les informations divulguées : les détails internes (chemins, versions, requêtes SQL)
  aident un attaquant. Ça ne contredit pas la conception ouverte : la sécurité ne repose pas
  sur ce secret, on évite simplement de faciliter le travail d'un attaquant.
- Pour cacher l'existence d'une ressource interdite, on peut renvoyer **404 au lieu de 403**.
  C'est une technique classique contre l'énumération des ressources.

### Correspondance méthode / code dans une API REST

| Action | Méthode | Succès | Erreurs fréquentes |
|---|---|---|---|
| Lister | `GET /users` | 200 | 401 |
| Lire | `GET /users/42` | 200 | 404 |
| Créer | `POST /users` | 201 | 400, 409, 422 |
| Remplacer / modifier | `PUT` / `PATCH /users/42` | 200 (ou 204) | 400, 404 |
| Supprimer | `DELETE /users/42` | 204 | 403, 404 |

---

## L'OOM Killer (OOMK)

### C'est quoi ?

L'**OOM Killer** (*Out Of Memory Killer*) est un **mécanisme du noyau Linux** qui se déclenche
quand le système **n'a plus de mémoire** (RAM et swap pleins). Pour éviter que toute la machine
plante, le noyau **choisit un processus et le tue** afin de libérer de la mémoire.

### Comment il choisit sa victime ?

Chaque processus a un **score** (`oom_score`, de 0 à 1000), calculé surtout selon :

- la **quantité de mémoire** qu'il utilise (c'est le critère principal) ;
- un réglage manuel, `oom_score_adj`, qui va de **-1000** (ne jamais tuer) à **+1000** (tuer en priorité).

Le processus qui a le **score le plus élevé** est tué. En général, c'est le plus gros consommateur de mémoire.

```bash
cat /proc/<PID>/oom_score               # voir le score d'un processus
echo -500 > /proc/<PID>/oom_score_adj   # le protéger un peu
```

### Comment savoir s'il est intervenu ?

```bash
dmesg | grep -i "killed process"
journalctl -k | grep -i oom
```

On voit alors un message du type :
`Out of memory: Killed process 1234 (node) total-vm:...`

### Le lien avec le développement web / API

- Une **API Node.js** peut s'arrêter brutalement, **sans aucun message d'erreur** dans les logs
  applicatifs. Le processus est tué de l'extérieur avec un `SIGKILL`, qu'il est impossible d'intercepter.
- Avec **Docker**, un conteneur qui dépasse sa limite mémoire (`--memory=512m`) est tué.
  `docker inspect` affiche alors `"OOMKilled": true` et le code de sortie **137** (128 + 9, c'est-à-dire SIGKILL).
- Avec **Kubernetes**, le pod apparaît en statut **`OOMKilled`**. C'est souvent là qu'on voit l'abréviation.
- Côté client, ça peut se traduire par des **502 Bad Gateway** ou des **503**, puisque le proxy
  ne joint plus le serveur.

### Causes fréquentes et solutions

| Cause | Solution |
|---|---|
| Fuite mémoire (cache qui grossit sans fin, listeners jamais supprimés) | Profiler avec `node --inspect` et des heap snapshots |
| Charger un gros fichier ou une grosse requête SQL en mémoire d'un coup | Utiliser des **streams** et de la **pagination** |
| Limite du conteneur trop basse | Ajuster `--memory` ou `resources.limits.memory` |
| Heap Node mal dimensionné | `node --max-old-space-size=...` réglé **sous** la limite du conteneur |

---

## Kyverno

**Kyverno** est un **moteur de politiques (*policy engine*) pour Kubernetes**. Il permet de définir
des **règles** que toutes les ressources du cluster (pods, deployments, namespaces…) doivent
respecter. C'est un projet open source de la **CNCF**, la fondation qui héberge aussi Kubernetes.

Son nom vient du grec *kyverno*, qui veut dire « gouverner ».

### À quoi ça sert ?

Sans Kyverno, n'importe qui ayant accès au cluster peut déployer un conteneur **en root**,
**sans limite mémoire**, avec une image `:latest` venue de n'importe où. Kyverno sert de
**gardien** : chaque ressource est vérifiée **avant** d'être créée.

### Comment ça marche ?

Kyverno s'installe comme un **admission controller**. Kubernetes lui envoie chaque requête de
création ou de modification de ressource, et Kyverno peut alors :

| Action | Rôle | Exemple |
|---|---|---|
| **Validate** | Accepter ou refuser la ressource | Refuser un pod qui tourne en root |
| **Mutate** | Modifier la ressource à la volée | Ajouter automatiquement des limites mémoire par défaut |
| **Generate** | Créer d'autres ressources | Créer une `NetworkPolicy` par défaut dans chaque nouveau namespace |
| **Verify Images** | Vérifier la signature des images | N'accepter que les images signées (Cosign / Sigstore) |
| **Cleanup** | Supprimer des ressources | Nettoyer les ressources temporaires expirées |

### Son gros avantage : tout est en YAML

Son principal concurrent, **OPA Gatekeeper**, demande d'apprendre le langage **Rego**.
Avec Kyverno, les politiques s'écrivent **en YAML, comme le reste de Kubernetes**.

Exemple : imposer des limites mémoire sur tous les pods.

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-memory-limits
spec:
  validationFailureAction: Enforce   # Enforce = bloque | Audit = signale seulement
  rules:
    - name: check-memory-limits
      match:
        any:
          - resources:
              kinds: [Pod]
      validate:
        message: "Chaque conteneur doit définir une limite mémoire."
        pattern:
          spec:
            containers:
              - resources:
                  limits:
                    memory: "?*"
```

Si quelqu'un déploie un pod sans limite mémoire, la création est **refusée** avec ce message.

Les versions récentes de Kyverno proposent aussi de nouveaux types de politiques basés sur
**CEL**, le langage d'expressions natif de Kubernetes. Le format `ClusterPolicy` ci-dessus
reste le plus courant dans les tutoriels.

### Le lien avec ce qu'on a déjà vu

- **Moindre privilège** : interdire les conteneurs root, les conteneurs `privileged` et le `hostPath`.
- **Médiation complète** : **chaque** ressource passe par le contrôle, sans exception.
- **Zero Trust** : on ne fait pas confiance à une image juste parce qu'elle est dans le registre,
  on **vérifie sa signature**.
- **OOM Killer** : imposer des `limits.memory` évite qu'un pod consomme toute la RAM d'un nœud
  et fasse tuer les autres.

### Modes utiles

- **Audit** : les violations sont seulement **signalées** (dans des `PolicyReport`).
  C'est idéal pour démarrer sans rien casser.
- **Enforce** : les ressources non conformes sont **bloquées**.
  On passe à ce mode une fois les politiques validées.

---

## Le NIST

Le **NIST** (*National Institute of Standards and Technology*) est un **organisme public américain
de normalisation**. En cybersécurité, ses publications servent de **référence mondiale** : elles sont
gratuites, publiques et utilisées bien au-delà des États-Unis, y compris en Europe.

### Le NIST Cybersecurity Framework (CSF)

C'est un **cadre pour organiser la cybersécurité** d'une organisation. Sa version **2.0** (2024)
repose sur **6 fonctions** :

| Fonction | Question | Exemples |
|---|---|---|
| **Gouverner** (*Govern*) | Qui décide et qui est responsable ? | Stratégie, rôles, politiques de sécurité |
| **Identifier** (*Identify*) | Qu'est-ce qu'on doit protéger ? | Inventaire des serveurs, API et données ; analyse des risques |
| **Protéger** (*Protect*) | Comment empêcher l'attaque ? | Authentification, chiffrement, moindre privilège, mises à jour |
| **Détecter** (*Detect*) | Comment voir qu'une attaque a lieu ? | Logs, monitoring, alertes |
| **Répondre** (*Respond*) | Que faire pendant l'incident ? | Isoler le serveur, révoquer les tokens, prévenir |
| **Rétablir** (*Recover*) | Comment revenir à la normale ? | Restaurer les sauvegardes, tirer les leçons |

La fonction **Gouverner** est la nouveauté de la version 2.0 : elle encadre les cinq autres.

### Les publications importantes (série SP 800)

| Publication | Sujet | Lien avec ce README |
|---|---|---|
| **SP 800-207** | Architecture **Zero Trust** | C'est la définition de référence du Zero Trust |
| **SP 800-63B** | Authentification et **mots de passe** | Utile pour la route de login d'une API |
| **SP 800-53** | Catalogue de **mesures de sécurité** (contrôle d'accès, audit…) | On y retrouve le moindre privilège (contrôle AC-6) |
| **SP 800-61** | **Gestion des incidents** | Correspond aux fonctions Répondre et Rétablir |

### Les recommandations NIST sur les mots de passe (SP 800-63B)

Elles ont pris le contre-pied de vieilles habitudes :

- privilégier la **longueur** plutôt que la complexité : une longue phrase de passe vaut mieux que `P@ssw0rd!` ;
- **ne pas imposer** de règles du type « une majuscule, un chiffre, un caractère spécial » ;
- **ne pas forcer** le changement périodique (tous les 90 jours), seulement en cas de compromission ;
- **vérifier** que le mot de passe n'apparaît pas dans une liste de mots de passe déjà fuités ;
- accepter les **longs mots de passe** et le **copier-coller** (pour les gestionnaires de mots de passe) ;
- encourager l'**authentification multifacteur (MFA)**.

Côté API, ça veut dire : stocker les mots de passe **hachés** (bcrypt, Argon2), jamais en clair,
et limiter les tentatives de connexion (code HTTP **429**).

### Autres apports du NIST

- **La cryptographie** : le NIST standardise des algorithmes utilisés partout (AES, SHA-2, SHA-3),
  et a publié en 2024 les premiers standards de **cryptographie post-quantique** (FIPS 203, 204 et 205).
  C'est un bon exemple de **conception ouverte** : les algorithmes sont publics et analysés par tous.
- **La NVD** (*National Vulnerability Database*) : la base de données des vulnérabilités connues
  (identifiants **CVE**), avec un score de gravité **CVSS** de 0 à 10. Les outils comme `npm audit`
  s'appuient sur ce type de base.

### NIST et NIS2 : ne pas confondre

| | NIST | NIS2 |
|---|---|---|
| **Nature** | Organisme de normalisation américain | Directive européenne |
| **Valeur** | **Recommandations** (volontaires pour le privé) | **Obligation légale** pour les entités concernées |
| **Rôle** | Explique **comment** sécuriser | Impose **de** sécuriser et de déclarer les incidents |

Les deux se complètent : une entreprise soumise à NIS2 peut s'appuyer sur le NIST CSF pour
organiser sa mise en conformité.
