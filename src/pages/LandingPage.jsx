import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SiteHeader from '../components/SiteHeader'

const features = [
  { tone: 'bg-[#d9f9eb] text-[#00795a]', title: 'ডিজিটাল হাল খাতা', text: 'কোন কাস্টমারের কাছে কত টাকা বাকি তার হিসাব রাখুন। খাতা হারানোর ভয় নেই।' },
  { tone: 'bg-[#fff2bf] text-[#db8a00]', title: 'দ্রুত পিওএস ও ক্যাশ মেশো', text: 'কাস্টমারের কার্ট থেকে দ্রুত ইনভয়েস তৈরি করুন। ক্যাশ, বাকি ও অনলাইন পেমেন্ট আলাদা রাখুন।' },
  { tone: 'bg-[#e1e7ff] text-[#5865d9]', title: 'স্টক ও এক্সপায়ারি অ্যালার্ট', text: 'যে কোনো পণ্যের স্টক ফুরিয়ে যাওয়ার আগেই সতর্কতা পান।' },
  { tone: 'bg-[#d9f9eb] text-[#00795a]', title: 'অফলাইন খাতা', text: 'দোকানে ইন্টারনেট না থাকলেও এই ডিভাইসে হিসাব রাখা যায়। নেট এলে ক্লাউড সেভ হয়।' },
]

export default function LandingPage() {
  const { user } = useAuth()
  const appHref = user?.isAdmin ? '/admin/dashboard' : user ? '/dashboard' : '/register'

  return (
    <div className="min-h-screen bg-white text-[#091020]" style={{ fontFamily: '"Hind Siliguri", Inter, sans-serif' }}>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-1/2 md:block" aria-hidden="true">
            <svg viewBox="0 0 700 570" className="h-full w-full opacity-80">
              <g fill="none" stroke="#cad8df" strokeWidth="1">
                <line x1="120" y1="105" x2="310" y2="45" />
                <line x1="310" y1="45" x2="520" y2="125" />
                <line x1="120" y1="105" x2="80" y2="310" />
                <line x1="275" y1="385" x2="520" y2="125" />
                <line x1="520" y1="125" x2="610" y2="315" />
                <line x1="390" y1="230" x2="610" y2="315" />
              </g>
              <g>
                <circle cx="120" cy="105" r="4" fill="#8bc6b4" />
                <circle cx="310" cy="45" r="4" fill="#8e86e8" />
                <circle cx="520" cy="125" r="4" fill="#56a890" />
                <circle cx="390" cy="230" r="6" fill="#8e86e8" />
                <circle cx="610" cy="315" r="5" fill="#56a890" />
              </g>
            </svg>
          </div>
          <div className="relative z-10 mx-auto flex min-h-[520px] w-[min(1160px,calc(100%-1.5rem))] items-center py-12">
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
