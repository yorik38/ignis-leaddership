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
    flex-wrap: wrap !important;
    justify-content: center !important;
    gap: 8px 14px !important;
    padding-bottom: 12px !important;
    overflow: hidden !important;
  }
  .tsl-av {
    width: 64px !important;
    flex: 0 0 64px !important;
  }
  .tsl-av-ring {
    width: 44px !important;
    height: 44px !important;
  }
  .tcard-body {
    overflow: hidden !important;
  }
}
</style>"""

js_to_remove = """        
        // Auto-scroll the container so the active avatar is centered
        if (window.innerWidth <= 620) {
          const container = av.closest('.tcard-avatars');
          if (container) {
            const scrollPos = av.offsetLeft - container.offsetLeft - (container.clientWidth / 2) + (av.clientWidth / 2);
            container.scrollTo({ left: scrollPos, behavior: 'smooth' });
          }
        }"""

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Revert CSS
    content = re.sub(r'/\* ── AVATAR CAROUSEL OVERRIDE \(DESKTOP & MOBILE\) ── \*/.*?</style>', css_patch, content, flags=re.DOTALL)
    
    # Revert JS
    content = content.replace(js_to_remove, "")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Reverted to 2 rows.")
