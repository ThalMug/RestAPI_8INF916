# Configuration de l'application

## Installation de Docker

Télécharger Docker Desktop à cette adresse : https://www.docker.com/products/docker-desktop/

Ensuite, lancer Docker Desktop.

Une fois fait, vous pouvez lancer le docker avec

```bash
docker-compose up --build
```

## Récupération de l'IP du Dedicated Game Server

Lorsqu'un dedicated game server se lance, il envoie une requête à l'API. Ce dernier est censé détecter l'adresse IP de l'envoyeur (ie, le dgs), sauf que nous nous sommes rendus compte qu'avec Docker Compose, l'adresse IP interne de docker, et après plusieurs jours de débug nous n'avons toujours pas réussi à régler cela. 

Nous avons donc décidé de faire en sorte que le dgs puisse d'abord récupérer son adresse IP en faisant une requête à "http://<votre_adresse_ip>:3001/ip", puis de renvoyer cette dernière à l'api dans son body. 

Il faudra donc, en plus de lancer le docker, lancer un server node en dehors du docker avec la commande ...

Pour cela, il suffit de faire 

```bash
node ip_getter.js
```