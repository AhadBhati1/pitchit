-- SUPABASE DATABASE OPTIMIZATION & DIAGNOSTICS
-- Run these queries in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. CHECK TABLE SIZES (Find what's eating your space)
-- This shows the size of your tables including indexes.
SELECT
    t.relname AS table_name,
    pg_size_pretty(pg_total_relation_size(t.relid)) AS total_size,
    pg_size_pretty(pg_relation_size(t.relid)) AS data_size,
    pg_size_pretty(pg_total_relation_size(t.relid) - pg_relation_size(t.relid)) AS index_size,
    c.reltuples::bigint AS estimated_row_count
FROM pg_catalog.pg_statio_user_tables t
JOIN pg_catalog.pg_class c ON t.relid = c.oid
WHERE t.schemaname = 'public'
ORDER BY pg_total_relation_size(t.relid) DESC;

-- 1b. GLOBAL SCHEMA AUDIT (See the hidden 25MB overhead)
-- This shows space used by Auth, Storage metadata, and Internal Postgres tables.
SELECT 
    schemaname, 
    pg_size_pretty(SUM(pg_total_relation_size(relid))) as total_size,
    COUNT(*) as table_count
FROM pg_catalog.pg_statio_user_tables
GROUP BY schemaname
ORDER BY SUM(pg_total_relation_size(relid)) DESC;

-- 2. CHECK FOR UNUSED INDEXES
-- Indexes are great for speed but take up disk space. If an index has 0 scans, it might be safe to remove.
SELECT
    idstat.relname AS table_name,
    indexrelname AS index_name,
    idstat.idx_scan AS times_used,
    pg_size_pretty(pg_relation_size(idstat.indexrelid)) AS index_size
FROM pg_stat_user_indexes AS idstat
JOIN pg_index AS i ON idstat.indexrelid = i.indexrelid
WHERE idstat.schemaname = 'public'
  AND NOT i.indisunique
ORDER BY pg_relation_size(idstat.indexrelid) DESC;

-- 3. PERFORM MAINTENANCE (Reclaim space from deleted rows)
-- Postgres doesn't immediately free up space when you delete rows. VACUUM helps.
-- RUN THIS: VACUUM ANALYZE public.votes;
-- RUN THIS: VACUUM ANALYZE public.pitches;

-- 4. REALTIME OPTIMIZATION
-- If you have a high-volume table like "votes" and don't need real-time updates for it, 
-- removing it from the "supabase_realtime" publication can save CPU and potentially WAL log space.
-- To check what's currently in realtime:
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- 5. RECOMMENDATIONS FOR FREE TIER:
-- - Ensure you aren't storing large base64 strings in text columns. (Keep using Supabase Storage for videos/images).
-- - If "votes" becomes too large, consider periodic archiving (moving votes > 30 days old to a CSV or external backup).
-- - Supabase Logs: Check your Project Settings -> API -> Request Logs. These can sometimes contribute to the general "Size" metric in the UI dashboard.
