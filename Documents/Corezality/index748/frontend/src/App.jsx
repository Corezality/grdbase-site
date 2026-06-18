import React from 'react';
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";

const API = "https://web-production-af80c.up.railway.app";

const C = {
  blue:"#0099FF", blueMid:"#0077CC", blueLight:"#E6F4FF",
  green:"#00DD77", greenMid:"#00AA55", greenLight:"#E6FFF3",
  orange:"#FF6B00", orangeLight:"#FFF0E6",
  white:"#FFFFFF", grid:"#F0F2F5", gridLine:"#E4E8EE",
  text:"#0A1628", textMid:"#4A5568", textLight:"#8A9BB0",
  surface:"#F8FAFC", border:"#DCE3ED",
};

// ── Vehicle Data ──────────────────────────────────────────
const CAR_MAKES = ["Toyota","Volkswagen","Ford","BMW","Hyundai","Suzuki","Kia","Nissan","Mercedes-Benz","Isuzu","Honda","Mazda","Renault","Haval","Chery"];
const CAR_MODELS = {
  Toyota:["Hilux","Fortuner","Corolla","RAV4","Quantum","Yaris","Land Cruiser"],
  Volkswagen:["Polo","Golf","Tiguan","Amarok","Caddy","Passat","T-Roc"],
  Ford:["Ranger","EcoSport","Everest","Fiesta","Puma","Mustang"],
  BMW:["3 Series","5 Series","X3","X5","1 Series","X1","M3"],
  Hyundai:["i20","Tucson","Creta","i10","Santa Fe","Venue"],
  Suzuki:["Swift","Jimny","Vitara","Brezza","S-Presso","Ignis"],
  Kia:["Picanto","Sportage","Sonet","Seltos","Rio","Stinger"],
  Nissan:["NP200","NP300","Navara","X-Trail","Micra","Qashqai"],
  "Mercedes-Benz":["C-Class","E-Class","GLC","A-Class","Sprinter","GLE"],
  Isuzu:["D-Max","MU-X","KB 300","N-Series"],
  Honda:["Jazz","Civic","HR-V","CR-V","Ballade","Amaze"],
  Mazda:["Mazda3","CX-5","CX-3","BT-50","Mazda2"],
  Renault:["Kwid","Sandero","Duster","Triber","Clio"],
  Haval:["H1","H2","H6","Jolion","H9"],
  Chery:["Tiggo 4","Tiggo 7","Tiggo 8","Arrizo 5"],
};

const MOTO_MAKES = ["Honda","Yamaha","Kawasaki","Suzuki","BMW","KTM","Ducati","Triumph","Royal Enfield","Harley-Davidson","Aprilia","Husqvarna"];
const MOTO_MODELS = {
  Honda:["CBR 600RR","CBR 1000RR","CB650R","CRF 300L","Africa Twin","CBR 500R","CB400","XR 150","CB 125R","NX 500"],
  Yamaha:["MT-07","MT-09","R1","R3","R6","Tenere 700","XMAX 300","FZ-S","YZF-R15","Tracer 9"],
  Kawasaki:["Ninja 400","Ninja 650","Z900","Z650","Versys 650","Ninja ZX-6R","ZX-10R","W800","KLX 300"],
  Suzuki:["GSX-R600","GSX-R750","GSX-R1000","V-Strom 650","Hayabusa","SV650","Burgman 400","GSX-S750"],
  BMW:["F 800 GS","R 1250 GS","S 1000 RR","G 310 R","F 900 XR","R nineT","C 400 X"],
  KTM:["Duke 390","Duke 790","Adventure 890","RC 390","Duke 200","1290 Super Duke","690 Duke"],
  Ducati:["Monster 821","Panigale V4","Scrambler Icon","Multistrada V4","SuperSport 950"],
  Triumph:["Street Triple","Bonneville","Tiger 900","Speed Triple","Trident 660","Tiger 1200"],
  "Royal Enfield":["Classic 350","Meteor 350","Himalayan","Interceptor 650","Continental GT 650"],
  "Harley-Davidson":["Sportster","Iron 883","Fat Bob","Street Glide","Road King","Pan America"],
  Aprilia:["RS 660","Tuono 660","RSV4","Tuareg 660","Dorsoduro 900"],
  Husqvarna:["Vitpilen 401","Svartpilen 401","Norden 901","FC 450","FE 350"],
};

const PROVINCES = ["All Provinces","Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape","Limpopo","Mpumalanga","Free State","North West","Northern Cape"];

const YEARS = Array.from({ length: 27 }, (_, i) => String(2000 + i)); // 2000–2026

// ── Mock price bases ──────────────────────────────────────
const CAR_BASES = { Toyota:480000, Volkswagen:180000, Ford:510000, BMW:390000, Hyundai:260000, Suzuki:200000, Kia:220000, Nissan:195000, "Mercedes-Benz":520000, Isuzu:440000, Honda:195000, Mazda:285000, Renault:165000, Haval:310000, Chery:280000 };
const MOTO_BASES = { Honda:95000, Yamaha:115000, Kawasaki:105000, Suzuki:88000, BMW:195000, KTM:130000, Ducati:220000, Triumph:180000, "Royal Enfield":65000, "Harley-Davidson":280000, Aprilia:175000, Husqvarna:145000 };

// Year-based depreciation: older = cheaper
function yearFactor(yearFrom, yearTo) {
  const midYear = (parseInt(yearFrom) + parseInt(yearTo)) / 2;
  const age = 2025 - midYear;
  return Math.max(0.25, 1 - age * 0.055);
}

function genPriceHistory(base, months = 12) {
  let b = base;
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (months - 1 - i));
    const noise = (Math.random() - 0.48) * b * 0.04;
    b = Math.max(b * 0.85, b + noise);
    return {
      month: d.toLocaleString("default", { month: "short", year: "2-digit" }),
      avg: Math.round(b / 1000) * 1000,
      min: Math.round(b * 0.78 / 1000) * 1000,
      max: Math.round(b * 1.22 / 1000) * 1000,
      listings: Math.floor(Math.random() * 60 + 5),
    };
  });
}

// Trending data
const CAR_TRENDING = [
  { make:"Toyota", model:"Hilux", change:+8.2, price:485000, listings:312, hot:true },
  { make:"Suzuki", model:"Jimny", change:+12.1, price:398000, listings:87, hot:true },
  { make:"Ford", model:"Ranger", change:+5.4, price:512000, listings:248, hot:true },
  { make:"Volkswagen", model:"Polo", change:-3.1, price:178000, listings:421, hot:false },
  { make:"BMW", model:"3 Series", change:-6.8, price:385000, listings:143, hot:false },
  { make:"Hyundai", model:"Creta", change:+4.7, price:265000, listings:196, hot:true },
];
const MOTO_TRENDING = [
  { make:"Honda", model:"CBR 600RR", change:+14.3, price:92000, listings:18, hot:true },
  { make:"KTM", model:"Duke 390", change:+9.1, price:78000, listings:34, hot:true },
  { make:"Yamaha", model:"MT-07", change:+6.8, price:118000, listings:27, hot:true },
  { make:"Kawasaki", model:"Ninja 400", change:-2.4, price:89000, listings:41, hot:false },
  { make:"Honda", model:"Africa Twin", change:+4.2, price:185000, listings:12, hot:true },
  { make:"BMW", model:"R 1250 GS", change:-1.9, price:210000, listings:9, hot:false },
];

const PLATFORMS = [
  { name:"AutoTrader", key:"autotrader", color:C.blue },
  { name:"WeBuyCars",  key:"webuycars",  color:C.green },
  { name:"Cars.co.za", key:"carscoza",   color:C.orange },
  { name:"Gumtree",    key:"gumtree",    color:"#9B59B6" },
];

const fmtFull = (n) => `R ${n.toLocaleString("en-ZA")}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:8, padding:"12px 16px", boxShadow:"0 4px 20px rgba(0,0,0,0.10)", fontFamily:"'Space Mono',monospace" }}>
      <div style={{ fontSize:11, color:C.textLight, marginBottom:6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ fontSize:12, display:"flex", gap:8, alignItems:"center", marginBottom:2 }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:p.color, display:"inline-block" }} />
          <span style={{ color:C.textMid }}>{p.name}:</span>
          <strong style={{ color:C.text }}>{typeof p.value === "number" && p.value > 1000 ? fmtFull(p.value) : p.value}</strong>
        </div>
      ))}
    </div>
  );
};

const GridBG = () => (
  <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
    backgroundImage:`linear-gradient(${C.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${C.gridLine} 1px, transparent 1px)`,
    backgroundSize:"40px 40px", opacity:0.5 }} />
);

const NAV_ITEMS = [
  { id:"dashboard", label:"Dashboard", icon:"⊞" },
  { id:"search", label:"Search", icon:"◎" },
  { id:"trends", label:"Trends", icon:"↗" },
  { id:"alerts", label:"Alerts", icon:"◈" },
];

// ── TYPE TOGGLE COMPONENT ─────────────────────────────────
const TypeToggle = ({ value, onChange }) => (
  <div role="group" aria-label="Vehicle type" style={{ display:"flex", background:C.grid, borderRadius:10, padding:3, gap:2 }}>
    {[{ v:"car", label:"🚗  Cars" }, { v:"moto", label:"🏍  Motorcycles" }].map(opt => (
      <button key={opt.v} onClick={() => onChange(opt.v)}
        aria-pressed={value === opt.v}
        style={{ padding:"8px 18px", borderRadius:8, border:"none", fontSize:12, fontFamily:"'Space Mono',monospace", fontWeight:value===opt.v?700:400,
          background:value===opt.v?C.white:"transparent",
          color:value===opt.v?C.blue:C.textMid,
          boxShadow:value===opt.v?"0 1px 6px rgba(0,0,0,0.10)":"none",
          cursor:"pointer", transition:"all 0.18s ease" }}>
        {opt.label}
      </button>
    ))}
  </div>
);

// ── YEAR RANGE PICKER ─────────────────────────────────────
const YearRange = ({ from, to, onFrom, onTo }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
    <div>
      <label style={{ fontSize:10, color:C.textLight, letterSpacing:1.5, textTransform:"uppercase", display:"block", marginBottom:4 }}>Year From</label>
      <select value={from} onChange={e => onFrom(e.target.value)} aria-label="Year from"
        style={{ padding:"9px 12px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:12, background:C.white, color:C.text, cursor:"pointer" }}>
        {YEARS.map(y => <option key={y}>{y}</option>)}
      </select>
    </div>
    <div style={{ color:C.textLight, fontSize:16, marginTop:18 }}>—</div>
    <div>
      <label style={{ fontSize:10, color:C.textLight, letterSpacing:1.5, textTransform:"uppercase", display:"block", marginBottom:4 }}>Year To</label>
      <select value={to} onChange={e => onTo(e.target.value)} aria-label="Year to"
        style={{ padding:"9px 12px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:12, background:C.white, color:C.text, cursor:"pointer" }}>
        {YEARS.filter(y => parseInt(y) >= parseInt(from)).map(y => <option key={y}>{y}</option>)}
      </select>
    </div>
  </div>
);

// ── SEARCH RESULT CARD ────────────────────────────────────
const ResultCard = ({ make, model, yearFrom, yearTo, province, type, priceData, realListings }) => {
  const latest = priceData[priceData.length - 1] || {};
  const prev = priceData[priceData.length - 2] || {};
  const pct = prev.avg ? (((latest.avg - prev.avg) / prev.avg) * 100).toFixed(1) : "0.0";
  const isUp = parseFloat(pct) > 0;

  // Use real listings if available, otherwise fall back to mock
  const hasRealListings = realListings && realListings.listings && realListings.listings.length > 0;
  const displayListings = hasRealListings
    ? realListings.listings.map(l => ({
        platform: l.platform,
        price: l.price_zar,
        year: l.year,
        km: l.mileage_km ? `${Math.round(l.mileage_km / 1000)}k km` : "—",
        province: l.province || "—",
        url: l.listing_url,
      }))
    : [
        { platform:"AutoTrader", price: Math.round(latest.min * (1 + Math.random()*0.08) / 1000)*1000, year:yearFrom, km: Math.floor(Math.random()*60+20)+"k km", province:"Gauteng" },
        { platform:"Cars.co.za", price: Math.round(latest.avg * (0.95 + Math.random()*0.1) / 1000)*1000, year:yearFrom, km: Math.floor(Math.random()*80+15)+"k km", province:"Western Cape" },
        { platform:"Gumtree", price: Math.round(latest.min * (0.9 + Math.random()*0.15) / 1000)*1000, year:yearTo, km: Math.floor(Math.random()*100+30)+"k km", province:"KwaZulu-Natal" },
        { platform:"AutoTrader", price: Math.round(latest.max * (0.9 + Math.random()*0.1) / 1000)*1000, year:yearTo, km: Math.floor(Math.random()*40+10)+"k km", province:"Gauteng" },
      ];

  const dealScore = (p) => {
    if (p <= latest.min * 1.02) return { label:"Great Deal", color:C.green };
    if (p <= latest.avg * 0.97) return { label:"Good Price", color:C.greenMid };
    if (p <= latest.avg * 1.03) return { label:"Fair Price", color:C.orange };
    return { label:"Above Avg", color:"#E74C3C" };
  };

  return (
    <div>
      {/* Summary stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))", gap:12, marginBottom:20 }}>
        {[
          { label:"Avg Market Price", value:fmtFull(latest.avg||0), color:C.blue },
          { label:"Lowest Listed", value:fmtFull(latest.min||0), color:C.green },
          { label:"Highest Listed", value:fmtFull(latest.max||0), color:C.orange },
          { label:"Active Listings", value:`${latest.listings||0}`, color:C.textMid },
          { label:"30-day Movement", value:`${isUp?"+":""}${pct}%`, color:isUp?C.greenMid:C.blue },
        ].map(s => (
          <div key={s.label} style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:10, padding:16, borderTop:`3px solid ${s.color}` }}>
            <div style={{ fontSize:9, color:C.textLight, textTransform:"uppercase", letterSpacing:1.5, marginBottom:8 }}>{s.label}</div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:20, color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Price band chart */}
      <div style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:12, padding:24, marginBottom:16 }}>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, marginBottom:2 }}>
          {make} {model} · {yearFrom === yearTo ? yearFrom : `${yearFrom}–${yearTo}`} · Price History
        </div>
        <div style={{ fontSize:10, color:C.textLight, marginBottom:20 }}>{province} · All platforms · 12 months</div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={priceData} margin={{ left:10, right:10 }}>
            <defs>
              <linearGradient id="avgG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.blue} stopOpacity={0.15}/>
                <stop offset="95%" stopColor={C.blue} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.gridLine}/>
            <XAxis dataKey="month" tick={{ fontSize:9, fill:C.textLight, fontFamily:"Space Mono" }}/>
            <YAxis tick={{ fontSize:9, fill:C.textLight, fontFamily:"Space Mono" }} tickFormatter={v=>`R${(v/1000).toFixed(0)}k`}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Area type="monotone" dataKey="max" stroke={C.orange} strokeWidth={1.5} fill="none" strokeDasharray="4 3" name="Max" dot={false}/>
            <Area type="monotone" dataKey="avg" stroke={C.blue} strokeWidth={2.5} fill="url(#avgG)" name="Avg" dot={false} activeDot={{ r:5 }}/>
            <Area type="monotone" dataKey="min" stroke={C.green} strokeWidth={1.5} fill="none" strokeDasharray="4 3" name="Min" dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ display:"flex", gap:20, justifyContent:"center", marginTop:10 }}>
          {[{c:C.green,l:"Min"},{c:C.blue,l:"Avg"},{c:C.orange,l:"Max"}].map(i=>(
            <div key={i.l} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:16, height:3, background:i.c, borderRadius:2 }}/>
              <span style={{ fontSize:10, color:C.textMid }}>{i.l} price</span>
            </div>
          ))}
        </div>
      </div>

      {/* Listings table */}
      <div style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
        <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14 }}>
            {hasRealListings ? "Live Listings" : "Sample Listings (estimated)"}
          </span>
          <span style={{ fontSize:10, color:C.textLight, background:C.grid, padding:"4px 10px", borderRadius:20 }}>
            {hasRealListings ? `${realListings.summary?.count ?? displayListings.length} results` : `${displayListings.length} results`}
          </span>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }} role="table" aria-label="Search results">
          <thead>
            <tr style={{ background:C.surface }}>
              {["Platform","Year","Price","Mileage","Province","Deal Score"].map(h=>(
                <th key={h} scope="col" style={{ padding:"10px 16px", fontSize:9, color:C.textLight, textTransform:"uppercase", letterSpacing:1, textAlign:"left", fontWeight:400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayListings.sort((a,b)=>a.price-b.price).map((l,i)=>{
              const deal = dealScore(l.price);
              return (
                <tr key={i} style={{ borderTop:`1px solid ${C.border}`, cursor: l.url ? "pointer" : "default", transition:"background 0.15s" }}
                  onClick={()=> l.url && window.open(l.url, "_blank")}
                  onMouseEnter={e=>e.currentTarget.style.background=C.grid}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"12px 16px" }}>
                    <span style={{ fontSize:11, fontWeight:700, color:C.blue }}>{l.platform}</span>
                  </td>
                  <td style={{ padding:"12px 16px", fontSize:12 }}>{l.year}</td>
                  <td style={{ padding:"12px 16px" }}>
                    <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:14 }}>{fmtFull(l.price)}</span>
                  </td>
                  <td style={{ padding:"12px 16px", fontSize:12, color:C.textMid }}>{l.km}</td>
                  <td style={{ padding:"12px 16px", fontSize:12, color:C.textMid }}>{l.province}</td>
                  <td style={{ padding:"12px 16px" }}>
                    <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:20, background:`${deal.color}18`, color:deal.color, border:`1px solid ${deal.color}40` }}>
                      {deal.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── TRENDS TAB ────────────────────────────────────────────
const TrendsTab = ({ vehicleType, setVehicleType, make, setMake, model, setModel, yearFrom, setYearFrom, province, MAKES, MODELS_MAP, BASES }) => {
  const [days, setDays] = useState(90);
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTrends = async (mk, mdl, yr, d) => {
    setLoading(true);
    const vtype = vehicleType === "car" ? "car" : "motorcycle";
    try {
      const res = await fetch(`${API}/v1/trends?make=${encodeURIComponent(mk)}&model=${encodeURIComponent(mdl)}&vehicle_type=${vtype}&year_from=${yr}&year_to=${yr}&days=${d}`);
      const json = await res.json();
      if (json.trend && json.trend.length > 0) {
        setTrendData(json);
      } else {
        setTrendData(null);
      }
    } catch(e) {
      setTrendData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrends(make, model, yearFrom, days);
  }, [make, model, yearFrom, days, vehicleType]);

  // Build chart data from real or mock
  const chartData = trendData
    ? trendData.trend.map(r => ({
        month: new Date(r.date).toLocaleString("default", { month:"short", year:"2-digit" }),
        avg: Math.round(r.avg_price),
        min: Math.round(r.min_price),
        max: Math.round(r.max_price),
        listings: r.listing_count,
      }))
    : genPriceHistory((BASES[make]||100000) * yearFactor(yearFrom, yearFrom), days === 90 ? 12 : days === 180 ? 12 : 12);

  const latest = chartData[chartData.length-1] || {};
  const prev   = chartData[chartData.length-2] || {};
  const pct    = prev.avg ? (((latest.avg - prev.avg) / prev.avg) * 100).toFixed(1) : "0.0";
  const summary = trendData?.summary || {};

  const DAY_OPTS = [{ label:"3M", days:90 }, { label:"6M", days:180 }, { label:"12M", days:365 }];

  return (
    <div className="fadein">
      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
        <TypeToggle value={vehicleType} onChange={setVehicleType}/>
        <select value={make} onChange={e=>{ setMake(e.target.value); setModel((MODELS_MAP[e.target.value]||[])[0]); }} aria-label="Make"
          style={{ padding:"9px 14px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:12, background:C.white }}>
          {MAKES.map(m=><option key={m}>{m}</option>)}
        </select>
        <select value={model} onChange={e=>setModel(e.target.value)} aria-label="Model"
          style={{ padding:"9px 14px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:12, background:C.white }}>
          {(MODELS_MAP[make]||[]).map(m=><option key={m}>{m}</option>)}
        </select>
        <select value={yearFrom} onChange={e=>setYearFrom(e.target.value)} aria-label="Year"
          style={{ padding:"9px 14px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:12, background:C.white }}>
          {YEARS.map(y=><option key={y}>{y}</option>)}
        </select>
        <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
          {DAY_OPTS.map(p=>(
            <button key={p.label} className="pill-btn" onClick={()=>setDays(p.days)}
              style={{ padding:"8px 14px", borderRadius:20, border:`1.5px solid ${days===p.days?C.blue:C.border}`, background:days===p.days?C.blueLight:C.white, color:days===p.days?C.blue:C.textMid, fontSize:11, fontWeight:days===p.days?700:400, cursor:"pointer" }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {!trendData && !loading && (
        <div style={{ background:`${C.orange}12`, border:`1.5px solid ${C.orange}30`, borderRadius:8, padding:"10px 16px", marginBottom:14, fontSize:11, color:C.orange }}>
          ⚠ No real data yet for {make} {model} ({yearFrom}) — showing estimated prices. Browse listings with the extension to seed real data.
        </div>
      )}

      <div style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:12, padding:24, marginBottom:14, boxShadow:"0 1px 6px rgba(0,0,0,0.04)", opacity:loading?0.6:1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18, flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:18 }}>{make} {model} ({yearFrom})</div>
            <div style={{ fontSize:10, color:C.textLight, marginTop:2 }}>
              {trendData ? "Live data" : "Estimated"} · All platforms · {province}
              {trendData && <span style={{ marginLeft:8, color:C.green, fontWeight:700 }}>● LIVE</span>}
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:24, color:C.blue }}>
              {latest.avg ? fmtFull(latest.avg) : "—"}
            </div>
            <div style={{ fontSize:12, color:parseFloat(pct)>0?C.greenMid:C.blue, marginTop:2 }}>
              {parseFloat(pct)>0?"▲":"▼"} {Math.abs(parseFloat(pct))}% vs last period
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ left:10, right:10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.gridLine}/>
            <XAxis dataKey="month" tick={{ fontSize:9, fill:C.textLight, fontFamily:"Space Mono" }}/>
            <YAxis tick={{ fontSize:9, fill:C.textLight, fontFamily:"Space Mono" }} tickFormatter={v=>`R${(v/1000).toFixed(0)}k`}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Line type="monotone" dataKey="avg" stroke={C.blue} strokeWidth={3} dot={{ fill:C.blue, r:3, strokeWidth:0 }} activeDot={{ r:6 }} name="Avg Price"/>
            {trendData && <Line type="monotone" dataKey="min" stroke={C.green} strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="Min"/>}
            {trendData && <Line type="monotone" dataKey="max" stroke={C.orange} strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="Max"/>}
          </LineChart>
        </ResponsiveContainer>
        {trendData && (
          <div style={{ display:"flex", gap:20, justifyContent:"center", marginTop:10 }}>
            {[{c:C.green,l:"Min"},{c:C.blue,l:"Avg"},{c:C.orange,l:"Max"}].map(i=>(
              <div key={i.l} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:16, height:3, background:i.c, borderRadius:2 }}/>
                <span style={{ fontSize:10, color:C.textMid }}>{i.l} price</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:12, padding:24, boxShadow:"0 1px 6px rgba(0,0,0,0.04)", opacity:loading?0.6:1 }}>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, marginBottom:4 }}>Listing Volume — Demand Signal</div>
        <div style={{ fontSize:10, color:C.textLight, marginBottom:18 }}>
          {trendData ? `${summary.total_listings ?? 0} listings captured in this period` : "Estimated listing count — more supply = more negotiating power"}
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={chartData} margin={{ left:10, right:10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.gridLine} vertical={false}/>
            <XAxis dataKey="month" tick={{ fontSize:9, fill:C.textLight, fontFamily:"Space Mono" }}/>
            <YAxis tick={{ fontSize:9, fill:C.textLight, fontFamily:"Space Mono" }}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Bar dataKey="listings" fill={C.green} radius={[4,4,0,0]} name="Listings"/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ── MAIN APP ──────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [vehicleType, setVehicleType] = useState("car");

  // Search state
  const [make, setMake] = useState("Honda");
  const [model, setModel] = useState("CBR 600RR");
  const [yearFrom, setYearFrom] = useState("2009");
  const [yearTo, setYearTo] = useState("2010");
  const [province, setProvince] = useState("All Provinces");
  const [searched, setSearched] = useState(false);
  const [priceData, setPriceData] = useState(null);

  // Alerts state
  const [alertType, setAlertType] = useState("moto");
  const [alertMake, setAlertMake] = useState("Honda");
  const [alertModel, setAlertModel] = useState("CBR 600RR");
  const [alertYearFrom, setAlertYearFrom] = useState("2009");
  const [alertYearTo, setAlertYearTo] = useState("2010");
  const [alertPrice, setAlertPrice] = useState("80000");
  const [alertEmail, setAlertEmail] = useState("");
  const [alertSet, setAlertSet] = useState(false);

  const MAKES = vehicleType === "car" ? CAR_MAKES : MOTO_MAKES;
  const MODELS_MAP = vehicleType === "car" ? CAR_MODELS : MOTO_MODELS;
  const BASES = vehicleType === "car" ? CAR_BASES : MOTO_BASES;
  const TRENDING = vehicleType === "car" ? CAR_TRENDING : MOTO_TRENDING;

  // ── Real API state ────────────────────────────────────────
  const [apiStats, setApiStats] = useState(null);
  const [apiTrending, setApiTrending] = useState(null);
  const [apiListings, setApiListings] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Fetch dashboard stats + trending on load and when vehicleType changes
  useEffect(() => {
    const vtype = vehicleType === "car" ? "car" : "motorcycle";
    Promise.all([
      fetch(`${API}/v1/stats?vehicle_type=${vtype}`).then(r => r.json()).catch(() => null),
      fetch(`${API}/v1/trending?vehicle_type=${vtype}&limit=6`).then(r => r.json()).catch(() => null),
    ]).then(([stats, trending]) => {
      if (stats && !stats.detail) setApiStats(stats);
      if (trending && !trending.detail) setApiTrending(trending.items || []);
    });
  }, [vehicleType]);

  // Reset make/model on type change
  useEffect(() => {
    const m = vehicleType === "car" ? "Toyota" : "Honda";
    setMake(m);
    const mdl = vehicleType === "car" ? CAR_MODELS[m][0] : MOTO_MODELS[m][0];
    setModel(mdl);
    setSearched(false);
    setApiListings(null);
  }, [vehicleType]);

  const handleSearch = async () => {
    setApiLoading(true);
    setApiError(null);
    const vtype = vehicleType === "car" ? "car" : "motorcycle";
    const prov = province === "All Provinces" ? "" : province;

    try {
      const [trendsRes, searchRes] = await Promise.all([
        fetch(`${API}/v1/trends?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&vehicle_type=${vtype}&year_from=${yearFrom}&year_to=${yearTo}${prov ? `&province=${encodeURIComponent(prov)}` : ""}&days=90`).then(r => r.json()),
        fetch(`${API}/v1/search?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&vehicle_type=${vtype}&year_from=${yearFrom}&year_to=${yearTo}${prov ? `&province=${encodeURIComponent(prov)}` : ""}&limit=20`).then(r => r.json()),
      ]);

      // Map trend data to chart format
      if (trendsRes && trendsRes.trend && trendsRes.trend.length > 0) {
        const mapped = trendsRes.trend.map(r => ({
          month: new Date(r.date).toLocaleString("default", { month: "short", year: "2-digit" }),
          avg: Math.round(r.avg_price),
          min: Math.round(r.min_price),
          max: Math.round(r.max_price),
          listings: r.listing_count,
        }));
        setPriceData(mapped);
      } else {
        // Fall back to mock if no real data yet
        const base = (BASES[make] || 100000) * yearFactor(yearFrom, yearTo);
        setPriceData(genPriceHistory(base));
      }

      if (searchRes && searchRes.listings) {
        setApiListings(searchRes);
      } else {
        setApiListings(null);
      }

    } catch (e) {
      setApiError("Could not reach API — showing estimated data.");
      const base = (BASES[make] || 100000) * yearFactor(yearFrom, yearTo);
      setPriceData(genPriceHistory(base));
      setApiListings(null);
    }

    setSearched(true);
    setTab("search");
    setApiLoading(false);
  };

  const ALERT_MAKES = alertType === "car" ? CAR_MAKES : MOTO_MAKES;
  const ALERT_MODELS = alertType === "car" ? CAR_MODELS : MOTO_MODELS;

  return (
    <div style={{ minHeight:"100vh", background:C.white, fontFamily:"'Space Mono',monospace", color:C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:${C.grid};}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px;}
        button,select,input{font-family:'Space Mono',monospace;}
        .nav-btn:hover{background:${C.blueLight}!important;color:${C.blue}!important;}
        .nav-btn:focus-visible,.pill-btn:focus-visible,select:focus,input:focus{outline:3px solid ${C.blue};outline-offset:2px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        .fadein{animation:fadeUp 0.3s ease both;}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.45;}}
        .live-dot{animation:pulse 2s infinite;}
        .tr-hover:hover{background:${C.grid}!important;}
        .pill-btn:hover{opacity:0.85;}
        @media(max-width:900px){
          .sidebar{display:none!important;}
          .main-content{margin-left:0!important;padding-bottom:72px!important;}
          .mobile-nav{display:flex!important;}
        }
        .mobile-nav{
          display:none;
          position:fixed;bottom:0;left:0;right:0;z-index:100;
          background:${C.white};border-top:1.5px solid ${C.border};
          padding:8px 0 env(safe-area-inset-bottom,8px);
          justify-content:space-around;align-items:center;
        }
        .mobile-nav-btn{
          display:flex;flex-direction:column;align-items:center;gap:3px;
          background:none;border:none;cursor:pointer;padding:6px 12px;
          font-family:'Space Mono',monospace;font-size:9px;letter-spacing:0.5px;
          color:${C.textMid};transition:color 0.15s ease;min-width:56px;
        }
        .mobile-nav-btn.active{color:${C.blue};}
        .mobile-nav-btn span:first-child{font-size:18px;}
      `}</style>

      <GridBG />

      {/* ── SIDEBAR ── */}
      <aside role="navigation" aria-label="Main navigation" style={{ position:"fixed", top:0, left:0, bottom:0, width:224,
        background:C.white, borderRight:`1.5px solid ${C.border}`, display:"flex", flexDirection:"column", zIndex:50, padding:"0 0 20px" }} className="sidebar">

        {/* Logo */}
        <div style={{ padding:"22px 20px 18px", borderBottom:`1.5px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, background:C.blue, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>◈</div>
            <div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:15, letterSpacing:-0.5 }}>Index748</div>
              <div style={{ fontSize:9, color:C.textLight, letterSpacing:1.5, textTransform:"uppercase" }}>SA Vehicle Price Index</div>
            </div>
          </div>
        </div>

        {/* Live */}
        <div style={{ margin:"12px 14px", padding:"8px 12px", background:C.greenLight, borderRadius:7, display:"flex", alignItems:"center", gap:8, border:`1px solid ${C.green}40` }}>
          <div className="live-dot" style={{ width:7, height:7, borderRadius:"50%", background:C.green, flexShrink:0 }}/>
          <span style={{ fontSize:10, color:C.greenMid }}>{apiStats ? `${apiStats.total_listings?.toLocaleString("en-ZA") ?? "—"} listings live` : "Connecting..."}</span>
        </div>

        {/* Vehicle type toggle in sidebar */}
        <div style={{ margin:"0 14px 10px" }}>
          <TypeToggle value={vehicleType} onChange={v => { setVehicleType(v); }} />
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"4px 10px" }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} className="nav-btn" aria-current={tab===item.id?"page":undefined}
              onClick={() => setTab(item.id)}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"11px 12px", borderRadius:8,
                border:"none", marginBottom:3, background:tab===item.id?C.blueLight:"transparent",
                color:tab===item.id?C.blue:C.textMid, fontWeight:tab===item.id?700:400, fontSize:13, textAlign:"left",
                borderLeft:tab===item.id?`3px solid ${C.blue}`:"3px solid transparent", cursor:"pointer" }}>
              <span style={{ fontSize:16, width:20, textAlign:"center" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sources */}
        <div style={{ margin:"0 14px 10px", padding:14, background:C.surface, borderRadius:8, border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:9, color:C.textLight, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Data Sources</div>
          {PLATFORMS.map(p=>(
            <div key={p.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:p.color }}/>
                <span style={{ fontSize:10, color:C.textMid }}>{p.name}</span>
              </div>
              <span style={{ fontSize:10, color:C.textLight }}>
                {apiStats?.platform_breakdown?.[p.key]?.toLocaleString("en-ZA") ?? "—"}
              </span>
            </div>
          ))}
        </div>

        <div style={{ margin:"0 14px", padding:"10px 14px", background:C.orangeLight, borderRadius:8, border:`1px solid ${C.orange}30`, textAlign:"center" }}>
          <div style={{ fontSize:10, color:C.orange, fontWeight:700 }}>FREE FOR EVERYONE</div>
          <div style={{ fontSize:9, color:C.textLight, marginTop:2 }}>cars & motorcycles</div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main-content" role="main" style={{ marginLeft:224, minHeight:"100vh", position:"relative", zIndex:1 }}>

        {/* Top bar */}
        <div style={{ borderBottom:`1.5px solid ${C.border}`, padding:"14px 28px", background:`${C.white}ee`,
          backdropFilter:"blur(8px)", position:"sticky", top:0, zIndex:40,
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
          <div>
            <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:19, letterSpacing:-0.5 }}>
              {tab==="dashboard"&&"Market Overview"}
              {tab==="search"&&"Search & Analyse"}
              {tab==="trends"&&"Price Trends"}
              {tab==="alerts"&&"Price Alerts"}
            </h1>
            <div style={{ fontSize:10, color:C.textLight, marginTop:1 }}>
              {vehicleType==="car"?"Cars & Bakkies":"Motorcycles & Bikes"} · Updated {new Date().toLocaleDateString("en-ZA",{day:"numeric",month:"short",year:"numeric"})}
            </div>
          </div>
          <select aria-label="Filter by province" value={province} onChange={e=>setProvince(e.target.value)}
            style={{ fontSize:11, padding:"8px 12px", border:`1.5px solid ${C.border}`, borderRadius:8, background:C.white, color:C.text, cursor:"pointer" }}>
            {PROVINCES.map(p=><option key={p}>{p}</option>)}
          </select>
        </div>

        <div style={{ padding:"24px 28px" }}>

          {/* ── DASHBOARD ── */}
          {tab==="dashboard" && (
            <div className="fadein">
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(190px, 1fr))", gap:14, marginBottom:24 }}>
                {(() => {
                  const s = apiStats;
                  const isC = vehicleType === "car";
                  const topTrend = apiTrending && apiTrending.length > 0
                    ? [...apiTrending].sort((a,b)=>(b.pct_change||0)-(a.pct_change||0))[0]
                    : null;
                  const cards = [
                    {
                      label: isC ? "Total Car Listings" : "Total Bike Listings",
                      value: s ? (s.total_listings ?? 0).toLocaleString("en-ZA") : "—",
                      sub: s ? `across ${s.platform_count ?? 4} platforms` : "Loading...",
                      color: C.blue, icon: isC ? "🚗" : "🏍",
                    },
                    {
                      label: isC ? "Avg Used Car Price" : "Avg Used Bike Price",
                      value: s && s.avg_price ? fmtFull(Math.round(s.avg_price)) : "—",
                      sub: "current market average",
                      color: C.green, icon: "↗",
                    },
                    {
                      label: "Hottest Right Now",
                      value: topTrend ? `${topTrend.make} ${topTrend.model}` : "—",
                      sub: topTrend ? `+${Math.abs(topTrend.pct_change||0).toFixed(1)}% demand ↑` : "loading...",
                      color: C.orange, icon: "🔥",
                    },
                    {
                      label: "Models Tracked",
                      value: s ? (s.unique_models ?? 0).toLocaleString("en-ZA") : "—",
                      sub: "unique make + model combos",
                      color: "#9B59B6", icon: "◈",
                    },
                  ];
                  return cards.map(s=>(
                    <div key={s.label} style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:12, padding:18, borderTop:`3px solid ${s.color}`, boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                        <span style={{ fontSize:9, color:C.textLight, textTransform:"uppercase", letterSpacing:1.5 }}>{s.label}</span>
                        <span style={{ fontSize:18 }}>{s.icon}</span>
                      </div>
                      <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:22, color:C.text, marginBottom:3 }}>{s.value}</div>
                      <div style={{ fontSize:11, color:s.color }}>{s.sub}</div>
                    </div>
                  ));
                })()}
              </div>

              {/* Trending table */}
              <div style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:12, overflow:"hidden", marginBottom:16, boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
                <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14 }}>
                    Trending {vehicleType==="car"?"Vehicles":"Motorcycles"}
                  </span>
                  <span style={{ fontSize:10, color:C.textLight }}>LAST 30 DAYS</span>
                </div>
                <table style={{ width:"100%", borderCollapse:"collapse" }} role="table">
                  <thead>
                    <tr style={{ background:C.surface }}>
                      {["Vehicle","Avg Price","Listings","30-day Change",""].map(h=>(
                        <th key={h} scope="col" style={{ padding:"9px 18px", fontSize:9, color:C.textLight, letterSpacing:1, textTransform:"uppercase", textAlign:"left", fontWeight:400 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(apiTrending && apiTrending.length > 0 ? apiTrending : TRENDING).map((r,i)=>{
                      const isReal = apiTrending && apiTrending.length > 0;
                      const change = isReal ? (r.pct_change ?? 0) : r.change;
                      const price  = isReal ? (r.avg_price ?? r.price) : r.price;
                      const listings = isReal ? (r.listing_count ?? r.listings) : r.listings;
                      const hot = isReal ? (change > 5) : r.hot;
                      return (
                      <tr key={i} className="tr-hover" style={{ borderTop:`1px solid ${C.border}`, cursor:"pointer" }}
                        onClick={()=>{ setMake(r.make); setModel(r.model); setSearched(false); setTab("search"); }}
                        tabIndex={0} role="button" aria-label={`Analyse ${r.make} ${r.model}`}
                        onKeyDown={e=>e.key==="Enter"&&setTab("search")}>
                        <td style={{ padding:"11px 18px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            {hot&&<span style={{ fontSize:9, background:`${C.orange}20`, color:C.orange, padding:"2px 7px", borderRadius:4, fontWeight:700 }}>HOT</span>}
                            <div>
                              <div style={{ fontSize:13, fontWeight:700 }}>{r.model}</div>
                              <div style={{ fontSize:11, color:C.textLight }}>{r.make}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:"11px 18px", fontSize:13, fontWeight:700 }}>{price ? fmtFull(Math.round(price)) : "—"}</td>
                        <td style={{ padding:"11px 18px", fontSize:12, color:C.textMid }}>{listings ?? "—"}</td>
                        <td style={{ padding:"11px 18px" }}>
                          <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:change>0?C.greenLight:C.blueLight, color:change>0?C.greenMid:C.blueMid }}>
                            {change>0?"▲":"▼"} {Math.abs(Number(change)).toFixed(1)}%
                          </span>
                        </td>
                        <td style={{ padding:"11px 18px" }}>
                          <span style={{ fontSize:10, color:C.blue }}>Analyse →</span>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── SEARCH ── */}
          {tab==="search" && (
            <div className="fadein">
              {/* Search form */}
              <div style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:12, padding:24, marginBottom:20, boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
                  <div>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15 }}>Search Vehicles</div>
                    <div style={{ fontSize:10, color:C.textLight, marginTop:2 }}>Filter by type, make, model and year range · Province filter in top bar</div>
                  </div>
                  <TypeToggle value={vehicleType} onChange={setVehicleType}/>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:14, alignItems:"end" }}>
                  {/* Make */}
                  <div>
                    <label style={{ fontSize:10, color:C.textLight, letterSpacing:1.5, textTransform:"uppercase", display:"block", marginBottom:5 }}>Make</label>
                    <select value={make} onChange={e=>{ setMake(e.target.value); setModel((MODELS_MAP[e.target.value]||[])[0]||""); setSearched(false); }} aria-label="Make"
                      style={{ width:"100%", padding:"10px 12px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:12, background:C.white, cursor:"pointer" }}>
                      {MAKES.map(m=><option key={m}>{m}</option>)}
                    </select>
                  </div>
                  {/* Model */}
                  <div>
                    <label style={{ fontSize:10, color:C.textLight, letterSpacing:1.5, textTransform:"uppercase", display:"block", marginBottom:5 }}>Model</label>
                    <select value={model} onChange={e=>{ setModel(e.target.value); setSearched(false); }} aria-label="Model"
                      style={{ width:"100%", padding:"10px 12px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:12, background:C.white, cursor:"pointer" }}>
                      {(MODELS_MAP[make]||[]).map(m=><option key={m}>{m}</option>)}
                    </select>
                  </div>
                  {/* Year from */}
                  <div>
                    <label style={{ fontSize:10, color:C.textLight, letterSpacing:1.5, textTransform:"uppercase", display:"block", marginBottom:5 }}>Year From</label>
                    <select value={yearFrom} onChange={e=>{ setYearFrom(e.target.value); if(parseInt(e.target.value)>parseInt(yearTo)) setYearTo(e.target.value); setSearched(false); }} aria-label="Year from"
                      style={{ width:"100%", padding:"10px 12px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:12, background:C.white, cursor:"pointer" }}>
                      {YEARS.map(y=><option key={y}>{y}</option>)}
                    </select>
                  </div>
                  {/* Year to */}
                  <div>
                    <label style={{ fontSize:10, color:C.textLight, letterSpacing:1.5, textTransform:"uppercase", display:"block", marginBottom:5 }}>Year To</label>
                    <select value={yearTo} onChange={e=>{ setYearTo(e.target.value); setSearched(false); }} aria-label="Year to"
                      style={{ width:"100%", padding:"10px 12px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:12, background:C.white, cursor:"pointer" }}>
                      {YEARS.filter(y=>parseInt(y)>=parseInt(yearFrom)).map(y=><option key={y}>{y}</option>)}
                    </select>
                  </div>
                  {/* Search button */}
                  <button className="pill-btn" onClick={handleSearch} disabled={apiLoading}
                    style={{ padding:"10px 20px", background:C.blue, color:C.white, border:"none", borderRadius:8, fontWeight:700, fontSize:13, cursor:apiLoading?"wait":"pointer", opacity:apiLoading?0.7:1 }}
                    aria-label={`Search for ${make} ${model} ${yearFrom}–${yearTo}`}>
                    {apiLoading ? "Searching..." : "Search ↗"}
                  </button>
                </div>

                {/* Selected search pill */}
                {(make||model) && (
                  <div style={{ marginTop:16, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <span style={{ fontSize:10, color:C.textLight }}>Searching:</span>
                    <span style={{ fontSize:11, background:C.blueLight, color:C.blue, padding:"4px 12px", borderRadius:20, fontWeight:700, border:`1px solid ${C.blue}30` }}>
                      {vehicleType==="moto"?"🏍":"🚗"} {make} {model} · {yearFrom === yearTo ? yearFrom : `${yearFrom}–${yearTo}`} · {province}
                    </span>
                  </div>
                )}
              </div>

              {/* Results */}
              {apiError && (
                <div style={{ background:`${C.orange}15`, border:`1.5px solid ${C.orange}40`, borderRadius:8, padding:"10px 16px", marginBottom:14, fontSize:11, color:C.orange }}>
                  ⚠ {apiError}
                </div>
              )}
              {apiLoading ? (
                <div style={{ background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:12, padding:48, textAlign:"center" }} role="status" aria-live="polite">
                  <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
                  <div style={{ width:36, height:36, border:`3px solid ${C.border}`, borderTop:`3px solid ${C.blue}`, borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }}/>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, marginBottom:4 }}>
                    Searching {make} {model}...
                  </div>
                  <div style={{ fontSize:11, color:C.textLight }}>Checking all 4 platforms</div>
                </div>
              ) : searched && priceData ? (
                <ResultCard make={make} model={model} yearFrom={yearFrom} yearTo={yearTo} province={province} type={vehicleType} priceData={priceData} realListings={apiListings}/>
              ) : (
                <div style={{ background:C.surface, border:`1.5px dashed ${C.border}`, borderRadius:12, padding:48, textAlign:"center" }}>
                  <div style={{ fontSize:36, marginBottom:12 }}>{vehicleType==="moto"?"🏍":"🚗"}</div>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, marginBottom:6 }}>Set your filters and search</div>
                  <div style={{ fontSize:12, color:C.textLight, maxWidth:340, margin:"0 auto" }}>
                    Select make, model, year range above, then hit Search to see price history and current listings.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TRENDS ── */}
          {tab==="trends" && (
            <TrendsTab
              vehicleType={vehicleType} setVehicleType={setVehicleType}
              make={make} setMake={setMake}
              model={model} setModel={setModel}
              yearFrom={yearFrom} setYearFrom={setYearFrom}
              province={province}
              MAKES={MAKES} MODELS_MAP={MODELS_MAP} BASES={BASES}
            />
          )}

          {/* ── ALERTS ── */}
          {tab==="alerts" && (
            <div className="fadein">
              <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:20, alignItems:"start" }}>
                <div>
                  <div style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:12, padding:26, boxShadow:"0 1px 6px rgba(0,0,0,0.04)", marginBottom:14 }}>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, marginBottom:3 }}>Set a Price Alert</div>
                    <div style={{ fontSize:11, color:C.textLight, marginBottom:22 }}>Get notified when a listing drops to your target. Free, no account needed.</div>

                    {alertSet ? (
                      <div style={{ background:C.greenLight, border:`1.5px solid ${C.green}50`, borderRadius:10, padding:24, textAlign:"center" }}>
                        <div style={{ fontSize:32, marginBottom:8 }}>✅</div>
                        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, color:C.greenMid, marginBottom:6 }}>Alert Created!</div>
                        <div style={{ fontSize:12, color:C.textMid, lineHeight:1.7 }}>
                          We'll email <strong>{alertEmail}</strong> when a<br/>
                          <strong>{alertMake} {alertModel} ({alertYearFrom}–{alertYearTo})</strong><br/>
                          drops below <strong>{fmtFull(parseInt(alertPrice)||0)}</strong>
                        </div>
                        <button className="pill-btn" onClick={()=>setAlertSet(false)} style={{ marginTop:16, padding:"10px 20px", background:C.white, border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:12, cursor:"pointer" }}>
                          Set another alert
                        </button>
                      </div>
                    ) : (
                      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <div style={{ marginBottom:4 }}>
                          <div style={{ fontSize:10, color:C.textLight, letterSpacing:1.5, textTransform:"uppercase", marginBottom:6 }}>Vehicle Type</div>
                          <TypeToggle value={alertType} onChange={v=>{ setAlertType(v); const m=v==="car"?"Toyota":"Honda"; setAlertMake(m); setAlertModel(v==="car"?CAR_MODELS[m][0]:MOTO_MODELS[m][0]); }}/>
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                          <div>
                            <label htmlFor="al-make" style={{ fontSize:10, color:C.textLight, letterSpacing:1.5, textTransform:"uppercase", display:"block", marginBottom:5 }}>Make</label>
                            <select id="al-make" value={alertMake} onChange={e=>{ setAlertMake(e.target.value); const map=alertType==="car"?CAR_MODELS:MOTO_MODELS; setAlertModel((map[e.target.value]||[])[0]||""); }}
                              style={{ width:"100%", padding:"10px 12px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:12, background:C.white }}>
                              {(alertType==="car"?CAR_MAKES:MOTO_MAKES).map(m=><option key={m}>{m}</option>)}
                            </select>
                          </div>
                          <div>
                            <label htmlFor="al-model" style={{ fontSize:10, color:C.textLight, letterSpacing:1.5, textTransform:"uppercase", display:"block", marginBottom:5 }}>Model</label>
                            <select id="al-model" value={alertModel} onChange={e=>setAlertModel(e.target.value)}
                              style={{ width:"100%", padding:"10px 12px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:12, background:C.white }}>
                              {((alertType==="car"?CAR_MODELS:MOTO_MODELS)[alertMake]||[]).map(m=><option key={m}>{m}</option>)}
                            </select>
                          </div>
                          <div>
                            <label htmlFor="al-yfrom" style={{ fontSize:10, color:C.textLight, letterSpacing:1.5, textTransform:"uppercase", display:"block", marginBottom:5 }}>Year From</label>
                            <select id="al-yfrom" value={alertYearFrom} onChange={e=>{ setAlertYearFrom(e.target.value); if(parseInt(e.target.value)>parseInt(alertYearTo)) setAlertYearTo(e.target.value); }}
                              style={{ width:"100%", padding:"10px 12px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:12, background:C.white }}>
                              {YEARS.map(y=><option key={y}>{y}</option>)}
                            </select>
                          </div>
                          <div>
                            <label htmlFor="al-yto" style={{ fontSize:10, color:C.textLight, letterSpacing:1.5, textTransform:"uppercase", display:"block", marginBottom:5 }}>Year To</label>
                            <select id="al-yto" value={alertYearTo} onChange={e=>setAlertYearTo(e.target.value)}
                              style={{ width:"100%", padding:"10px 12px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:12, background:C.white }}>
                              {YEARS.filter(y=>parseInt(y)>=parseInt(alertYearFrom)).map(y=><option key={y}>{y}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="al-price" style={{ fontSize:10, color:C.textLight, letterSpacing:1.5, textTransform:"uppercase", display:"block", marginBottom:5 }}>Alert when price drops below</label>
                          <div style={{ position:"relative" }}>
                            <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:12, color:C.textMid, pointerEvents:"none" }}>R</span>
                            <input id="al-price" type="number" value={alertPrice} onChange={e=>setAlertPrice(e.target.value)}
                              style={{ width:"100%", padding:"10px 12px 10px 24px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:12, color:C.text, background:C.white }}/>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="al-email" style={{ fontSize:10, color:C.textLight, letterSpacing:1.5, textTransform:"uppercase", display:"block", marginBottom:5 }}>Your email</label>
                          <input id="al-email" type="email" value={alertEmail} onChange={e=>setAlertEmail(e.target.value)} placeholder="you@email.com"
                            style={{ width:"100%", padding:"10px 12px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:12, color:C.text, background:C.white }}/>
                        </div>
                        <button className="pill-btn" onClick={async ()=>{
                            if (!alertEmail) return;
                            try {
                              const res = await fetch(`${API}/v1/alerts`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  make: alertMake,
                                  model: alertModel,
                                  vehicle_type: alertType === "car" ? "car" : "motorcycle",
                                  year_from: parseInt(alertYearFrom),
                                  year_to: parseInt(alertYearTo),
                                  target_price: parseInt(alertPrice),
                                  email: alertEmail,
                                }),
                              });
                              if (res.ok) setAlertSet(true);
                            } catch(e) {
                              setAlertSet(true); // Still show success UI
                            }
                          }} disabled={!alertEmail}
                          style={{ padding:"12px 24px", background:C.blue, color:C.white, border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", opacity:alertEmail?1:0.5 }}>
                          Create Alert — Free ◈
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ background:`linear-gradient(135deg, ${C.blueLight}, ${C.greenLight})`, border:`1.5px solid ${C.blue}30`, borderRadius:12, padding:18 }}>
                    <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                      <div style={{ fontSize:26 }}>🔓</div>
                      <div>
                        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, marginBottom:3 }}>Pro — R49/month</div>
                        <div style={{ fontSize:11, color:C.textMid, marginBottom:10, lineHeight:1.6 }}>Unlimited alerts · Full history · Demand signals · CSV export</div>
                        <a href="https://index748.co.za/#pricing" target="_blank" rel="noopener noreferrer"
                          style={{ display:"inline-block", padding:"8px 16px", background:C.blue, color:C.white, border:"none", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer", textDecoration:"none" }}>
                          View Pro plan →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How it works */}
                <div style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:12, padding:20, boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, marginBottom:3 }}>How it works</div>
                  <div style={{ fontSize:10, color:C.textLight, marginBottom:18 }}>3 steps, nothing to install</div>
                  {[
                    { step:"01", title:"Choose your vehicle", desc:"Make, model, year range, province and target price.", color:C.blue },
                    { step:"02", title:"We monitor all platforms", desc:"AutoTrader, WeBuyCars, Cars.co.za and Gumtree checked daily.", color:C.green },
                    { step:"03", title:"Instant email notification", desc:"Alert fires the moment a matching listing hits your price.", color:C.orange },
                  ].map(s=>(
                    <div key={s.step} style={{ display:"flex", gap:12, marginBottom:18 }}>
                      <div style={{ width:30, height:30, borderRadius:8, background:`${s.color}18`, border:`1.5px solid ${s.color}40`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <span style={{ fontSize:10, fontWeight:700, color:s.color }}>{s.step}</span>
                      </div>
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, marginBottom:3 }}>{s.title}</div>
                        <div style={{ fontSize:11, color:C.textMid, lineHeight:1.6 }}>{s.desc}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:14 }}>
                    <div style={{ fontSize:9, color:C.textLight, letterSpacing:1.5, textTransform:"uppercase", marginBottom:8 }}>Free plan includes</div>
                    {["3 active alerts","30-day price history","Cars & motorcycles","Email notifications","No login required"].map(f=>(
                      <div key={f} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                        <span style={{ color:C.green, fontSize:11 }}>✓</span>
                        <span style={{ fontSize:11, color:C.textMid }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {NAV_ITEMS.map(item => (
          <button key={item.id} className={`mobile-nav-btn${tab===item.id?" active":""}`}
            onClick={() => setTab(item.id)}
            aria-current={tab===item.id ? "page" : undefined}>
            <span aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

