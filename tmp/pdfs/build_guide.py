from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "website_structure/assets/downloads/ai-augmented-bid-practice-field-guide.pdf"

PAGE_W, PAGE_H = A4
MARGIN = 42

INK = HexColor("#14181F")
NAVY = HexColor("#12213A")
ACCENT = HexColor("#1B3A63")
ACCENT_LIGHT = HexColor("#2C5185")
TEAL = HexColor("#47C5C9")
STEEL = HexColor("#586170")
STEEL_LIGHT = HexColor("#718096")
TINT = HexColor("#F1F5F8")
TINT_2 = HexColor("#E8EEF5")
LINE = HexColor("#CFD8E3")
BLUE_LINE = HexColor("#AFC5E4")
GREEN = HexColor("#0FA77B")
GREEN_TINT = HexColor("#E8F7F2")
WHITE = HexColor("#FFFFFF")


FONT_DIR = Path("/System/Library/Fonts/Supplemental")
pdfmetrics.registerFont(TTFont("Arial", FONT_DIR / "Arial.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Bold", FONT_DIR / "Arial Bold.ttf"))
pdfmetrics.registerFont(TTFont("Georgia", FONT_DIR / "Georgia.ttf"))
pdfmetrics.registerFont(TTFont("Georgia-Italic", FONT_DIR / "Georgia Italic.ttf"))


def style(name, font="Arial", size=10, leading=None, color=INK, align=TA_LEFT, **kwargs):
    return ParagraphStyle(
        name,
        fontName=font,
        fontSize=size,
        leading=leading or size * 1.35,
        textColor=color,
        alignment=align,
        spaceAfter=0,
        spaceBefore=0,
        **kwargs,
    )


BODY = style("body", "Georgia", 10.5, 16, STEEL)
SMALL = style("small", "Arial", 7.3, 10.2, STEEL)
SMALL_WHITE = style("small-white", "Arial", 6.6, 8.7, WHITE)


def paragraph(c, text, x, y_top, width, pstyle, max_height=200):
    p = Paragraph(text, pstyle)
    _, h = p.wrap(width, max_height)
    p.drawOn(c, x, y_top - h)
    return h


def fit_text(c, text, x, y_top, width, font, max_size, min_size, leading_factor=1.08, color=INK):
    size = max_size
    while size >= min_size:
        pstyle = style(f"fit-{size}", font, size, size * leading_factor, color)
        p = Paragraph(text, pstyle)
        _, h = p.wrap(width, PAGE_H)
        if h <= 160:
            p.drawOn(c, x, y_top - h)
            return h
        size -= 1
    return paragraph(c, text, x, y_top, width, pstyle, 220)


def draw_logo_wordmark(c, x, y, scale=1.0, on_dark=False):
    slash_color = WHITE if on_dark else INK
    word_color = WHITE if on_dark else INK
    c.setStrokeColor(slash_color)
    c.setLineWidth(3.2 * scale)
    c.line(x, y, x + 7 * scale, y + 24 * scale)
    c.setFillColor(word_color)
    c.setFont("Arial-Bold", 17 * scale)
    c.drawString(x + 13 * scale, y + 2 * scale, "ignis")
    c.setFillColor(TEAL)
    c.circle(x + 22.5 * scale, y + 18.5 * scale, 2.1 * scale, fill=1, stroke=0)


def page_header(c, page_no, section="PRACTICAL GUIDE"):
    c.setFillColor(ACCENT)
    c.setFont("Arial-Bold", 7.5)
    c.drawString(MARGIN, PAGE_H - 34, f"IGNIS LEADERSHIP  |  {section}")
    c.setFillColor(STEEL_LIGHT)
    c.setFont("Arial", 7.5)
    c.drawRightString(PAGE_W - MARGIN, PAGE_H - 34, str(page_no))
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.line(MARGIN, PAGE_H - 45, PAGE_W - MARGIN, PAGE_H - 45)


def page_footer(c, message="ignisleadership.com/resources/ai-augmented-bid-practice"):
    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    c.line(MARGIN, 32, PAGE_W - MARGIN, 32)
    c.setFillColor(STEEL_LIGHT)
    c.setFont("Arial", 6.8)
    c.drawString(MARGIN, 19, message)
    c.drawRightString(PAGE_W - MARGIN, 19, "© 2026 Ignis Leadership. All rights reserved.")


def draw_loop_icon(c, cx, cy, radius, color=ACCENT):
    c.setStrokeColor(color)
    c.setFillColor(color)
    c.setLineWidth(1.7)
    c.arc(cx - radius, cy - radius, cx + radius, cy + radius, startAng=35, extent=300)
    angle_x = cx + radius * 0.78
    angle_y = cy + radius * 0.55
    c.line(angle_x, angle_y, angle_x - 7, angle_y + 1)
    c.line(angle_x, angle_y, angle_x - 2, angle_y - 6)


STEPS = [
    ("1", "Business<br/>outcome", "Set the decision, acceptance criteria and commercial value."),
    ("2", "Trusted<br/>context", "Ground work in tender documents, CRM, prior bids, evidence and policy."),
    ("3", "Agents and<br/>tools", "Route bounded tasks to specialist agents, systems and people."),
    ("4", "Evaluate and<br/>refine", "Test sources, accuracy, completeness and exceptions before work advances."),
    ("5", "Human<br/>decision gates", "People qualify, approve strategy, accept commitments and authorise submission."),
    ("6", "Measure and<br/>learn", "Track quality, rework, cycle time and outcomes to improve the next workflow."),
]


def draw_step_panel(c, x, y, width, height, steps, compact=False):
    c.setFillColor(WHITE)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.roundRect(x, y, width, height, 8, fill=1, stroke=1)
    col_w = width / 3
    for i, (number, title, desc) in enumerate(steps):
        cx = x + col_w * (i + 0.5)
        if i:
            c.setStrokeColor(BLUE_LINE)
            c.setDash(3, 3)
            c.line(x + col_w * i, y + 18, x + col_w * i, y + height - 18)
            c.setDash()
        r = 12 if compact else 14
        c.setFillColor(TINT)
        c.setStrokeColor(BLUE_LINE)
        c.circle(cx, y + height - 29, r, fill=1, stroke=1)
        c.setFillColor(HexColor("#1762C5"))
        c.setFont("Arial-Bold", 10 if compact else 11)
        c.drawCentredString(cx, y + height - 33, number)
        title_style = style(
            f"step-title-{number}-{compact}",
            "Arial-Bold",
            6.9 if compact else 7.6,
            8.0 if compact else 8.8,
            INK,
            TA_CENTER,
        )
        paragraph(c, title, x + col_w * i + 4, y + height - 53, col_w - 8, title_style, 45)
        desc_style = style(
            f"step-desc-{number}-{compact}",
            "Arial",
            5.2 if compact else 6.0,
            6.7 if compact else 7.7,
            STEEL,
            TA_CENTER,
        )
        paragraph(c, desc, x + col_w * i + 5, y + height - 89, col_w - 10, desc_style, height - 95)


def draw_architecture(c, x, y, width, height, compact=False):
    c.setFillColor(TINT_2)
    c.setStrokeColor(BLUE_LINE)
    c.setLineWidth(0.8)
    c.roundRect(x, y, width, height, 10, fill=1, stroke=1)

    c.setFillColor(STEEL_LIGHT)
    c.setFont("Arial-Bold", 6.2 if compact else 7.2)
    c.drawCentredString(x + width / 2, y + height - 22, "GOVERNED AI-AUGMENTED BID WORKFLOW")

    inner_x = x + 15
    inner_w = width - 30
    center_w = 54 if compact else 62
    gap = 9
    panel_w = (inner_w - center_w - gap * 2) / 2
    panel_y = y + 92
    panel_h = height - 128
    draw_step_panel(c, inner_x, panel_y, panel_w, panel_h, STEPS[:3], compact)
    draw_step_panel(c, inner_x + panel_w + center_w + gap * 2, panel_y, panel_w, panel_h, STEPS[3:], compact)

    cx = inner_x + panel_w + gap + center_w / 2
    cy = panel_y + panel_h * 0.57
    draw_loop_icon(c, cx, cy + 10, 19 if compact else 22)
    c.setFillColor(ACCENT)
    c.setFont("Arial-Bold", 6.0 if compact else 6.8)
    c.drawCentredString(cx, cy - 19, "EXECUTE AND EVALUATE")
    c.setFillColor(STEEL)
    c.setFont("Arial", 5.6 if compact else 6.4)
    c.drawCentredString(cx, cy - 29, "Correct and refine")

    bar_x = inner_x
    bar_w = inner_w
    gov_y = y + 49
    c.setFillColor(HexColor("#F7FAFC"))
    c.setStrokeColor(BLUE_LINE)
    c.roundRect(bar_x, gov_y, bar_w, 28, 5, fill=1, stroke=1)
    c.setFillColor(ACCENT)
    c.setFont("Arial-Bold", 6.0 if compact else 6.8)
    c.drawString(bar_x + 12, gov_y + 10, "BID GOVERNANCE")
    c.setFillColor(STEEL)
    c.setFont("Arial", 5.1 if compact else 5.8)
    c.drawRightString(bar_x + bar_w - 12, gov_y + 10, "Approved sources  |  Access rights  |  Evidence traceability  |  Compliance controls  |  Approval record")

    out_y = y + 13
    c.setFillColor(GREEN_TINT)
    c.setStrokeColor(GREEN)
    c.roundRect(bar_x, out_y, bar_w, 27, 5, fill=1, stroke=1)
    c.setFillColor(GREEN)
    c.circle(bar_x + 18, out_y + 13.5, 8, fill=1, stroke=0)
    c.setStrokeColor(WHITE)
    c.setLineWidth(1.5)
    c.line(bar_x + 14, out_y + 13, bar_x + 17, out_y + 10)
    c.line(bar_x + 17, out_y + 10, bar_x + 22, out_y + 17)
    c.setFillColor(GREEN)
    c.setFont("Arial-Bold", 6.4 if compact else 7.2)
    c.drawString(bar_x + 33, out_y + 10, "OUTCOME")
    c.setFillColor(ACCENT)
    c.setFont("Arial-Bold", 6.0 if compact else 6.8)
    c.drawString(bar_x + 77, out_y + 10, "Reliable, governed bid decisions and outputs.")


def cover(c):
    c.setFillColor(WHITE)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    c.setFillColor(ACCENT)
    c.setFont("Arial-Bold", 8)
    c.drawString(48, PAGE_H - 62, "PRACTICAL GUIDE  |  SEPTEMBER 2026")
    c.setFillColor(INK)
    title_style = style("cover-title", "Arial-Bold", 34, 36, INK)
    paragraph(c, "How to build an<br/>AI-augmented bid practice", 48, PAGE_H - 103, PAGE_W - 96, title_style, 160)
    sub_style = style("cover-sub", "Georgia", 12.5, 18.5, STEEL)
    paragraph(
        c,
        "A practical guide to the decisions, context and controls behind reliable human-agent collaboration.",
        48,
        PAGE_H - 205,
        430,
        sub_style,
        70,
    )

    chart_y = 164
    chart_h = 326
    c.setFillColor(TINT_2)
    c.rect(0, chart_y - 15, PAGE_W, chart_h + 30, fill=1, stroke=0)
    draw_architecture(c, 28, chart_y, PAGE_W - 56, chart_h, compact=True)

    footer_h = 149
    c.setFillColor(NAVY)
    c.rect(0, 0, PAGE_W, footer_h, fill=1, stroke=0)
    draw_logo_wordmark(c, 48, 87, 1.0, on_dark=True)
    c.setFillColor(TEAL)
    c.setFont("Arial-Bold", 10.5)
    c.drawString(120, 96, "Bid Management Consultancy & Advisory")
    c.setStrokeColor(HexColor("#486079"))
    c.setLineWidth(0.6)
    c.line(48, 67, PAGE_W - 48, 67)
    c.setFillColor(HexColor("#C5D0DC"))
    c.setFont("Arial", 7.3)
    c.drawString(48, 46, "Yorik Tisseau  |  Ignis Leadership")
    c.drawRightString(PAGE_W - 48, 46, "Issued September 2026")
    c.setFont("Arial", 6.7)
    c.drawString(48, 25, "ignisleadership.com")
    c.drawRightString(PAGE_W - 48, 25, "© 2026 Ignis Leadership. All rights reserved.")
    c.showPage()


def foreword(c):
    page_header(c, 2, "FOREWORD")
    c.setFillColor(ACCENT)
    c.setFont("Arial-Bold", 8)
    c.drawString(MARGIN, PAGE_H - 84, "A NOTE FROM YORIK")
    title_style = style("foreword-title", "Arial-Bold", 29, 31.5, INK)
    paragraph(c, "Build the practice before scaling the tools.", MARGIN, PAGE_H - 108, 430, title_style, 100)

    y = PAGE_H - 198
    body_copy = [
        "AI can produce more bid work. That does not, by itself, create a stronger bid practice.",
        "Complex bids depend on a chain of commercial, technical and delivery decisions. When AI contributes to that chain, the team needs explicit context, bounded roles, reliable evaluation and named people who remain accountable.",
        "This guide gives you a practical architecture and twelve questions to examine one real workflow. It is not a platform blueprint or a maturity score. It is a way to see what must be true before a controlled AI experiment deserves trust.",
    ]
    for text in body_copy:
        h = paragraph(c, text, MARGIN, y, 480, BODY, 95)
        y -= h + 16

    c.setFillColor(TINT)
    c.setStrokeColor(LINE)
    c.roundRect(MARGIN, 212, PAGE_W - 2 * MARGIN, 188, 7, fill=1, stroke=1)
    c.setFillColor(ACCENT)
    c.setFont("Arial-Bold", 8)
    c.drawString(MARGIN + 20, 372, "HOW TO USE THIS GUIDE")
    use_steps = [
        ("1", "Choose one workflow", "Use a live, recent or representative pursuit. Do not rate the organisation in the abstract."),
        ("2", "Mark what is visible", "For each statement, choose Visible, Partial or Unclear and note the evidence behind your answer."),
        ("3", "Use the gaps", "The pattern shows what to resolve before you build, rely on or expand an AI-enabled workflow."),
    ]
    col_w = (PAGE_W - 2 * MARGIN - 40) / 3
    for i, (n, heading, text) in enumerate(use_steps):
        x = MARGIN + 20 + i * col_w
        c.setFillColor(ACCENT)
        c.circle(x + 9, 341, 9, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Arial-Bold", 7.5)
        c.drawCentredString(x + 9, 338.5, n)
        c.setFillColor(INK)
        c.setFont("Arial-Bold", 8.2)
        c.drawString(x, 318, heading)
        paragraph(c, text, x, 301, col_w - 14, SMALL, 78)

    c.setFillColor(NAVY)
    c.roundRect(MARGIN, 106, PAGE_W - 2 * MARGIN, 78, 5, fill=1, stroke=0)
    c.setFillColor(TEAL)
    c.setFont("Arial-Bold", 7.5)
    c.drawString(MARGIN + 18, 160, "THE CENTRAL REFRAME")
    reframe = style("reframe", "Arial-Bold", 14, 18, WHITE)
    paragraph(c, "Design the decision, context, controls and human gate before choosing the agent.", MARGIN + 18, 145, PAGE_W - 2 * MARGIN - 36, reframe, 52)

    c.setFillColor(INK)
    c.setFont("Georgia-Italic", 9.5)
    c.drawString(MARGIN, 76, "Yorik Tisseau")
    c.setFillColor(STEEL_LIGHT)
    c.setFont("Arial", 7)
    c.drawString(MARGIN, 62, "Founder, Ignis Leadership  |  Bid transformation adviser")
    page_footer(c)
    c.showPage()


def architecture_page(c):
    page_header(c, 3, "THE ARCHITECTURE")
    c.setFillColor(ACCENT)
    c.setFont("Arial-Bold", 8)
    c.drawString(MARGIN, PAGE_H - 84, "THE OPERATING MODEL")
    heading = style("architecture-heading", "Arial-Bold", 27, 29.5, INK)
    paragraph(c, "The architecture of an AI-augmented bid practice", MARGIN, PAGE_H - 108, 455, heading, 85)
    intro = style("architecture-intro", "Georgia", 10.5, 15.5, STEEL)
    paragraph(c, "The six elements form one governed loop. Agents prepare and coordinate. People direct, challenge, decide and approve.", MARGIN, PAGE_H - 177, 475, intro, 55)

    draw_architecture(c, MARGIN, 286, PAGE_W - 2 * MARGIN, 334, compact=False)

    notes = [
        ("1", "Start with the outcome", "Name the decision, acceptance criteria and commercial value before discussing a tool."),
        ("2", "Make the boundaries explicit", "Define authorised context, the agent's bounded role, evaluation and exception handling."),
        ("3", "Keep authority human-led", "Use decision gates and recorded learning so greater capacity does not weaken accountability."),
    ]
    gap = 10
    col_w = (PAGE_W - 2 * MARGIN - gap * 2) / 3
    for i, (n, title, text) in enumerate(notes):
        x = MARGIN + i * (col_w + gap)
        c.setFillColor(WHITE)
        c.setStrokeColor(LINE)
        c.roundRect(x, 86, col_w, 172, 6, fill=1, stroke=1)
        c.setFillColor(ACCENT)
        c.setFont("Arial-Bold", 8)
        c.drawString(x + 15, 232, n)
        title_style = style(f"architecture-note-{n}", "Arial-Bold", 10, 12, INK)
        paragraph(c, title, x + 15, 214, col_w - 30, title_style, 45)
        paragraph(c, text, x + 15, 170, col_w - 30, SMALL, 78)

    page_footer(c)
    c.showPage()


AREAS = [
    {
        "number": "01",
        "title": "Business outcome",
        "why": "Keeps AI work tied to a consequential bid or business decision, not a general ambition to automate.",
        "questions": [
            "The workflow begins with a named business or bid decision, not a general ambition to use AI or save time.",
            "The accountable people agree what a useful output must contain and what would make it unsafe or misleading.",
        ],
        "challenge": "Which consequential decision should this work make easier to reach?",
    },
    {
        "number": "02",
        "title": "Trusted context",
        "why": "Gives the workflow current, authorised evidence and prevents confident outputs from resting on the wrong material.",
        "questions": [
            "The required tender, customer, commercial, technical and organisational sources are identified, current and available.",
            "The workflow distinguishes approved evidence from stale, unverified, confidential or other-customer material.",
        ],
        "challenge": "Could a reviewer trace every important output to an authorised source?",
    },
    {
        "number": "03",
        "title": "Agents, tools and roles",
        "why": "Turns a vague request to 'use AI' into a bounded contribution with clear ownership and operating limits.",
        "questions": [
            "The agent contribution is bounded and specific: retrieving, comparing, checking, structuring or routing work.",
            "A named person directs the work, resolves exceptions and decides whether the output is used.",
        ],
        "challenge": "Is the agent's job clear enough without saying 'help with the bid'?",
    },
    {
        "number": "04",
        "title": "Evaluation and refinement",
        "why": "Makes failure detectable before it affects the pursuit, and creates a disciplined route to improve the workflow.",
        "questions": [
            "The team can test accuracy, completeness, source use and omissions against a human-reviewed example or baseline.",
            "The workflow defines what happens when evidence is uncertain, sources conflict or the agent fails.",
        ],
        "challenge": "How will you know it is wrong before it affects the pursuit?",
    },
    {
        "number": "05",
        "title": "Human decision gates",
        "why": "Preserves clear accountability for the choices that shape commercial risk, delivery commitments and submission.",
        "questions": [
            "Named people retain authority for qualification, strategy, commitments, risk acceptance and submission.",
            "Each gate states what evidence is required, who approves and how the decision is recorded.",
        ],
        "challenge": "Who can say yes, no or not yet?",
    },
    {
        "number": "06",
        "title": "Measurement and learning",
        "why": "Tests whether the workflow improves decisions and capacity, then carries approved learning safely into the next bid.",
        "questions": [
            "The test measures more than speed: rework, waiting, omissions, corrections and whether decisions happen earlier.",
            "Approved learning can improve the next pursuit without allowing prior answers or assumptions to become truth.",
        ],
        "challenge": "What could this bid teach the system that the next team can use safely?",
    },
]


def draw_scale(c, x, y, start_number, width):
    c.setFillColor(STEEL_LIGHT)
    c.setFont("Arial", 6.5)
    c.drawString(x, y + 2, "MARK ONE")
    labels = ["Visible", "Partial", "Unclear"]
    lx = x + 64
    for label in labels:
        c.setFillColor(WHITE)
        c.setStrokeColor(BLUE_LINE)
        c.rect(lx, y - 1, 9, 9, fill=1, stroke=1)
        c.setFillColor(STEEL)
        c.setFont("Arial", 6.8)
        c.drawString(lx + 14, y + 1, label)
        lx += 72


def draw_area(c, area, x, y_top, width, height, first_question_number):
    c.setFillColor(WHITE)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.7)
    c.roundRect(x, y_top - height, width, height, 7, fill=1, stroke=1)

    c.setFillColor(ACCENT)
    c.circle(x + 26, y_top - 28, 13, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Arial-Bold", 8)
    c.drawCentredString(x + 26, y_top - 31, area["number"])
    c.setFillColor(ACCENT)
    c.setFont("Arial-Bold", 6.8)
    c.drawString(x + 48, y_top - 20, "DIAGNOSTIC AREA")
    c.setFillColor(INK)
    c.setFont("Arial-Bold", 16)
    c.drawString(x + 48, y_top - 39, area["title"])

    why_style = style(f"why-{area['number']}", "Georgia", 8.2, 11.5, STEEL)
    paragraph(c, area["why"], x + 20, y_top - 59, width - 40, why_style, 42)

    q_y = y_top - 106
    for i, q in enumerate(area["questions"]):
        q_num = first_question_number + i
        c.setFillColor(TINT)
        c.setStrokeColor(LINE)
        c.roundRect(x + 20, q_y - 65, width - 40, 62, 4, fill=1, stroke=1)
        c.setFillColor(ACCENT)
        c.setFont("Arial-Bold", 8)
        c.drawString(x + 31, q_y - 18, str(q_num))
        q_style = style(f"q-{q_num}", "Arial", 7.6, 10.3, INK)
        paragraph(c, q, x + 49, q_y - 10, width - 89, q_style, 37)
        draw_scale(c, x + 31, q_y - 55, q_num, width - 62)
        q_y -= 72

    c.setFillColor(TINT_2)
    c.setStrokeColor(BLUE_LINE)
    c.roundRect(x + 20, y_top - height + 18, width - 40, 43, 4, fill=1, stroke=1)
    c.setFillColor(ACCENT)
    c.setFont("Arial-Bold", 6.4)
    c.drawString(x + 31, y_top - height + 45, "CHALLENGE QUESTION")
    challenge_style = style(f"challenge-{area['number']}", "Arial-Bold", 8.2, 10.5, ACCENT)
    paragraph(c, area["challenge"], x + 31, y_top - height + 39, width - 62, challenge_style, 30)


def diagnostic_page(c, page_no, area_a, area_b, first_question_number):
    page_header(c, page_no, "12-QUESTION DIAGNOSTIC")
    c.setFillColor(ACCENT)
    c.setFont("Arial-Bold", 8)
    c.drawString(MARGIN, PAGE_H - 82, f"AREAS {area_a['number']} AND {area_b['number']} OF 06")
    heading = style(f"diagnostic-heading-{page_no}", "Arial-Bold", 24, 27, INK)
    paragraph(c, "Assess what is visible in one real workflow.", MARGIN, PAGE_H - 104, 430, heading, 60)

    area_h = 300
    draw_area(c, area_a, MARGIN, PAGE_H - 165, PAGE_W - 2 * MARGIN, area_h, first_question_number)
    draw_area(c, area_b, MARGIN, PAGE_H - 479, PAGE_W - 2 * MARGIN, area_h, first_question_number + 2)

    footer_message = "Mark Visible, Partial or Unclear. Note the evidence behind each answer."
    if page_no == 6:
        footer_message = "Use the pattern to choose one controlled workflow test. Discuss it at ignisleadership.com."
    page_footer(c, footer_message)
    c.showPage()


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=A4)
    c.setTitle("How to build an AI-augmented bid practice")
    c.setSubject("A practical AI bid management guide with a governed architecture and 12-question diagnostic")
    c.setAuthor("Yorik Tisseau, Ignis Leadership")
    c.setCreator("Ignis Leadership")
    c.setKeywords("AI bid management, AI-augmented bid practice, AI agents for bid management, human decision gates")

    cover(c)
    foreword(c)
    architecture_page(c)
    diagnostic_page(c, 4, AREAS[0], AREAS[1], 1)
    diagnostic_page(c, 5, AREAS[2], AREAS[3], 5)
    diagnostic_page(c, 6, AREAS[4], AREAS[5], 9)
    c.save()


if __name__ == "__main__":
    build()
