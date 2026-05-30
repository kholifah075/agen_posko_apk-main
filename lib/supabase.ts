import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sxkoaulrtmnumowgboxv.supabase.co';
const supabaseAnonKey = 'sb_publishable_XhTzP8AqgdWOR-0eEjKcCA_SiwjDJHB';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);