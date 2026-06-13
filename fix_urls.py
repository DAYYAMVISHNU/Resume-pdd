import os
import glob

files = glob.glob('frontend/src/**/*.tsx', recursive=True) + glob.glob('frontend/src/**/*.ts', recursive=True)

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    new_content = content.replace("http://${window.location.hostname}:5000", "")
    new_content = new_content.replace("`http://localhost:5000", "`")
    new_content = new_content.replace("http://localhost:5000", "")
    new_content = new_content.replace("`http://127.0.0.1:5000", "`")
    
    if content != new_content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
