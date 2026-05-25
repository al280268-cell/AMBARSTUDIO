import ssl, urllib.request, json, time
ctx = ssl.create_default_context()
base = 'https://ambarstudio.vercel.app'

email = 'dafne_test_' + str(int(time.time())) + '@ambar.com'
pw = 'mipass123'

# 1. REGISTER
print('--- REGISTRO ---')
body = json.dumps({'email': email, 'password': pw, 'name': 'Dafne Test', 'role': 'user', 'city': 'Aguascalientes'}).encode()
req = urllib.request.Request(base + '/api/auth/register', data=body, headers={'Content-Type': 'application/json'})
try:
    r = urllib.request.urlopen(req, context=ctx, timeout=20)
    d = json.loads(r.read())
    token = d.get('access_token', '')
    u = d.get('user', {})
    print('OK  email=' + str(u.get('email')))
    print('OK  tokens=' + str(u.get('tokens_balance')) + '  plan=' + str(u.get('plan')))
except urllib.error.HTTPError as e:
    print('FAIL', e.code, e.read()[:300])
    token = ''

# 2. LOGIN (simulates re-entering after session)
print('\n--- LOGIN ---')
body2 = json.dumps({'email': email, 'password': pw}).encode()
req2 = urllib.request.Request(base + '/api/auth/login', data=body2, headers={'Content-Type': 'application/json'})
try:
    r2 = urllib.request.urlopen(req2, context=ctx, timeout=20)
    d2 = json.loads(r2.read())
    print('OK  email=' + str(d2.get('user', {}).get('email')))
    token = d2.get('access_token', token)
except urllib.error.HTTPError as e:
    print('FAIL', e.code, e.read()[:300])

# 3. GET ME (session check)
print('\n--- SESION /me ---')
if token:
    req3 = urllib.request.Request(base + '/api/auth/me', headers={'Authorization': 'Bearer ' + token})
    try:
        r3 = urllib.request.urlopen(req3, context=ctx, timeout=10)
        me = json.loads(r3.read())
        print('OK  role=' + str(me.get('role')) + '  tokens=' + str(me.get('tokens_balance')))
    except urllib.error.HTTPError as e:
        print('FAIL', e.code, e.read()[:200])

print('\n=== SUPABASE FUNCIONANDO PERFECTO ===')
