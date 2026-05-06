import os
from bs4 import BeautifulSoup
import glob

base_dir = "/Users/yoriktisseau/Desktop/websites/ignis leadership/website_structure/outcomes"
challenge_pages = glob.glob(os.path.join(base_dir, "*.html"))

testimonials_html = """
<div class="testimonials-block" style="margin-top: 64px; margin-bottom: 64px;">
    <h3 class="section-title" style="font-size: 2.2rem; margin-bottom: 32px; text-align: center;">What Others Say</h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 480px), 1fr)); gap: 32px;">
        <div style="background: var(--plum); padding: 40px; border-radius: 16px; color: #fff; border: 1px solid rgba(255,255,255,0.05);">
            <p style="font-family: var(--fb); font-weight: 300; font-style: italic; font-size: 1.1rem; line-height: 1.7; margin-bottom: 32px; color: rgba(255,255,255,0.9);">"Yorik has had a real impact on how I tackle complex challenges and how I show up under pressure. He helped me identify unhelpful patterns and replace them with clearer, more intentional behaviours. I communicate with more confidence and perform far better in high-stakes conversations, with greater clarity and calm."</p>
            <div style="display: flex; align-items: center; gap: 16px;">
                <div style="width: 56px; height: 56px; border-radius: 50%; overflow: hidden; border: 2px solid var(--accent-light); flex-shrink: 0;">
                    <img src="../images/testimonials/james.jpg" alt="James Heath" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div>
                    <div style="font-family: var(--fd); font-size: 1.4rem; letter-spacing: 0.05em; margin-bottom: 4px;">James Heath</div>
                    <div style="font-size: 0.8rem; color: var(--accent-light); text-transform: uppercase; letter-spacing: 0.1em; line-height: 1.4;">Deal Development, Commercial Structuring<br>Low Carbon Energy at bp (UK)</div>
                </div>
            </div>
        </div>
        
        <div style="background: var(--plum); padding: 40px; border-radius: 16px; color: #fff; border: 1px solid rgba(255,255,255,0.05);">
            <p style="font-family: var(--fb); font-weight: 300; font-style: italic; font-size: 1.1rem; line-height: 1.7; margin-bottom: 32px; color: rgba(255,255,255,0.9);">"Working with Yorik helped me become more intentional in how I communicate and influence. I gained greater awareness of the patterns that were limiting my impact and replaced them with clearer, more deliberate ways of leading. As a result, I am more effective in building trust, alignment, and influence in complex stakeholder environments."</p>
            <div style="display: flex; align-items: center; gap: 16px;">
                <div style="width: 56px; height: 56px; border-radius: 50%; overflow: hidden; border: 2px solid var(--accent-light); flex-shrink: 0;">
                    <img src="../images/testimonials/nadia.jpg" alt="Nadia Aljibouri" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div>
                    <div style="font-family: var(--fd); font-size: 1.4rem; letter-spacing: 0.05em; margin-bottom: 4px;">Nadia Aljibouri</div>
                    <div style="font-size: 0.8rem; color: var(--accent-light); text-transform: uppercase; letter-spacing: 0.1em; line-height: 1.4;">Senior Project Manager Transformation<br>at bp (UK)</div>
                </div>
            </div>
        </div>
    </div>
</div>
"""

# Include css media query for mobile grid responsiveness
style_block = """
<style>
@media (max-width: 960px) {
    .challenge-split { grid-template-columns: 1fr !important; gap: 32px !important; }
}
</style>
"""

for filepath in challenge_pages:
    with open(filepath, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
        
    # Inject style if not present
    if "challenge-split" not in str(soup):
        head = soup.find("head")
        if head:
            head.append(BeautifulSoup(style_block, "html.parser"))
            
    # Find the main container
    container = None
    for div in soup.find_all("div"):
        style = div.get("style", "")
        if "max-width: 880px;" in style and "margin: 0 auto" in style:
            container = div
            break
            
    if container:
        # 1. Update width to var(--mw) (1160px)
        container["style"] = container["style"].replace("max-width: 880px;", "max-width: var(--mw);")
        
        # 2. Check if already split
        if not container.find("div", class_="challenge-split"):
            # We want to find: the image, the imagine_h3, the ul, the p
            img = container.find("img")
            
            imagine_h3 = None
            for h3 in container.find_all("h3"):
                if "Imagine a life where" in h3.text:
                    imagine_h3 = h3
                    break
                    
            if imagine_h3 and img:
                # Get the ul and p
                ul = imagine_h3.find_next_sibling("ul")
                p = ul.find_next_sibling("p")
                
                # Check for Methods block (Anxiety page)
                methods_h3 = None
                methods_p = None
                methods_btn_div = None
                
                for h3 in container.find_all("h3"):
                    if "The Clear Identity Method" in h3.text:
                        methods_h3 = h3
                        methods_p = methods_h3.find_next_sibling("p")
                        methods_btn_div = methods_p.find_next_sibling("div") if methods_p else None
                        break
                
                # Create grid wrapper
                grid = soup.new_tag("div", **{"class": "challenge-split"}, style="display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; margin-bottom: 64px;")
                left_col = soup.new_tag("div")
                right_col = soup.new_tag("div")
                
                img.extract()
                # Remove margin from img since it's in a grid
                if "margin" in img.get("style", ""):
                    img["style"] = img["style"].replace("margin: 40px 0;", "margin: 0;")
                img["style"] += " object-fit: cover; aspect-ratio: 4/3; border-radius: 16px;"
                right_col.append(img)
                
                imagine_h3.extract()
                ul.extract()
                p.extract()
                
                # Remove top margin from imagine_h3 since it's top of column
                if "margin: 40px" in imagine_h3.get("style", ""):
                    imagine_h3["style"] = imagine_h3["style"].replace("margin: 40px 0 20px;", "margin-bottom: 24px;")
                
                left_col.append(imagine_h3)
                left_col.append(ul)
                left_col.append(p)
                
                grid.append(left_col)
                grid.append(right_col)
                
                # Insert grid before the CTA block or methods block
                if methods_h3:
                    methods_h3.insert_before(grid)
                else:
                    cta_div = container.find("div", style=lambda s: s and "margin-top: 56px; text-align: center" in s)
                    if cta_div:
                        cta_div.insert_before(grid)
                        
        # 3. If this is the anxiety page, add testimonials after methods block
        if "high-stakes-anxiety.html" in filepath:
            # Check if testimonials already exist
            if not container.find("div", class_="testimonials-block"):
                # Find methods_btn_div
                for a in container.find_all("a"):
                    if "Explore The Clear Identity Method" in a.text:
                        btn_div = a.parent
                        btn_div.insert_after(BeautifulSoup(testimonials_html, "html.parser"))
                        break

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(str(soup))
        
print("Layouts updated.")
