# Shorts Engine — Copy Working Doc (FR)

Statut : hero, résumé et développé complet (sections 1-7) verrouillés.
Copie française complète.

Note d'approche : cette version française n'est pas une traduction
littérale de `copy.en.md`. Même structure, section par section, adaptée
idiomatiquement, approuvée une par une, jamais traduite mot à mot. Voir
`copy.en.md` pour la note d'approche générale (la page entière est écrite
pour la version « vision à l'échelle » de Shorts Engine, pas la version à
trois chaînes qui a vraiment tourné).

---

## Hero

**Kicker (`meta.titlePrefix`)**
Automatisation ; Infrastructure de contenu

**Titre (`meta.title`)**
Shorts Engine

**Sous-titre (`meta.subtitle`)**
Un moteur de contenu conçu pour faire tourner des centaines de chaînes à la fois, sur n'importe quelle plateforme, sans personne aux commandes.

**Description (`meta.description`)**
Shorts Engine écrit, rend et publie des vidéos tout seul, un seul système conçu pour faire tourner des centaines de chaînes au lieu d'une.

**Bandeau de stats (`meta.stats`)**

| Label | Valeur |
| --- | --- |
| Vidéos livrées | 417 |
| Tourné sans supervision | 3 mois |
| Humains impliqués | 0 |
| Plateformes | YouTube, pour l'instant |

Note : `meta.duration` est son propre champ, ajouté automatiquement au
bandeau de stats, pas une ligne du tableau ci-dessus.

---

## Résumé

**L'idée.** Shorts Engine écrit, rend et publie des vidéos tout seul. Ce
n'était pas pensé pour bien faire tourner une chaîne, mais pour en faire
tourner des centaines, sur n'importe quelle plateforme, à partir de la même
base, sans personne aux commandes.

**Ce qui a tourné.** Ce qui a vraiment été livré, c'est la plus petite
version de cette idée : trois chaînes, une plateforme, un seul planning qui
décidait ce qui se faisait et quand ça sortait. Trois mois, 417 vidéos,
sans qu'un seul jour ait eu besoin de quelqu'un pour s'asseoir et le
lancer.

**Ce que ça a prouvé.** Le même bot, nourri d'un profil différent par
chaîne, a produit du contenu qui ne se ressemblait ni à l'oreille ni à
l'image, comme si ça venait de systèmes différents. Langue différente, voix
différente, identité visuelle différente, sans toucher une ligne de code.
C'est ça, la vraie question testée : une seule base, autant de chaînes
différentes qu'on veut bien lui donner.

**Ce qui y a mis fin.** Deux choses séparées, pas une seule. Les chaînes
n'ont jamais eu ce démarrage lent et prudent qui évite à une plateforme de
repérer un compte comme un bot, parce que faire grandir une audience n'a
jamais été le but d'une preuve de concept. Et le moteur de rendu en dessous
a buté sur un vrai plafond, celui-là même qui a mené à sa reconstruction
complète.

**Vers où ça mène.** Rien dans l'architecture ne change à dix chaînes, à
cent, ou à mille. C'est toujours un profil qui entre, une vidéo qui sort.
Ce qui a tourné pendant trois mois, c'est la preuve que la structure en
dessous tient, à n'importe quelle échelle qu'on est prêt à lui donner.

---

La preuve la plus nette est venue de deux semaines sans un seul ordinateur
portable en vue. Je suis parti avec tout le système déjà lancé sur son
propre planning, décidant quoi faire, le rendant, le publiant, pendant que
j'étais ailleurs, complètement. Le seul fil qui me reliait à tout ça,
c'était une notification qui aurait sonné si quelque chose s'était cassé.

Rien ne s'est cassé au point de compter. C'est la première fois que
l'automatisation a tenu au-delà du stade de la démo, parce que je lui avais
confié une vraie décision et que j'étais parti volontairement.

---

## Deep dive

### 1. Pourquoi ce projet ?

Ce n'est pas une suite de tests qui a validé la première version vraiment
solide de Rendr. C'est un planning de publication à tenir chaque jour,
moteur prêt ou non.

C'est le problème que Shorts Engine a résolu. Un moteur de rendu livré à
lui-même ne prouve rien, sinon qu'il compile en local. Ce qui prouve que ça
marche, c'est de lui donner une vraie tâche et un vrai planning : aller
chercher une histoire qui vaut le coup, l'écrire, la rendre, la mettre
devant un vrai public, et recommencer le lendemain, que quelqu'un regarde
ou non. Shorts Engine est devenu ce planning. C'est lui qui décidait ce qui
se faisait, quand ça se rendait, et quand ça sortait, et Rendr devait
encaisser tout ce qu'on lui envoyait.

Ça a tenu, mais pas du premier coup. Sur toute la durée du projet, Shorts
Engine a fait tourner quatre builds différents de Rendr en production,
v1.1.6, v1.2.0, v1.3.0 et v1.3.1, ce dernier portant l'essentiel de la
production réelle. Chaque version a dû faire ses preuves contre de vraies
échéances de publication, pas un test en local. C'est une pression
différente de celle d'une démo, et c'est cette pression qui a façonné ce
que Rendr est devenu.

Le système en dessous n'a jamais été pensé comme un bot Reddit à usage
unique non plus. Aller chercher une histoire n'était qu'une petite étape,
remplaçable, tout au début (un appel à un outil externe, nettoyé et
étiqueté avant même d'atteindre le rendu). Tout ce qui venait après, la
planification, le rendu, la publication, se fichait complètement du
contenu ou de sa provenance. Le détail qui compte le plus avec le recul :
une fois qu'une poignée de chaînes tournaient proprement sur une même base,
la question n'était plus « est-ce que ça marche », mais « combien d'autres
cette même base pourrait porter ».

### 2. Ce que c'est vraiment

Enlève les détails, et Shorts Engine, ce sont trois briques reliées entre
elles, chacune ignorant presque tout des deux autres.

D'abord, les bots. Un bot prend une seule chose en entrée, le profil d'une
chaîne, et produit une seule chose en sortie, une composition complète : le
texte, la durée, la voix, les visuels, le style. Deux chaînes qui passent
par le même bot avec deux profils différents ressortent comme si elles
avaient été faites par deux personnes différentes, parce que pour le
système, c'est exactement le cas. Change le bot, et la base n'a rien à
changer de son côté ; elle se met juste à produire un autre type de
contenu, à partir du même planning.

Ensuite, le rendu. Une fois la composition prête, elle part vers le moteur
de rendu, et la base attend une vidéo finie en retour. Peu importe comment
cette vidéo a été fabriquée, seul le résultat compte.

Enfin, la publication. Une autre partie du même planning vérifie ce qui est
prêt et attendu, et le met en ligne au bon moment, une chaîne et une vidéo
à la fois.

Aucune de ces trois briques n'a le droit d'aller fouiller dans les deux
autres. Un bot ne rend pas de vidéo, le rendu ne décide pas ce qui se
publie, et la publication ne peut pas demander à un bot d'écrire autre
chose. Chacune fait un seul travail et passe le relais à la suivante. C'est
ce qui fait qu'ajouter une centième chaîne revient à changer un fichier de
config, pas à tout réécrire : la base ne monte pas en échelle en devenant
plus intelligente, elle y arrive en restant bête et en laissant passer
plus de chaînes par les trois mêmes portes.

### 3. Une base, deux chaînes qui n'ont rien à voir

Pour un objectif comme automatiser des centaines de chaînes et des
milliers de vidéos par jour, le système ne pouvait pas se complexifier à
chaque nouvelle chaîne ajoutée. Ajouter une chaîne, ou en changer une,
devait vouloir dire toucher un fichier de config, pas du code.

C'est pour ça qu'une chaîne ne porte aucune logique. Elle porte des
paramètres. Chaque chaîne est reliée à un bot¹, un module conçu pour gérer
un type de contenu ou une niche donnée, et lui transmet tout ce qui la
concerne : la langue, le style d'écriture, la voix, le style des
sous-titres, le dossier de vidéos et de musiques de fond à utiliser, et le
reste. Le bot fait le vrai travail, celui de générer la composition. La
chaîne se contente de lui dire comment.

Deux chaînes reliées au même bot ressortent à peine reconnaissables comme
cousines. L'une écrivait en anglais, sobre et posé, à la première
personne, sans rien qui laisse deviner d'où venait vraiment l'histoire.
L'autre écrivait en français, plus fort, plus vite, pensée pour un tout
autre public, jusqu'à la vitesse de la voix off. L'identité visuelle se
sépare tout autant : la police, la couleur d'accent, la taille des
sous-titres, tout ça réglé chaîne par chaîne, sans toucher une ligne de
code.

Ajoute une centième chaîne, et rien de tout ça ne change. C'est toujours
un bot, et un nouveau jeu de paramètres.

¹ *Un bot est un module autonome qui génère une composition vidéo complète
pour un type de contenu ou une niche donnée. Shorts Engine l'appelle, lui
transmet les paramètres d'une chaîne, et récupère une composition en
retour. Pas besoin de savoir comment le bot s'y est pris.*

### 4. Le vrai run

Trois mois, noir sur blanc. Du 21 juillet au 29 octobre 2025.

La première semaine a été rugueuse, comme souvent une première semaine.
Près d'une centaine d'erreurs en quelques jours, presque toujours le même
bug, avant que le scheduler ne se stabilise pour de bon. Rien de tout ça
n'a atteint le vrai run. Une fois lancé, c'était propre, et ça l'est resté.

À partir de là, le système a produit 417 vidéos rendues sur 143 jours de
production distincts, sans qu'un seul de ces jours ait eu besoin de
quelqu'un pour s'asseoir et le lancer. La file de publication donne un
chiffre légèrement différent, plus honnête : 411 uploads programmés, 405
mis en ligne sans accroc, 4 en échec complet, 2 rendus mais jamais
publiés. Sur trois mois de publication automatisée, sur une vraie
plateforme, contre une vraie API, l'ensemble a complètement échoué quatre
fois.

Et ça ne tournait pas en pilote automatique sans qu'on y touche, non plus.
Pendant tout le run, les réglages continuaient de bouger selon ce qui
marchait vraiment : sous-titres plus grands, fond d'écran plus rythmé, voix
off plus rapide, meilleure musique, accroches réécrites pour capter
l'attention dès la première seconde. Chaque changement venait de ce qui se
passait réellement sur la chaîne, pas d'un pari fait une fois au départ et
laissé tel quel.

Ce ne sont pas des chiffres de démo. Une démo tourne une fois, sur
commande, devant quelqu'un qui regarde. Ça, ça tournait sur son propre
planning, tous les jours, que quelqu'un vérifie ou non, en s'ajustant au
fil de l'eau, assez longtemps pour que les échecs se comptent sur les
doigts d'une main au lieu de résumer toute l'histoire.

### 5. Démo en direct

Le moteur qui a vraiment fait tourner tout ça est à la retraite. Ce qu'il
écrivait sur le disque, lui, est toujours là : un fichier de composition,
une description brute de ce qu'est une vidéo avant d'en devenir une.

Ce format a survécu. C'est la même idée qui fait tourner le moteur actuel
de Rendr, celui qui rend vraiment la composition ci-dessous, en direct,
dans le navigateur. Change l'accent, la couleur de surbrillance, la façon
dont les sous-titres se calent sur la voix, et observe la réaction,
immédiate.

Une chose à dire clairement : les vraies vidéos avaient une voix off et de
la musique sous tout ça. Le moteur ci-dessous ne gère pas encore l'audio,
donc ce qu'on voit ici, c'est la version muette, même composition, même
timing, juste sans le son.

### 6. Ce qui a mis fin au projet

La première cause, j'aurais dû la voir venir. Une chaîne qui apparaît comme
un compte Google flambant neuf, qui poste des vidéos via une API dès le
premier jour, ressemble exactement à ce qu'elle est aux yeux d'une
plateforme qui guette ce genre de signal : un bot, pas un créateur en train
de construire une audience. Faire les choses bien, de façon à ne pas se
faire repérer, ça veut dire prendre son temps avec une chaîne : des
publications manuelles au début, de vraies interactions, des appareils et
des adresses IP séparés pour chaque chaîne, histoire que ça ne ressemble
pas à une seule personne qui fait tourner une dizaine de comptes. C'est un
vrai travail, méthodique, et ce n'était pas le travail que ce projet
visait. Le but, c'était de prouver que le pipeline pouvait tourner sans
supervision, pas de faire grandir une audience, donc aucune chaîne n'a eu
ce démarrage prudent qui permet vraiment de rester sous le radar. Les vues
se sont effondrées, exactement ce qui arrive une fois qu'une plateforme
arrête de faire confiance à un compte.

La deuxième cause vivait dans le moteur de rendu dont dépendait cette
génération de Shorts Engine, et cette histoire est déjà racontée en entier
sur [la page de Rendr](/project/rendr#v1-the-fastest-thing-that-would-ship).
En version courte : le moteur a buté sur un vrai plafond, et c'est en le
heurtant ici qu'il a fini par être reconstruit.

Aucune des deux n'est un échec du pipeline. L'une est un problème de
distribution qu'aucune ingénierie ne résout de ce côté-là. L'autre a déjà
été réglée, juste pas à temps pour tourner face à ce projet.

### 7. Vers où ça mène

Ce qui a vraiment tourné n'est pas le plafond. Trois chaînes, une
plateforme, quelques centaines de vidéos par jour au maximum, c'est ce
qu'il fallait pour trois mois et une preuve de concept, pas la limite du
système.

Les trois mêmes briques, bots, moteur de rendu, publication, se moquent du
nombre de chaînes qui passent par elles. Donne la même base à quelques
centaines de chaînes au lieu de trois, réparties sur toutes les
plateformes au lieu d'une, et rien dans l'architecture ne change. C'est
toujours un profil qui entre, une vidéo qui sort, encore et encore. Une
chaîne qui poste des histoires Reddit et une chaîne qui poste des vidéos
musicales ralenties et synchronisées ont l'air d'être le même genre de
chaîne pour ce système : un profil et un bot, rien de plus spécifique que
ça.

À la vraie échelle, ça donne des centaines de chaînes, chacune avec sa
propre niche, sa propre voix, son propre public, tournant sur une seule
base, produisant des milliers de vidéos par jour, gérées depuis un seul
tableau de bord au lieu d'un fichier de config : ajouter des chaînes,
suivre les performances, lancer des tests A/B contre du vrai trafic,
brancher une nouvelle plateforme sans toucher à ce qui marche déjà. Mets
tout ça sur un serveur avec un GPU, et le même matériel qui fait le rendu
peut faire tourner des modèles locaux qui surveillent l'ensemble : repérer
les problèmes, faire remonter ce qui marche vraiment, signaler des
décisions au lieu d'échouer en silence jusqu'à ce que quelqu'un pense à
vérifier.

Cette version-là n'a jamais été construite. Ce qui a tourné pendant trois
mois, c'est la preuve que la structure en dessous tient.
