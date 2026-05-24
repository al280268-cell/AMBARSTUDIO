import urllib.request, json

# Test register with a new user
body = json.dumps({
    'email': 'newtest_' + str(__import__('time').time_ns())[-6:] + '@test.com',
    'password': 'Test1234!',
    'name': 'Test Register',
    'role': 'user',
    'city': 'Aguascalientes'
}).encode()

req = urllib.request.Request(
    'http://127.0.0.1:8001/api/auth/register',
    data=body,
    headers={'Content-Type': 'application/json'}
)
try:
    resp = urllib.request.urlopen(req)
    data = json.loads(resp.read())
    user = data.get('user', {})
    print(f'OK -> name={user.get("name")}  tokens={user.get("tokens_balance")}  plan={user.get("plan")}')
except urllib.error.HTTPError as e:
    err = e.read()
    print(f'FAIL {e.code}: {err}')
