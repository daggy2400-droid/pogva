CREATE TABLE IF NOT EXISTS admin_users (
    id           SERIAL PRIMARY KEY,
    username     VARCHAR(100) NOT NULL UNIQUE,
    password     TEXT NOT NULL,
    role         VARCHAR(50) NOT NULL DEFAULT 'admin',
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default admin: username=admin, password=admin123 (bcrypt hash)
INSERT INTO admin_users (username, password, role)
VALUES ('admin', '$2a$10$GZFHtSEyo1j./57aD7L.S.lsLVnFbU5y6kfVSK3UkqLvjhUF0nkTG', 'admin')
ON CONFLICT (username) DO NOTHING;
