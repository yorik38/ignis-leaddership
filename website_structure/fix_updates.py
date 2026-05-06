import os
import glob
from bs4 import BeautifulSoup

base_dir = "/Users/yoriktisseau/Desktop/websites/ignis leadership/website_structure"

# 1. Update Navigation Methods link in ALL files
for filepath in glob.glob(os.path.join(base_dir, "**/*.html"), recursive=True):
    with open(filepath, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
        
    rel_path = os.path.relpath(filepath, base_dir)
    depth = rel_path.count(os.sep)
    prefix = "../" * depth
    
    # Fix Methods link
    for a in soup.find_all("a"):
        if a.string and a.string.strip() == "Methods":
            a["href"] = f"{prefix}index.html#method"
            
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(str(soup))


# 2. Update the 6 Challenge Pages: Remove eyebrow, set hero height
challenge_pages = [
    "outcomes/high-stakes-anxiety.html",
    "outcomes/executive-burnout.html",
    "outcomes/imposter-syndrome.html",
    "outcomes/decision-paralysis.html",
    "outcomes/perfectionism-procrastination.html",
    "outcomes/performance-blocks.html"
]

for page in challenge_pages:
    filepath = os.path.join(base_dir, page)
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            soup = BeautifulSoup(f.read(), "html.parser")
            
        hero = soup.find("div", class_="hero")
        if hero:
            hero["style"] = "min-height: 55vh;" # Uniform height
            
            eyebrow = hero.find("p", class_="eyebrow")
            if eyebrow:
                eyebrow.decompose()
                
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(str(soup))


# 3. Add specific sections to High-Stakes Anxiety page
anxiety_path = os.path.join(base_dir, "outcomes/high-stakes-anxiety.html")
if os.path.exists(anxiety_path):
    with open(anxiety_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
        
    # Find "The Reality of High-Stakes Anxiety" and insert after the paragraph following it
    reality_header = None
    for h3 in soup.find_all("h3"):
        if "Reality of High-Stakes Anxiety" in h3.text:
            reality_header = h3
            break
            
    if reality_header:
        # Get the next paragraph
        para = reality_header.find_next_sibling("p")
        if para:
            # Create the problem div
            problem_div = soup.new_tag("div", style="background: rgba(196,71,108,0.08); border-left: 4px solid var(--accent); padding: 16px 24px; margin: 24px 0 40px;")
            strong = soup.new_tag("strong")
            strong.string = "The problem: "
            problem_div.append(strong)
            problem_div.append("Willpower can't rewire your nervous system. Confidence techniques don't touch the automatic patterns running underneath. You're fighting biology with behaviour.")
            
            # Check if it's already there
            if "The problem:" not in str(para.parent):
                para.insert_after(problem_div)
                
    # Find "Imagine a life where..." section and add the Methods section after the unordered list / paragraph
    imagine_header = None
    for h3 in soup.find_all("h3"):
        if "Imagine a life where..." in h3.text:
            imagine_header = h3
            break
            
    if imagine_header:
        # Find the <p> that follows the <ul> after imagine_header
        next_para = imagine_header.find_next_sibling("p")
        if next_para:
            methods_h3 = soup.new_tag("h3", style="font-size: 2rem; margin: 40px 0 20px;", **{"class": "section-title"})
            methods_h3.string = "How This Works: The Clear Identity Method"
            
            methods_p = soup.new_tag("p", **{"class": "body-p"})
            methods_p.string = "Your anxiety isn't a thinking problem. It's a nervous system problem. The Clear Identity Method combines neuroscience with executive coaching to shift how your unconscious mind responds to pressure. This isn't about breathing techniques or positive thinking. It's about rewiring the automatic patterns beneath awareness."
            
            methods_link_div = soup.new_tag("div", style="text-align: center; margin: 24px 0 40px;")
            methods_a = soup.new_tag("a", href="../index.html#method", style="text-decoration: none;", **{"class": "btn secondary"})
            methods_a.string = "Explore The Clear Identity Method"
            methods_link_div.append(methods_a)
            
            # Check if already added
            if "How This Works: The Clear Identity Method" not in str(soup):
                next_para.insert_after(methods_link_div)
                next_para.insert_after(methods_p)
                next_para.insert_after(methods_h3)

    with open(anxiety_path, "w", encoding="utf-8") as f:
        f.write(str(soup))

print("Updates applied successfully.")
