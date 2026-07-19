import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import { Appointment, Conversation, AIAgent, Service, FAQ, WidgetConfig, BusinessProfile, BusinessHours } from './types';
import { 
  INITIAL_APPOINTMENTS, INITIAL_CONVERSATIONS, INITIAL_AGENTS, 
  INITIAL_SERVICES, INITIAL_FAQS, INITIAL_WIDGETS, 
  INITIAL_PROFILE, INITIAL_HOURS 
} from './data';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('vd_is_logged_in');
    return saved ? JSON.parse(saved) : false;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('vd_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('vd_conversations');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [agents, setAgents] = useState<AIAgent[]>(() => {
    const saved = localStorage.getItem('vd_agents');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.some((a: any) => a.name === 'Dr. Balot Hussain' || a.name === 'Dr. Amna Khan' || a.name === 'Dr. Yasir Rafiq' || a.name === 'Health Reception AI' || a.name === 'Welcome')) {
          return INITIAL_AGENTS;
        }
        return parsed;
      } catch (e) {
        return INITIAL_AGENTS;
      }
    }
    return INITIAL_AGENTS;
  });

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('vd_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [faqs, setFaqs] = useState<FAQ[]>(() => {
    const saved = localStorage.getItem('vd_faqs');
    return saved ? JSON.parse(saved) : INITIAL_FAQS;
  });

  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem('vd_widgets');
    return saved ? JSON.parse(saved) : INITIAL_WIDGETS;
  });

  const [profile, setProfile] = useState<BusinessProfile>(() => {
    const saved = localStorage.getItem('vd_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [hours, setHours] = useState<BusinessHours>(() => {
    const saved = localStorage.getItem('vd_hours');
    return saved ? JSON.parse(saved) : INITIAL_HOURS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('vd_is_logged_in', JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('vd_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('vd_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('vd_agents', JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    localStorage.setItem('vd_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('vd_faqs', JSON.stringify(faqs));
  }, [faqs]);

  useEffect(() => {
    localStorage.setItem('vd_widgets', JSON.stringify(widgets));
  }, [widgets]);

  useEffect(() => {
    localStorage.setItem('vd_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('vd_hours', JSON.stringify(hours));
  }, [hours]);

  // Load profile and hours from Supabase when logged in
  useEffect(() => {
    const fetchSupabaseData = async () => {
      if (!isLoggedIn) return;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch Business Profile
        const { data: profileData, error: profileErr } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData && !profileErr) {
          setProfile(profileData);
        }

        // Fetch Business Hours
        const { data: hoursData, error: hoursErr } = await supabase
          .from('business_hours')
          .select('*')
          .eq('id', user.id)
          .single();

        if (hoursData && !hoursErr) {
          const formattedHours: BusinessHours = {
            sunday: typeof hoursData.sunday === 'string' ? JSON.parse(hoursData.sunday) : hoursData.sunday,
            monday: typeof hoursData.monday === 'string' ? JSON.parse(hoursData.monday) : hoursData.monday,
            tuesday: typeof hoursData.tuesday === 'string' ? JSON.parse(hoursData.tuesday) : hoursData.tuesday,
            wednesday: typeof hoursData.wednesday === 'string' ? JSON.parse(hoursData.wednesday) : hoursData.wednesday,
            thursday: typeof hoursData.thursday === 'string' ? JSON.parse(hoursData.thursday) : hoursData.thursday,
            friday: typeof hoursData.friday === 'string' ? JSON.parse(hoursData.friday) : hoursData.friday,
            saturday: typeof hoursData.saturday === 'string' ? JSON.parse(hoursData.saturday) : hoursData.saturday,
          };
          setHours(formattedHours);
        }

        // Fetch FAQs from Supabase
        const { data: faqsData, error: faqsErr } = await supabase
          .from('faqs')
          .select('*')
          .eq('user_id', user.id);

        if (faqsData && !faqsErr) {
          setFaqs(faqsData);
        }

        // Fetch Services from Supabase
        const { data: servicesData, error: servicesErr } = await supabase
          .from('services')
          .select('*')
          .eq('user_id', user.id);

        if (servicesData && !servicesErr) {
          setServices(servicesData);
        }

        // Fetch Appointments from Supabase
        const { data: appointmentsData, error: appointmentsErr } = await supabase
          .from('appointments')
          .select('*')
          .eq('user_id', user.id);

        if (appointmentsData && !appointmentsErr) {
          setAppointments(appointmentsData);
        }

        // Fetch Agents from Supabase and auto-seed Admin if empty
        let { data: agentsData, error: agentsErr } = await supabase
          .from('agents')
          .select('*')
          .eq('user_id', user.id);

        if (!agentsErr) {
          if (!agentsData || agentsData.length === 0) {
            const adminAgent = {
              id: 'agt-admin',
              user_id: user.id,
              name: 'Admin',
              voice: 'General Medicine Expert',
              personality: 'Professional, knowledgeable, and efficient',
              interruptionSensitivity: 'Medium',
              greetingMessage: 'Hello! I am Admin, your AI Clinic Manager. I can help you find services, book appointments, and answer general questions about our clinic. How can I assist you today?',
              systemPrompt: 'You are the Admin AI Clinic Manager. You are professional, knowledgeable, and direct. Help clients find our medical services, answer FAQs about clinical policies, and assist with scheduling appointments. Always remain courteous and prompt.',
              isActive: true,
            };

            const { error: insertErr } = await supabase
              .from('agents')
              .insert(adminAgent);

            if (!insertErr) {
              agentsData = [adminAgent];
            } else {
              console.error('Error auto-seeding Admin agent to Supabase:', insertErr);
            }
          }

          if (agentsData && agentsData.length > 0) {
            const formattedAgents = agentsData.map(({ user_id, ...agent }: any) => agent);
            setAgents(formattedAgents);
          }
        } else {
          console.error('Error fetching agents from Supabase:', agentsErr);
        }
      } catch (err) {
        console.error('Error fetching data from Supabase:', err);
      }
    };

    fetchSupabaseData();
  }, [isLoggedIn]);

  // Supabase Sync Updaters
  const handleUpdateProfile = async (newProfile: BusinessProfile) => {
    setProfile(newProfile);
    if (!isLoggedIn) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('business_profiles')
        .upsert({ id: user.id, ...newProfile });
    } catch (err) {
      console.error('Error syncing profile to Supabase:', err);
    }
  };

  const handleUpdateHours = async (newHours: BusinessHours) => {
    setHours(newHours);
    if (!isLoggedIn) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('business_hours')
        .upsert({ id: user.id, ...newHours });
    } catch (err) {
      console.error('Error syncing hours to Supabase:', err);
    }
  };

  // Handle direct appointment booking from landing page live demo widget
  const handleLandingPageBooking = async (name: string, vehicle: string, serviceName: string) => {
    const matchedService = services.find(s => s.name.toLowerCase().includes(serviceName.toLowerCase())) || services[0];
    
    const id = `apt-${Date.now()}`;
    let user_id = null;
    if (isLoggedIn) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        user_id = user ? user.id : null;
      } catch (err) {
        console.error('Error fetching user for landing page booking:', err);
      }
    }

    const newAptObj = {
      id,
      user_id,
      customerName: name,
      phoneNumber: '9999999999',
      vehicleYear: '2021',
      vehicleMake: vehicle.split(' ')[1] || 'Toyota',
      vehicleModel: vehicle.split(' ')[2] || 'Camry',
      serviceId: matchedService?.id || 'srv-2',
      scheduledAt: 'Saturday 10:00 AM',
      status: 'confirmed' as const,
      notes: 'Booked directly via Landing Page Live Demo Phone!'
    };

    if (isLoggedIn) {
      try {
        await supabase
          .from('appointments')
          .insert(newAptObj);
      } catch (err) {
        console.error('Error storing landing page appointment to Supabase:', err);
      }
    }

    const { user_id: _, ...localApt } = newAptObj as any;
    setAppointments(prev => [localApt, ...prev]);

    // Create custom conversation transcript log
    const newConv: Conversation = {
      id: `con-${Date.now()}`,
      callerName: name,
      callerPhone: '9999999999',
      status: 'completed',
      duration: '1:30',
      sentiment: 'positive',
      appointmentBooked: true,
      startedAt: 'Just now',
      transcript: [
        { sender: 'agent', text: 'Thank you for calling AutoCare Pro Garage, how can I help you today?', timestamp: '0:01' },
        { sender: 'user', text: `I want to book an ${serviceName}`, timestamp: '0:15' },
        { sender: 'agent', text: 'I would be happy to book that. What vehicle is this for?', timestamp: '0:30' },
        { sender: 'user', text: `It is for my ${vehicle}`, timestamp: '0:42' },
        { sender: 'agent', text: 'Perfect. I have scheduled Saturday 10:00 AM. May I get your name?', timestamp: '1:00' },
        { sender: 'user', text: `My name is ${name}`, timestamp: '1:12' },
        { sender: 'agent', text: 'Excellent! Your appointment is fully confirmed. Have a great day!', timestamp: '1:28' }
      ]
    };

    setConversations(prev => [newConv, ...prev]);
  };

  // Helper component to guard protected dashboard routes
  const ProtectedDashboard = ({ activeTab }: { activeTab: 'overview' | 'analytics' | 'appointments' | 'schedule' | 'patients' | 'agents' | 'services' | 'faqs' | 'notifications' | 'settings' }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }
    return (
      <Dashboard 
        activeTab={activeTab}
        appointments={appointments}
        conversations={conversations}
        agents={agents}
        services={services}
        faqs={faqs}
        widgets={widgets}
        profile={profile}
        hours={hours}
        onUpdateAppointments={setAppointments}
        onUpdateConversations={setConversations}
        onUpdateAgents={setAgents}
        onUpdateServices={setServices}
        onUpdateFAQs={setFaqs}
        onUpdateWidgets={setWidgets}
        onUpdateProfile={handleUpdateProfile}
        onUpdateHours={handleUpdateHours}
        onSignOut={async () => {
          await supabase.auth.signOut();
          setIsLoggedIn(false);
          setFaqs([]);
          setServices([]);
          setAppointments([]);
          setProfile(INITIAL_PROFILE);
          setHours(INITIAL_HOURS);
          localStorage.removeItem('vd_faqs');
          localStorage.removeItem('vd_services');
          localStorage.removeItem('vd_appointments');
          localStorage.removeItem('vd_profile');
          localStorage.removeItem('vd_hours');
        }}
      />
    );
  };

  // Helper component to guard public routes
  const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    if (isLoggedIn) {
      return <Navigate to="/overview" replace />;
    }
    return <>{children}</>;
  };

  return (
    <div className="min-h-screen font-sans bg-[#04060c] text-gray-100 dark">
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage onAppointmentBooked={handleLandingPageBooking} isLoggedIn={isLoggedIn} agents={agents} />} />
          <Route path="/login" element={<PublicRoute><LoginPage onLogin={() => setIsLoggedIn(true)} /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage onSignup={() => setIsLoggedIn(true)} /></PublicRoute>} />

          {/* Protected Tabbed Dashboard Routes */}
          <Route path="/overview" element={<ProtectedDashboard activeTab="overview" />} />
          <Route path="/analytics" element={<ProtectedDashboard activeTab="analytics" />} />
          <Route path="/appointments" element={<ProtectedDashboard activeTab="appointments" />} />
          <Route path="/schedule" element={<ProtectedDashboard activeTab="schedule" />} />
          <Route path="/patients" element={<ProtectedDashboard activeTab="patients" />} />
          <Route path="/agents" element={<ProtectedDashboard activeTab="agents" />} />
          <Route path="/services" element={<ProtectedDashboard activeTab="services" />} />
          <Route path="/faqs" element={<ProtectedDashboard activeTab="faqs" />} />
          <Route path="/notifications" element={<ProtectedDashboard activeTab="notifications" />} />
          <Route path="/settings" element={<ProtectedDashboard activeTab="settings" />} />

          {/* Dynamic fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
