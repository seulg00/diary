import { supabase } from '../lib/supabase'

function throwOnError(error, action) {
  if (error) throw new Error(`${action}: ${error.message}`)
}

export async function fetchDiaries() {
  const { data, error } = await supabase
    .from('diaries')
    .select('id, content, emotion, created_at')
    .order('created_at', { ascending: false })

  throwOnError(error, '기록을 불러오지 못했어요')
  return data
}

export async function createDiary({ content, emotion }) {
  const { data, error } = await supabase
    .from('diaries')
    .insert({ content, emotion })
    .select('id, content, emotion, created_at')
    .single()

  throwOnError(error, '기록을 저장하지 못했어요')
  return data
}

export async function deleteDiary(id) {
  const { error } = await supabase.from('diaries').delete().eq('id', id)
  throwOnError(error, '기록을 삭제하지 못했어요')
}