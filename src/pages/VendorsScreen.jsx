import { useEffect, useState } from 'react'
import data from '../lib/data'
import { Card, Button, Modal, Input, Field, Textarea, Badge, EmptyState, Spinner, Drawer } from '../components/ui'
import { PlusIcon, EditIcon, TrashIcon, TruckIcon, PhoneIcon, PackageIcon } from '../components/icons'
import { formatBDT, initials, avatarColor, formatDate } from '../lib/format'

const blank = () => ({ name: '', phone: '', address: '', note: '' })

export default function VendorsScreen() {
  const [vendors, setVendors] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [detail, setDetail] = useState(null)

  const load = async () => {
    setLoading(true)
    const [v, p] = await Promise.all([data.list('vendors'), data.list('products')])
    setVendors(v); setProducts(p)
    setLoading(false)
  }
  useEffect(() => {
    load()
    const handler = () => load()
    window.addEventListener('dokanbhai:dbchange', handler)
    return () => window.removeEventListener('dokanbhai:dbchange', handler)
  }, [])

  const onSave = async () => {
    if (!editing.name?.trim()) return
    const payload = { name: editing.name.trim(), phone: editing.phone?.trim() || '', address: editing.address?.trim() || '', note: editing.note || '' }
    if (editing.id) await data.update('vendors', editing.id, payload)
    else await data.insert('vendors', payload)
    setEditing(null); load()
  }
  const onDelete = async (id) => {
    if (!confirm('Delete this vendor?')) return
    await data.remove('vendors', id); load()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-steel-400">সরবরাহকারী / Suppliers</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-steel-800">সরবরাহকারী (Vendors)</h1>
          <p className="text-sm text-steel-500 mt-1">{vendors.length} suppliers</p>
        </div>
        <Button onClick={() => setEditing(blank())}><PlusIcon size={16} /> New vendor</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-steel-400"><Spinner size={28} /></div>
      ) : vendors.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<TruckIcon size={32} />} title="No vendors yet" action={
            <Button onClick={() => setEditing(blank())}><PlusIcon size={16} /> Add vendor</Button>
          } />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((v) => {
            const items = products.filter((p) => p.vendor_id === v.id)
            return (
              <Card key={v.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold" style={{ background: avatarColor(v.name) }}>
                      {initials(v.name)}
                    </div>
                    <div>
                      <p className="font-bold text-steel-800">{v.name}</p>
                      {v.phone && <p className="text-xs text-steel-500 inline-flex items-center gap-1"><PhoneIcon size={12} /> {v.phone}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setDetail(v)} className="p-2 rounded-lg text-steel-500 hover:bg-steel-100">View</button>
                    <button onClick={() => setEditing(v)} className="p-2 rounded-lg text-steel-500 hover:bg-steel-100"><EditIcon size={14} /></button>
                    <button onClick={() => onDelete(v.id)} className="p-2 rounded-lg text-steel-500 hover:bg-red-50 hover:text-red-600"><TrashIcon size={14} /></button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge color="purple">{items.length} products</Badge>
                  {v.address && <Badge color="gray">{v.address}</Badge>}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit vendor' : 'New vendor'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={onSave}>Save</Button>
          </div>
        }
      >
        {editing && (
          <div className="space-y-3">
            <Field label="Name"><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Supplier name" /></Field>
            <Field label="Phone"><Input value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} placeholder="Optional" /></Field>
            <Field label="Address"><Input value={editing.address} onChange={(e) => setEditing({ ...editing, address: e.target.value })} placeholder="Optional" /></Field>
            <Field label="Note"><Textarea rows={2} value={editing.note || ''} onChange={(e) => setEditing({ ...editing, note: e.target.value })} /></Field>
          </div>
        )}
      </Modal>

      <Drawer
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.name || 'Vendor'}
      >
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full text-white flex items-center justify-center font-bold text-lg" style={{ background: avatarColor(detail.name) }}>
                {initials(detail.name)}
              </div>
              <div>
                <p className="font-bold text-steel-800 text-lg">{detail.name}</p>
                {detail.phone && <p className="text-sm text-steel-500"><PhoneIcon size={14} className="inline" /> {detail.phone}</p>}
              </div>
            </div>
            {detail.address && (
              <div>
                <p className="text-xs uppercase tracking-wide text-steel-400 font-semibold">Address</p>
                <p className="text-sm text-steel-700">{detail.address}</p>
              </div>
            )}
            {detail.note && (
              <div>
                <p className="text-xs uppercase tracking-wide text-steel-400 font-semibold">Note</p>
                <p className="text-sm text-steel-700">{detail.note}</p>
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-wide text-steel-400 font-semibold mb-2">Supplied Products</p>
              <ul className="space-y-2">
                {products.filter((p) => p.vendor_id === detail.id).map((p) => (
                  <li key={p.id} className="flex items-center justify-between p-2.5 bg-steel-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <PackageIcon size={14} className="text-steel-400" />
                      <span className="text-sm font-medium text-steel-700">{p.name}</span>
                    </div>
                    <span className="text-sm font-bold text-steel-800">{formatBDT(p.sale_price)}</span>
                  </li>
                ))}
                {products.filter((p) => p.vendor_id === detail.id).length === 0 && (
                  <li className="text-sm text-steel-500">No products yet.</li>
                )}
              </ul>
            </div>
            <div className="pt-3 border-t border-steel-100 text-xs text-steel-400">
              Added {formatDate(detail.created_at)}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}