import re

file_path = r'c:\Users\er\OneDrive\桌面\人工智能实践赛道\mountain_pv_optimization\api\server.py'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

original_content = content

content = re.sub(r'@app\.(get|post|put|delete|websocket)\("/api/', r'@app.\1("/algorithm/', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

matches = re.findall(r'@app\.(get|post|put|delete|websocket)\("/api/', original_content)
print(f"Replaced {len(matches)} route definitions")
print("\nSample changes:")
for match in re.finditer(r'@app\.(get|post)\("/api/[^"]+")', original_content):
    print(f"  {match.group(0)}")