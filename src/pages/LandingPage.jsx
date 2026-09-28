import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SiteHeader from '../components/SiteHeader'
import { enterDemo } from '../lib/hardwareDemo'
import { reloadStore } from '../lib/localDb'

const features = [
  { tone: 'bg-[#d9f9eb] text-[#00795a]', title: 'ডিজিটাল হাল খাতা', text: 'কোন কাস্টমারের কাছে কত টাকা বাকি তার হিসাব রাখুন। খাতা হারানোর ভয় নেই।' },
  { tone: 'bg-[#fff2bf] text-[#db8a00]', title: 'দ্রুত পিওএস ও ক্যাশ মেশো', text: 'কাস্টমারের কার্ট থেকে দ্রুত ইনভয়েস তৈরি করুন। ক্যাশ, বাকি ও অনলাইন পেমেন্ট আলাদা রাখুন।' },
  { tone: 'bg-[#e1e7ff] text-[#5865d9]', title: 'স্টক ও এক্সপায়ারি অ্যালার্ট', text: 'যে কোনো পণ্যের স্টক ফুরিয়ে যাওয়ার আগেই সতর্কতা পান।' },
  { tone: 'bg-[#d9f9eb] text-[#00795a]', title: 'অফলাইন খাতা', text: 'দোকানে ইন্টারনেট না থাকলেও এই ডিভাইসে হিসাব রাখা যায়। নেট এলে ক্লাউড সেভ হয়।' },
]

export default function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const appHref = user?.isAdmin ? '/admin/dashboard' : user ? '/dashboard' : '/register'
  const startTour = () => {
    enterDemo()
    reloadStore()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white text-[#091020]" style={{ fontFamily: '"Hind Siliguri", Inter, sans-serif' }}>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="relative z-10 mx-auto grid w-[min(1160px,calc(100%-1.5rem))] items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-xl">
              <p className="w-fit rounded-full border border-[#c7f0df] bg-[#f2fcf8] px-3 py-1 text-xs font-semibold text-[#00815d]">স্মার্ট রিটেল ব্রেন ও ডিজিটাল মুদি সমাধান</p>
              <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-6xl">দোকান-ভাই</h1>
              <h2 className="mt-4 text-2xl font-bold leading-snug">একটি স্মার্ট রিটেল ব্রেন যা আপনার মুদি দোকানের প্রতিটি টাকা-পয়সার হিসাব রাখবে।</h2>
              <p className="mt-4 text-[15px] leading-8 text-[#526176]">আপনার বাকি খাতা, দৈনিক ক্যাশ বিক্রি ও মজুদ পণ্যের স্টক এখন এক প্ল্যাটফর্মে। সাধারণ বাংলাদেশি মুদি ও ডিজিটাল দোকানের জন্য তৈরি।</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to={appHref} className="inline-flex min-h-[44px] items-center rounded-xl bg-[#006b4f] px-5 font-semibold text-white">{user ? 'ড্যাশবোর্ডে যান' : 'নতুন একাউন্ট খুলুন'}</Link>
                <Link to="/login" className="inline-flex min-h-[44px] items-center rounded-xl border border-[#c7f0df] px-5 font-semibold text-[#006b4f]">লগ ইন করুন</Link>
                <Link to="/admin/login" className="inline-flex min-h-[44px] items-center rounded-xl border border-[#d9deea] px-5 font-semibold text-[#273246]">অ্যাডমিন লগইন</Link>
              </div>
              <div className="mt-8 grid max-w-lg grid-cols-3 gap-4 border-t border-[#e7ebef] pt-5 text-sm">
                <div><strong className="block text-lg">খাতা</strong><span className="text-[#6f7b8d]">বাকি ও বিক্রি</span></div>
                <div><strong className="block text-lg text-[#006b4f]">POS</strong><span className="text-[#6f7b8d]">নগদ / বাকি</span></div>
                <div><strong className="block text-lg text-[#d97706]">স্টক</strong><span className="text-[#6f7b8d]">কেজি ও পিস</span></div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <ShopFront />
              <button type="button" onClick={startTour} className="mt-5 inline-flex min-h-[52px] items-center rounded-2xl bg-[#006b4f] px-8 text-lg font-bold text-white">
                দোকান ঘুরে দেখুন
              </button>
            </div>
          </div>
        </section>

        <section className="border-t border-[#f2f4f6] px-4 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mx-auto w-fit rounded-full border border-[#c7f0df] bg-[#f2fcf8] px-3 py-1 text-xs font-semibold text-[#00815d]">দোকানের সম্পূর্ণ নিয়ন্ত্রণ</p>
            <h2 className="mt-3 text-3xl font-bold">মুদি ব্যবসার চার প্রধান স্তম্ভ</h2>
            <p className="mt-1 text-sm text-[#788394]">হাল খাতার জায়গায় দোকানের বিক্রি, বাকি ও স্টক একসাথে।</p>
          </div>
          <div className="mx-auto mt-10 grid w-[min(1160px,100%)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((item) => (
              <article key={item.title} className="rounded-2xl border border-[#e3e8ed] bg-[#fbfcfd] p-5">
                <div className={`grid h-10 w-10 place-items-center rounded-xl text-sm font-bold ${item.tone}`}>৳</div>
                <h3 className="mt-4 font-bold">{item.title}</h3>
                <p className="mt-1 text-xs leading-6 text-[#687588]">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-[#00644b] to-[#062035] px-6 py-12 text-white">
          <div className="mx-auto flex w-[min(1160px,100%)] flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-[#ffd02a]">সহজ • নির্ভর • বিশ্বস্ত</p>
              <h2 className="mt-1 text-3xl font-bold">আজই আপনার দোকানকে ডিজিটাল বানান</h2>
            </div>
            <Link to="/register" className="inline-flex min-h-[44px] items-center rounded-xl bg-white px-5 font-semibold text-[#00644b]">রেজিস্ট্রেশন শুরু করুন</Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-[#f2f4f6] px-4 py-6 text-xs text-[#738095]">
        <div className="mx-auto flex w-[min(1160px,100%)] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p><strong className="text-[#17202e]">DOKANBHAI</strong> <span className="mx-2">|</span> স্মার্ট রিটেল — ২০২৬</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/login">লগইন</Link>
            <Link to="/register">রেজিস্ট্রেশন</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ShopFront() {
  return (
    <div className="dokan-stage" aria-hidden="true">
      <div className="dokan-roof" />
      <div className="dokan-awning">
        <span /><span /><span /><span /><span /><span />
      </div>
      <div className="dokan-sign">দোকানভাই</div>
      <div className="dokan-body">
        <div className="dokan-window">
          <div className="dokan-shelf">
            <i className="box green" />
            <i className="box yellow" />
            <i className="box blue" />
            <i className="box sack" />
          </div>
          <div className="dokan-shelf lower">
            <i className="box sack" />
            <i className="box green" />
            <i className="box yellow" />
          </div>
        </div>
        <div className="dokan-door">
          <span className="knob" />
        </div>
      </div>
      <div className="dokan-counter">
        <span className="ledger" />
        <span className="coin">৳</span>
      </div>
      <div className="dokan-tag"><span /></div>
    </div>
  )
}
