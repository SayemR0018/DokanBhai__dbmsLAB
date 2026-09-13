import { useEffect, useState } from 'react'
import data from '../lib/data'
import { Card, Button, Modal, Input, Field, Badge, EmptyState, Spinner } from '../components/ui'
import { PlusIcon, EditIcon, TrashIcon, TagIcon } from '../components/icons'

const palette = ['#dd5a1d', '#2563eb', '#16a34a', '#9333ea', '#0ea5e9', '#dc2626', '#ca8a04', '#0891b2', '#db2777']

export default function CategoriesScreen() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  const load = async () => {
    setLoading(true)
    const [c, p] = await Promise.all([data.list('categories'), data.list('products')])
    setCategories(c); setProducts(p)
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
    if (editing.id) {
      await data.update('categories', editing.id, { name: editing.name.trim(), color: editing.color })
    } else {
      await data.insert('categories', { name: editing.name.trim(), color: editing.color })
    }
    setEditing(null); load()
  }
  const onDelete = async (id) => {
    if (!confirm('Delete this category?')) return
    await data.remove('categories', id); load()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-steel-400">ক্যাটাগরি / Catalog</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-steel-800">ক্যাটাগরি (Categories)</h1>
          <p className="text-sm text-steel-500 mt-1">{categories.length} categories</p>
        </div>
        <Button onClick={() => setEditing({ name: '', color: palette[Math.floor(Math.random() * palette.length)] })}>
          <PlusIcon size={16} /> New category
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-steel-400"><Spinner size={28} /></div>
      ) : categories.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<TagIcon size={32} />} title="No categories yet" description="Categories help organize your products." action={
            <Button onClick={() => setEditing({ name: '', color: palette[0] })}><PlusIcon size={16} /> Add first category</Button>
          } />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => {
            // Live aggregate — counts how many products currently belong to
            // this category. Categories never store a quantity column of
            // their own; the number is derived from the inventory table.
            const count = products.filter((p) => p.category_id === c.id).length
            return (
              <Card key={c.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: c.color }}>
                    {c.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-bold text-steel-800">{c.name}</p>
                    <Badge
                      color="gray"
                      title="প্রোডাক্টের সংখ্যা মালামাল তালিকা থেকে স্বয়ংক্রিয়ভাবে গণনা হয় / Product count is calculated automatically from inventory"
                    >
                      {count} পণ্য
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(c)} className="p-2 rounded-lg text-steel-500 hover:bg-steel-100"><EditIcon size={14} /></button>
                  <button onClick={() => onDelete(c.id)} className="p-2 rounded-lg text-steel-500 hover:bg-red-50 hover:text-red-600"><TrashIcon size={14} /></button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit category' : 'New category'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={onSave}>Save</Button>
          </div>
        }
      >
        {editing && (
          <div className="space-y-4">
            <Field label="Name">
              <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. চাল ও আটা / Rice & Flour" />
            </Field>
            <Field label="Color">
              <div className="flex flex-wrap gap-2">
                {palette.map((c) => (
                  <button key={c} onClick={() => setEditing({ ...editing, color: c })}
                    className={`w-8 h-8 rounded-lg border-2 ${editing.color === c ? 'border-steel-800' : 'border-transparent'}`}
                    style={{ background: c }} />
                ))}
              </div>
            </Field>
            <p className="text-xs text-steel-400 bg-steel-50 rounded-lg p-3">
              পণ্যের সংখ্যা ক্যাটাগরিতে আলাদা করে সেট করা যায় না — এটি মালামাল তালিকা থেকে স্বয়ংক্রিয়ভাবে গণনা হয়।
              Product quantity is not stored on the category — it is auto-aggregated from the inventory.
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}