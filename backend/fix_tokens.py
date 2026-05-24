import sqlite3
conn = sqlite3.connect('ambar_studio_dev.db')
c = conn.cursor()

# Give users with very few tokens their 45 (3 free renders worth)
c.execute("UPDATE users SET tokens_balance=45 WHERE role='user' AND tokens_balance <= 3")
print('Updated low-token users:', c.rowcount)

# Show current state
c.execute('SELECT email, role, tokens_balance, plan FROM users ORDER BY id')
for row in c.fetchall():
    print(f'  {row[1]:10} {row[0]:35} tokens={row[2]:5} plan={row[3]}')

conn.commit()
conn.close()
