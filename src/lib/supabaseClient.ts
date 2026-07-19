import { createClient } from '@supabase/supabase-js';
import { BusinessProfile, BusinessHours } from '../types';
import { INITIAL_FAQS, INITIAL_SERVICES, INITIAL_APPOINTMENTS, INITIAL_AGENTS } from '../data';

export let isSupabaseConfigured = false;
export let realClient: any = null;
export let useMockFallback = true;

const buildTimeUrl = (import.meta as any).env.VITE_SUPABASE_URL || (import.meta as any).env.SUPABASE_URL || '';
const buildTimeAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || (import.meta as any).env.SUPABASE_ANON_KEY || '';

const isValidConfig = (url: string, key: string) => {
  return !!url && !!key && url !== 'YOUR_SUPABASE_URL' && key !== 'YOUR_SUPABASE_ANON_KEY';
};

// Start dynamic loading from either build-time env or server-side API
export const initSupabasePromise = (async () => {
  if (isValidConfig(buildTimeUrl, buildTimeAnonKey)) {
    isSupabaseConfigured = true;
    useMockFallback = false;
    try {
      realClient = createClient(buildTimeUrl, buildTimeAnonKey);
      console.log('Real Supabase client initialized from build-time environment.');
      return;
    } catch (err) {
      console.error('Failed to initialize real Supabase client from build-time env:', err);
    }
  }

  // Fallback to runtime config fetch from backend
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const config = await res.json();
      if (isValidConfig(config.supabaseUrl, config.supabaseAnonKey)) {
        isSupabaseConfigured = true;
        useMockFallback = false;
        realClient = createClient(config.supabaseUrl, config.supabaseAnonKey);
        console.log('Real Supabase client initialized from runtime API.');
      } else {
        console.log('Runtime Supabase config is empty or placeholder. Staying in mock database mode.');
      }
    }
  } catch (err) {
    console.warn('Could not fetch runtime Supabase config, staying in mock database mode:', err);
  }
})();

// Standardized structure for Mock Auth user
interface MockUser {
  id: string;
  email: string;
  name: string;
  businessName: string;
  password?: string;
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
        return { data: { user: null, session: null }, error: { message: 'Invalid login credentials. User not found. If you do not have an account, please sign up with a new account.' } };
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

    const getFaqs = () => {
      const saved = localStorage.getItem(`supabase_mock_faqs_${userId}`);
      if (saved) return JSON.parse(saved);
      return userId === 'usr-demo' ? INITIAL_FAQS : [];
    };

    const getServices = () => {
      const saved = localStorage.getItem(`supabase_mock_services_${userId}`);
      if (saved) return JSON.parse(saved);
      return userId === 'usr-demo' ? INITIAL_SERVICES : [];
    };

    const getAppointments = () => {
      const saved = localStorage.getItem(`supabase_mock_appointments_${userId}`);
      if (saved) return JSON.parse(saved);
      return userId === 'usr-demo' ? INITIAL_APPOINTMENTS : [];
    };

    const getPatients = () => {
      const saved = localStorage.getItem(`supabase_mock_patients_${userId}`);
      if (saved) return JSON.parse(saved);
      return [];
    };

    const getAgents = () => {
      const saved = localStorage.getItem(`supabase_mock_agents_${userId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (userId === 'usr-demo' && parsed.some((a: any) => a.name === 'Dr. Balot Hussain' || a.name === 'Dr. Amna Khan' || a.name === 'Dr. Yasir Rafiq' || a.name === 'Health Reception AI' || a.name === 'Welcome')) {
            return INITIAL_AGENTS;
          }
          return parsed;
        } catch (e) {
          return userId === 'usr-demo' ? INITIAL_AGENTS : [];
        }
      }
      return userId === 'usr-demo' ? INITIAL_AGENTS : [];
    };

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
              },
              then: async (onfulfilled?: any) => {
                await new Promise(r => setTimeout(r, 100));
                if (tableName === 'faqs') {
                  let data = getFaqs();
                  if (field !== 'user_id') {
                    data = data.filter((f: any) => f[field] === val);
                  }
                  return onfulfilled ? onfulfilled({ data, error: null }) : { data, error: null };
                } else if (tableName === 'services') {
                  let data = getServices();
                  if (field !== 'user_id') {
                    data = data.filter((s: any) => s[field] === val);
                  }
                  return onfulfilled ? onfulfilled({ data, error: null }) : { data, error: null };
                } else if (tableName === 'appointments') {
                  let data = getAppointments();
                  if (field !== 'user_id') {
                    data = data.filter((a: any) => a[field] === val);
                  }
                  return onfulfilled ? onfulfilled({ data, error: null }) : { data, error: null };
                } else if (tableName === 'patients') {
                  let data = getPatients();
                  if (field !== 'user_id') {
                    data = data.filter((p: any) => p[field] === val);
                  }
                  return onfulfilled ? onfulfilled({ data, error: null }) : { data, error: null };
                } else if (tableName === 'agents') {
                  let data = getAgents();
                  if (field !== 'user_id') {
                    data = data.filter((a: any) => a[field] === val);
                  }
                  return onfulfilled ? onfulfilled({ data, error: null }) : { data, error: null };
                }
                return onfulfilled ? onfulfilled({ data: null, error: { message: `Not supported` } }) : { data: null, error: { message: `Not supported` } };
              }
            };
          },
          then: async (onfulfilled?: any) => {
            await new Promise(r => setTimeout(r, 100));
            if (tableName === 'faqs') {
              const data = getFaqs();
              return onfulfilled ? onfulfilled({ data, error: null }) : { data, error: null };
            } else if (tableName === 'services') {
              const data = getServices();
              return onfulfilled ? onfulfilled({ data, error: null }) : { data, error: null };
            } else if (tableName === 'appointments') {
              const data = getAppointments();
              return onfulfilled ? onfulfilled({ data, error: null }) : { data, error: null };
            } else if (tableName === 'patients') {
              const data = getPatients();
              return onfulfilled ? onfulfilled({ data, error: null }) : { data, error: null };
            } else if (tableName === 'agents') {
              const data = getAgents();
              return onfulfilled ? onfulfilled({ data, error: null }) : { data, error: null };
            }
            return onfulfilled ? onfulfilled({ data: null, error: { message: `Not supported` } }) : { data: null, error: { message: `Not supported` } };
          }
        };
      },

      insert: (newData: any) => {
        return {
          then: async (onfulfilled?: any) => {
            await new Promise(r => setTimeout(r, 150));
            if (tableName === 'faqs') {
              const list = getFaqs();
              const itemsToInsert = Array.isArray(newData) ? newData : [newData];
              const processed = itemsToInsert.map(item => ({
                id: item.id || `faq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                question: item.question,
                answer: item.answer,
                category: item.category
              }));
              const updatedList = [...list, ...processed];
              localStorage.setItem(`supabase_mock_faqs_${userId}`, JSON.stringify(updatedList));
              return onfulfilled ? onfulfilled({ data: processed, error: null }) : { data: processed, error: null };
            } else if (tableName === 'services') {
              const list = getServices();
              const itemsToInsert = Array.isArray(newData) ? newData : [newData];
              const processed = itemsToInsert.map(item => ({
                id: item.id || `srv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                name: item.name,
                description: item.description,
                durationMinutes: item.durationMinutes,
                priceType: item.priceType,
                price: item.price,
                isActive: item.isActive !== undefined ? item.isActive : true
              }));
              const updatedList = [...list, ...processed];
              localStorage.setItem(`supabase_mock_services_${userId}`, JSON.stringify(updatedList));
              return onfulfilled ? onfulfilled({ data: processed, error: null }) : { data: processed, error: null };
            } else if (tableName === 'appointments') {
              const list = getAppointments();
              const itemsToInsert = Array.isArray(newData) ? newData : [newData];
              const processed = itemsToInsert.map(item => ({
                id: item.id || `apt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                customerName: item.customerName,
                phoneNumber: item.phoneNumber,
                vehicleYear: item.vehicleYear,
                vehicleMake: item.vehicleMake,
                vehicleModel: item.vehicleModel,
                serviceId: item.serviceId,
                scheduledAt: item.scheduledAt,
                status: item.status || 'confirmed',
                notes: item.notes || ''
              }));
              const updatedList = [...list, ...processed];
              localStorage.setItem(`supabase_mock_appointments_${userId}`, JSON.stringify(updatedList));
              return onfulfilled ? onfulfilled({ data: processed, error: null }) : { data: processed, error: null };
            } else if (tableName === 'patients') {
              const list = getPatients();
              const itemsToInsert = Array.isArray(newData) ? newData : [newData];
              const processed = itemsToInsert.map(item => ({
                id: item.id || `pat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                name: item.name,
                phone: item.phone,
                email: item.email,
                vehicle: item.vehicle,
                notes: item.notes || '',
                status: item.status || 'Active'
              }));
              const updatedList = [...list, ...processed];
              localStorage.setItem(`supabase_mock_patients_${userId}`, JSON.stringify(updatedList));
              return onfulfilled ? onfulfilled({ data: processed, error: null }) : { data: processed, error: null };
            } else if (tableName === 'agents') {
              const list = getAgents();
              const itemsToInsert = Array.isArray(newData) ? newData : [newData];
              const processed = itemsToInsert.map(item => ({
                id: item.id || `agt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                name: item.name,
                voice: item.voice || '',
                personality: item.personality || '',
                interruptionSensitivity: item.interruptionSensitivity || 'Medium',
                greetingMessage: item.greetingMessage || '',
                systemPrompt: item.systemPrompt || '',
                isActive: item.isActive !== undefined ? item.isActive : true
              }));
              const updatedList = [...list, ...processed];
              localStorage.setItem(`supabase_mock_agents_${userId}`, JSON.stringify(updatedList));
              return onfulfilled ? onfulfilled({ data: processed, error: null }) : { data: processed, error: null };
            }
            return onfulfilled ? onfulfilled({ data: null, error: { message: 'Table not supported in mock' } }) : { data: null, error: { message: 'Table not supported in mock' } };
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
              },
              then: async (onfulfilled?: any) => {
                await new Promise(r => setTimeout(r, 150));
                if (tableName === 'faqs') {
                  const list = getFaqs();
                  let updatedItem = null;
                  const updatedList = list.map((item: any) => {
                    if (item[field] === val) {
                      updatedItem = { ...item, ...updatedData };
                      // Clean up internal DB fields if any
                      delete (updatedItem as any).user_id;
                      return updatedItem;
                    }
                    return item;
                  });
                  localStorage.setItem(`supabase_mock_faqs_${userId}`, JSON.stringify(updatedList));
                  return onfulfilled ? onfulfilled({ data: updatedItem, error: null }) : { data: updatedItem, error: null };
                } else if (tableName === 'services') {
                  const list = getServices();
                  let updatedItem = null;
                  const updatedList = list.map((item: any) => {
                    if (item[field] === val) {
                      updatedItem = { ...item, ...updatedData };
                      delete (updatedItem as any).user_id;
                      return updatedItem;
                    }
                    return item;
                  });
                  localStorage.setItem(`supabase_mock_services_${userId}`, JSON.stringify(updatedList));
                  return onfulfilled ? onfulfilled({ data: updatedItem, error: null }) : { data: updatedItem, error: null };
                } else if (tableName === 'appointments') {
                  const list = getAppointments();
                  let updatedItem = null;
                  const updatedList = list.map((item: any) => {
                    if (item[field] === val) {
                      updatedItem = { ...item, ...updatedData };
                      delete (updatedItem as any).user_id;
                      return updatedItem;
                    }
                    return item;
                  });
                  localStorage.setItem(`supabase_mock_appointments_${userId}`, JSON.stringify(updatedList));
                  return onfulfilled ? onfulfilled({ data: updatedItem, error: null }) : { data: updatedItem, error: null };
                } else if (tableName === 'patients') {
                  const list = getPatients();
                  let updatedItem = null;
                  const updatedList = list.map((item: any) => {
                    if (item[field] === val) {
                      updatedItem = { ...item, ...updatedData };
                      delete (updatedItem as any).user_id;
                      return updatedItem;
                    }
                    return item;
                  });
                  localStorage.setItem(`supabase_mock_patients_${userId}`, JSON.stringify(updatedList));
                  return onfulfilled ? onfulfilled({ data: updatedItem, error: null }) : { data: updatedItem, error: null };
                } else if (tableName === 'agents') {
                  const list = getAgents();
                  let updatedItem = null;
                  const updatedList = list.map((item: any) => {
                    if (item[field] === val) {
                      updatedItem = { ...item, ...updatedData };
                      delete (updatedItem as any).user_id;
                      return updatedItem;
                    }
                    return item;
                  });
                  localStorage.setItem(`supabase_mock_agents_${userId}`, JSON.stringify(updatedList));
                  return onfulfilled ? onfulfilled({ data: updatedItem, error: null }) : { data: updatedItem, error: null };
                }
                return onfulfilled ? onfulfilled({ data: null, error: { message: 'Not supported' } }) : { data: null, error: { message: 'Not supported' } };
              }
            };
          }
        };
      },
 
      delete: () => {
        return {
          eq: (field: string, val: any) => {
            return {
              then: async (onfulfilled?: any) => {
                await new Promise(r => setTimeout(r, 150));
                if (tableName === 'faqs') {
                  const list = getFaqs();
                  const filtered = list.filter((item: any) => item[field] !== val);
                  localStorage.setItem(`supabase_mock_faqs_${userId}`, JSON.stringify(filtered));
                  return onfulfilled ? onfulfilled({ data: null, error: null }) : { data: null, error: null };
                } else if (tableName === 'services') {
                  const list = getServices();
                  const filtered = list.filter((item: any) => item[field] !== val);
                  localStorage.setItem(`supabase_mock_services_${userId}`, JSON.stringify(filtered));
                  return onfulfilled ? onfulfilled({ data: null, error: null }) : { data: null, error: null };
                } else if (tableName === 'appointments') {
                  const list = getAppointments();
                  const filtered = list.filter((item: any) => item[field] !== val);
                  localStorage.setItem(`supabase_mock_appointments_${userId}`, JSON.stringify(filtered));
                  return onfulfilled ? onfulfilled({ data: null, error: null }) : { data: null, error: null };
                } else if (tableName === 'patients') {
                  const list = getPatients();
                  const filtered = list.filter((item: any) => item[field] !== val);
                  localStorage.setItem(`supabase_mock_patients_${userId}`, JSON.stringify(filtered));
                  return onfulfilled ? onfulfilled({ data: null, error: null }) : { data: null, error: null };
                } else if (tableName === 'agents') {
                  const list = getAgents();
                  const filtered = list.filter((item: any) => item[field] !== val);
                  localStorage.setItem(`supabase_mock_agents_${userId}`, JSON.stringify(filtered));
                  return onfulfilled ? onfulfilled({ data: null, error: null }) : { data: null, error: null };
                } else if (tableName === 'business_profiles') {
                  localStorage.removeItem(`supabase_mock_profile_${val}`);
                  return onfulfilled ? onfulfilled({ data: null, error: null }) : { data: null, error: null };
                } else if (tableName === 'business_hours') {
                  localStorage.removeItem(`supabase_mock_hours_${val}`);
                  return onfulfilled ? onfulfilled({ data: null, error: null }) : { data: null, error: null };
                } else if (tableName === 'profiles') {
                  localStorage.removeItem(`supabase_mock_profile_${val}`);
                  return onfulfilled ? onfulfilled({ data: null, error: null }) : { data: null, error: null };
                }
                return onfulfilled ? onfulfilled({ data: null, error: { message: 'Not supported' } }) : { data: null, error: { message: 'Not supported' } };
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
const mockSupabase = new LocalStorageSupabaseMock();

export const supabase: any = {
  get isMock() {
    return useMockFallback;
  },

  auth: {
    signUp: async (params: any) => {
      await initSupabasePromise;
      if (!isSupabaseConfigured || !realClient) {
        return mockSupabase.auth.signUp(params);
      }
      try {
        const res = await realClient.auth.signUp(params);
        if (res.error) {
          console.warn('Real Supabase signUp error:', res.error.message);
          return res;
        }
        useMockFallback = false;
        return res;
      } catch (err: any) {
        console.warn('Real Supabase signUp exception:', err);
        return { data: { user: null, session: null }, error: err };
      }
    },

    signInWithPassword: async (params: any) => {
      await initSupabasePromise;
      if (params.email?.toLowerCase() === 'demo@medicall.ai') {
        useMockFallback = true;
        return mockSupabase.auth.signInWithPassword(params);
      }
      if (!isSupabaseConfigured || !realClient) {
        return mockSupabase.auth.signInWithPassword(params);
      }
      try {
        const res = await realClient.auth.signInWithPassword(params);
        if (res.error) {
          console.warn('Real Supabase signIn error:', res.error.message);
          return res;
        }
        useMockFallback = false;
        return res;
      } catch (err: any) {
        console.warn('Real Supabase signIn exception:', err);
        return { data: { user: null, session: null }, error: err };
      }
    },

    resetPasswordForEmail: async (email: string) => {
      await initSupabasePromise;
      if (email.toLowerCase() === 'demo@medicall.ai') {
        return mockSupabase.auth.resetPasswordForEmail(email);
      }
      if (!isSupabaseConfigured || !realClient) {
        return mockSupabase.auth.resetPasswordForEmail(email);
      }
      try {
        const res = await realClient.auth.resetPasswordForEmail(email);
        return res;
      } catch (err: any) {
        return { error: err };
      }
    },
 
    updateUser: async (attributes: any) => {
      await initSupabasePromise;
      if (useMockFallback || !realClient) {
        return mockSupabase.auth.updateUser(attributes);
      }
      try {
        const res = await realClient.auth.updateUser(attributes);
        return res;
      } catch (err: any) {
        return { error: err };
      }
    },

    signOut: async () => {
      await initSupabasePromise;
      if (realClient) {
        try {
          await realClient.auth.signOut();
        } catch (e) {}
      }
      await mockSupabase.auth.signOut();
      useMockFallback = !isSupabaseConfigured;
      return { error: null };
    },

    getUser: async () => {
      await initSupabasePromise;
      if (!isSupabaseConfigured || !realClient) {
        useMockFallback = true;
        return mockSupabase.auth.getUser();
      }
      try {
        const res = await realClient.auth.getUser();
        if (res.data?.user) {
          useMockFallback = false;
          return res;
        }
        const mockRes = await mockSupabase.auth.getUser();
        if (mockRes.data?.user) {
          useMockFallback = true;
          return mockRes;
        }
        useMockFallback = false;
        return res;
      } catch (err) {
        useMockFallback = true;
        return mockSupabase.auth.getUser();
      }
    },

    getSession: async () => {
      await initSupabasePromise;
      if (!isSupabaseConfigured || !realClient) {
        useMockFallback = true;
        return mockSupabase.auth.getSession();
      }
      try {
        const res = await realClient.auth.getSession();
        if (res.data?.session) {
          useMockFallback = false;
          return res;
        }
        const mockRes = await mockSupabase.auth.getSession();
        if (mockRes.data?.session) {
          useMockFallback = true;
          return mockRes;
        }
        useMockFallback = false;
        return res;
      } catch (err) {
        useMockFallback = true;
        return mockSupabase.auth.getSession();
      }
    },

    onAuthStateChange: (callback: any) => {
      const mockUnsubscribe = mockSupabase.auth.onAuthStateChange(callback);
      let realUnsubscribe: any = null;
      initSupabasePromise.then(() => {
        if (realClient) {
          try {
            const { data } = realClient.auth.onAuthStateChange(callback);
            realUnsubscribe = data?.subscription;
          } catch (e) {}
        }
      });
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              if (mockUnsubscribe?.data?.subscription) {
                mockUnsubscribe.data.subscription.unsubscribe();
              } else if (typeof mockUnsubscribe === 'function') {
                (mockUnsubscribe as any)();
              }
              if (realUnsubscribe) {
                if (typeof realUnsubscribe.unsubscribe === 'function') {
                  realUnsubscribe.unsubscribe();
                } else if (typeof realUnsubscribe === 'function') {
                  realUnsubscribe();
                }
              }
            }
          }
        }
      };
    }
  },

  from: (tableName: string) => {
    const chain: { prop: string | symbol; args: any[] }[] = [];

    const builder: any = new Proxy({}, {
      get(target, prop) {
        if (prop === 'then') {
          return async (onfulfilled?: any, onrejected?: any) => {
            await initSupabasePromise;
            
            // Determine if we should use mock or real
            if (useMockFallback || !realClient) {
              let mockQuery = mockSupabase.from(tableName);
              for (const call of chain) {
                if (typeof mockQuery[call.prop] === 'function') {
                  mockQuery = mockQuery[call.prop].apply(mockQuery, call.args);
                }
              }
              const res = await mockQuery;
              return onfulfilled ? onfulfilled(res) : res;
            }

            try {
              let realQuery = realClient.from(tableName);
              for (const call of chain) {
                if (typeof realQuery[call.prop] === 'function') {
                  realQuery = realQuery[call.prop].apply(realQuery, call.args);
                }
              }
              const res = await realQuery;
              if (res && res.error) {
                console.error(`Supabase real query error on table "${tableName}":`, res.error);
              }
              return onfulfilled ? onfulfilled(res) : res;
            } catch (err) {
              console.error(`Supabase real query exception on table "${tableName}":`, err);
              return onrejected ? onrejected(err) : Promise.reject(err);
            }
          };
        }

        if (prop === 'catch') {
          return (onrejected?: any) => builder.then(undefined, onrejected);
        }

        if (prop === 'finally') {
          return (onfinally?: any) => builder.then(
            (res: any) => { onfinally && onfinally(); return res; },
            (err: any) => { onfinally && onfinally(); throw err; }
          );
        }

        if (prop === 'constructor' || typeof prop === 'symbol') {
          return undefined;
        }

        return (...args: any[]) => {
          chain.push({ prop, args });
          return builder;
        };
      }
    });

    return builder;
  }
};
