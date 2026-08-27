# Rendr — Copy Working Doc (FR)

Statut : hero et article complet (sections 1 à 7) verrouillés. Copy FR
alignée sur `copy.md`, adaptée section par section, pas traduite mot à mot.

Note d'approche (2026-08-21) : cette version française n'est pas une traduction
littérale de `copy.md`. C'est la copy principale, celle qui sera montrée en
premier, car le requérant est en France et travaille avec des Français.
Adaptation section par section, approuvée une par une, pas de passage
automatique anglais → français. Jargon technique (frame, fps, thread) gardé
en anglais quand c'est le terme réellement utilisé par les pros de la vidéo/
dev en France, ce n'est pas un anglicisme à corriger.

---

## Hero

**Kicker (`meta.titlePrefix`)**
Moteur de rendu ; Automatisation vidéo

**Titre (`meta.title`)**
Rendr

**Sous-titre (`meta.subtitle`)**
Conçu pour sortir 1000 vidéos à l'heure, sans même transpirer.

**Description (`meta.description`)**
Rendr est un moteur de rendu construit pour devenir l'infrastructure de la vidéo automatisée à grande échelle, le même code qui tourne sur une machine ou sur mille.

**Bandeau de stats (`meta.stats`)**

| Label | Valeur | Note |
|---|---|---|
| Un seul thread | 500 fps | |
| 8 threads, en théorie | 2 500 fps | |
| Clip de 30s à 30fps | ~0,36s | 900 frames à 2 500 fps |
| Architecture | Frames indépendantes | Aucun état partagé entre les frames, chacune se rend isolément |

Note : `meta.duration` = « 1 an » — son propre champ, ajouté automatiquement
au bandeau de stats, pas une ligne du tableau ci-dessus.

---

## Section résumé

**Ce que c'est**

Rendr est un moteur de rendu. Il prend un fichier JSON, une composition qui décrit des clips, du texte, du minutage et des courbes d'animation, et le transforme en MP4, frame par frame, depuis un navigateur plutôt que depuis un logiciel de montage classique.

**Comment ça marche**

Chaque élément d'une composition, un clip, une légende, un titre, est un objet autonome avec sa propre timeline. Demandez la frame 400, Rendr n'a pas besoin de la frame 399 avant : il lit la composition, calcule à quoi ressemble chaque élément à cette milliseconde précise, et le dessine. C'est ce qui le rend rapide. Rien n'attend rien d'autre, donc les frames se rendent indépendamment, en parallèle, sur autant de threads qu'on lui donne.

**Historique**

La v1 était une bêta, une preuve de concept, construite vite pour montrer qu'un navigateur pouvait rendre de la vidéo. Elle était volontairement brute : assez rapide pour voir des résultats, pas assez fiable pour un vrai produit à grande échelle. La capture se faisait par screenshots, l'intégration vidéo n'était qu'un contournement à un problème bien plus complexe, mais ça a tenu assez solidement pour devenir le socle de Shorts Engine, un pipeline automatisé qui scriptait, rendait et postait des vidéos tout seul.

La v2 était une réécriture complète : une base de code plus propre, une architecture plus soignée, et un pipeline de rendu véritablement optimisé, construit pour être assez rapide et fiable pour vraiment bâtir une entreprise dessus, pas juste prouver que c'était possible.

**Résultats** (cartes, `<Facts variant="cards">` + `<Fact label value note>`)

| Fait | Valeur | Note |
|---|---|---|
| Pureté des frames | 100% | Chaque pixel d'une frame rendue vérifié contre une couleur de test connue, aucun écart |
| Vitesse sur un thread | 500 fps | |
| Prétraitement nécessaire | Zéro | La vidéo se décode nativement dans le navigateur, rien n'est précuit avant que le rendu commence |

**Vision**

La vidéo est le média le plus consommé de la planète, une industrie à mille milliards de dollars, et presque rien de tout ça ne se fait sans que quelqu'un monte réellement chaque vidéo, une par une. Imaginez cent chaînes qui tournent sur toutes les plateformes, chacune sortant des vidéos assez bonnes pour qu'on s'arrête vraiment pour les regarder. C'est ce que Rendr est construit pour rendre possible.

---

## Section 1 : L'idée

J'étais bloqué. Plusieurs projets d'affilée qui ne prenaient pas, rien de grave, juste ce genre de blocage précis. Alors je me suis fait une promesse : aujourd'hui, pas d'écran. Je me suis allongé, j'ai fixé le plafond, je me suis laissé m'ennuyer.

Trois minutes plus tard, l'idée est arrivée : et si on pouvait faire de la vidéo avec du HTML ?

Je me suis levé, j'ai rallumé le PC, et j'ai cherché si quelqu'un l'avait déjà fait. Rien de bon. J'avais déjà utilisé MoviePy et les outils Python habituels pour d'autres projets de vidéo automatisée, et c'était lent, lourd, pas ça. Le manque était réel. Alors j'ai commencé à construire.

Mai ou juin 2025, la semaine exacte m'échappe. C'est là que Rendr commence.

---

## Section 2 : la v1, la solution la plus rapide à sortir

Une idée ne vaut que si elle existe. Personne ne finance un moteur de rendu vidéo qui vit dans un bloc-notes, et personne ne vous contacte pour ça non plus. La v1 n'a donc pas été construite pour être bonne. Elle a été construite pour prouver que le postulat tenait la route : qu'un navigateur, cette chose ouverte sur tous les ordinateurs en ce moment même, pouvait rendre de la vidéo. Chaque décision en dessous optimisait une seule chose, faire fonctionner quelque chose, pas produire un bon résultat.

La capture était le premier problème, et la solution était volontairement brutale. Puppeteer ouvrait la composition comme une page web classique, exactement comme un navigateur ouvre n'importe quel site, puis la capturait en screenshot. Frame par frame, PNG après PNG, autant de fois que la vidéo l'exigeait. Chaque image partait ensuite chez FFmpeg, qui recollait le tout en un fichier final.

Ça marchait. Ce détail compte plus qu'il n'y paraît. Mais c'était lent d'une façon qui s'accumule. À peu près 70 millisecondes rien que pour capturer une frame, avant même que FFmpeg commence son propre travail. Multipliez ça par chaque frame de chaque vidéo, par chaque chaîne qui tourne en même temps, et le coût cesse d'être une erreur d'arrondi.

La vidéo, elle, était la moitié la plus dure du problème, et il n'y avait pas encore de réponse propre. Décoder un clip en direct, dans le navigateur, frame par frame, je ne savais pas faire ça à l'époque. WebCodecs n'était pas encore un outil dans ma boîte. Les clips étaient donc traités avant même que le navigateur s'ouvre, pas à l'intérieur.

Un script Node.js faisait le travail en amont. Il lançait FFmpeg, découpait chaque vidéo en frames individuelles, et empaquetait chacune en base64¹, du texte brut faisant office de données image. Ce texte finissait directement dans la composition JSON, si bien qu'au moment où le navigateur ouvrait le fichier, la vidéo n'était plus une vidéo. C'était un mur de pixels encodés qui attendait en mémoire d'être servi à la page, frame par frame, au bon timestamp.

C'était bricolé, et tous ceux qui y ont touché depuis le savent. La mémoire en prenait un vrai coup avec cette méthode, et rien dans cette approche n'était fait pour durer plus d'une saison. Mais ce n'était pas le but. Ça a tourné assez bien pour passer en production, faire fonctionner un vrai pipeline automatisé, et prouver que toute l'idée méritait une vraie refonte.

C'est la seule barre que la v1 avait à franchir.

¹ *base64 : une façon d'écrire des données binaires brutes, les 1 et les 0 derrière une image, sous forme de texte, pour qu'un format qui ne comprend que du texte, comme JSON, puisse quand même les transporter.*

---

## Section 3 : Shorts Engine, et le Maroc

La v1.3.1 est la version qui a vraiment tourné en vrai, pas juste démontrée. Elle a fait fonctionner une vraie activité de bout en bout, sans que j'y touche, pendant des semaines entières.

Le système s'appelait Shorts Engine, et la boucle était simple à décrire et vraiment satisfaisante à regarder tourner. Il récupérait des posts Reddit, filtrait ceux qui étaient réellement intéressants, découpait les bons en plusieurs parties, et faisait passer chaque partie dans un modèle d'IA avec un prompt système et un prompt utilisateur pour en tirer un script. À partir de là, il assemblait tout, le script, le minutage, les visuels, en une composition JSON, la donnait à Rendr, et postait la vidéo finie directement sur YouTube via l'API. Aucun humain dans la boucle, du début à la fin.

Ça tournait sur environ quatre chaînes, cinq vidéos par jour chacune, pendant à peu près un mois et demi. J'avais déployé une version cloud avec sa propre logique de redémarrage et de récupération, donc si quelque chose plantait à 3h du matin, ça repartait tout seul, et ça m'envoyait une notification sur le téléphone en cas de vrai échec. J'ai fait tourner tout ça pendant que je voyageais au Maroc deux semaines, en vérifiant depuis mon téléphone entre deux activités, en regardant des vidéos se scripter, se rendre et se poster sans que je touche à un clavier. C'était la première fois que l'automatisation me semblait réelle plutôt que théorique. Franchement l'une des meilleures sensations que j'aie eues en construisant quelque chose.

Ça n'a pas duré, mais pas à cause du moteur de rendu. Les chaînes se sont fait shadowban, dégradées en qualité par ce qui, côté plateforme, surveillait les comportements de bot, probablement repérées dès le premier jour vu le rythme de publication. Les vues sont tombées d'une vraie audience à deux par vidéo, et il n'y avait aucun moyen de se battre contre ça de l'extérieur.

Il y avait un second problème, plus discret, qui traînait depuis le début, et c'est celui qui a vraiment compté pour la suite. Rendre une minute de vidéo prenait environ 20 secondes, et seulement en tournant à plein régime sur 8 à 10 threads CPU en même temps. Parfois le résultat sortait corrompu. C'est le genre de chiffre qui passe pour une preuve de concept et qui est totalement inacceptable pour une entreprise, et c'est la vraie raison pour laquelle la v2 devait arriver, fermeture de plateforme ou pas.

---

## Section 4 : la v2, premier problème, remplacer Puppeteer par CEF

Deux choses devaient changer pour que la v2 ait un sens, et la première, c'était Puppeteer. Les 70 millisecondes que coûtait la capture d'une seule frame n'étaient plus une erreur d'arrondi dès lors que l'objectif devenait une vraie ferme de rendu et non plus une preuve de concept. Capturer une page en screenshot, c'est encoder une image, PNG après PNG, des milliers de fois par vidéo, et cette étape d'encodage était le vrai coût. Le résoudre voulait dire arrêter complètement de faire des screenshots.

La réponse a été d'arrêter d'utiliser un navigateur que je ne contrôlais pas et d'en construire un que je contrôlais. CEF¹ permet d'embarquer un navigateur Chromium complet directement dans sa propre application, plutôt que de lancer un processus séparé et de lui parler de l'extérieur, ce qui voulait dire que je pouvais accéder directement à la boucle de rendu au lieu de passer par une API de capture. Je n'avais jamais travaillé avec avant, et il m'a fallu vraiment longtemps pour me sentir à l'aise sur un terrain aussi inconnu, aussi profondément dans la stack navigateur. Mais c'est arrivé à marcher.

Le mécanisme, une fois en place, était presque gênant de simplicité comparé à ce qu'il remplaçait. On demande une frame à l'instance CEF, et au lieu de l'encoder en image, elle copie le buffer de pixels brut directement dans un emplacement de mémoire partagée², une mémoire que le processus navigateur et le processus Node.js peuvent tous les deux lire directement, sans sérialisation entre les deux. CEF renvoie un signal disant que la frame est prête. Node lit cet emplacement mémoire et le passe directement à FFmpeg. Pas de PNG, pas d'étape de décodage, pas d'aller-retour par le disque ou par un socket réseau. Juste des pixels, qui passent d'un processus à l'autre aussi vite que la mémoire le permet.

Ce seul changement a fait passer la capture à 500 frames par seconde sur un seul thread, plus de 30 fois plus rapide que l'ancienne méthode par screenshot. Mais la vitesse seule ne suffisait pas pour lui faire confiance. Il fallait que je sache que les pixels qui sortaient de l'autre côté étaient vraiment corrects, pas juste rapides, alors j'ai construit un test de pureté : rendre des frames d'une seule couleur connue, puis vérifier chaque pixel du résultat contre cette valeur exacte. La première version du test a échoué. Certaines frames ressortaient avec une couleur légèrement différente de la précédente, preuve que quelque chose dans le pipeline laissait fuiter de l'état entre des frames qui n'auraient jamais dû se toucher. Trouver ce problème et le corriger, c'est ce qui a finalement amené le moteur à 100%, chaque pixel, chaque frame, exactement la couleur qu'elle était censée avoir.

¹ *CEF (Chromium Embedded Framework) : une manière d'embarquer un navigateur Chromium complet directement dans une autre application, plutôt que de contrôler un processus navigateur séparé depuis l'extérieur.*

² *Mémoire partagée : un bloc de mémoire que deux programmes séparés peuvent tous les deux lire et écrire directement, utilisé ici pour que le navigateur et l'encodeur vidéo puissent se passer une frame sans avoir à la copier via un canal plus lent comme un fichier ou un socket réseau.*

---

## Section 5 : la v2, second problème, rendr-web et la refonte des assets vidéo

CEF réglait la capture. Il ne réglait pas l'autre moitié du problème, celle qui traînait depuis la v1 et qui empirait discrètement : les clips vidéo devaient toujours être prétraités par FFmpeg en base64 avant même que le navigateur ouvre le fichier. Cette approche avait donné un vrai produit, mais elle n'allait jamais tenir à l'échelle, et avec la v2, il n'y avait plus de bonne excuse pour la garder. La corriger voulait dire décoder la vidéo nativement, en direct, dans le navigateur, avec WebCodecs³ au lieu de le contourner. Ça s'est révélé le plus dur des deux problèmes, de loin. Ça m'a pris presque un an, étalé, pas continu, repris et laissé de côté entre tout le reste, pour arriver à quelque chose de correct.

L'idée de base est simple à formuler et vraiment difficile à construire : prendre un fichier vidéo et donner ses frames directement au navigateur, décodées à la demande, au lieu de précuire chaque frame dans un blob avant même que le rendu commence. Y arriver voulait dire construire rendr-web à partir de zéro, un pipeline qui démultiplexe⁴ un fichier vidéo avec mp4box, en séparant le conteneur pour trouver le flux vidéo encodé à l'intérieur, puis en envoyant ce flux au décodeur natif du navigateur, frame par frame.

Ce qui a rendu tout ça vraiment difficile, ce sont les GOP⁵. Une vidéo n'est pas stockée comme une suite plate d'images complètes. La plupart des frames ne sont que la différence avec la frame précédente, et elles sont regroupées en blocs, les GOP, qui dépendent tous d'une frame clé pour se décoder correctement. Demandez la frame 400, et le décodeur a peut-être besoin de la frame 385 pour lui donner un sens, parce que 400 n'existe que comme un ensemble de changements empilés depuis la dernière frame clé. rendr-web doit savoir dans quel GOP se trouve une frame demandée, s'assurer que ce GOP est décodé et en cache avant que la frame soit nécessaire, et évincer ceux dont il n'a plus besoin pour que la mémoire ne grimpe pas silencieusement tout au long de la vidéo. Se tromper sur ce cache, et les frames ressortent corrompues ou le décodage se bloque. Bien faire les choses, et le navigateur relit exactement la plage demandée, à la demande, sans aucune étape de prétraitement devant.

Ce qui en est sorti, c'est la partie de Rendr qui mérite vraiment le nom rendr-web : celle qui prend une composition JSON et la transforme en frames indépendantes, prêtes à être capturées. Ce n'est pas tout le moteur. La capture, c'est CEF et la mémoire partagée, l'encodage, c'est toujours FFmpeg en bout de chaîne. rendr-web, c'est le milieu : la partie qui lit à quoi une vidéo est censée ressembler et qui la dessine, frame par frame, sans jamais avoir besoin de prétraiter un seul clip.

³ *WebCodecs : une API du navigateur qui permet à une page web de décoder et d'encoder de la vidéo et de l'audio directement, sans bibliothèque séparée ni étape de prétraitement en dehors du navigateur.*

⁴ *Démultiplexer (demux) : séparer le conteneur d'un fichier vidéo des flux audio et vidéo qu'il contient, pour que chaque flux puisse être décodé indépendamment.*

⁵ *GOP (groupe d'images) : un bloc de frames vidéo qui dépendent toutes d'une frame clé complète pour se décoder, la plupart des frames intermédiaires ne stockant que ce qui a changé depuis la précédente.*

---

## Section 6 : pourquoi un navigateur, et la vision de la ferme de rendu

Le navigateur est la surface d'interface la plus puissante qui existe. Il tourne partout, il peut afficher à peu près tout ce qu'on peut imaginer, et construire une application dessus va plus vite que sur presque n'importe quoi d'autre. Chaque éditeur que Rendr pourrait devenir un jour (visuel, audio, une vraie timeline) vit déjà dans le même runtime que celui qui fait le rendu. Ce n'est pas un hasard. C'est la raison pour laquelle tout le moteur est construit sur un navigateur plutôt que sur un moteur de rendu natif.

L'indépendance des frames n'est pas juste une optimisation. C'est ce qui rend la prochaine étape possible. Comme aucune frame ne dépend d'une autre, le rendu n'a pas besoin de se faire sur une seule machine. On peut découper une composition en plages de frames, donner chaque plage à une machine différente n'importe où dans le monde, et laisser un orchestrateur récupérer les résultats et recoller la vidéo finale. Une ferme de rendu qui monte en charge comme un CDN : une machine ou mille, même code, même résultat.

Ça veut aussi dire que le travail n'a pas besoin d'être réparti à parts égales. Une vidéo est rarement uniforme : quelques secondes de composition lourde éparpillées entre de longs passages bon marché. On peut router les groupes de frames coûteux vers une machine puissante et laisser les machines moins chères s'occuper du reste, ou même gérer l'orchestration elle-même. Payer de la puissance uniquement sur les frames qui en ont vraiment besoin, plutôt que de faire tourner toute la vidéo sur la machine la plus chère qu'on possède. À l'échelle, ce n'est pas une petite économie, c'est la différence entre une ferme de rendu viable et une qui ne l'est pas.

La prochaine pièce de ce puzzle, encore devant nous : un calculateur qui lit une composition avant qu'une seule frame ne soit rendue et estime le coût, le temps et la mémoire que chaque groupe de frames va prendre. Connaître la facture avant de la payer, et router en conséquence. Ce n'est pas encore construit, mais c'est la suite logique une fois qu'on a déjà misé sur des frames qui ne dépendent pas les unes des autres.

C'est la forme de l'entreprise que Rendr a toujours été destiné à devenir. Pas un moteur de rendu tout seul, une plateforme sur laquelle d'autres construisent des entreprises de vidéo automatisée. Le moteur en dessous est terminé.

Ce qu'il reste à faire, c'est tout ce qu'on construit dessus.

---

## Section 7 : et après

Il existe déjà mille éditeurs vidéo. En construire un de plus n'a jamais été le but. L'objectif réel, depuis que l'idée est apparue en fixant un plafond, n'a jamais été « faire une vidéo ». C'était faire beaucoup de bonnes vidéos, automatiquement, au coût le plus bas possible, sans qu'un humain touche à la plupart d'entre elles. Tout ce qui est documenté plus haut, le moteur, l'indépendance des frames, la vision de la ferme de rendu, existe au service de cet unique objectif, pas l'inverse.

Voici à quoi ça ressemble une fois construit. Imaginez quelque chose de plus proche de n8n⁶ que de Premiere : un canevas de nœuds d'automatisation reliés entre eux, un nœud qui récupère des données depuis une API, un autre qui les fait passer par un LLM, un autre qui parse le résultat. L'un de ces nœuds s'appelle Editor. On clique dessus, et ça ouvre une autre application, un vrai éditeur de timeline, sauf qu'on ne monte pas une vidéo unique, on construit un template. On voit exactement à quoi ressemblent les données qui traversent l'automatisation une fois posées dans la composition, et on façonne la vidéo autour de ça : couleurs, mise en page, audio, timing, tout prévisualisable avec de vraies données d'exemple. Ce qui en sort n'est pas une vidéo. C'est une forme réutilisable dans laquelle une vidéo peut être coulée. On branche ce template dans l'automatisation, on programme le tout sur un planning, et maintenant les données sont récupérées, reformulées par l'IA, injectées dans le template, et rendues en vidéo finie sans que personne n'y touche après la configuration initiale.

Poussez encore un cran plus loin, et le template n'a même plus besoin d'un humain. Une composition, c'est juste un fichier JSON. Ce n'est pas un détail d'implémentation, c'est toute l'ouverture nécessaire pour qu'une IA écrive le fichier directement, générant des compositions entières toute seule une fois qu'elle maîtrise assez bien le format. Pas en assistant un éditeur. En étant l'éditeur.

Rien de tout ça ne vit non plus dans une seule application. Le plan, c'est un projet composé de plusieurs petites applications, chacune sur sa propre sous-URL, chacune responsable d'une seule chose sur la même composition partagée : une pour l'étalonnage des couleurs, une pour l'audio, et ainsi de suite. Un moteur audio dédié vit à l'intérieur du moteur de rendu principal pour cette raison, un contrôle total sur l'audio et sur la façon dont il se cale avec les visuels, pas de l'audio ajouté après coup sur une piste vidéo. Ce n'est pas non plus une idée nouvelle pour ce moteur. La v1 avait déjà un système de plugins fonctionnel, des éléments personnalisés avec leur propre rendu, leur propre style, leurs propres bibliothèques, insérés dans le moteur comme n'importe quel élément natif. La version multi-applications, c'est cette même idée poussée plus loin : étendre le moteur en construisant à côté de lui, pas en le réécrivant.

Rien de tout ça ne fonctionne sans la partie déjà construite. Chaque idée ici part du principe qu'on a une base rapide, stable, et qui produit des résultats en qui on peut vraiment avoir confiance, frame après frame, vidéo après vidéo. C'est là qu'est passée la dernière année. Le reste, l'éditeur, le canevas d'automatisation, l'IA qui écrit ses propres compositions, c'est ce qui peut désormais exister parce que les fondations en dessous sont solides.

J'ai commencé ça parce que rien de tel n'existait et que le construire moi-même me semblait la seule option honnête. Ce qui est construit aujourd'hui, c'est la partie difficile, ennuyeuse, sans gloire : un moteur qui rend de la vidéo vite, correctement, sans jamais tomber. Tout ce qu'il y a dans cette section, c'est ce qui peut arriver maintenant, parce que cette partie-là est enfin terminée.

⁶ *n8n : un outil d'automatisation visuel où l'on construit un workflow en reliant des nœuds sur un canevas, chaque nœud gérant une étape, comme récupérer des données, les transformer, ou déclencher une action.*
