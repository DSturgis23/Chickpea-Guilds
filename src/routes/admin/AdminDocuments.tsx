import { useRef, useState } from 'react'
import { useAuth } from '../../auth/AuthProvider'
import { useStore } from '../../state/store'
import { dateWithYear } from '../../lib/format'
import { Button, Card, EmptyState, Field, SectionTitle, inputClass } from '../../components/ui'
import { BackHeader } from '../../components/BackHeader'
import { FileText, Trash2, Upload } from 'lucide-react'

const CATEGORIES = ['Handbooks', 'Policies', 'Operations', 'Guilds', 'General']

export function AdminDocuments() {
  const { user } = useAuth()
  const { documents, uploadDocumentFile, removeDocument } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user) return null

  async function submit() {
    if (!file) {
      setError('Choose a file first.')
      return
    }
    setUploading(true)
    setError(null)
    try {
      await uploadDocumentFile({
        file,
        title: title.trim() || file.name,
        category,
        uploadedById: user!.id,
      })
      setFile(null)
      setTitle('')
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload that file.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="rise space-y-5 md:mx-auto md:max-w-3xl">
      <BackHeader title="Documents" to="/more" />
      <p className="text-sm text-ink-soft">
        Upload handbooks, policies and SOPs. Everyone signed in can read these; only
        People &amp; Culture can add or remove them.
      </p>

      <Card className="space-y-3 p-4">
        <p className="label">Upload a document</p>
        <Field label="File">
          <input
            ref={fileRef}
            type="file"
            className={`${inputClass} py-2`}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </Field>
        <Field label="Title" hint="Leave blank to use the file name.">
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Allergen & Dietary Policy"
          />
        </Field>
        <Field label="Category">
          <select
            className={inputClass}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        {error && <p className="text-sm text-[#e2867f]">{error}</p>}
        <Button onClick={submit} disabled={uploading}>
          <Upload size={16} /> {uploading ? 'Uploading…' : 'Upload'}
        </Button>
      </Card>

      <section>
        <SectionTitle>All documents</SectionTitle>
        {documents.length === 0 ? (
          <EmptyState title="Nothing uploaded yet" hint="Files you upload will appear here and on the Documents tab." />
        ) : (
          <Card className="divide-y divide-line-soft">
            {documents.map((d) => (
              <div key={d.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-maroon-wash text-gold">
                  <FileText size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{d.title}</p>
                  <p className="truncate text-xs text-ink-faint">
                    {d.category} · {d.sizeLabel} · updated {dateWithYear(d.updatedAt)}
                  </p>
                </div>
                <button
                  onClick={() => removeDocument(d.id, d.fileUrl)}
                  className="text-ink-faint hover:text-[#e2867f]"
                  aria-label="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </Card>
        )}
      </section>
    </div>
  )
}
