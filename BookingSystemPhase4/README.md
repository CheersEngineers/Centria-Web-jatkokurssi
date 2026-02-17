# Creating the database

## Docker

1. Creating Containers and Services
```bash
docker compose up -d --build
```

2. Connecting to the Database
```bash
docker exec -it booking-system-phase4-db psql -U booking_dbuser -d booking_db
```

3. Creating the Table in the Database
```sql
CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  available BOOLEAN NOT NULL DEFAULT false,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  price_unit TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

4. Checking if the table exists
```bash
booking_db=# \dt
              List of relations
 Schema |   Name    | Type  |     Owner
--------+-----------+-------+----------------
 public | resources | table | booking_dbuser
(1 row)

booking_db=#
```

5. Verifying the table content
```bash
booking_db=# SELECT * FROM resources;
 id | name | description | available | price | price_unit | created_at 
----+------+-------------+-----------+-------+------------+------------
(0 rows)

booking_db=#
```

6. The table content after adding the resource
```bash
booking_db=# SELECT * FROM resources;
 id | name  | description | available | price | price_unit |          created_at
----+-------+-------------+-----------+-------+------------+-------------------------------
  1 | abcde | abcdefghij  | t         |  0.04 | day        | 2026-01-31 07:52:31.547829+00
(1 row)

booking_db=#
```

7. Deleting Content (Optional)
```bash
booking_db=# DELETE FROM resources;
DELETE 0
booking_db=#
```

8. Closing the database connection
```bash
booking_db=# \q
```

## Debian

1. Installing PostgreSQL

```bash
sudo apt install postgresql -y
```

2. Connecting to the PostgreSQL
```bash
linuxadmin@debian01:~$ sudo -i -u postgres
postgres@debian01:~$ psql
psql (17.7 (Debian 17.7-0+deb13u1))
Type "help" for help.

postgres=#
```

3. Creating the Database and the user account
```bash
CREATE DATABASE booking_db;
CREATE USER booking_dbuser WITH ENCRYPTED PASSWORD 'Secret1234!';
GRANT ALL PRIVILEGES ON DATABASE booking_db TO booking_dbuser;
```

```bash
\c booking_db postgres
GRANT ALL ON SCHEMA public TO booking_dbuser;
```

4. Connecting to the Database
```bash
linuxadmin@debian01:~$ psql -h localhost -U booking_dbuser -d booking_db
Password for user booking_dbuser:
psql (17.7 (Debian 17.7-0+deb13u1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, compression: off, ALPN: postgresql)
Type "help" for help.

booking_db=>
```

5. Creating the Table in the Database
```sql
CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  available BOOLEAN NOT NULL DEFAULT false,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  price_unit TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

6. Checking if the table exists
```bash
booking_db=> \dt
              List of relations
 Schema |   Name    | Type  |     Owner
--------+-----------+-------+----------------
 public | resources | table | booking_dbuser
(1 row)

booking_db=>
```

7. Verifying the table content
```bash
booking_db=> SELECT * FROM resources;
 id | name | description | available | price | price_unit | created_at
----+------+-------------+-----------+-------+------------+------------
(0 rows)

booking_db=>
```