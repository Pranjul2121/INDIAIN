def extract_lc(url):
    username = url.strip()
    if "leetcode.com/" in username:
        parts = username.split("leetcode.com/")[-1].strip("/").split("/")
        username = parts[1] if parts[0] == "u" and len(parts) > 1 else parts[0]
    return username

def extract_gh(url):
    username = url.strip()
    if "github.com/" in username:
        parts = username.split("github.com/")[-1].strip("/").split("/")
        username = parts[0]
    return username

print(extract_lc("https://leetcode.com/u/pranjul2121/"))
print(extract_lc("https://leetcode.com/pranjul2121"))
print(extract_lc("pranjul2121"))

print(extract_gh("https://github.com/pranjul2121/"))
print(extract_gh("pranjul2121"))
print(extract_gh("https://github.com/pranjul2121/INDIAIN"))
