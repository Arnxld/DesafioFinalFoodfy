CREATE TABLE recipes (
	id SERIAL PRIMARY KEY,
  chef_id INT NOT NULL,
  title TEXT NOT NULL,
  ingredients TEXT[] NOT NULL,
  preparation TEXT[] NOT NULL,
  information TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE chefs (
	id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT now() NOT NULL,
  file_id INT NOT NULL
);

CREATE TABLE files (
	id SERIAL PRIMARY KEY,
  name TEXT,
  path TEXT NOT NULL
);

CREATE TABLE recipe_files (
	id SERIAL PRIMARY KEY,
  recipe_id INT REFERENCES "recipes"("id"),
  file_id INT REFERENCES "files"("id")
);

CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	email TEXT UNIQUE NOT NULL,
	password TEXT NOT NULL,
	reset_token TEXT,
	reset_token_expires TEXT,
 	is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT(now()),
  updated_at TIMESTAMP DEFAULT(now())
);

-- foreign key in recipes
ALTER TABLE "recipes" ADD COLUMN "user_id" INT
ALTER TABLE "recipes" ADD FOREIGN KEY ("user_id") REFERENCES "users"("id")

-- foreign key in chefs
ALTER TABLE "chefs" ADD FOREIGN KEY ("file_id") REFERENCES "files"("id")

-- create procedure
CREATE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- auto updated_at recipes
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON recipes
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- auto updated_at users
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- session table
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "session" 
ADD CONSTRAINT "session_pkey" 
PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- deleção em cascata (quando deletar usuário, deleta receita e arquivos)
ALTER TABLE "recipes"
DROP CONSTRAINT recipes_user_id_fkey,
ADD CONSTRAINT recipes_user_id_fkey
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE;

ALTER TABLE "recipe_files"
DROP CONSTRAINT recipe_files_recipe_id_fkey,
ADD CONSTRAINT recipe_files_recipe_id_fkey
FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id")
ON DELETE CASCADE;

ALTER TABLE "recipe_files"
DROP CONSTRAINT recipe_files_file_id_fkey,
ADD CONSTRAINT recipe_files_file_id_fkey
FOREIGN KEY ("file_id") REFERENCES "files"("id")
ON DELETE CASCADE;

ALTER TABLE "chefs"
DROP CONSTRAINT chefs_file_id_fkey,
ADD CONSTRAINT chefs_file_id_fkey
FOREIGN KEY ("file_id") REFERENCES "files"("id")
ON DELETE CASCADE;

-- to run seeds
DELETE FROM products;
DELETE FROM users;
DELETE FROM files;

-- restart sequence auto_increment from tables id
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE files_id_seq RESTART WITH 1;