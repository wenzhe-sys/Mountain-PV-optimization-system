import re
import os

base_path = r'c:\Users\er\OneDrive\桌面\人工智能实践赛道\app\src'

files_to_fix = [
    r'sections\OptimizationDemo(2).tsx',
    r'sections\InstanceManager.tsx',
    r'sections\OptimizationDemo.tsx',
]

replacements = [
    (r'http://localhost:8003/', '/algorithm/'),
    (r'http://localhost:8002/', '/algorithm/'),
    (r'ws://localhost:8003/ws/', 'ws://' + os.environ.get('HOST', 'localhost') + ':' + os.environ.get('PORT', '80') + '/algorithm/ws/'),
]

for file_rel in files_to_fix:
    file_path = os.path.join(base_path, file_rel)
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    content = re.sub(r'http://localhost:8003/', '/algorithm/', content)
    content = re.sub(r'http://localhost:8002/', '/algorithm/', content)
    content = re.sub(r'ws://localhost:8003/ws/', 'ws://window.location.host/ws/', content)

    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {file_rel}")

print("Done!")