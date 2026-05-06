import re

files = [
    "/Users/yoriktisseau/Desktop/websites/ignis leadership/website_structure/index.html",
    "/Users/yoriktisseau/Desktop/websites/ignis leadership/website_structure/about.html"
]

css_patch = """
/* ── AVATAR CAROUSEL OVERRIDE (DESKTOP & MOBILE) ── */
.tsl-av {
  width: 72px !important;
  flex: 0 0 72px !important;
}

@media (max-width: 620px) {
  .tcard-avatars {
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    justify-content: flex-start !important;
    gap: 16px !important;
    padding-bottom: 24px !important;
    padding-right: 24px !important;
    padding-left: 12px !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
    scroll-behavior: smooth !important;
  }
  .tcard-avatars::-webkit-scrollbar {
    display: none !important;
  }
  .tcard-body {
    overflow: hidden !important;
  }
}
</style>"""

js_scroll_code = """
      if (isActive) {
        const ringImg = av.querySelector('.tsl-av-ring img');
        if (ringImg) ringImg.style.removeProperty('opacity');
        
        // Auto-scroll the container so the active avatar is centered
        if (window.innerWidth <= 620) {
          const container = av.closest('.tcard-avatars');
          if (container) {
            const scrollPos = av.offsetLeft - container.offsetLeft - (container.clientWidth / 2) + (av.clientWidth / 2);
            container.scrollTo({ left: scrollPos, behavior: 'smooth' });
          }
        }
      }"""

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace old CSS patch
    content = re.sub(r'/\* ── AVATAR CAROUSEL MOBILE OVERRIDE ── \*/.*?</style>', css_patch, content, flags=re.DOTALL)
    
    # Inject JS if not already present
    if "Auto-scroll the container" not in content:
        # We need to replace the specific block in setTestimonial
        old_js = """      if (isActive) {
        const ringImg = av.querySelector('.tsl-av-ring img');
        if (ringImg) ringImg.style.removeProperty('opacity');
      }"""
        if old_js in content:
            content = content.replace(old_js, js_scroll_code)
        else:
            # Maybe the formatting is slightly different
            old_js_2 = """      if (isActive) {\n        const ringImg = av.querySelector('.tsl-av-ring img');\n        if (ringImg) ringImg.style.removeProperty('opacity');\n      }"""
            content = content.replace(old_js_2, js_scroll_code)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Avatars fixed!")
