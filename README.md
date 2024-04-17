# Configuration de l'application

## Variables d'environnement requises

Pour faire fonctionner cette application, vous devez créer un fichier `.env` à la racine du projet et y définir les variables d'environnement suivantes :

- `DATABASE_URL` : L'URL de connexion à votre base de données.
- `JWT_SECRET` : La clé secrète utilisée pour sécuriser votre application.

## Exemple de contenu du fichier .env

Voici un exemple de contenu pour le fichier `.env` :

DATABASE_URL="postgresql://postgres:user@localhost:port/databasename"
JWT_SECRET="arandomstring"
