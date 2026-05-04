def check_triple_quotes(file_path):
    """检查文件中的三引号字符串是否都正确闭合"""
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    double_quotes = []  # 存储 """ 的位置
    single_quotes = []  # 存储 ''' 的位置
    
    i = 0
    while i < len(content):
        # 检查 """
        if content[i:i+3] == '"""':
            double_quotes.append(i)
            i += 3
        # 检查 '''
        elif content[i:i+3] == "'''":
            single_quotes.append(i)
            i += 3
        else:
            i += 1
    
    print(f"文件: {file_path}")
    print(f"总长度: {len(content)} 字符")
    print(f"\"\"\" 出现次数: {len(double_quotes)}")
    print(f"''' 出现次数: {len(single_quotes)}")
    
    # 检查是否成对
    if len(double_quotes) % 2 != 0:
        print("错误: \"\"\" 数量不是偶数，存在未闭合的三引号字符串")
        print(f"位置: {double_quotes}")
    else:
        print("\"\"\" 数量正常，都是成对出现的")
    
    if len(single_quotes) % 2 != 0:
        print("错误: ''' 数量不是偶数，存在未闭合的三引号字符串")
        print(f"位置: {single_quotes}")
    else:
        print("''' 数量正常，都是成对出现的")

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("用法: python check_quotes.py <file_path>")
    else:
        check_triple_quotes(sys.argv[1])