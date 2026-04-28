# Deployment Guide: Running the Application on Debian

This guide explains how to deploy the provided Node.js + PostgreSQL application on a **Debian virtual machine**, **without Docker**, and **without using sudo** (assuming you are logged in as `root`, which is common in fresh VMs and lab environments).

***

## 1. Assumptions

*   You are logged in as **root**
*   Debian system (e.g. Debian 11 / 12)
*   Internet access for package installation
*   Following files are available:
    *   `package.json`
    *   `app.js`
    *   `init.sql`
    *   optional `public/` directory

***

## 2. System Preparation

Update package lists and installed software:

```bash
apt update
apt upgrade -y
```

***

## 3. PostgreSQL Installation and Setup

### 3.1 Install PostgreSQL

```bash
apt install -y postgresql postgresql-contrib
```

Ensure the service is running:

```bash
systemctl status postgresql
```

***

### 3.2 Database Configuration

Switch to the PostgreSQL administrative user:

```bash
su - postgres
```

Start the PostgreSQL shell:

```bash
psql
```

Run the following commands:

```sql
CREATE DATABASE person_registry;
ALTER DATABASE person_registry OWNER TO postgres;
ALTER USER postgres WITH PASSWORD 'postgres';
```

Exit PostgreSQL:

```sql
\q
```

Exit the postgres OS user:

```bash
exit
```

***

### 3.3 Initialize the Database Schema

Make sure `init.sql` is present in the current directory, then run:

```bash
psql postgresql://postgres:postgres@localhost:5432/person_registry -f init.sql
```

OR

Run the following commands in the psql shell:

```sql
CREATE TABLE IF NOT EXISTS persons (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    birth_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional sample data
INSERT INTO persons (first_name, last_name, email, phone, birth_date)
VALUES
    ('Matti', 'Meikäläinen', 'matti.meikalainen@example.com', '0401234567', '1990-05-12'),
    ('Liisa', 'Virtanen', 'liisa.virtanen@example.com', '0507654321', '1988-11-03')
ON CONFLICT (email) DO NOTHING;
```

Verify:

```bash
psql postgresql://postgres:postgres@localhost:5432/person_registry
```

```sql
\dt
SELECT * FROM persons;
```

If you see the `persons` table and sample data, the database is ready.

***

## 4. Install Node.js and npm

Install Node.js and npm from Debian repositories:

```bash
apt install -y nodejs npm
```

Verify installation:

```bash
node -v
npm -v
```

***

## 5. Application Setup

### 5.1 Create Project Directory

```bash
mkdir /opt/person-registry
cd /opt/person-registry
```

Copy the following files into this directory:

*   `package.json`
*   `app.js`
*   `public/` (if applicable)

***

### 5.2 Install Node.js Dependencies

```bash
npm install
```

This installs:

*   `express`
*   `pg`

***

## 6. Environment Configuration

Set the database connection URL exactly as required by the application:

```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/person_registry"
```

Verify:

```bash
echo $DATABASE_URL
```

(Optional – to make permanent)

```bash
echo 'export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/person_registry"' >> /root/.bashrc
```

***

## 7. Start the Application

### Normal mode

```bash
npm start
```

### Development mode (auto‑reload)

```bash
npm run dev
```

If successful:

*   The server listens on **port 3000**
*   PostgreSQL connection is established

Test locally:

```bash
curl http://localhost:3000
```

Or from another machine:

    http://<VM-IP>:3000

***

## 8. Network and Firewall Notes

On most Debian VMs, ports are open by default.  
If a firewall is enabled, ensure port **3000** is allowed.

***

## 9. Docker vs Native Deployment Mapping

| Docker Compose       | Debian (no Docker)        |
| -------------------- | ------------------------- |
| PostgreSQL container | system PostgreSQL service |
| init.sql volume      | `psql -f init.sql`        |
| `POSTGRES_*` vars    | manual database creation  |
| DATABASE\_URL env    | `export DATABASE_URL=...` |
| Web container        | Node.js process           |
| Port mapping         | App listens on port 3000  |

***

## 10. Common Issues

### Database connection fails

*   Ensure PostgreSQL is running
*   Ensure `DATABASE_URL` uses `localhost`, not `db`

### Password authentication failed

*   Ensure the password was set using:
    ```sql
    ALTER USER postgres WITH PASSWORD 'postgres';
    ```

### Table does not exist

*   Ensure `init.sql` was executed against `person_registry`

***
