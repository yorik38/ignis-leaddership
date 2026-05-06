import glob

files_to_patch = [
    "/Users/yoriktisseau/Desktop/websites/ignis leadership/website_structure/index.html",
    "/Users/yoriktisseau/Desktop/websites/ignis leadership/website_structure/about.html"
]

css_patch = """
/* ── AVATAR CAROUSEL MOBILE OVERRIDE ── */
@media (max-width: 620px) {
  .tcard-avatars {
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    justify-content: flex-start !important;
    gap: 16px !important;
    padding-bottom: 24px !important;
    padding-right: 24px !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
  }
  .tcard-avatars::-webkit-scrollbar {
    display: none !important;
  }
  .tsl-av {
    flex: 0 0 auto !important;
    min-width: 64px !important;
  }
  .tcard-body {
    overflow: hidden !important;
  }
}
</style>"""

for file in files_to_patch:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "/* ── AVATAR CAROUSEL MOBILE OVERRIDE ── */" not in content:
        content = content.replace("</style>", css_patch)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched {file}")
    else:
        print(f"Already patched {file}")
