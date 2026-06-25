import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL : undefined);
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_ANON_KEY : undefined);

// Log only if missing to help debug production
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing in this build. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your hosting provider (Vercel/Netlify).");
}

export const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const formatSupabaseError = (err: any): string => {
  const msg = err?.message || err?.error_description || (typeof err === 'string' ? err : '');
  if (msg.includes('exceed_cached_egress_quota') || msg.includes('restricted due to')) {
    return 'Cota gratuita de transferência de dados (Egress) do Supabase excedida neste mês. Para resolver: 1) Crie um Novo Projeto gratuito no painel do Supabase e atualize as chaves VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas configurações, OU 2) Faça upgrade para o plano Pro no painel do Supabase (Billing).';
  }
  if (msg.includes('bucket_not_found') || msg.includes('Bucket not found')) {
    return 'O bucket "images" não foi encontrado no seu Supabase. Por favor, crie um bucket público chamado "images" no Storage do Supabase.';
  }
  return msg || 'Erro desconhecido no banco de dados.';
};

export const uploadImage = async (base64: string, path: string) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Check your environment variables.');
  }
  let blob: Blob;
  try {
    const res = await fetch(base64);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    blob = await res.blob();
  } catch (err: any) {
    console.error("Erro ao baixar imagem original:", err);
    throw new Error(`Falha ao baixar a imagem original. Detalhe: ${err.message}`);
  }
  
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
  const fullPath = `${path}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('images')
    .upload(fullPath, blob, {
      contentType: 'image/webp',
      upsert: true
    });

  if (error) {
    throw new Error(formatSupabaseError(error));
  }

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(fullPath);

  return publicUrl;
};
