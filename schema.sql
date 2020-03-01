CREATE TABLE IF NOT EXISTS requests(
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  method varchar(10),
  url text,
  headers text,
  body text
);