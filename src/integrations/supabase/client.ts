import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lwxkcoanriexohaboivd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3eGtjb2FucmlleG9oYWJvaXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NzkzODIsImV4cCI6MjA5MTA1NTM4Mn0.T-JmAEo5PZO35wknWS2-OnSEtB6AQwEP9B9nuhnVCho';

export const supabase = createClient(supabaseUrl, supabaseKey);