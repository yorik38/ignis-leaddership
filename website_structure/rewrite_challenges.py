import os
from bs4 import BeautifulSoup

def update_challenge_page(filepath, eyebrow, title, sub, html_content):
    if not os.path.exists(filepath): return
    with open(filepath, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")
    
    # Update Hero
    hero_inner = soup.find("div", class_="hero-inner")
    if hero_inner:
        eb = hero_inner.find(class_="eyebrow")
        h1 = hero_inner.find(class_="hero-h1")
        sub_p = hero_inner.find(class_="hero-sub")
        if eb: eb.string = eyebrow
        if h1: h1.string = title
        if sub_p: sub_p.string = sub
        
    # Update Content Wrap
    wraps = soup.find_all("div", class_="wrap")
    content_wrap = None
    for w in wraps:
        if "padding-top: 80px" in w.get("style", ""):
            content_wrap = w
            break
            
    if content_wrap:
        content_wrap.clear()
        content_wrap.append(BeautifulSoup(html_content, "html.parser"))
        
    # Update Title Tag
    title_tag = soup.find("title")
    if title_tag:
        title_tag.string = f"{title} | Ignis Leadership"
        
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(str(soup))


pages = {
    "outcomes/high-stakes-anxiety.html": {
        "eyebrow": "CHALLENGES",
        "title": "High-Stakes Anxiety",
        "sub": "Stop relying on adrenaline. Calm your nervous system and lead with unshakeable confidence.",
        "content": """
            <div style="max-width: 880px; margin: 0 auto;">
                <h2 class="section-title" style="margin-bottom: 24px; color: var(--dark);">Is this you?</h2>
                <ul class="for-list" style="margin-bottom: 40px; font-size: 1.1rem;">
                    <li>Do you experience a constant, low-level hum of dread before important conversations or presentations?</li>
                    <li>Do you find yourself over-preparing to the point of exhaustion just to feel "safe"?</li>
                    <li>Does your mind race at night, playing out worst-case scenarios about the future?</li>
                    <li>Are you relying on adrenaline and sheer willpower to get through the week?</li>
                    <li>Do you fear that your anxiety is draining the energy you need to actually enjoy your success?</li>
                </ul>

                <h3 class="section-title" style="font-size: 2rem; margin: 40px 0 20px;">The Reality of High-Stakes Anxiety</h3>
                <p class="body-p">Anxiety at a high level isn't a weakness; it's a deeply wired survival mechanism stuck in overdrive. When the stakes feel massive, your nervous system responds as if you are in physical danger. You can't out-think or rationalize this feeling away, because it lives deeper than logic. Pushing through it only leads to exhaustion.</p>
                
                <img src="../images/hero%20header.jpg" alt="Executive looking out window" style="width:100%; border-radius:12px; margin: 40px 0; box-shadow: var(--shadow-md); max-height: 450px; object-fit: cover; object-position: center;">
                
                <h3 class="section-title" style="font-size: 2rem; margin: 40px 0 20px;">Imagine a life where...</h3>
                <ul class="for-list" style="margin-bottom: 32px; font-size: 1.1rem; color: var(--dark);">
                    <li>You step into high-pressure situations with a profound, unshakable sense of calm.</li>
                    <li>You trust your expertise without needing to endlessly over-prepare.</li>
                    <li>You sleep soundly, knowing you can handle whatever comes tomorrow.</li>
                    <li>You lead with quiet authority, grounded in your true capability rather than driven by fear.</li>
                </ul>
                
                <p class="body-p">You don't have to force this change. By updating how you process challenges at the deepest level, these outcomes become your natural default state.</p>
                
                <div style="margin-top: 56px; text-align: center; padding: 40px; background: var(--gray-50); border-radius: 12px; border: 1px solid var(--border);">
                    <h3 style="font-family: var(--fd); font-size: 2rem; margin-bottom: 16px;">Ready to Step Into Your Full Potential?</h3>
                    <p class="body-p" style="margin-bottom: 24px;">Let's discuss how we can make this transformation a reality for you.</p>
                    <button class="btn" onclick="window.openCal(); return false;">Book a Discovery Call</button>
                </div>
            </div>
        """
    },
    "outcomes/executive-burnout.html": {
        "eyebrow": "CHALLENGES",
        "title": "Burnout & Exhaustion",
        "sub": "You're still delivering, but you're running on fumes. Reclaim your energy and your edge.",
        "content": """
            <div style="max-width: 880px; margin: 0 auto;">
                <h2 class="section-title" style="margin-bottom: 24px; color: var(--dark);">Is this you?</h2>
                <ul class="for-list" style="margin-bottom: 40px; font-size: 1.1rem;">
                    <li>Are you still delivering results, but feeling completely depleted and running on fumes?</li>
                    <li>Do you find yourself increasingly cynical or detached from the work you used to love?</li>
                    <li>Is the cost to your physical health, your relationships, and your joy becoming unsustainable?</li>
                    <li>Do you feel like taking a vacation won't actually fix the deep exhaustion you carry?</li>
                    <li>Are you secretly wondering how much longer you can keep up this pace?</li>
                </ul>

                <h3 class="section-title" style="font-size: 2rem; margin: 40px 0 20px;">The Reality of Burnout</h3>
                <p class="body-p">Burnout isn't just about working too many hours; it's about the relentless internal pressure to constantly perform. It's a massive energy leak that happens when your boundaries are blurred and your self-worth becomes entirely entangled with your output. Rest alone doesn't cure burnout when your internal engine is still redlining.</p>
                
                <img src="../images/_DSC1754.jpg" alt="Tired leader in thought" style="width:100%; border-radius:12px; margin: 40px 0; box-shadow: var(--shadow-md); max-height: 450px; object-fit: cover; object-position: top;">
                
                <h3 class="section-title" style="font-size: 2rem; margin: 40px 0 20px;">Imagine a life where...</h3>
                <ul class="for-list" style="margin-bottom: 32px; font-size: 1.1rem; color: var(--dark);">
                    <li>You reclaim your energy, waking up feeling refreshed and genuinely excited for the day.</li>
                    <li>You establish natural, effortless boundaries that protect your time and your peace.</li>
                    <li>You perform at your highest level without sacrificing your health or your family.</li>
                    <li>You rediscover the passion, clarity, and joy that drove you to succeed in the first place.</li>
                </ul>
                
                <p class="body-p">You don't have to force this change. By updating how you process challenges at the deepest level, these outcomes become your natural default state.</p>
                
                <div style="margin-top: 56px; text-align: center; padding: 40px; background: var(--gray-50); border-radius: 12px; border: 1px solid var(--border);">
                    <h3 style="font-family: var(--fd); font-size: 2rem; margin-bottom: 16px;">Ready to Step Into Your Full Potential?</h3>
                    <p class="body-p" style="margin-bottom: 24px;">Let's discuss how we can make this transformation a reality for you.</p>
                    <button class="btn" onclick="window.openCal(); return false;">Book a Discovery Call</button>
                </div>
            </div>
        """
    },
    "outcomes/imposter-syndrome.html": {
        "eyebrow": "CHALLENGES",
        "title": "Imposter Syndrome",
        "sub": "The secret fear of being found out. Own your success and step fully into your authority.",
        "content": """
            <div style="max-width: 880px; margin: 0 auto;">
                <h2 class="section-title" style="margin-bottom: 24px; color: var(--dark);">Is this you?</h2>
                <ul class="for-list" style="margin-bottom: 40px; font-size: 1.1rem;">
                    <li>Do you secretly feel like a fraud, waiting for the day someone realizes you don't belong?</li>
                    <li>Despite a track record of success, do you attribute your achievements to luck, timing, or charm?</li>
                    <li>Do you constantly double-check your work, fearing that one mistake will expose you?</li>
                    <li>Are you holding back your most innovative ideas because you doubt your own authority?</li>
                    <li>Does praise make you uncomfortable because you don't truly believe it?</li>
                </ul>

                <h3 class="section-title" style="font-size: 2rem; margin: 40px 0 20px;">The Reality of Imposter Syndrome</h3>
                <p class="body-p">Imposter syndrome is the painful gap between your external reality and your internal self-image. No matter how many accolades you receive, your internal programming simply hasn't caught up to your success. Logic and rationalizing won't fix it, because the fear is rooted deep within your emotional responses and past conditioning.</p>
                
                <h3 class="section-title" style="font-size: 2rem; margin: 40px 0 20px;">Imagine a life where...</h3>
                <ul class="for-list" style="margin-bottom: 32px; font-size: 1.1rem; color: var(--dark);">
                    <li>You fully internalize your success and own your authority without hesitation.</li>
                    <li>You speak up and share your vision with natural, effortless confidence.</li>
                    <li>You accept praise and recognition, knowing you have genuinely earned it.</li>
                    <li>You take bold action without second-guessing your every move.</li>
                </ul>
                
                <p class="body-p">You don't have to force this change. By updating how you process challenges at the deepest level, these outcomes become your natural default state.</p>
                
                <div style="margin-top: 56px; text-align: center; padding: 40px; background: var(--gray-50); border-radius: 12px; border: 1px solid var(--border);">
                    <h3 style="font-family: var(--fd); font-size: 2rem; margin-bottom: 16px;">Ready to Step Into Your Full Potential?</h3>
                    <p class="body-p" style="margin-bottom: 24px;">Let's discuss how we can make this transformation a reality for you.</p>
                    <button class="btn" onclick="window.openCal(); return false;">Book a Discovery Call</button>
                </div>
            </div>
        """
    },
    "outcomes/decision-paralysis.html": {
        "eyebrow": "CHALLENGES",
        "title": "Decision Paralysis",
        "sub": "When overthinking causes costly delays. Regain your decisive edge.",
        "content": """
            <div style="max-width: 880px; margin: 0 auto;">
                <h2 class="section-title" style="margin-bottom: 24px; color: var(--dark);">Is this you?</h2>
                <ul class="for-list" style="margin-bottom: 40px; font-size: 1.1rem;">
                    <li>Are you overthinking critical choices to the point of exhaustion?</li>
                    <li>Do you find yourself constantly seeking more data or opinions to avoid making the final call?</li>
                    <li>Is the fear of making the "wrong" move causing costly delays in your business or life?</li>
                    <li>Do you spend hours agonizing over options, only to still feel deeply uncertain?</li>
                    <li>Have you lost the sharp, decisive instinct that helped you build your success in the first place?</li>
                </ul>

                <h3 class="section-title" style="font-size: 2rem; margin: 40px 0 20px;">The Reality of Decision Paralysis</h3>
                <p class="body-p">Decision paralysis is rarely caused by a lack of information. It is almost always driven by an underlying fear of failure, judgment, or the crushing weight of responsibility. When the pressure mounts, your mind creates a loop of over-analysis to protect you from the perceived danger of making a mistake.</p>
                
                <h3 class="section-title" style="font-size: 2rem; margin: 40px 0 20px;">Imagine a life where...</h3>
                <ul class="for-list" style="margin-bottom: 32px; font-size: 1.1rem; color: var(--dark);">
                    <li>You trust your gut and make swift, strategic decisions with total clarity.</li>
                    <li>You move forward with conviction, completely free from the paralyzing fear of "what if."</li>
                    <li>You regain your momentum and lead with the decisive edge that inspires confidence in others.</li>
                    <li>You accept that course-correction is part of success, neutralizing the fear of failure.</li>
                </ul>
                
                <p class="body-p">You don't have to force this change. By updating how you process challenges at the deepest level, these outcomes become your natural default state.</p>
                
                <div style="margin-top: 56px; text-align: center; padding: 40px; background: var(--gray-50); border-radius: 12px; border: 1px solid var(--border);">
                    <h3 style="font-family: var(--fd); font-size: 2rem; margin-bottom: 16px;">Ready to Step Into Your Full Potential?</h3>
                    <p class="body-p" style="margin-bottom: 24px;">Let's discuss how we can make this transformation a reality for you.</p>
                    <button class="btn" onclick="window.openCal(); return false;">Book a Discovery Call</button>
                </div>
            </div>
        """
    },
    "outcomes/perfectionism-procrastination.html": {
        "eyebrow": "CHALLENGES",
        "title": "Perfectionism & Procrastination",
        "sub": "The exhausting cycle of 'never good enough.' Move from friction to flow.",
        "content": """
            <div style="max-width: 880px; margin: 0 auto;">
                <h2 class="section-title" style="margin-bottom: 24px; color: var(--dark);">Is this you?</h2>
                <ul class="for-list" style="margin-bottom: 40px; font-size: 1.1rem;">
                    <li>Are your exceptionally high standards slowing down your progress and suffocating your momentum?</li>
                    <li>Do you delay launching projects or finalizing tasks because they aren't "perfect" yet?</li>
                    <li>Do you find yourself avoiding difficult or important tasks until the pressure forces you to act?</li>
                    <li>Does the thought of putting out "good enough" work make you deeply uncomfortable?</li>
                    <li>Are you exhausted by the constant cycle of never feeling like your work is truly finished?</li>
                </ul>

                <h3 class="section-title" style="font-size: 2rem; margin: 40px 0 20px;">The Reality of Perfectionism</h3>
                <p class="body-p">Perfectionism and procrastination are two sides of the same coin. They are powerful defense mechanisms designed to protect you from criticism, rejection, or the vulnerability of being truly seen. The pursuit of perfect is an exhausting illusion that creates immense friction, keeping you safely stuck in a holding pattern.</p>
                
                <img src="../images/hero%20header.jpg" alt="Overcoming perfectionism" style="width:100%; border-radius:12px; margin: 40px 0; box-shadow: var(--shadow-md); max-height: 450px; object-fit: cover; object-position: center;">
                
                <h3 class="section-title" style="font-size: 2rem; margin: 40px 0 20px;">Imagine a life where...</h3>
                <ul class="for-list" style="margin-bottom: 32px; font-size: 1.1rem; color: var(--dark);">
                    <li>You transition from rigid, high-friction work to a state of flow and massive execution.</li>
                    <li>You release the need for perfection, focusing instead on rapid progress and real-world impact.</li>
                    <li>You tackle important tasks immediately, without the heavy burden of dread or avoidance.</li>
                    <li>You produce your absolute best work with ease, trusting fully in your natural competence.</li>
                </ul>
                
                <p class="body-p">You don't have to force this change. By updating how you process challenges at the deepest level, these outcomes become your natural default state.</p>
                
                <div style="margin-top: 56px; text-align: center; padding: 40px; background: var(--gray-50); border-radius: 12px; border: 1px solid var(--border);">
                    <h3 style="font-family: var(--fd); font-size: 2rem; margin-bottom: 16px;">Ready to Step Into Your Full Potential?</h3>
                    <p class="body-p" style="margin-bottom: 24px;">Let's discuss how we can make this transformation a reality for you.</p>
                    <button class="btn" onclick="window.openCal(); return false;">Book a Discovery Call</button>
                </div>
            </div>
        """
    },
    "outcomes/performance-blocks.html": {
        "eyebrow": "CHALLENGES",
        "title": "Performance Blocks",
        "sub": "Hitting the invisible ceiling. Shatter your limits and unlock your next level.",
        "content": """
            <div style="max-width: 880px; margin: 0 auto;">
                <h2 class="section-title" style="margin-bottom: 24px; color: var(--dark);">Is this you?</h2>
                <ul class="for-list" style="margin-bottom: 40px; font-size: 1.1rem;">
                    <li>Do you know exactly what you are capable of, yet feel an invisible ceiling holding you back?</li>
                    <li>Have you hit a plateau in your income, career, or personal growth that you just can't seem to break?</li>
                    <li>Do you find yourself falling into self-sabotaging patterns just as you're about to reach a new level of success?</li>
                    <li>Are you feeling deeply frustrated because consciously you want to move forward, but something is stopping you?</li>
                    <li>Does it feel like you are driving fast, but with the emergency brake completely pulled up?</li>
                </ul>

                <h3 class="section-title" style="font-size: 2rem; margin: 40px 0 20px;">The Reality of Performance Blocks</h3>
                <p class="body-p">Performance blocks are invisible barriers created by outdated protective programming in your mind. Consciously, you are incredibly driven and ambitious. But subconsciously, an old belief or fear is pulling the emergency brake, keeping you "safe" within your current comfort zone. Pushing harder only creates more resistance.</p>
                
                <h3 class="section-title" style="font-size: 2rem; margin: 40px 0 20px;">Imagine a life where...</h3>
                <ul class="for-list" style="margin-bottom: 32px; font-size: 1.1rem; color: var(--dark);">
                    <li>You shatter your internal limits and seamlessly step into your next level of success.</li>
                    <li>You align your subconscious drives with your conscious ambitions, resulting in unhindered growth.</li>
                    <li>You recognize your true worth and naturally command the opportunities you deserve.</li>
                    <li>You operate with total freedom, leaving self-sabotage completely in the past.</li>
                </ul>
                
                <p class="body-p">You don't have to force this change. By updating how you process challenges at the deepest level, these outcomes become your natural default state.</p>
                
                <div style="margin-top: 56px; text-align: center; padding: 40px; background: var(--gray-50); border-radius: 12px; border: 1px solid var(--border);">
                    <h3 style="font-family: var(--fd); font-size: 2rem; margin-bottom: 16px;">Ready to Step Into Your Full Potential?</h3>
                    <p class="body-p" style="margin-bottom: 24px;">Let's discuss how we can make this transformation a reality for you.</p>
                    <button class="btn" onclick="window.openCal(); return false;">Book a Discovery Call</button>
                </div>
            </div>
        """
    }
}

base_dir = "/Users/yoriktisseau/Desktop/websites/ignis leadership/website_structure"
for rel_path, data in pages.items():
    update_challenge_page(os.path.join(base_dir, rel_path), data["eyebrow"], data["title"], data["sub"], data["content"])

print("Challenges updated.")
