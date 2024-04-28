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
    role VARCHAR(255) CHECK (role IN ('client', 'dedicated game server')),
    password VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    rank INT CHECK (rank >= 1 AND rank <= 5),
    kda FLOAT
);
```

Et une table pour les dedicated server
```sql
CREATE TABLE dedicated_server (
    server_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address VARCHAR(45)
);
```

Pour les achievements, il faut créer une table qui fait le lien entre un user et un achievements, pour cela

Une table achievements
```sql
CREATE TABLE achievements (
    id int PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image TEXT
);
```

ainsi qu'une de lien
```sql
CREATE TABLE user_achievements (
    user_uuid UUID REFERENCES users(uuid),
    achievement_id int REFERENCES achievements(id),
    PRIMARY KEY (user_uuid, achievement_id)
);
```
Ajouter les succès implémentés 
```sql
INSERT INTO achievements (id, name, description, image)
VALUES
    ('1', 'Jesus ?!?!', 'Walk on water', 'https://example.com/achievement1.jpg'),
    ('2', 'Wtf', 'Get on Zeus head', 'https://example.com/achievement2.jpg'),
    ('3', 'Fffffantastic', 'Press F', 'https://example.com/achievement3.jpg');
    ('4', 'Vrouuuum', 'Sprint for the first time', 'https://example.com/achievement4.jpg');
    ('5', 'Ratatata', 'Discharge your magazine', 'https://example.com/achievement5.jpg');

```

Enfin, il faut installer l'extension **uuid-ossp** pour pouvoir créer des user id différent directement dans postgresql
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

Si jamais, vous pouvez vérifier les extentions activées avec 
```sql
SELECT * FROM pg_extension;
```

> :warning: Les extensions sont installés sur la database, pas sur PostgreSQL, assurez-vous d'être connecter sur la database au préalable.
Pour vous connecter dans le futur à une database, vous pouvez faire
```sql
psql -U postgres -d databasename
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

