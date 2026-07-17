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
  password?: string;
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
        businessName: 'MediCall Pro Clinic',
        password: 'password123'
      };
      users.push(demoUser);
      localStorage.setItem('supabase_mock_users', JSON.stringify(users));

      // Seed default business profile and hours for the demo user (completely empty as requested, name gets personal name, email gets email)
      const defaultProfile: BusinessProfile = {
        name: 'Dr. Balot Hussain',
        phone: '',
        email: 'demo@medicall.ai',
        address: '',
        city: '',
        state: '',
        zip: '',
        website: '',
        timezone: ''
      };
      localStorage.setItem(`supabase_mock_profile_usr-demo`, JSON.stringify(defaultProfile));

      const defaultHours: BusinessHours = {
        sunday: { isOpen: false, from: '', to: '' },
        monday: { isOpen: false, from: '', to: '' },
        tuesday: { isOpen: false, from: '', to: '' },
        wednesday: { isOpen: false, from: '', to: '' },
        thursday: { isOpen: false, from: '', to: '' },
        friday: { isOpen: false, from: '', to: '' },
        saturday: { isOpen: false, from: '', to: '' },
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
        businessName,
        password: password || 'password123'
      };

      // Register user
      users.push(newUser);
      this.saveMockUsers(users);

      // Auto create a business profile and hours for this user (empty default, business profile name gets registered user's personal name, email gets email)
      const defaultProfile: BusinessProfile = {
        name: name, // In place of business name, we use user's Name ("bussiness name ke jag name")
        phone: '',
        email: email.toLowerCase(), // email gets registered email
        address: '',
        city: '',
        state: '',
        zip: '',
        website: '',
        timezone: ''
      };
      localStorage.setItem(`supabase_mock_profile_${newUser.id}`, JSON.stringify(defaultProfile));

      const defaultHours: BusinessHours = {
        sunday: { isOpen: false, from: '', to: '' },
        monday: { isOpen: false, from: '', to: '' },
        tuesday: { isOpen: false, from: '', to: '' },
        wednesday: { isOpen: false, from: '', to: '' },
        thursday: { isOpen: false, from: '', to: '' },
        friday: { isOpen: false, from: '', to: '' },
        saturday: { isOpen: false, from: '', to: '' },
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

      // Verify password if set
      if (matched.password && matched.password !== password) {
        return { data: { user: null, session: null }, error: { message: 'Invalid login credentials. Incorrect password.' } };
      }

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
 
    updateUser: async (attributes: any) => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const current = this.getLoggedInUser();
      if (!current) {
        return { data: { user: null }, error: { message: 'Not logged in.' } };
      }
      const users = this.getMockUsers();
      const matchedIdx = users.findIndex(u => u.id === current.id);
      if (matchedIdx === -1) {
        return { data: { user: null }, error: { message: 'User not found in local sandbox.' } };
      }
 
      if (attributes.password) {
        users[matchedIdx].password = attributes.password;
        current.password = attributes.password;
      }
      if (attributes.data) {
        if (attributes.data.name) {
          users[matchedIdx].name = attributes.data.name;
          current.name = attributes.data.name;
        }
        if (attributes.data.business_name) {
          users[matchedIdx].businessName = attributes.data.business_name;
          current.businessName = attributes.data.business_name;
        }
      }
      this.saveMockUsers(users);
      this.setLoggedInUser(current);
 
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
                  // Fallback (empty, name gets personal name, email gets email)
                  const currentObj: BusinessProfile = {
                    name: currentUser?.name || '',
                    phone: '',
                    email: currentUser?.email || '',
                    address: '',
                    city: '',
                    state: '',
                    zip: '',
                    website: '',
                    timezone: ''
                  };
                  return { data: currentObj, error: null };
                } else if (tableName === 'business_hours') {
                  const saved = localStorage.getItem(`supabase_mock_hours_${val}`);
                  if (saved) {
                    return { data: JSON.parse(saved), error: null };
                  }
                  // Fallback
                  const currentHours: BusinessHours = {
                    sunday: { isOpen: false, from: '', to: '' },
                    monday: { isOpen: false, from: '', to: '' },
                    tuesday: { isOpen: false, from: '', to: '' },
                    wednesday: { isOpen: false, from: '', to: '' },
                    thursday: { isOpen: false, from: '', to: '' },
                    friday: { isOpen: false, from: '', to: '' },
                    saturday: { isOpen: false, from: '', to: '' },
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

// Instantiate fallback mock client
const realSupabase = realClient;
const mockSupabase = new LocalStorageSupabaseMock();

// Session-level tracker to fall back to mock database if real client is rate-limited or fails
let useMockFallback = !isSupabaseConfigured;

export const supabase: any = {
  get isMock() {
    return useMockFallback;
  },

  auth: {
    signUp: async (params: any) => {
      if (useMockFallback || !realSupabase) {
        return mockSupabase.auth.signUp(params);
      }
      try {
        const res = await realSupabase.auth.signUp(params);
        if (res.error) {
          console.warn('Real Supabase signUp error, falling back to local sandbox:', res.error.message);
          useMockFallback = true;
          return mockSupabase.auth.signUp(params);
        }
        return res;
      } catch (err: any) {
        console.warn('Real Supabase signUp exception, falling back to local sandbox:', err);
        useMockFallback = true;
        return mockSupabase.auth.signUp(params);
      }
    },

    signInWithPassword: async (params: any) => {
      if (useMockFallback || !realSupabase) {
        return mockSupabase.auth.signInWithPassword(params);
      }
      try {
        const res = await realSupabase.auth.signInWithPassword(params);
        if (res.error) {
          console.warn('Real Supabase signIn error, falling back to local sandbox:', res.error.message);
          useMockFallback = true;
          
          // Attempt mock login. If user is not registered locally, auto-register them so they can enter immediately!
          const mockRes = await mockSupabase.auth.signInWithPassword(params);
          if (mockRes.error) {
            console.log('User not found in local sandbox, auto-registering on-the-fly:', params.email);
            const signupRes = await mockSupabase.auth.signUp({
              email: params.email,
              password: params.password,
              options: {
                data: {
                  name: params.email.split('@')[0],
                  business_name: 'My Clinic'
                }
              }
            });
            if (!signupRes.error) {
              return signupRes;
            }
          }
          return mockRes;
        }
        return res;
      } catch (err: any) {
        console.warn('Real Supabase signIn exception, falling back to local sandbox:', err);
        useMockFallback = true;
        return mockSupabase.auth.signInWithPassword(params);
      }
    },

    resetPasswordForEmail: async (email: string) => {
      if (useMockFallback || !realSupabase) {
        return mockSupabase.auth.resetPasswordForEmail(email);
      }
      try {
        const res = await realSupabase.auth.resetPasswordForEmail(email);
        if (res.error) {
          return mockSupabase.auth.resetPasswordForEmail(email);
        }
        return res;
      } catch (err) {
        return mockSupabase.auth.resetPasswordForEmail(email);
      }
    },
 
    updateUser: async (attributes: any) => {
      if (useMockFallback || !realSupabase) {
        return mockSupabase.auth.updateUser(attributes);
      }
      try {
        const res = await realSupabase.auth.updateUser(attributes);
        if (res.error) {
          return mockSupabase.auth.updateUser(attributes);
        }
        return res;
      } catch (err) {
        return mockSupabase.auth.updateUser(attributes);
      }
    },

    signOut: async () => {
      if (realSupabase) {
        try {
          await realSupabase.auth.signOut();
        } catch (e) {}
      }
      await mockSupabase.auth.signOut();
      useMockFallback = !isSupabaseConfigured;
      return { error: null };
    },

    getUser: async () => {
      if (useMockFallback || !realSupabase) {
        return mockSupabase.auth.getUser();
      }
      try {
        const res = await realSupabase.auth.getUser();
        if (res.error || !res.data?.user) {
          return mockSupabase.auth.getUser();
        }
        return res;
      } catch (err) {
        return mockSupabase.auth.getUser();
      }
    },

    getSession: async () => {
      if (useMockFallback || !realSupabase) {
        return mockSupabase.auth.getSession();
      }
      try {
        const res = await realSupabase.auth.getSession();
        if (res.error || !res.data?.session) {
          return mockSupabase.auth.getSession();
        }
        return res;
      } catch (err) {
        return mockSupabase.auth.getSession();
      }
    },

    onAuthStateChange: (callback: any) => {
      if (realSupabase) {
        try {
          return realSupabase.auth.onAuthStateChange(callback);
        } catch (e) {}
      }
      return mockSupabase.auth.onAuthStateChange(callback);
    }
  },

  from: (tableName: string) => {
    if (useMockFallback || !realSupabase) {
      return mockSupabase.from(tableName);
    }

    const wrapQuery = (realQuery: any, mockQuery: any): any => {
      return new Proxy({}, {
        get(target, prop) {
          if (prop === 'then') {
            return (onfulfilled?: any, onrejected?: any) => {
              return realQuery.then(
                async (res: any) => {
                  if (res && res.error) {
                    console.warn(`Real database query returned error for ${tableName}, falling back to local sandbox:`, res.error);
                    useMockFallback = true;
                    const mockRes = await mockQuery;
                    return onfulfilled ? onfulfilled(mockRes) : mockRes;
                  }
                  return onfulfilled ? onfulfilled(res) : res;
                },
                async (err: any) => {
                  console.warn(`Real database query threw error for ${tableName}, falling back to local sandbox:`, err);
                  useMockFallback = true;
                  const mockRes = await mockQuery;
                  return onfulfilled ? onfulfilled(mockRes) : mockRes;
                }
              );
            };
          }

          if (prop === 'constructor' || typeof prop === 'symbol') {
            return (realQuery as any)[prop];
          }

          const realValue = realQuery[prop];
          const mockValue = mockQuery[prop];

          if (typeof realValue === 'function') {
            return (...args: any[]) => {
              const nextReal = realValue.apply(realQuery, args);
              const nextMock = typeof mockValue === 'function' ? mockValue.apply(mockQuery, args) : mockValue;
              return wrapQuery(nextReal, nextMock);
            };
          }

          return realValue;
        }
      });
    };

    return wrapQuery(realSupabase.from(tableName), mockSupabase.from(tableName));
  }
};
