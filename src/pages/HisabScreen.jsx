import { useEffect, useMemo, useState } from 'react'
import data from '../lib/data'
import { useProfile } from '../context/ProfileContext'
import { Button, Input, EmptyState, Spinner, Drawer } from '../components/ui'
import ReminderSheet from '../components/ReminderSheet'
import { SearchIcon, MoneyIcon } from '../components/icons'
import { formatBDT, initials, formatDateTime, daysAgo } from '../lib/format'

export default function HisabScreen() {
  const [customers, setCustomers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [remindFor, setRemindFor] = useState(null)
  const [payError, setPayError] = useState('')
  const { profile } = useProfile()

  const load = async () => {
    setLoading(true)
    const [c, t] = await Promise.all([data.list('customers'), data.list('transactions')])
    setCustomers(c); setTransactions(t)
    setLoading(false)
  }
  useEffect(() => {
    load()
    const handler = () => load()
    window.addEventListener('dokanbhai:dbchange', handler)
    window.addEventListener('dokanbhai:tenantchange', handler)
    return () => {
      window.removeEventListener('dokanbhai:dbchange', handler)
      window.removeEventListener('dokanbhai:tenantchange', handler)
    }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = customers.filter((c) => Number(c.balance || 0) > 0)
    if (q) list = list.filter((c) => c.name?.toLowerCase().includes(q) || c.phone?.includes(q))
    list.sort((a, b) => (b.balance || 0) - (a.balance || 0))
    return list
  }, [customers, search])

  const totalOutstanding = useMemo(() => customers.reduce((s, c) => s + Number(c.balance || 0), 0), [customers])
  const totalCustomersWithDue = useMemo(() => customers.filter((c) => Number(c.balance || 0) > 0).length, [customers])
  const cleared = customers.length - totalCustomersWithDue
  const shopName = profile?.store?.name || ''

  const txsForCustomer = (cid) => transactions.filter((t) => t.customer_id === cid).sort((a, b) => new Date(b.date) - new Date(a.date))

  const onPay = async () => {
    if (!selected) return
    const amt = Number(paymentAmount || 0)
    if (amt <= 0) return
    setPayError('')
    try {
      await data.recordPayment({ customer_id: selected.id, amount: amt })
      setPaymentAmount('')
      setSelected(null)
      load()
    } catch (err) {
      setPayError('পেমেন্ট সংরক্ষণ ব্যর্থ / Failed to record payment: ' + (err?.message || err))
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20 text-steel-400"><Spinner size={28} /></div>

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b7c72]">বাকি খাতা</p>
        <h1 className="mt-1 text-2xl font-bold text-[#062035] sm:text-3xl">হিসাব খাতা</h1>
        <p className="mt-1 text-sm text-[#526176]">{shopName ? `${shopName} · ` : ''}কার কাছে কত বাকি, আর কবে শেষ বিক্রি হয়েছে।</p>
      </div>

      <section className="rounded-3xl bg-[#062035] p-5 text-white">
        <p className="text-sm text-[#8bc6b4]">মোট বকেয়া</p>
        <p className="mt-1 text-4xl font-bold tracking-tight">{formatBDT(totalOutstanding)}</p>
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-[#ffd29a]">বাকি কাস্টমার</p>
            <p className="mt-1 text-xl font-bold">{totalCustomersWithDue}</p>
          </div>
          <div>
            <p className="text-[#8bc6b4]">পরিশোধিত</p>
            <p className="mt-1 text-xl font-bold">{cleared}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-white/60">মোট কাস্টমার</p>
            <p className="mt-1 text-xl font-bold">{customers.length}</p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#d5e2db] bg-white">
        <div className="border-b border-[#e7eeea] p-4">
          <div className="relative">
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7c72]" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="নাম বা মোবাইল খুঁজুন" className="border-[#d5e2db] bg-[#f7faf8] pl-9" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="বাকি নেই" description="সব কাস্টমারের হিসাব পরিষ্কার।" />
        ) : (
          <ul>
            {filtered.map((c) => {
              const txs = txsForCustomer(c.id)
              const lastSale = txs.find((t) => t.type === 'sale')
              return (
                <li key={c.id} className="border-b border-[#eef3f0] last:border-0">
                  <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
                    <button type="button" onClick={() => setSelected(c)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e7f6ef] text-sm font-bold text-[#006b4f]">
                        {initials(c.name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-[#062035]">{c.name}</span>
                        <span className="mt-0.5 block text-xs text-[#6b7c72]">
                          {c.phone || 'মোবাইল নেই'}
                          {lastSale ? ` · শেষ বিক্রি ${daysAgo(lastSale.date)}` : ''}
                        </span>
                      </span>
                    </button>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="text-lg font-bold text-[#9a3412]">{formatBDT(c.balance)}</p>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9a3412]">বাকি</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRemindFor(c)}
                        className="inline-flex min-h-[44px] items-center rounded-xl border border-[#d5e2db] px-3 text-sm font-semibold text-[#006b4f] hover:bg-[#f4faf7]"
                      >
                        মনে করান
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <Drawer
        open={!!selected}
        onClose={() => { setSelected(null); setPaymentAmount(''); setPayError('') }}
        title="কাস্টমার হিসাব"
        width="max-w-lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#062035] p-4 text-white">
              <p className="text-sm text-[#8bc6b4]">{selected.phone || 'মোবাইল নেই'}</p>
              <p className="mt-1 text-xl font-bold">{selected.name}</p>
              <p className="mt-4 text-xs uppercase tracking-wide text-white/60">বকেয়া</p>
              <p className="text-3xl font-bold">{formatBDT(selected.balance)}</p>
            </div>

            <div className="rounded-2xl border border-[#d5e2db] p-4">
              <p className="text-sm font-semibold text-[#062035]">পেমেন্ট নিন</p>
              {payError && <p role="alert" className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{payError}</p>}
              <div className="mt-3 flex gap-2">
                <Input
                  type="number"
                  min="0"
                  placeholder="টাকার পরিমাণ"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
                <Button onClick={onPay} disabled={!paymentAmount || Number(paymentAmount) <= 0}>
                  <MoneyIcon size={16} /> জমা
                </Button>
              </div>
              <Button variant="secondary" onClick={() => setRemindFor(selected)} className="mt-2 w-full">
                মনে করান · WhatsApp / SMS
              </Button>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-[#062035]">খাতার বিবরণ</p>
              <ul className="max-h-80 space-y-2 overflow-y-auto">
                {txsForCustomer(selected.id).map((t) => (
                  <li key={t.id} className="flex items-start justify-between gap-3 rounded-2xl bg-[#f7faf8] px-3 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#062035]">
                        {t.type === 'sale' ? (t.product_name || 'বিক্রি') : 'জমা'}
                      </p>
                      <p className="mt-0.5 text-xs text-[#6b7c72]">{formatDateTime(t.date)}{t.note ? ` · ${t.note}` : ''}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      {t.type === 'sale' ? (
                        <>
                          <p className="text-sm font-bold text-[#062035]">{formatBDT(t.amount)}</p>
                          {Number(t.amount) - Number(t.paid_amount || 0) > 0 && (
                            <p className="text-xs text-[#9a3412]">বাকি {formatBDT(Number(t.amount) - Number(t.paid_amount || 0))}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm font-bold text-[#006b4f]">− {formatBDT(t.amount)}</p>
                      )}
                    </div>
                  </li>
                ))}
                {txsForCustomer(selected.id).length === 0 && <li className="py-6 text-center text-sm text-[#6b7c72]">এই কাস্টমারের কোনো এন্ট্রি নেই।</li>}
              </ul>
            </div>
          </div>
        )}
      </Drawer>

      <ReminderSheet
        open={!!remindFor}
        onClose={() => setRemindFor(null)}
        customer={remindFor}
        store={profile?.store}
      />
    </div>
  )
}