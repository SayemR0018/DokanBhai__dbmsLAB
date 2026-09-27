import React from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  FileText,
  QrCode,
  Package,
  Zap,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import "./styles.css";

const features = [
  { icon: FileText, iconClass: "green", title: "ডিজিটাল হাল খাতা", text: "কোন কাস্টমারের কাছে কত টাকা বাকি তার হিসাব রাখুন। খাতা হারানোর ভয় নেই।" },
  { icon: QrCode, iconClass: "yellow", title: "দ্রুত পিওএস ও ক্যাশ মেশো", text: "কাস্টমারের বাক্স/কার্ট থেকে দ্রুত ইনভয়েস তৈরি করুন। ক্যাশ, বাকি ও অনলাইন পেমেন্ট আলাদা রাখুন।" },
  { icon: Package, iconClass: "blue", title: "স্টক ও এক্সপায়ারি অ্যালার্ট", text: "যে কোনো পণ্যের স্টক ফুরিয়ে যাওয়ার আগেই সতর্কতা পান। মেয়াদোত্তীর্ণ পণ্যের সতর্কতাও।" },
  { icon: Zap, iconClass: "green", title: "১০০% অফলাইন", text: "দোকানে ইন্টারনেট না থাকলেও সব হিসাব রাখুন। নেট এলে সিস্টেম নিজেই ডেটা সেভ করবে।" },
];

function Logo() {
  return <div className="brand"><div className="brand-mark"><div className="brand-bag"></div></div><div><div className="brand-name">DOKANBHAI</div><div className="brand-sub">দোকানভাই</div></div></div>;
}

function NetworkArt() {
  return <div className="network-art" aria-hidden="true"><svg viewBox="0 0 700 570" preserveAspectRatio="none"><g className="net-lines">
    <line x1="120" y1="105" x2="310" y2="45" /><line x1="310" y1="45" x2="520" y2="125" /><line x1="120" y1="105" x2="80" y2="310" /><line x1="80" y1="310" x2="275" y2="385" /><line x1="275" y1="385" x2="520" y2="125" /><line x1="275" y1="385" x2="490" y2="475" /><line x1="520" y1="125" x2="610" y2="315" /><line x1="610" y1="315" x2="490" y2="475" /><line x1="275" y1="385" x2="390" y2="230" /><line x1="390" y1="230" x2="610" y2="315" /><line x1="310" y1="45" x2="390" y2="230" />
  </g><g className="net-dots"><circle cx="120" cy="105" r="4" /><circle cx="310" cy="45" r="4" /><circle cx="520" cy="125" r="4" /><circle cx="80" cy="310" r="4" /><circle cx="275" cy="385" r="5" /><circle cx="490" cy="475" r="4" /><circle cx="610" cy="315" r="5" /><circle cx="390" cy="230" r="6" /></g></svg></div>;
}

function App() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [dark, setDark] = React.useState(false);
  React.useEffect(() => { document.documentElement.dataset.theme = dark ? "dark" : "light"; }, [dark]);
  const scrollToStart = () => { document.querySelector("#start")?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); };

  return <div className="page">
    <header className="navbar"><div className="nav-inner"><Logo />
      <nav className={menuOpen ? "nav-links open" : "nav-links"}>
        <a href="#login" onClick={() => setMenuOpen(false)}>লগ ইন করুন</a>
        <button className="nav-cta" onClick={scrollToStart}>নতুন একাউন্ট খুলুন <ArrowRight size={16} /></button>
      </nav>
      <div className="nav-tools"><div className="language"><span>EN</span><b>বাংলা</b></div><button className="theme-btn" onClick={() => setDark(v => !v)} aria-label="Toggle theme">{dark ? <Moon size={16} /> : <Sun size={16} />}</button></div>
      <button className="mobile-menu" onClick={() => setMenuOpen(v => !v)} aria-label="Open menu">{menuOpen ? <X /> : <Menu />}</button>
    </div></header>

    <main><section className="hero"><NetworkArt /><div className="hero-inner"><div className="hero-copy">
      <div className="eyebrow">স্মার্ট রিটেল ব্রেন ও ডিজিটাল মুদি সমাধান</div>
      <h1>দোকান-ভাই</h1>
      <h2>একটি স্মার্ট রিটেল ব্রেন যা আপনার মুদি দোকানের<br className="desktop" /> প্রতিটি টাকা-পয়সার হিসাব রাখবে।</h2>
      <p className="hero-text">আপনার বাকি খাতা, দৈনিক ক্যাশ বিক্রি, মজুদ পণ্যের স্টক, ও পাইকারি অর্ডার এখন এক প্ল্যাটফর্মে। ইন্টারনেট না থাকলেও সম্পূর্ণ অফলাইনে চলবে—সাধারণ বাংলাদেশি মুদি ও ডিজিটালশপের বাস্তব প্রয়োজনে তৈরি।</p>
      <div className="stats"><div><strong>১০,০০০+</strong><span>মুদি ব্যবসায়ী যুক্ত</span></div><div className="stat-green"><strong>৯৯.১%</strong><span>হিসাবের নির্ভুলতা</span></div><div className="stat-orange"><strong>১০০%</strong><span>অফলাইন সাপোর্ট</span></div></div>
    </div></div></section>

    <section className="features-section" id="features"><div className="section-heading"><div className="eyebrow">দোকানের সম্পূর্ণ নিয়ন্ত্রণ</div><h2>মুদি ব্যবসার চার প্রধান স্তম্ভ</h2><p>চিরাচরিত হাল খাতার বাংলা শেষ, আধুনিক প্রযুক্তির সাহায্যে দোকান চালান নিশ্চিন্তে।</p></div>
      <div className="feature-grid">{features.map(({ icon: Icon, iconClass, title, text }, i) => <article className="feature-card" key={title} id={["ledger","pos","inventory","offline"][i]}><div className={`feature-icon ${iconClass}`}><Icon size={21} /></div><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>
    <section className="start-section" id="start"><div><div className="start-kicker">সহজ • নির্ভর • বিশ্বস্ত</div><h2>আজই আপনার দোকানকে ডিজিটাল বানান</h2></div></section></main>

    <footer className="footer"><div className="footer-inner"><div><strong>DOKANBHAI</strong><span className="footer-divider">|</span><span>স্মার্ট রিটেল ব্রিজ — সর্বস্ব সংরক্ষিত ২০২৬</span></div><div className="footer-links"><a href="#privacy">গোপনীয়তা নীতি</a><a href="#terms">ব্যবহারের শর্তাবলী</a><a href="#help">হেল্পলাইন: ০১৬৮২১৬৭৩৮২</a></div></div></footer>
  </div>;
}

createRoot(document.getElementById("root")).render(<App />);
