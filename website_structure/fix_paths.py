import os
import re
from bs4 import BeautifulSoup
import glob

base_dir = "/Users/yoriktisseau/Desktop/websites/ignis leadership/website_structure"

# Viewport meta tag
viewport_meta = '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
charset_meta = '<meta charset="UTF-8">'

for filepath in glob.glob(os.path.join(base_dir, "**/*.html"), recursive=True):
    rel_path = os.path.relpath(filepath, base_dir)
    depth = rel_path.count(os.sep)
    
    if depth > 0:
        prefix = "../" * depth
    else:
        prefix = ""
        
    with open(filepath, "r", encoding="utf-8") as f:
        html = f.read()
        
    soup = BeautifulSoup(html, "html.parser")
    
    head = soup.find("head")
    if head:
        # Check and add viewport
        if not head.find("meta", attrs={"name": "viewport"}):
            v_tag = soup.new_tag("meta", attrs={"name": "viewport", "content": "width=device-width, initial-scale=1.0"})
            head.insert(0, v_tag)
        # Check and add charset
        if not head.find("meta", attrs={"charset": "UTF-8"}):
            c_tag = soup.new_tag("meta", attrs={"charset": "UTF-8"})
            head.insert(0, c_tag)
            
    # Fix links and scripts and images
    for tag in soup.find_all(["link", "script", "img", "a"]):
        for attr in ["href", "src"]:
            if tag.has_attr(attr):
                val = tag[attr]
                # If it's a relative path that doesn't already have ../ and isn't absolute or #
                if val and not val.startswith("http") and not val.startswith("mailto") and not val.startswith("#") and not val.startswith("tel"):
                    # Check if it refers to assets or images
                    if val.startswith("assets/") or val.startswith("images/") or val.startswith("coaching/") or val.startswith("courses/") or val.startswith("outcomes/") or val == "about.html" or val == "index.html":
                        # Prevent double prefixing if we re-run
                        if not val.startswith(prefix) and depth > 0:
                            tag[attr] = prefix + val
                            
    # Fix inline styles url('...')
    for style in soup.find_all("style"):
        if style.string:
            # Only fix if we are in a subdirectory
            if depth > 0:
                # regex to find url('images/...') or url("images/...")
                def replace_url(match):
                    url_val = match.group(1)
                    if url_val.startswith("images/"):
                        return f"url('{prefix}{url_val}')"
                    return match.group(0)
                
                style.string = re.sub(r"url\(['\"]?(images/[^'\"]+)['\"]?\)", replace_url, style.string)
                
    # Also enforce hero min-height
    # The user asked: "make sure the hero header uses the same hv height.."
    # Actually the style block defines .hero { min-height: 100vh; ... } so if the CSS is fixed it will have 100vh.
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(str(soup))
        
print("Fixed paths and meta tags!")
