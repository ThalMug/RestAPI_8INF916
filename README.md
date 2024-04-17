# Configuration de l'application

## Installation de postgresql

Télécharger et installer postgresql

Connectez vous à PostgreSQL avec
```powershell
psql -U postgres #Utilisateur root
```

Ensuite vous pouvez créer une nouvelle database
```sql
CREATE DATABASE databasename;
```

Vous pouvez vous connecter à cette nouvelle base avec "\c databasename"

Ensuite vous pouvez créer la table users
```sql
CREATE TABLE users (
    uuid UUID PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL
);
```


## Variables d'environnement requises

Pour faire fonctionner cette application, vous devez créer un fichier `.env` à la racine du projet et y définir les variables d'environnement suivantes :

- `DATABASE_URL` : L'URL de connexion à votre base de données.
- `JWT_SECRET` : La clé secrète utilisée pour sécuriser votre application.

## Exemple de contenu du fichier .env

Voici un exemple de contenu pour le fichier `.env` :

```console
DATABASE_URL="postgresql://postgres:user@localhost:port/databasename"
JWT_SECRET="arandomstring"
```

