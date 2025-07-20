import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iyplhgtrjtbbojnnclsj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cGxoZ3RyanRiYm9qbm5jbHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMzY5ODEsImV4cCI6MjA2ODYxMjk4MX0.rNL_eKkn5rfWTKYr76F57GfDjQPG9vd9uMYNLvOIBL8'

export const supabase = createClient(supabaseUrl, supabaseKey)
