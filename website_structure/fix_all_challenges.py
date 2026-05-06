import os
import glob
from bs4 import BeautifulSoup

base_dir = "/Users/yoriktisseau/Desktop/websites/ignis leadership/website_structure/outcomes"
files = glob.glob(os.path.join(base_dir, "*.html"))

content_data = {
    "executive-burnout.html": {
        "problem": "The problem: Rest doesn't cure burnout when your internal engine is still redlining. Boundaries and time management fail because your self-worth is unconsciously tied to relentless output.",
        "method": "Your burnout isn't a scheduling problem. It's an identity problem. The Clear Identity Method targets the subconscious drivers forcing you to overwork, rewiring the need to constantly prove yourself so you can perform without the crushing cost.",
        "testimonials": [
            {
                "quote": "Yorik supported me as I set up and led a new international team across three countries... I learned to lead with confidence, build stronger stakeholder relationships, and grow into a far more influential leader during a period where clarity and presence were non-negotiable.",
                "name": "Michaela Valovicova",
                "role": "Head of Marketing & Communications Equans Data Centre at Equans (UK)",
                "img": "michaela.jpg"
            },
            {
                "quote": "Yorik helped me shift my mindset and lead with clarity during a pivotal moment in my career. I gained the confidence to take ownership of my next step and built a clear, values-led strategy to engage my employer with purpose and conviction.",
                "name": "Chloe MacLennan",
                "role": "Reservoir Engineer at bp (UK)",
                "img": "chloe.jpg"
            }
        ]
    },
    "imposter-syndrome.html": {
        "problem": "The problem: Logic can't fix an emotional gap. No amount of external validation or success will silence the internal voice of doubt as long as your subconscious identity still feels like an outsider.",
        "method": "Imposter syndrome isn't cured by 'faking it till you make it.' It's cured by aligning your internal self-image with your external reality. The Clear Identity Method updates your subconscious programming so you can finally own the authority you've earned.",
        "testimonials": [
            {
                "quote": "When I stepped into a bigger team, I was battling imposter syndrome, feeling overwhelmed... The work we did with Yorik helped me shift my limiting beliefs and regain control, allowing me to lead with unshakeable confidence.",
                "name": "Barnabas Stolpe",
                "role": "Recruiting Manager Europe at bp (Hungary)",
                "img": "Barnabas.jpeg"
            },
            {
                "quote": "I met Yorik during a significant transition in my career... Through our work, I was able to challenge limiting beliefs, make braver decisions, and step forward with a clearer sense of who I needed to be in the next phase of my leadership.",
                "name": "Shovana Talukdar",
                "role": "Senior Consultant Renewables at BVG Associates (UK)",
                "img": "Shovana.jpeg"
            }
        ]
    },
    "decision-paralysis.html": {
        "problem": "The problem: Overthinking isn't a lack of information; it's a fear of making a mistake. You can't spreadsheet your way out of paralysis when the root cause is a subconscious fear of judgment or failure.",
        "method": "We don't focus on decision-making frameworks. We focus on the nervous system's response to risk. The Clear Identity Method neutralizes the fear of failure at the deepest level, allowing your natural strategic instinct to take over.",
        "testimonials": [
            {
                "quote": "During a period marked by setbacks and uncertainty, the work I did with Yorik helped me regain clarity and strategic control. I stopped operating reactively and started making decisions with greater conviction.",
                "name": "Raj Srivastava",
                "role": "Senior Economist O&G at Spirit Energy (UK)",
                "img": "raj.jpg"
            },
            {
                "quote": "Yorik has had a real impact on how I tackle complex challenges and how I show up under pressure... I communicate with more confidence and perform far better in high-stakes conversations, with greater clarity and calm.",
                "name": "James Heath",
                "role": "Deal Development, Commercial Structuring at bp (UK)",
                "img": "james.jpg"
            }
        ]
    },
    "perfectionism-procrastination.html": {
        "problem": "The problem: Perfectionism is a protective shield against criticism, and procrastination is the avoidance of that immense pressure. Productivity hacks won't work when your mind sees 'getting started' as a threat.",
        "method": "We bypass surface-level time management. The Clear Identity Method removes the subconscious fear of 'not being good enough,' replacing the heavy friction of perfectionism with the effortless momentum of flow.",
        "testimonials": [
            {
                "quote": "Working with Yorik helped me become more intentional in how I communicate and influence. I gained greater awareness of the patterns that were limiting my impact and replaced them with clearer, more deliberate ways of leading.",
                "name": "Nadia Aljibouri",
                "role": "Senior Project Manager Transformation at bp (UK)",
                "img": "nadia.jpg"
            },
            {
                "quote": "By becoming aware of limiting patterns and deliberately shifting my attitude, I was able to grow as a leader. Over nine months, your guidance challenged me to embrace change, let go of unhelpful habits, and step up with clarity.",
                "name": "Filipe Gongalves",
                "role": "Sourcing Lead at bp (Hungary)",
                "img": "Filipe.jpeg"
            }
        ]
    },
    "performance-blocks.html": {
        "problem": "The problem: You can't outwork an invisible ceiling. When your conscious ambition clashes with a subconscious fear of what success might cost, your mind pulls the emergency brake to keep you 'safe'.",
        "method": "Pushing harder only creates more resistance. The Clear Identity Method identifies and rewires the hidden limiting beliefs that are holding you back, completely aligning your deep internal drives with your conscious goals.",
        "testimonials": [
            {
                "quote": "I met Yorik during a significant transition in my career... Through our work, I was able to challenge limiting beliefs, make braver decisions, and step forward with a clearer sense of who I needed to be in the next phase of my leadership.",
                "name": "Shovana Talukdar",
                "role": "Senior Consultant Renewables at BVG Associates (UK)",
                "img": "Shovana.jpeg"
            },
            {
                "quote": "During a period marked by setbacks and uncertainty, the work I did with Yorik helped me regain clarity and strategic control. I stopped operating reactively and started making decisions with greater conviction.",
                "name": "Raj Srivastava",
                "role": "Senior Economist O&G at Spirit Energy (UK)",
                "img": "raj.jpg"
            }
        ]
    },
    "high-stakes-anxiety.html": {
        # Already has the problem block and method block
    }
}

for filepath in files:
    filename = os.path.basename(filepath)
    with open(filepath, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
        
    # 1. Update hero min-height to 100vh
    hero = soup.find("div", class_="hero")
    if hero and "min-height: 55vh;" in hero.get("style", ""):
        hero["style"] = hero["style"].replace("min-height: 55vh;", "min-height: 100vh;")
        
    # 2. Update CTA heading to have text-wrap: balance
    for h3 in soup.find_all("h3"):
        if "Ready to Step Into Your Full Potential" in h3.text:
            style = h3.get("style", "")
            if "text-wrap: balance" not in style:
                h3["style"] = style.rstrip(";") + "; text-wrap: balance;"
                
    # 3. Update Method CTA to be left-aligned (Anxiety page might have it as center)
    for div in soup.find_all("div"):
        if "text-align: center" in div.get("style", "") and div.find("a", string="Explore The Clear Identity Method"):
            div["style"] = div["style"].replace("text-align: center", "text-align: left")

    # 4. Inject problem block, method block, and testimonials if in content_data
    if filename in content_data and "problem" in content_data[filename]:
        data = content_data[filename]
        
        # Inject Problem Block after the reality paragraph
        reality_h3 = None
        for h3 in soup.find_all("h3"):
            if "Reality" in h3.text:
                reality_h3 = h3
                break
                
        if reality_h3:
            para = reality_h3.find_next_sibling("p")
            if para and "The problem:" not in str(para.find_next_sibling()):
                prob_div = soup.new_tag("div", style="background: rgba(196,71,108,0.08); border-left: 4px solid var(--accent); padding: 16px 24px; margin: 24px 0 40px;")
                strong = soup.new_tag("strong")
                strong.string = "The problem: "
                prob_div.append(strong)
                prob_div.append(data["problem"].replace("The problem: ", ""))
                para.insert_after(prob_div)
                
        # Inject Method Block into the left column of the split
        split_grid = soup.find("div", class_="challenge-split")
        if split_grid:
            left_col = split_grid.find("div") # first child is left col
            if left_col and "The Clear Identity Method" not in str(left_col):
                methods_h3 = soup.new_tag("h3", style="font-size: 2rem; margin: 40px 0 20px;", **{"class": "section-title"})
                methods_h3.string = "How This Works: The Clear Identity Method"
                
                methods_p = soup.new_tag("p", **{"class": "body-p"})
                methods_p.string = data["method"]
                
                methods_link_div = soup.new_tag("div", style="text-align: left; margin: 24px 0 40px;")
                methods_a = soup.new_tag("a", href="../index.html#method", style="text-decoration: none;", **{"class": "btn secondary"})
                methods_a.string = "Explore The Clear Identity Method"
                methods_link_div.append(methods_a)
                
                left_col.append(methods_h3)
                left_col.append(methods_p)
                left_col.append(methods_link_div)
                
        # Inject Testimonials
        if not soup.find("div", class_="testimonials-block"):
            t_html = f"""
            <div class="testimonials-block" style="margin-top: 64px; margin-bottom: 64px;">
                <h3 class="section-title" style="font-size: 2.2rem; margin-bottom: 32px; text-align: center;">What Others Say</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 480px), 1fr)); gap: 32px;">
                    <div style="background: var(--plum); padding: 40px; border-radius: 16px; color: #fff; border: 1px solid rgba(255,255,255,0.05);">
                        <p style="font-family: var(--fb); font-weight: 300; font-style: italic; font-size: 1.1rem; line-height: 1.7; margin-bottom: 32px; color: rgba(255,255,255,0.9);">"{data['testimonials'][0]['quote']}"</p>
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <div style="width: 56px; height: 56px; border-radius: 50%; overflow: hidden; border: 2px solid var(--accent-light); flex-shrink: 0;">
                                <img src="../images/testimonials/{data['testimonials'][0]['img']}" alt="{data['testimonials'][0]['name']}" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <div>
                                <div style="font-family: var(--fd); font-size: 1.4rem; letter-spacing: 0.05em; margin-bottom: 4px;">{data['testimonials'][0]['name']}</div>
                                <div style="font-size: 0.8rem; color: var(--accent-light); text-transform: uppercase; letter-spacing: 0.1em; line-height: 1.4;">{data['testimonials'][0]['role']}</div>
                            </div>
                        </div>
                    </div>
                    <div style="background: var(--plum); padding: 40px; border-radius: 16px; color: #fff; border: 1px solid rgba(255,255,255,0.05);">
                        <p style="font-family: var(--fb); font-weight: 300; font-style: italic; font-size: 1.1rem; line-height: 1.7; margin-bottom: 32px; color: rgba(255,255,255,0.9);">"{data['testimonials'][1]['quote']}"</p>
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <div style="width: 56px; height: 56px; border-radius: 50%; overflow: hidden; border: 2px solid var(--accent-light); flex-shrink: 0;">
                                <img src="../images/testimonials/{data['testimonials'][1]['img']}" alt="{data['testimonials'][1]['name']}" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <div>
                                <div style="font-family: var(--fd); font-size: 1.4rem; letter-spacing: 0.05em; margin-bottom: 4px;">{data['testimonials'][1]['name']}</div>
                                <div style="font-size: 0.8rem; color: var(--accent-light); text-transform: uppercase; letter-spacing: 0.1em; line-height: 1.4;">{data['testimonials'][1]['role']}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            """
            if split_grid:
                split_grid.insert_after(BeautifulSoup(t_html, "html.parser"))

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(str(soup))
        
print("Challenges updated successfully.")
