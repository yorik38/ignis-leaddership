import os
import re
from bs4 import BeautifulSoup

def update_pages():
    base_dir = "/Users/yoriktisseau/Desktop/websites/ignis leadership/website_structure"
    index_path = os.path.join(base_dir, "index.html")

    with open(index_path, "r", encoding="utf-8") as f:
        index_html = f.read()

    soup = BeautifulSoup(index_html, "html.parser")
    
    # Extract components
    nav = soup.find("nav", id="nav")
    footer = soup.find("footer")
    
    # Extract assessment banner
    assessment_banner = soup.find("a", class_="assessment-banner")

    # Head elements to copy
    styles_links = soup.find_all(["link", "style", "script"])

    # Pages to update
    pages_to_update = [
        "about.html",
        "coaching/1-1-transformation.html",
        "courses/index.html",
        "outcomes/high-stakes-anxiety.html",
        "outcomes/executive-burnout.html",
        "outcomes/imposter-syndrome.html",
        "outcomes/decision-paralysis.html",
        "outcomes/perfectionism-procrastination.html",
        "outcomes/performance-blocks.html"
    ]

    for page in pages_to_update:
        page_path = os.path.join(base_dir, page)
        
        # Ensure dir exists
        os.makedirs(os.path.dirname(page_path), exist_ok=True)
        
        if os.path.exists(page_path):
            with open(page_path, "r", encoding="utf-8") as f:
                page_html = f.read()
            page_soup = BeautifulSoup(page_html, "html.parser")
        else:
            # Create a basic template from MASTER
            page_soup = BeautifulSoup(f"""<!DOCTYPE html>
<html lang="en">
<head>
    <title>{page.split('/')[-1].replace('-', ' ').replace('.html', '').title()} | Ignis Leadership</title>
</head>
<body>
    <div id="page-home">
        <div class="hero" style="min-height: 65vh;">
            <div class="hero-inner">
                <p class="eyebrow">CHALLENGES</p>
                <h1 class="hero-h1">{page.split('/')[-1].replace('-', ' ').replace('.html', '').title()}</h1>
                <p class="hero-sub">Overcome {page.split('/')[-1].replace('-', ' ').replace('.html', '')} and regain control.</p>
            </div>
        </div>
        <div class="wrap" style="padding-top: 80px; padding-bottom: 80px; min-height: 40vh;">
            <div style="max-width: 880px; margin: 0 auto;">
                <p class="body-p">Content goes here...</p>
            </div>
        </div>
    </div>
</body>
</html>""", "html.parser")

        # Replace Nav
        old_nav = page_soup.find("nav", id="nav")
        if old_nav:
            old_nav.replace_with(nav)
        else:
            body = page_soup.find("body")
            if body:
                body.insert(0, nav)
                
        # Replace Footer
        old_footer = page_soup.find("footer")
        if old_footer:
            old_footer.replace_with(footer)
        else:
            body = page_soup.find("body")
            if body:
                body.append(footer)
                
        # Replace Assessment Banner
        old_banner = page_soup.find("a", class_="assessment-banner")
        if old_banner:
            old_banner.replace_with(assessment_banner)
        else:
            # Insert before nav
            nav_in_page = page_soup.find("nav", id="nav")
            if nav_in_page:
                nav_in_page.insert_before(assessment_banner)
                
        # Copy essential scripts/styles from index to page head
        head = page_soup.find("head")
        if head:
            # Clear old styles and scripts that might conflict
            for tag in head.find_all(["link", "style"]):
                tag.decompose()
            for s in styles_links:
                head.append(s)
                
        # Check Alt attributes
        for img in page_soup.find_all("img"):
            if not img.get("alt"):
                img["alt"] = "Ignis Leadership Image"

        with open(page_path, "w", encoding="utf-8") as f:
            f.write(str(page_soup))
            
    print("Done")

if __name__ == "__main__":
    update_pages()
