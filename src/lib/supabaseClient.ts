import { createClient } from '@supabase/supabase-js';
import { BusinessProfile, BusinessHours } from '../types';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

// Detect if real Supabase configuration is available
export const isSupabaseConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

// Standardized structure for Mock Auth user
interface MockUser {
  id: string;
  email: string;
  name: string;
  businessName: string;
}

// Global variable for real client if initialized
let realClient: any = null;

if (isSupabaseConfigured) {
  try {
    realClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error('Failed to initialize real Supabase client:', err);
  }
}

/**
 * Robust fallback simulation of Supabase that stores accounts, business profiles, and business hours
 * in localStorage. This ensures 100% uptime in development / preview modes when API keys are not supplied.
 */
class LocalStorageSupabaseMock {
  private getMockUsers(): MockUser[] {
    const saved = localStorage.getItem('supabase_mock_users');
    const users = saved ? JSON.parse(saved) : [];
    
    // Auto-seed demo user if not present
    if (!users.some((u: MockUser) => u.email.toLowerCase() === 'demo@medicall.ai')) {
      const demoUser: MockUser = {
        id: 'usr-demo',
        email: 'demo@medicall.ai',
        name: 'Dr. Balot Hussain',
        businessName: 'MediCall Pro Clinic'
      };
      users.push(demoUser);
      localStorage.setItem('supabase_mock_users', JSON.stringify(users));

      // Seed default business profile and hours for the demo user
      const defaultProfile: BusinessProfile = {
        name: 'MediCall Pro Clinic',
        phone: '9999999999',
        email: 'demo@medicall.ai',
        address: '742 Market Street',
        city: 'San Francisco',
        state: 'CA',
        zip: '94103',
        website: 'https://www.theblockchaincoders.com/SourceCode',
        timezone: 'New York'
      };
      localStorage.setItem(`supabase_mock_profile_usr-demo`, JSON.stringify(defaultProfile));

      const defaultHours: BusinessHours = {
        sunday: { isOpen: false, from: '09:00 AM', to: '05:00 PM' },
        monday: { isOpen: true, from: '08:00 AM', to: '06:00 PM' },
        tuesday: { isOpen: true, from: '08:00 AM', to: '06:00 PM' },
        wednesday: { isOpen: true, from: '08:00 AM', to: '06:00 PM' },
        thursday: { isOpen: true, from: '08:00 AM', to: '06:00 PM' },
        friday: { isOpen: true, from: '08:00 AM', to: '06:00 PM' },
        saturday: { isOpen: true, from: '09:00 AM', to: '02:00 PM' },
      };
      localStorage.setItem(`supabase_mock_hours_usr-demo`, JSON.stringify(defaultHours));
    }
    return users;
  }

  private saveMockUsers(users: MockUser[]) {
    localStorage.setItem('supabase_mock_users', JSON.stringify(users));
  }

  private getLoggedInUser(): MockUser | null {
    const saved = localStorage.getItem('supabase_mock_current_user');
    return saved ? JSON.parse(saved) : null;
  }

  private setLoggedInUser(user: MockUser | null) {
    if (user) {
      localStorage.setItem('supabase_mock_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('supabase_mock_current_user');
    }
  }

  // Authentic replication of Supabase Auth namespace
  auth = {
    signUp: async ({ email, password, options }: any) => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const users = this.getMockUsers();
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { data: { user: null }, error: { message: 'A user with this email already exists.' } };
      }

      const name = options?.data?.name || 'New Member';
      const businessName = options?.data?.business_name || 'My Clinic';
      
      const newUser: MockUser = {
        id: `usr-${Math.random().toString(36).substr(2, 9)}`,
        email: email.toLowerCase(),
        name,
        businessName
      };

      // Register user
      users.push(newUser);
      this.saveMockUsers(users);

      // Auto create a business profile and hours for this user
      const defaultProfile: BusinessProfile = {
        name: businessName,
        phone: '9999999999',
        email: email.toLowerCase(),
        address: '742 Market Street',
        city: 'San Francisco',
        state: 'CA',
        zip: '94103',
        website: 'https://www.theblockchaincoders.com/SourceCode',
        timezone: 'New York'
      };
      localStorage.setItem(`supabase_mock_profile_${newUser.id}`, JSON.stringify(defaultProfile));

      const defaultHours: BusinessHours = {
        sunday: { isOpen: false, from: '09:00 AM', to: '05:00 PM' },
        monday: { isOpen: true, from: '08:00 AM', to: '06:00 PM' },
        tuesday: { isOpen: true, from: '08:00 AM', to: '06:00 PM' },
        wednesday: { isOpen: true, from: '08:00 AM', to: '06:00 PM' },
        thursday: { isOpen: true, from: '08:00 AM', to: '06:00 PM' },
        friday: { isOpen: true, from: '08:00 AM', to: '06:00 PM' },
        saturday: { isOpen: true, from: '09:00 AM', to: '02:00 PM' },
      };
      localStorage.setItem(`supabase_mock_hours_${newUser.id}`, JSON.stringify(defaultHours));

      // Auto log in (no verification email as requested)
      this.setLoggedInUser(newUser);

      return {
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            user_metadata: { name, business_name: businessName }
          },
          session: { access_token: 'mock-token', user: { id: newUser.id, email: newUser.email } }
        },
        error: null
      };
    },

    signInWithPassword: async ({ email, password }: any) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const users = this.getMockUsers();
      const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!matched) {
        return { data: { user: null, session: null }, error: { message: 'Invalid login credentials. User not found.' } };
      }

      // Allow demo user as a special shortcut
      this.setLoggedInUser(matched);

      return {
        data: {
          user: {
            id: matched.id,
            email: matched.email,
            user_metadata: { name: matched.name, business_name: matched.businessName }
          },
          session: { access_token: 'mock-token', user: { id: matched.id, email: matched.email } }
        },
        error: null
      };
    },

    resetPasswordForEmail: async (email: string) => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const users = this.getMockUsers();
      const matched = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (!matched) {
        return { error: { message: 'No registered account found with this email.' } };
      }
      return { data: {}, error: null };
    },

    signOut: async () => {
      this.setLoggedInUser(null);
      return { error: null };
    },

    getUser: async () => {
      const current = this.getLoggedInUser();
      if (!current) return { data: { user: null }, error: null };
      return {
        data: {
          user: {
            id: current.id,
            email: current.email,
            user_metadata: { name: current.name, business_name: current.businessName }
          }
        },
        error: null
      };
    },

    getSession: async () => {
      const current = this.getLoggedInUser();
      if (!current) return { data: { session: null }, error: null };
      return {
        data: {
          session: {
            access_token: 'mock-token',
            user: {
              id: current.id,
              email: current.email,
              user_metadata: { name: current.name, business_name: current.businessName }
            }
          }
        },
        error: null
      };
    },

    onAuthStateChange: (callback: any) => {
      // Return unsubscriber
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    }
  };

  // Chainable queries simulator: supabase.from('...').select('*').eq(...)
  from(tableName: string) {
    const currentUser = this.getLoggedInUser();
    const userId = currentUser ? currentUser.id : 'anonymous';

    return {
      select: (fields: string = '*') => {
        return {
          eq: (field: string, val: any) => {
            return {
              single: async () => {
                await new Promise(r => setTimeout(r, 100));
                if (tableName === 'business_profiles') {
                  const saved = localStorage.getItem(`supabase_mock_profile_${val}`);
                  if (saved) {
                    return { data: JSON.parse(saved), error: null };
                  }
                  // Fallback
                  const currentObj: BusinessProfile = {
                    name: currentUser?.businessName || 'AutoCare Pro Clinic',
                    phone: '9999999999',
                    email: currentUser?.email || 'theblockchaincoders@gmail.com',
                    address: '742 Market Street',
                    city: 'San Francisco',
                    state: 'CA',
                    zip: '94103',
                    website: 'https://www.theblockchaincoders.com/SourceCode',
                    timezone: 'New York'
                  };
                  return { data: currentObj, error: null };
                } else if (tableName === 'business_hours') {
                  const saved = localStorage.getItem(`supabase_mock_hours_${val}`);
                  if (saved) {
                    return { data: JSON.parse(saved), error: null };
                  }
                  // Fallback
                  const currentHours: BusinessHours = {
                    sunday: { isOpen: false, from: '09:00 AM', to: '05:00 PM' },
                    monday: { isOpen: true, from: '08:00 AM', to: '06:00 PM' },
                    tuesday: { isOpen: true, from: '08:00 AM', to: '06:00 PM' },
                    wednesday: { isOpen: true, from: '08:00 AM', to: '06:00 PM' },
                    thursday: { isOpen: true, from: '08:00 AM', to: '06:00 PM' },
                    friday: { isOpen: true, from: '08:00 AM', to: '06:00 PM' },
                    saturday: { isOpen: true, from: '09:00 AM', to: '02:00 PM' },
                  };
                  return { data: currentHours, error: null };
                }
                return { data: null, error: { message: `Table ${tableName} not supported in mock.` } };
              }
            };
          }
        };
      },

      update: (updatedData: any) => {
        return {
          eq: (field: string, val: any) => {
            return {
              select: () => {
                return {
                  single: async () => {
                    await new Promise(r => setTimeout(r, 150));
                    if (tableName === 'business_profiles') {
                      const current = localStorage.getItem(`supabase_mock_profile_${val}`);
                      const parsed = current ? JSON.parse(current) : {};
                      const merged = { ...parsed, ...updatedData };
                      localStorage.setItem(`supabase_mock_profile_${val}`, JSON.stringify(merged));
                      return { data: merged, error: null };
                    } else if (tableName === 'business_hours') {
                      const current = localStorage.getItem(`supabase_mock_hours_${val}`);
                      const parsed = current ? JSON.parse(current) : {};
                      const merged = { ...parsed, ...updatedData };
                      localStorage.setItem(`supabase_mock_hours_${val}`, JSON.stringify(merged));
                      return { data: merged, error: null };
                    }
                    return { data: null, error: { message: 'Table not supported' } };
                  }
                };
              }
            };
          }
        };
      },

      upsert: (upsertData: any) => {
        return {
          select: () => {
            return {
              single: async () => {
                await new Promise(r => setTimeout(r, 100));
                const targetId = upsertData.id || userId;
                if (tableName === 'business_profiles') {
                  localStorage.setItem(`supabase_mock_profile_${targetId}`, JSON.stringify(upsertData));
                  return { data: upsertData, error: null };
                } else if (tableName === 'business_hours') {
                  localStorage.setItem(`supabase_mock_hours_${targetId}`, JSON.stringify(upsertData));
                  return { data: upsertData, error: null };
                }
                return { data: null, error: { message: 'Table not supported' } };
              }
            };
          }
        };
      }
    };
  }
}

// Instantiate fallback if real Supabase isn't configured
export const supabase = isSupabaseConfigured ? realClient : new LocalStorageSupabaseMock();
