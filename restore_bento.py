import re

with open('temp_old_page.jsx', 'r', encoding='utf-8') as f:
    old_text = f.read()

# Extract from InteractivePipelineCard to PipelineSection
match = re.search(r'(function InteractivePipelineCard\(\{.*?\n\})(\s*function TheCaseFile\(\))', old_text, re.DOTALL)

# Let's find exactly where PipelineSection ends
bento_match = re.search(r'(function InteractivePipelineCard\(\{.*?)(?=function TheCaseFile\(\))', old_text, re.DOTALL)
if bento_match:
    bento_code = bento_match.group(1)
    
    with open('frontend/app/page.jsx', 'r', encoding='utf-8') as f:
        current = f.read()
    
    # Inject it right after PixelsToPenalty
    # Since PixelsToPenalty ends right before TheCaseFile, we can just replace function TheCaseFile() with bento_code + function TheCaseFile()
    current = current.replace('function TheCaseFile()', bento_code + '\nfunction TheCaseFile()')
    
    with open('frontend/app/page.jsx', 'w', encoding='utf-8') as f:
        f.write(current)
    print("Successfully restored Bento Grid components!")
else:
    print("Could not find the Bento Grid components in old file.")
