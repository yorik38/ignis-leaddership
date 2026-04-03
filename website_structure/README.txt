This bundle keeps all original HTML file names the same and adds a shared assets folder.

Paste these files into your repo root.
Do not rename the HTML files.
Also copy the assets/ folder, because navbar, mobile menu, footer, and shared hero behaviour now live there.

Structure:
- about.html
- index.html
- ...other HTML files
- assets/shared.css
- assets/shared.js

Result:
- future edits to shared navbar/menu/footer/mobile hero behaviour can be made once in assets/shared.css or assets/shared.js
- page-specific content and page-specific CSS remain inside each HTML file
