import re

html_file = "k:/DEVPF-Simple/index.html"
with open(html_file, "r", encoding="utf-8") as f:
    html = f.read()

def art_to_svg(art, name):
    lines = [l for l in art.strip("\n").split("\n")]
    width = max(len(l) for l in lines)
    height = len(lines)
    
    path_d = []
    for y, line in enumerate(lines):
        for x, char in enumerate(line):
            if char != " ":
                path_d.append(f"M{x} {y}h1v1h-1z")
                
    d_str = " ".join(path_d)
    return f'<svg viewBox="0 0 {width} {height}" width="28" height="28" fill="#1C1C1C" class="pixel-icon {name}"><path d="{d_str}"/></svg>'

icons = {
    "react": """
   xx  xx   
  xxxxxxxxx 
 xxxx  xxxx 
 xxxx  xxxx 
 xxxx  xxxx 
  xxxxxxxxx 
   xx  xx   
""",
    "js": """
xxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxx
xxxxxxx  x
xxxxx    x
xxx x x  x
xx  x    x
xx xxx xxx
xxx  x xxx
xxxxxxxxxx
xxxxxxxxxx
""",
    "python": """
  xxxxxx    
 xxxxxxxx   
 xx xx xx   
 xxxxxxxx   
 xxxxxxx    
    xxxx    
 xxxxxxxxxx 
 xxxxxxxxxx 
 xxxxxxxxxx 
 xxxx  xxxx 
""",
    "django": """
          x      
          x      
   xxxx   x      
  xx  xx  x xxxx 
  xx  xx  x x  x 
  xx  xx  x x  x 
  xx  xx  x xx x 
            x    
""",
    "figma": """
  xxxx xxxx 
 xxxxxxxxxx 
 xxxxxxxxxx 
  xxxx xxxx 
  xxxx xxxx 
 xxxxxxxxxx 
 xxxxxxxxxx 
  xxxx xxxx 
  xxxx      
 xxxxx      
 xxxxx      
  xxxx      
""",
    "github": """
   xx    xx   
  xxxx  xxxx  
 xxxxxxxxxxxx 
 xxxxxxxxxxxx 
 x xx xx xx x 
 x x  x  x  x 
  xxxxxxxxxx  
   xxxxxxxx   
"""
}

# The user wants dark icons on bright green backgrounds.
# We will just write the black pixel paths inside the HTML.
replacements = {
    'title="React.js"><i class="devicon-react-original"></i>': f'title="React.js">{art_to_svg(icons["react"], "react")} ',
    'title="JavaScript"><i class="devicon-javascript-plain"></i>': f'title="JavaScript">{art_to_svg(icons["js"], "js")} ',
    'title="Python"><i class="devicon-python-plain"></i>': f'title="Python">{art_to_svg(icons["python"], "python")} ',
    'title="Django"><i class="devicon-django-plain"></i>': f'title="Django">{art_to_svg(icons["django"], "django")} ',
    'title="Figma"><i class="devicon-figma-plain"></i>': f'title="Figma">{art_to_svg(icons["figma"], "figma")} ',
    'title="Git / GitHub"><i class="devicon-github-original"></i>': f'title="Git / GitHub">{art_to_svg(icons["github"], "github")} '
}

for old, new in replacements.items():
    html = html.replace(old, new)

with open(html_file, "w", encoding="utf-8") as f:
    f.write(html)
print("Updated HTML with SVG grids")
