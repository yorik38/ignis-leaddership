import os
from bs4 import BeautifulSoup

def update_page_content(filepath, eyebrow, title, sub, html_content):
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
        
    # Set canonical
    canonical = soup.find("link", rel="canonical")
    if canonical:
        canonical["href"] = f"https://ignisleadership.com/{os.path.relpath(filepath, '/Users/yoriktisseau/Desktop/websites/ignis leadership/website_structure')}"
        
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(str(soup))


pages = {
    "outcomes/high-stakes-anxiety.html": {
        "eyebrow": "CHALLENGES",
        "title": "High-Stakes Anxiety",
        "sub": "Stop relying on adrenaline. Calm your nervous system and lead with quiet, unshakeable confidence.",
        "content": """
            <div style="max-width: 880px; margin: 0 auto;">
                <img src="../images/hero%20header.jpg" alt="Executive looking out window" style="width:100%; border-radius:12px; margin-bottom: 40px; box-shadow: var(--shadow-md);">
                <h2 class="section-title" style="margin-bottom: 24px; color: var(--dark);">The Constant Hum of Dread</h2>
                <p class="body-large" style="margin-bottom: 24px;">You’re over-preparing. You’re losing sleep. You’re relying on adrenaline and sheer willpower to get through board meetings, investor pitches, and critical negotiations.</p>
                <p class="body-p">To everyone else, you look like you have it all under control. But internally, your nervous system is in overdrive. The anxiety isn't just uncomfortable—it's draining the energy you need for high-level strategic thinking.</p>
                <p class="body-p">High-stakes anxiety at the senior executive level rarely responds to "mindfulness" or basic stress management. It's a deeply wired survival response.</p>
                
                <h3 class="section-title" style="font-size: 2rem; margin: 40px 0 20px;">The Clear Identity Solution</h3>
                <p class="body-p">Through targeted subconscious rewiring (hypnotherapy) combined with executive coaching, we don't just manage the anxiety—we update the underlying neural pathways that trigger it. You will step into high-stakes environments with a profound sense of calm, clarity, and authority.</p>
                
                <div style="margin-top: 56px; text-align: center; padding: 40px; background: var(--gray-50); border-radius: 12px; border: 1px solid var(--border);">
                    <h3 style="font-family: var(--fd); font-size: 2rem; margin-bottom: 16px;">Ready to Lead Without the Adrenaline?</h3>
                    <p class="body-p" style="margin-bottom: 24px;">Let's discuss how we can rewire your response to high-stakes pressure.</p>
                    <button class="btn" onclick="window.openCal(); return false;">Book a Discovery Call</button>
                </div>
            </div>
        """
    },
    "outcomes/executive-burnout.html": {
        "eyebrow": "CHALLENGES",
        "title": "Executive Burnout",
        "sub": "You're still delivering, but you're running on fumes. Reclaim your energy and your edge.",
        "content": """
            <div style="max-width: 880px; margin: 0 auto;">
                <img src="../images/_DSC1754.jpg" alt="Tired executive in thought" style="width:100%; border-radius:12px; margin-bottom: 40px; box-shadow: var(--shadow-md); max-height: 400px; object-fit: cover; object-position: top;">
                <h2 class="section-title" style="margin-bottom: 24px; color: var(--dark);">The Hidden Cost of High Performance</h2>
                <p class="body-large" style="margin-bottom: 24px;">You’ve built a successful career by outworking everyone else. But the strategies that got you here are now breaking you down.</p>
                <p class="body-p">You're still hitting targets, but the cost to your physical health, your relationships, and your mental bandwidth is becoming unsustainable. You feel depleted, cynical, and detached from the vision that used to excite you.</p>
                
                <h3 class="section-title" style="font-size: 2rem; margin: 40px 0 20px;">Why Vacation Isn't Enough</h3>
                <p class="body-p">Executive burnout isn't solved by a two-week holiday. It's a structural issue rooted in unconscious boundaries, identity entanglement with your role, and a nervous system stuck in "fight or flight."</p>
                <p class="body-p">Using the Clear Identity Method, we address the root cause of your burnout at the subconscious level. We decouple your self-worth from your output and rebuild your internal operating system so you can lead powerfully, without sacrificing yourself.</p>
                
                <div style="margin-top: 56px; text-align: center; padding: 40px; background: var(--gray-50); border-radius: 12px; border: 1px solid var(--border);">
                    <h3 style="font-family: var(--fd); font-size: 2rem; margin-bottom: 16px;">Time to Stop Running on Fumes?</h3>
                    <p class="body-p" style="margin-bottom: 24px;">Reclaim your energy and redefine your leadership.</p>
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
                <img src="../images/hero%20header.jpg" alt="Executive in boardroom" style="width:100%; border-radius:12px; margin-bottom: 40px; box-shadow: var(--shadow-md);">
                <h2 class="section-title" style="margin-bottom: 24px; color: var(--dark);">The Fraud Feeling</h2>
                <p class="body-large" style="margin-bottom: 24px;">You look around the boardroom and think: "Any day now, they’ll realize I don't actually belong here."</p>
                <p class="body-p">Despite a track record of undeniable success, promotions, and accolades, you secretly attribute it all to luck, timing, or charming the right people. This imposter syndrome forces you to constantly overcompensate, double-check your work, and hold back your most innovative ideas for fear of being exposed.</p>
                
                <h3 class="section-title" style="font-size: 2rem; margin: 40px 0 20px;">Internalizing Your Expertise</h3>
                <p class="body-p">Imposter syndrome is a disconnect between your external reality and your internal identity. Logic and rationalizing won't fix it, because the fear lives in the subconscious.</p>
                <p class="body-p">We use targeted hypnotherapy to align your internal self-image with your external achievements. You will stop feeling like a fraud and start leading with authentic, grounded conviction.</p>
                
                <div style="margin-top: 56px; text-align: center; padding: 40px; background: var(--gray-50); border-radius: 12px; border: 1px solid var(--border);">
                    <h3 style="font-family: var(--fd); font-size: 2rem; margin-bottom: 16px;">Ready to Own Your Authority?</h3>
                    <p class="body-p" style="margin-bottom: 24px;">Erase the imposter feeling for good.</p>
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
                <h2 class="section-title" style="margin-bottom: 24px; color: var(--dark);">The Trap of Over-Analysis</h2>
                <p class="body-large" style="margin-bottom: 24px;">You used to make fast, effective decisions. But now, as the stakes have grown, you find yourself trapped in loops of over-analysis.</p>
                <p class="body-p">The fear of making the wrong move—and the cascading consequences it would have on the organization—is paralyzing you. You gather more data, seek more opinions, and delay the inevitable. Meanwhile, the lack of direction is frustrating your team and costing the business momentum.</p>
                
                <h3 class="section-title" style="font-size: 2rem; margin: 40px 0 20px;">Restoring Executive Instinct</h3>
                <p class="body-p">Decision paralysis at the executive level is rarely a lack of information; it is a subconscious fear of failure or judgment. Through the Clear Identity Method, we neutralize the emotional weight attached to these outcomes. We restore your connection to your core executive instinct, allowing you to make swift, strategic decisions with clarity and conviction.</p>
                
                <div style="margin-top: 56px; text-align: center; padding: 40px; background: var(--gray-50); border-radius: 12px; border: 1px solid var(--border);">
                    <h3 style="font-family: var(--fd); font-size: 2rem; margin-bottom: 16px;">Break the Paralysis</h3>
                    <p class="body-p" style="margin-bottom: 24px;">Get back to making the decisive moves your organization needs.</p>
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
                <h2 class="section-title" style="margin-bottom: 24px; color: var(--dark);">The Illusion of Perfect</h2>
                <p class="body-large" style="margin-bottom: 24px;">Your standards are exceptionally high. But that relentless demand for perfection has turned into a bottleneck.</p>
                <p class="body-p">You find yourself delaying project launches, endlessly revising presentations, or avoiding difficult tasks until the last minute because the conditions aren't "just right." This perfectionism-procrastination loop is exhausting you and suffocating your team's agility.</p>
                
                <h3 class="section-title" style="font-size: 2rem; margin: 40px 0 20px;">Breaking the Cycle</h3>
                <p class="body-p">Perfectionism is a defense mechanism—a subconscious strategy to avoid criticism or failure. By addressing these core fears directly through hypnotherapy and strategic coaching, we dismantle the need for perfection. You will transition from rigid, high-friction work to a state of flow, speed, and massive execution.</p>
                
                <div style="margin-top: 56px; text-align: center; padding: 40px; background: var(--gray-50); border-radius: 12px; border: 1px solid var(--border);">
                    <h3 style="font-family: var(--fd); font-size: 2rem; margin-bottom: 16px;">Ready to Move Faster?</h3>
                    <p class="body-p" style="margin-bottom: 24px;">Drop the perfectionism and start executing with freedom.</p>
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
                <h2 class="section-title" style="margin-bottom: 24px; color: var(--dark);">The Unseen Barrier</h2>
                <p class="body-large" style="margin-bottom: 24px;">You know exactly what you are capable of, yet something invisible seems to be holding you back from your next big leap.</p>
                <p class="body-p">Whether it's a specific revenue ceiling, an inability to step onto a bigger stage, or a self-sabotaging pattern that appears just as you're about to succeed, the block is real. Consciously, you want the growth. Subconsciously, your mind is pulling the emergency brake.</p>
                
                <h3 class="section-title" style="font-size: 2rem; margin: 40px 0 20px;">Unleashing Latent Potential</h3>
                <p class="body-p">These performance blocks are protective mechanisms installed long ago by your unconscious mind. By bypassing the critical conscious mind, we can identify these obsolete "programs" and rewrite them. We align your subconscious drives with your conscious ambitions, resulting in explosive, unhindered growth.</p>
                
                <div style="margin-top: 56px; text-align: center; padding: 40px; background: var(--gray-50); border-radius: 12px; border: 1px solid var(--border);">
                    <h3 style="font-family: var(--fd); font-size: 2rem; margin-bottom: 16px;">Break Through the Ceiling</h3>
                    <p class="body-p" style="margin-bottom: 24px;">Let's identify and remove the blocks holding you back.</p>
                    <button class="btn" onclick="window.openCal(); return false;">Book a Discovery Call</button>
                </div>
            </div>
        """
    },
    "coaching/1-1-transformation.html": {
        "eyebrow": "WORK WITH ME",
        "title": "1:1 Executive Transformation",
        "sub": "Deep, bespoke intervention for senior leaders who need rapid, profound shifts in their internal operating system.",
        "content": """
            <div style="max-width: 880px; margin: 0 auto;">
                <img src="../images/_DSC1754.jpg" alt="Yorik Tisseau Executive Coaching" style="width:100%; border-radius:12px; margin-bottom: 40px; box-shadow: var(--shadow-md); max-height: 450px; object-fit: cover; object-position: top;">
                <h2 class="section-title" style="margin-bottom: 24px; color: var(--dark);">Not Standard Coaching. Subconscious Reprogramming.</h2>
                <p class="body-large" style="margin-bottom: 24px;">Standard executive coaching focuses on accountability and conscious strategy. But you already know <em>what</em> to do. The friction lies in your unconscious patterns.</p>
                <p class="body-p">My 1:1 Transformation program merges high-level executive coaching with clinical hypnotherapy. We bypass the rationalizing mind to target the deeply embedded beliefs, fears, and identity constructs that are dictating your stress levels and performance blocks.</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin: 40px 0;">
                    <div style="padding: 32px; background: var(--white); border: 1px solid var(--border); border-radius: 12px; box-shadow: var(--shadow-sm);">
                        <h4 style="font-family: var(--fd); font-size: 1.5rem; margin-bottom: 12px;">The Assessment Phase</h4>
                        <p class="body-p" style="font-size: 0.95rem;">We begin with a comprehensive mapping of your current behavioral loops, triggers, and the systemic pressures of your role.</p>
                    </div>
                    <div style="padding: 32px; background: var(--white); border: 1px solid var(--border); border-radius: 12px; box-shadow: var(--shadow-sm);">
                        <h4 style="font-family: var(--fd); font-size: 1.5rem; margin-bottom: 12px;">The Subconscious Intervention</h4>
                        <p class="body-p" style="font-size: 0.95rem;">Using strategic hypnotherapy, we update the neural pathways driving anxiety, imposter syndrome, and burnout.</p>
                    </div>
                    <div style="padding: 32px; background: var(--white); border: 1px solid var(--border); border-radius: 12px; box-shadow: var(--shadow-sm);">
                        <h4 style="font-family: var(--fd); font-size: 1.5rem; margin-bottom: 12px;">The Conscious Integration</h4>
                        <p class="body-p" style="font-size: 0.95rem;">We translate these profound internal shifts into actionable leadership strategies, ensuring sustained performance in the boardroom.</p>
                    </div>
                </div>
                
                <h3 class="section-title" style="font-size: 2rem; margin: 40px 0 20px;">Who This Is For</h3>
                <ul class="for-list" style="margin-bottom: 40px;">
                    <li>C-Suite executives and founders dealing with high-stakes pressure.</li>
                    <li>Leaders experiencing burnout, anxiety, or performance plateaus despite past success.</li>
                    <li>High-achievers ready to stop managing symptoms and fix the root cause.</li>
                </ul>
                
                <div style="text-align: center; padding: 48px 32px; background: var(--dark); color: #fff; border-radius: 12px;">
                    <h3 style="font-family: var(--fd); font-size: 2.5rem; margin-bottom: 16px; color: #fff;">Apply for 1:1 Transformation</h3>
                    <p class="body-p" style="margin-bottom: 32px; color: rgba(255,255,255,0.7);">I take on a limited number of 1:1 private clients per year to ensure maximum impact. Let's explore if we are a fit.</p>
                    <button class="btn" onclick="window.openCal(); return false;" style="background: var(--accent); color: #fff;">Schedule an Exploratory Call</button>
                </div>
            </div>
        """
    },
    "courses/index.html": {
        "eyebrow": "WORK WITH ME",
        "title": "Digital Courses & Programs",
        "sub": "Scalable, self-paced access to the Clear Identity Method.",
        "content": """
            <div style="max-width: 880px; margin: 0 auto;">
                <h2 class="section-title" style="margin-bottom: 24px; color: var(--dark);">Master Your Mind on Your Schedule</h2>
                <p class="body-large" style="margin-bottom: 48px;">For leaders who want the frameworks and subconscious audio tools of the Clear Identity Method, accessible anytime, anywhere.</p>
                
                <div style="display: flex; flex-direction: column; gap: 32px;">
                    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 32px; background: var(--white); border: 1px solid var(--border); border-radius: 16px; padding: 32px; box-shadow: var(--shadow-sm); align-items: center;">
                        <div style="background: var(--gray-100); border-radius: 8px; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-family: var(--fd); font-size: 2rem; color: var(--gray-text);">
                            COMING SOON
                        </div>
                        <div>
                            <span style="font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); font-weight: 600;">Audio Program</span>
                            <h3 style="font-family: var(--fd); font-size: 2rem; margin: 8px 0 16px;">The Executive Calm Protocol</h3>
                            <p class="body-p">A 21-day self-guided hypnosis and mental framing program designed specifically to regulate the nervous system of high-stakes leaders.</p>
                            <button class="btn secondary">Join the Waitlist</button>
                        </div>
                    </div>
                </div>
            </div>
        """
    },
    "about.html": {
        "eyebrow": "ABOUT YORIK TISSEAU",
        "title": "The Person Behind Ignis.",
        "sub": "Former energy leader turned coach and hypnotherapist. I tackle real leadership problems by making changes at the unconscious level.",
        "content": """
            <div style="max-width: 880px; margin: 0 auto;">
                <img src="images/_DSC1754.jpg" alt="Yorik Tisseau" style="width:100%; border-radius:12px; margin-bottom: 40px; box-shadow: var(--shadow-md); max-height: 500px; object-fit: cover; object-position: center top;">
                
                <h2 class="section-title" style="margin-bottom: 24px; color: var(--dark);">I know what it’s like to doubt yourself in the room.</h2>
                <p class="body-large" style="margin-bottom: 24px;">Before I became an executive coach and hypnotherapist, I spent over a decade navigating the intense, high-stakes corporate world of BP.</p>
                
                <p class="body-p">With an MBA and a rapid ascent through the ranks, I looked successful on paper. I led commercial teams, managed multi-million-pound portfolios, and sat in boardrooms making critical decisions. But internally, it was a different story.</p>
                
                <p class="body-p">I was plagued by a relentless imposter syndrome. I over-prepared for every meeting, driven by a deep fear of being "found out." The anxiety was a low-level hum that drained my energy and eventually pushed me to the brink of burnout.</p>
                
                <h3 class="section-title" style="font-size: 2rem; margin: 40px 0 20px;">The Turning Point</h3>
                <p class="body-p">Standard coaching, reading leadership books, and trying to "think positive" didn't work. The anxiety and the imposter syndrome weren't logical problems; they were deeply wired, unconscious patterns.</p>
                <p class="body-p">It wasn't until I discovered the power of clinical hypnotherapy and subconscious reprogramming that everything changed. By addressing the root cause—the unconscious identity constructs holding me back—I rapidly cleared the anxiety, reclaimed my confidence, and stepped into my authentic authority.</p>
                
                <h3 class="section-title" style="font-size: 2rem; margin: 40px 0 20px;">Why I Built Ignis Leadership</h3>
                <p class="body-p">I founded Ignis Leadership because I saw how many brilliant executives were suffering exactly like I was—silently, behind closed doors.</p>
                <p class="body-p">Today, I combine my corporate MBA background, ICF-accredited coaching skills, and clinical hypnotherapy expertise to help senior leaders shatter their performance blocks. We don't just talk about strategies; we rewire the mental operating system for rapid, permanent transformation.</p>
                
                <div class="cred-tags" style="margin-top: 40px; display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;">
                    <span class="cred-tag on">MBA Graduate</span>
                    <span class="cred-tag on">ICF Accredited Coach</span>
                    <span class="cred-tag on">Clinical Hypnotherapist</span>
                    <span class="cred-tag on">Former BP Leader</span>
                </div>
                
                <div style="margin-top: 56px; text-align: center; padding: 40px; background: var(--gray-50); border-radius: 12px; border: 1px solid var(--border);">
                    <h3 style="font-family: var(--fd); font-size: 2rem; margin-bottom: 16px;">Let's Get to the Root of It</h3>
                    <p class="body-p" style="margin-bottom: 24px;">Stop managing symptoms and start creating deep, structural change.</p>
                    <button class="btn" onclick="window.openCal(); return false;">Book a Discovery Call</button>
                </div>
            </div>
        """
    }
}

base_dir = "/Users/yoriktisseau/Desktop/websites/ignis leadership/website_structure"
for rel_path, data in pages.items():
    update_page_content(os.path.join(base_dir, rel_path), data["eyebrow"], data["title"], data["sub"], data["content"])

print("Content populated.")
