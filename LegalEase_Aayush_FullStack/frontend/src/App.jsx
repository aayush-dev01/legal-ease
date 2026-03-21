import { useState, useEffect, useRef, useCallback } from "react";

const _viteApi = import.meta.env.VITE_API_BASE;
const API_BASE =
  _viteApi != null && String(_viteApi).trim() !== ""
    ? String(_viteApi).replace(/\/$/, "")
    : import.meta.env.DEV
      ? ""
      : "http://127.0.0.1:8000";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  :root {
    --gold: #C9A84C;
    --gold-light: #E8C97A;
    --gold-dim: #8C6E2F;
    --gold-faint: rgba(201,168,76,0.10);
    --gold-faint2: rgba(201,168,76,0.06);
    --ink: #0C0B09;
    --ink-mid: #181610;
    --ink-soft: #242018;
    --ink-border: rgba(255,255,255,0.06);
    --ink-border2: rgba(255,255,255,0.10);
    --text-primary: #FAFAF8;
    --text-secondary: rgba(255,255,255,0.55);
    --text-muted: rgba(255,255,255,0.30);
    --red: #E05252;
    --green: #4CAF7D;
    --blue: #6BA3D6;
    --amber: #E09B40;
    --r-sm: 8px; --r-md: 12px; --r-lg: 18px; --r-xl: 24px;
  }

  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; }
  .le-root { font-family:'DM Sans',sans-serif; background:var(--ink); min-height:100vh; color:var(--text-primary); font-weight:300; }

  /* NAV */
  .le-nav { display:flex; align-items:center; justify-content:space-between; padding:1rem 2.5rem; background:rgba(12,11,9,0.96); backdrop-filter:blur(16px); border-bottom:1px solid rgba(201,168,76,0.12); position:sticky; top:0; z-index:100; }
  .le-nav-logo { display:flex; align-items:center; gap:11px; cursor:pointer; }
  .le-nav-logo-mark { width:36px; height:36px; border-radius:var(--r-sm); background:linear-gradient(140deg,var(--gold),var(--gold-light)); display:flex; align-items:center; justify-content:center; font-family:'Cormorant Garamond',serif; font-weight:700; color:var(--ink); font-size:19px; box-shadow:0 0 20px rgba(201,168,76,0.25); }
  .le-nav-name { color:var(--text-primary); font-size:15px; font-weight:600; letter-spacing:-0.3px; }
  .le-nav-tag { color:var(--gold); font-size:9.5px; letter-spacing:2px; text-transform:uppercase; font-weight:500; }
  .le-nav-pill { background:var(--gold-faint); border:1px solid rgba(201,168,76,0.25); color:var(--gold); padding:4px 12px; border-radius:100px; font-size:10.5px; font-weight:600; }

  /* BUTTONS */
  .le-btn-primary { background:linear-gradient(140deg,var(--gold),var(--gold-light)); color:var(--ink); font-weight:700; font-size:14px; padding:13px 32px; border-radius:var(--r-sm); border:none; cursor:pointer; transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1); font-family:'DM Sans',sans-serif; }
  .le-btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(201,168,76,0.40); }
  .le-btn-primary:active { transform:translateY(0); }
  .le-btn-primary:disabled { opacity:0.38; cursor:not-allowed; transform:none; box-shadow:none; }
  .le-btn-outline { background:transparent; color:var(--gold); border:1px solid rgba(201,168,76,0.35); font-weight:600; font-size:13px; padding:10px 22px; border-radius:var(--r-sm); cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif; }
  .le-btn-outline:hover { background:var(--gold-faint); border-color:var(--gold); }
  .le-btn-ghost { background:rgba(255,255,255,0.06); color:var(--text-secondary); border:1px solid var(--ink-border2); font-weight:500; font-size:13px; padding:8px 18px; border-radius:var(--r-sm); cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif; }
  .le-btn-ghost:hover { background:rgba(255,255,255,0.10); color:var(--text-primary); }

  /* HERO */
  .le-hero { background:var(--ink); padding:7rem 2.5rem 6rem; text-align:center; position:relative; overflow:hidden; }
  .le-hero-grid { position:absolute; inset:0; pointer-events:none; background-image:linear-gradient(rgba(201,168,76,0.045) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.045) 1px,transparent 1px); background-size:60px 60px; mask-image:radial-gradient(ellipse 80% 70% at 50% 0%,black 30%,transparent 80%); }
  .le-hero-glow { position:absolute; top:-120px; left:50%; transform:translateX(-50%); width:600px; height:400px; pointer-events:none; background:radial-gradient(ellipse,rgba(201,168,76,0.18) 0%,transparent 65%); }
  .le-hero::after { content:''; position:absolute; bottom:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(201,168,76,0.3),transparent); }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
  @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .le-hero-eyebrow-dot { width:5px; height:5px; border-radius:50%; background:var(--gold); animation:pulse 2s ease infinite; }
  .le-hero-eyebrow { display:inline-flex; align-items:center; gap:9px; animation:fadeInUp 0.6s ease both; color:var(--gold); font-size:10.5px; letter-spacing:2.5px; text-transform:uppercase; border:1px solid rgba(201,168,76,0.28); padding:6px 18px; border-radius:100px; margin-bottom:2.5rem; background:var(--gold-faint2); font-weight:500; }
  .le-hero h1 { font-family:'Cormorant Garamond',serif; font-size:clamp(3.2rem,6.5vw,5.8rem); font-weight:600; color:var(--text-primary); line-height:1.02; margin-bottom:1.6rem; letter-spacing:-2px; animation:fadeInUp 0.6s 0.1s ease both; }
  .le-hero h1 em { color:var(--gold); font-style:italic; }
  .le-hero-sub { color:var(--text-secondary); font-size:1.15rem; max-width:500px; margin:0 auto 3rem; font-weight:300; line-height:1.8; animation:fadeInUp 0.6s 0.2s ease both; }
  .le-hero-actions { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; animation:fadeInUp 0.6s 0.3s ease both; }
  .le-hero-stats { display:flex; justify-content:center; flex-wrap:wrap; margin-top:5rem; padding-top:3.5rem; border-top:1px solid var(--ink-border); }
  .le-hero-stat { padding:0 3rem; border-right:1px solid var(--ink-border); text-align:center; }
  .le-hero-stat:last-child { border-right:none; }
  .le-hero-stat-num { font-family:'Cormorant Garamond',serif; font-size:2.4rem; font-weight:600; color:var(--gold); }
  .le-hero-stat-lbl { color:var(--text-muted); font-size:10px; letter-spacing:1.5px; text-transform:uppercase; margin-top:4px; font-weight:500; }

  /* SECTIONS */
  .le-section-dark { background:var(--ink); padding:6rem 2.5rem; }
  .le-section-mid { background:var(--ink-mid); padding:6rem 2.5rem; border-top:1px solid var(--ink-border); border-bottom:1px solid var(--ink-border); }
  .le-container { max-width:1060px; margin:0 auto; }
  .le-section-label { font-size:10px; letter-spacing:3px; text-transform:uppercase; color:var(--gold); font-weight:600; margin-bottom:1rem; }
  .le-section-h2 { font-family:'Cormorant Garamond',serif; font-size:clamp(2rem,3.8vw,3rem); font-weight:600; color:var(--text-primary); line-height:1.15; margin-bottom:1.25rem; letter-spacing:-0.5px; }
  .le-section-h2 em { color:var(--gold); font-style:italic; }
  .le-section-sub { color:var(--text-secondary); font-size:1rem; font-weight:300; line-height:1.8; max-width:480px; }

  /* FEATURE GRID */
  .le-feat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:1.5px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.05); border-radius:var(--r-lg); overflow:hidden; }
  .le-feat-card { background:var(--ink); padding:2.25rem; position:relative; }
  .le-feat-card::before { content:''; position:absolute; inset:0; opacity:0; transition:opacity 0.3s; background:radial-gradient(ellipse 60% 60% at 30% 40%,rgba(201,168,76,0.07),transparent); }
  .le-feat-card:hover::before { opacity:1; }
  .le-feat-icon { width:42px; height:42px; border-radius:var(--r-sm); background:var(--gold-faint); border:1px solid rgba(201,168,76,0.18); display:flex; align-items:center; justify-content:center; font-size:19px; margin-bottom:1.25rem; }
  .le-feat-title { font-weight:600; font-size:14.5px; color:var(--text-primary); margin-bottom:0.5rem; }
  .le-feat-desc { font-size:13px; color:var(--text-muted); line-height:1.75; }

  /* STEPS */
  .le-steps-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); }
  .le-step-card { padding:2rem 1.5rem; text-align:center; border-right:1px solid var(--ink-border); }
  .le-step-card:last-child { border-right:none; }
  .le-step-num { width:50px; height:50px; border-radius:50%; border:1px solid rgba(201,168,76,0.35); display:flex; align-items:center; justify-content:center; margin:0 auto 1.25rem; font-family:'Cormorant Garamond',serif; font-size:1.3rem; color:var(--gold); font-weight:600; background:rgba(201,168,76,0.06); }
  .le-step-title { font-weight:600; font-size:13px; color:var(--text-primary); margin-bottom:0.5rem; }
  .le-step-desc { font-size:12px; color:var(--text-muted); line-height:1.7; }

  /* PREVIEW */
  .le-preview-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
  .le-preview-card { background:rgba(255,255,255,0.035); border:1px solid var(--ink-border2); border-radius:var(--r-md); padding:1.5rem; }
  .le-preview-card-title { font-size:9.5px; letter-spacing:1.5px; text-transform:uppercase; color:var(--gold); font-weight:600; margin-bottom:1rem; }
  .le-preview-item { display:flex; align-items:flex-start; gap:10px; padding:7px 0; border-bottom:1px solid rgba(255,255,255,0.04); font-size:12px; color:var(--text-secondary); }
  .le-preview-item:last-child { border-bottom:none; }
  .le-preview-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; margin-top:4px; }

  /* TESTIMONIALS */
  .le-testi-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:1.5rem; }
  .le-testi-card { background:rgba(255,255,255,0.03); border:1px solid var(--ink-border); border-radius:var(--r-lg); padding:1.75rem; transition:transform 0.25s ease,border-color 0.25s; }
  .le-testi-card:hover { transform:translateY(-3px); border-color:rgba(201,168,76,0.2); }
  .le-testi-quote { color:rgba(255,255,255,0.6); line-height:1.8; margin-bottom:1.25rem; font-style:italic; font-family:'Cormorant Garamond',serif; font-size:16px; }
  .le-testi-author { font-size:12px; font-weight:600; color:var(--gold); }
  .le-testi-role { font-size:11px; color:var(--text-muted); margin-top:2px; }
  .le-cta-band { background:linear-gradient(160deg,rgba(201,168,76,0.09),rgba(201,168,76,0.03)); border-top:1px solid rgba(201,168,76,0.16); border-bottom:1px solid rgba(201,168,76,0.10); padding:5rem 2.5rem; text-align:center; }

  /* INPUT */
  .le-input-section { max-width:820px; margin:0 auto; padding:4rem 2rem; }
  .le-input-card { background:rgba(255,255,255,0.025); border-radius:var(--r-xl); border:1px solid var(--ink-border2); overflow:hidden; box-shadow:0 40px 80px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.06); }
  .le-input-header { background:rgba(201,168,76,0.07); padding:2rem 2.25rem; border-bottom:1px solid rgba(201,168,76,0.13); }
  .le-input-header h2 { font-family:'Cormorant Garamond',serif; color:var(--text-primary); font-size:1.6rem; font-weight:600; margin-bottom:4px; }
  .le-input-header p { color:var(--text-muted); font-size:13px; }
  .le-input-body { padding:2rem 2.25rem; }
  .le-textarea { width:100%; min-height:140px; resize:vertical; border:1.5px solid var(--ink-border2); border-radius:var(--r-md); padding:1rem 1.25rem; font-family:'DM Sans',sans-serif; font-size:14.5px; color:var(--text-primary); background:rgba(255,255,255,0.035); outline:none; transition:border-color 0.2s,background 0.2s; line-height:1.7; font-weight:300; }
  .le-textarea:focus { border-color:var(--gold); background:rgba(201,168,76,0.04); }
  .le-textarea::placeholder { color:rgba(255,255,255,0.22); }
  .le-meta-row { display:flex; gap:1rem; margin-top:1.5rem; flex-wrap:wrap; }
  .le-meta-group { flex:1; min-width:150px; }
  .le-meta-label { font-size:10.5px; color:var(--text-muted); letter-spacing:1px; text-transform:uppercase; margin-bottom:7px; font-weight:600; }
  .le-meta-select { width:100%; padding:10px 14px; border-radius:var(--r-sm); border:1.5px solid var(--ink-border2); background:rgba(255,255,255,0.04); font-family:'DM Sans',sans-serif; font-size:13.5px; color:var(--text-primary); cursor:pointer; outline:none; appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23C9A84C' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; transition:border-color 0.2s; }
  .le-meta-select option { background:#1A1810; color:#fff; }
  .le-meta-select:focus { border-color:var(--gold); }
  .le-suggestions { margin-top:1rem; display:flex; gap:7px; flex-wrap:wrap; }
  .le-suggestion { background:rgba(255,255,255,0.04); border:1px solid var(--ink-border2); color:var(--text-muted); font-size:12px; padding:5px 13px; border-radius:100px; cursor:pointer; transition:all 0.15s; font-family:'DM Sans',sans-serif; }
  .le-suggestion:hover { background:var(--gold-faint); border-color:rgba(201,168,76,0.4); color:var(--gold); }
  .le-input-footer { padding:1.25rem 2.25rem; background:rgba(0,0,0,0.2); border-top:1px solid var(--ink-border); display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; }
  .le-disclaimer { font-size:11px; color:var(--text-muted); max-width:400px; line-height:1.65; }

  /* LOADING */
  .le-loading-wrap { background:var(--ink); min-height:100vh; display:flex; align-items:center; justify-content:center; }
  .le-loading { text-align:center; padding:3rem 2rem; max-width:480px; width:100%; }
  .le-spinner { width:50px; height:50px; margin:0 auto 2rem; border:2.5px solid rgba(255,255,255,0.07); border-top-color:var(--gold); border-radius:50%; animation:le-spin 0.75s linear infinite; box-shadow:0 0 20px rgba(201,168,76,0.15); }
  @keyframes le-spin { to{transform:rotate(360deg)} }
  .le-loading-stage { color:var(--gold); font-size:12px; letter-spacing:2px; text-transform:uppercase; font-weight:600; }
  .le-loading-sub { color:var(--text-muted); font-size:13.5px; margin-top:8px; }
  .le-loading-steps { margin-top:2.5rem; display:flex; flex-direction:column; gap:11px; text-align:left; background:rgba(255,255,255,0.025); border:1px solid var(--ink-border); border-radius:var(--r-md); padding:1.5rem; }
  .le-loading-step { display:flex; align-items:center; gap:12px; font-size:13px; color:var(--text-muted); }
  .le-loading-step.done { color:var(--green); }
  .le-loading-step.active { color:var(--text-primary); font-weight:500; }
  .le-step-dot { width:7px; height:7px; border-radius:50%; background:rgba(255,255,255,0.10); flex-shrink:0; }
  .le-loading-step.done .le-step-dot { background:var(--green); }
  .le-loading-step.active .le-step-dot { background:var(--gold); box-shadow:0 0 10px rgba(201,168,76,0.6); animation:pulse 1.5s ease infinite; }

  /* BANNER */
  .le-banner { background:rgba(12,11,9,0.97); border-bottom:1px solid var(--ink-border); padding:0.75rem 2.5rem; display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; position:sticky; top:65px; z-index:90; backdrop-filter:blur(10px); }
  .le-banner-txt { font-size:13px; color:var(--text-muted); }

  /* RESULTS */
  .le-results { max-width:1000px; margin:0 auto; padding:2.5rem 1.5rem 4rem; }
  .le-results-header { background:linear-gradient(135deg,var(--ink-mid),var(--ink)); border:1px solid rgba(201,168,76,0.18); border-radius:var(--r-xl); padding:2.5rem; margin-bottom:2rem; position:relative; overflow:hidden; }
  .le-results-header::before { content:''; position:absolute; top:-80px; right:-80px; width:280px; height:280px; border-radius:50%; background:radial-gradient(circle,rgba(201,168,76,0.12),transparent 68%); pointer-events:none; }
  .le-results-meta { color:var(--gold); font-size:9.5px; letter-spacing:2px; text-transform:uppercase; margin-bottom:0.75rem; font-weight:600; }
  .le-results-title { font-family:'Cormorant Garamond',serif; color:var(--text-primary); font-size:2.1rem; font-weight:600; margin-bottom:0.6rem; line-height:1.15; letter-spacing:-0.5px; }
  .le-results-sub { color:var(--text-secondary); font-size:14px; line-height:1.75; max-width:660px; }
  .le-insight-box { margin-top:1.5rem; background:rgba(201,168,76,0.07); border:1px solid rgba(201,168,76,0.22); border-left:3px solid var(--gold); border-radius:var(--r-sm); padding:1rem 1.25rem; }

  /* KPIs */
  .le-kpi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:2rem; }
  .le-kpi-card { background:rgba(255,255,255,0.025); border:1px solid var(--ink-border); border-radius:var(--r-lg); padding:1.75rem 1.25rem; text-align:center; transition:transform 0.2s ease,border-color 0.2s; }
  .le-kpi-card:hover { transform:translateY(-2px); border-color:rgba(201,168,76,0.2); }
  .le-kpi-label { font-size:9.5px; letter-spacing:1.5px; text-transform:uppercase; color:var(--text-muted); margin-bottom:0.9rem; font-weight:600; }
  .le-kpi-score { font-family:'Cormorant Garamond',serif; font-size:3.8rem; font-weight:600; line-height:1; }
  .le-kpi-badge { font-size:10.5px; font-weight:600; padding:4px 12px; border-radius:100px; margin-top:10px; display:inline-block; }
  .le-kpi-bar { height:2px; border-radius:100px; background:rgba(255,255,255,0.07); margin-top:1.25rem; overflow:hidden; }
  .le-kpi-fill { height:100%; border-radius:100px; }
  .le-kpi-note { font-size:11px; color:var(--text-muted); margin-top:10px; line-height:1.55; text-align:left; }

  /* SUMMARY */
  .le-summary-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:2rem; }
  .le-summary-stat { background:rgba(255,255,255,0.025); border:1px solid var(--ink-border); border-radius:var(--r-md); padding:1.25rem 1.5rem; }
  .le-summary-label { font-size:9.5px; letter-spacing:1.5px; text-transform:uppercase; color:var(--text-muted); font-weight:600; margin-bottom:6px; }
  .le-summary-val { font-size:1.7rem; font-weight:600; color:var(--text-primary); font-family:'Cormorant Garamond',serif; }
  .le-summary-sub { font-size:11px; color:var(--text-muted); margin-top:4px; }

  /* ACCORDION SECTIONS */
  .le-sec { background:rgba(255,255,255,0.02); border:1px solid var(--ink-border); border-radius:var(--r-lg); margin-bottom:1.25rem; overflow:hidden; }
  .le-sec-head { padding:1.2rem 1.6rem; display:flex; align-items:center; gap:12px; cursor:pointer; transition:background 0.15s; }
  .le-sec-head.open { border-bottom:1px solid var(--ink-border); }
  .le-sec-head:hover { background:rgba(255,255,255,0.025); }
  .le-sec-icon { width:34px; height:34px; border-radius:var(--r-sm); display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; background:rgba(255,255,255,0.04); border:1px solid var(--ink-border); }
  .le-sec-title { font-weight:600; font-size:14.5px; color:var(--text-primary); }
  .le-sec-sub { font-size:12px; color:var(--text-muted); margin-top:2px; }
  .le-sec-count { margin-left:auto; font-size:10.5px; color:var(--text-muted); background:rgba(255,255,255,0.06); padding:3px 10px; border-radius:100px; font-weight:600; flex-shrink:0; }
  .le-sec-chev { margin-left:8px; color:var(--text-muted); font-size:10px; transition:transform 0.25s; flex-shrink:0; }
  .le-sec-body { padding:1.75rem; }

  /* LICENSES */
  .le-lic { border:1px solid var(--ink-border); border-radius:var(--r-md); padding:1.5rem; margin-bottom:1rem; transition:border-color 0.2s; }
  .le-lic:last-child { margin-bottom:0; }
  .le-lic:hover { border-color:rgba(201,168,76,0.22); }
  .le-lic-top { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:0.6rem; }
  .le-lic-name { font-weight:600; font-size:15.5px; color:var(--text-primary); line-height:1.3; }
  .le-lic-org { font-size:12px; color:var(--text-muted); margin-bottom:0.75rem; }
  .le-lic-desc { font-size:13.5px; color:var(--text-secondary); line-height:1.7; margin-bottom:1rem; }
  .le-lic-doc-list { padding:0.85rem 1rem; background:rgba(255,255,255,0.025); border-radius:var(--r-sm); border:1px solid var(--ink-border); margin-bottom:1rem; }
  .le-lic-doc-title { font-size:9.5px; letter-spacing:1.2px; text-transform:uppercase; color:var(--text-muted); font-weight:600; margin-bottom:9px; }
  .le-lic-doc-item { display:flex; align-items:flex-start; gap:8px; font-size:12px; color:var(--text-secondary); padding:5px 0; border-bottom:1px solid rgba(255,255,255,0.035); line-height:1.55; }
  .le-lic-doc-item:last-child { border-bottom:none; }
  .le-lic-meta { display:flex; gap:1.5rem; flex-wrap:wrap; padding-top:0.85rem; border-top:1px solid var(--ink-border); }
  .le-lic-meta-key { color:var(--text-muted); font-size:12px; }
  .le-lic-meta-val { font-weight:600; color:var(--text-primary); font-size:12px; margin-left:4px; }
  .le-priority-badge { font-size:9.5px; font-weight:700; letter-spacing:0.8px; padding:4px 11px; border-radius:100px; text-transform:uppercase; white-space:nowrap; flex-shrink:0; }
  .priority-critical { background:rgba(224,82,82,0.12); color:var(--red); border:1px solid rgba(224,82,82,0.25); }
  .priority-high { background:rgba(224,155,64,0.12); color:var(--amber); border:1px solid rgba(224,155,64,0.25); }
  .priority-medium { background:rgba(107,163,214,0.12); color:var(--blue); border:1px solid rgba(107,163,214,0.25); }
  .priority-low { background:rgba(76,175,125,0.12); color:var(--green); border:1px solid rgba(76,175,125,0.25); }

  /* RISKS */
  .le-risk { border-radius:var(--r-md); padding:1.5rem; margin-bottom:1rem; border:1px solid; }
  .le-risk:last-child { margin-bottom:0; }
  .le-risk-header { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:0.6rem; }
  .le-risk-name { font-weight:600; font-size:14.5px; line-height:1.3; }
  .le-risk-desc { font-size:13px; line-height:1.7; margin-bottom:0.85rem; opacity:0.75; }
  .le-risk-penalty { font-size:12px; font-weight:600; padding:5px 12px; border-radius:var(--r-sm); display:inline-flex; align-items:center; gap:6px; border:1px solid; }
  .le-risk-sev { font-size:9.5px; padding:3px 9px; border-radius:100px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; flex-shrink:0; }

  /* ACTION PLAN */
  .le-action { display:flex; gap:1.25rem; margin-bottom:1.5rem; }
  .le-action:last-child { margin-bottom:0; }
  .le-action-left { display:flex; flex-direction:column; align-items:center; }
  .le-action-num { width:34px; height:34px; border-radius:50%; background:linear-gradient(140deg,var(--gold),var(--gold-light)); color:var(--ink); font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .le-action-line { width:1px; flex:1; background:rgba(255,255,255,0.06); min-height:20px; margin-top:6px; }
  .le-action-content { flex:1; padding-bottom:1rem; }
  .le-action-title { font-weight:600; font-size:14.5px; color:var(--text-primary); margin-bottom:5px; }
  .le-action-desc { font-size:13px; color:var(--text-secondary); line-height:1.7; margin-bottom:10px; }
  .le-action-tags { display:flex; gap:7px; flex-wrap:wrap; }
  .le-action-tag { font-size:11px; padding:4px 11px; border-radius:100px; font-weight:600; border:1px solid; }

  /* NON COMPLIANCE */
  .le-nc { border-radius:var(--r-md); padding:1.5rem; margin-bottom:1rem; border-left:3px solid var(--red); background:rgba(224,82,82,0.055); border-top:1px solid rgba(224,82,82,0.12); border-right:1px solid rgba(224,82,82,0.12); border-bottom:1px solid rgba(224,82,82,0.12); }
  .le-nc:last-child { margin-bottom:0; }
  .le-nc-title { color:var(--red); font-weight:600; font-size:14px; margin-bottom:6px; display:flex; align-items:center; gap:8px; }
  .le-nc-desc { color:var(--text-secondary); font-size:13px; line-height:1.7; }

  /* COST TABLE */
  .le-cost-table { width:100%; border-collapse:collapse; }
  .le-cost-table th { font-size:9.5px; letter-spacing:1.2px; text-transform:uppercase; color:var(--text-muted); font-weight:600; padding:10px 14px; text-align:left; background:rgba(255,255,255,0.025); border-bottom:1px solid var(--ink-border); }
  .le-cost-table td { font-size:13px; padding:12px 14px; border-bottom:1px solid rgba(255,255,255,0.04); color:var(--text-secondary); vertical-align:top; line-height:1.55; }
  .le-cost-table tr:last-child td { border-bottom:none; }
  .le-cost-table tr:hover td { background:rgba(255,255,255,0.018); }
  .le-cost-num { font-weight:700; font-family:'Cormorant Garamond',serif; font-size:16px; color:var(--text-primary); white-space:nowrap; }

  /* BAR CHART */
  .le-bar-row { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
  .le-bar-row:last-child { margin-bottom:0; }
  .le-bar-name { font-size:13px; color:var(--text-secondary); min-width:180px; font-weight:500; }
  .le-bar-track { flex:1; height:6px; background:rgba(255,255,255,0.06); border-radius:100px; overflow:hidden; }
  .le-bar-fill { height:100%; border-radius:100px; }
  .le-bar-val { font-size:12px; font-weight:600; min-width:52px; text-align:right; }

  /* CHECKLIST */
  .le-check-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .le-check-item { display:flex; align-items:flex-start; gap:10px; padding:10px 14px; background:rgba(255,255,255,0.025); border:1px solid var(--ink-border); border-radius:var(--r-sm); font-size:13px; color:var(--text-secondary); line-height:1.55; cursor:pointer; transition:all 0.15s; }
  .le-check-item.checked { background:rgba(76,175,125,0.06); border-color:rgba(76,175,125,0.25); color:var(--text-muted); text-decoration:line-through; }
  .le-check-item:hover { border-color:var(--ink-border2); }

  /* FOLLOW-UP */
  .le-followup { background:rgba(201,168,76,0.05); border:1px solid rgba(201,168,76,0.18); border-radius:var(--r-lg); padding:2rem; margin-top:2rem; }
  .le-followup h3 { font-family:'Cormorant Garamond',serif; color:var(--gold); font-size:1.2rem; font-weight:600; margin-bottom:0.5rem; }
  .le-followup p { color:var(--text-muted); font-size:13px; margin-bottom:1.25rem; }
  .le-followup-qs { display:flex; flex-direction:column; gap:8px; }
  .le-followup-q { background:rgba(255,255,255,0.035); border:1px solid var(--ink-border2); border-radius:var(--r-sm); padding:11px 16px; font-size:13px; color:var(--text-secondary); cursor:pointer; transition:all 0.18s; text-align:left; font-family:'DM Sans',sans-serif; }
  .le-followup-q:hover { background:rgba(201,168,76,0.08); border-color:rgba(201,168,76,0.28); color:var(--gold); transform:translateX(4px); }

  .le-pipeline-badge { display:inline-flex; align-items:center; gap:7px; background:rgba(76,175,125,0.12); border:1px solid rgba(76,175,125,0.25); border-radius:100px; padding:6px 14px; font-size:10.5px; color:var(--green); font-weight:600; }

  /* MISC */
  .le-report-viewer { background:var(--ink); min-height:100vh; }
  .le-report-viewer-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; gap:1rem; }
  .le-dashboard { max-width:860px; margin:0 auto; padding:3rem 1.5rem; }
  .le-report-row { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:1rem 1.25rem; background:rgba(255,255,255,0.025); border:1px solid var(--ink-border); border-radius:var(--r-md); margin-bottom:10px; cursor:pointer; transition:border-color 0.18s,background 0.18s,transform 0.18s; }
  .le-report-row:hover { border-color:rgba(201,168,76,0.28); background:rgba(201,168,76,0.04); transform:translateX(3px); }
  .le-report-row-id { font-size:15px; font-weight:700; color:var(--gold); font-family:'Cormorant Garamond',serif; min-width:80px; }
  .le-report-row-biz { font-size:14px; font-weight:600; color:var(--text-primary); flex:1; }
  .le-report-row-meta { font-size:11px; color:var(--text-muted); }
  .le-email-input { width:100%; padding:10px 14px; border-radius:var(--r-sm); border:1.5px solid var(--ink-border2); background:rgba(255,255,255,0.035); font-family:'DM Sans',sans-serif; font-size:13.5px; color:var(--text-primary); outline:none; transition:border-color 0.2s; }
  .le-email-input:focus { border-color:var(--gold); background:rgba(201,168,76,0.04); }
  .le-email-input::placeholder { color:rgba(255,255,255,0.20); }

  /* ═══════════════════════════════════════════ */
  /* NEW FEATURE STYLES                          */
  /* ═══════════════════════════════════════════ */

  /* SEARCH BAR */
  .le-search-bar { display:flex; gap:10px; margin-bottom:1.5rem; align-items:center; }
  .le-search-input { flex:1; padding:10px 16px 10px 40px; border-radius:var(--r-md); border:1.5px solid var(--ink-border2); background:rgba(255,255,255,0.035); font-family:'DM Sans',sans-serif; font-size:13.5px; color:var(--text-primary); outline:none; transition:border-color 0.2s; }
  .le-search-input:focus { border-color:var(--gold); background:rgba(201,168,76,0.04); }
  .le-search-input::placeholder { color:rgba(255,255,255,0.25); }
  .le-search-wrap { position:relative; flex:1; }
  .le-search-icon { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:var(--text-muted); font-size:14px; pointer-events:none; }
  .le-search-clear { position:absolute; right:13px; top:50%; transform:translateY(-50%); color:var(--text-muted); cursor:pointer; font-size:13px; background:none; border:none; padding:2px; }
  .le-search-clear:hover { color:var(--text-primary); }
  .le-search-count { font-size:11px; color:var(--text-muted); white-space:nowrap; padding:0 8px; }
  .le-search-highlight { background:rgba(201,168,76,0.25); color:var(--gold); border-radius:3px; padding:0 2px; }

  /* SHARE BUTTON + TOAST */
  .le-share-btn { display:inline-flex; align-items:center; gap:7px; background:rgba(107,163,214,0.12); border:1px solid rgba(107,163,214,0.25); color:var(--blue); font-size:12px; font-weight:600; padding:7px 14px; border-radius:100px; cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif; }
  .le-share-btn:hover { background:rgba(107,163,214,0.2); border-color:rgba(107,163,214,0.4); }
  .le-toast { position:fixed; bottom:2rem; left:50%; transform:translateX(-50%) translateY(80px); background:rgba(30,28,22,0.98); border:1px solid rgba(201,168,76,0.3); color:var(--gold); font-size:13px; font-weight:500; padding:11px 24px; border-radius:100px; z-index:9999; backdrop-filter:blur(12px); box-shadow:0 8px 32px rgba(0,0,0,0.5); transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1),opacity 0.35s; opacity:0; pointer-events:none; }
  .le-toast.show { transform:translateX(-50%) translateY(0); opacity:1; pointer-events:auto; }

  /* PROGRESS TRACKER */
  .le-progress-bar-outer { height:4px; background:rgba(255,255,255,0.06); border-radius:100px; margin-bottom:1.5rem; overflow:hidden; }
  .le-progress-bar-inner { height:100%; border-radius:100px; background:linear-gradient(90deg,var(--gold),var(--gold-light)); transition:width 0.6s cubic-bezier(0.34,1.56,0.64,1); }
  .le-progress-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:0.5rem; }
  .le-progress-label { font-size:11px; color:var(--text-muted); font-weight:600; text-transform:uppercase; letter-spacing:1px; }
  .le-progress-pct { font-family:'Cormorant Garamond',serif; font-size:1.2rem; font-weight:600; color:var(--gold); }
  .le-check-item-tracker { display:flex; align-items:flex-start; gap:12px; padding:12px 16px; background:rgba(255,255,255,0.025); border:1px solid var(--ink-border); border-radius:var(--r-sm); font-size:13px; color:var(--text-secondary); line-height:1.55; cursor:pointer; transition:all 0.2s; margin-bottom:8px; }
  .le-check-item-tracker:last-child { margin-bottom:0; }
  .le-check-item-tracker.checked { background:rgba(76,175,125,0.06); border-color:rgba(76,175,125,0.22); color:var(--text-muted); }
  .le-check-item-tracker:hover { border-color:var(--ink-border2); transform:translateX(3px); }
  .le-check-box { width:20px; height:20px; border-radius:6px; border:1.5px solid rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.2s; background:rgba(255,255,255,0.03); margin-top:1px; }
  .le-check-item-tracker.checked .le-check-box { background:var(--green); border-color:var(--green); }
  .le-check-box-tick { color:#fff; font-size:11px; font-weight:700; opacity:0; transition:opacity 0.15s; }
  .le-check-item-tracker.checked .le-check-box-tick { opacity:1; }

  /* TIMELINE VIEW */
  .le-timeline { position:relative; padding-left:0; }
  .le-timeline-week { margin-bottom:2rem; }
  .le-timeline-week-label { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--gold); font-weight:600; margin-bottom:0.75rem; padding-bottom:0.5rem; border-bottom:1px solid rgba(201,168,76,0.15); }
  .le-timeline-item { display:flex; gap:12px; margin-bottom:8px; padding:12px 14px; background:rgba(255,255,255,0.025); border:1px solid var(--ink-border); border-radius:var(--r-sm); align-items:center; transition:border-color 0.15s; }
  .le-timeline-item:hover { border-color:rgba(201,168,76,0.2); }
  .le-timeline-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
  .le-timeline-title { font-size:13.5px; font-weight:600; color:var(--text-primary); flex:1; }
  .le-timeline-cat { font-size:10.5px; font-weight:600; padding:3px 9px; border-radius:100px; flex-shrink:0; }
  .le-timeline-cost { font-size:11px; color:var(--gold); font-weight:600; font-family:'Cormorant Garamond',serif; font-size:13px; flex-shrink:0; }

  /* COST CALCULATOR */
  .le-calc-wrap { background:rgba(255,255,255,0.02); border:1px solid var(--ink-border); border-radius:var(--r-lg); padding:1.75rem; margin-top:1.5rem; }
  .le-calc-title { font-family:'Cormorant Garamond',serif; color:var(--text-primary); font-size:1.3rem; font-weight:600; margin-bottom:1.25rem; }
  .le-calc-row { display:flex; align-items:center; gap:12px; margin-bottom:1rem; }
  .le-calc-row:last-of-type { margin-bottom:0; }
  .le-calc-label { font-size:13px; color:var(--text-secondary); flex:1; min-width:140px; }
  .le-calc-slider { flex:2; -webkit-appearance:none; appearance:none; height:4px; border-radius:100px; background:rgba(255,255,255,0.08); outline:none; cursor:pointer; }
  .le-calc-slider::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background:linear-gradient(140deg,var(--gold),var(--gold-light)); cursor:pointer; box-shadow:0 0 8px rgba(201,168,76,0.4); transition:transform 0.15s; }
  .le-calc-slider::-webkit-slider-thumb:hover { transform:scale(1.2); }
  .le-calc-val { font-family:'Cormorant Garamond',serif; font-size:1rem; font-weight:600; color:var(--gold); min-width:100px; text-align:right; }
  .le-calc-total { display:flex; align-items:center; justify-content:space-between; margin-top:1.5rem; padding-top:1.25rem; border-top:1px solid var(--ink-border); }
  .le-calc-total-label { font-size:12px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; }
  .le-calc-total-val { font-family:'Cormorant Garamond',serif; font-size:2rem; font-weight:600; color:var(--gold); }
  .le-calc-breakdown { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:1rem; }
  .le-calc-breakdown-item { display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); padding:7px 10px; background:rgba(255,255,255,0.025); border-radius:var(--r-sm); }
  .le-calc-breakdown-item strong { color:var(--text-secondary); }

  /* COMPARISON MODE */
  .le-compare-wrap { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; }
  .le-compare-col { background:rgba(255,255,255,0.025); border:1px solid var(--ink-border); border-radius:var(--r-lg); overflow:hidden; }
  .le-compare-col-header { padding:1.25rem 1.5rem; background:rgba(201,168,76,0.06); border-bottom:1px solid rgba(201,168,76,0.12); }
  .le-compare-col-title { font-family:'Cormorant Garamond',serif; font-size:1.1rem; font-weight:600; color:var(--text-primary); }
  .le-compare-col-meta { font-size:11px; color:var(--text-muted); margin-top:3px; }
  .le-compare-col-body { padding:1.25rem 1.5rem; }
  .le-compare-row { display:flex; justify-content:space-between; align-items:flex-start; padding:8px 0; border-bottom:1px solid var(--ink-border); font-size:13px; }
  .le-compare-row:last-child { border-bottom:none; }
  .le-compare-key { color:var(--text-muted); font-size:12px; }
  .le-compare-val { color:var(--text-primary); font-weight:600; text-align:right; max-width:55%; }
  .le-compare-win { color:var(--green); }
  .le-compare-empty { text-align:center; padding:3rem 2rem; color:var(--text-muted); font-size:13px; }
  .le-compare-score-row { display:flex; align-items:center; gap:10px; margin-bottom:0.75rem; }
  .le-compare-score-label { font-size:11px; color:var(--text-muted); min-width:90px; }
  .le-compare-score-track { flex:1; height:6px; background:rgba(255,255,255,0.06); border-radius:100px; overflow:hidden; }
  .le-compare-score-fill { height:100%; border-radius:100px; }
  .le-compare-score-num { font-size:12px; font-weight:600; min-width:36px; text-align:right; }

  /* LICENSE APPLY ASSISTANT */
  .le-assistant-wrap { max-width:680px; margin:0 auto; }
  .le-assistant-progress { display:flex; gap:0; margin-bottom:2rem; border-radius:100px; overflow:hidden; border:1px solid var(--ink-border); }
  .le-assistant-step { flex:1; padding:8px 4px; text-align:center; font-size:11px; font-weight:600; color:var(--text-muted); letter-spacing:0.5px; background:rgba(255,255,255,0.02); transition:all 0.2s; }
  .le-assistant-step.active { background:rgba(201,168,76,0.12); color:var(--gold); }
  .le-assistant-step.done { background:rgba(76,175,125,0.10); color:var(--green); }
  .le-assistant-card { background:rgba(255,255,255,0.025); border:1px solid var(--ink-border2); border-radius:var(--r-xl); padding:2.5rem; }
  .le-assistant-card h3 { font-family:'Cormorant Garamond',serif; font-size:1.6rem; font-weight:600; color:var(--text-primary); margin-bottom:0.5rem; }
  .le-assistant-card p { color:var(--text-secondary); font-size:14px; line-height:1.7; margin-bottom:1.5rem; }
  .le-assistant-checklist { display:flex; flex-direction:column; gap:8px; margin-bottom:1.5rem; }
  .le-assistant-item { display:flex; align-items:flex-start; gap:12px; padding:12px 14px; background:rgba(255,255,255,0.03); border:1px solid var(--ink-border); border-radius:var(--r-sm); cursor:pointer; transition:all 0.15s; }
  .le-assistant-item.checked { background:rgba(76,175,125,0.07); border-color:rgba(76,175,125,0.22); }
  .le-assistant-item-box { width:22px; height:22px; border-radius:6px; border:1.5px solid rgba(255,255,255,0.18); display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.2s; background:rgba(255,255,255,0.03); }
  .le-assistant-item.checked .le-assistant-item-box { background:var(--green); border-color:var(--green); }
  .le-assistant-item-text { font-size:13.5px; color:var(--text-secondary); line-height:1.55; }
  .le-assistant-link { display:inline-flex; align-items:center; gap:8px; background:rgba(107,163,214,0.10); border:1px solid rgba(107,163,214,0.25); color:var(--blue); font-size:13px; font-weight:600; padding:10px 18px; border-radius:var(--r-sm); text-decoration:none; transition:all 0.2s; margin-top:0.5rem; }
  .le-assistant-link:hover { background:rgba(107,163,214,0.18); transform:translateY(-1px); }
  .le-assistant-nav { display:flex; gap:10px; justify-content:space-between; margin-top:1.5rem; }

  /* EXPORT BUTTONS */
  .le-export-btn { display:inline-flex; align-items:center; gap:7px; background:rgba(76,175,125,0.10); border:1px solid rgba(76,175,125,0.25); color:var(--green); font-size:12px; font-weight:600; padding:7px 14px; border-radius:100px; cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif; }
  .le-export-btn:hover { background:rgba(76,175,125,0.18); border-color:rgba(76,175,125,0.4); transform:translateY(-1px); }

  /* MODAL OVERLAY */
  .le-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:500; display:flex; align-items:center; justify-content:center; padding:2rem; backdrop-filter:blur(6px); }
  .le-modal { background:var(--ink-mid); border:1px solid var(--ink-border2); border-radius:var(--r-xl); max-width:560px; width:100%; max-height:90vh; overflow-y:auto; box-shadow:0 40px 80px rgba(0,0,0,0.7); }
  .le-modal-header { padding:1.75rem 2rem 1.25rem; border-bottom:1px solid var(--ink-border); display:flex; align-items:center; justify-content:space-between; }
  .le-modal-title { font-family:'Cormorant Garamond',serif; font-size:1.5rem; font-weight:600; color:var(--text-primary); }
  .le-modal-close { background:rgba(255,255,255,0.06); border:1px solid var(--ink-border); color:var(--text-muted); width:32px; height:32px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px; transition:all 0.15s; }
  .le-modal-close:hover { background:rgba(255,255,255,0.12); color:var(--text-primary); }
  .le-modal-body { padding:1.75rem 2rem; }

  /* FEATURE TOOLBAR (in results banner) */
  .le-toolbar { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }

  /* LANDING EXPERIENCE */
  :root {
    --landing-bg: #0B0B0F;
    --landing-surface: #13100d;
    --landing-border: rgba(201,168,76,0.2);
    --landing-text: #FFFFFF;
    --landing-muted: rgba(255,255,255,0.62);
    --landing-grad: linear-gradient(135deg, #8C6E2F, #C9A84C, #E8C97A);
    --landing-ease: cubic-bezier(0.22, 1, 0.36, 1);
    --landing-shadow: 0 30px 80px rgba(0, 0, 0, 0.42);
  }

  .le-root-landing { background:var(--landing-bg); color:var(--landing-text); }
  .le-root-landing .le-nav {
    background:rgba(11,11,15,0.72);
    border-bottom:1px solid rgba(201,168,76,0.16);
    backdrop-filter:blur(22px);
  }
  .le-root-landing .le-nav-logo-mark {
    background:var(--landing-grad);
    color:#0C0B09;
    box-shadow:0 12px 32px rgba(201,168,76,0.2);
  }
  .le-root-landing .le-nav-tag,
  .le-root-landing .le-nav-pill {
    color:var(--landing-muted);
  }
  .le-root-landing .le-nav-pill {
    background:rgba(201,168,76,0.08);
    border:1px solid rgba(201,168,76,0.2);
  }
  .le-root-landing .le-btn-ghost {
    background:rgba(201,168,76,0.08);
    border:1px solid rgba(201,168,76,0.2);
    color:var(--landing-text);
  }
  .le-root-landing .le-btn-ghost:hover {
    background:rgba(201,168,76,0.14);
    border-color:rgba(201,168,76,0.28);
  }

  .lp-shell {
    position:relative;
    overflow:hidden;
    background:
      radial-gradient(circle at 15% 20%, rgba(201,168,76,0.16), transparent 24%),
      radial-gradient(circle at 80% 10%, rgba(232,201,122,0.1), transparent 26%),
      radial-gradient(circle at 50% 60%, rgba(140,110,47,0.12), transparent 34%),
      var(--landing-bg);
  }
  .lp-shell::before {
    content:"";
    position:fixed;
    inset:0;
    pointer-events:none;
    opacity:0.075;
    background-image:
      linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
    background-size:120px 120px;
    mask-image:radial-gradient(circle at center, black 30%, transparent 85%);
  }
  .lp-noise,
  .lp-cursor,
  .lp-progress {
    pointer-events:none;
    position:fixed;
    z-index:40;
  }
  .lp-noise {
    inset:0;
    opacity:0.08;
    mix-blend-mode:soft-light;
    background-image:
      radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25) 0 0.8px, transparent 1px),
      radial-gradient(circle at 80% 30%, rgba(255,255,255,0.18) 0 0.8px, transparent 1px),
      radial-gradient(circle at 30% 70%, rgba(255,255,255,0.16) 0 1px, transparent 1.2px);
    background-size:10px 10px, 13px 13px, 17px 17px;
  }
  .lp-progress {
    top:0;
    left:0;
    width:100%;
    height:2px;
    background:rgba(255,255,255,0.04);
  }
  .lp-progress-bar {
    height:100%;
    background:var(--landing-grad);
    box-shadow:0 0 24px rgba(201,168,76,0.4);
    transform-origin:left center;
  }
  .lp-cursor {
    top:0;
    left:0;
    width:180px;
    height:180px;
    border-radius:50%;
    background:radial-gradient(circle, rgba(201,168,76,0.26) 0%, rgba(201,168,76,0.1) 35%, transparent 72%);
    filter:blur(10px);
    transform:translate3d(-50%, -50%, 0);
    transition:width 220ms var(--landing-ease), height 220ms var(--landing-ease), opacity 220ms var(--landing-ease);
    opacity:0.9;
  }
  .lp-cursor.active {
    width:260px;
    height:260px;
    opacity:1;
  }
  .lp-ambient {
    position:absolute;
    inset:0;
    overflow:hidden;
    pointer-events:none;
  }
  .lp-particle {
    position:absolute;
    border-radius:50%;
    background:rgba(232,201,122,0.22);
    box-shadow:0 0 30px rgba(201,168,76,0.12);
    animation:lpFloat var(--dur) ease-in-out infinite;
    animation-delay:var(--delay);
  }
  @keyframes lpFloat {
    0%,100% { transform:translate3d(0,0,0) scale(1); opacity:0.2; }
    50% { transform:translate3d(0,-18px,0) scale(1.12); opacity:0.55; }
  }

  .lp-section {
    position:relative;
    z-index:1;
  }
  .lp-container {
    width:min(1200px, calc(100% - 48px));
    margin:0 auto;
  }
  .lp-kicker {
    display:inline-flex;
    align-items:center;
    gap:10px;
    padding:8px 14px;
    border-radius:999px;
    border:1px solid rgba(201,168,76,0.16);
    background:rgba(201,168,76,0.07);
    backdrop-filter:blur(18px);
    color:var(--landing-muted);
    font-size:11px;
    letter-spacing:0.24em;
    text-transform:uppercase;
  }
  .lp-kicker-dot {
    width:7px;
    height:7px;
    border-radius:50%;
    background:var(--landing-grad);
    box-shadow:0 0 14px rgba(201,168,76,0.55);
  }
  .lp-hero {
    min-height:calc(100vh - 73px);
    display:flex;
    align-items:center;
    padding:56px 0 36px;
  }
  .lp-hero-grid {
    display:grid;
    grid-template-columns:minmax(0, 1.05fr) minmax(380px, 0.95fr);
    gap:48px;
    align-items:center;
  }
  .lp-hero-copy {
    position:relative;
    z-index:2;
  }
  .lp-title {
    margin:20px 0 18px;
    font-size:clamp(4rem, 10vw, 8rem);
    line-height:0.92;
    letter-spacing:-0.08em;
    font-weight:700;
  }
  .lp-title span {
    display:block;
  }
  .lp-title-glow {
    background:var(--landing-grad);
    -webkit-background-clip:text;
    background-clip:text;
    color:transparent;
    filter:drop-shadow(0 12px 44px rgba(201,168,76,0.24));
  }
  .lp-subtitle {
    max-width:620px;
    font-size:clamp(1.1rem, 2vw, 1.4rem);
    line-height:1.75;
    color:var(--landing-muted);
  }
  .lp-hero-actions,
  .lp-hero-meta {
    display:flex;
    flex-wrap:wrap;
    gap:14px;
    align-items:center;
  }
  .lp-hero-actions { margin-top:32px; }
  .lp-hero-meta { margin-top:24px; }
  .lp-glass-btn,
  .lp-secondary-btn {
    position:relative;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    gap:10px;
    min-height:54px;
    padding:0 24px;
    border-radius:999px;
    border:1px solid rgba(201,168,76,0.22);
    text-decoration:none;
    cursor:pointer;
    overflow:hidden;
    transition:transform 260ms var(--landing-ease), box-shadow 260ms var(--landing-ease), border-color 260ms var(--landing-ease), background 260ms var(--landing-ease);
    backdrop-filter:blur(18px);
    font-family:'DM Sans',sans-serif;
    font-size:14px;
    font-weight:600;
  }
  .lp-glass-btn {
    color:#0C0B09;
    background:var(--landing-grad);
    box-shadow:0 20px 44px rgba(201,168,76,0.22), inset 0 1px 0 rgba(255,255,255,0.2);
  }
  .lp-secondary-btn {
    color:var(--landing-text);
    background:rgba(201,168,76,0.06);
    box-shadow:inset 0 1px 0 rgba(255,255,255,0.04);
  }
  .lp-glass-btn:hover,
  .lp-secondary-btn:hover {
    transform:translateY(-3px);
    border-color:rgba(255,255,255,0.22);
    box-shadow:0 24px 52px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.04) inset;
  }
  .lp-stat-row {
    display:grid;
    grid-template-columns:repeat(3, minmax(0, 1fr));
    gap:14px;
    margin-top:42px;
  }
  .lp-stat {
    padding:18px 20px;
    border-radius:24px;
    border:1px solid rgba(201,168,76,0.14);
    background:rgba(201,168,76,0.05);
    backdrop-filter:blur(20px);
    box-shadow:var(--landing-shadow);
  }
  .lp-stat-value {
    font-size:clamp(1.5rem, 3vw, 2.6rem);
    font-weight:700;
    color:#fff;
  }
  .lp-stat-label {
    margin-top:6px;
    color:var(--landing-muted);
    font-size:12px;
    letter-spacing:0.1em;
    text-transform:uppercase;
  }
  .lp-visual {
    position:relative;
    min-height:680px;
    display:flex;
    align-items:center;
    justify-content:center;
  }
  .lp-hero-beam {
    position:absolute;
    inset:6% 12% auto 12%;
    height:72%;
    border-radius:50%;
    background:
      linear-gradient(180deg, rgba(232,201,122,0.14), transparent 28%),
      radial-gradient(circle at 50% 0%, rgba(201,168,76,0.32), transparent 44%);
    filter:blur(22px);
    opacity:0.9;
  }
  .lp-vault {
    position:relative;
    width:min(100%, 560px);
    min-height:620px;
    padding:28px;
    border-radius:34px;
    border:1px solid rgba(201,168,76,0.22);
    background:
      linear-gradient(180deg, rgba(201,168,76,0.1), rgba(19,16,13,0.96) 16%),
      linear-gradient(180deg, rgba(19,16,13,0.9), rgba(7,7,8,0.98));
    box-shadow:0 40px 120px rgba(0,0,0,0.56), inset 0 1px 0 rgba(255,255,255,0.06);
    overflow:hidden;
  }
  .lp-vault::before {
    content:"";
    position:absolute;
    inset:18px;
    border-radius:26px;
    border:1px solid rgba(201,168,76,0.1);
    pointer-events:none;
  }
  .lp-vault-grid {
    position:absolute;
    inset:0;
    background-image:
      linear-gradient(rgba(201,168,76,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(201,168,76,0.06) 1px, transparent 1px);
    background-size:54px 54px;
    mask-image:linear-gradient(180deg, rgba(0,0,0,0.75), transparent 92%);
  }
  .lp-vault-frame {
    position:relative;
    height:100%;
    border-radius:24px;
    overflow:hidden;
  }
  .lp-vault-arch {
    position:absolute;
    inset:7% 10% auto;
    height:320px;
    border-radius:320px 320px 24px 24px;
    border:1px solid rgba(201,168,76,0.26);
    background:
      radial-gradient(circle at 50% 16%, rgba(232,201,122,0.34), rgba(201,168,76,0.06) 32%, transparent 60%),
      linear-gradient(180deg, rgba(255,255,255,0.06), rgba(201,168,76,0.05) 40%, transparent 100%);
    box-shadow:inset 0 1px 0 rgba(255,255,255,0.08), 0 30px 70px rgba(201,168,76,0.08);
  }
  .lp-vault-arch::before,
  .lp-vault-arch::after {
    content:"";
    position:absolute;
    top:12%;
    bottom:10%;
    width:1px;
    background:linear-gradient(180deg, transparent, rgba(201,168,76,0.28), transparent);
  }
  .lp-vault-arch::before { left:24%; }
  .lp-vault-arch::after { right:24%; }
  .lp-vault-core {
    position:absolute;
    inset:16% 23% auto;
    height:210px;
    border-radius:50%;
    background:
      radial-gradient(circle at 50% 40%, rgba(255,255,255,0.3), rgba(232,201,122,0.18) 28%, rgba(201,168,76,0.06) 54%, transparent 72%),
      radial-gradient(circle at 50% 50%, rgba(201,168,76,0.28), transparent 66%);
    filter:blur(2px);
    box-shadow:0 0 90px rgba(201,168,76,0.18);
  }
  .lp-vault-column {
    position:absolute;
    bottom:17%;
    width:84px;
    border-radius:24px 24px 18px 18px;
    border:1px solid rgba(201,168,76,0.2);
    background:linear-gradient(180deg, rgba(232,201,122,0.12), rgba(19,16,13,0.95));
    box-shadow:inset 0 1px 0 rgba(255,255,255,0.06);
  }
  .lp-vault-column.left { left:14%; height:250px; }
  .lp-vault-column.mid { left:calc(50% - 42px); height:330px; }
  .lp-vault-column.right { right:14%; height:220px; }
  .lp-vault-column::before {
    content:"";
    position:absolute;
    left:14px;
    right:14px;
    top:18px;
    height:5px;
    border-radius:999px;
    background:var(--landing-grad);
    box-shadow:0 0 20px rgba(201,168,76,0.32);
  }
  .lp-vault-column::after {
    content:"";
    position:absolute;
    left:18px;
    right:18px;
    bottom:18px;
    top:42px;
    border-radius:16px;
    background:linear-gradient(180deg, rgba(255,255,255,0.05), transparent 46%);
  }
  .lp-vault-scan {
    position:absolute;
    left:12%;
    right:12%;
    bottom:10%;
    height:68px;
    border-radius:20px;
    border:1px solid rgba(201,168,76,0.2);
    background:rgba(19,16,13,0.86);
    overflow:hidden;
  }
  .lp-vault-scan::before {
    content:"";
    position:absolute;
    inset:12px;
    border-radius:14px;
    background:
      linear-gradient(90deg, rgba(201,168,76,0.14), transparent 24%, rgba(201,168,76,0.12) 44%, transparent 62%, rgba(201,168,76,0.1)),
      linear-gradient(180deg, rgba(255,255,255,0.06), transparent);
  }
  .lp-vault-chip {
    position:absolute;
    min-width:170px;
    padding:14px 16px;
    border-radius:18px;
    border:1px solid rgba(201,168,76,0.18);
    background:rgba(19,16,13,0.74);
    color:#fff;
    backdrop-filter:blur(20px);
    box-shadow:0 22px 44px rgba(0,0,0,0.34);
  }
  .lp-vault-chip strong {
    display:block;
    font-size:11px;
    color:#E8C97A;
    letter-spacing:0.16em;
    text-transform:uppercase;
    margin-bottom:8px;
  }
  .lp-vault-chip span {
    display:block;
    font-size:28px;
    line-height:1;
    color:#fff;
    font-weight:700;
  }
  .lp-vault-chip p {
    margin-top:8px;
    font-size:12px;
    color:var(--landing-muted);
    line-height:1.5;
  }
  .lp-vault-chip.top { top:7%; right:2%; }
  .lp-vault-chip.left { left:0; bottom:22%; }
  .lp-vault-chip.right { right:0; bottom:28%; }
  .lp-orb-wrap {
    position:relative;
    width:min(100%, 560px);
    aspect-ratio:1 / 1;
  }
  .lp-orb-glow,
  .lp-orb,
  .lp-ring,
  .lp-float-card {
    position:absolute;
  }
  .lp-orb-glow {
    inset:12%;
    border-radius:50%;
    background:
      radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85), rgba(255,255,255,0.12) 18%, transparent 32%),
      radial-gradient(circle at 50% 50%, rgba(255,255,255,0.32), rgba(255,255,255,0.08) 38%, rgba(11,11,15,0) 68%);
    filter:blur(24px);
    opacity:0.85;
  }
  .lp-orb {
    inset:18%;
    border-radius:50%;
    background:
      radial-gradient(circle at 30% 28%, rgba(255,255,255,0.9) 0, rgba(255,255,255,0.18) 12%, transparent 18%),
      radial-gradient(circle at 68% 70%, rgba(255,255,255,0.18), transparent 34%),
      conic-gradient(from 180deg at 50% 50%, rgba(255,255,255,0.2), rgba(255,255,255,0.03), rgba(255,255,255,0.15), rgba(255,255,255,0.03), rgba(255,255,255,0.2));
    border:1px solid rgba(255,255,255,0.18);
    box-shadow:0 32px 120px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -40px 80px rgba(11,11,15,0.32);
  }
  .lp-orb-wire {
    position:absolute;
    inset:22%;
    border-radius:50%;
    border:1px solid rgba(255,255,255,0.12);
    box-shadow:inset 0 0 0 1px rgba(255,255,255,0.04);
  }
  .lp-orb-wire::before,
  .lp-orb-wire::after {
    content:"";
    position:absolute;
    inset:8%;
    border-radius:50%;
    border:1px dashed rgba(255,255,255,0.14);
    transform:rotate(18deg);
  }
  .lp-orb-wire::after {
    inset:20% 6%;
    transform:rotate(-28deg);
  }
  .lp-orb-shard {
    position:absolute;
    border-radius:999px;
    background:linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0.02));
    border:1px solid rgba(255,255,255,0.12);
    box-shadow:0 10px 40px rgba(255,255,255,0.08);
  }
  .lp-orb-shard.shard-a {
    width:14px;
    height:180px;
    top:14%;
    left:20%;
    transform:rotate(-28deg);
  }
  .lp-orb-shard.shard-b {
    width:10px;
    height:120px;
    right:16%;
    top:22%;
    transform:rotate(34deg);
  }
  .lp-orb-shard.shard-c {
    width:18px;
    height:140px;
    bottom:16%;
    right:22%;
    transform:rotate(-42deg);
  }
  .lp-ring {
    inset:8%;
    border-radius:50%;
    border:1px solid rgba(255,255,255,0.1);
  }
  .lp-ring.ring-2 { inset:2%; opacity:0.45; }
  .lp-orb-core {
    position:absolute;
    inset:36%;
    border-radius:50%;
    background:radial-gradient(circle, rgba(255,255,255,0.8), rgba(255,255,255,0.14) 34%, transparent 68%);
    filter:blur(3px);
  }
  .lp-float-card {
    min-width:170px;
    padding:16px 18px;
    border-radius:22px;
    border:1px solid rgba(255,255,255,0.1);
    background:rgba(17,17,22,0.58);
    color:#fff;
    box-shadow:var(--landing-shadow);
    backdrop-filter:blur(20px);
  }
  .lp-float-card strong {
    display:block;
    font-size:12px;
    text-transform:uppercase;
    letter-spacing:0.14em;
    color:var(--landing-muted);
    margin-bottom:8px;
  }
  .lp-float-card span {
    display:block;
    font-size:28px;
    font-weight:700;
    line-height:1;
  }
  .lp-float-card p {
    margin-top:8px;
    color:var(--landing-muted);
    font-size:12px;
    line-height:1.55;
  }
  .lp-float-a { top:8%; right:5%; }
  .lp-float-b { bottom:12%; left:0; }
  .lp-float-c { top:58%; right:-2%; }

  .lp-panel {
    border-radius:30px;
    border:1px solid rgba(201,168,76,0.14);
    background:linear-gradient(180deg, rgba(201,168,76,0.08), rgba(19,16,13,0.88) 18%, rgba(17,17,22,0.85));
    box-shadow:var(--landing-shadow);
    backdrop-filter:blur(18px);
  }
  .lp-intro {
    padding:140px 0 40px;
  }
  .lp-intro-grid {
    display:grid;
    grid-template-columns:1.05fr 0.95fr;
    gap:24px;
    align-items:stretch;
  }
  .lp-intro-copy,
  .lp-intro-visual {
    padding:34px;
  }
  .lp-h2 {
    font-size:clamp(2.4rem, 5vw, 4.8rem);
    line-height:0.96;
    letter-spacing:-0.06em;
    margin:18px 0 16px;
    font-weight:700;
  }
  .lp-copy {
    color:var(--landing-muted);
    line-height:1.85;
    font-size:1.02rem;
    max-width:52ch;
  }
  .lp-intro-visual {
    position:relative;
    overflow:hidden;
    min-height:420px;
  }
  .lp-intro-visual::before,
  .lp-intro-visual::after {
    content:"";
    position:absolute;
    inset:auto;
    border-radius:50%;
    filter:blur(16px);
  }
  .lp-intro-visual::before {
    width:280px;
    height:280px;
    right:-30px;
    top:-40px;
    background:rgba(255,255,255,0.18);
  }
  .lp-intro-visual::after {
    width:240px;
    height:240px;
    left:-30px;
    bottom:-10px;
    background:rgba(255,255,255,0.1);
  }
  .lp-stack {
    position:relative;
    height:100%;
    min-height:350px;
  }
  .lp-stack-card {
    position:absolute;
    inset:auto;
    width:min(100%, 320px);
    padding:22px;
    border-radius:24px;
    border:1px solid rgba(255,255,255,0.08);
    background:rgba(19,16,13,0.6);
    backdrop-filter:blur(18px);
    box-shadow:var(--landing-shadow);
  }
  .lp-stack-card:nth-child(1) { top:8%; left:4%; }
  .lp-stack-card:nth-child(2) { top:28%; right:6%; }
  .lp-stack-card:nth-child(3) { bottom:7%; left:16%; }
  .lp-stack-label {
    display:flex;
    justify-content:space-between;
    gap:12px;
    color:var(--landing-muted);
    font-size:11px;
    text-transform:uppercase;
    letter-spacing:0.14em;
    margin-bottom:18px;
  }
  .lp-stack-line {
    height:10px;
    border-radius:999px;
    background:rgba(201,168,76,0.08);
    margin-bottom:10px;
    overflow:hidden;
  }
  .lp-stack-line > span {
    display:block;
    height:100%;
    border-radius:inherit;
    background:var(--landing-grad);
  }

  .lp-depth {
    height:220vh;
    margin-top:80px;
  }
  .lp-depth-sticky {
    position:sticky;
    top:92px;
    height:calc(100vh - 120px);
    display:grid;
    place-items:center;
  }
  .lp-depth-frame {
    position:relative;
    width:min(1200px, calc(100% - 48px));
    height:min(78vh, 760px);
    border-radius:38px;
    overflow:hidden;
    border:1px solid rgba(255,255,255,0.08);
    background:linear-gradient(180deg, rgba(17,17,22,0.85), rgba(11,11,15,0.96));
    box-shadow:var(--landing-shadow);
  }
  .lp-depth-layer {
    position:absolute;
    inset:0;
    will-change:transform, opacity;
  }
  .lp-depth-bg {
    background:
      radial-gradient(circle at 15% 18%, rgba(201,168,76,0.24), transparent 26%),
      radial-gradient(circle at 82% 25%, rgba(232,201,122,0.14), transparent 24%),
      radial-gradient(circle at 46% 65%, rgba(140,110,47,0.16), transparent 28%),
      linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
    transform:scale(1.12);
  }
  .lp-depth-grid {
    inset:6%;
    border-radius:28px;
    border:1px solid rgba(255,255,255,0.05);
    background-image:
      linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
    background-size:52px 52px;
    opacity:0.35;
  }
  .lp-depth-content {
    position:absolute;
    inset:0;
    display:grid;
    grid-template-columns:0.95fr 1.05fr;
    gap:24px;
    align-items:end;
    padding:48px;
  }
  .lp-depth-copy {
    align-self:center;
    max-width:480px;
  }
  .lp-depth-copy h3 {
    font-size:clamp(2.2rem, 4vw, 4rem);
    line-height:1;
    letter-spacing:-0.05em;
    margin:16px 0;
  }
  .lp-depth-copy p {
    color:var(--landing-muted);
    line-height:1.85;
    font-size:1rem;
  }
  .lp-depth-cards {
    position:relative;
    height:100%;
    min-height:420px;
  }
  .lp-depth-card {
    position:absolute;
    width:min(320px, 72%);
    padding:22px;
    border-radius:26px;
    border:1px solid rgba(201,168,76,0.16);
    background:rgba(19,16,13,0.76);
    backdrop-filter:blur(18px);
    box-shadow:var(--landing-shadow);
  }
  .lp-depth-card h4 {
    font-size:1.1rem;
    margin-bottom:10px;
  }
  .lp-depth-card p {
    color:var(--landing-muted);
    line-height:1.7;
    font-size:0.95rem;
  }
  .lp-depth-card.one { top:4%; right:8%; }
  .lp-depth-card.two { top:34%; left:8%; }
  .lp-depth-card.three { bottom:6%; right:14%; }

  .lp-horizontal {
    padding:120px 0;
  }
  .lp-horizontal-head {
    display:flex;
    justify-content:space-between;
    gap:24px;
    align-items:end;
    margin-bottom:34px;
  }
  .lp-horizontal-stage {
    overflow:hidden;
    border-radius:34px;
    border:1px solid rgba(201,168,76,0.14);
    background:rgba(201,168,76,0.05);
    box-shadow:var(--landing-shadow);
    padding:28px;
  }
  .lp-horizontal-track {
    display:grid;
    grid-auto-flow:column;
    grid-auto-columns:minmax(320px, 32vw);
    gap:18px;
    will-change:transform;
  }
  .lp-story-card {
    position:relative;
    min-height:360px;
    padding:24px;
    border-radius:28px;
    overflow:hidden;
    border:1px solid rgba(201,168,76,0.14);
    background:linear-gradient(180deg, rgba(201,168,76,0.08), rgba(19,16,13,0.94));
    transition:transform 350ms var(--landing-ease), border-color 350ms var(--landing-ease), box-shadow 350ms var(--landing-ease);
  }
  .lp-story-card::before {
    content:"";
    position:absolute;
    inset:auto -20% -30% auto;
    width:240px;
    height:240px;
    border-radius:50%;
    background:radial-gradient(circle, rgba(201,168,76,0.14), transparent 66%);
  }
  .lp-story-card:hover {
    transform:translateY(-6px) rotateX(3deg) rotateY(-3deg);
    border-color:rgba(201,168,76,0.28);
    box-shadow:0 30px 60px rgba(0,0,0,0.28);
  }
  .lp-story-index {
    display:inline-flex;
    min-width:44px;
    height:44px;
    border-radius:999px;
    align-items:center;
    justify-content:center;
    border:1px solid rgba(201,168,76,0.16);
    background:rgba(201,168,76,0.08);
    font-size:12px;
    letter-spacing:0.18em;
    text-transform:uppercase;
    color:var(--landing-muted);
  }
  .lp-story-card h4 {
    margin:22px 0 10px;
    font-size:1.55rem;
    line-height:1.05;
    letter-spacing:-0.04em;
  }
  .lp-story-card p {
    color:var(--landing-muted);
    line-height:1.8;
  }
  .lp-story-meter {
    position:absolute;
    left:24px;
    right:24px;
    bottom:24px;
    height:5px;
    border-radius:999px;
    overflow:hidden;
    background:rgba(201,168,76,0.08);
  }
  .lp-story-meter > span {
    display:block;
    height:100%;
    border-radius:inherit;
    background:var(--landing-grad);
  }

  .lp-features {
    padding:80px 0 120px;
  }
  .lp-features-grid {
    display:grid;
    grid-template-columns:repeat(2, minmax(0, 1fr));
    gap:18px;
    margin-top:34px;
  }
  .lp-feature {
    position:relative;
    min-height:250px;
    padding:28px;
    border-radius:28px;
    border:1px solid rgba(201,168,76,0.14);
    background:linear-gradient(180deg, rgba(201,168,76,0.08), rgba(19,16,13,0.96));
    box-shadow:var(--landing-shadow);
    overflow:hidden;
    transition:transform 350ms var(--landing-ease), border-color 350ms var(--landing-ease), box-shadow 350ms var(--landing-ease);
    transform-style:preserve-3d;
  }
  .lp-feature::before {
    content:"";
    position:absolute;
    inset:-30% auto auto -10%;
    width:220px;
    height:220px;
    border-radius:50%;
    background:radial-gradient(circle, rgba(201,168,76,0.16), transparent 68%);
    opacity:0;
    transition:opacity 300ms var(--landing-ease);
  }
  .lp-feature:hover::before { opacity:1; }
  .lp-feature:hover {
    border-color:rgba(201,168,76,0.28);
    box-shadow:0 30px 60px rgba(0,0,0,0.32);
  }
  .lp-feature-badge {
    display:inline-flex;
    padding:8px 12px;
    border-radius:999px;
    background:rgba(201,168,76,0.08);
    border:1px solid rgba(201,168,76,0.16);
    font-size:11px;
    letter-spacing:0.16em;
    color:var(--landing-muted);
    text-transform:uppercase;
  }
  .lp-feature h4 {
    margin:18px 0 10px;
    font-size:1.85rem;
    line-height:1;
    letter-spacing:-0.04em;
  }
  .lp-feature p {
    color:var(--landing-muted);
    line-height:1.8;
    max-width:42ch;
  }
  .lp-feature-lines {
    margin-top:22px;
    display:grid;
    gap:10px;
  }
  .lp-feature-lines span {
    height:10px;
    border-radius:999px;
    background:rgba(201,168,76,0.08);
    overflow:hidden;
  }
  .lp-feature-lines span i {
    display:block;
    height:100%;
    border-radius:inherit;
    background:var(--landing-grad);
    opacity:0.8;
  }

  .lp-break {
    padding:40px 0 160px;
  }
  .lp-break-panel {
    position:relative;
    overflow:hidden;
    padding:90px 42px;
    text-align:center;
  }
  .lp-break-panel::before {
    content:"";
    position:absolute;
    inset:-20% 20%;
    background:radial-gradient(circle, rgba(201,168,76,0.18), transparent 40%);
    filter:blur(20px);
  }
  .lp-break-panel h3 {
    position:relative;
    z-index:1;
    font-size:clamp(2.8rem, 6vw, 5.8rem);
    line-height:0.95;
    letter-spacing:-0.06em;
    margin:0 auto 18px;
    max-width:12ch;
  }
  .lp-break-panel p {
    position:relative;
    z-index:1;
    color:var(--landing-muted);
    max-width:50ch;
    margin:0 auto 28px;
    line-height:1.85;
  }
  .lp-break-actions {
    position:relative;
    z-index:1;
    display:flex;
    justify-content:center;
    gap:14px;
    flex-wrap:wrap;
  }

  .lp-reveal {
    opacity:0;
    transform:translate3d(0, 40px, 0) scale(0.98);
    filter:blur(10px);
    transition:opacity 900ms var(--landing-ease), transform 900ms var(--landing-ease), filter 900ms var(--landing-ease);
    transition-delay:var(--reveal-delay, 0ms);
  }
  .lp-reveal.is-visible {
    opacity:1;
    transform:translate3d(0, 0, 0) scale(1);
    filter:blur(0);
  }

  @media (prefers-reduced-motion: reduce) {
    .lp-reveal,
    .lp-story-card,
    .lp-feature,
    .lp-glass-btn,
    .lp-secondary-btn,
    .lp-particle,
    .lp-cursor { transition:none !important; animation:none !important; }
  }

  /* RESPONSIVE */
  @media (max-width:768px) {
    .le-kpi-grid { grid-template-columns:1fr 1fr; }
    .le-summary-grid { grid-template-columns:1fr 1fr; }
    .le-check-grid { grid-template-columns:1fr; }
    .le-preview-grid { grid-template-columns:1fr; }
    .le-compare-wrap { grid-template-columns:1fr; }
    .le-calc-breakdown { grid-template-columns:1fr; }
    .le-nav { padding:1rem 1.25rem; }
    .le-hero { padding:5rem 1.25rem 4rem; }
    .le-results { padding:1.5rem 1rem; }
    .le-hero-stat { padding:0 1.5rem; }
    .le-section-dark,.le-section-mid { padding:4rem 1.5rem; }
    .le-steps-row { grid-template-columns:1fr 1fr; }
    .lp-container,
    .lp-depth-frame { width:min(100%, calc(100% - 28px)); }
    .lp-hero { min-height:auto; padding:28px 0 12px; }
    .lp-hero-grid,
    .lp-intro-grid,
    .lp-depth-content,
    .lp-horizontal-head,
    .lp-features-grid { grid-template-columns:1fr; display:grid; }
    .lp-hero-grid,
    .lp-intro-grid,
    .lp-depth-content { gap:24px; }
    .lp-title { font-size:clamp(3rem, 17vw, 5.4rem); }
    .lp-visual { min-height:520px; }
    .lp-vault { min-height:520px; padding:18px; }
    .lp-vault-chip { min-width:140px; padding:12px 14px; }
    .lp-vault-chip.top { right:0; }
    .lp-vault-chip.left { left:2%; bottom:18%; }
    .lp-vault-chip.right { right:2%; bottom:24%; }
    .lp-vault-column { width:64px; }
    .lp-intro { padding-top:100px; }
    .lp-intro-copy,
    .lp-intro-visual,
    .lp-break-panel { padding:24px; }
    .lp-stack-card { position:relative; inset:auto !important; width:100%; margin-bottom:14px; }
    .lp-depth { height:180vh; }
    .lp-depth-sticky { top:82px; height:calc(100vh - 96px); }
    .lp-depth-content { padding:28px; align-items:center; }
    .lp-depth-cards { min-height:300px; }
    .lp-depth-card { width:min(100%, 280px); }
    .lp-depth-card.one { right:0; }
    .lp-depth-card.two { left:0; top:38%; }
    .lp-depth-card.three { right:4%; bottom:0; }
    .lp-horizontal { padding:96px 0; }
    .lp-horizontal-stage { padding:18px; }
    .lp-horizontal-track { grid-auto-columns:78vw; }
    .lp-stat-row { grid-template-columns:1fr; }
    .lp-cursor { display:none; }
  }
  @media (max-width:500px) {
    .le-kpi-grid,.le-summary-grid { grid-template-columns:1fr; }
    .le-hero-stats { flex-direction:column; gap:0; }
    .le-hero-stat { border-right:none; border-bottom:1px solid var(--ink-border); padding:1.25rem 0; }
    .le-steps-row { grid-template-columns:1fr; }
    .lp-shell::before,
    .lp-noise { opacity:0.05; }
    .lp-title { letter-spacing:-0.07em; }
    .lp-subtitle,
    .lp-copy,
    .lp-break-panel p { font-size:0.98rem; }
    .lp-glass-btn,
    .lp-secondary-btn { width:100%; }
    .lp-horizontal-track { grid-auto-columns:86vw; }
    .lp-vault { min-height:460px; }
    .lp-vault-chip { min-width:unset; width:42%; }
    .lp-vault-chip span { font-size:22px; }
  }
`;

// ─── API ──────────────────────────────────────────────────────────────────────
function analyzeUrl() {
  const path = "/api/analyze";
  return API_BASE ? `${API_BASE}${path}` : path;
}

async function callAnalyzeAPI({ idea, location, scale, mode, email }) {
  const payload = { idea, location, scale, mode, email: email || null };
  const url = analyzeUrl();
  console.log("Sending request:", { url, ...payload });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify(payload),
    });
    clearTimeout(timer);
    console.log("Response:", response.status, response.statusText);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const detail = err.detail;
      const msg =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
            ? detail.map((d) => d.msg || d).join("; ")
            : `Backend error (${response.status})`;
      throw new Error(msg);
    }
    const data = await response.json();
    console.log("Response body keys:", data && typeof data === "object" ? Object.keys(data) : data);
    return data;
  } catch (e) {
    clearTimeout(timer);
    if (e?.name === "AbortError") {
      throw new Error("Request timed out — try again.");
    }
    if (e?.name === "TypeError" || /failed to fetch|networkerror|load failed/i.test(String(e?.message || ""))) {
      const hint = API_BASE
        ? `Cannot reach API at ${API_BASE}. Is the FastAPI server running on port 8000?`
        : "Cannot reach the API. Start the backend (uvicorn on :8000) and keep Vite dev server running so /api is proxied.";
      console.error("Fetch failed:", e);
      throw new Error(hint);
    }
    throw e;
  }
}

function scoreColor(score, type) {
  if (type === "risk") {
    if (score <= 30) return { c: "#4CAF7D", bg: "rgba(76,175,125,0.12)", label: "Low Risk" };
    if (score <= 60) return { c: "#E09B40", bg: "rgba(224,155,64,0.12)", label: "Medium Risk" };
    return { c: "#E05252", bg: "rgba(224,82,82,0.12)", label: "High Risk" };
  }
  if (type === "complexity") {
    if (score <= 30) return { c: "#4CAF7D", bg: "rgba(76,175,125,0.12)", label: "Simple" };
    if (score <= 60) return { c: "#6BA3D6", bg: "rgba(107,163,214,0.12)", label: "Moderate" };
    return { c: "#E09B40", bg: "rgba(224,155,64,0.12)", label: "Complex" };
  }
  if (score >= 70) return { c: "#4CAF7D", bg: "rgba(76,175,125,0.12)", label: "Viable" };
  if (score >= 45) return { c: "#E09B40", bg: "rgba(224,155,64,0.12)", label: "Moderate" };
  return { c: "#E05252", bg: "rgba(224,82,82,0.12)", label: "Challenging" };
}

const LICENSE_DOCS = {
  "gst": ["PAN Card of proprietor/company","Aadhaar Card","Bank account statement / cancelled cheque","Proof of business address (rent agreement or utility bill)","Digital signature (for companies/LLPs)","Incorporation certificate (for companies)"],
  "fssai": ["Photo ID proof (Aadhaar/PAN)","Proof of possession of premises","List of food products to be handled","Food safety management plan","Water test report (for packaged water)","NOC from local municipality/panchayat"],
  "udyam": ["Aadhaar of proprietor/partner/director","PAN of business entity","Bank account details","NIC activity code"],
  "shop": ["Proof of address of business premises","PAN of owner","Aadhaar of owner","Passport-size photograph","Details of employees"],
  "trade": ["Ownership or tenancy document","Site plan / building layout","NOC from fire department","PAN card","Identity proof of owner"],
  "iec": ["PAN card of entity","Aadhaar/voter ID/passport of director","Bank certificate or cancelled cheque","Digital photograph","Address proof of business"],
  "default": ["PAN Card","Aadhaar Card","Proof of business address","Bank account details (cancelled cheque)","Passport-size photographs (2 copies)","Business registration certificate"],
};
function getDocuments(name) {
  const n = name.toLowerCase();
  for (const [k, docs] of Object.entries(LICENSE_DOCS)) {
    if (k !== "default" && n.includes(k)) return docs;
  }
  return LICENSE_DOCS.default;
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
function KpiCard({ label, score, note, type }) {
  const { c, bg, label: badge } = scoreColor(score, type);
  return (
    <div className="le-kpi-card">
      <div className="le-kpi-label">{label}</div>
      <div className="le-kpi-score" style={{ color: c }}>{score}</div>
      <div className="le-kpi-badge" style={{ background: bg, color: c }}>{badge}</div>
      <div className="le-kpi-bar"><div className="le-kpi-fill" style={{ width: `${Math.min(score,100)}%`, background: c }} /></div>
      {note && <div className="le-kpi-note">{note}</div>}
    </div>
  );
}

function Section({ icon, title, subtitle, count, children, open: def = false }) {
  const [open, setOpen] = useState(def);
  return (
    <div className="le-sec">
      <div className={`le-sec-head${open ? " open" : ""}`} onClick={() => setOpen(o => !o)}>
        <div className="le-sec-icon">{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="le-sec-title">{title}</div>
          {subtitle && <div className="le-sec-sub">{subtitle}</div>}
        </div>
        {count != null && <span className="le-sec-count">{count}</span>}
        <span className="le-sec-chev" style={{ transform: open ? "rotate(180deg)" : "none" }}>▼</span>
      </div>
      {open && <div className="le-sec-body">{children}</div>}
    </div>
  );
}

// ─── FEATURE: TOAST ──────────────────────────────────────────────────────────
function Toast({ message, show }) {
  return <div className={`le-toast${show ? " show" : ""}`}>{message}</div>;
}

// ─── FEATURE: SMART SEARCH ───────────────────────────────────────────────────
function highlight(text, query) {
  if (!query || !text) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="le-search-highlight">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ─── FEATURE: EXPORT TO CSV ──────────────────────────────────────────────────
function exportToCSV(data) {
  const rows = [["Section","Item","Detail","Cost/Penalty","Priority/Severity"]];
  (data.licenses||[]).forEach(l => rows.push(["License", l.name, l.description?.slice(0,80), l.estimated_cost, l.priority]));
  (data.risks||[]).forEach(r => rows.push(["Risk", r.title, r.description?.slice(0,80), r.penalty, r.severity]));
  (data.action_plan||[]).forEach(a => rows.push(["Action", `Step ${a.step}: ${a.title}`, a.description?.slice(0,80), a.cost||"—", a.timeframe]));
  (data.cost_estimates||[]).forEach(c => rows.push(["Cost", c.item, c.notes?.slice(0,80), c.range, "—"]));
  const csv = rows.map(r => r.map(c => `"${(c||"").toString().replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `LegalEase_Report_${data.report_id}.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ─── FEATURE: TIMELINE VIEW ──────────────────────────────────────────────────
function TimelineView({ actionPlan }) {
  const catC = { legal:"#6BA3D6", financial:"#4CAF7D", operational:"#E09B40", compliance:"#E05252" };
  const catBg = { legal:"rgba(107,163,214,0.12)", financial:"rgba(76,175,125,0.12)", operational:"rgba(224,155,64,0.12)", compliance:"rgba(224,82,82,0.12)" };
  const grouped = {};
  (actionPlan||[]).forEach(step => {
    const week = step.timeframe || "General";
    if (!grouped[week]) grouped[week] = [];
    grouped[week].push(step);
  });
  return (
    <div className="le-timeline">
      {Object.entries(grouped).map(([week, steps]) => (
        <div key={week} className="le-timeline-week">
          <div className="le-timeline-week-label">📅 {week}</div>
          {steps.map((step, i) => {
            const c = catC[step.category] || "#C9A84C";
            const bg = catBg[step.category] || "rgba(201,168,76,0.10)";
            return (
              <div key={i} className="le-timeline-item">
                <div className="le-timeline-dot" style={{ background: c }} />
                <div className="le-timeline-title">{step.step}. {step.title}</div>
                <span className="le-timeline-cat" style={{ background: bg, color: c }}>{step.category}</span>
                {step.cost && <span className="le-timeline-cost">{step.cost}</span>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── FEATURE: COST CALCULATOR ────────────────────────────────────────────────
function CostCalculator({ data }) {
  const licCount = data.licenses?.length || 0;
  const [caFee, setCaFee] = useState(3000);
  const [govtFee, setGovtFee] = useState(licCount * 500);
  const [extraCompliance, setExtraCompliance] = useState(5000);
  const [caPerReg, setCaPerReg] = useState(2000);

  const govtTotal = govtFee;
  const caTotal = licCount * caPerReg;
  const compTotal = extraCompliance;
  const consultTotal = caFee;
  const grandTotal = govtTotal + caTotal + compTotal + consultTotal;

  const fmt = n => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="le-calc-wrap">
      <div className="le-calc-title">Interactive Cost Estimator</div>
      <div className="le-calc-row">
        <div className="le-calc-label">Avg. Govt. fees per license</div>
        <input type="range" className="le-calc-slider" min={0} max={5000} step={100} value={Math.round(govtFee/Math.max(licCount,1))} onChange={e => setGovtFee(+e.target.value * Math.max(licCount,1))} />
        <div className="le-calc-val">{fmt(Math.round(govtFee/Math.max(licCount,1)))} each</div>
      </div>
      <div className="le-calc-row">
        <div className="le-calc-label">CA fee per registration</div>
        <input type="range" className="le-calc-slider" min={500} max={10000} step={500} value={caPerReg} onChange={e => setCaPerReg(+e.target.value)} />
        <div className="le-calc-val">{fmt(caPerReg)}</div>
      </div>
      <div className="le-calc-row">
        <div className="le-calc-label">Ongoing compliance / month</div>
        <input type="range" className="le-calc-slider" min={0} max={20000} step={1000} value={extraCompliance} onChange={e => setExtraCompliance(+e.target.value)} />
        <div className="le-calc-val">{fmt(extraCompliance)}</div>
      </div>
      <div className="le-calc-row">
        <div className="le-calc-label">Initial consultation fee</div>
        <input type="range" className="le-calc-slider" min={0} max={15000} step={500} value={caFee} onChange={e => setCaFee(+e.target.value)} />
        <div className="le-calc-val">{fmt(caFee)}</div>
      </div>
      <div className="le-calc-breakdown">
        {[["Govt. fees total", fmt(govtTotal)],["CA registration fees", fmt(caTotal)],["Monthly compliance", fmt(compTotal)],["Consultation", fmt(consultTotal)]].map(([k,v]) => (
          <div key={k} className="le-calc-breakdown-item"><span>{k}</span><strong>{v}</strong></div>
        ))}
      </div>
      <div className="le-calc-total">
        <div>
          <div className="le-calc-total-label">Estimated First-Year Cost</div>
          <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:4 }}>Govt. fees + CA + 12 months compliance</div>
        </div>
        <div className="le-calc-total-val">{fmt(govtTotal + caTotal + (compTotal * 12) + consultTotal)}</div>
      </div>
    </div>
  );
}

// ─── FEATURE: LICENSE APPLY ASSISTANT ────────────────────────────────────────
const LICENSE_GUIDES = {
  gst: {
    name: "GST Registration",
    steps: [
      { title: "Gather Documents", desc: "Collect PAN, Aadhaar, proof of business address, bank account details, and incorporation certificate if applicable.", docs: ["PAN Card","Aadhaar Card","Address proof","Bank statement","Incorporation cert (if company)"] },
      { title: "Register on GST Portal", desc: "Visit the official GST portal and complete the New Registration form under 'Services → Registration'.", link: "https://www.gst.gov.in/", linkText: "Open GST Portal →" },
      { title: "Submit & Track", desc: "Submit your application and note your ARN number. Approval typically takes 7–10 working days. Track under 'Services → Track Application Status'.", docs: ["ARN number","Email confirmation"] },
    ]
  },
  fssai: {
    name: "FSSAI License",
    steps: [
      { title: "Determine License Type", desc: "Choose between Basic Registration (turnover < ₹12L), State License (₹12L–20Cr), or Central License (> ₹20Cr) based on your business size.", docs: [] },
      { title: "Apply on FoSCoS Portal", desc: "Register and apply on the Food Safety Compliance System. Upload all required documents electronically.", link: "https://foscos.fssai.gov.in/", linkText: "Open FoSCoS Portal →" },
      { title: "Inspection & Approval", desc: "A food safety officer may inspect your premises. Once approved, you'll receive your FSSAI number. Display it prominently at your establishment.", docs: ["FSSAI certificate","License number"] },
    ]
  },
  udyam: {
    name: "Udyam Registration (MSME)",
    steps: [
      { title: "Check Eligibility", desc: "Your business must be a Micro, Small, or Medium enterprise. Manufacturing: investment < ₹50Cr, turnover < ₹250Cr. Service: investment < ₹10Cr, turnover < ₹50Cr.", docs: [] },
      { title: "Register Online", desc: "Udyam registration is completely free and online. You only need an Aadhaar number — no documents to upload.", link: "https://udyamregistration.gov.in/", linkText: "Open Udyam Portal →" },
      { title: "Get Certificate", desc: "After submission, you'll get an instant Udyam Registration Number and certificate. This never expires and needs no renewal.", docs: ["Udyam certificate","URN number"] },
    ]
  },
  default: {
    name: "License Application",
    steps: [
      { title: "Gather Documents", desc: "Collect all required identity proofs, address proofs, and business registration documents. Make digital copies of everything.", docs: ["PAN Card","Aadhaar Card","Address proof","Business registration","Photographs"] },
      { title: "Submit Application", desc: "Visit the relevant authority's website or office to submit your application. Pay the applicable government fee.", docs: [] },
      { title: "Follow Up & Collect", desc: "Track your application status and respond promptly to any queries. Collect your license and keep copies stored safely.", docs: [] },
    ]
  }
};

function LicenseAssistant({ licenses, onClose }) {
  const [selectedLic, setSelectedLic] = useState(null);
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState({});

  const getGuide = (name) => {
    const n = (name||"").toLowerCase();
    for (const [k, g] of Object.entries(LICENSE_GUIDES)) {
      if (k !== "default" && n.includes(k)) return g;
    }
    return { ...LICENSE_GUIDES.default, name };
  };

  if (!selectedLic) return (
    <div className="le-assistant-wrap">
      <div style={{ marginBottom:"1.5rem" }}>
        <div className="le-section-label">Select a license to get started</div>
        <p style={{ color:"var(--text-muted)", fontSize:13, marginTop:8 }}>Step-by-step guidance to apply for each required license, including document checklists and portal links.</p>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {(licenses||[]).map((lic, i) => {
          const guide = getGuide(lic.name);
          return (
            <div key={i} className="le-timeline-item" style={{ cursor:"pointer" }} onClick={() => { setSelectedLic(lic); setStep(0); setChecked({}); }}>
              <div className="le-timeline-dot" style={{ background: lic.priority==="critical"?"var(--red)":lic.priority==="high"?"var(--amber)":"var(--blue)" }} />
              <div style={{ flex:1 }}>
                <div className="le-timeline-title">{lic.name}</div>
                <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>{guide.steps.length} steps · {lic.time_to_approve}</div>
              </div>
              <span className={`le-priority-badge priority-${lic.priority}`}>{lic.priority}</span>
              <span style={{ fontSize:12, color:"var(--gold)", fontWeight:600, marginLeft:8 }}>Start →</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const guide = getGuide(selectedLic.name);
  const currentStep = guide.steps[step];
  const stepKeys = checked[step] ? Object.keys(checked[step]).filter(k => checked[step][k]) : [];

  return (
    <div className="le-assistant-wrap">
      <button onClick={() => setSelectedLic(null)} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:13, marginBottom:"1.25rem", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:6 }}>← Back to all licenses</button>
      <div className="le-assistant-progress">
        {guide.steps.map((s, i) => (
          <div key={i} className={`le-assistant-step${i===step?" active":i<step?" done":""}`} onClick={() => setStep(i)} style={{ cursor:"pointer" }}>
            {i < step ? "✓ " : `${i+1}. `}{s.title.split(" ")[0]}
          </div>
        ))}
      </div>
      <div className="le-assistant-card">
        <h3>{currentStep.title}</h3>
        <p>{currentStep.desc}</p>
        {currentStep.docs?.length > 0 && (
          <div className="le-assistant-checklist">
            {currentStep.docs.map((doc, i) => {
              const key = `${step}-${i}`;
              const isChecked = checked[step]?.[i];
              return (
                <div key={i} className={`le-assistant-item${isChecked?" checked":""}`} onClick={() => setChecked(c => ({ ...c, [step]: { ...(c[step]||{}), [i]: !isChecked } }))}>
                  <div className="le-assistant-item-box">
                    {isChecked && <span style={{ color:"#fff", fontSize:11, fontWeight:700 }}>✓</span>}
                  </div>
                  <div className="le-assistant-item-text">{doc}</div>
                </div>
              );
            })}
          </div>
        )}
        {currentStep.link && (
          <a href={currentStep.link} target="_blank" rel="noopener noreferrer" className="le-assistant-link">
            🌐 {currentStep.linkText}
          </a>
        )}
        <div className="le-assistant-nav">
          <button className="le-btn-ghost" onClick={() => setStep(s => Math.max(0, s-1))} disabled={step===0} style={{ fontSize:13 }}>← Previous</button>
          {step < guide.steps.length - 1
            ? <button className="le-btn-primary" onClick={() => setStep(s => s+1)} style={{ fontSize:13, padding:"10px 24px" }}>Next Step →</button>
            : <button className="le-btn-primary" style={{ fontSize:13, padding:"10px 24px", background:"linear-gradient(140deg,var(--green),#6DD99A)" }} onClick={() => setSelectedLic(null)}>✓ Complete — Back to List</button>
          }
        </div>
      </div>
    </div>
  );
}

// ─── FEATURE: COMPARISON MODE ─────────────────────────────────────────────────
function ComparisonView({ reports, onLoad }) {
  const [left, setLeft] = useState(reports[0] || null);
  const [right, setRight] = useState(reports[1] || null);

  if (reports.length < 2) return (
    <div className="le-compare-empty">
      <div style={{ fontSize:32, marginBottom:"1rem" }}>📊</div>
      <div style={{ color:"var(--text-primary)", fontWeight:600, marginBottom:8 }}>Need at least 2 reports to compare</div>
      <div>Run more analyses to unlock comparison mode.</div>
    </div>
  );

  const renderCol = (rep, isLeft) => {
    if (!rep) return <div className="le-compare-empty">Select a report to compare</div>;
    const f = rep.feasibility || {}, r = rep.risk || {}, c = rep.compliance_complexity || {};
    const scores = [
      { label:"Feasibility", score: f.score||0, type:"feasibility" },
      { label:"Risk", score: r.score||0, type:"risk" },
      { label:"Complexity", score: c.score||0, type:"complexity" },
    ];
    return (
      <>
        <div className="le-compare-col-header">
          <div style={{ marginBottom:6 }}>
            <select className="le-meta-select" style={{ background:"transparent", border:"none", padding:"0", fontSize:14, fontWeight:600, color:"var(--text-primary)" }}
              value={rep.report_id}
              onChange={e => {
                const r = reports.find(r => r.report_id === e.target.value);
                if (r) isLeft ? setLeft(r) : setRight(r);
              }}>
              {reports.map(r => <option key={r.report_id} value={r.report_id}>{r.business_name || r.report_id}</option>)}
            </select>
          </div>
          <div className="le-compare-col-meta">#{rep.report_id} · {rep.category}</div>
        </div>
        <div className="le-compare-col-body">
          <div style={{ marginBottom:"1rem" }}>
            {scores.map(s => {
              const { c: sc } = scoreColor(s.score, s.type);
              return (
                <div key={s.label} className="le-compare-score-row">
                  <div className="le-compare-score-label">{s.label}</div>
                  <div className="le-compare-score-track"><div className="le-compare-score-fill" style={{ width:`${s.score}%`, background:sc }} /></div>
                  <div className="le-compare-score-num" style={{ color:sc }}>{s.score}</div>
                </div>
              );
            })}
          </div>
          {[
            ["Licenses needed", rep.licenses?.length || 0],
            ["Legal risks", rep.risks?.length || 0],
            ["Action steps", rep.action_plan?.length || 0],
            ["Location", rep.location || "—"],
            ["Scale", rep.scale || "—"],
          ].map(([k,v]) => (
            <div key={k} className="le-compare-row">
              <div className="le-compare-key">{k}</div>
              <div className="le-compare-val">{v}</div>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div>
      <div style={{ marginBottom:"1rem", fontSize:12, color:"var(--text-muted)" }}>Select reports from the dropdowns inside each column to compare them side by side.</div>
      <div className="le-compare-wrap">
        <div className="le-compare-col">{renderCol(left, true)}</div>
        <div className="le-compare-col">{renderCol(right, false)}</div>
      </div>
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
function LandingPage({ onStart }) {
  return (
    <div style={{ background:"var(--ink)" }}>
      <div className="le-hero">
        <div className="le-hero-grid" />
        <div className="le-hero-glow" />
        <div className="le-hero-eyebrow"><span className="le-hero-eyebrow-dot" />AI-Powered Legal Intelligence for India</div>
        <h1>Start Smart.<br /><em>Stay Legal.</em></h1>
        <p className="le-hero-sub">From business idea to complete compliance roadmap — licenses, risks, penalties, action plan, and a branded PDF. In under 60 seconds.</p>
        <div className="le-hero-actions">
          <button className="le-btn-primary" onClick={onStart} style={{ fontSize:15, padding:"15px 44px" }}>Analyze My Business Free →</button>
          <button className="le-btn-ghost" onClick={onStart}>See a Sample Report</button>
        </div>
        <div style={{ marginTop:"2.5rem" }}><span className="le-pipeline-badge">⚙ Python Rule Engine · Gemini AI · ReportLab PDF · SQLite</span></div>
        <div className="le-hero-stats">
          {[["50+","License Types"],["28","States Covered"],["100+","Laws Referenced"],["PDF","Auto-Generated"],["60s","Avg. Time"]].map(([n,l]) => (
            <div key={l} className="le-hero-stat"><div className="le-hero-stat-num">{n}</div><div className="le-hero-stat-lbl">{l}</div></div>
          ))}
        </div>
      </div>

      <div className="le-section-mid">
        <div className="le-container">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4rem", alignItems:"center" }}>
            <div>
              <div className="le-section-label">What You Get</div>
              <h2 className="le-section-h2">A full legal report,<br /><em>not just a checklist</em></h2>
              <p className="le-section-sub">Every analysis covers the complete legal picture — from registrations to exact penalties to what happens if you skip them.</p>
              <div style={{ marginTop:"2.5rem", display:"flex", flexDirection:"column", gap:"1rem" }}>
                {[["#C9A84C","Required Licenses with documents, costs, timelines, apply links"],["#6BA3D6","Risk scores across 5 dimensions — Python engine, not AI"],["#E05252","Legal risks with exact penalty amounts from Indian Acts"],["#4CAF7D","Step-by-step action plan with timeline + cost per step"],["#C9A84C","Non-compliance consequences — what actually happens"],["#E09B40","Realistic cost estimates with interactive calculator"]].map(([col,text],i) => (
                  <div key={i} style={{ display:"flex", gap:"12px", alignItems:"flex-start" }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:col, flexShrink:0, marginTop:7 }} />
                    <span style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.7 }}>{text}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:"2.5rem" }}><button className="le-btn-primary" onClick={onStart}>Get My Report →</button></div>
            </div>
            <div className="le-preview-grid">
              <div className="le-preview-card">
                <div className="le-preview-card-title">Licenses Required</div>
                {[["#E05252","GST Registration"],["#E05252","FSSAI License"],["#E09B40","Udyam (MSME)"],["#6BA3D6","Shop & Establishment"]].map(([c,t]) => (
                  <div key={t} className="le-preview-item"><div className="le-preview-dot" style={{ background:c }} />{t}</div>
                ))}
              </div>
              <div className="le-preview-card">
                <div className="le-preview-card-title">Risk Scores</div>
                {[["FSSAI / Food Safety",82,"#E05252"],["GST Compliance",55,"#E09B40"],["Labour Laws",30,"#4CAF7D"],["Consumer Protection",40,"#E09B40"]].map(([l,s,c]) => (
                  <div key={l} className="le-preview-item" style={{ flexDirection:"column", gap:4 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", width:"100%", fontSize:11 }}><span>{l}</span><span style={{ color:c, fontWeight:600 }}>{s}/100</span></div>
                    <div style={{ height:3, background:"rgba(255,255,255,0.06)", borderRadius:100, overflow:"hidden" }}><div style={{ width:`${s}%`, height:"100%", background:c, borderRadius:100 }} /></div>
                  </div>
                ))}
              </div>
              <div className="le-preview-card">
                <div className="le-preview-card-title">Legal Risks</div>
                {[["#E05252","Operating without FSSAI — Rs. 5L fine"],["#E09B40","GST non-registration penalty"],["#6BA3D6","No employee contracts"]].map(([c,t]) => (
                  <div key={t} className="le-preview-item"><div className="le-preview-dot" style={{ background:c }} />{t}</div>
                ))}
              </div>
              <div className="le-preview-card">
                <div className="le-preview-card-title">Action Plan</div>
                {[["1","Apply FSSAI","Week 1"],["2","GST Registration","Week 1"],["3","Udyam Registration","Week 2"]].map(([n,t,w]) => (
                  <div key={n} className="le-preview-item">
                    <div style={{ width:18, height:18, borderRadius:"50%", background:"#C9A84C", color:"#0C0B09", fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{n}</div>
                    <span style={{ flex:1 }}>{t}</span><span style={{ fontSize:10, color:"#C9A84C" }}>{w}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="le-section-dark">
        <div className="le-container">
          <div style={{ textAlign:"center", marginBottom:"4rem" }}>
            <div className="le-section-label">The Pipeline</div>
            <h2 className="le-section-h2">Python does the <em>heavy lifting</em></h2>
            <p className="le-section-sub" style={{ margin:"0 auto" }}>Not a simple chatbot. A deterministic rule engine + AI enrichment pipeline built in Python + FastAPI.</p>
          </div>
          <div className="le-steps-row">
            {[["1","Category Detection","Python NLP maps idea to category — food, fintech, edtech, retail, and 12 more"],["2","License Mapping","Rule engine cross-refs category + state + scale against 50+ license rules"],["3","Risk Scoring","5-dimension risk model scores 0–100 — zero AI, pure Python determinism"],["4","AI Enrichment","Gemini writes personalized explanations, exact penalties, and action plan"],["5","PDF Generation","ReportLab makes a branded A4 PDF with QR code, saved to server"],["6","SQLite Storage","Every report stored — retrievable by ID anytime"]].map(([n,t,d]) => (
              <div key={n} className="le-step-card"><div className="le-step-num">{n}</div><div className="le-step-title">{t}</div><div className="le-step-desc">{d}</div></div>
            ))}
          </div>
        </div>
      </div>

      <div className="le-section-mid">
        <div className="le-container">
          <div style={{ textAlign:"center", marginBottom:"3.5rem" }}>
            <div className="le-section-label">Why LegalEase AI</div>
            <h2 className="le-section-h2">Built for <em>Indian</em> founders</h2>
          </div>
          <div className="le-feat-grid">
            {[["⚖️","India-Specific Laws","Every penalty cited from actual Indian legislation — FSSAI Act, IT Act 2000, Companies Act 2013, GST Act."],["🗺️","State-Level Rules","Rules differ by state. Our engine applies state-specific variations for all 28 states and UTs."],["📋","Document Checklists","Every license card shows the exact documents to gather before applying."],["🔢","Deterministic Scoring","Risk and feasibility scores from a Python rule engine — not AI that can hallucinate numbers."],["📅","Timeline View","Visual Gantt-style layout of your action plan grouped by week and category."],["🔍","Smart Search","Search across all licenses, risks, and action steps instantly."],["💰","Cost Calculator","Interactive sliders to estimate your real compliance budget."],["📊","Comparison Mode","Compare two business analyses side by side on scores, licenses, and risks."],["🧭","Apply Assistant","Step-by-step guided flow for GST, FSSAI, Udyam, and more."],["📥","Export to CSV","Download your full report as a spreadsheet for CA or team review."],["🔗","Share Reports","One-click shareable link for any report ID."],["✅","Progress Tracker","Check off compliance tasks as you complete them."]].map(([icon,title,desc]) => (
              <div key={title} className="le-feat-card"><div className="le-feat-icon">{icon}</div><div className="le-feat-title">{title}</div><div className="le-feat-desc">{desc}</div></div>
            ))}
          </div>
        </div>
      </div>

      <div className="le-section-dark">
        <div className="le-container">
          <div style={{ textAlign:"center", marginBottom:"3rem" }}>
            <div className="le-section-label">From Founders</div>
            <h2 className="le-section-h2">Built for the <em>real</em> India startup journey</h2>
          </div>
          <div className="le-testi-grid">
            {[["I had no idea I needed both FSSAI and a Fire NOC for my cloud kitchen. LegalEase caught it before I even started.","Priya Menon","Cloud Kitchen Founder, Bangalore"],["The action plan was incredibly specific — exact form names, portal links, and what it would cost. Saved me hours of research.","Rahul Sharma","EdTech Startup, Delhi"],["The risk section had exact section numbers from the IT Act and RBI guidelines. Not vague warnings — actual citations.","Anita Desai","Fintech Founder, Mumbai"],["The fact that risk scores come from a Python engine, not AI, gave me confidence. I can trust the numbers.","Vikram Nair","Export Business, Chennai"]].map(([q,n,r],i) => (
              <div key={i} className="le-testi-card">
                <div style={{ color:"#C9A84C", fontSize:30, marginBottom:10, lineHeight:1, fontFamily:"'Cormorant Garamond',serif", fontWeight:300 }}>"</div>
                <div className="le-testi-quote">{q}</div>
                <div className="le-testi-author">{n}</div>
                <div className="le-testi-role">{r}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="le-cta-band">
        <div className="le-container" style={{ textAlign:"center" }}>
          <div className="le-section-label">Free · No Signup · Instant PDF</div>
          <h2 className="le-section-h2" style={{ marginBottom:"1.5rem" }}>Ready to start <em>legally compliant</em>?</h2>
          <p style={{ color:"var(--text-muted)", fontSize:"1rem", marginBottom:"2.5rem", fontWeight:300 }}>Describe your business in one sentence. Get a complete legal roadmap instantly.</p>
          <button className="le-btn-primary" onClick={onStart} style={{ fontSize:16, padding:"16px 48px" }}>Analyze My Business Now →</button>
          <div style={{ marginTop:"1.5rem", fontSize:11, color:"rgba(255,255,255,0.18)" }}>For informational use only · Always consult a qualified CA or advocate for binding legal advice</div>
        </div>
      </div>
    </div>
  );
}

// ─── INPUT PAGE ───────────────────────────────────────────────────────────────
const LANDING_STORIES = [
  { id: "01", title: "Signal the category", body: "The landing now speaks in a sharper legal-product language: darker surfaces, gold illumination, and interface framing that feels proprietary.", meter: "72%" },
  { id: "02", title: "Open the vault", body: "Instead of floating glass everywhere, the UI now feels housed inside structured chambers, rails, and gold-trimmed surfaces.", meter: "84%" },
  { id: "03", title: "Guide the eye", body: "Horizontal movement reads like an editorial gallery. The page still scrolls cinematically, but the composition feels more brand-owned.", meter: "91%" },
  { id: "04", title: "Close with authority", body: "Every section lands with stronger contrast, more deliberate framing, and a premium black-and-gold cadence that matches the legacy product.", meter: "97%" },
];

const LANDING_FEATURES = [
  { badge: "Motion", title: "Scroll-led reveals", copy: "Opacity, rise, and blur are still choreographed on scroll, but they now land inside a richer black-and-gold interface system.", lines: ["92%", "78%", "66%"] },
  { badge: "Depth", title: "Architectural parallax", copy: "Layers move like rails and vault surfaces instead of loose ambient blobs, which gives the page more structure and more attitude.", lines: ["88%", "70%", "58%"] },
  { badge: "Interface", title: "Gold-laced surfaces", copy: "Thin metallic edges, dark lacquer panels, and restrained glow make the landing feel premium without drifting away from the legacy brand.", lines: ["82%", "76%", "60%"] },
  { badge: "Feedback", title: "Sharper interactions", copy: "Buttons, cards, and tracks respond with lift, tilt, and bloom so the UI feels expensive the moment you touch it.", lines: ["90%", "72%", "64%"] },
];

function CinematicLandingPage({ onStart }) {
  const heroRef = useRef(null);
  const depthRef = useRef(null);
  const horizontalRef = useRef(null);
  const cursorRef = useRef({ x: 0, y: 0 });
  const cursorTargetRef = useRef({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0, active: false, coarse: false });
  const [heroProgress, setHeroProgress] = useState(0);
  const [depthProgress, setDepthProgress] = useState(0);
  const [horizontalProgress, setHorizontalProgress] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");
    const setCoarse = () => setMouse((prev) => ({ ...prev, coarse: media.matches }));
    setCoarse();
    if (media.addEventListener) media.addEventListener("change", setCoarse);
    else media.addListener(setCoarse);

    const updateProgress = () => {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      setProgress(window.scrollY / maxScroll);
      [
        [heroRef, setHeroProgress, 1],
        [depthRef, setDepthProgress, 0.9],
        [horizontalRef, setHorizontalProgress, 0.8],
      ].forEach(([ref, setter, factor]) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const span = Math.max(window.innerHeight * 1.2, rect.height * factor);
        const raw = (window.innerHeight - rect.top) / span;
        setter(Math.min(1, Math.max(0, raw)));
      });
    };

    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        updateProgress();
        raf = null;
      });
    };

    const onMove = (event) => {
      cursorTargetRef.current = { x: event.clientX, y: event.clientY };
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      setMouse((prev) => ({ ...prev, x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) }));
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -10% 0px" });

    document.querySelectorAll(".lp-reveal").forEach((node) => revealObserver.observe(node));
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateProgress);
    window.addEventListener("mousemove", onMove);

    let cursorFrame = null;
    const animateCursor = () => {
      cursorRef.current.x += (cursorTargetRef.current.x - cursorRef.current.x) * 0.15;
      cursorRef.current.y += (cursorTargetRef.current.y - cursorRef.current.y) * 0.15;
      cursorFrame = window.requestAnimationFrame(animateCursor);
    };
    cursorFrame = window.requestAnimationFrame(animateCursor);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      if (cursorFrame) window.cancelAnimationFrame(cursorFrame);
      revealObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateProgress);
      window.removeEventListener("mousemove", onMove);
      if (media.removeEventListener) media.removeEventListener("change", setCoarse);
      else media.removeListener(setCoarse);
    };
  }, []);

  useEffect(() => {
    const handleEnter = () => setMouse((prev) => ({ ...prev, active: true }));
    const handleLeave = () => setMouse((prev) => ({ ...prev, active: false }));
    const interactive = document.querySelectorAll("button, a, [data-hover]");
    interactive.forEach((node) => {
      node.addEventListener("mouseenter", handleEnter);
      node.addEventListener("mouseleave", handleLeave);
    });
    return () => {
      interactive.forEach((node) => {
        node.removeEventListener("mouseenter", handleEnter);
        node.removeEventListener("mouseleave", handleLeave);
      });
    };
  }, []);

  const cursorStyle = { transform: `translate3d(${cursorRef.current.x}px, ${cursorRef.current.y}px, 0) translate(-50%, -50%)` };
  const heroShiftX = mouse.x * 18;
  const heroShiftY = mouse.y * 14;
  const depthBgStyle = { transform: `translate3d(${mouse.x * 12}px, ${depthProgress * 30}px, 0) scale(${1.12 - depthProgress * 0.05})` };
  const depthGridStyle = { transform: `translate3d(${mouse.x * -24}px, ${depthProgress * 72}px, 0) scale(${1 + depthProgress * 0.03})`, opacity: 0.22 + depthProgress * 0.28 };
  const trackShift = `translate3d(calc(-${horizontalProgress * 42}% + ${mouse.x * 18}px), 0, 0)`;

  return (
    <div className="lp-shell">
      <div className="lp-progress"><div className="lp-progress-bar" style={{ transform: `scaleX(${progress})` }} /></div>
      <div className="lp-noise" />
      {!mouse.coarse && <div className={`lp-cursor${mouse.active ? " active" : ""}`} style={cursorStyle} />}
      <div className="lp-ambient" aria-hidden="true">
        {[["12%", "18%", "5px", "6.2s", "0s"], ["78%", "14%", "4px", "7.1s", "1s"], ["22%", "64%", "3px", "5.4s", "0.8s"], ["86%", "72%", "6px", "8.5s", "1.6s"], ["58%", "34%", "4px", "6.8s", "2.2s"]].map(([left, top, size, dur, delay], index) => (
          <span key={index} className="lp-particle" style={{ left, top, width: size, height: size, "--dur": dur, "--delay": delay }} />
        ))}
      </div>
      <section className="lp-section lp-hero" ref={heroRef}>
        <div className="lp-container lp-hero-grid">
          <div className="lp-hero-copy lp-reveal is-visible">
            <div className="lp-kicker"><span className="lp-kicker-dot" />Black gold product system</div>
            <h1 className="lp-title"><span>Build.</span><span>Ship.</span><span className="lp-title-glow">Scale.</span></h1>
            <p className="lp-subtitle">The next generation platform for creators and developers, now reframed as a darker, richer, more cinematic premium brand experience.</p>
            <div className="lp-hero-actions">
              <button className="lp-glass-btn" onClick={onStart} data-hover>Enter The Vault</button>
              <button className="lp-secondary-btn" onClick={onStart} data-hover>Preview The Flow</button>
            </div>
            <div className="lp-hero-meta">
              <span className="lp-kicker">Gold framed UI</span>
              <span className="lp-kicker">Scroll storytelling</span>
              <span className="lp-kicker">Realtime legal intelligence</span>
            </div>
            <div className="lp-stat-row">
              {[["60s", "Analysis launch"], ["28", "States tuned"], ["Gold", "Brand system"]].map(([value, label]) => (
                <div key={label} className="lp-stat lp-reveal" style={{ "--reveal-delay": "120ms" }}>
                  <div className="lp-stat-value">{value}</div>
                  <div className="lp-stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="lp-visual">
            <div className="lp-hero-beam" />
            <div className="lp-vault" style={{ transform: `translate3d(${heroShiftX}px, ${heroShiftY - heroProgress * 18}px, 0) scale(${1 - heroProgress * 0.04})` }}>
              <div className="lp-vault-grid" />
              <div className="lp-vault-frame">
                <div className="lp-vault-arch" />
                <div className="lp-vault-core" />
                <div className="lp-vault-column left" />
                <div className="lp-vault-column mid" />
                <div className="lp-vault-column right" />
                <div className="lp-vault-scan" />
                <div className="lp-vault-chip top" style={{ transform: `translate3d(${mouse.x * -12}px, ${mouse.y * -14}px, 0)` }}><strong>Clearance</strong><span>01</span><p>Entrance sequence tuned to feel more like a luxury product launch than a generic SaaS hero.</p></div>
                <div className="lp-vault-chip left" style={{ transform: `translate3d(${mouse.x * 8}px, ${mouse.y * 10}px, 0)` }}><strong>System</strong><span>Scroll</span><p>Depth, sticky motion, and staged section choreography remain central to the experience.</p></div>
                <div className="lp-vault-chip right" style={{ transform: `translate3d(${mouse.x * -9}px, ${mouse.y * 8}px, 0)` }}><strong>Finish</strong><span>Gold</span><p>The entire interface now borrows the black-and-gold confidence of the legacy brand language.</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="lp-section lp-intro">
        <div className="lp-container lp-intro-grid">
          <div className="lp-panel lp-intro-copy lp-reveal">
            <div className="lp-kicker"><span className="lp-kicker-dot" />Immersive intro</div>
            <h2 className="lp-h2">A complete interface shift, not just a recolor.</h2>
            <p className="lp-copy">The page now uses darker chambers, framed metrics, and gold-edged surfaces to feel closer to a luxury control room than a default landing page.</p>
          </div>
          <div className="lp-panel lp-intro-visual lp-reveal" style={{ transform: `scale(${0.94 + heroProgress * 0.08}) translate3d(0, ${18 - heroProgress * 18}px, 0)` }}>
            <div className="lp-stack">
              {[["Framing", "Panels and modules are boxed like premium instrumentation instead of floating loosely in space."], ["Hierarchy", "Typography stays bold and cinematic, but the surrounding UI feels more deliberate and brand-owned."], ["Finish", "Gold accents now provide the glow, edge, and emphasis that the monochrome version was missing."]].map(([label, text], index) => (
                <div key={label} className="lp-stack-card" style={{ transform: `translate3d(${index * 10}px, ${heroProgress * (index + 1) * 12}px, 0)` }}>
                  <div className="lp-stack-label"><span>{label}</span><span>Scene 0{index + 1}</span></div>
                  <p className="lp-copy" style={{ fontSize: "0.96rem" }}>{text}</p>
                  <div style={{ marginTop: 18 }}>
                    <div className="lp-stack-line"><span style={{ width: `${78 - index * 9}%` }} /></div>
                    <div className="lp-stack-line"><span style={{ width: `${58 + index * 10}%`, opacity: 0.7 }} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="lp-section lp-depth" ref={depthRef}>
        <div className="lp-depth-sticky">
          <div className="lp-depth-frame">
            <div className="lp-depth-layer lp-depth-bg" style={depthBgStyle} />
            <div className="lp-depth-layer lp-depth-grid" style={depthGridStyle} />
            <div className="lp-depth-content">
              <div className="lp-depth-copy lp-reveal">
                <div className="lp-kicker"><span className="lp-kicker-dot" />Depth parallax</div>
                <h3>Real separation between background, interface, and foreground.</h3>
                <p>This section is sticky by design. As the user scrolls, the camera feels locked while the layers travel at different speeds, creating a controlled sense of space instead of generic slide-in effects.</p>
              </div>
              <div className="lp-depth-cards">
                <div className="lp-depth-card one" style={{ transform: `translate3d(${mouse.x * -10}px, ${depthProgress * 20}px, 0)` }}><h4>Background</h4><p>Slow, oversized gradients drift beneath the scene to keep the world feeling alive and dimensional.</p></div>
                <div className="lp-depth-card two" style={{ transform: `translate3d(${mouse.x * 18}px, ${depthProgress * 58}px, 0)` }}><h4>Mid-layer glass</h4><p>Panels carry blur, reflection, and soft shadow so the content feels suspended instead of flat.</p></div>
                <div className="lp-depth-card three" style={{ transform: `translate3d(${mouse.x * -14}px, ${depthProgress * -18}px, 0)` }}><h4>Foreground focus</h4><p>Typography and highlights stay crisp while everything around them creates the cinematic context.</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="lp-section lp-horizontal" ref={horizontalRef}>
        <div className="lp-container">
          <div className="lp-horizontal-head lp-reveal">
            <div>
              <div className="lp-kicker"><span className="lp-kicker-dot" />Horizontal illusion</div>
              <h2 className="lp-h2" style={{ maxWidth: "10ch" }}>Vertical scroll, lateral movement.</h2>
            </div>
            <p className="lp-copy" style={{ maxWidth: "40ch" }}>The story cards glide sideways while the user keeps scrolling normally. Scale and opacity shifts make the entire sequence feel like a camera pan through a premium interface.</p>
          </div>
          <div className="lp-horizontal-stage">
            <div className="lp-horizontal-track" style={{ transform: trackShift }}>
              {LANDING_STORIES.map((story, index) => (
                <article key={story.id} className="lp-story-card lp-reveal" style={{ "--reveal-delay": `${index * 90}ms`, opacity: 0.58 + Math.min(0.42, horizontalProgress * 0.6 + index * 0.04), transform: `translate3d(0, ${(1 - horizontalProgress) * 26}px, 0) scale(${0.96 + horizontalProgress * 0.06})` }}>
                  <span className="lp-story-index">{story.id}</span>
                  <h4>{story.title}</h4>
                  <p>{story.body}</p>
                  <div className="lp-story-meter"><span style={{ width: story.meter }} /></div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="lp-section lp-features">
        <div className="lp-container">
          <div className="lp-reveal">
            <div className="lp-kicker"><span className="lp-kicker-dot" />Feature reveals</div>
            <h2 className="lp-h2" style={{ maxWidth: "9ch" }}>Every section enters with purpose.</h2>
            <p className="lp-copy">Cards rise, sharpen, and illuminate one by one. Hovering adds a gentle tilt and light sweep so the interaction layer feels as considered as the scroll system.</p>
          </div>
          <div className="lp-features-grid">
            {LANDING_FEATURES.map((feature, index) => (
              <article
                key={feature.title}
                className="lp-feature lp-reveal"
                data-hover
                style={{ "--reveal-delay": `${index * 110}ms` }}
                onMouseMove={(event) => {
                  if (window.innerWidth < 768) return;
                  const card = event.currentTarget;
                  const rect = card.getBoundingClientRect();
                  const rotateY = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
                  const rotateX = -((event.clientY - rect.top) / rect.height - 0.5) * 10;
                  card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform = "";
                }}
              >
                <span className="lp-feature-badge">{feature.badge}</span>
                <h4>{feature.title}</h4>
                <p>{feature.copy}</p>
                <div className="lp-feature-lines">
                  {feature.lines.map((line, lineIndex) => (
                    <span key={lineIndex}><i style={{ width: line }} /></span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="lp-section lp-break">
        <div className="lp-container">
          <div className="lp-panel lp-break-panel lp-reveal">
            <div className="lp-kicker" style={{ justifyContent: "center", marginBottom: 22 }}><span className="lp-kicker-dot" />Cinematic break</div>
            <h3>The quiet moment before the next decisive move.</h3>
            <p>After all the motion, the page pulls back into clean whitespace, subtle glow, and one confident next step. It gives the experience room to breathe while keeping the premium tone intact.</p>
            <div className="lp-break-actions">
              <button className="lp-glass-btn" onClick={onStart} data-hover>Start Building</button>
              <button className="lp-secondary-btn" onClick={onStart} data-hover>Explore The Flow</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InputPage({ onAnalyze }) {
  const [idea, setIdea] = useState(""); const [location, setLocation] = useState("Maharashtra");
  const [scale, setScale] = useState("startup"); const [mode, setMode] = useState("both"); const [email, setEmail] = useState("");
  const suggestions = ["Cloud kitchen in Mumbai","EdTech platform for UPSC prep","Organic farm in Pune","Fintech lending app","Yoga studio franchise","Export garments business","D2C cosmetics brand","Software dev agency"];
  const states = ["Andhra Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","Uttarakhand","West Bengal"];
  return (
    <div style={{ background:"var(--ink)", minHeight:"100vh", padding:"2rem 0" }}>
      <div className="le-input-section">
        <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
          <div style={{ fontSize:10, letterSpacing:"2.5px", textTransform:"uppercase", color:"#C9A84C", fontWeight:600, marginBottom:10 }}>Full Legal Analysis</div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.2rem", color:"var(--text-primary)", marginBottom:10, lineHeight:1.1, fontWeight:600, letterSpacing:"-0.5px" }}>Analyze Your Business Idea</h2>
          <p style={{ color:"var(--text-muted)", fontSize:14 }}>The more specific you are, the more personalized your legal roadmap.</p>
        </div>
        <div className="le-input-card">
          <div className="le-input-header">
            <h2>Business Description</h2>
            <p>Describe what your business does, who it serves, and how it operates.</p>
          </div>
          <div className="le-input-body">
            <textarea className="le-textarea" placeholder="e.g. I want to open a cloud kitchen in Mumbai that delivers healthy tiffin meals to office workers, operating 6 days a week through Swiggy and Zomato, with 3 staff members..." value={idea} onChange={e => setIdea(e.target.value)} />
            <div className="le-suggestions">
              <span style={{ fontSize:11, color:"var(--text-muted)", alignSelf:"center", marginRight:4 }}>Try:</span>
              {suggestions.map(s => <button key={s} className="le-suggestion" onClick={() => setIdea(s)}>{s}</button>)}
            </div>
            <div className="le-meta-row">
              <div className="le-meta-group"><div className="le-meta-label">State / UT</div><select className="le-meta-select" value={location} onChange={e => setLocation(e.target.value)}>{states.map(s => <option key={s}>{s}</option>)}</select></div>
              <div className="le-meta-group"><div className="le-meta-label">Business Scale</div><select className="le-meta-select" value={scale} onChange={e => setScale(e.target.value)}><option value="solo">Solo / Freelancer</option><option value="startup">Startup (under Rs. 50L)</option><option value="sme">SME (Rs. 50L – Rs. 5Cr)</option><option value="enterprise">Enterprise (above Rs. 5Cr)</option></select></div>
              <div className="le-meta-group"><div className="le-meta-label">Operational Mode</div><select className="le-meta-select" value={mode} onChange={e => setMode(e.target.value)}><option value="online">Online / Digital</option><option value="offline">Offline / Physical</option><option value="both">Both (Hybrid)</option></select></div>
            </div>
          </div>
          <div style={{ padding:"0 2.25rem 1.25rem" }}>
            <div className="le-meta-label" style={{ marginBottom:7 }}>Email (optional — we'll send the PDF to you)</div>
            <input type="email" className="le-email-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="le-input-footer">
            <p className="le-disclaimer">Processed by Python backend · AI-generated insights · Consult a qualified CA or lawyer for binding legal advice.</p>
            <button className="le-btn-primary" onClick={() => onAnalyze({ idea, location, scale, mode, email })} disabled={idea.trim().length < 5}>Run Analysis →</button>
          </div>
        </div>
        <div style={{ marginTop:"1.5rem", display:"flex", justifyContent:"center", gap:"2rem", flexWrap:"wrap" }}>
          {[["📋","Licenses + Docs"],["⚖️","Risks + Penalties"],["🗺️","Action Plan"],["📄","PDF Report"]].map(([i,t]) => (
            <div key={t} style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"var(--text-muted)" }}><span>{i}</span><span>{t}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── LOADING PAGE ─────────────────────────────────────────────────────────────
function LoadingPage() {
  const [step, setStep] = useState(0);
  const steps = ["Detecting business category...","Mapping required licenses (rule engine)...","Calculating risk scores — 5 dimensions...","Calling Gemini AI for personalized enrichment...","Generating branded PDF report...","Saving to SQLite database...","Finalizing your compliance report..."];
  useEffect(() => { const t = setInterval(() => setStep(s => Math.min(s+1, steps.length-1)), 1800); return () => clearInterval(t); }, []);
  return (
    <div className="le-loading-wrap">
      <div className="le-loading">
        <div className="le-spinner" />
        <div className="le-loading-stage">Analysis Running</div>
        <div className="le-loading-sub">Python engines + Gemini AI + PDF — 20–40 seconds</div>
        <div className="le-loading-steps">
          {steps.map((s,i) => (
            <div key={s} className={`le-loading-step ${i < step ? "done" : i === step ? "active" : ""}`}>
              <div className="le-step-dot" />{i < step ? "✓ " : ""}{s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── RESULTS PAGE ─────────────────────────────────────────────────────────────
function ResultsPage({ data, input, onReset, onAskQuestion, savedReports }) {
  const f = data.feasibility || {}, r = data.risk || {}, c = data.compliance_complexity || {};
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState(null); // "timeline"|"calculator"|"assistant"|"compare"|"progress"
  const [checkedItems, setCheckedItems] = useState({});
  const [toastMsg, setToastMsg] = useState(""); const [toastShow, setToastShow] = useState(false);

  const showToast = (msg) => { setToastMsg(msg); setToastShow(true); setTimeout(() => setToastShow(false), 2800); };

  const shareReport = () => {
    const url = `${window.location.origin}/report/${data.report_id}`;
    navigator.clipboard.writeText(url).then(() => showToast("🔗 Link copied to clipboard!")).catch(() => showToast("Report ID: #" + data.report_id));
  };

  // Build all searchable text blocks
  const searchable = [
    ...(data.licenses||[]).map(l => ({ section:"Licenses", title:l.name, body:l.description||"", extra:l.authority||"" })),
    ...(data.risks||[]).map(r => ({ section:"Risks", title:r.title, body:r.description||"", extra:r.penalty||"" })),
    ...(data.action_plan||[]).map(a => ({ section:"Action Plan", title:a.title, body:a.description||"", extra:a.timeframe||"" })),
    ...(data.non_compliance_consequences||[]).map(n => ({ section:"Non-Compliance", title:n.area, body:n.consequence||"", extra:"" })),
    ...(data.cost_estimates||[]).map(ce => ({ section:"Costs", title:ce.item, body:ce.notes||"", extra:ce.range||"" })),
  ];
  const q = searchQuery.trim().toLowerCase();
  const filtered = q ? searchable.filter(s => (s.title+s.body+s.extra+s.section).toLowerCase().includes(q)) : null;

  // Checklist items for progress tracker
  const checklistItems = [
    ...(data.licenses||[]).map(l => `Obtain ${l.name}`),
    "Open a dedicated business bank account",
    "Set up accounting software (Tally / Zoho Books)",
    "Draft employee contracts if hiring staff",
    "Register trademarks if using a brand name",
    "Set up GST invoicing from Day 1",
    "Display all licenses visibly at business premises",
    "Maintain statutory registers as required by law",
  ];
  const totalChecked = Object.values(checkedItems).filter(Boolean).length;
  const pct = Math.round((totalChecked / checklistItems.length) * 100);

  return (
    <div style={{ background:"var(--ink)" }}>
      <Toast message={toastMsg} show={toastShow} />

      <div className="le-banner">
        <span className="le-banner-txt">
          Report <strong style={{ color:"var(--text-primary)" }}>#{data.report_id}</strong>
          <span style={{ margin:"0 8px", opacity:0.3 }}>·</span>{data.business_name}
          <span style={{ margin:"0 8px", opacity:0.3 }}>·</span>{input.location}
          <span style={{ margin:"0 8px", opacity:0.3 }}>·</span>
          <span style={{ color:"#C9A84C" }}>{data.category}</span>
        </span>
        <div className="le-toolbar">
          <button className="le-share-btn" onClick={shareReport}>🔗 Share</button>
          <button className="le-export-btn" onClick={() => exportToCSV(data)}>📥 CSV</button>
          <button className="le-btn-ghost" style={{ fontSize:11, padding:"5px 12px" }} onClick={() => setModal("progress")}>✅ {pct}% Done</button>
          {data.pdf_url && (
            <a href={`${API_BASE}/api/report/${data.report_id}/pdf`} target="_blank" rel="noopener noreferrer">
              <button className="le-btn-primary" style={{ fontSize:12, padding:"7px 16px" }}>⬇ PDF</button>
            </a>
          )}
          <button className="le-btn-ghost" onClick={onReset} style={{ fontSize:12, padding:"6px 14px" }}>← New</button>
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="le-modal-overlay" onClick={e => e.target===e.currentTarget && setModal(null)}>
          <div className="le-modal">
            <div className="le-modal-header">
              <div className="le-modal-title">
                {modal==="timeline" && "📅 Action Plan Timeline"}
                {modal==="calculator" && "💰 Cost Calculator"}
                {modal==="assistant" && "🧭 License Apply Assistant"}
                {modal==="compare" && "📊 Compare Reports"}
                {modal==="progress" && "✅ Progress Tracker"}
              </div>
              <button className="le-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="le-modal-body">
              {modal==="timeline" && <TimelineView actionPlan={data.action_plan} />}
              {modal==="calculator" && <CostCalculator data={data} />}
              {modal==="assistant" && <LicenseAssistant licenses={data.licenses} onClose={() => setModal(null)} />}
              {modal==="compare" && <ComparisonView reports={savedReports||[data]} />}
              {modal==="progress" && (
                <div>
                  <div className="le-progress-header">
                    <div className="le-progress-label">Compliance Progress</div>
                    <div className="le-progress-pct">{pct}%</div>
                  </div>
                  <div className="le-progress-bar-outer"><div className="le-progress-bar-inner" style={{ width:`${pct}%` }} /></div>
                  <div style={{ fontSize:12, color:"var(--text-muted)", marginBottom:"1.25rem" }}>{totalChecked} of {checklistItems.length} tasks completed</div>
                  {checklistItems.map((item,i) => (
                    <div key={i} className={`le-check-item-tracker${checkedItems[i]?" checked":""}`} onClick={() => setCheckedItems(c => ({ ...c, [i]: !c[i] }))}>
                      <div className="le-check-box"><span className="le-check-box-tick">✓</span></div>
                      <div style={{ flex:1 }}>{item}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="le-results">
        {/* Header */}
        <div className="le-results-header">
          <div className="le-results-meta">Report #{data.report_id} · {new Date().toLocaleDateString("en-IN",{ day:"numeric", month:"long", year:"numeric" })} · Python + Gemini AI · India</div>
          <div className="le-results-title">{data.business_name}</div>
          <div className="le-results-sub">{data.summary}</div>
          {data.key_insight && (
            <div className="le-insight-box">
              <span style={{ color:"#C9A84C", fontSize:9.5, fontWeight:600, letterSpacing:"1.5px", textTransform:"uppercase" }}>Key Insight</span>
              <div style={{ color:"var(--text-secondary)", fontSize:14, marginTop:6, lineHeight:1.7 }}>{data.key_insight}</div>
            </div>
          )}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:"1.25rem" }}>
            {[["#C9A84C",`${data.licenses?.length||0} Licenses Required`],[r.score>60?"#E05252":r.score>30?"#E09B40":"#4CAF7D",`Risk: ${r.label||"—"}`],["#6BA3D6",`Compliance: ${c.label||"—"}`],["#4CAF7D",`Feasibility: ${f.label||"—"}`]].map(([col,txt]) => (
              <span key={txt} style={{ fontSize:10.5, fontWeight:600, padding:"4px 12px", borderRadius:100, background:`${col}18`, border:`1px solid ${col}35`, color:col }}>{txt}</span>
            ))}
          </div>
          {/* FEATURE SHORTCUT BUTTONS */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:"1.25rem" }}>
            {[["📅 Timeline","timeline"],["💰 Calculator","calculator"],["🧭 Apply Assistant","assistant"],["📊 Compare","compare"]].map(([label, key]) => (
              <button key={key} className="le-btn-ghost" style={{ fontSize:12, padding:"6px 14px" }} onClick={() => setModal(key)}>{label}</button>
            ))}
          </div>
        </div>

        {/* SMART SEARCH */}
        <div className="le-search-bar">
          <div className="le-search-wrap">
            <span className="le-search-icon">🔍</span>
            <input className="le-search-input" placeholder="Search across licenses, risks, actions, costs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            {searchQuery && <button className="le-search-clear" onClick={() => setSearchQuery("")}>✕</button>}
          </div>
          {q && <span className="le-search-count">{filtered.length} result{filtered.length!==1?"s":""}</span>}
        </div>

        {/* SEARCH RESULTS */}
        {q && (
          <div className="le-sec" style={{ marginBottom:"1.5rem" }}>
            <div className="le-sec-body">
              {filtered.length === 0
                ? <div style={{ color:"var(--text-muted)", fontSize:13, textAlign:"center", padding:"1rem" }}>No results for "{searchQuery}"</div>
                : filtered.map((item, i) => (
                  <div key={i} style={{ padding:"10px 0", borderBottom:"1px solid var(--ink-border)", display:"flex", gap:12, alignItems:"flex-start" }}>
                    <span style={{ fontSize:10.5, fontWeight:600, padding:"3px 8px", borderRadius:100, background:"rgba(201,168,76,0.10)", color:"#C9A84C", flexShrink:0, marginTop:2 }}>{item.section}</span>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14, color:"var(--text-primary)", marginBottom:3 }}>{highlight(item.title, searchQuery)}</div>
                      <div style={{ fontSize:12, color:"var(--text-muted)", lineHeight:1.6 }}>{highlight(item.body?.slice(0,120), searchQuery)}{item.body?.length>120?"...":""}</div>
                      {item.extra && <div style={{ fontSize:11, color:"#C9A84C", marginTop:4, fontWeight:600 }}>{highlight(item.extra, searchQuery)}</div>}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* KPIs */}
        <div className="le-kpi-grid">
          <KpiCard label="Feasibility Score" score={f.score||0} note={f.note} type="feasibility" />
          <KpiCard label="Risk Score" score={r.score||0} note={r.note} type="risk" />
          <KpiCard label="Compliance Complexity" score={c.score||0} note={c.note} type="complexity" />
        </div>

        {/* Quick Stats */}
        <div className="le-summary-grid">
          <div className="le-summary-stat"><div className="le-summary-label">Licenses to Obtain</div><div className="le-summary-val">{data.licenses?.length||0}</div><div className="le-summary-sub">{data.licenses?.filter(l=>l.priority==="critical").length||0} critical priority</div></div>
          <div className="le-summary-stat"><div className="le-summary-label">Legal Risks Found</div><div className="le-summary-val">{data.risks?.length||0}</div><div className="le-summary-sub">{data.risks?.filter(rk=>rk.severity==="high").length||0} high severity</div></div>
          <div className="le-summary-stat"><div className="le-summary-label">Action Steps</div><div className="le-summary-val">{data.action_plan?.length||0}</div><div className="le-summary-sub">Ordered chronologically</div></div>
        </div>

        {/* 1. LICENSES */}
        {data.licenses?.length > 0 && (
          <Section icon="📋" title="Required Licenses & Registrations" subtitle={`${data.licenses.length} registrations required before commencing operations`} count={data.licenses.length} open>
            {data.licenses.map((lic, i) => {
              const docs = getDocuments(lic.name);
              return (
                <div key={i} className="le-lic">
                  <div className="le-lic-top">
                    <div><div className="le-lic-name">{lic.name}</div><div className="le-lic-org">Issued by: {lic.authority}</div></div>
                    <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                      <span className={`le-priority-badge priority-${lic.priority}`}>{lic.priority}</span>
                      <button className="le-btn-ghost" style={{ fontSize:11, padding:"3px 10px" }} onClick={() => setModal("assistant")}>📝 Apply Guide</button>
                    </div>
                  </div>
                  <div className="le-lic-desc">{lic.description}</div>
                  <div className="le-lic-doc-list">
                    <div className="le-lic-doc-title">Documents Required to Apply</div>
                    {docs.map((doc,j) => (
                      <div key={j} className="le-lic-doc-item"><span style={{ color:"#C9A84C", flexShrink:0 }}>✓</span>{doc}</div>
                    ))}
                  </div>
                  <div className="le-lic-meta">
                    <div><span className="le-lic-meta-key">Govt. Cost:</span><span className="le-lic-meta-val">{lic.estimated_cost}</span></div>
                    <div><span className="le-lic-meta-key">Approval Time:</span><span className="le-lic-meta-val">{lic.time_to_approve}</span></div>
                    <div><span className="le-lic-meta-key">Priority:</span><span className="le-lic-meta-val" style={{ textTransform:"capitalize" }}>{lic.priority}</span></div>
                    {lic.link && <div style={{ marginLeft:"auto" }}><a href={lic.link} target="_blank" rel="noopener noreferrer" style={{ color:"#6BA3D6", fontSize:12, fontWeight:600, textDecoration:"none" }}>Apply Online →</a></div>}
                  </div>
                </div>
              );
            })}
          </Section>
        )}

        {/* 2. RISK CHART */}
        {data.risk_breakdown?.length > 0 && (
          <Section icon="📊" title="Risk Distribution by Category" subtitle="Calculated by deterministic Python rule engine — not AI" open>
            <div style={{ padding:"0.5rem 0" }}>
              {data.risk_breakdown.map((rb,i) => {
                const { c: bc } = scoreColor(rb.score, "risk");
                return (
                  <div key={i} className="le-bar-row">
                    <div className="le-bar-name">{rb.label}</div>
                    <div className="le-bar-track"><div className="le-bar-fill" style={{ width:`${Math.min(rb.score,100)}%`, background:bc }} /></div>
                    <div className="le-bar-val" style={{ color:bc }}>{rb.score}/100</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop:"1rem", padding:"0.85rem 1.1rem", background:"rgba(255,255,255,0.025)", border:"1px solid var(--ink-border)", borderRadius:"var(--r-sm)", display:"flex", gap:"1.5rem", flexWrap:"wrap" }}>
              {[["#4CAF7D","0–30 Low"],["#E09B40","31–60 Medium"],["#E05252","61–100 High"]].map(([c,l]) => (
                <div key={l} style={{ display:"flex", alignItems:"center", gap:7, fontSize:12 }}><div style={{ width:9, height:9, borderRadius:3, background:c }} /><span style={{ color:"var(--text-muted)" }}>{l} Risk</span></div>
              ))}
            </div>
          </Section>
        )}

        {/* 3. RISKS */}
        {data.risks?.length > 0 && (
          <Section icon="⚠️" title="Legal Risks & Penalties" subtitle={`${data.risks.filter(rk=>rk.severity==="high").length} high-severity risks — cited from actual Indian Acts`} count={data.risks.length} open>
            {data.risks.map((risk,i) => {
              const sc = risk.severity==="high"?"#E05252":risk.severity==="medium"?"#E09B40":"#6BA3D6";
              const bg = risk.severity==="high"?"rgba(224,82,82,0.06)":risk.severity==="medium"?"rgba(224,155,64,0.06)":"rgba(107,163,214,0.06)";
              return (
                <div key={i} className="le-risk" style={{ background:bg, borderColor:`${sc}22` }}>
                  <div className="le-risk-header"><div className="le-risk-name" style={{ color:sc }}>{risk.title}</div><span className="le-risk-sev" style={{ background:`${sc}16`, color:sc, border:`1px solid ${sc}28` }}>{risk.severity}</span></div>
                  <div className="le-risk-desc">{risk.description}</div>
                  {risk.law && (
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                      <span style={{ fontSize:9.5, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:0.8 }}>Under</span>
                      <span style={{ fontSize:12, fontWeight:600, padding:"3px 10px", borderRadius:"var(--r-sm)", background:"rgba(255,255,255,0.05)", color:"var(--text-secondary)", border:"1px solid var(--ink-border)" }}>{risk.law}</span>
                    </div>
                  )}
                  <span className="le-risk-penalty" style={{ background:`${sc}10`, color:sc, borderColor:`${sc}28` }}>⚖ Penalty: {risk.penalty}</span>
                </div>
              );
            })}
          </Section>
        )}

        {/* 4. NON-COMPLIANCE */}
        {data.non_compliance_consequences?.length > 0 && (
          <Section icon="🚫" title="Non-Compliance Consequences" subtitle="What actually happens if you skip each requirement" count={data.non_compliance_consequences.length}>
            {data.non_compliance_consequences.map((nc,i) => (
              <div key={i} className="le-nc"><div className="le-nc-title"><span>⚠</span>{nc.area}</div><div className="le-nc-desc">{nc.consequence}</div></div>
            ))}
          </Section>
        )}

        {/* 5. ACTION PLAN with timeline button */}
        {data.action_plan?.length > 0 && (
          <Section icon="🗺️" title="Step-by-Step Action Plan" subtitle={`${data.action_plan.length} steps ordered chronologically — what to do first`} count={data.action_plan.length} open>
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:"1rem" }}>
              <button className="le-btn-ghost" style={{ fontSize:12, padding:"6px 14px" }} onClick={() => setModal("timeline")}>📅 View Timeline</button>
            </div>
            {data.action_plan.map((step,i) => {
              const catC = { legal:"#6BA3D6", financial:"#4CAF7D", operational:"#E09B40", compliance:"#E05252" }[step.category]||"#C9A84C";
              const catBg = { legal:"rgba(107,163,214,0.10)", financial:"rgba(76,175,125,0.10)", operational:"rgba(224,155,64,0.10)", compliance:"rgba(224,82,82,0.10)" }[step.category]||"rgba(201,168,76,0.08)";
              return (
                <div key={i} className="le-action">
                  <div className="le-action-left"><div className="le-action-num">{step.step}</div>{i<data.action_plan.length-1 && <div className="le-action-line" />}</div>
                  <div className="le-action-content">
                    <div className="le-action-title">{step.title}</div>
                    <div className="le-action-desc">{step.description}</div>
                    <div className="le-action-tags">
                      <span className="le-action-tag" style={{ background:catBg, color:catC, borderColor:`${catC}28` }}>{step.category}</span>
                      <span className="le-action-tag" style={{ background:"rgba(255,255,255,0.04)", color:"var(--text-muted)", borderColor:"var(--ink-border)" }}>{step.timeframe}</span>
                      {step.cost && <span className="le-action-tag" style={{ background:"rgba(201,168,76,0.08)", color:"#C9A84C", borderColor:"rgba(201,168,76,0.22)" }}>{step.cost}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </Section>
        )}

        {/* 6. COSTS with calculator button */}
        {data.cost_estimates?.length > 0 && (
          <Section icon="💰" title="Cost Estimates" subtitle="Realistic rupee ranges for every registration and compliance item" count={data.cost_estimates.length}>
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:"1rem" }}>
              <button className="le-btn-ghost" style={{ fontSize:12, padding:"6px 14px" }} onClick={() => setModal("calculator")}>🎛 Open Calculator</button>
            </div>
            <table className="le-cost-table">
              <thead><tr><th>Item</th><th>Estimated Range</th><th>Notes</th></tr></thead>
              <tbody>
                {data.cost_estimates.map((ce,i) => {
                  const isFree = (ce.range||"").toLowerCase().includes("free")||(ce.range||"").includes(" 0");
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight:600, color:"var(--text-primary)" }}>{ce.item}</td>
                      <td><span className="le-cost-num" style={{ color:isFree?"#4CAF7D":"var(--text-primary)" }}>{ce.range}</span>{isFree && <span style={{ fontSize:9.5, fontWeight:700, padding:"2px 7px", borderRadius:4, background:"rgba(76,175,125,0.13)", color:"#4CAF7D", marginLeft:6 }}>FREE</span>}</td>
                      <td style={{ color:"var(--text-muted)" }}>{ce.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ marginTop:"1rem", padding:"0.85rem 1.1rem", background:"rgba(201,168,76,0.05)", border:"1px solid rgba(201,168,76,0.14)", borderRadius:"var(--r-sm)", fontSize:12, color:"var(--text-muted)" }}>
              💡 CA / legal fees for registration assistance: Rs. 1,500–10,000 per registration. Use the calculator above to estimate your total.
            </div>
          </Section>
        )}

        {/* 7. CHECKLIST (progress-enabled) */}
        {data.licenses?.length > 0 && (
          <Section icon="✅" title="Pre-Launch Compliance Checklist" subtitle={`${totalChecked}/${checklistItems.length} completed — click to track progress`}>
            <div style={{ marginBottom:"1rem" }}>
              <div className="le-progress-header"><div className="le-progress-label">Overall Progress</div><div className="le-progress-pct">{pct}%</div></div>
              <div className="le-progress-bar-outer"><div className="le-progress-bar-inner" style={{ width:`${pct}%` }} /></div>
            </div>
            <div className="le-check-grid">
              {checklistItems.map((item, i) => (
                <div key={i} className={`le-check-item${checkedItems[i]?" checked":""}`} onClick={() => setCheckedItems(c => ({ ...c, [i]: !c[i] }))}>
                  <span style={{ color:checkedItems[i]?"#4CAF7D":i<(data.licenses?.length||0)?"#C9A84C":"#4CAF7D", flexShrink:0, fontSize:15 }}>{checkedItems[i]?"☑":i<(data.licenses?.length||0)?"◯":"☐"}</span>
                  {item}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* FOLLOW UP */}
        {data.follow_up_questions?.length > 0 && (
          <div className="le-followup">
            <h3>Dig Deeper</h3>
            <p>Click any question to run a new analysis with it pre-filled — tailored to your business context.</p>
            <div className="le-followup-qs">
              {data.follow_up_questions.map((q,i) => (
                <button key={i} className="le-followup-q" onClick={() => onAskQuestion(q, input)}>
                  <span style={{ color:"#C9A84C", marginRight:8, fontWeight:600 }}>→</span>{q}
                </button>
              ))}
            </div>
            <div style={{ marginTop:"1rem", fontSize:11, color:"rgba(255,255,255,0.22)" }}>Each question runs the full analysis pipeline with your location, scale, and mode preserved.</div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop:"2rem", background:"rgba(201,168,76,0.05)", border:"1px solid rgba(201,168,76,0.14)", borderRadius:"var(--r-lg)", padding:"1.5rem 2rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div style={{ fontSize:12, color:"var(--text-muted)" }}>
            Report ID: <strong style={{ color:"var(--text-primary)" }}>#{data.report_id}</strong>
            <span style={{ margin:"0 8px" }}>·</span>Category: <strong style={{ color:"var(--text-primary)" }}>{data.category}</strong>
            <span style={{ margin:"0 8px" }}>·</span>Python Rule Engine + Gemini AI
          </div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
            <button className="le-share-btn" onClick={shareReport}>🔗 Share Link</button>
            <button className="le-export-btn" onClick={() => exportToCSV(data)}>📥 Export CSV</button>
            {data.pdf_url && <a href={`${API_BASE}/api/report/${data.report_id}/pdf`} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:"#6BA3D6", fontWeight:600, textDecoration:"none" }}>Download PDF →</a>}
            <button className="le-btn-outline" onClick={onReset} style={{ fontSize:12, padding:"7px 16px" }}>← New Analysis</button>
          </div>
        </div>
        <div style={{ marginTop:"1.5rem", textAlign:"center", paddingBottom:"2rem", fontSize:11, color:"rgba(255,255,255,0.15)" }}>
          LegalEase AI · For informational use only · Always consult a qualified CA or Advocate for binding legal advice
        </div>
      </div>
    </div>
  );
}

// ─── REPORT VIEWER PAGE ───────────────────────────────────────────────────────
function ReportViewerPage({ reportId, onBack, onAnalyze, savedReports }) {
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [err, setErr] = useState(null);
  useEffect(() => {
    if (!reportId) return;
    fetch(`${API_BASE}/api/report/${reportId}`)
      .then(r => { if (!r.ok) throw new Error("Report not found"); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setErr(e.message); setLoading(false); });
  }, [reportId]);
  if (loading) return <div className="le-report-viewer"><div className="le-report-viewer-loading"><div className="le-spinner" /><div style={{ color:"var(--text-muted)", fontSize:14 }}>Loading report #{reportId}...</div></div></div>;
  if (err) return <div className="le-report-viewer"><div className="le-report-viewer-loading"><div style={{ color:"var(--red)", fontSize:16, fontWeight:600 }}>Report Not Found</div><div style={{ color:"var(--text-muted)", fontSize:13 }}>Report #{reportId} could not be found.</div><button className="le-btn-outline" onClick={onBack} style={{ marginTop:"1rem" }}>← Back to Home</button></div></div>;
  return (
    <div className="le-report-viewer">
      <div style={{ background:"rgba(12,11,9,0.97)", borderBottom:"1px solid var(--ink-border)", padding:"0.75rem 2rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8, position:"sticky", top:65, zIndex:90 }}>
        <span style={{ fontSize:13, color:"var(--text-muted)" }}>Shared Report <strong style={{ color:"var(--text-primary)" }}>#{data.report_id}</strong><span style={{ margin:"0 8px", opacity:0.3 }}>·</span>{data.business_name}</span>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {data.pdf_url && <a href={`${API_BASE}/api/report/${data.report_id}/pdf`} target="_blank" rel="noopener noreferrer"><button className="le-btn-primary" style={{ fontSize:12, padding:"7px 16px" }}>⬇ Download PDF</button></a>}
          <button className="le-btn-ghost" onClick={onBack} style={{ fontSize:12, padding:"6px 14px" }}>← Home</button>
        </div>
      </div>
      <ResultsPage data={data} input={{ location:data.location, scale:data.scale, mode:data.mode }} onReset={onBack} onAskQuestion={onAnalyze ? (q,inp) => onAnalyze({ idea:q, location:inp.location, scale:inp.scale, mode:inp.mode }) : onBack} savedReports={savedReports} />
    </div>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
function DashboardPage({ onOpen, onBack }) {
  const [reports, setReports] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { fetch(`${API_BASE}/api/reports`).then(r => r.json()).then(d => { setReports(d); setLoading(false); }).catch(() => setLoading(false)); }, []);
  return (
    <div style={{ background:"var(--ink)", minHeight:"100vh" }}>
      <div className="le-dashboard">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"2.5rem", flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:"2.5px", textTransform:"uppercase", color:"#C9A84C", fontWeight:600, marginBottom:8 }}>Report History</div>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.9rem", color:"var(--text-primary)", fontWeight:600, letterSpacing:"-0.3px" }}>Past Analyses</h2>
          </div>
          <button className="le-btn-outline" onClick={onBack} style={{ fontSize:13 }}>← Back</button>
        </div>
        {loading && <div style={{ color:"var(--text-muted)", textAlign:"center", padding:"3rem" }}>Loading reports...</div>}
        {!loading && reports.length === 0 && <div style={{ color:"var(--text-muted)", textAlign:"center", padding:"3rem", background:"rgba(255,255,255,0.025)", border:"1px solid var(--ink-border)", borderRadius:"var(--r-md)" }}>No reports generated yet. Run your first analysis!</div>}
        {!loading && reports.map(r => (
          <div key={r.id} className="le-report-row" onClick={() => onOpen(r.id)}>
            <div className="le-report-row-id">#{r.id}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="le-report-row-biz" style={{ marginBottom:3 }}>{r.idea?.slice(0,60)}{r.idea?.length>60?"...":""}</div>
              <div className="le-report-row-meta">{r.location} · {r.scale} · {new Date(r.created_at).toLocaleDateString("en-IN",{ day:"numeric", month:"short", year:"numeric" })}</div>
            </div>
            <span style={{ fontSize:12, color:"rgba(201,168,76,0.65)", fontWeight:600, flexShrink:0 }}>View →</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const getInitialPage = () => {
    const path = window.location.pathname;
    if (path.startsWith("/report/")) return "viewer";
    if (path === "/reports" || path === "/dashboard") return "dashboard";
    return "landing";
  };
  const getInitialReportId = () => {
    const path = window.location.pathname;
    if (path.startsWith("/report/")) return path.split("/report/")[1].toUpperCase();
    return null;
  };

  const [page, setPage] = useState(getInitialPage);
  const [viewReportId, setViewReportId] = useState(getInitialReportId);
  const [result, setResult] = useState(null);
  const [inputData, setInputData] = useState(null);
  const [error, setError] = useState(null);
  const [savedReports, setSavedReports] = useState([]);

  const navigate = (newPage, reportId = null) => {
    if (newPage === "viewer" && reportId) { window.history.pushState({}, "", `/report/${reportId}`); setViewReportId(reportId); }
    else if (newPage === "dashboard") window.history.pushState({}, "", "/reports");
    else if (newPage === "landing") window.history.pushState({}, "", "/");
    else if (newPage === "input") window.history.pushState({}, "", "/analyze");
    setPage(newPage);
  };

  useEffect(() => {
    const handler = () => { setPage(getInitialPage()); setViewReportId(getInitialReportId()); };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  async function handleAnalyze(params) {
    if (!params.idea.trim()) return;
    setInputData(params); setPage("loading"); setError(null);
    window.history.pushState({}, "", "/analyze");
    let data = null, errMsg = null;
    try { data = await callAnalyzeAPI(params); } catch (e) { errMsg = e.name === "AbortError" ? "Request timed out — try again." : e.message || "Analysis failed."; }
    if (data) {
      setResult(data);
      setSavedReports(prev => prev.find(r => r.report_id === data.report_id) ? prev : [data, ...prev].slice(0, 10));
      window.history.pushState({}, "", `/report/${data.report_id}`);
      setPage("results");
    } else { setError(errMsg); setPage("input"); }
  }

  const goHome = () => { setResult(null); setError(null); setViewReportId(null); navigate("landing"); };

  return (
    <div className={`le-root${page === "landing" ? " le-root-landing" : ""}`}>
      <style>{css}</style>
      <nav className="le-nav">
        <div className="le-nav-logo" onClick={goHome}>
          <div className="le-nav-logo-mark">L</div>
          <div><div className="le-nav-name">LegalEase AI</div><div className="le-nav-tag">India · Legal Intelligence</div></div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {page==="results" && result && <span style={{ fontSize:11, color:"var(--text-muted)" }}>#{result.report_id}</span>}
          <button className="le-btn-ghost" style={{ fontSize:11, padding:"5px 12px" }} onClick={() => navigate("dashboard")}>Past Reports</button>
          <div className="le-nav-pill">Full Stack</div>
        </div>
      </nav>
      {error && (
        <div style={{ background:"rgba(224,82,82,0.12)", borderBottom:"2px solid var(--red)", padding:"0.85rem 2rem", color:"var(--red)", fontSize:13, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span>⚠ {error}</span>
          <button onClick={() => setError(null)} style={{ background:"none", border:"none", color:"var(--red)", cursor:"pointer", fontWeight:600, textDecoration:"underline", fontFamily:"'DM Sans',sans-serif" }}>Dismiss</button>
        </div>
      )}
      {page==="landing"   && <CinematicLandingPage onStart={() => navigate("input")} />}
      {page==="input"     && <InputPage onAnalyze={handleAnalyze} />}
      {page==="loading"   && <LoadingPage />}
      {page==="results"   && result && (
        <ResultsPage data={result} input={inputData}
          onReset={() => { setResult(null); setError(null); navigate("input"); }}
          onAskQuestion={(q, prevInput) => handleAnalyze({ idea:q, location:prevInput.location, scale:prevInput.scale, mode:prevInput.mode })}
          savedReports={savedReports}
        />
      )}
      {page==="viewer"    && <ReportViewerPage reportId={viewReportId} onBack={goHome} onAnalyze={handleAnalyze} savedReports={savedReports} />}
      {page==="dashboard" && <DashboardPage onOpen={id => { setViewReportId(id); navigate("viewer", id); }} onBack={goHome} />}
    </div>
  );
}
