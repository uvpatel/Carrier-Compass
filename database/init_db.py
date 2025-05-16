import sqlite3

conn = sqlite3.connect('database/career_compass.db')
c = conn.cursor()
with open('database/schema.sql') as f:
    c.executescript(f.read())
conn.commit()
conn.close()
print("Database initialized!")