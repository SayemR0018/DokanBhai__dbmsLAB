import { useEffect, useMemo, useState } from 'react'
import data from '../lib/data'
import { useProfile } from '../context/ProfileContext'
import { Card, Button, Input, Field, Modal, Textarea, Badge, EmptyState, Spinner, Drawer } from '../components/ui'
import ReminderSheet from '../components/ReminderSheet'
import { PlusIcon, EditIcon, TrashIcon, UsersIcon, MoneyIcon, SearchIcon, PhoneIcon } from '../components/icons'
import { formatBDT, initials, avatarColor, formatDate, formatDateTime, daysAgo } from '../lib/format'

const blank = () => ({ name: '', phone: '', address: '', note: '' })

export default function CustomersScreen() {
  const [customers, setCustomers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [detail, setDetail] = useState(null)
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
    let list = [...customers]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((c) => c.name?.toLowerCase().includes(q) || c.phone?.includes(q))
    }
    list.sort((a, b) => (b.balance || 0) - (a.balance || 0))
    return list
  }, [customers, search])

  const totalDue = useMemo(() => customers.reduce((s, c) => s + Number(c.balance || 0), 0), [customers])

  const onSave = async () => {
    if (!editing.name?.trim()) return
    const payload = { name: editing.name.trim(), phone: editing.phone?.trim() || '', address: editing.address?.trim() || '', note: editing.note || '' }
    if (editing.id) await data.update('customers', editing.id, payload)
    else await data.insert('customers', { ...payload, balance: 0 })
    setEditing(null); load()
  }
  const onDelete = async (id) => {
    if (!confirm('Delete this customer? Their history will remain.')) return
    await data.remove('customers', id); load()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-steel-400">কাস্টমার / Customers</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-steel-800">কাস্টমার তালিকা (Customer Directory)</h1>
          <p className="text-sm text-steel-500 mt-1">{customers.length} customers · {formatBDT(totalDue)} মোট বাকি</p>
        </div>
        <Button onClick={() => setEditing(blank())}><PlusIcon size={16} /> New customer</Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or phone…" className="pl-9" />
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-steel-400"><Spinner size={28} /></div>
      ) : filtered.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<UsersIcon size={32} />} title="No customers yet" action={
            <Button onClick={() => setEditing(blank())}><PlusIcon size={16} /> Add customer</Button>
          } />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full text-white flex items-center justify-center font-bold" style={{ background: avatarColor(c.name) }}>
                  {initials(c.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-steel-800 truncate">{c.name}</p>
                  {c.phone && <p className="text-xs text-steel-500 inline-flex items-center gap-1"><PhoneIcon size={12} /> {c.phone}</p>}
                </div>
                <div className="flex gap-1">
                  {c.balance > 0 && (
                    <button
                      onClick={() => setRemindFor(c)}
                      className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 text-xs font-semibold"
                      title="বাকি মনে করান / Send reminder"
                    >
                      মনে করান
                    </button>
                  )}
                  <button onClick={() => setDetail(c)} className="p-2 rounded-lg text-steel-500 hover:bg-steel-100 text-xs font-semibold">View</button>
                  <button onClick={() => setEditing(c)} className="p-2 rounded-lg text-steel-500 hover:bg-steel-100"><EditIcon size={14} /></button>
                  <button onClick={() => onDelete(c.id)} className="p-2 rounded-lg text-steel-500 hover:bg-red-50 hover:text-red-600"><TrashIcon size={14} /></button>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-steel-400 uppercase tracking-wide font-semibold">বাকি (Balance)</span>
                {c.balance > 0 ? (
                  <Badge color="red">{formatBDT(c.balance)} বাকি</Badge>
                ) : (
                  <Badge color="green">পরিষ্কার (Clear)</Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit customer' : 'New customer'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={onSave}>Save</Button>
          </div>
        }
      >
        {editing && (
          <div className="space-y-3">
            <Field label="Name"><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="Phone"><Input value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></Field>
            <Field label="Address"><Input value={editing.address} onChange={(e) => setEditing({ ...editing, address: e.target.value })} /></Field>
            <Field label="Note"><Textarea rows={2} value={editing.note || ''} onChange={(e) => setEditing({ ...editing, note: e.target.value })} /></Field>
          </div>
        )}
      </Modal>

      <Drawer
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.name || 'Customer'}
        width="max-w-lg"
      >
        {detail && <CustomerDetail customer={detail} transactions={transactions} onUpdate={load} onRemind={() => setRemindFor(detail)} />}
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

function CustomerDetail({ customer, transactions, onUpdate, onRemind }) {
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentNote, setPaymentNote] = useState('')
  const [saving, setSaving] = useState(false)
  const live = customer
  const txs = transactions.filter((t) => t.customer_id === customer.id).sort((a, b) => new Date(b.date) - new Date(a.date))

  const onRecordPayment = async () => {
    const amt = Number(paymentAmount || 0)
    if (amt <= 0) return
    setSaving(true)
    await data.recordPayment({ customer_id: customer.id, amount: amt, note: paymentNote })
    setPaymentAmount(''); setPaymentNote(''); setSaving(false)
    onUpdate?.()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full text-white flex items-center justify-center font-bold text-lg" style={{ background: avatarColor(customer.name) }}>
          {initials(customer.name)}
        </div>
        <div>
          <p className="font-bold text-steel-800 text-lg">{customer.name}</p>
          {customer.phone && <p className="text-sm text-steel-500"><PhoneIcon size={14} className="inline" /> {customer.phone}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 bg-red-50 border-red-100">
          <p className="text-[10px] uppercase tracking-wide text-red-600 font-semibold">মোট বাকি (Total Due)</p>
          <p className="text-xl font-bold text-red-700">{formatBDT(customer.balance)}</p>
        </Card>
        <Card className="p-3 bg-emerald-50 border-emerald-100">
          <p className="text-[10px] uppercase tracking-wide text-emerald-600 font-semibold">মোট কেনাকাটা (Total Purchases)</p>
          <p className="text-xl font-bold text-emerald-700">
            {formatBDT(txs.filter((t) => t.type === 'sale').reduce((s, t) => s + Number(t.amount || 0), 0))}
          </p>
        </Card>
      </div>

      {customer.address && (
        <div>
          <p className="text-xs uppercase tracking-wide text-steel-400 font-semibold">Address</p>
          <p className="text-sm text-steel-700">{customer.address}</p>
        </div>
      )}

      {Number(customer.balance || 0) > 0 && (
        <Card className="p-3 bg-brand-50 border-brand-200">
          <p className="text-xs uppercase tracking-wide text-brand-700 font-semibold mb-2">পেমেন্ট রেকর্ড (Record Payment)</p>
          <div className="flex flex-col gap-2">
            <Input type="number" min="0" placeholder="Amount" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
            <Input placeholder="Note (optional)" value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} />
            <Button onClick={onRecordPayment} disabled={saving || Number(paymentAmount) <= 0} className="w-full">
              <MoneyIcon size={16} /> {saving ? 'Saving…' : 'Record payment'}
            </Button>
            <Button variant="success" onClick={() => onRemind?.()} className="w-full">
              মনে করান (WhatsApp / SMS)
            </Button>
          </div>
        </Card>
      )}

      <div>
        <p className="text-xs uppercase tracking-wide text-steel-400 font-semibold mb-2">হিসাব খাতা (Hisab Ledger)</p>
        <ul className="space-y-1.5">
          {txs.map((t) => (
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
          {txs.length === 0 && <li className="text-sm text-steel-500 text-center py-4">No transactions yet.</li>}
        </ul>
      </div>
    </div>
  )
}