const { useState } = React;

const benefitItems = [
  { icon: "▣", title: "শূন্য খরচে ট্রায়াল", text: "কোনো হিডেন চার্জ বা মাসিক অতিরিক্ত ফি নেই" },
  { icon: "▤", title: "বাকি খাতা ইনস্ট্যান্ট ইমপোর্ট", text: "আগের হাল খাতা দেখে কয়েক ক্লিকেই নাম ও বাকি ব্যালেন্স তুলুন" },
  { icon: "▢", title: "ফ্রি এসএমএস তাগাদা ও মেমো", text: "গ্রাহকের কাছে স্বয়ংক্রিয় বাকি এসএমএস মেমো ও বকেয়া অ্যালার্ট" },
  { icon: "◉", title: "২৪/৭ সরাসরি ফোনে সহায়তা", text: "মুদি ভাইদের সুবিধার্থে সার্বক্ষণিক স্থানীয় বাংলায় কল সাপোর্ট" }
];
const bottomItems = [
];


const businessTypes = [
  "🛒 মুদি দোকান",
  "⚒ হার্ডওয়্যার ও স্যানিটারি",
  "🛠 কনস্ট্রাকশন ও নির্মাণ সামগ্রী",
  "▣ রিটেইলার / খুচরা বিক্রেতা",
  "▤ ইলেকট্রনিক্স ও গ্যাজেট"
];

function App() {
  const [selectedType, setSelectedType] = useState(0);
  const [district, setDistrict] = useState("");
  const [agreed, setAgreed] = useState(true);

  function handleSubmit(e) {
    e.preventDefault();
    alert("ডেমো ফর্ম সাবমিট হয়েছে");
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <a className="brand" href="#">
  <div className="brand-mark">
    <span>D</span>
  </div>

  <div className="brand-text">
    <strong>দোকানভাই</strong>
    <span>DOKANBHAI</span>
  </div>
</a>

        <nav className="nav">
          <a href="#">হোম পেজ</a>
          <a href="#">লগইন</a>
        <a href="#">রেজিস্ট্রেশন</a>
        </nav>

        <div className="header-actions">
          <button className="help-pill"><span className="headset">♧</span><span><small>সহায়তা ডেস্ক</small><strong>০১৬৮২১৬৭৩৮২</strong></span></button>
          <div className="lang-switch"><button className="selected">বাং</button><button>EN</button></div>
          
        </div>
      </header>

      <div className="hero-space"></div>

      <main className="content-wrap">
        <section className="registration-card">
          <aside className="left-panel">
            <h1>আপনার মুদি দোকানের ডিজিটাল খাতা শুরু করুন</h1>
            <p className="left-intro">মাত্র ২ মিনিটে রেজিস্ট্রেশন শেষ করে আজইহাল হাল  খাতা ডিজিটাল করুন এবং দ্রুত বাকি আদায় নিশ্চিত করুন।</p>

            <div className="benefit-list">
              {benefitItems.map(item => (
                <div className="benefit" key={item.title}>
                  <div className="benefit-icon">{item.icon}</div>
                  <div><h3>{item.title}</h3><p>{item.text}</p></div>
                </div>
              ))}
            </div>

            

            
          </aside>

          <section className="form-panel">
            <div className="form-content">
              <div className="form-banner">
                <div><small>নতুন মার্চেন্ট অনবোর্ডিং</small><h2>দোকানের ডিজিটাল খাতা খুলুন</h2></div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="field full">
                    <label>দোকানের নাম <span className="req">*</span> <span className="en">(Shop Name)</span></label>
                    <div className="input-shell"><span className="leading">▥</span><input type="text" placeholder="উদাঃ ভাই ভাই স্টোর / জননী মুদি ভান্ডার" required /></div>
                  </div>

                  <div className="field full">
                    <label>দোকানের ধরন <span className="req">*</span> <span className="en">(Business Type)</span></label>
                    <div className="business-types">
                      {businessTypes.map((type,index)=><button type="button" className={index===selectedType?"type-btn selected":"type-btn"} onClick={()=>setSelectedType(index)} key={type}>{type}</button>)}
                    </div>
                  </div>

                  <div className="field">
                    <label>দোকানদারের নাম <span className="req">*</span> <span className="en">(Owner Name)</span></label>
                    <div className="input-shell"><span className="leading">♙</span><input type="text" placeholder="আপনার পুরো নাম লিখুন" required /></div>
                  </div>

                  <div className="field">
                    <label>মোবাইল নম্বর (বিকাশ/নগদ) <span className="req">*</span></label>
                    <div className="input-shell"><span className="phone-code">🇧🇩 +৮৮০</span><input type="tel" placeholder="01XXXXXXXXX" required /></div>
                    <div className="helper">ⓘ এই নম্বরেই ওটিপি কোড এবং বাকি আদায়ের হিসাব যাবে</div>
                  </div>

                  <div className="field">
                    <label>জেলা নির্বাচন করুন <span className="req">*</span></label>
                    <div className="input-shell"><span className="leading">⌾</span><select value={district} onChange={e=>setDistrict(e.target.value)} required><option value="">জেলা বেছে নিন</option><option>ঢাকা</option><option>চট্টগ্রাম</option><option>রাজশাহী</option><option>খুলনা</option><option>সিলেট</option><option>বরিশাল</option><option>রংপুর</option><option>ময়মনসিংহ</option></select></div>
                  </div>

                  <div className="field">
                    <label>বাজার বা এলাকার নাম <span className="req">*</span></label>
                    <div className="input-shell"><span className="leading">⌖</span><input type="text" placeholder="উদাঃ চকবাজার, নিউ মার্কেট, মিরপুর-১০" required /></div>
                  </div>
                </div>

                <label className="terms"><input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} /><span>আমি দোকান ভাই-এর <strong>ব্যবহারের শর্তাবলী</strong> এবং <strong>গোপনীয়তা নীতি</strong> মেনে নিয়ে সম্মত হচ্ছি</span></label>
                <button className="submit-btn" disabled={!agreed}>এগিয়ে যান: ওটিপি কোড পান &nbsp; ➜</button>
              </form>
            </div>

            <div className="login-strip"><span>ইতিমধ্যে খাতা খুলেছেন? <strong>এখানে লগ ইন করুন</strong></span><span className="support">🎧 রেজিস্ট্রেশনে সমস্যা? কল করুন: <strong>০৯৬১২-দোকান</strong></span></div>
          </section>
        </section>

        <section className="bottom-features">
          {bottomItems.map(item => <article className="bottom-feature" key={item.title}><div className="icon">{item.icon}</div><div><h4>{item.title}</h4><p>{item.text}</p></div></article>)}
        </section>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
