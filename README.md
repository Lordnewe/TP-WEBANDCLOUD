# Projet TinyPet

Ce projet a été réalisé par Jules FICHOT, Ewen GIBOIRE et Killian BRONDY.

L'objectif de ce projet est de réaliser une application web permettant de poster, modifier, lister des pétitions.
Les fonctionnalités devront être aux sites tels que : https://secure.avaaz.org/community_petitions/fr ou https://www.change.org/

Voici les différents liens utiles
## Les liens

* Lien vers [l'application](https://light-result-300815.appspot.com/) 
* Lien vers le [portail de l'API](https://endpointsportal.light-result-300815.cloud.goog/) 
* Lien vers le [Github]()

## Les objectifs de ce projet
Dans le cadre du module de développement cloud encadré par M. Molli enseignant chercheur à la Faculté des Sciences et Techniques de l'Université de Nantes,
nous devons développer une application de gestion de pétitions en s'appuyant sur des technologies cloud, dans notre contexte Google App Engine et son Datastore.

## Cahier des charges

Voici la liste des fonctionnalités à développer :

* Un utilisateur doit pouvoir créer une pétition
* Un utilisateur doit pouvoir signer une pétition (il ne doit pas pouvoir signé plusieurs fois)
* Lister les pétitions signées d'un utilisateur triées par date de signature
* Lister les 100 pétitions les plus signées triées par date de création
* Optionel : Recherche de pétitions par tags

## Les fonctionnalités développées

*blablabla
*blibliblo
*blobloblo


A FAIRE EN VRAI -> Nous avons testé ces fonctionnalités en utilisant différents systèmes d'exploitation et différents navigateurs web sans déceler d'anomalie.

IDEES pour parler des solutions WOULLAH
Pour résoudre le problème du fan-out, nous avons implémenté la solution utilisant les index de messages.
Ainsi, nous pouvons ajouter un nombre très élévé de receveurs pour un même post. 
Nous créons une liste par paquet de 40 000 "followers" et nous pouvons créer autant de listes que besoin.
Pour que cette méthode soit pleinement efficace, il faudrait que la création de ces listes soit effectuée en tâche de fond (en utilisant Task Queue).

Pour résoudre le problème de la contention des compteurs pour un post, nous avons implémenté la solution consistant à 
créer plusieurs entités "*compteur*" pour un même post. 
Pour chaque post, nous créons 25 compteurs. 
Pour récupérer le total de "likes" sur un post, il suffit de récupérer tous les compteurs et de sommer leur valeur.

## Benchmark

Les différents tests ont été réalisé 30 fois.
Les temps présentés sont les temps de traitement dans les servlets.

### Ajout d'un post

Pour ce test, l'ajout de post est composé de l'ajout du contenu du post (description et adresse url de l'image), de l'ajout de ses différents compteurs de "likes" et de l'ajout des receveurs du post.

Si le posteur a 10 followers, la moyenne de temps d'ajout d'un post est de 236.7 ms.

Si le posteur a 100 followers, la moyenne de temps d'ajout d'un post est de 301.27 ms.

Si le posteur a 500 followers, la moyenne de temps d'ajout d'un post est de 566.47 ms.

Comme nous pouvons le constater, le temps pris pour ajouter un post est fortement dépendant du nombre de followers du posteur. A 500 followers, ce temps devient trop long. 

Nous pourrions envisager de modifier l'implémentation pour faire en sorte qu'au lieu d'ajouter un à un chaque follower, nous ajoutions des paquets de receveurs. Ainsi, il y aurait moins d'opérations à effectuer pour l'ajout d'un post et l'application passerait mieux à l'échelle.

Comme expliqué précédemment dans **Fonctionnalités implémentées**, une autre solution serait de créer les listes de receveurs en tâche de fond.
Ainsi, le temps pris pour répondre à la requête d'ajout d'un post serait constant. On peut supposer que ce temps serait inférieur à 236ms, le temps pris pour ajouter un post quand on est suivi par 10 personnes.
A l'issue de cette requête, le post et ses compteurs seraient ajoutés et une tâche consistant à créer les différentes listes serait créée. En revanche, la création des listes (et donc la réception pour les followers) s'effectuerait en un temps indéterminé.

### Récupération de posts

Le temps mesuré ici est le temps mis pour récupérer le contenu des posts (description et adresse url de son image) destinés à un utilisateur (sa timeline privée).

Pour récupérer 10 posts dont l'utilisateur est receveur, la moyenne de temps est de 67 ms.

Pour récupérer 100 posts dont l'utilisateur est receveur, la moyenne de temps est de 233 ms.

Pour récupérer 500 posts dont l'utilisateur est receveur, la moyenne de temps est de 1422 ms.

Comme en pratique le nombre de posts récupérés par une requête est bien inférieur à 500, nous pouvons considérer que la récupération des posts passe à l'échelle. Par exemple, nous pouvons citer l'exemple de Twitter qui récupère au maximum 200 tweets en une requête, avec un nombre par défaut de 20 tweets.

Dans notre application, nous récupérons 15 posts par requête, avec en plus des informations sur la personne qui l'a posté (nom et image de profil), le nombre de "likes" du post, et un booléen valant vrai si l'utilisateur aime ce post. Ayant plus d'entités à récupérer pour obtenir toutes ces données supplémentaires, le temps de traitement de la récupération de posts est plus long en pratique. 
Pour pallier à ce problème, à chaque connexion de l'utilisateur sur l'application, on commence par récupérer les posts publics les plus récents. Ces posts ayant de grandes chances d'être dans le cache, l'utilisateur n'a pas à attendre longtemps avant de voir les premiers posts apparaître. Il peut ensuite aller chercher les posts qui lui sont destinés ou les posts qu'il a aimés. 

### Nombre de "likes" par seconde

Nous avons utilisé une des classes présentées en exemple (Counting.sh) pour réaliser ce test.
L'objectif est de voir si la contention sur les compteurs de "likes" d'un post est supportée par l'application.

Avec un seul thread (et donc sans contention), 27 likes en moyenne ont pu être effectués en une seconde.

Avec 5 threads, 71 likes en moyenne ont pu être effectués en une seconde.

Avec 10 threads, 38 likes en moyenne ont pu être effectués en une seconde.

Le problème de cette méthode est que, les threads étant créés dans la même servlet, ils utilisent le même canal de communication vers le datastore. En effet, que chaque thread ait un DatastoreService local ou qu'il n'y en ait qu'un seul commun à tous les threads, les performances sont les mêmes. 
Pour que ce benchmark soit plus représentatif, nous pourrions utiliser un outil comme Apache JMeter.

## Capture d'écran des "kinds" utilisés

Exemple :
Person :

![person](img_readme/kinds/person.png "Person")

## Conclusion


## Annexes

### Aperçus de l'application

Exemple :
![apercu1](img_readme/apercus/apercu1.png "Aperçu 1")

