import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import data from '../lib/data'
import { useProfile } from '../context/ProfileContext'
import { Card, Button, Input, Badge, EmptyState, Spinner, Drawer } from '../components/ui'
import ReminderSheet from '../components/ReminderSheet'
import { SearchIcon, MoneyIcon, AlertIcon, ChevronRightIcon, UsersIcon } from '../components/icons'
import { formatBDT, initials, avatarColor, formatDateTime, daysAgo } from '../lib/format'

export default function HisabScreen() {
  const [customers, setCustomers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [remindFor, setRemindFor] = useState(null)
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
    return () => window.removeEventListener('dokanbhai:dbchange', handler)
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = customers.filter((c) => Number(c.balance || 0) > 0)
    if (q) list = list.filter((c) => c.name?.toLowerCase().includes(q) || c.phone?.includes(q))
    list.sort((a, b) => (b.balance || 0) - (a.balance || 0))
    return list
  }, [customers, search])

  const totalOutstanding = useMemo(() => customers.reduce((s, c) => s + Number(c.balance || 0), 0), [customers])
  const totalCustomersWithDue = useMemo(() => customers.filter((c) => c.balance > 0).length, [customers])

  const txsForCustomer = (cid) => transactions.filter((t) => t.customer_id === cid).sort((a, b) => new Date(b.date) - new Date(a.date))

  const onPay = async () => {
    if (!selected) return
    const amt = Number(paymentAmount || 0)
    if (amt <= 0) return
    await data.recordPayment({ customer_id: selected.id, amount: amt })
    setPaymentAmount('')
    setSelected(null)
    load()
  }

  if (loading) return <div className="flex items-center justify-center py-20 text-steel-400"><Spinner size={28} /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-steel-400">বাকি খাতা / Credit Ledger</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-steel-800">হিসাব খাতা (Hisab Book)</h1>
          <p className="text-sm text-steel-500 mt-1">Track outstanding balances and payment history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-red-500 to-red-700 text-white rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-white/80">মোট বকেয়া (Total Outstanding)</p>
          <p className="text-2xl font-bold mt-2">{formatBDT(totalOutstanding)}</p>
          <p className="text-xs text-white/80 mt-1">All customers combined</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-white/80">বাকি কাস্টমার</p>
          <p className="text-2xl font-bold mt-2">{totalCustomersWithDue}</p>
          <p className="text-xs text-white/80 mt-1">Active credit accounts</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-white/80">পরিষ্কার (Fully Paid)</p>
          <p className="text-2xl font-bold mt-2">{customers.length - totalCustomersWithDue}</p>
          <p className="text-xs text-white/80 mt-1">Clear customers</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="relative">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers with dues…" className="pl-9" />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={<AlertIcon size={32} />}
            title="No outstanding dues"
            description="All customers have cleared their balances."
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const txs = txsForCustomer(c.id)
            const lastSale = txs.find((t) => t.type === 'sale')
            return (
              <Card key={c.id} className="p-4 hover:border-brand-200 transition cursor-pointer" onClick={() => setSelected(c)}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full text-white flex items-center justify-center font-bold" style={{ background: avatarColor(c.name) }}>
                    {initials(c.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-steel-800 truncate">{c.name}</p>
                    <p className="text-xs text-steel-500">{c.phone || 'No phone'} {lastSale && `· last sale ${daysAgo(lastSale.date)}`}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-red-600">{formatBDT(c.balance)}</p>
                    <Badge color="red">বাকি (Due)</Badge>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setRemindFor(c) }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600"
                    title="বাকি মনে করান / Send reminder"
                  >
                    মনে করান
                  </button>
                  <ChevronRightIcon size={18} className="text-steel-400" />
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Drawer
        open={!!selected}
        onClose={() => { setSelected(null); setPaymentAmount('') }}
        title={selected?.name || 'Customer'}
        width="max-w-lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full text-white flex items-center justify-center font-bold text-lg" style={{ background: avatarColor(selected.name) }}>
                {initials(selected.name)}
              </div>
              <div>
                <p className="font-bold text-steel-800 text-lg">{selected.name}</p>
                <p className="text-sm text-steel-500">{selected.phone || '—'}</p>
              </div>
            </div>

            <Card className="p-4 bg-gradient-to-br from-red-500 to-red-700 text-white border-0">
              <p className="text-xs uppercase tracking-wide text-white/80">বকেয়া বাকি (Outstanding Balance)</p>
              <p className="text-3xl font-extrabold mt-1">{formatBDT(selected.balance)}</p>
            </Card>

            <Card className="p-3 bg-brand-50 border-brand-200">
              <p className="text-xs uppercase tracking-wide text-brand-700 font-semibold mb-2">পেমেন্ট রেকর্ড (Record Payment)</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  placeholder="Amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
                <Button onClick={onPay} disabled={!paymentAmount || Number(paymentAmount) <= 0}>
                  <MoneyIcon size={16} /> Pay
                </Button>
              </div>
              <Button variant="success" onClick={() => setRemindFor(selected)} className="w-full mt-2">
                মনে করান (WhatsApp / SMS)
              </Button>
            </Card>

            <div>
              <p className="text-xs uppercase tracking-wide text-steel-400 font-semibold mb-2">পূর্ণ হিসাব (Full Hisab)</p>
              <ul className="space-y-1.5 max-h-80 overflow-y-auto">
                {txsForCustomer(selected.id).map((t) => (
                  <li key={t.id} className="flex items-center justify-between p-2.5 bg-steel-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-steel-800">
                        {t.type === 'sale' ? (t.product_name || 'Sale') : 'Payment received'}
                      </p>
                      <p className="text-xs text-steel-500">{formatDateTime(t.date)} {t.note && `· ${t.note}`}</p>
                    </div>
                    <div className="text-right">
                      {t.type === 'sale' ? (
                        <>
                          <p className="text-sm font-bold text-steel-800">{formatBDT(t.amount)}</p>
                          {Number(t.amount) - Number(t.paid_amount || 0) > 0 && (
                            <p className="text-xs text-red-600">বাকি {formatBDT(Number(t.amount) - Number(t.paid_amount || 0))}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm font-bold text-emerald-600">- {formatBDT(t.amount)}</p>
                      )}
                    </div>
                  </li>
                ))}
                {txsForCustomer(selected.id).length === 0 && <li className="text-sm text-steel-500 text-center py-4">No transactions.</li>}
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