import urllib.request
import urllib.parse
import json

# 设置请求参数
url = "http://localhost:8001/api/optimize"
params = {
    "instance_id": "r1",
    "use_dqn": True,
    "max_iter": 5,
    "verbose": False
}

# 构建查询字符串
query_string = urllib.parse.urlencode(params)
full_url = f"{url}?{query_string}"

# 创建请求对象
req = urllib.request.Request(full_url, method='POST')
req.add_header('Content-Type', 'application/json')

# 发送请求
try:
    print("开始发送优化请求...")
    print(f"请求URL: {full_url}")
    with urllib.request.urlopen(req, timeout=300) as response:
        print(f"请求状态码: {response.status}")
        data = response.read().decode('utf-8')
        print(f"响应内容: {json.dumps(json.loads(data), indent=2, ensure_ascii=False)}")
except Exception as e:
    print(f"请求失败: {str(e)}")
    import traceback
    traceback.print_exc()