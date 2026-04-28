# Your Breakthrough Assessment - Complete Specification

## Overview
A single-page assessment tool that guides leaders through a 2-minute diagnostic to reveal their core leadership challenge, its cost, and their path forward. The experience prioritises clarity, one-step-at-a-time progression, and emotional resonance to convert respondents into full report + call bookers.

---

## User Journey Map

```
Landing Page
   ↓ (CTA: "Take Your Free Breakthrough")
Assessment Flow (1 question at a time, auto-advance)
   ↓
[Hidden] Click Button: "See My Results"
   ↓
Preliminary Results + Email Capture (combined section)
   ↓ (CTA: "Get My Full Report")
Confirmation Screen (report sent + book call)
   ↓ (CTA: "Book Your Discovery Call")
External Calendly Link
```

---

## Section 1: Landing Page

### Purpose
Establish credibility, mirror the prospect's pain, show the path forward, and create desire to take the assessment.

### Layout & Content Flow

**Header Section**
- Logo/Brand (Ignis Leadership)
- Navigation: "Your Breakthrough" (linked to this page), other nav items

**Hero Section**
- Headline: "Discover What's Really Holding You Back" (or variant)
- Subheading: Mirror their struggle: "You're a capable leader, but something's stopping you from the impact and ease you know you deserve."
- Badge: "Free. 2 minutes. Instant results."
- CTA Button: "Take Your Free Breakthrough" (primary, prominent)

**Problem Recognition Section** (scroll down)
- Headline: "Does this sound like you?"
- 3-4 short problem scenarios (card format):
  1. **High-stakes decision anxiety** - "You make great calls 9 times out of 10, but that 1 time haunts you. So now you over-analyse, delay, doubt yourself."
  2. **Executive burnout** - "You're running on fumes. Delivering results, but sacrificing wellbeing. The pace isn't sustainable."
  3. **Imposter syndrome** - "You've got the title, but do you deserve it? That voice of doubt never fully goes away."
  4. **Leadership blind spot** - "You know something isn't working, but you can't quite see what it is. Your team's frustrated. You're frustrated."

**What You'll Discover Section**
- Headline: "Your assessment reveals..."
- 4 Result boxes (show what they get):
  1. **Your Core Pattern** - "What's really driving your challenge (it's usually not what you think)"
  2. **The Real Cost** - "What this pattern is costing you in time, energy, and opportunity"
  3. **Your Contradiction** - "The hidden paradox that keeps you stuck"
  4. **Your Path Forward** - "What's possible in the next 30 days if you shift"

**Social Proof Section** (optional, if you have testimonials)
- 2-3 short testimonials from leaders who took the assessment
- Quote + name + role

**Final CTA Section**
- Repeat: "Take Your Free Breakthrough" button
- Subtext: "Free. No sign-up required. 2 minutes. Instant insights."

---

## Section 2: Assessment Flow

### Core Principle
**One question at a time. Auto-advance to next question. No back button (commitment device).**

### Progress Indicator
- Slim progress bar at top (visual, non-intrusive)
- "Question X of 12" label above each question
- Show % progress (8%, 16%, 25%, etc.)

### Question Set & Logic

**Q1: Which of these describe you?** *(Multi-select, up to 3)*
```
Which of these describe your leadership challenge right now?
(Select up to 3)

Options:
□ High-stakes decision making (fear of getting it wrong)
□ Executive burnout (running on fumes)
□ Imposter syndrome (not sure you deserve the role)
□ Perfectionism & procrastination (stuck before you start)
□ Performance blocks (losing confidence when it matters)
□ Identity clarity (who am I as a leader?)

Counter: "X of 3 selected"

CTA: "Continue →" button (manual click required—max of 3 selections prevents further additions)
```

**Q2: How intensely is this affecting your impact?** *(Slider, 1-10)*
```
How intensely is this affecting your impact?

Slider: [===●====]
Range: "Manageable" ← → "Severe"
Display value: 5

Auto-advance: On any slider change
```

**Q3: What stops you most?** *(Radio, single choice)*
```
What stops you most right now?

○ Fear of failure vs. need to succeed
○ Perfectionism vs. moving forward
○ Self-doubt vs. high ambition
○ Care for others vs. own boundaries
○ Need for control vs. trusting others

Auto-advance: On selection
```

**Q4: How long have you been dealing with this?** *(Radio, single choice)*
```
How long have you been dealing with this?

○ Less than 6 months
○ 6 months to 2 years
○ 2 to 5 years
○ More than 5 years (it's chronic)

Auto-advance: On selection
```

**Q5: How reactive are your decisions under pressure?** *(Slider, 1-10)*
```
How reactive are your decisions under pressure?

Slider: [===●====]
Range: "Very Intentional" ← → "Highly Reactive"
Display value: 5

Auto-advance: On any slider change
```

**Q6: Who do you discuss these challenges with?** *(Radio, single choice)*
```
Who do you discuss these challenges with?

○ Nobody (keep it internal)
○ Close friends or family
○ Peers in my leadership circle
○ A mentor or coach

Auto-advance: On selection
```

**Q7: How clear are you on what needs to change?** *(Slider, 1-10)*
```
How clear are you on what needs to change?

Slider: [===●====]
Range: "Completely Lost" ← → "Crystal Clear"
Display value: 5

Auto-advance: On any slider change
```

**Q8: What would solving this enable?** *(Radio, single choice)*
```
What would solving this enable?

○ Confidence & authentic presence
○ Faster, clearer decisions
○ Better team performance & trust
○ Better work-life balance
○ Career growth & opportunity

Auto-advance: On selection
```

**Q9: What does success look like for you?** *(Radio, single choice)*
```
What does success look like for you?

○ Time freedom & breathing room
○ Inner peace & ease
○ True leadership & influence
○ Broader impact on others
○ Complete clarity on identity & direction

Auto-advance: On selection
```

**Q10: When do you want this sorted?** *(Radio, single choice)*
```
When do you want this sorted?

○ Ready to get support now
○ Next 30 days
○ Next 3 months
○ Next 6 months
○ Just exploring for now

Auto-advance: On selection
```

**Q11: What would clarity mean for you?** *(Optional text input)*
```
What would clarity mean for you?

[Free-form textarea - optional]

CTA: "Continue →" button (they can skip or write)
```

**Q12: Tell us about you** *(Two multi-part questions)*
```
What's your role?

○ Founder
○ Director / VP
○ Senior Manager

How did you find us?

○ Google
○ Facebook
○ Instagram
○ YouTube
○ LinkedIn
○ Our website
○ Referral / word of mouth

CTA: "See My Results" button (reveals preliminary results below, no modal)
```

---

## Section 3: Preliminary Results + Email Capture (Combined)

### Purpose
1. **Results Section**: Deliver immediate value. Make them feel deeply understood. Give one key insight that reframes their challenge.
2. **Email Section**: Build trust. Create desire for full report. Capture email for delivery.

### Layout

**Results Header**
- Headline: "Your Breakthrough Diagnostic"
- Subheading: "Here's what we found."

**Trust-Building Introduction** (builds credibility)
```
Over 50+ leaders have discovered their breakthrough pattern through this
diagnostic. Using principles from neuroscience and behavioural psychology,
we've equipped them to shift their identity and reclaim their impact.

Your preliminary results are below. Your full 6-page personalised report
(with actionable roadmap) is yours to download when you share your email.
```

**Single Results Card** (NOT 4 cards—just one rich portrait)
- **Label**: "Your Core Pattern"
- **Content**: A 1-2 paragraph portrait that combines:
  1. Their role + primary challenge (from Q1)
  2. The contradiction they're trapped in (from Q3)
  3. The cost to them (implied from Q2 + Q5)
  4. A reframe that shows them something they hadn't seen

  **Example:**
  ```
  As a Director dealing with perfectionism & procrastination, your core
  challenge is the tension between your high standards and your fear of
  falling short. You're caught between "I need to get this right" and
  "what if I can't?" So you delay, over-prepare, and second-guess yourself.

  This isn't about discipline or willpower—it's about your identity being
  tied to flawlessness. The path forward isn't achieving perfection. It's
  redefining what success means, so you can move with confidence even when
  outcomes are uncertain.
  ```

**Visual Element** (optional)
- A subtle graphic showing their contradiction (e.g., two opposing arrows)
- Or a key stat related to their score (e.g., "You rated your reactivity at 8/10—that's costing you roughly 6-8 weeks per year in lost focus")

---

**Email Capture Section** (scroll down or clear visual separation)

**Title**: "Get Your Full 6-Page Report"

**Subheading**: "Personalised insights + your 90-day roadmap to breakthrough"

**Form Fields**
- Name (text input) - required
- Email (email input) - required

**Urgency Message** (subtle, honest)
```
Only 2 discovery call spots available this month.
Your report will include your booking link.
```

**Submit Button**
- CTA: "Get My Full Report"

**Trust Signal** (small print)
- "No spam. No obligations. Unsubscribe anytime."

---

## Section 4: Confirmation Screen

### Purpose
Reinforce their decision. Set expectations. Drive them to book a call.

### Layout

**Header**
- Icon: ✓ (check mark or success icon)

**Headline**: "Your Report is on the Way"

**Main Message**:
```
We've sent your full 6-page Breakthrough Diagnostic to [email].
Check within 60 seconds—it includes:

✓ Your Core Pattern (what's really driving your challenge)
✓ The Real Cost (what it's costing you)
✓ Your Path Forward (actionable steps for the next 30 days)
✓ Your Discovery Call Booking Link
```

**Trust + Urgency Section** (before CTA)
```
This month, we're working with only a handful of leaders through
our intensive Breakthrough Programme. Most spots fill quickly.

Your booking link is in the email—claim your spot while it's available.
```

**Primary CTA Button**
- Text: "Book Your Discovery Call"
- Links to: [Your Calendly URL]
- Opens in: New tab

**Secondary Message** (small print)
```
Didn't receive your email? Check spam or refresh in 60 seconds.
Questions? Reply to the email from our team.
```

---

## Technical Flow Summary

### State Management
```
Screen Flow:
1. Landing Page (initial load)
2. Assessment Q1 → auto-advance
3. Assessment Q2 → auto-advance
4. ... (continue through Q12)
5. Preliminary Results → click "Get Full Report"
6. Email Modal (opens)
7. Email Submitted → Confirmation
8. Confirmation → Link to external booking
```

### Data Captured
```
Assessment Answers:
- q1: array of selected values
- q2: slider value (1-10)
- q3: single value
- q4: single value
- q5: slider value (1-10)
- q6: single value
- q7: slider value (1-10)
- q8: single value
- q9: single value
- q10: single value
- q11: optional text
- s1 (role): single value
- s2 (source): single value

Email Capture:
- name: string
- email: string
- timestamp: ISO datetime

Payload sent to: [GHL webhook endpoint or external API]
```

### Auto-Advance Logic
- **Multi-select (Q1)**: Manual "Continue →" button required (max of 3 selections prevents auto-advance)
- **Radio buttons (Q3, Q4, Q6, Q8, Q9, Q10)**: Auto-advance on click
- **Sliders (Q2, Q5, Q7)**: Auto-advance on change
- **Text input (Q11)**: Manual "Continue →" button click required (optional field)
- **Multi-part (Q12)**: Manual "See My Results" button click required
- **Results reveal**: Results scroll into view or display below Q12 (no modal)

---

## CTA Messaging Throughout

| Screen | CTA Text | Purpose |
|--------|----------|---------|
| Landing | "Take Your Free Breakthrough" | Entry point—emphasise free, no sign-up, instant |
| Q1 | "Continue →" | Manual advance (multi-select up to 3) |
| Q2-Q10 | Auto-advance | Keeps momentum with sliders & radio buttons |
| Q11 | "Continue →" | Optional field, manual advance |
| Q12 | "See My Results" | Reveal results section below |
| Results + Email | "Get My Full Report" | Capture lead with email |
| Confirmation | "Book Your Discovery Call" | External Calendly conversion |

---

## Design Principles

1. **Clarity over cleverness** - Every question should be instantly understandable
2. **Progress visibility** - User always knows where they are
3. **No friction** - One question at a time, auto-advance where possible
4. **Emotional resonance** - Mirror their pain, offer hope
5. **Momentum** - Build engagement from landing → results → email → booking
6. **Mobile-first** - Works beautifully on phone (no side-scrolling, clear touch targets)

---

## Success Metrics

- Landing → Assessment start: % click-through
- Assessment completion rate: % who reach results screen
- Results → Email capture: % who submit email
- Email → Booking: % who click external booking link
- Time on assessment: target 2-2.5 minutes
- Device breakdown: % mobile vs. desktop

---

## Next Steps

1. **Review & approve** this specification
2. **Adjust questions or copy** as needed
3. **Build HTML/CSS/JS** file with:
   - Landing page section
   - 12 assessment questions (one at a time)
   - Preliminary results screen
   - Email capture modal
   - Confirmation screen
4. **Connect webhook** for email submission
5. **Test across devices** (mobile, tablet, desktop)
6. **Set up analytics** (Google Analytics + Meta Pixel tracking)
