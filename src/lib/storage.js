import { supabase } from './supabase';

const CACHE_KEY = 'yaobai-zhi-cache';

function saveToCache(decisions) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(decisions)); } catch {}
}

function loadFromCache() {
  try {
    const data = localStorage.getItem(CACHE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function transformDecision(d) {
  return {
    ...d,
    createdAt: d.created_at,
    completedAt: d.completed_at,
    reviewedAt: d.reviewed_at,
    selectedOption: d.selected_option,
    hesitation: d.hesitation || 0,
    confidence: d.confidence || 0,
    notes: d.notes || '',
    isFavorite: d.is_favorite || false,
    options: (d.options || [])
      .sort((a, b) => a.position - b.position)
      .map((o) => ({
        name: o.name,
        pros: o.pros || '',
        cons: o.cons || '',
        risks: o.risks || '',
        worstCase: o.worst_case || '',
        solution: o.solution || '',
      })),
  };
}

export async function getDecisions() {
  try {
    const { data, error } = await supabase
      .from('decisions')
      .select('*, options:decision_options(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    const decisions = (data || []).map(transformDecision);
    saveToCache(decisions);
    return decisions;
  } catch {
    return loadFromCache();
  }
}

export async function getDecisionById(id) {
  try {
    const { data, error } = await supabase
      .from('decisions')
      .select('*, options:decision_options(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return transformDecision(data);
  } catch {
    const cached = loadFromCache();
    return cached.find((d) => d.id === id) || null;
  }
}

export async function addDecision(decision) {
  const { options, ...rest } = decision;

  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;
  if (!userId) throw new Error('未登录');

  const { data: newDecision, error: decisionError } = await supabase
    .from('decisions')
    .insert({
      user_id: userId,
      title: rest.title,
      category: rest.category,
      type: rest.type,
      description: rest.description || '',
      status: rest.status,
      selected_option: rest.selectedOption || '',
      satisfaction: rest.satisfaction || '',
      review: rest.review || '',
      hesitation: rest.hesitation || 0,
      confidence: rest.confidence || 0,
      notes: rest.notes || '',
      is_favorite: rest.isFavorite || false,
      completed_at: rest.completedAt || null,
      reviewed_at: rest.reviewedAt || null,
    })
    .select()
    .single();

  if (decisionError) throw decisionError;

  const optionsData = options.map((opt, index) => ({
    decision_id: newDecision.id,
    name: opt.name,
    pros: opt.pros || '',
    cons: opt.cons || '',
    risks: opt.risks || '',
    worst_case: opt.worstCase || '',
    solution: opt.solution || '',
    position: index,
  }));

  const { error: optionsError } = await supabase
    .from('decision_options')
    .insert(optionsData);

  if (optionsError) throw optionsError;

  return { ...newDecision, options };
}

export async function updateDecision(id, updates) {
  const dbUpdates = {};
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.selectedOption !== undefined) dbUpdates.selected_option = updates.selectedOption;
  if (updates.satisfaction !== undefined) dbUpdates.satisfaction = updates.satisfaction;
  if (updates.review !== undefined) dbUpdates.review = updates.review;
  if (updates.hesitation !== undefined) dbUpdates.hesitation = updates.hesitation;
  if (updates.confidence !== undefined) dbUpdates.confidence = updates.confidence;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite;
  if (updates.completedAt) dbUpdates.completed_at = updates.completedAt;
  if (updates.reviewedAt) dbUpdates.reviewed_at = updates.reviewedAt;

  const { data, error } = await supabase
    .from('decisions')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDecision(id) {
  const { error } = await supabase
    .from('decisions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
