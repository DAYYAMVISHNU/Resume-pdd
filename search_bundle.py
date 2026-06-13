with open('frontend/dist/assets/index-HRpbdG1O.js', 'r', encoding='utf-8') as f:
    content = f.read()

print('File length:', len(content))
for term in ['onrender', 'resume-analyzer-backend', 'API_BASE_URL', 'localhost']:
    count = content.count(term)
    print(f"Occurrences of '{term}': {count}")
    if count > 0:
        # Find one position and print surrounding text
        pos = content.find(term)
        start = max(0, pos - 100)
        end = min(len(content), pos + 100)
        print(f"  Surrounding context: ... {content[start:end]} ...\n")
