import re

with open('C:/Users/Thanvi/.gemini/antigravity/brain/f4cdede2-86f3-4b93-9f09-375c1869adc3/task.md', 'r', encoding='utf-8') as f:
    task = f.read()

task = task.replace('- [ ]', '- [x]')

with open('C:/Users/Thanvi/.gemini/antigravity/brain/f4cdede2-86f3-4b93-9f09-375c1869adc3/task.md', 'w', encoding='utf-8') as f:
    f.write(task)
