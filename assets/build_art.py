# Generates original product and scene art for the A2Z Printing storefront.
from pathlib import Path

OUT = Path(__file__).parent / "art"
OUT.mkdir(exist_ok=True)

NAVY = "#1d2b86"
ORANGE = "#e4572a"
INK = "#1a1430"
CREAM = "#f6f1e8"


def save(name, body, w=800, h=560):
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
<defs>
  <filter id="sh" x="-30%" y="-30%" width="160%" height="160%">
    <feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#1a1330" flood-opacity="0.16"/>
  </filter>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fbf7f2"/>
    <stop offset="1" stop-color="#f3ece3"/>
  </linearGradient>
</defs>
<rect width="{w}" height="{h}" fill="url(#bg)"/>
{body}
</svg>'''
    (OUT / name).write_text(svg, encoding="utf-8")


def sheet(x, y, w, h, title, lines=4, dark=False):
    head = NAVY if not dark else "#123"
    body = ORANGE
    rows = ""
    for i in range(lines):
        yy = y + 78 + i * 16
        rows += f'<rect x="{x+18}" y="{yy}" width="{w - 36 - (i % 3) * 18}" height="6" rx="3" fill="#fff" opacity=".85"/>'
    return f'''
    <g filter="url(#sh)">
      <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="#fff"/>
      <rect x="{x}" y="{y}" width="{w}" height="52" rx="6" fill="{head}"/>
      <rect x="{x}" y="{y+40}" width="{w}" height="14" fill="{head}"/>
      <text x="{x+w/2}" y="{y+33}" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#fff">{title}</text>
      <rect x="{x}" y="{y+54}" width="{w}" height="{h-54}" fill="{body}"/>
      {rows}
    </g>'''


# Categories and products
save("a-frame.svg", f'''
  <g filter="url(#sh)" transform="translate(250,70)">
    <polygon points="150,20 270,150 30,150" fill="#2b2b2b"/>
    <rect x="78" y="118" width="144" height="250" fill="#f4f4f4" stroke="#222" stroke-width="8"/>
    <rect x="92" y="150" width="116" height="36" fill="{NAVY}"/>
    <text x="150" y="174" text-anchor="middle" font-family="Arial" font-size="13" font-weight="700" fill="#fff">A-FRAME</text>
    <rect x="92" y="186" width="116" height="150" fill="{ORANGE}"/>
    <text x="150" y="270" text-anchor="middle" font-family="Arial" font-size="32" font-weight="800" fill="#fff">SALE</text>
    <rect x="70" y="360" width="160" height="10" rx="2" fill="#222"/>
  </g>
''')

save("flyers.svg", sheet(250, 80, 300, 400, "A2Z  FLYERS", 8))

save("poster.svg", f'''
  <g filter="url(#sh)">
    <rect x="270" y="40" width="260" height="470" rx="4" fill="#fff"/>
    <rect x="270" y="40" width="260" height="70" fill="{NAVY}"/>
    <text x="400" y="82" text-anchor="middle" font-family="Arial" font-size="16" font-weight="700" fill="#fff">A2Z</text>
    <rect x="270" y="110" width="260" height="400" fill="{ORANGE}"/>
    <text x="400" y="250" text-anchor="middle" font-family="Arial" font-size="28" font-weight="800" fill="#fff">SYNTHETIC</text>
    <text x="400" y="286" text-anchor="middle" font-family="Arial" font-size="28" font-weight="800" fill="#fff">POSTER</text>
    <rect x="310" y="330" width="180" height="6" rx="3" fill="#fff" opacity=".8"/>
    <rect x="330" y="348" width="140" height="6" rx="3" fill="#fff" opacity=".8"/>
    <rect x="350" y="366" width="100" height="6" rx="3" fill="#fff" opacity=".8"/>
  </g>
''')

save("signage.svg", f'''
  <rect width="800" height="560" fill="#1b2430"/>
  <rect x="0" y="390" width="800" height="170" fill="#121820"/>
  <rect x="80" y="70" width="640" height="300" rx="8" fill="#243140"/>
  <circle cx="250" cy="210" r="70" fill="none" stroke="#f2efe6" stroke-width="8"/>
  <path d="M220 230 q30 -70 60 0" fill="none" stroke="#f2efe6" stroke-width="8"/>
  <ellipse cx="250" cy="250" rx="28" ry="10" fill="#f2efe6"/>
  <text x="470" y="200" font-family="Georgia, serif" font-size="42" fill="#f6f1e6">DAILY CUP</text>
  <text x="470" y="236" font-family="Arial" font-size="16" fill="#e7d7bf" letter-spacing="4">COFFEE  ·  BAKERY</text>
  <rect x="120" y="430" width="560" height="16" fill="#e4572a" opacity=".85"/>
''')

save("mural.svg", f'''
  {sheet(160, 90, 480, 360, "A2Z   FOAM  PVC", 7)}
  <text x="400" y="250" text-anchor="middle" font-family="Arial" font-size="22" font-weight="700" fill="#fff">WALL  GRAPHICS</text>
''')

save("stickers.svg", f'''
  <g filter="url(#sh)">
    <rect x="140" y="50" width="520" height="460" rx="18" fill="#f7f7f5" transform="rotate(-6 400 280)"/>
  </g>
  <g>
    {''.join(
        f'<g transform="translate({170 + (i%4)*130},{110 + (i//4)*130})">'
        f'<circle cx="48" cy="48" r="46" fill="#1f8f86"/>'
        f'<circle cx="48" cy="48" r="30" fill="none" stroke="#fff" stroke-width="4"/>'
        f'<text x="48" y="54" text-anchor="middle" font-family="Arial" font-size="14" font-weight="700" fill="#fff">A2Z</text>'
        f'</g>'
        for i in range(12)
    )}
  </g>
''')

save("rigid.svg", sheet(230, 70, 340, 420, "A2Z  RIGID", 8))

save("vinyl.svg", f'''
  <rect x="180" y="40" width="440" height="480" fill="#d9e2ea"/>
  <rect x="210" y="70" width="180" height="420" fill="#c5d0da"/>
  <rect x="400" y="70" width="190" height="420" fill="#b7c6d2"/>
  <g filter="url(#sh)">
    <rect x="250" y="120" width="300" height="320" fill="{ORANGE}"/>
    <rect x="250" y="120" width="300" height="54" fill="{NAVY}"/>
    <text x="400" y="154" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700" fill="#fff">CLEAR VINYL</text>
    <rect x="280" y="210" width="240" height="8" rx="4" fill="#fff" opacity=".9"/>
    <rect x="300" y="232" width="200" height="8" rx="4" fill="#fff" opacity=".75"/>
    <rect x="320" y="254" width="160" height="8" rx="4" fill="#fff" opacity=".75"/>
  </g>
''')

save("cards.svg", f'''
  <rect width="800" height="560" fill="#1d3f73"/>
  <path d="M0 0 L800 0 L800 560 L0 560 Z" fill="#16325c"/>
  <path d="M520 0 L800 0 L800 280 Z" fill="#c4a46a" opacity=".9"/>
  <g filter="url(#sh)">
    <rect x="90" y="70" width="430" height="240" rx="14" fill="#102848"/>
    <circle cx="150" cy="150" r="28" fill="#d7b56a"/>
    <text x="210" y="146" font-family="Arial" font-size="20" font-weight="700" fill="#f4efe4" letter-spacing="3">COMPANY</text>
    <text x="210" y="176" font-family="Arial" font-size="20" font-weight="700" fill="#d7b56a" letter-spacing="6">LOGO</text>
  </g>
  <g filter="url(#sh)">
    <rect x="300" y="250" width="430" height="240" rx="14" fill="#0e2240"/>
    <text x="340" y="320" font-family="Arial" font-size="16" fill="#f4efe4">ALEX MORGAN</text>
    <text x="340" y="346" font-family="Arial" font-size="13" fill="#d7b56a">PRINT PRODUCER</text>
    <text x="340" y="400" font-family="Arial" font-size="13" fill="#d5deea">08 6288 5285</text>
    <text x="340" y="424" font-family="Arial" font-size="13" fill="#d5deea">hello@a2zprinting.com.au</text>
  </g>
''')

save("booklet.svg", f'''
  <g filter="url(#sh)">
    <path d="M90 80 H390 Q400 80 400 90 V470 Q400 480 390 480 H90 Z" fill="#fff"/>
    <path d="M710 80 H410 Q400 80 400 90 V470 Q400 480 410 480 H710 Z" fill="#f7f4ef"/>
    <rect x="120" y="110" width="240" height="150" fill="{ORANGE}"/>
    <circle cx="200" cy="175" r="28" fill="#f6e2c4"/>
    <rect x="240" y="150" width="90" height="8" fill="#fff"/>
    <rect x="240" y="168" width="70" height="8" fill="#fff" opacity=".8"/>
    <rect x="120" y="290" width="220" height="8" fill="#ddd"/>
    <rect x="120" y="312" width="200" height="8" fill="#eee"/>
    <rect x="120" y="334" width="180" height="8" fill="#eee"/>
    <text x="450" y="160" font-family="Georgia, serif" font-size="28" fill="{INK}">Lookbook</text>
    <rect x="450" y="190" width="200" height="8" fill="#ddd"/>
    <rect x="450" y="214" width="180" height="8" fill="#eee"/>
    <rect x="450" y="238" width="160" height="8" fill="#eee"/>
    <rect x="450" y="280" width="180" height="120" rx="6" fill="{NAVY}"/>
  </g>
''')

save("banner.svg", f'''
  <rect x="70" y="150" width="16" height="300" fill="#555"/>
  <rect x="714" y="150" width="16" height="300" fill="#555"/>
  <g filter="url(#sh)">
    <rect x="86" y="120" width="628" height="250" fill="{ORANGE}"/>
    <rect x="86" y="120" width="628" height="56" fill="{NAVY}"/>
    <text x="400" y="156" text-anchor="middle" font-family="Arial" font-size="22" font-weight="700" fill="#fff">A2Z   PVC BANNER</text>
    <text x="400" y="250" text-anchor="middle" font-family="Arial" font-size="34" font-weight="800" fill="#fff">OPEN  TODAY</text>
    <rect x="250" y="280" width="300" height="8" rx="4" fill="#fff" opacity=".8"/>
  </g>
  <rect x="40" y="450" width="720" height="20" fill="#ded6cc"/>
''')

save("floor.svg", f'''
  <rect width="800" height="560" fill="#f3f3f1"/>
  <circle cx="400" cy="280" r="180" fill="none" stroke="{NAVY}" stroke-width="10"/>
  <circle cx="400" cy="280" r="150" fill="{ORANGE}"/>
  <text x="400" y="250" text-anchor="middle" font-family="Arial" font-size="22" font-weight="700" fill="#fff">A2Z</text>
  <text x="400" y="292" text-anchor="middle" font-family="Arial" font-size="28" font-weight="800" fill="#fff">FLOOR</text>
  <text x="400" y="326" text-anchor="middle" font-family="Arial" font-size="22" font-weight="700" fill="#fff">GRAPHICS</text>
''')

save("corflute.svg", f'''
  <g filter="url(#sh)">
    <rect x="120" y="80" width="560" height="400" rx="4" fill="#d7e4ea"/>
    <rect x="120" y="80" width="560" height="230" fill="#b9d4c6"/>
    <circle cx="220" cy="170" r="40" fill="#f4e2b0"/>
    <polygon points="300,310 380,180 470,310" fill="#2f6b45"/>
    <polygon points="420,310 520,150 640,310" fill="#245438"/>
    <rect x="120" y="300" width="560" height="180" fill="#e7efe8"/>
    <text x="160" y="420" font-family="Arial" font-size="28" font-weight="800" fill="{NAVY}">CORFLUTE</text>
    <text x="160" y="452" font-family="Arial" font-size="16" fill="{INK}">Outdoor board print</text>
  </g>
''')

save("backlit.svg", f'''
  <rect x="300" y="40" width="200" height="470" rx="8" fill="#1c1c1c"/>
  <rect x="316" y="56" width="168" height="420" fill="#123028"/>
  <polygon points="340,360 400,180 470,360" fill="#1d4d34"/>
  <polygon points="400,360 460,220 520,360" fill="#163c28"/>
  <circle cx="430" cy="140" r="24" fill="#f0dd9a" opacity=".8"/>
  <text x="400" y="250" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="#f7f3ea">Forest</text>
  <text x="400" y="490" text-anchor="middle" font-family="Arial" font-size="13" fill="#888">BACKLIT</text>
''')

save("imago.svg", f'''
  {sheet(220, 60, 360, 440, "IMAGE DOT", 6)}
  <g fill="#fff">
    {''.join(f'<circle cx="{280 + (i%6)*42}" cy="{250 + (i//6)*42}" r="8" opacity=".9"/>' for i in range(24))}
  </g>
''')

save("foam.svg", sheet(210, 70, 380, 420, "A2Z  FOAM PVC", 8))

save("clear-vinyl.svg", f'''
  <rect width="800" height="560" fill="#e7eef3"/>
  <rect x="160" y="30" width="480" height="500" fill="#d5e0e8" stroke="#fff" stroke-width="10"/>
  <g filter="url(#sh)">
    <rect x="230" y="90" width="340" height="380" fill="{ORANGE}" opacity=".92"/>
    <text x="400" y="200" text-anchor="middle" font-family="Arial" font-size="26" font-weight="800" fill="#fff">ECONOMY</text>
    <text x="400" y="238" text-anchor="middle" font-family="Arial" font-size="26" font-weight="800" fill="#fff">CLEAR VINYL</text>
    <rect x="280" y="280" width="240" height="8" fill="#fff" opacity=".8"/>
    <rect x="300" y="304" width="200" height="8" fill="#fff" opacity=".7"/>
    <rect x="320" y="328" width="160" height="8" fill="#fff" opacity=".7"/>
  </g>
''')

save("design.svg", f'''
  <g filter="url(#sh)">
    <rect x="160" y="80" width="360" height="400" rx="8" fill="#fff" transform="rotate(-8 340 280)"/>
    <rect x="300" y="70" width="360" height="400" rx="8" fill="#fff7ef" transform="rotate(6 480 270)"/>
  </g>
  <g>
    <rect x="250" y="140" width="300" height="16" rx="8" fill="{ORANGE}"/>
    <rect x="250" y="176" width="220" height="10" rx="5" fill="#ddd"/>
    <rect x="250" y="198" width="180" height="10" rx="5" fill="#eee"/>
    <circle cx="290" cy="290" r="28" fill="{ORANGE}"/>
    <circle cx="350" cy="290" r="28" fill="{NAVY}"/>
    <circle cx="410" cy="290" r="28" fill="#1f8f86"/>
    <circle cx="470" cy="290" r="28" fill="#e7b325"/>
    <rect x="250" y="360" width="260" height="90" rx="10" fill="{INK}"/>
    <text x="380" y="412" text-anchor="middle" font-family="Arial" font-size="18" fill="#fff">DESIGN DESK</text>
  </g>
''')

save("hero-press.svg", f'''
  <rect width="800" height="700" fill="#e7edf2"/>
  <rect x="0" y="0" width="800" height="220" fill="#d5dee6"/>
  <rect x="40" y="40" width="180" height="120" rx="4" fill="#c5d4e0"/>
  <rect x="250" y="30" width="200" height="140" rx="4" fill="#bfd0de"/>
  <rect x="40" y="430" width="760" height="270" fill="#cfd8e0"/>
  <g>
    <rect x="80" y="250" width="520" height="280" rx="16" fill="#f4f6f8"/>
    <rect x="80" y="250" width="520" height="46" rx="16" fill="#dfe5ea"/>
    <rect x="80" y="276" width="520" height="20" fill="#dfe5ea"/>
    <rect x="120" y="360" width="300" height="90" rx="8" fill="#fff"/>
    <rect x="140" y="382" width="180" height="10" fill="{ORANGE}"/>
    <rect x="140" y="402" width="140" height="8" fill="#ddd"/>
    <circle cx="500" cy="400" r="46" fill="{NAVY}"/>
    <rect x="470" y="400" width="70" height="80" fill="{NAVY}"/>
  </g>
  <g>
    <circle cx="560" cy="300" r="46" fill="#f1c7a8"/>
    <path d="M520 360 Q560 340 610 370 L640 520 L500 520 Z" fill="#1e3a5f"/>
    <rect x="500" y="470" width="150" height="18" fill="#1e3a5f"/>
    <rect x="430" y="400" width="90" height="22" rx="8" fill="#f1c7a8"/>
  </g>
  <g opacity=".9">
    <circle cx="230" cy="210" r="28" fill="#e6c2a8"/>
    <rect x="205" y="238" width="60" height="70" rx="8" fill="#6d7580"/>
  </g>
''', 800, 700)

save("hero-operator.svg", f'''
  <rect width="800" height="700" fill="#eef3f6"/>
  <rect x="0" y="0" width="800" height="180" fill="#d9e3ea"/>
  <rect x="60" y="40" width="140" height="200" fill="#c9d7e2"/>
  <rect x="560" y="50" width="180" height="240" fill="#d5e0e8"/>
  <rect x="80" y="300" width="640" height="280" rx="12" fill="#f7f8f8"/>
  <rect x="120" y="340" width="420" height="180" rx="8" fill="#fff"/>
  <rect x="150" y="370" width="200" height="12" fill="{ORANGE}"/>
  <rect x="150" y="396" width="160" height="8" fill="#e5e5e5"/>
  <rect x="150" y="416" width="120" height="8" fill="#eee"/>
  <rect x="430" y="360" width="80" height="140" rx="6" fill="{NAVY}"/>
  <g>
    <circle cx="250" cy="230" r="48" fill="#e7c3a4"/>
    <path d="M210 210 Q250 150 300 210 Q310 250 250 250 Q190 250 210 210" fill="#3a2a24"/>
    <path d="M190 300 Q250 270 340 310 L360 560 L170 560 Z" fill="#12807a"/>
    <rect x="300" y="340" width="120" height="26" rx="10" fill="#e7c3a4"/>
  </g>
''', 800, 700)

save("press.svg", f'''
  <rect width="800" height="560" fill="#1c1f24"/>
  <g>
    <rect x="40" y="80" width="70" height="400" fill="#111"/>
    <rect x="40" y="80" width="70" height="400" fill="#00a3d9" opacity=".95"/>
    <rect x="130" y="60" width="80" height="440" fill="#e01278"/>
    <rect x="230" y="90" width="76" height="390" fill="#f5d000"/>
    <rect x="320" y="70" width="84" height="430" fill="#111"/>
    <rect x="330" y="80" width="64" height="410" fill="#1a1a1a" stroke="#333"/>
  </g>
  <g filter="url(#sh)">
    <rect x="430" y="70" width="320" height="420" rx="6" fill="#f4f1ea"/>
    <rect x="460" y="100" width="120" height="90" fill="#00a3d9"/>
    <rect x="590" y="100" width="120" height="90" fill="#e01278"/>
    <rect x="460" y="210" width="120" height="90" fill="#f5d000"/>
    <rect x="590" y="210" width="120" height="90" fill="#222"/>
    <rect x="460" y="330" width="250" height="16" fill="#ddd"/>
    <rect x="460" y="360" width="200" height="12" fill="#eee"/>
    <rect x="460" y="386" width="160" height="12" fill="#eee"/>
  </g>
''')

save("press-side.svg", f'''
  <rect width="800" height="560" fill="#eceff1"/>
  <rect x="40" y="180" width="720" height="220" rx="20" fill="#dfe3e6"/>
  <circle cx="180" cy="290" r="90" fill="#c5ccd1" stroke="#9aa3aa" stroke-width="10"/>
  <circle cx="180" cy="290" r="30" fill="#8b949b"/>
  <rect x="250" y="230" width="360" height="120" rx="8" fill="#fff"/>
  <rect x="270" y="255" width="90" height="70" fill="{ORANGE}"/>
  <rect x="370" y="255" width="70" height="70" fill="{NAVY}"/>
  <rect x="450" y="255" width="70" height="70" fill="#1f8f86"/>
  <rect x="530" y="255" width="60" height="70" fill="#f5d000"/>
  <rect x="40" y="420" width="720" height="18" rx="8" fill="#b7c0c6"/>
  <circle cx="640" cy="200" r="34" fill="#00a3d9"/>
  <circle cx="700" cy="230" r="28" fill="#e01278"/>
''')

favicon = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" rx="14" fill="#e4572a"/>
<text x="32" y="44" text-anchor="middle" font-family="Arial" font-size="32" font-weight="800" fill="#fff">A2</text>
</svg>'''
(Path(__file__).parent / "favicon.svg").write_text(favicon, encoding="utf-8")
print("wrote", len(list(OUT.glob('*.svg'))), "svgs")
