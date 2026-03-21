"""
LegalEase AI – PDF Generation Service
Dynamic per-category theming: each business type gets its own accent color,
cover icon, section label tone, and section ordering.
"""

import os, io, glob
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, Image as RLImage, KeepTogether
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Circle, Polygon
from reportlab.graphics import renderPDF

# ── Font Registration ─────────────────────────────────────────────────────────
def _find_font(patterns):
    for pat in patterns:
        found = glob.glob(pat, recursive=True)
        if found: return found[0]
    return None

_REG  = _find_font(["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                    "/home/**/.cache/**/DejaVuSans.ttf",
                    "/root/.cache/**/DejaVuSans.ttf"])
_BOLD = _REG.replace("DejaVuSans.ttf","DejaVuSans-Bold.ttf") if _REG else None

F="Helvetica"; FB="Helvetica-Bold"; FI="Helvetica-Oblique"
if _REG and os.path.exists(_REG):
    try: pdfmetrics.registerFont(TTFont("DV",_REG)); F=FI="DV"
    except: pass
if _BOLD and os.path.exists(_BOLD):
    try: pdfmetrics.registerFont(TTFont("DV-B",_BOLD)); FB="DV-B"
    except: pass

def R(t): return str(t).replace("\u20b9","Rs.").replace("₹","Rs.")

# ── Base Dark Colors ──────────────────────────────────────────────────────────
INK       = colors.HexColor("#0E0D0B")
INK_MID   = colors.HexColor("#1A1810")
INK_CARD  = colors.HexColor("#1E1C18")
INK_SOFT  = colors.HexColor("#252320")
BORDER    = colors.HexColor("#333028")
WHITE     = colors.white
OFF_WHITE = colors.HexColor("#E8E5DE")
MUTED     = colors.HexColor("#7A7570")
C_RED     = colors.HexColor("#E57373"); C_RED_BG  = colors.HexColor("#1C0A0A"); C_RED_BD  = colors.HexColor("#3D1515")
C_GREEN   = colors.HexColor("#4CAF7D"); C_GREEN_BG= colors.HexColor("#0A1C10"); C_GREEN_BD= colors.HexColor("#154A20")
C_BLUE    = colors.HexColor("#64B5F6"); C_BLUE_BG = colors.HexColor("#0A1220"); C_BLUE_BD = colors.HexColor("#152540")
C_ORANGE  = colors.HexColor("#FFB74D"); C_ORANGE_BG=colors.HexColor("#1C1005"); C_ORANGE_BD=colors.HexColor("#3D2808")
PW,PH=A4; M=5*mm; CW=PW-2*M

# ── Per-Category Theme Definitions ────────────────────────────────────────────
# Each theme: accent, accent_bg, accent_dark, icon_char, label_overrides, section_order
THEMES = {
    "food": {
        "accent":      colors.HexColor("#FF7043"),
        "accent_bg":   colors.HexColor("#1A0C08"),
        "accent_dark": colors.HexColor("#BF360C"),
        "accent_hex":  "#FF7043",
        "icon":        "FOOD",
        "cover_tag":   "FOOD & BEVERAGE",
        "sec_licenses":"Food Safety Licenses & Registrations",
        "sec_risks":   "Food Safety Risks & Penalties",
        "sec_nc":      "Consequences of Food Safety Violations",
        "sec_action":  "Your Food Business Launch Plan",
        "sec_costs":   "Food Business Setup Costs (INR)",
        "sec_chart":   "Risk Distribution — Food & Beverage",
        "priority_sections": ["licenses","risk_chart","risks","non_compliance","action_plan","costs","checklist"],
    },
    "fintech": {
        "accent":      colors.HexColor("#7C4DFF"),
        "accent_bg":   colors.HexColor("#120A20"),
        "accent_dark": colors.HexColor("#4527A0"),
        "accent_hex":  "#7C4DFF",
        "icon":        "FIN",
        "cover_tag":   "FINTECH & FINANCIAL SERVICES",
        "sec_licenses":"RBI, SEBI & Financial Compliance Requirements",
        "sec_risks":   "Financial Regulatory Risks & RBI Penalties",
        "sec_nc":      "Consequences of Financial Non-Compliance",
        "sec_action":  "Fintech Regulatory Compliance Roadmap",
        "sec_costs":   "Fintech Compliance & Registration Costs (INR)",
        "sec_chart":   "Risk Distribution — Financial Services",
        "priority_sections": ["risks","licenses","risk_chart","non_compliance","action_plan","costs","checklist"],
    },
    "edtech": {
        "accent":      colors.HexColor("#26C6DA"),
        "accent_bg":   colors.HexColor("#061418"),
        "accent_dark": colors.HexColor("#00838F"),
        "accent_hex":  "#26C6DA",
        "icon":        "EDU",
        "cover_tag":   "EDTECH & EDUCATION",
        "sec_licenses":"Education Sector Licenses & Registrations",
        "sec_risks":   "EdTech Legal Risks & Compliance Gaps",
        "sec_nc":      "Consequences of Education Compliance Failures",
        "sec_action":  "EdTech Launch Compliance Roadmap",
        "sec_costs":   "EdTech Compliance Costs (INR)",
        "sec_chart":   "Risk Distribution — Education Sector",
        "priority_sections": ["licenses","action_plan","risks","risk_chart","non_compliance","costs","checklist"],
    },
    "retail": {
        "accent":      colors.HexColor("#EC407A"),
        "accent_bg":   colors.HexColor("#1A0610"),
        "accent_dark": colors.HexColor("#880E4F"),
        "accent_hex":  "#EC407A",
        "icon":        "RET",
        "cover_tag":   "RETAIL & E-COMMERCE",
        "sec_licenses":"Retail & E-Commerce Licenses Required",
        "sec_risks":   "Consumer Protection & GST Risks",
        "sec_nc":      "Consequences of Retail Non-Compliance",
        "sec_action":  "Retail Business Launch Plan",
        "sec_costs":   "Retail Setup & Compliance Costs (INR)",
        "sec_chart":   "Risk Distribution — Retail & E-Commerce",
        "priority_sections": ["licenses","risks","action_plan","risk_chart","non_compliance","costs","checklist"],
    },
    "manufacturing": {
        "accent":      colors.HexColor("#FFA726"),
        "accent_bg":   colors.HexColor("#1A1005"),
        "accent_dark": colors.HexColor("#E65100"),
        "accent_hex":  "#FFA726",
        "icon":        "MFG",
        "cover_tag":   "MANUFACTURING & EXPORT",
        "sec_licenses":"Manufacturing & Export Licenses Required",
        "sec_risks":   "Manufacturing & Labour Law Risks",
        "sec_nc":      "Consequences of Manufacturing Non-Compliance",
        "sec_action":  "Manufacturing Business Compliance Plan",
        "sec_costs":   "Manufacturing Setup Costs (INR)",
        "sec_chart":   "Risk Distribution — Manufacturing & Export",
        "priority_sections": ["licenses","action_plan","risks","risk_chart","non_compliance","costs","checklist"],
    },
    "services": {
        "accent":      colors.HexColor("#66BB6A"),
        "accent_bg":   colors.HexColor("#081208"),
        "accent_dark": colors.HexColor("#2E7D32"),
        "accent_hex":  "#66BB6A",
        "icon":        "SVC",
        "cover_tag":   "SERVICES & CONSULTING",
        "sec_licenses":"Professional Services Registrations",
        "sec_risks":   "Services Business Legal Risks",
        "sec_nc":      "Consequences of Services Non-Compliance",
        "sec_action":  "Services Business Launch Checklist",
        "sec_costs":   "Services Business Setup Costs (INR)",
        "sec_chart":   "Risk Distribution — Services Sector",
        "priority_sections": ["licenses","action_plan","costs","risks","risk_chart","non_compliance","checklist"],
    },
    # Default / fallback
    "default": {
        "accent":      colors.HexColor("#C9A84C"),
        "accent_bg":   colors.HexColor("#181408"),
        "accent_dark": colors.HexColor("#8C6E2F"),
        "accent_hex":  "#C9A84C",
        "icon":        "LAW",
        "cover_tag":   "BUSINESS LEGAL ANALYSIS",
        "sec_licenses":"Required Licenses & Registrations",
        "sec_risks":   "Legal Risks & Penalties",
        "sec_nc":      "Non-Compliance Consequences",
        "sec_action":  "Step-by-Step Action Plan",
        "sec_costs":   "Cost Estimates (INR)",
        "sec_chart":   "Risk Distribution by Category",
        "priority_sections": ["licenses","risk_chart","risks","non_compliance","action_plan","costs","checklist"],
    },
}

def get_theme(category: str) -> dict:
    """Map a category string to its theme."""
    cat = (category or "").lower()
    if any(k in cat for k in ["food","kitchen","restaurant","cafe","catering","beverage","fssai","dairy","bakery"]): return THEMES["food"]
    if any(k in cat for k in ["fintech","finance","lending","nbfc","payment","insurance","banking","investment"]): return THEMES["fintech"]
    if any(k in cat for k in ["edtech","education","tutoring","learning","school","coaching","upsc","course"]): return THEMES["edtech"]
    if any(k in cat for k in ["retail","ecommerce","d2c","shop","store","fashion","cosmetic","apparel","amazon"]): return THEMES["retail"]
    if any(k in cat for k in ["manufactur","export","factory","production","import","industrial","textile"]): return THEMES["manufacturing"]
    if any(k in cat for k in ["service","consult","freelanc","agency","software","it","tech","saas","app","digital"]): return THEMES["services"]
    return THEMES["default"]

# ── Styles ────────────────────────────────────────────────────────────────────
def make_styles(theme):
    A = theme["accent"]
    d={}
    def s(n,**k): d[n]=ParagraphStyle(n,**k)
    s("brand",    fontName=FB,fontSize=9, textColor=A,       leading=12)
    s("cover_tag",fontName=FB,fontSize=8, textColor=A,       leading=10, letterSpacing=2)
    s("h1",       fontName=FB,fontSize=24,textColor=WHITE,   leading=30)
    s("sub",      fontName=F, fontSize=11,textColor=colors.HexColor("#AAAAAA"),leading=16)
    s("meta",     fontName=F, fontSize=9, textColor=A,       leading=14)
    s("meta_sm",  fontName=F, fontSize=8, textColor=MUTED,   leading=11)
    s("sec",      fontName=FB,fontSize=13,textColor=WHITE,   leading=17)
    s("lbl",      fontName=FB,fontSize=8, textColor=MUTED,   leading=10)
    s("lbl_a",    fontName=FB,fontSize=8, textColor=A,       leading=10)
    s("body",     fontName=F, fontSize=10,textColor=OFF_WHITE,leading=15,spaceAfter=3)
    s("body_b",   fontName=FB,fontSize=10,textColor=WHITE,   leading=15)
    s("sm",       fontName=F, fontSize=8, textColor=MUTED,   leading=12)
    s("sm_b",     fontName=FB,fontSize=8, textColor=OFF_WHITE,leading=12)
    s("insight",  fontName=FI,fontSize=10,textColor=OFF_WHITE,leading=15)
    s("kpi_lbl",  fontName=FB,fontSize=7, textColor=MUTED,   leading=9, alignment=TA_CENTER)
    s("pen_ttl",  fontName=FB,fontSize=11,textColor=C_RED,   leading=14,alignment=TA_CENTER)
    s("pen_amt",  fontName=FB,fontSize=16,textColor=C_RED,   leading=20,alignment=TA_CENTER)
    s("ft_brand", fontName=FB,fontSize=10,textColor=A,       leading=13,alignment=TA_CENTER)
    s("ft",       fontName=F, fontSize=8, textColor=MUTED,   leading=11,alignment=TA_CENTER)
    s("ft_link",  fontName=F, fontSize=8, textColor=C_BLUE,  leading=12,alignment=TA_CENTER)
    s("tl_num",   fontName=FB,fontSize=11,textColor=A,       leading=14,alignment=TA_CENTER)
    s("tl_title", fontName=FB,fontSize=9, textColor=WHITE,   leading=12)
    s("tl_meta",  fontName=F, fontSize=7, textColor=MUTED,   leading=10)
    return d

# ── Color helpers ─────────────────────────────────────────────────────────────
def pri_col(p):
    return {"critical":(C_RED,C_RED_BG,C_RED_BD),"high":(C_ORANGE,C_ORANGE_BG,C_ORANGE_BD),
            "medium":(C_BLUE,C_BLUE_BG,C_BLUE_BD)}.get(p,(MUTED,INK_CARD,BORDER))
def sev_col(s):
    return {"high":(C_RED,C_RED_BG,C_RED_BD),"medium":(C_ORANGE,C_ORANGE_BG,C_ORANGE_BD),
            "low":(C_BLUE,C_BLUE_BG,C_BLUE_BD)}.get(s,(MUTED,INK_CARD,BORDER))
def cat_col(c):
    return {"legal":(C_BLUE,C_BLUE_BG,C_BLUE_BD),"financial":(C_GREEN,C_GREEN_BG,C_GREEN_BD),
            "operational":(C_ORANGE,C_ORANGE_BG,C_ORANGE_BD),"compliance":(C_RED,C_RED_BG,C_RED_BD)
           }.get(c.lower(),(MUTED,INK_CARD,BORDER))
def score_col(sc,tp="risk"):
    if tp=="risk": return C_GREEN if sc<=30 else (C_ORANGE if sc<=60 else C_RED)
    if tp in("complexity","compliance_complexity"): return C_GREEN if sc<=30 else (C_BLUE if sc<=60 else C_ORANGE)
    return C_GREEN if sc>=70 else (C_ORANGE if sc>=45 else C_RED)

# ── QR Code ───────────────────────────────────────────────────────────────────
class _QR:
    _DATA_CW={1:19,2:34,3:55,4:80,5:108,6:136,7:156,8:194,9:232,10:274}
    _EC_CW  ={1:7, 2:10,3:15,4:20,5:26, 6:36, 7:40, 8:48, 9:60, 10:74}
    _SIZE   ={v:17+4*v for v in range(1,11)}
    _FMT    =[1,1,1,0,1,1,1,1,1,0,0,0,1,0,0]
    @staticmethod
    def _gf():
        E=[0]*512;L=[0]*256;x=1
        for i in range(255):
            E[i]=x;L[x]=i;x<<=1
            if x&0x100:x^=0x11D
        for i in range(255,512):E[i]=E[i-255]
        return E,L
    @classmethod
    def _rs(cls,data,n):
        E,L=cls._gf()
        def m(a,b):return 0 if not a or not b else E[L[a]+L[b]]
        def pm(p,q):
            r=[0]*(len(p)+len(q)-1)
            for i,pi in enumerate(p):
                for j,qj in enumerate(q):r[i+j]^=m(pi,qj)
            return r
        g=[1]
        for i in range(n):g=pm(g,[1,E[i]])
        r=list(data)+[0]*n
        for i in range(len(data)):
            c=r[i]
            if c:
                for j,gv in enumerate(g):r[i+j]^=m(gv,c)
        return r[len(data):]
    @classmethod
    def encode(cls,text):
        data=text.encode("utf-8"); n=len(data)
        ver=next((v for v in range(1,11) if cls._DATA_CW[v]>=n+3),10)
        SZ=cls._SIZE[ver]; nd=cls._DATA_CW[ver]; ne=cls._EC_CW[ver]
        bits=[0,1,0,0]; an=min(n,nd-3)
        for i in range(7,-1,-1):bits.append((an>>i)&1)
        for byte in data[:an]:
            for i in range(7,-1,-1):bits.append((byte>>i)&1)
        bits+=[0,0,0,0]
        while len(bits)%8:bits.append(0)
        cw=[sum(bits[i+j]<<(7-j) for j in range(8)) for i in range(0,len(bits),8)]
        pads=[0xEC,0x11]
        while len(cw)<nd:cw.append(pads[len(cw)%2])
        ec=cls._rs(cw,ne); all_cw=cw+ec
        mat=[[False]*SZ for _ in range(SZ)]; res=[[False]*SZ for _ in range(SZ)]
        def put(r,c,v):mat[r][c]=v
        def mark(r,c,v):put(r,c,v);res[r][c]=True
        def finder(tr,tc):
            for dr in range(-1,8):
                for dc in range(-1,8):
                    rr,cc=tr+dr,tc+dc
                    if 0<=rr<SZ and 0<=cc<SZ:
                        v=(0<=dr<=6 and 0<=dc<=6 and(dr in(0,6) or dc in(0,6) or 2<=dr<=4 and 2<=dc<=4))
                        mark(rr,cc,v)
        finder(0,0);finder(0,SZ-7);finder(SZ-7,0)
        for i in range(8,SZ-8):mark(6,i,i%2==0);mark(i,6,i%2==0)
        mark(SZ-8,8,True)
        _AL={2:[6,18],3:[6,22],4:[6,26],5:[6,30],6:[6,34],7:[6,22,38],8:[6,24,42],9:[6,28,46],10:[6,28,50]}
        if ver in _AL:
            pos=_AL[ver]
            for ar in pos:
                for ac in pos:
                    if res[ar][ac]:continue
                    for dr in range(-2,3):
                        for dc in range(-2,3):
                            mark(ar+dr,ac+dc,abs(dr)==2 or abs(dc)==2 or(dr==0 and dc==0))
        fb=cls._FMT
        fc1=[(8,0),(8,1),(8,2),(8,3),(8,4),(8,5),(8,7),(8,8),(7,8),(5,8),(4,8),(3,8),(2,8),(1,8),(0,8)]
        fc2=[(SZ-1,8),(SZ-2,8),(SZ-3,8),(SZ-4,8),(SZ-5,8),(SZ-6,8),(SZ-7,8),(8,SZ-8),(8,SZ-7),(8,SZ-6),(8,SZ-5),(8,SZ-4),(8,SZ-3),(8,SZ-2),(8,SZ-1)]
        for(r,c),b in zip(fc1,fb):mark(r,c,bool(b))
        for(r,c),b in zip(fc2,fb):mark(r,c,bool(b))
        bs=[]
        for cw in all_cw:
            for i in range(7,-1,-1):bs.append((cw>>i)&1)
        idx=0;right=SZ-1;up=True
        while right>=1:
            if right==6:right-=1
            for row in(range(SZ-1,-1,-1) if up else range(SZ)):
                for col in[right,right-1]:
                    if not res[row][col] and idx<len(bs):
                        b=bs[idx];idx+=1
                        if(row+col)%2==0:b^=1
                        put(row,col,bool(b))
            right-=2;up=not up
        return mat

def generate_qr(url,theme,size_mm=28):
    from PIL import Image as PIL
    # Parse accent color for QR modules
    ah=theme["accent_hex"].lstrip("#")
    ar,ag,ab=int(ah[0:2],16),int(ah[2:4],16),int(ah[4:6],16)
    try:
        import qrcode as qclib
        qc=qclib.QRCode(error_correction=qclib.constants.ERROR_CORRECT_L,box_size=6,border=3)
        qc.add_data(url);qc.make(fit=True)
        img=qc.make_image(fill_color=(ar,ag,ab),back_color=(14,13,11))
    except ImportError:
        mat=_QR.encode(url); SZ=len(mat); quiet=4; cell=6
        total=(SZ+2*quiet)*cell
        img=PIL.new("RGB",(total,total),(14,13,11))
        px=img.load()
        for r,row in enumerate(mat):
            for c,dark in enumerate(row):
                if dark:
                    x0=(c+quiet)*cell;y0=(r+quiet)*cell
                    for dy in range(cell):
                        for dx in range(cell):px[x0+dx,y0+dy]=(ar,ag,ab)
    buf=io.BytesIO();img.save(buf,format="PNG");buf.seek(0)
    w=size_mm*mm;return RLImage(buf,width=w,height=w)

# ── Dark background ───────────────────────────────────────────────────────────
def _bg(canv,doc):
    canv.saveState()
    # Full page dark background
    canv.setFillColor(INK)
    canv.rect(0,0,PW,PH,fill=1,stroke=0)
    canv.restoreState()

# ── Cover Page ────────────────────────────────────────────────────────────────
def build_cover(story,sty,data,theme):
    A=theme["accent"]; AB=theme["accent_bg"]; AD=theme["accent_dark"]
    biz=data.get("business_name","Legal Analysis Report")
    summary=data.get("summary","")
    if len(summary)>230:summary=summary[:227]+"..."
    loc=data.get("location","—");scale=data.get("scale","—")
    mode=data.get("mode","—");rid=data.get("report_id","")
    ts=datetime.now().strftime("%d %B %Y, %I:%M %p")

    # Top accent stripe
    stripe=Table([[""]],colWidths=[CW],rowHeights=[5])
    stripe.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),A)]))

    # Category tag bar
    tag_bar=Table([[
        Paragraph("LEGALEASE AI  ·  INDIA", sty["brand"]),
        Paragraph(theme["cover_tag"], sty["cover_tag"]),
    ]],colWidths=[CW*0.5,CW*0.5])
    tag_bar.setStyle(TableStyle([
        ("BACKGROUND",   (0,0),(-1,-1), INK_MID),
        ("LEFTPADDING",  (0,0),(-1,-1), 16),("RIGHTPADDING",(0,0),(-1,-1),16),
        ("TOPPADDING",   (0,0),(-1,-1), 10),("BOTTOMPADDING",(0,0),(-1,-1),10),
        ("ALIGN",        (1,0),(1,0), "RIGHT"),
        ("VALIGN",       (0,0),(-1,-1),"MIDDLE"),
    ]))

    # Icon badge + title block
    icon_cell=Table([[
        Paragraph(theme["icon"],ParagraphStyle("ico",fontName=FB,fontSize=11,
            textColor=INK,leading=13,alignment=TA_CENTER))
    ]],colWidths=[48],rowHeights=[48])
    icon_cell.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),A),
        ("ALIGN",(0,0),(-1,-1),"CENTER"),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
    ]))

    title_block=Table([
        [Paragraph(R(biz),sty["h1"])],
        [Spacer(1,4)],
        [Paragraph(R(summary),sty["sub"])],
    ],colWidths=[CW-68])
    title_block.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),INK_MID),
        ("LEFTPADDING",(0,0),(-1,-1),14),("TOPPADDING",(0,0),(-1,-1),4),
        ("BOTTOMPADDING",(0,0),(-1,-1),4),
    ]))

    hero=Table([[icon_cell,title_block]],colWidths=[52,CW-52])
    hero.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),INK_MID),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("LEFTPADDING",(0,0),(0,0),14),
        ("TOPPADDING",(0,0),(-1,-1),16),("BOTTOMPADDING",(0,0),(-1,-1),16),
        ("LINEBEFORE",(0,0),(0,-1),3,A),
    ]))

    # Meta strip
    meta=Table([[
        Paragraph(f"<b>{loc}</b>",sty["meta"]),
        Paragraph(f"<b>{scale}</b>",sty["meta"]),
        Paragraph(f"<b>{mode}</b>",sty["meta"]),
        Paragraph(f"ID: {rid}",sty["meta_sm"]),
        Paragraph(ts,sty["meta_sm"]),
    ]],colWidths=[CW*0.22,CW*0.15,CW*0.13,CW*0.22,CW*0.28])
    meta.setStyle(TableStyle([
        ("BACKGROUND",   (0,0),(-1,-1),AB),
        ("LEFTPADDING",  (0,0),(-1,-1),16),("TOPPADDING",(0,0),(-1,-1),8),
        ("BOTTOMPADDING",(0,0),(-1,-1),8),
        ("LINEABOVE",    (0,0),(-1,0),0.5,AD),
        ("VALIGN",       (0,0),(-1,-1),"MIDDLE"),
    ]))

    story.append(stripe)
    story.append(tag_bar)
    story.append(hero)
    story.append(meta)
    story.append(Spacer(1,12))

# ── Key Insight ───────────────────────────────────────────────────────────────
def build_key_insight(story,sty,text,theme):
    if not text:return
    A=theme["accent"]; AB=theme["accent_bg"]
    t=Table([[Paragraph("KEY INSIGHT",sty["lbl_a"]),Paragraph(R(text),sty["insight"])]],
            colWidths=[72,CW-72])
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),AB),
        ("BOX",(0,0),(-1,-1),1,A),("LINEBEFORE",(0,0),(0,-1),4,A),
        ("LEFTPADDING",(0,0),(-1,-1),10),("RIGHTPADDING",(0,0),(-1,-1),10),
        ("TOPPADDING",(0,0),(-1,-1),10),("BOTTOMPADDING",(0,0),(-1,-1),10),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
    ]))
    story.append(t);story.append(Spacer(1,10))

# ── Penalty Summary Box ───────────────────────────────────────────────────────
def build_penalty_summary(story,sty,risks):
    """Show worst-case total penalties at a glance."""
    if not risks:return
    high_risks=[r for r in risks if r.get("severity")=="high"]
    if not high_risks:return
    story.append(Spacer(1,4))
    cells=[]
    for rk in high_risks[:3]:
        pen=R(rk.get("penalty",""))
        cells.append(Table([
            [Paragraph("MAX PENALTY",sty["lbl"])],
            [Paragraph(pen,ParagraphStyle("pa",fontName=FB,fontSize=9,
                textColor=C_RED,leading=12,alignment=TA_CENTER))],
            [Paragraph(rk.get("title","")[:40],ParagraphStyle("pt",fontName=F,fontSize=7,
                textColor=MUTED,leading=10,alignment=TA_CENTER))],
        ],colWidths=[(CW-8)/min(3,len(high_risks))],style=[
            ("BACKGROUND",(0,0),(-1,-1),C_RED_BG),
            ("BOX",(0,0),(-1,-1),0.5,C_RED_BD),
            ("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8),
            ("ALIGN",(0,0),(-1,-1),"CENTER"),
        ]))
    n=len(cells)
    row=Table([cells],colWidths=[(CW-8)/n]*n)
    story.append(row);story.append(Spacer(1,10))

# ── Score Cards ───────────────────────────────────────────────────────────────
def build_scores(story,sty,data,theme):
    A=theme["accent"]
    f=data.get("feasibility",{});r=data.get("risk",{});c=data.get("compliance_complexity",{})
    col=(CW-4)/3
    def kpi(title,score,tp,label):
        sc=score_col(score,tp)
        return [
            Paragraph(title,sty["kpi_lbl"]),
            Paragraph(str(score),ParagraphStyle(f"kn{tp}",fontName=FB,fontSize=32,textColor=sc,leading=36,alignment=TA_CENTER)),
            Paragraph(label.upper(),ParagraphStyle(f"kl{tp}",fontName=FB,fontSize=8,textColor=sc,leading=10,alignment=TA_CENTER)),
            Paragraph("/100",ParagraphStyle(f"ks{tp}",fontName=F,fontSize=7,textColor=MUTED,leading=9,alignment=TA_CENTER)),
        ]
    def kbg(tp,score):
        c=score_col(score,tp)
        return {C_GREEN:C_GREEN_BG,C_RED:C_RED_BG,C_ORANGE:C_ORANGE_BG,C_BLUE:C_BLUE_BG}.get(c,INK_CARD)
    t=Table([[kpi("FEASIBILITY",f.get("score",0),"feasibility",f.get("label","")),
              kpi("RISK SCORE",r.get("score",0),"risk",r.get("label","")),
              kpi("COMPLIANCE",c.get("score",0),"complexity",c.get("label",""))]],
            colWidths=[col,col,col])
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(0,0),kbg("feasibility",f.get("score",0))),
        ("BACKGROUND",(1,0),(1,0),kbg("risk",r.get("score",0))),
        ("BACKGROUND",(2,0),(2,0),kbg("complexity",c.get("score",0))),
        ("BOX",(0,0),(-1,-1),0.5,BORDER),("INNERGRID",(0,0),(-1,-1),0.5,BORDER),
        ("ALIGN",(0,0),(-1,-1),"CENTER"),("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("TOPPADDING",(0,0),(-1,-1),12),("BOTTOMPADDING",(0,0),(-1,-1),12),
    ]))
    story.append(t);story.append(Spacer(1,6))
    notes=[(f.get("note",""),C_GREEN),(r.get("note",""),C_RED),(c.get("note",""),C_BLUE)]
    cells=[Table([[Paragraph(R(nt),sty["sm"])]],colWidths=[col],style=[
        ("LINEBEFORE",(0,0),(0,0),3,lc),("LEFTPADDING",(0,0),(-1,-1),8),
        ("BACKGROUND",(0,0),(-1,-1),INK_CARD),("TOPPADDING",(0,0),(-1,-1),6),
        ("BOTTOMPADDING",(0,0),(-1,-1),6),("BOX",(0,0),(-1,-1),0.5,BORDER),
    ]) for nt,lc in notes if nt]
    if cells:story.append(Table([cells],colWidths=[col]*len(cells)))
    story.append(Spacer(1,10))
    lics=data.get("licenses",[]); risks_=data.get("risks",[]); plan=data.get("action_plan",[])
    crit=len([l for l in lics if l.get("priority")=="critical"])
    high=len([rk for rk in risks_ if rk.get("severity")=="high"])
    strip=Table([[
        Paragraph(f"<b>{len(lics)}</b>  Licenses Required  ({crit} critical)",sty["sm_b"]),
        Paragraph(f"<b>{len(risks_)}</b>  Legal Risks  ({high} high severity)",sty["sm_b"]),
        Paragraph(f"<b>{len(plan)}</b>  Action Steps  (chronological)",sty["sm_b"]),
    ]],colWidths=[col,col,col])
    strip.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),theme["accent_bg"]),
        ("BOX",(0,0),(-1,-1),0.5,A),("INNERGRID",(0,0),(-1,-1),0.5,BORDER),
        ("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8),
        ("LEFTPADDING",(0,0),(-1,-1),10),("ALIGN",(0,0),(-1,-1),"CENTER"),
    ]))
    story.append(strip);story.append(Spacer(1,14))

# ── Section Header ────────────────────────────────────────────────────────────
def sec_hdr(story,sty,title,theme):
    A=theme["accent"]
    story.append(Spacer(1,8))
    t=Table([[Paragraph(title,sty["sec"])]],colWidths=[CW])
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),INK_MID),
        ("LEFTPADDING",(0,0),(-1,-1),12),
        ("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8),
        ("LINEBELOW",(0,0),(-1,-1),2,A),("LINEBEFORE",(0,0),(0,-1),4,A),
        ("BOX",(0,0),(-1,-1),0.5,BORDER),
    ]))
    story.append(t);story.append(Spacer(1,7))

# ── Document lists ────────────────────────────────────────────────────────────
_DOCS={"gst":["PAN Card of proprietor / company","Aadhaar Card","Bank account statement / cancelled cheque","Proof of business address","Digital signature (companies/LLPs)"],
       "fssai":["Photo ID (Aadhaar / PAN)","Proof of premises possession","List of food products","Food safety management plan","NOC from local municipality"],
       "udyam":["Aadhaar of proprietor/partner/director","PAN of business entity","Bank account details"],
       "shop":["Proof of business address","PAN of owner","Aadhaar of owner","Passport-size photograph","Employee details"],
       "trade":["Ownership/tenancy document","Site plan","Fire dept NOC","PAN card","Identity proof"],
       "iec":["PAN card","Aadhaar/passport of director","Bank certificate","Address proof"],
       "default":["PAN Card","Aadhaar Card","Proof of business address","Bank account details / cancelled cheque","Passport-size photographs (2)"]}
def get_docs(name):
    n=name.lower()
    for k,v in _DOCS.items():
        if k!="default" and k in n:return v
    return _DOCS["default"]

# ── Licenses ──────────────────────────────────────────────────────────────────
def build_licenses(story,sty,licenses,theme):
    if not licenses:return
    sec_hdr(story,sty,theme["sec_licenses"],theme)
    for lic in licenses:
        pc,pb,pbd=pri_col(lic.get("priority","medium"))
        link=lic.get("link",""); docs=get_docs(lic.get("name",""))
        doc_str="   |   ".join(docs[:5])
        cost=R(lic.get("estimated_cost","")); time_=lic.get("time_to_approve","")
        link_tag=f'<link href="{link}" color="#64B5F6">Apply Online</link>' if link else ""
        t=Table([
            [Paragraph(lic.get("name",""),sty["body_b"]),
             Paragraph(lic.get("priority","").upper(),ParagraphStyle("pri_"+lic.get("name","")[:6],
                fontName=FB,fontSize=8,textColor=pc,leading=10,alignment=TA_RIGHT))],
            [Paragraph(f"Issued by: {lic.get('authority','')}",sty["sm"]),""],
            [Paragraph(R(lic.get("description","")),sty["body"]),""],
            [Paragraph(f"<b>Documents:</b> {doc_str}",sty["sm"]),""],
            [Paragraph(f"<b>Cost:</b> {cost}   <b>Approval:</b> {time_}   {link_tag}",sty["sm"]),""],
        ],colWidths=[CW*0.75,CW*0.25])
        t.setStyle(TableStyle([
            ("BACKGROUND",(0,0),(-1,-1),pb),("BOX",(0,0),(-1,-1),0.5,pbd),
            ("LINEBEFORE",(0,0),(0,-1),3,pc),
            ("SPAN",(0,1),(1,1)),("SPAN",(0,2),(1,2)),("SPAN",(0,3),(1,3)),("SPAN",(0,4),(1,4)),
            ("LEFTPADDING",(0,0),(-1,-1),10),("RIGHTPADDING",(0,0),(-1,-1),10),
            ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),4),
            ("VALIGN",(0,0),(-1,-1),"TOP"),
        ]))
        story.append(KeepTogether([t,Spacer(1,7)]))

# ── Risk Chart ────────────────────────────────────────────────────────────────
def build_risk_chart(story,sty,breakdown,theme):
    if not breakdown:return
    sec_hdr(story,sty,theme["sec_chart"],theme)
    max_bar=CW-200
    for item in breakdown:
        sc=item.get("score",0); col=score_col(sc,"risk")
        bw=max(6,int(max_bar*sc/100))
        bar=Table([[""]],colWidths=[bw],rowHeights=[10],style=[("BACKGROUND",(0,0),(-1,-1),col)])
        row=Table([[
            Paragraph(item.get("label",""),sty["sm_b"]),bar,
            Paragraph(f"<b>{sc}</b>/100",ParagraphStyle("sv",fontName=FB,fontSize=8,textColor=col,leading=10,alignment=TA_RIGHT)),
        ]],colWidths=[170,bw+2,CW-170-bw-2])
        row.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"MIDDLE"),
            ("BACKGROUND",(0,0),(-1,-1),INK_CARD),
            ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
            ("LEFTPADDING",(0,0),(-1,-1),8)]))
        story.append(row)
    story.append(Spacer(1,8))

# ── Legal Risks ───────────────────────────────────────────────────────────────
def build_risks(story,sty,risks,theme):
    if not risks:return
    sec_hdr(story,sty,theme["sec_risks"],theme)
    for risk in risks:
        sc,sb,sbd=sev_col(risk.get("severity","medium"))
        t=Table([
            [Paragraph(R(risk.get("title","")),ParagraphStyle("rt",fontName=FB,fontSize=11,textColor=sc,leading=14))],
            [Paragraph(R(risk.get("description","")),sty["body"])],
            [Paragraph(f"<b>Under:</b> {risk.get('law','')}",sty["sm"])],
            [Paragraph(R(f"Penalty: {risk.get('penalty','')}"),ParagraphStyle("rp",fontName=FB,fontSize=9,textColor=sc,leading=13))],
        ],colWidths=[CW])
        t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),sb),("BOX",(0,0),(-1,-1),0.5,sbd),
            ("LINEBEFORE",(0,0),(0,-1),4,sc),
            ("LEFTPADDING",(0,0),(-1,-1),12),("RIGHTPADDING",(0,0),(-1,-1),10),
            ("TOPPADDING",(0,0),(-1,-1),7),("BOTTOMPADDING",(0,0),(-1,-1),6)]))
        story.append(KeepTogether([t,Spacer(1,7)]))

# ── Non-Compliance ────────────────────────────────────────────────────────────
def build_non_compliance(story,sty,consequences,theme):
    if not consequences:return
    sec_hdr(story,sty,theme["sec_nc"],theme)
    for nc in consequences:
        t=Table([
            [Paragraph(R(nc.get("area","")),ParagraphStyle("nct",fontName=FB,fontSize=10,textColor=C_RED,leading=14))],
            [Paragraph(R(nc.get("consequence","")),sty["body"])],
        ],colWidths=[CW])
        t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),C_RED_BG),("BOX",(0,0),(-1,-1),0.5,C_RED_BD),
            ("LINEBEFORE",(0,0),(0,-1),4,C_RED),
            ("LEFTPADDING",(0,0),(-1,-1),12),("RIGHTPADDING",(0,0),(-1,-1),10),
            ("TOPPADDING",(0,0),(-1,-1),7),("BOTTOMPADDING",(0,0),(-1,-1),7)]))
        story.append(KeepTogether([t,Spacer(1,6)]))

# ── Action Plan – Timeline Style ─────────────────────────────────────────────
def build_action_plan(story,sty,plan,theme):
    if not plan:return
    sec_hdr(story,sty,theme["sec_action"],theme)
    A=theme["accent"]; AB=theme["accent_bg"]

    # Group steps by timeframe for a visual timeline header
    timeframes=list(dict.fromkeys(s.get("timeframe","") for s in plan if s.get("timeframe")))
    if len(timeframes)>1:
        tf_cells=[]
        n_tf=min(len(timeframes),6)
        tf_w=CW/n_tf
        for i,tf in enumerate(timeframes[:n_tf]):
            tf_cells.append(Table([
                [Paragraph(tf,ParagraphStyle(f"tf{i}",fontName=FB,fontSize=9,
                    textColor=A,leading=12,alignment=TA_CENTER))],
            ],colWidths=[tf_w],style=[
                ("BACKGROUND",(0,0),(-1,-1),AB if i%2==0 else INK_CARD),
                ("ALIGN",(0,0),(-1,-1),"CENTER"),
                ("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8),
                ("BOX",(0,0),(-1,-1),0.5,BORDER),
            ]))
        tl=Table([tf_cells],colWidths=[tf_w]*n_tf)
        tl.setStyle(TableStyle([
            ("BOX",(0,0),(-1,-1),0.5,BORDER),
            ("LINEABOVE",(0,0),(-1,0),2,A),
            ("LINEBELOW",(0,0),(-1,-1),2,A),
        ]))
        story.append(tl);story.append(Spacer(1,10))

    for step in plan:
        cat=step.get("category","legal").lower()
        cc,bg,bd=cat_col(cat); cost=R(step.get("cost",""))
        num=Paragraph(str(step.get("step","")),
            ParagraphStyle("sn",fontName=FB,fontSize=18,textColor=A,leading=22,alignment=TA_CENTER))
        content=Table([
            [Paragraph(R(step.get("title","")),sty["body_b"])],
            [Paragraph(R(step.get("description","")),sty["body"])],
            [Paragraph(f"<b>When:</b> {step.get('timeframe','')}   "
                       f"<b>Cost:</b> {cost}   <b>Type:</b> {cat.upper()}",sty["sm"])],
        ],colWidths=[CW-48])
        content.setStyle(TableStyle([("TOPPADDING",(0,0),(-1,-1),3),("BOTTOMPADDING",(0,0),(-1,-1),3),("LEFTPADDING",(0,0),(-1,-1),0)]))
        row=Table([[num,content]],colWidths=[40,CW-40])
        row.setStyle(TableStyle([
            ("BACKGROUND",(0,0),(0,0),INK_SOFT),("BACKGROUND",(1,0),(1,0),bg),
            ("BOX",(0,0),(-1,-1),0.5,bd),
            ("VALIGN",(0,0),(-1,-1),"TOP"),
            ("LEFTPADDING",(0,0),(0,0),8),("RIGHTPADDING",(0,0),(0,0),8),
            ("TOPPADDING",(0,0),(-1,-1),9),("BOTTOMPADDING",(0,0),(-1,-1),9),
            ("LEFTPADDING",(1,0),(1,0),12),("RIGHTPADDING",(1,0),(1,0),10),
        ]))
        story.append(KeepTogether([row,Spacer(1,6)]))

# ── Cost Estimates ────────────────────────────────────────────────────────────
def build_costs(story,sty,estimates,theme):
    if not estimates:return
    sec_hdr(story,sty,theme["sec_costs"],theme)
    rows=[[Paragraph("ITEM",sty["lbl"]),Paragraph("ESTIMATED RANGE",sty["lbl"]),Paragraph("NOTES",sty["lbl"])]]
    for est in estimates:
        rng=R(est.get("range","")); free=rng.strip().lower() in("free","rs.0","rs. 0","0")
        rows.append([Paragraph(R(est.get("item","")),sty["body_b"]),
            Paragraph(rng,ParagraphStyle("cr",fontName=FB,fontSize=11,textColor=C_GREEN if free else WHITE,leading=14)),
            Paragraph(R(est.get("notes","")),sty["sm"])])
    t=Table(rows,colWidths=[CW*0.35,CW*0.27,CW*0.38])
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0),INK_MID),("LINEBELOW",(0,0),(-1,0),1,theme["accent"]),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[INK_CARD,INK_SOFT]),
        ("LINEBELOW",(0,1),(-1,-1),0.3,BORDER),
        ("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8),
        ("LEFTPADDING",(0,0),(-1,-1),9),("RIGHTPADDING",(0,0),(-1,-1),9),
        ("VALIGN",(0,0),(-1,-1),"TOP"),("BOX",(0,0),(-1,-1),0.5,BORDER),
    ]))
    story.append(t);story.append(Spacer(1,10))

# ── Checklist ─────────────────────────────────────────────────────────────────
def build_checklist(story,sty,licenses,theme):
    if not licenses:return
    sec_hdr(story,sty,"Pre-Launch Compliance Checklist",theme)
    A=theme["accent"]
    lic_items=[("todo",f"Obtain {l.get('name','')}") for l in licenses]
    gen_items=[("done","Open a dedicated business bank account"),
               ("done","Set up accounting software (Tally / Zoho Books)"),
               ("done","Draft employment contracts if hiring staff"),
               ("done","Register trademark if using a brand name"),
               ("done","Set up GST invoicing from Day 1"),
               ("done","Display all licenses visibly at business premises"),
               ("done","Maintain statutory registers as required by law")]
    ps_todo=ParagraphStyle("ck_t",fontName=FB,fontSize=9,textColor=A,leading=12)
    ps_done=ParagraphStyle("ck_d",fontName=FB,fontSize=9,textColor=C_GREEN,leading=12)
    rows=[]
    for kind,text in lic_items+gen_items:
        marker="[ ]" if kind=="todo" else "[+]"
        rows.append([Paragraph(marker,ps_todo if kind=="todo" else ps_done),Paragraph(text,sty["sm"])])
    t=Table(rows,colWidths=[32,CW-32])
    t.setStyle(TableStyle([("ROWBACKGROUNDS",(0,0),(-1,-1),[INK_CARD,INK_SOFT]),
        ("LINEBELOW",(0,0),(-1,-1),0.3,BORDER),("BOX",(0,0),(-1,-1),0.5,BORDER),
        ("TOPPADDING",(0,0),(-1,-1),7),("BOTTOMPADDING",(0,0),(-1,-1),7),
        ("LEFTPADDING",(0,0),(-1,-1),10),("VALIGN",(0,0),(-1,-1),"MIDDLE")]))
    story.append(t);story.append(Spacer(1,10))

# ── Footer ────────────────────────────────────────────────────────────────────
def build_footer(story,sty,report_url,theme):
    A=theme["accent"]
    story.append(Spacer(1,10))
    story.append(HRFlowable(width="100%",thickness=1.5,color=A))
    story.append(Spacer(1,10))
    try:    qr=generate_qr(report_url,theme,size_mm=30)
    except: qr=Spacer(30*mm,30*mm)
    disc=("This report is generated by LegalEase AI and is for informational purposes only. "
          "It does not constitute legal or financial advice. "
          "Please consult a qualified Chartered Accountant or Advocate before taking action.")
    left=Table([[Paragraph("LEGALEASE AI  ·  INDIA",sty["ft_brand"])],
                [Spacer(1,5)],[Paragraph(disc,sty["ft"])],[Spacer(1,5)],
                [Paragraph(f"View online: {report_url}",sty["ft_link"])],
                [Paragraph(f"Generated: {datetime.now().strftime('%d %B %Y')}  |  Scan QR to open report",sty["ft"])]],
               colWidths=[CW-38*mm-10])
    left.setStyle(TableStyle([("LEFTPADDING",(0,0),(-1,-1),0),("TOPPADDING",(0,0),(-1,-1),2),("BOTTOMPADDING",(0,0),(-1,-1),2)]))
    qr_col=Table([[qr]],colWidths=[38*mm])
    qr_col.setStyle(TableStyle([("ALIGN",(0,0),(-1,-1),"CENTER"),("VALIGN",(0,0),(-1,-1),"MIDDLE")]))
    ft=Table([[left,qr_col]],colWidths=[CW-38*mm-10,38*mm+10])
    ft.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"MIDDLE"),("BACKGROUND",(0,0),(-1,-1),INK_CARD),
        ("BOX",(0,0),(-1,-1),1,A),
        ("TOPPADDING",(0,0),(-1,-1),12),("BOTTOMPADDING",(0,0),(-1,-1),12),
        ("LEFTPADDING",(0,0),(0,0),14)]))
    story.append(ft)

# ── Main ─────────────────────────────────────────────────────────────────────
def generate_pdf(data: dict, output_path: str) -> str:
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else ".", exist_ok=True)
    category = data.get("category","")
    theme = get_theme(category)
    sty = make_styles(theme)

    doc=SimpleDocTemplate(output_path,pagesize=A4,
        leftMargin=M,rightMargin=M,topMargin=M,bottomMargin=M,
        title=f"LegalEase AI - {data.get('business_name','Report')}",
        author="LegalEase AI India",subject="Legal Compliance Report")

    story=[]
    build_cover(story,sty,data,theme)
    build_key_insight(story,sty,data.get("key_insight",""),theme)
    build_penalty_summary(story,sty,data.get("risks",[]))
    build_scores(story,sty,data,theme)

    # Dynamic section ordering per category
    builders = {
        "licenses":      lambda: build_licenses(story,sty,data.get("licenses",[]),theme),
        "risk_chart":    lambda: build_risk_chart(story,sty,data.get("risk_breakdown",[]),theme),
        "risks":         lambda: build_risks(story,sty,data.get("risks",[]),theme),
        "non_compliance":lambda: build_non_compliance(story,sty,data.get("non_compliance_consequences",[]),theme),
        "action_plan":   lambda: build_action_plan(story,sty,data.get("action_plan",[]),theme),
        "costs":         lambda: build_costs(story,sty,data.get("cost_estimates",[]),theme),
        "checklist":     lambda: build_checklist(story,sty,data.get("licenses",[]),theme),
    }
    for sec_key in theme["priority_sections"]:
        if sec_key in builders:
            builders[sec_key]()

    build_footer(story,sty,data.get("report_url",""),theme)
    doc.build(story,onFirstPage=_bg,onLaterPages=_bg)
    return output_path
