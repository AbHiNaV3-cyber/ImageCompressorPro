import { config } from 'dotenv';
import { expand } from 'dotenv-expand';

const env = config();
expand(env);

export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;