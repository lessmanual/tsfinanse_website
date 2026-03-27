import { createClient } from '@supabase/supabase-js';

const SITE_URL = 'https://www.tsfinanse.com';
const INDEXNOW_KEY = 'BF7B57E849D44AF48F0B5D95B0D5B154';

const staticUrls = [
  '/',
  '/blog',
  '/programpartnerski',
];

async function getBlogUrls() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return [];

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data } = await supabase
    .from('ts_finanse_posts')
    .select('slug')
    .eq('status', 'published');

  return (data || []).map(p => `/blog/${p.slug}`);
}

async function main() {
  const blogUrls = await getBlogUrls();
  const allUrls = [...staticUrls, ...blogUrls].map(p => `${SITE_URL}${p}`);

  console.log(`Submitting ${allUrls.length} URLs to IndexNow...`);

  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: 'www.tsfinanse.com',
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: allUrls,
    }),
  });

  console.log(`IndexNow response: ${response.status} ${response.statusText}`);
}

main().catch(console.error);
