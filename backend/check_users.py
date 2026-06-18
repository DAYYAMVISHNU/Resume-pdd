import sqlite3

conn = sqlite3.connect('ats_analyzer.db')
conn.row_factory = sqlite3.Row
cur = conn.cursor()
cur.execute('SELECT id, name, email, is_admin, created_at FROM users')
rows = cur.fetchall()
print(f'Total users: {len(rows)}')
for r in rows:
    print(f'  id={r["id"]} | email={r["email"]} | name={r["name"]} | is_admin={r["is_admin"]} | created={r["created_at"]}')
conn.close()
