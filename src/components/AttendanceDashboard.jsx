import{useState,useEffect,useRef,useCallback,useMemo}from 'react';
import*as XLSX from 'xlsx';
import{getAllFiles,uploadFile,getAttendanceByFile,deleteFile,deleteAllFiles,createRecord,updateRecord,deleteRecord}from '../services/api';
import deltaplusLogo from '../assets/deltaplus.png';

const css=`
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
:root{--bg:#f9f8f3;--bg-2:#ffffff;--bg-3:#f4f2eb;--bg-4:#edeadf;--bg-sidebar:#fffef9;--border:rgba(0,0,0,0.08);--border-2:rgba(0,0,0,0.14);--text-1:#1c1a16;--text-2:#5c5648;--text-3:#9e9585;--accent:#d4a017;--accent-2:#b8880f;--accent-3:#f5c842;--accent-glow:rgba(212,160,23,0.18);--accent-soft:rgba(212,160,23,0.09);--green:#1a9958;--amber:#c8820a;--red:#d43f3f;--teal:#0d9e8e;--violet:#7a50d2;--sky:#1880c2;--orange:#d2600a;--slate:#586e82;--r:12px;--rs:8px;--rl:16px;}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
html,body{height:100%;overflow:hidden;}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text-1);font-size:13.5px;line-height:1.55;-webkit-font-smoothing:antialiased;}
#root{height:100%;display:flex;}
.app{display:flex;width:100vw;height:100vh;overflow:hidden;position:fixed;inset:0;background:radial-gradient(ellipse 65% 55% at 85% -5%,rgba(245,200,66,.14) 0%,transparent 52%),radial-gradient(ellipse 50% 45% at -5% 95%,rgba(212,160,23,.10) 0%,transparent 50%),radial-gradient(ellipse 35% 30% at 50% 105%,rgba(245,200,66,.07) 0%,transparent 45%),var(--bg);}
.sidebar{width:220px;min-width:220px;background:var(--bg-sidebar);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;position:relative;}
.sidebar::after{content:'';position:absolute;top:0;right:0;width:1px;height:100%;background:linear-gradient(to bottom,transparent,rgba(212,160,23,.22) 45%,transparent);pointer-events:none;}
.logo-block{padding:16px 14px 13px;border-bottom:1px solid var(--border);background:linear-gradient(135deg,rgba(212,160,23,.09) 0%,rgba(245,200,66,.04) 100%);flex-shrink:0;animation:slideDown .38s cubic-bezier(.34,1.2,.64,1) both;}
.logo-wrap{display:flex;align-items:center;gap:10px;}
.logo-img{width:32px;height:32px;object-fit:contain;border-radius:8px;flex-shrink:0;box-shadow:0 2px 8px rgba(212,160,23,.22);transition:transform .2s;}
.logo-img:hover{transform:scale(1.07) rotate(-2deg);}
.logo-text{display:block;font-size:13px;font-weight:700;color:var(--text-1);letter-spacing:-.3px;}
.logo-sub{display:block;font-size:10px;color:var(--text-3);margin-top:1px;}
.file-nav{flex:1;overflow-y:auto;padding:10px 0 6px;}
.nav-label{display:block;font-size:9px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:1.4px;padding:0 16px 8px;}
.no-files{display:block;font-size:12px;color:var(--text-3);padding:6px 16px;font-style:italic;}
.file-item{display:flex;align-items:center;gap:8px;padding:7px 10px 7px 16px;cursor:pointer;transition:background .15s;position:relative;margin:2px 6px;border-radius:var(--rs);animation:fadeUp .3s ease both;}
.file-item:hover{background:rgba(212,160,23,.07);}
.file-item.active{background:rgba(212,160,23,.11);box-shadow:inset 3px 0 0 var(--accent);}
.file-icon{color:var(--text-3);flex-shrink:0;display:flex;width:13px;height:13px;}
.file-item.active .file-icon{color:var(--accent);}
.file-label{flex:1;font-size:12px;color:var(--text-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.file-item.active .file-label{color:var(--text-1);font-weight:600;}
.file-count{font-size:10px;color:var(--text-3);background:var(--bg-4);padding:2px 6px;border-radius:20px;flex-shrink:0;font-family:'DM Mono',monospace;}
.file-item.active .file-count{background:rgba(212,160,23,.18);color:var(--accent-2);}
.file-del{background:none;border:none;cursor:pointer;color:var(--text-3);padding:2px;border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s;width:18px;height:18px;}
.file-del:hover{background:rgba(212,63,63,.12);color:var(--red);}
.sidebar-footer{padding:10px 12px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:7px;}
.upload-label{display:flex;align-items:center;gap:8px;padding:9px 11px;border:1.5px dashed rgba(0,0,0,.14);border-radius:var(--rs);cursor:pointer;font-size:12px;color:var(--text-2);transition:all .18s;overflow:hidden;}
.upload-label:hover{border-color:var(--accent);color:var(--accent-2);background:var(--accent-soft);}
.upload-icon{display:flex;width:13px;height:13px;flex-shrink:0;}
.upload-text{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.btn{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 13px;border-radius:var(--rs);font-size:12px;font-weight:600;cursor:pointer;border:1px solid transparent;transition:all .18s;white-space:nowrap;font-family:'DM Sans',sans-serif;line-height:1;position:relative;overflow:hidden;}
.btn:active{transform:scale(.97);}
.btn:disabled{opacity:.4;cursor:not-allowed;}
.btn-full{width:100%;justify-content:center;}
.btn-icon{display:flex;width:12px;height:12px;flex-shrink:0;}
.btn-primary{background:linear-gradient(135deg,var(--accent),var(--accent-2));color:#fff;border-color:rgba(212,160,23,.45);box-shadow:0 2px 8px rgba(212,160,23,.30);text-shadow:0 1px 2px rgba(0,0,0,.12);}
.btn-primary:hover:not(:disabled){background:linear-gradient(135deg,var(--accent-3),var(--accent));box-shadow:0 4px 16px rgba(212,160,23,.40);transform:translateY(-1px);}
.btn-ghost{background:var(--bg-3);color:var(--text-2);border-color:var(--border-2);}
.btn-ghost:hover:not(:disabled){background:var(--bg-4);color:var(--text-1);}
.btn-export{background:rgba(26,153,88,.09);color:var(--green);border-color:rgba(26,153,88,.22);}
.btn-export:hover:not(:disabled){background:rgba(26,153,88,.16);border-color:rgba(26,153,88,.36);}
.btn-danger{background:transparent;color:var(--red);border-color:rgba(212,63,63,.28);font-size:12px;}
.btn-danger:hover:not(:disabled){background:rgba(212,63,63,.07);border-color:rgba(212,63,63,.44);}
.icon-btn{width:30px;height:30px;border:1px solid var(--border-2);border-radius:var(--rs);background:var(--bg-3);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-2);transition:all .15s;flex-shrink:0;padding:0;}
.icon-btn svg{width:12px;height:12px;}
.icon-btn:hover{background:var(--bg-4);color:var(--text-1);}
.icon-btn-danger:hover{border-color:rgba(212,63,63,.35);background:rgba(212,63,63,.07);color:var(--red);}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
.topbar{height:52px;background:rgba(255,254,249,.90);backdrop-filter:blur(14px);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 20px;gap:10px;flex-shrink:0;position:sticky;top:0;z-index:10;}
.breadcrumb{display:flex;align-items:center;gap:6px;min-width:0;overflow:hidden;}
.bc-root{font-size:12.5px;color:var(--text-3);white-space:nowrap;}
.bc-sep{color:var(--text-3);display:flex;align-items:center;flex-shrink:0;width:11px;height:11px;opacity:.5;}
.bc-current{font-size:12.5px;font-weight:600;color:var(--text-1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;}
.bc-emp{color:var(--accent-2)!important;}
.refresh-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--accent);margin-left:5px;flex-shrink:0;animation:pulse 1.4s ease-in-out infinite;box-shadow:0 0 5px rgba(212,160,23,.55);}
.topbar-right{display:flex;align-items:center;gap:7px;flex-shrink:0;}
.view-toggle{display:flex;gap:2px;background:var(--bg-3);border-radius:var(--rs);padding:3px;border:1px solid var(--border);}
.vtoggle-btn{display:inline-flex;align-items:center;gap:5px;height:25px;padding:0 10px;border-radius:6px;font-size:11.5px;font-weight:500;cursor:pointer;border:none;background:transparent;color:var(--text-3);transition:all .18s;white-space:nowrap;font-family:'DM Sans',sans-serif;}
.vtoggle-btn:hover{color:var(--text-1);}
.vtoggle-btn.active{background:var(--bg-2);color:var(--text-1);box-shadow:0 1px 4px rgba(0,0,0,.10);}
.vtoggle-icon{display:flex;width:11px;height:11px;}
.search-wrap{position:relative;display:flex;align-items:center;}
.search-icon{position:absolute;left:9px;color:var(--text-3);display:flex;pointer-events:none;width:12px;height:12px;z-index:1;}
.search-input{height:32px;width:180px;padding:0 9px 0 28px;border:1px solid var(--border-2);border-radius:var(--rs);font-size:12px;background:var(--bg-2);color:var(--text-1);outline:none;transition:all .18s;font-family:'DM Sans',sans-serif;}
.search-input::placeholder{color:var(--text-3);}
.search-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-glow);}
.dept-select{height:32px;padding:0 9px;border:1px solid var(--border-2);border-radius:var(--rs);font-size:12px;background:var(--bg-2);color:var(--text-1);outline:none;cursor:pointer;transition:all .18s;font-family:'DM Sans',sans-serif;}
.dept-select:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-glow);}
.stats-bar{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:12px 20px;background:var(--bg-2);border-bottom:1px solid var(--border);flex-shrink:0;}
.stat-card{background:var(--bg-3);border-radius:var(--rs);padding:10px 14px;border:1px solid var(--border);transition:all .22s;animation:fadeUp .4s ease both;}
.stat-card:hover{border-color:rgba(212,160,23,.28);transform:translateY(-1px);box-shadow:0 4px 12px rgba(212,160,23,.10);}
.stat-label{display:block;font-size:9.5px;color:var(--text-3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:5px;font-weight:600;}
.stat-value{display:block;font-size:24px;font-weight:700;color:var(--text-1);line-height:1;letter-spacing:-.8px;font-family:'DM Mono',monospace;}
.stat-blue{color:var(--accent-2);}.stat-green{color:var(--green);}.stat-amber{color:var(--amber);}
.content{flex:1;overflow-y:auto;padding:18px 20px;}
.table-wrap{background:var(--bg-2);border-radius:var(--r);border:1px solid var(--border);overflow-x:auto;transition:opacity .25s;box-shadow:0 1px 5px rgba(0,0,0,.05);animation:fadeUp .35s ease both;}
.table-refreshing{opacity:.4;pointer-events:none;}
.rec-table{width:100%;border-collapse:collapse;font-size:12.5px;}
.rec-table thead th{background:var(--bg-3);padding:10px 13px;text-align:left;font-size:9.5px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.8px;border-bottom:1px solid var(--border);white-space:nowrap;position:sticky;top:0;z-index:1;}
.col-num{width:40px;}.col-actions{width:100px;}
.rec-table tbody td{padding:10px 13px;border-bottom:1px solid var(--border);vertical-align:middle;color:var(--text-2);white-space:nowrap;transition:background .1s;}
.rec-row:last-child td{border-bottom:none;}
.rec-row:hover td{background:rgba(212,160,23,.04);}
.rec-row{animation:rowFade .28s ease both;}
.td-num{color:var(--text-3)!important;font-family:'DM Mono',monospace;font-size:11px;}
.td-name{font-weight:600;color:var(--text-1)!important;}
.td-day{font-weight:500;}
.day-monday{color:#2c7da0;}.day-tuesday{color:#2a9d8f;}.day-wednesday{color:#e9c46a;}.day-thursday{color:#f4a261;}.day-friday{color:#e76f51;}.day-saturday{color:#6c757d;}.day-sunday{color:#e63946;}
.td-remarks{max-width:140px;overflow:hidden;text-overflow:ellipsis;}
.fw-medium{font-weight:600;color:var(--text-1);}.muted{color:var(--text-3);}
.name-link{background:none;border:none;cursor:pointer;font-weight:600;color:var(--text-1);font-size:12.5px;padding:0;text-align:left;transition:color .15s;font-family:'DM Sans',sans-serif;}
.name-link:hover{color:var(--accent-2);}
.row-actions{display:flex;gap:4px;}
.badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;font-family:'DM Mono',monospace;}
.badge-green{background:rgba(26,153,88,.10);color:var(--green);}
.badge-amber{background:rgba(200,130,10,.10);color:var(--amber);}
.badge-red{background:rgba(212,63,63,.10);color:var(--red);}
.badge-slate{background:rgba(88,110,130,.10);color:var(--slate);}
.badge-teal{background:rgba(13,158,142,.10);color:var(--teal);}
.badge-violet{background:rgba(122,80,210,.10);color:var(--violet);}
.badge-sky{background:rgba(24,128,194,.10);color:var(--sky);}
.badge-orange{background:rgba(210,96,10,.10);color:var(--orange);}
.summary-grid{display:grid;gap:8px;}
.summary-cols-9{grid-template-columns:repeat(9,1fr);}
.summary-cols-5{grid-template-columns:repeat(5,1fr);}
.summary-card{border:1px solid var(--border);border-radius:var(--rs);padding:12px;display:flex;flex-direction:column;gap:4px;transition:all .22s;position:relative;overflow:hidden;background:var(--bg-2);animation:cardPop .4s cubic-bezier(.34,1.3,.64,1) both;}
.summary-card::before{content:'';position:absolute;inset:0;opacity:0;transition:opacity .22s;border-radius:inherit;}
.summary-card:hover{transform:translateY(-3px);box-shadow:0 8px 22px rgba(0,0,0,.08);}
.summary-card:hover::before{opacity:1;}
.card-icon{display:flex;margin-bottom:2px;}.card-icon svg{width:13px;height:13px;}
.card-value{font-size:18px;font-weight:700;line-height:1;letter-spacing:-.5px;font-family:'DM Mono',monospace;}
.card-unit{font-size:9px;font-weight:600;margin-left:2px;opacity:.55;font-family:'DM Sans',sans-serif;}
.card-label{font-size:9.5px;color:var(--text-3);font-weight:600;text-transform:uppercase;letter-spacing:.5px;}
.card-blue .card-icon,.card-blue .card-value{color:var(--accent-2);}.card-blue{border-color:rgba(212,160,23,.22);}.card-blue::before{background:linear-gradient(135deg,rgba(212,160,23,.08),transparent 60%);}
.card-green .card-icon,.card-green .card-value{color:var(--green);}.card-green{border-color:rgba(26,153,88,.18);}.card-green::before{background:linear-gradient(135deg,rgba(26,153,88,.07),transparent 60%);}
.card-amber .card-icon,.card-amber .card-value{color:var(--amber);}.card-amber{border-color:rgba(200,130,10,.18);}.card-amber::before{background:linear-gradient(135deg,rgba(200,130,10,.07),transparent 60%);}
.card-red .card-icon,.card-red .card-value{color:var(--red);}.card-red{border-color:rgba(212,63,63,.18);}.card-red::before{background:linear-gradient(135deg,rgba(212,63,63,.06),transparent 60%);}
.card-slate .card-icon,.card-slate .card-value{color:var(--slate);}.card-slate{border-color:rgba(88,110,130,.18);}.card-slate::before{background:linear-gradient(135deg,rgba(88,110,130,.06),transparent 60%);}
.card-teal .card-icon,.card-teal .card-value{color:var(--teal);}.card-teal{border-color:rgba(13,158,142,.18);}.card-teal::before{background:linear-gradient(135deg,rgba(13,158,142,.06),transparent 60%);}
.card-violet .card-icon,.card-violet .card-value{color:var(--violet);}.card-violet{border-color:rgba(122,80,210,.18);}.card-violet::before{background:linear-gradient(135deg,rgba(122,80,210,.06),transparent 60%);}
.card-sky .card-icon,.card-sky .card-value{color:var(--sky);}.card-sky{border-color:rgba(24,128,194,.18);}.card-sky::before{background:linear-gradient(135deg,rgba(24,128,194,.06),transparent 60%);}
.card-orange .card-icon,.card-orange .card-value{color:var(--orange);}.card-orange{border-color:rgba(210,96,10,.18);}.card-orange::before{background:linear-gradient(135deg,rgba(210,96,10,.06),transparent 60%);}
.emp-picker{background:var(--bg-2);border-radius:var(--r);border:1px solid var(--border);overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,.05);animation:fadeUp .3s ease both;}
.picker-header{padding:16px 20px 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.picker-title{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:var(--text-1);margin-bottom:2px;letter-spacing:-.3px;}
.picker-icon{display:flex;width:14px;height:14px;}
.picker-sub{font-size:11.5px;color:var(--text-3);}
.picker-search-wrap{position:relative;padding:12px 16px 9px;border-bottom:1px solid var(--border);}
.picker-search-icon{position:absolute;left:28px;top:50%;transform:translateY(-50%);color:var(--text-3);display:flex;pointer-events:none;width:13px;height:13px;}
.picker-search{width:100%;height:36px;padding:0 11px 0 32px;border:1px solid var(--border-2);border-radius:var(--rs);font-size:12.5px;background:var(--bg-3);color:var(--text-1);outline:none;transition:all .18s;font-family:'DM Sans',sans-serif;}
.picker-search::placeholder{color:var(--text-3);}
.picker-search:focus{border-color:var(--accent);background:var(--bg-2);box-shadow:0 0 0 3px var(--accent-glow);}
.emp-list-header{display:grid;grid-template-columns:40px 1fr 60px 82px 82px 82px 82px 82px 36px;align-items:center;padding:7px 20px;background:var(--bg-3);border-bottom:1px solid var(--border);font-size:9.5px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.8px;}
.col-center{text-align:center;}.col-right{text-align:right;padding-right:6px;}
.emp-list{overflow-y:auto;max-height:calc(100vh - 280px);}
.emp-list-empty{padding:28px 20px;text-align:center;font-size:12.5px;color:var(--text-3);font-style:italic;}
.emp-list-item{display:grid;grid-template-columns:40px 1fr 60px 82px 82px 82px 82px 82px 36px;align-items:center;width:100%;padding:10px 20px;background:none;border:none;border-bottom:1px solid var(--border);cursor:pointer;text-align:left;transition:background .12s;font-family:'DM Sans',sans-serif;animation:rowFade .28s ease both;}
.emp-list-item:last-child{border-bottom:none;}
.emp-list-item:hover{background:rgba(212,160,23,.05);}
.emp-avatar-sm{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,rgba(212,160,23,.22),rgba(245,200,66,.18));color:var(--accent-2);border:1px solid rgba(212,160,23,.22);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;}
.emp-list-name{font-size:12.5px;font-weight:600;color:var(--text-1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.emp-cell{font-size:11.5px;font-weight:600;font-family:'DM Mono',monospace;}
.c-green{color:var(--green);}.c-amber{color:var(--amber);}.c-red{color:var(--red);}.c-teal{color:var(--teal);}.c-violet{color:var(--violet);}.c-muted{color:var(--text-3);}
.emp-list-arrow{color:var(--text-3);display:flex;justify-content:flex-end;width:11px;height:11px;opacity:.4;transition:opacity .15s,transform .15s;}
.emp-list-item:hover .emp-list-arrow{opacity:1;transform:translateX(3px);}
.emp-detail{display:flex;flex-direction:column;gap:14px;animation:fadeUp .3s ease both;}
.detail-header{display:flex;align-items:center;gap:14px;background:var(--bg-2);border-radius:var(--r);padding:12px 16px;border:1px solid var(--border);box-shadow:0 1px 4px rgba(0,0,0,.05);}
.detail-identity{display:flex;align-items:center;gap:11px;}
.emp-avatar-lg{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent-2));color:#fff;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:700;flex-shrink:0;box-shadow:0 4px 14px rgba(212,160,23,.32);}
.detail-name{display:block;font-size:15px;font-weight:700;color:var(--text-1);letter-spacing:-.3px;}
.detail-sub{font-size:11.5px;color:var(--text-3);}
.detail-actions{margin-left:auto;display:flex;align-items:center;gap:7px;}
.section-block{display:flex;flex-direction:column;gap:9px;}
.section-title{font-size:9.5px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.9px;}
.overlay{position:fixed;inset:0;background:rgba(20,18,14,.50);display:flex;align-items:center;justify-content:center;z-index:200;animation:fadeIn .18s ease;backdrop-filter:blur(8px);}
.emp-modal{background:var(--bg-2);border-radius:var(--rl);width:min(1100px,96vw);max-height:92vh;overflow:hidden;display:flex;flex-direction:column;border:1px solid var(--border-2);animation:modalUp .26s cubic-bezier(.34,1.3,.64,1) both;box-shadow:0 20px 60px rgba(0,0,0,.16);}
.emp-modal-head{display:flex;align-items:center;justify-content:space-between;padding:18px 22px 16px;border-bottom:1px solid var(--border);flex-shrink:0;background:linear-gradient(135deg,rgba(212,160,23,.07) 0%,var(--bg-3) 100%);}
.emp-identity{display:flex;align-items:center;gap:12px;}
.emp-avatar{width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent-2));color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;box-shadow:0 4px 14px rgba(212,160,23,.36);flex-shrink:0;}
.emp-name{font-size:17px;font-weight:700;color:var(--text-1);letter-spacing:-.4px;}
.emp-sub{font-size:11.5px;color:var(--text-3);margin-top:2px;}
.emp-head-actions{display:flex;align-items:center;gap:7px;}
.emp-modal-body{flex:1;overflow-y:auto;padding:20px 22px;display:flex;flex-direction:column;gap:20px;}
.form-modal{background:var(--bg-2);border-radius:var(--rl);width:min(620px,94vw);max-height:90vh;overflow-y:auto;border:1px solid var(--border-2);animation:modalUp .26s cubic-bezier(.34,1.3,.64,1) both;box-shadow:0 18px 52px rgba(0,0,0,.13);}
.modal-head{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid var(--border);background:linear-gradient(135deg,rgba(212,160,23,.07) 0%,var(--bg-3) 100%);border-radius:var(--rl) var(--rl) 0 0;}
.modal-title{font-size:14px;font-weight:700;color:var(--text-1);letter-spacing:-.3px;}
.modal-body{padding:20px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:13px;align-items:start;}
.modal-foot{padding:14px 20px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;background:var(--bg-3);border-radius:0 0 var(--rl) var(--rl);}
.section-divider{grid-column:1/-1;font-size:9.5px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:1px;padding-top:5px;padding-bottom:2px;border-top:1px solid var(--border);margin-top:4px;display:flex;align-items:center;gap:8px;}
.section-divider:first-of-type{border-top:none;margin-top:0;padding-top:0;}
.fg{display:flex;flex-direction:column;gap:5px;}
.fg-span{grid-column:1/-1;}
.fg-label{font-size:10px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.7px;}
.fg-input{width:100%;height:36px;padding:0 10px;border:1px solid var(--border-2);border-radius:var(--rs);font-size:12.5px;color:var(--text-1);background:var(--bg-3);outline:none;transition:all .18s;font-family:'DM Sans',sans-serif;}
.fg-input::placeholder{color:var(--text-3);}
.fg-input:focus{border-color:var(--accent);background:var(--bg-2);box-shadow:0 0 0 3px var(--accent-glow);}
.fg-input:read-only,.fg-input:disabled{background:var(--bg-3);color:var(--text-2);cursor:default;border-color:var(--border);opacity:.7;}
.fg-input:read-only:focus,.fg-input:disabled:focus{border-color:var(--border-2);box-shadow:none;}
.fg-textarea{height:72px;padding:9px 10px;resize:vertical;}
select.fg-input{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M4 6l4 4 4-4' stroke='%239e9585' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 9px center;background-size:13px;padding-right:28px;cursor:pointer;}
.native-field-wrap{position:relative;width:100%;}
.native-field-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);display:flex;align-items:center;color:var(--accent-2);pointer-events:none;z-index:1;}
.native-field-icon svg{width:13px;height:13px;}
.fg-input-icon{padding-left:32px!important;}
input[type="date"].fg-input,input[type="time"].fg-input{color-scheme:light;cursor:pointer;}
input[type="date"].fg-input:disabled,input[type="time"].fg-input:disabled{cursor:default;}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;min-height:280px;color:var(--text-3);}
.empty-icon{width:48px;height:48px;border:1px solid var(--border-2);border-radius:var(--r);display:flex;align-items:center;justify-content:center;background:var(--bg-3);}
.empty-icon svg{width:18px;height:18px;}
.empty p{font-size:12.5px;color:var(--text-2);}
.loading-dots{display:flex;gap:6px;align-items:center;}
.loading-dots span{width:7px;height:7px;border-radius:50%;background:var(--bg-4);animation:bounceDot 1.3s ease-in-out infinite;}
.loading-dots span:nth-child(2){animation-delay:.18s;}
.loading-dots span:nth-child(3){animation-delay:.36s;}
.loading-label{color:var(--text-3);font-size:12.5px;}
.toast-stack{position:fixed;bottom:18px;right:18px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;}
.toast{display:flex;align-items:center;gap:9px;padding:10px 12px 10px 11px;border-radius:var(--rs);font-size:12.5px;font-weight:500;min-width:230px;max-width:340px;border:1px solid transparent;box-shadow:0 4px 16px rgba(0,0,0,.11);animation:toastIn .26s cubic-bezier(.34,1.4,.64,1) both;pointer-events:all;backdrop-filter:blur(10px);}
.toast-success{background:rgba(26,153,88,.10);border-color:rgba(26,153,88,.22);color:var(--green);}
.toast-error{background:rgba(212,63,63,.10);border-color:rgba(212,63,63,.22);color:var(--red);}
.toast-info{background:rgba(212,160,23,.12);border-color:rgba(212,160,23,.28);color:var(--amber);}
.toast-icon{display:flex;align-items:center;flex-shrink:0;opacity:.9;width:14px;height:14px;}
.toast-msg{flex:1;line-height:1.4;color:var(--text-1);font-size:12px;}
.toast-close{background:none;border:none;cursor:pointer;color:var(--text-3);padding:2px;border-radius:4px;display:flex;align-items:center;flex-shrink:0;transition:color .15s;width:14px;height:14px;}
.toast-close:hover{color:var(--text-1);}
.toast-close svg{width:11px;height:11px;}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes fadeUp{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes slideDown{from{transform:translateY(-8px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes modalUp{from{transform:translateY(20px) scale(.97);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}
@keyframes toastIn{from{transform:translateX(26px) scale(.94);opacity:0}to{transform:translateX(0) scale(1);opacity:1}}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.28;transform:scale(.58)}}
@keyframes bounceDot{0%,80%,100%{transform:translateY(0);background:var(--bg-4)}40%{transform:translateY(-8px);background:var(--accent);}}
@keyframes cardPop{from{transform:translateY(7px) scale(.98);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}
@keyframes rowFade{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
@keyframes spinAnim{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.spin{display:inline-flex;animation:spinAnim .75s linear infinite;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:rgba(0,0,0,.13);border-radius:10px;}
::-webkit-scrollbar-thumb:hover{background:rgba(212,160,23,.38);}
@media(max-width:1200px){.summary-cols-9{grid-template-columns:repeat(5,1fr);}}
@media(max-width:900px){.sidebar{width:190px;min-width:190px;}.stats-bar{grid-template-columns:repeat(2,1fr);}.search-input{width:140px;}.summary-cols-9{grid-template-columns:repeat(3,1fr);}.summary-cols-5{grid-template-columns:repeat(3,1fr);}}
@media(max-width:640px){.app{flex-direction:column;height:auto;min-height:100vh;}.sidebar{width:100%;min-width:unset;height:auto;border-right:none;border-bottom:1px solid var(--border);}.file-nav{max-height:140px;}.stats-bar{grid-template-columns:repeat(2,1fr);padding:10px;}.topbar{padding:0 12px;gap:5px;flex-wrap:wrap;height:auto;min-height:50px;}.topbar-right{gap:4px;flex-wrap:wrap;}.search-input{width:110px;}.content{padding:12px;}.modal-body{grid-template-columns:1fr 1fr;}.toast-stack{bottom:12px;right:12px;left:12px;}.toast{min-width:unset;max-width:100%;}.summary-cols-9,.summary-cols-5{grid-template-columns:repeat(3,1fr);}.emp-modal{width:100vw;max-height:100vh;border-radius:0;}}
`;

/* ─── Constants ─── */
const EMPTY_FORM={name:'',date:'',timeIn:'',timeOut:'',overtime:'',lateUndertime:'',remarks:'',employeeType:'',paidHoliday:'',lastCutoffAdjust:'',lwop:'',rgot:'',rdot:'',lwp:''};
const DEPT_OPTIONS=[{value:'',label:'— Department —'},{value:'warehouse',label:'Warehouse'},{value:'office',label:'Office / Sales'},{value:'manager',label:'Manager'}];
const KEY_MAP={days:null,ot:'overtime',late:'lateUndertime',lwop:'lwop',lwp:'lwp',rgot:'rgot',rdot:'rdot',holiday:'paidHoliday',cutoff:'lastCutoffAdjust'};

/* ─── Helpers ─── */
const parseNum=v=>{const n=parseFloat(String(v||'').replace(/[^0-9.-]/g,''));return isNaN(n)?0:n;};
const safeId=s=>(s||'').replace(/[^a-zA-Z0-9_-]/g,'_');
const fmtTime=s=>{if(!s)return'—';const m=s.match(/(\d+):(\d+):\d+\s*(AM|PM)/i);return m?`${m[1]}:${m[2]} ${m[3].toUpperCase()}`:s;};
const getDayOfWeek=d=>{if(!d)return'—';return['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date(d).getDay()];};
const getDayClass=d=>`day-${d.toLowerCase()}`;
const toTimeInput=s=>{if(!s)return'';const m=s.match(/(\d+):(\d+):\d+\s*(AM|PM)/i);if(!m)return'';let h=+m[1];if(m[3].toUpperCase()==='PM'&&h!==12)h+=12;if(m[3].toUpperCase()==='AM'&&h===12)h=0;return`${String(h).padStart(2,'0')}:${m[2]}`;};
const fromTimeInput=v=>{if(!v)return'';const[h,min]=v.split(':');let hr=+h;const p=hr>=12?'PM':'AM';let d=hr%12||12;return`${d}:${String(+min).padStart(2,'0')}:00 ${p}`;};

/* ─── Toast Hook ─── */
let _tid=0;
function useToasts(){
  const[toasts,setToasts]=useState([]);
  const push=useCallback((msg,type='info')=>{const id=++_tid;setToasts(p=>[...p,{id,msg,type}]);setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3500);},[]);
  const dismiss=useCallback(id=>setToasts(p=>p.filter(t=>t.id!==id)),[]);
  return{toasts,push,dismiss};
}

/* ─── Excel Export ─── */
function exportXLSX(rows,filename,sheet='Sheet1'){const ws=XLSX.utils.json_to_sheet(rows);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,sheet);XLSX.writeFile(wb,filename);}
const toAllRows=recs=>recs.map((r,i)=>({'#':i+1,Name:r.name||'',Date:r.date||'',Day:getDayOfWeek(r.date),'Time In':r.timeIn||'','Time Out':r.timeOut||'',Department:r.employeeType||'','OT(mins)':r.overtime||'','Late/UT(hrs)':r.lateUndertime||'','LWOP(days)':r.lwop||'','LWP(days)':r.lwp||'','RGOT(hrs)':r.rgot||'','RDOT(hrs)':r.rdot||'','Paid Holiday':r.paidHoliday||'','Cutoff Adj.':r.lastCutoffAdjust||'',Remarks:r.remarks||''}));
const toSummaryRows=(names,recs)=>names.map(n=>{const r=recs.filter(x=>x.name===n);const s=k=>+r.reduce((a,x)=>a+parseNum(x[k]),0).toFixed(2);return{Name:n,Days:r.length,'OT(mins)':s('overtime'),'Late/UT(hrs)':s('lateUndertime'),LWOP:s('lwop'),LWP:s('lwp'),RGOT:s('rgot'),RDOT:s('rdot'),PaidHoliday:s('paidHoliday'),CutoffAdj:s('lastCutoffAdjust')};});

/* ─── Icons ─── */
const I={
  File:    ()=><svg viewBox="0 0 16 16" fill="none"><rect x="3" y="1.5" width="10" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  Upload:  ()=><svg viewBox="0 0 16 16" fill="none"><path d="M8 10V3M5 6l3-3 3 3M3 13h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Plus:    ()=><svg viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  Trash:   ()=><svg viewBox="0 0 16 16" fill="none"><path d="M2.5 4h11M6 4V2.5h4V4M5 4l.75 9.5h4.5L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Eye:     ()=><svg viewBox="0 0 16 16" fill="none"><path d="M1.5 8C2.5 5 5 3 8 3s5.5 2 6.5 5c-1 3-3.5 5-6.5 5S2.5 11 1.5 8z" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.3"/></svg>,
  Edit:    ()=><svg viewBox="0 0 16 16" fill="none"><path d="M11 2.5l2.5 2.5L5 13.5H2.5V11L11 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  X:       ()=><svg viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  Search:  ()=><svg viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4"/><path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Chevron: ()=><svg viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Refresh: ()=><svg viewBox="0 0 16 16" fill="none"><path d="M13.5 8A5.5 5.5 0 1 1 8 2.5c1.8 0 3.4.87 4.4 2.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M11 2v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Check:   ()=><svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 8l2.2 2.2L11 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Alert:   ()=><svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Info:    ()=><svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 7v4M8 5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Users:   ()=><svg viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1.5 13.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M14.5 13.5c0-2-1.5-3-3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  List:    ()=><svg viewBox="0 0 16 16" fill="none"><path d="M3 4h10M3 8h10M3 12h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Back:    ()=><svg viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Clock:   ()=><svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  Cal:     ()=><svg viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 2v2M11 2v2M2 7h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  Trend:   ()=><svg viewBox="0 0 16 16" fill="none"><path d="M2 11l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M11 4h3v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Download:()=><svg viewBox="0 0 16 16" fill="none"><path d="M8 3v7M5 8l3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Table:   ()=><svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2 6h12M6 6v8" stroke="currentColor" strokeWidth="1.3"/></svg>,
};

const STAT_CARDS=[
  {key:'days',   label:'Days',       unit:'',    color:'blue',  icon:<I.Cal/>},
  {key:'ot',     label:'Overtime',   unit:'mins',color:'green', icon:<I.Trend/>},
  {key:'late',   label:'Late / UT',  unit:'mins',color:'amber', icon:<I.Clock/>},
  {key:'lwop',   label:'LWOP',       unit:'days',color:'red',   icon:<I.Clock/>},
  {key:'lwp',    label:'LWP',        unit:'days',color:'slate', icon:<I.Cal/>},
  {key:'rgot',   label:'RGOT',       unit:'hrs', color:'teal',  icon:<I.Trend/>},
  {key:'rdot',   label:'RDOT',       unit:'hrs', color:'violet',icon:<I.Trend/>},
  {key:'holiday',label:'Paid Hol.',  unit:'days',color:'sky',   icon:<I.Cal/>},
  {key:'cutoff', label:'Cutoff Adj.',unit:'hrs', color:'orange',icon:<I.Clock/>},
];

/* ─── Native Date Field ─── */
function DateField({label,value,readOnly,onChange}){
  return(
    <div className="fg">
      <label className="fg-label">{label}</label>
      <div className="native-field-wrap">
        <span className="native-field-icon"><I.Cal/></span>
        <input type="date" className="fg-input fg-input-icon" value={value||''} disabled={readOnly} onChange={e=>onChange(e.target.value)}/>
      </div>
    </div>
  );
}

/* ─── Native Time Field ─── */
function TimeField({label,value,readOnly,onChange}){
  return(
    <div className="fg">
      <label className="fg-label">{label}</label>
      <div className="native-field-wrap">
        <span className="native-field-icon"><I.Clock/></span>
        <input type="time" className="fg-input fg-input-icon" value={toTimeInput(value)} disabled={readOnly} onChange={e=>onChange(fromTimeInput(e.target.value))}/>
      </div>
    </div>
  );
}

/* ─── Small Components ─── */
function Toasts({toasts,dismiss}){
  return(
    <div className="toast-stack">
      {toasts.map(t=>(
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">{t.type==='success'?<I.Check/>:t.type==='error'?<I.Alert/>:<I.Info/>}</span>
          <span className="toast-msg">{t.msg}</span>
          <button className="toast-close" onClick={()=>dismiss(t.id)}><I.X/></button>
        </div>
      ))}
    </div>
  );
}
function Btn({label,icon,onClick,variant='ghost',disabled,full,title}){
  return(
    <button className={`btn btn-${variant}${full?' btn-full':''}`} onClick={onClick} disabled={disabled} title={title}>
      {icon&&<span className="btn-icon">{icon}</span>}{label}
    </button>
  );
}
function IconBtn({icon,onClick,title,danger}){
  return <button className={`icon-btn${danger?' icon-btn-danger':''}`} onClick={onClick} title={title}>{icon}</button>;
}
function Badge({val,scheme}){
  if(!val)return<span className="muted">—</span>;
  return<span className={`badge badge-${scheme}`}>{val}</span>;
}
function Empty({msg}){
  return(
    <div className="empty">
      <div className="empty-icon"><I.File/></div>
      <p>{msg}</p>
    </div>
  );
}
function LoadingDots(){
  return(
    <div className="empty">
      <div className="loading-dots"><span/><span/><span/></div>
      <p className="loading-label">Loading data…</p>
    </div>
  );
}

function SummaryCards({records,cols=9}){
  const totals=useMemo(()=>({
    days:records.length,
    ot:+records.reduce((s,r)=>s+parseNum(r.overtime),0).toFixed(2),
    late:+records.reduce((s,r)=>s+parseNum(r.lateUndertime),0).toFixed(2),
    lwop:+records.reduce((s,r)=>s+parseNum(r.lwop),0).toFixed(2),
    lwp:+records.reduce((s,r)=>s+parseNum(r.lwp),0).toFixed(2),
    rgot:+records.reduce((s,r)=>s+parseNum(r.rgot),0).toFixed(2),
    rdot:+records.reduce((s,r)=>s+parseNum(r.rdot),0).toFixed(2),
    holiday:+records.reduce((s,r)=>s+parseNum(r.paidHoliday),0).toFixed(2),
    cutoff:+records.reduce((s,r)=>s+parseNum(r.lastCutoffAdjust),0).toFixed(2),
  }),[records]);
  return(
    <div className={`summary-grid summary-cols-${cols}`}>
      {STAT_CARDS.map((c,i)=>(
        <div key={c.key} className={`summary-card card-${c.color}`} style={{animationDelay:`${i*38}ms`}}>
          <span className="card-icon">{c.icon}</span>
          <span className="card-value">{totals[c.key]}{c.unit&&<span className="card-unit">{c.unit}</span>}</span>
          <span className="card-label">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

function RecordTable({records,refreshing,showName,showAll,onView,onEdit,onDelete,onNameClick}){
  return(
    <div className={`table-wrap${refreshing?' table-refreshing':''}`}>
      <table className="rec-table">
        <thead>
          <tr>
            <th className="col-num">#</th>
            {showName&&<th>Name</th>}
            <th>Date</th><th>Day</th><th>Time In</th><th>Time Out</th>
            <th>OT</th><th>Late/UT</th>
            {showAll&&<><th>LWOP</th><th>LWP</th><th>RGOT</th><th>RDOT</th><th>P.Hol</th><th>Cutoff</th></>}
            <th>Remarks</th><th className="col-actions"/>
          </tr>
        </thead>
        <tbody>
          {records.map((r,i)=>{
            const day=getDayOfWeek(r.date);
            return(
              <tr key={r.id} className="rec-row" style={{animationDelay:`${Math.min(i*15,260)}ms`}}>
                <td className="td-num">{i+1}</td>
                {showName&&(
                  <td className="td-name">
                    {onNameClick?<button className="name-link" onClick={()=>onNameClick(r.name)}>{r.name||'—'}</button>:<span className="fw-medium">{r.name||'—'}</span>}
                  </td>
                )}
                <td className={!showName?'td-name':''}>{r.date||'—'}</td>
                <td className={`td-day ${getDayClass(day)}`}>{day}</td>
                <td>{fmtTime(r.timeIn)}</td>
                <td>{fmtTime(r.timeOut)}</td>
                <td><Badge val={r.overtime} scheme="green"/></td>
                <td><Badge val={r.lateUndertime} scheme="amber"/></td>
                {showAll&&<>
                  <td><Badge val={r.lwop} scheme="red"/></td>
                  <td><Badge val={r.lwp} scheme="slate"/></td>
                  <td><Badge val={r.rgot} scheme="teal"/></td>
                  <td><Badge val={r.rdot} scheme="violet"/></td>
                  <td><Badge val={r.paidHoliday} scheme="sky"/></td>
                  <td><Badge val={r.lastCutoffAdjust} scheme="orange"/></td>
                </>}
                <td className="muted td-remarks">{r.remarks||'—'}</td>
                <td><div className="row-actions">
                  <IconBtn icon={<I.Eye/>} onClick={()=>onView(r)} title="View"/>
                  <IconBtn icon={<I.Edit/>} onClick={()=>onEdit(r)} title="Edit"/>
                  <IconBtn icon={<I.Trash/>} onClick={()=>onDelete(r)} title="Delete" danger/>
                </div></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FileItem({file,active,onSelect,onDelete}){
  const[hov,setHov]=useState(false);
  return(
    <div className={`file-item${active?' active':''}`} onClick={onSelect} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <span className="file-icon"><I.File/></span>
      <span className="file-label">{file.fileName}</span>
      <span className="file-count">{file.totalRecords}</span>
      <button className="file-del" style={{opacity:hov?1:0}} onClick={onDelete} title="Delete file"><I.X/></button>
    </div>
  );
}

function EmpModal({employee,records,refreshing,fileName,onClose,onView,onEdit,onDelete,onAdd,push}){
  const name=safeId(employee);
  const exportRecs=()=>{exportXLSX(toAllRows(records),`${name}_attendance.xlsx`,employee.slice(0,31));push(`Exported ${records.length} records.`,'success');};
  const exportSum=()=>{const rows=STAT_CARDS.map(c=>{const field=KEY_MAP[c.key];const value=c.key==='days'?records.length:+records.reduce((s,r)=>s+parseNum(r[field]),0).toFixed(2);return{Metric:c.label,Value:value};});exportXLSX(rows,`${name}_summary.xlsx`,'Summary');push('Exported summary.','success');};
  return(
    <div className="overlay" onClick={onClose}>
      <div className="emp-modal" onClick={e=>e.stopPropagation()}>
        <div className="emp-modal-head">
          <div className="emp-identity">
            <div className="emp-avatar">{employee.charAt(0).toUpperCase()}</div>
            <div>
              <div className="emp-name">{employee}</div>
              <div className="emp-sub">{records.length} record{records.length!==1?'s':''} · {fileName}</div>
            </div>
          </div>
          <div className="emp-head-actions">
            <Btn icon={<I.Table/>} label="Summary" variant="export" onClick={exportSum}/>
            <Btn icon={<I.Download/>} label="Records" variant="export" onClick={exportRecs}/>
            <Btn icon={<I.Plus/>} label="Add Record" variant="primary" onClick={onAdd}/>
            <IconBtn icon={<I.X/>} onClick={onClose} title="Close"/>
          </div>
        </div>
        <div className="emp-modal-body">
          <SummaryCards records={records} cols={5}/>
          <div className="section-block">
            <div className="section-title">Attendance Records</div>
            {records.length===0?<Empty msg="No records for this employee."/>:<RecordTable records={records} refreshing={refreshing} showName={false} showAll onView={onView} onEdit={onEdit} onDelete={onDelete}/>}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormModal({mode,formData,onChange,onSave,onClose}){
  const isView=mode==='view';
  const set=(k,v)=>onChange({...formData,[k]:v});
  const inp=(k,ph='')=>(<input type="text" className="fg-input" value={formData[k]} readOnly={isView} placeholder={ph} onChange={e=>set(k,e.target.value)}/>);
  return(
    <div className="overlay" onClick={onClose}>
      <div className="form-modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <h2 className="modal-title">{mode==='add'?'✦ Add Record':mode==='edit'?'✎ Edit Record':'👁️ Record Details'}</h2>
          <IconBtn icon={<I.X/>} onClick={onClose} title="Close"/>
        </div>
        <div className="modal-body">
          <div className="section-divider">Identity</div>
          <div className="fg fg-span">
            <label className="fg-label">Full Name</label>
            <input className="fg-input" type="text" value={formData.name} readOnly={isView} placeholder="Employee name" onChange={e=>set('name',e.target.value)}/>
          </div>
          <DateField label="Date" value={formData.date} readOnly={isView} onChange={v=>set('date',v)}/>
          <div className="fg">
            <label className="fg-label">Department</label>
            <select className="fg-input" value={formData.employeeType} disabled={isView} onChange={e=>set('employeeType',e.target.value)}>
              {DEPT_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="section-divider">Time</div>
          <TimeField label="Time In" value={formData.timeIn} readOnly={isView} onChange={v=>set('timeIn',v)}/>
          <TimeField label="Time Out" value={formData.timeOut} readOnly={isView} onChange={v=>set('timeOut',v)}/>
          <div className="fg"><label className="fg-label">Overtime (OT)</label>{inp('overtime','0.00')}</div>
          <div className="fg"><label className="fg-label">Late / Undertime</label>{inp('lateUndertime','0.00')}</div>
          <div className="fg"/>
          <div className="section-divider">Deductions &amp; Adjustments</div>
          <div className="fg"><label className="fg-label">LWOP</label>{inp('lwop','0')}</div>
          <div className="fg"><label className="fg-label">LWP</label>{inp('lwp','0')}</div>
          <div className="fg"><label className="fg-label">RGOT</label>{inp('rgot','0')}</div>
          <div className="fg"><label className="fg-label">RDOT</label>{inp('rdot','0')}</div>
          <div className="fg"><label className="fg-label">Paid Holiday</label>{inp('paidHoliday','0')}</div>
          <div className="fg"><label className="fg-label">Cutoff Adj.</label>{inp('lastCutoffAdjust','0')}</div>
          <div className="section-divider">Notes</div>
          <div className="fg fg-span">
            <label className="fg-label">Remarks</label>
            <textarea className="fg-input fg-textarea" value={formData.remarks} readOnly={isView} rows={3} placeholder="Optional notes…" onChange={e=>set('remarks',e.target.value)}/>
          </div>
        </div>
        <div className="modal-foot">
          <Btn label="Cancel" variant="ghost" onClick={onClose}/>
          {!isView&&<Btn label="Save Record" variant="primary" onClick={onSave}/>}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════ MAIN DASHBOARD ══════════════════════════════════════ */
export default function AttendanceDashboard(){
  const[fileInput,setFileInput]=useState(null);
  const[loading,setLoading]=useState(false);
  const[refreshing,setRefreshing]=useState(false);
  const[files,setFiles]=useState([]);
  const[activeTab,setActiveTab]=useState(null);
  const[attendance,setAttendance]=useState([]);
  const[fileName,setFileName]=useState('');
  const[totalRecords,setTotalRecords]=useState(0);
  const[search,setSearch]=useState('');
  const[dept,setDept]=useState('all');
  const[modal,setModal]=useState(null);
  const[formData,setFormData]=useState(EMPTY_FORM);
  const[viewMode,setViewMode]=useState('all');
  const[empSearch,setEmpSearch]=useState('');
  const[selEmp,setSelEmp]=useState(null);
  const[empModal,setEmpModal]=useState(null);
  const{toasts,push,dismiss}=useToasts();
  const tabRef=useRef(null);

  useEffect(()=>{loadFiles();},[]);

  const loadFiles=async()=>{
    try{
      const{files:f}=await getAllFiles();
      setFiles(f);
      if(f.length>0&&!tabRef.current){tabRef.current=f[0].fileName;setActiveTab(f[0].fileName);await loadAtt(f[0].fileName);}
      else if(!f.length){tabRef.current=null;setActiveTab(null);setAttendance([]);}
    }catch(e){console.error(e);}
  };

  const loadAtt=useCallback(async(file,silent=false)=>{
    if(!file)return;
    if(!silent)setRefreshing(true);
    try{
      const d=await getAttendanceByFile(file);
      if(tabRef.current!==file)return;
      setAttendance(d.attendance);setFileName(d.fileName);setTotalRecords(d.totalRecords);
    }catch{push('Failed to load attendance.','error');}
    finally{if(tabRef.current===file)setRefreshing(false);}
  },[push]);

  const switchTab=useCallback(async name=>{
    tabRef.current=name;setActiveTab(name);setAttendance([]);setSearch('');setDept('all');setSelEmp(null);setEmpSearch('');setEmpModal(null);await loadAtt(name);
  },[loadAtt]);

  const handleRefresh=useCallback(async()=>{
    if(!activeTab||refreshing)return;
    await loadAtt(activeTab);push('Data refreshed.','success');
  },[activeTab,refreshing,loadAtt,push]);

  useEffect(()=>{
    if(!activeTab)return;
    const id=setInterval(()=>loadAtt(activeTab,true),60000);
    return()=>clearInterval(id);
  },[activeTab,loadAtt]);

  const handleUpload=async()=>{
    if(!fileInput)return push('Select a file first.','error');
    setLoading(true);
    try{
      const d=await uploadFile(fileInput);
      await loadFiles();tabRef.current=d.fileName;setActiveTab(d.fileName);await loadAtt(d.fileName);
      push(`"${d.fileName}" uploaded successfully.`,'success');
    }catch(e){push('Upload failed: '+(e.response?.data?.error||e.message),'error');}
    finally{setLoading(false);setFileInput(null);}
  };

  const handleDeleteFile=async(name,e)=>{
    e.stopPropagation();
    if(!window.confirm(`Delete "${name}"?`))return;
    try{
      await deleteFile(name);await loadFiles();
      if(tabRef.current===name){tabRef.current=null;setActiveTab(null);setAttendance([]);setFileName('');setTotalRecords(0);setSelEmp(null);setEmpModal(null);}
      push(`"${name}" deleted.`,'info');
    }catch{push('Error deleting file.','error');}
  };

  const handleDeleteAll=async()=>{
    if(!window.confirm('Delete ALL files? This cannot be undone.'))return;
    try{
      await deleteAllFiles();tabRef.current=null;setActiveTab(null);setAttendance([]);setFileName('');setTotalRecords(0);setSelEmp(null);setEmpModal(null);await loadFiles();push('All files deleted.','info');
    }catch{push('Error.','error');}
  };

  const openModal=(mode,record=null)=>{
    setModal({mode,record});
    setFormData(record
      ?{name:record.name||'',date:record.date||'',timeIn:record.timeIn||'',timeOut:record.timeOut||'',overtime:record.overtime||'',lateUndertime:record.lateUndertime||'',remarks:record.remarks||'',employeeType:record.employeeType||'',paidHoliday:record.paidHoliday||'',lastCutoffAdjust:record.lastCutoffAdjust||'',lwop:record.lwop||'',rgot:record.rgot||'',rdot:record.rdot||'',lwp:record.lwp||''}
      :{...EMPTY_FORM,date:new Date().toISOString().split('T')[0],name:empModal||selEmp||''});
  };

  const handleSave=async()=>{
    if(!formData.name||!formData.date)return push('Name and Date required.','error');
    try{
      if(modal.mode==='add'){await createRecord(activeTab,formData);push('Record added.','success');}
      else{await updateRecord(activeTab,modal.record.id,formData);push('Record updated.','success');}
      await loadAtt(activeTab);setModal(null);
    }catch{push('Error saving.','error');}
  };

  const handleDeleteRec=async record=>{
    if(!window.confirm(`Delete record for ${record.name}?`))return;
    try{await deleteRecord(activeTab,record.id);await loadAtt(activeTab);push('Record deleted.','info');}
    catch{push('Error deleting.','error');}
  };

  const uniqueEmps=useMemo(()=>[...new Set(attendance.map(a=>a.name).filter(Boolean))].sort(),[attendance]);
  const filteredEmps=useMemo(()=>empSearch.trim()?uniqueEmps.filter(n=>n.toLowerCase().includes(empSearch.toLowerCase())):uniqueEmps,[uniqueEmps,empSearch]);
  const empRecs=useMemo(()=>selEmp?attendance.filter(r=>r.name===selEmp).sort((a,b)=>(a.date||'').localeCompare(b.date||'')):[],[attendance,selEmp]);
  const empModalRecs=useMemo(()=>empModal?attendance.filter(r=>r.name===empModal).sort((a,b)=>(a.date||'').localeCompare(b.date||'')):[],[attendance,empModal]);
  const filteredAll=useMemo(()=>attendance.filter(r=>(!search||r.name?.toLowerCase().includes(search.toLowerCase()))&&(dept==='all'||r.employeeType===dept)),[attendance,search,dept]);

  const exportAll=()=>{if(!filteredAll.length)return push('Nothing to export.','error');exportXLSX(toAllRows(filteredAll),`${safeId(fileName||'att')}_all.xlsx`,'All Records');push(`Exported ${filteredAll.length} records.`,'success');};
  const exportSumAll=()=>{if(!uniqueEmps.length)return push('No data.','error');exportXLSX(toSummaryRows(uniqueEmps,attendance),`${safeId(fileName||'att')}_summary.xlsx`,'Summary');push('Summary exported.','success');};
  const exportEmp=()=>{if(!empRecs.length)return push('Nothing.','error');exportXLSX(toAllRows(empRecs),`${safeId(selEmp||'emp')}_att.xlsx`,selEmp?.slice(0,31)||'Recs');push(`Exported ${empRecs.length} records.`,'success');};

  return(
    <>
      <style>{css}</style>
      <div className="app">
        <Toasts toasts={toasts} dismiss={dismiss}/>
        <aside className="sidebar">
          <div className="logo-block">
            <div className="logo-wrap">
              <img src={deltaplusLogo} alt="Delta Plus" className="logo-img"/>
              <div>
                <span className="logo-text">Attendance</span>
                <span className="logo-sub">Biometrics Manager</span>
              </div>
            </div>
          </div>
          <nav className="file-nav">
            <span className="nav-label">Files</span>
            {files.length===0&&<span className="no-files">No files yet</span>}
            {files.map(f=>(
              <FileItem key={f.fileName} file={f} active={activeTab===f.fileName}
                onSelect={()=>switchTab(f.fileName)} onDelete={e=>handleDeleteFile(f.fileName,e)}/>
            ))}
          </nav>
          <div className="sidebar-footer">
            <label className="upload-label">
              <span className="upload-icon"><I.Upload/></span>
              <span className="upload-text">{fileInput?fileInput.name:'Upload .xls / .xlsx'}</span>
              <input type="file" accept=".xls,.xlsx" onChange={e=>setFileInput(e.target.files[0])} hidden/>
            </label>
            {fileInput&&<Btn label={loading?'Processing…':'Upload & Process'} variant="primary" onClick={handleUpload} disabled={loading} full icon={loading?<span className="spin"><I.Refresh/></span>:<I.Upload/>}/>}
            {files.length>0&&<Btn icon={<I.Trash/>} label="Delete all files" variant="danger" onClick={handleDeleteAll} full/>}
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <div className="breadcrumb">
              <span className="bc-root">Attendance</span>
              {activeTab&&<><span className="bc-sep"><I.Chevron/></span><span className="bc-current">{fileName}</span>{refreshing&&<span className="refresh-dot"/>}</>}
              {viewMode==='employee'&&selEmp&&<><span className="bc-sep"><I.Chevron/></span><span className="bc-current bc-emp">{selEmp}</span></>}
            </div>
            <div className="topbar-right">
              {activeTab&&(
                <div className="view-toggle">
                  {[{id:'all',icon:<I.List/>,label:'All Records'},{id:'employee',icon:<I.Users/>,label:'By Employee'}].map(v=>(
                    <button key={v.id} className={`vtoggle-btn${viewMode===v.id?' active':''}`}
                      onClick={()=>{setViewMode(v.id);if(v.id==='all'){setSelEmp(null);setEmpSearch('');}}}>
                      <span className="vtoggle-icon">{v.icon}</span>{v.label}
                    </button>
                  ))}
                </div>
              )}
              {viewMode==='all'&&attendance.length>0&&<>
                <div className="search-wrap">
                  <span className="search-icon"><I.Search/></span>
                  <input className="search-input" type="text" placeholder="Search by name…" value={search} onChange={e=>setSearch(e.target.value)}/>
                </div>
                <select className="dept-select" value={dept} onChange={e=>setDept(e.target.value)}>
                  <option value="all">All departments</option>
                  {DEPT_OPTIONS.slice(1).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <Btn icon={<I.Table/>} label="Summary" variant="export" onClick={exportSumAll}/>
                <Btn icon={<I.Download/>} label="Export" variant="export" onClick={exportAll}/>
              </>}
              {viewMode==='employee'&&selEmp&&<Btn icon={<I.Download/>} label="Export" variant="export" onClick={exportEmp}/>}
              {activeTab&&<>
                <Btn icon={<span className={refreshing?'spin':''}><I.Refresh/></span>} label={refreshing?'Refreshing…':'Refresh'} variant="ghost" onClick={handleRefresh} disabled={refreshing}/>
                {(viewMode==='all'||(viewMode==='employee'&&selEmp))&&<Btn icon={<I.Plus/>} label="Add Record" variant="primary" onClick={()=>openModal('add')}/>}
              </>}
            </div>
          </header>

          {activeTab&&viewMode==='all'&&(
            <div className="stats-bar">
              {[
                {label:'Total Records',   value:totalRecords,                                color:'blue'},
                {label:'Employees',       value:uniqueEmps.length,                           color:''},
                {label:'With Overtime',   value:attendance.filter(r=>r.overtime).length,     color:'green'},
                {label:'Late / Undertime',value:attendance.filter(r=>r.lateUndertime).length,color:'amber'},
              ].map((s,i)=>(
                <div key={s.label} className="stat-card" style={{animationDelay:`${i*65}ms`}}>
                  <span className="stat-label">{s.label}</span>
                  <span className={`stat-value${s.color?` stat-${s.color}`:''}`}>{s.value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="content">
            {!activeTab&&(
              <div className="empty" style={{minHeight:'60vh'}}>
                <div className="empty-icon" style={{width:56,height:56}}><I.File/></div>
                <p style={{fontSize:14,fontWeight:600,color:'var(--text-1)'}}>No file selected</p>
                <p>Upload a biometrics file or select one from the sidebar.</p>
              </div>
            )}
            {activeTab&&viewMode==='all'&&(
              refreshing&&!attendance.length?<LoadingDots/>
              :!filteredAll.length?<Empty msg="No attendance records found."/>
              :<RecordTable records={filteredAll} refreshing={refreshing} showName showAll={false}
                  onView={r=>openModal('view',r)} onEdit={r=>openModal('edit',r)} onDelete={handleDeleteRec}
                  onNameClick={name=>{setViewMode('employee');setSelEmp(name);setEmpSearch(name);}}/>
            )}
            {activeTab&&viewMode==='employee'&&(
              !selEmp?(
                <div className="emp-picker">
                  <div className="picker-header">
                    <div>
                      <h3 className="picker-title"><span className="picker-icon"><I.Users/></span>Employees</h3>
                      <p className="picker-sub">{uniqueEmps.length} employees · {attendance.length} total records</p>
                    </div>
                  </div>
                  <div className="picker-search-wrap">
                    <span className="picker-search-icon"><I.Search/></span>
                    <input className="picker-search" type="text" placeholder="Search employee…" value={empSearch} onChange={e=>setEmpSearch(e.target.value)} autoFocus/>
                  </div>
                  <div className="emp-list-header">
                    <span/><span>Name</span><span className="col-center">Days</span>
                    <span className="col-right">OT</span><span className="col-right">Late</span>
                    <span className="col-right">LWOP</span><span className="col-right">RGOT</span>
                    <span className="col-right">RDOT</span><span/>
                  </div>
                  <div className="emp-list">
                    {filteredEmps.length===0&&<div className="emp-list-empty">No results for "{empSearch}"</div>}
                    {filteredEmps.map((name,idx)=>{
                      const r=attendance.filter(x=>x.name===name);
                      const g=k=>+r.reduce((s,x)=>s+parseNum(x[k]),0).toFixed(2);
                      const ot=g('overtime'),late=g('lateUndertime'),lwop=g('lwop'),rgot=g('rgot'),rdot=g('rdot');
                      return(
                        <button key={name} className="emp-list-item" style={{animationDelay:`${idx*12}ms`}} onClick={()=>setEmpModal(name)}>
                          <span className="emp-avatar-sm">{name.charAt(0).toUpperCase()}</span>
                          <span className="emp-list-name">{name}</span>
                          <span className="emp-cell col-center c-muted">{r.length}</span>
                          <span className={`emp-cell col-right ${ot>0?'c-green':'c-muted'}`}>{ot>0?ot.toFixed(2):'—'}</span>
                          <span className={`emp-cell col-right ${late>0?'c-amber':'c-muted'}`}>{late>0?late.toFixed(2):'—'}</span>
                          <span className={`emp-cell col-right ${lwop>0?'c-red':'c-muted'}`}>{lwop>0?lwop.toFixed(2):'—'}</span>
                          <span className={`emp-cell col-right ${rgot>0?'c-teal':'c-muted'}`}>{rgot>0?rgot.toFixed(2):'—'}</span>
                          <span className={`emp-cell col-right ${rdot>0?'c-violet':'c-muted'}`}>{rdot>0?rdot.toFixed(2):'—'}</span>
                          <span className="emp-list-arrow"><I.Chevron/></span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ):(
                <div className="emp-detail">
                  <div className="detail-header">
                    <Btn icon={<I.Back/>} label="Back" variant="ghost" onClick={()=>{setSelEmp(null);setEmpSearch('');}}/>
                    <div className="detail-identity">
                      <div className="emp-avatar-lg">{selEmp.charAt(0).toUpperCase()}</div>
                      <div>
                        <span className="detail-name">{selEmp}</span>
                        <span className="detail-sub">{empRecs.length} record{empRecs.length!==1?'s':''}</span>
                      </div>
                    </div>
                    <div className="detail-actions">
                      <Btn icon={<I.Download/>} label="Export Excel" variant="export" onClick={exportEmp}/>
                      <Btn icon={<I.Plus/>} label="Add Record" variant="primary" onClick={()=>openModal('add')}/>
                    </div>
                  </div>
                  <SummaryCards records={empRecs}/>
                  {empRecs.length===0?<Empty msg="No records for this employee."/>
                    :<RecordTable records={empRecs} refreshing={refreshing} showName={false} showAll
                        onView={r=>openModal('view',r)} onEdit={r=>openModal('edit',r)} onDelete={handleDeleteRec}/>}
                </div>
              )
            )}
          </div>
        </main>

        {empModal&&(
          <EmpModal employee={empModal} records={empModalRecs} refreshing={refreshing} fileName={fileName}
            onClose={()=>setEmpModal(null)} onView={r=>openModal('view',r)} onEdit={r=>openModal('edit',r)}
            onDelete={handleDeleteRec} onAdd={()=>openModal('add')} push={push}/>
        )}
        {modal&&(
          <FormModal mode={modal.mode} formData={formData} onChange={setFormData}
            onSave={handleSave} onClose={()=>setModal(null)}/>
        )}
      </div>
    </>
  );
}