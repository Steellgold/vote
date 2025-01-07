import { createClient } from '@supabase/supabase-js'
import { Database } from './types/supabase'

export const supabase = createClient<Database>("https://chduhpduwlbtolvbjwxm.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoZHVocGR1d2xidG9sdmJqd3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyNjA2NTYsImV4cCI6MjA1MTgzNjY1Nn0.oeb4V4T3ME5uohgy-6GeDkVEftaxKBa8EUoOU-LzAxU")