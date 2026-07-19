export default async function handler(req: any, res: any) {
  // Expose Supabase configuration dynamically to the client at runtime on Vercel / serverless deployments
  return res.status(200).json({
    supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "",
    supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""
  });
}
