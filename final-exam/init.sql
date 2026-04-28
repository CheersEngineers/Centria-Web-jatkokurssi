-- init.sql
-- Simple person registry for PostgreSQL / Docker

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