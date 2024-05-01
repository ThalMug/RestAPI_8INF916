# Configuration de l'application

## Installation de Docker

Télécharger Docker Desktop à cette adresse : https://www.docker.com/products/docker-desktop/

Ensuite, lancer Docker Desktop.

Une fois fait, vous pouvez lancer le docker avec

```bash
docker-compose up --build
```
vous pouvez changer les variables docker-compose.yml si besoin

## Récupération de l'IP du Dedicated Game Server

Lorsqu'un dedicated game server se lance, il envoie une requête à l'API. Ce dernier est censé détecter l'adresse IP de l'envoyeur (ie, le dgs), sauf que nous nous sommes rendus compte qu'avec Docker Compose, l'adresse IP interne de docker, et après plusieurs jours de débug nous n'avons toujours pas réussi à régler cela. 

Nous avons donc décidé de faire en sorte que le dgs puisse d'abord récupérer son adresse IP en faisant une requête à "http://<votre_adresse_ip>:3001/ip", puis de renvoyer cette dernière à l'api dans son body. 

Si vous souhaiter modifier l'address ip dans le code Unreal il faudra le modifier dans le constructeur du SGOnline.cpp avec un format du type "http://<votre_adresse_ip>:".

Il faudra donc, en plus de lancer le docker, lancer un server node en dehors du docker avec la commande :

```bash
node ip_getter.js
```
## Utilisation en jeu

Une fois tout configuré vous pouvez vous register et vous login sur le main menu.
Pour trouver une partie, appuyez sur le bouton matchmaking.

Nous avons remarqué quelques bugs notamment des crashs du dedicated server ou des clients.
Il s'agit d'erreur de pointeur que nous n'avons pas réussi à régler et qui peuvent subvenir aléatoirement.
Nous avons quand même réussi a faire des tests sur le jeu mais il faut faire attention.

## Autres notes

Les achievements Fffffantastic et Ratatata ne sont pas déblocable dans le jeu.
Mais les autres sont implémentés et déblocables (ex: sprinter pour la première fois).

Une partie du système d'ami a été implémenté dans le jeu.


Normalement ca ne devrait pas arriver, mais dans le cas ou vous auriez un problème avec les variables d'environnement vous pourrez créer un fichier ".env" dans lequel vous pourrez mettre :

```console
DATABASE_URL: postgresql://admin:admin@restapi_8inf916-ShootingGameDB-1:5432/shootinggame
JWT_SECRET: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```    
