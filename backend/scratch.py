import requests

def test_lc(username):
    url = f"https://alfa-leetcode-api.onrender.com/{username}"
    try:
        r = requests.get(url, timeout=10)
        print("LC alfa:", r.status_code, r.text[:100])
    except Exception as e:
        print("LC alfa error:", e)

    url2 = f"https://leetcode-stats-api.herokuapp.com/{username}"
    try:
        r = requests.get(url2, timeout=10)
        print("LC stats:", r.status_code, r.text[:100])
    except Exception as e:
        print("LC stats error:", e)

def test_gh(username):
    url = f"https://api.github.com/users/{username}"
    try:
        r = requests.get(url, timeout=10)
        print("GH:", r.status_code, r.text[:100])
    except Exception as e:
        print("GH error:", e)

test_lc("pranjul2121")
test_gh("pranjul2121")
