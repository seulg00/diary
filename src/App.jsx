import { useEffect, useMemo, useState } from 'react'
import { createDiary, deleteDiary, fetchDiaries } from './api/diaries'

const emotions = [
  { value: 'joy', label: '기쁨', emoji: '😊', tone: 'bg-amber-50 text-amber-700 ring-amber-200' },
  { value: 'calm', label: '평온', emoji: '😌', tone: 'bg-teal-50 text-teal-700 ring-teal-200' },
  { value: 'sad', label: '슬픔', emoji: '😢', tone: 'bg-sky-50 text-sky-700 ring-sky-200' },
  { value: 'angry', label: '화남', emoji: '😠', tone: 'bg-rose-50 text-rose-700 ring-rose-200' },
  { value: 'anxious', label: '불안', emoji: '😰', tone: 'bg-violet-50 text-violet-700 ring-violet-200' },
]

const emotionMap = Object.fromEntries(emotions.map((emotion) => [emotion.value, emotion]))

function formatDate(value) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function App() {
  const [diaries, setDiaries] = useState([])
  const [selectedEmotion, setSelectedEmotion] = useState('')
  const [content, setContent] = useState('')
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDiaries() {
      try {
        setError('')
        setDiaries(await fetchDiaries())
      } catch (loadError) {
        setError(loadError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadDiaries()
  }, [])

  const filteredDiaries = useMemo(
    () => filter === 'all' ? diaries : diaries.filter((diary) => diary.emotion === filter),
    [diaries, filter],
  )

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedContent = content.trim()

    if (!selectedEmotion || !trimmedContent || isSaving) return

    try {
      setIsSaving(true)
      setError('')
      const diary = await createDiary({ content: trimmedContent, emotion: selectedEmotion })
      setDiaries((current) => [diary, ...current])
      setContent('')
      setSelectedEmotion('')
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      setDeletingId(id)
      setError('')
      await deleteDiary(id)
      setDiaries((current) => current.filter((diary) => diary.id !== id))
    } catch (deleteError) {
      setError(deleteError.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f7f2] text-slate-800">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-12">
        <header className="mb-10 flex items-end justify-between gap-5">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-teal-700">daily pause</p>
            <h1 className="font-serif text-4xl font-medium tracking-tight text-slate-900 sm:text-5xl">오늘의 마음을 남겨요</h1>
            <p className="mt-3 text-sm text-slate-500">잠깐 멈춰서, 지금의 나를 다정하게 기록하는 시간</p>
          </div>
          <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm sm:block">{diaries.length}개의 기록</div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)]">
          <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-3xl bg-[#174b4b] p-6 text-white shadow-xl shadow-teal-950/10 sm:p-8">
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full border-[18px] border-white/10" />
            <div className="relative">
              <p className="mb-2 text-sm text-teal-100">기록하기</p>
              <h2 className="text-2xl font-semibold tracking-tight">지금 어떤 하루를 보내고 있나요?</h2>
              <div className="mt-8">
                <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-teal-100">오늘의 감정</label>
                <div className="grid grid-cols-5 gap-2">
                  {emotions.map((emotion) => (
                    <button key={emotion.value} type="button" aria-pressed={selectedEmotion === emotion.value} onClick={() => setSelectedEmotion(emotion.value)} className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border transition ${selectedEmotion === emotion.value ? 'border-white bg-white text-slate-800 shadow-lg' : 'border-white/15 bg-white/10 text-white hover:bg-white/20'}`}>
                      <span className="text-2xl" aria-hidden="true">{emotion.emoji}</span>
                      <span className="text-[11px] font-medium">{emotion.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <label htmlFor="diary-content" className="mb-3 mt-8 block text-xs font-bold uppercase tracking-widest text-teal-100">오늘의 한마디</label>
              <textarea id="diary-content" value={content} onChange={(event) => setContent(event.target.value)} placeholder="오늘 마음에 남은 일을 적어보세요..." rows="5" className="w-full resize-none rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-white outline-none placeholder:text-teal-100/60 focus:border-white/60 focus:ring-2 focus:ring-white/20" />
              <button type="submit" disabled={!selectedEmotion || !content.trim() || isSaving} className="mt-4 flex w-full items-center justify-center rounded-2xl bg-[#f4c95d] px-5 py-3.5 text-sm font-bold text-[#174b4b] transition hover:bg-[#f8d979] disabled:cursor-not-allowed disabled:opacity-45">
                {isSaving ? '저장 중...' : '기록 저장하기'}
              </button>
            </div>
          </form>

          <section aria-labelledby="diary-list-title" className="min-w-0">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">my journal</p>
                <h2 id="diary-list-title" className="mt-1 text-2xl font-semibold text-slate-900">나의 기록</h2>
              </div>
              <span className="text-sm text-slate-400">최신순</span>
            </div>
            <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
              {[{ value: 'all', label: '전체' }, ...emotions].map((tab) => (
                <button key={tab.value} type="button" onClick={() => setFilter(tab.value)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${filter === tab.value ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:ring-slate-400'}`}>
                  {tab.value === 'all' ? tab.label : `${tab.emoji} ${tab.label}`}
                </button>
              ))}
            </div>

            {error && <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="오류 닫기" className="text-lg leading-none">×</button></div>}
            {isLoading ? <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-400"><span className="mb-3 block text-2xl animate-pulse">✦</span>기록을 불러오는 중이에요...</div> : filteredDiaries.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center"><span className="mb-3 block text-3xl">☁</span><p className="font-semibold text-slate-700">아직 남겨진 기록이 없어요</p><p className="mt-1 text-sm text-slate-400">오늘의 마음을 첫 번째로 기록해보세요.</p></div> : <div className="space-y-3">{filteredDiaries.map((diary) => { const emotion = emotionMap[diary.emotion]; return <article key={diary.id} className="group rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start gap-4"><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ring-1 ${emotion.tone}`}>{emotion.emoji}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><span className="text-xs font-bold text-slate-400">{emotion.label}</span><p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-6 text-slate-700">{diary.content}</p></div><button type="button" onClick={() => handleDelete(diary.id)} disabled={deletingId === diary.id} aria-label="기록 삭제" className="shrink-0 rounded-lg px-2 py-1 text-xs text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50">{deletingId === diary.id ? '...' : '삭제'}</button></div><time dateTime={diary.created_at} className="mt-3 block text-xs text-slate-400">{formatDate(diary.created_at)}</time></div></div></article> })}</div>}
          </section>
        </section>
        <footer className="mt-12 text-center text-xs text-slate-400">나를 돌보는 가장 작은 습관</footer>
      </div>
    </main>
  )
}

export default App
