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
    return saved ? JSON.parse(saved) : INITIAL_AGENTS;
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
        .update(newProfile)
        .eq('id', user.id)
        .select()
        .single();
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
        .update(newHours)
        .eq('id', user.id)
        .select()
        .single();
    } catch (err) {
      console.error('Error syncing hours to Supabase:', err);
    }
  };

  // Handle direct appointment booking from landing page live demo widget
  const handleLandingPageBooking = (name: string, vehicle: string, serviceName: string) => {
    const matchedService = services.find(s => s.name.toLowerCase().includes(serviceName.toLowerCase())) || services[0];
    
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      customerName: name,
      phoneNumber: '9999999999',
      vehicleYear: '2021',
      vehicleMake: vehicle.split(' ')[1] || 'Toyota',
      vehicleModel: vehicle.split(' ')[2] || 'Camry',
      serviceId: matchedService?.id || 'srv-2',
      scheduledAt: 'Saturday 10:00 AM',
      status: 'confirmed',
      notes: 'Booked directly via Landing Page Live Demo Phone!'
    };

    setAppointments(prev => [newApt, ...prev]);

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
  const ProtectedDashboard = ({ activeTab }: { activeTab: 'overview' | 'analytics' | 'conversations' | 'appointments' | 'schedule' | 'patients' | 'support' | 'agents' | 'services' | 'faqs' | 'widget' | 'website' | 'billing' | 'notifications' | 'settings' }) => {
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
          <Route path="/" element={<LandingPage onAppointmentBooked={handleLandingPageBooking} isLoggedIn={isLoggedIn} />} />
          <Route path="/login" element={<PublicRoute><LoginPage onLogin={() => setIsLoggedIn(true)} /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage onSignup={() => setIsLoggedIn(true)} /></PublicRoute>} />

          {/* Protected Tabbed Dashboard Routes */}
          <Route path="/overview" element={<ProtectedDashboard activeTab="overview" />} />
          <Route path="/analytics" element={<ProtectedDashboard activeTab="analytics" />} />
          <Route path="/conversations" element={<ProtectedDashboard activeTab="conversations" />} />
          <Route path="/appointments" element={<ProtectedDashboard activeTab="appointments" />} />
          <Route path="/schedule" element={<ProtectedDashboard activeTab="schedule" />} />
          <Route path="/patients" element={<ProtectedDashboard activeTab="patients" />} />
          <Route path="/support" element={<ProtectedDashboard activeTab="support" />} />
          <Route path="/agents" element={<ProtectedDashboard activeTab="agents" />} />
          <Route path="/services" element={<ProtectedDashboard activeTab="services" />} />
          <Route path="/faqs" element={<ProtectedDashboard activeTab="faqs" />} />
          <Route path="/widget" element={<ProtectedDashboard activeTab="widget" />} />
          <Route path="/website" element={<ProtectedDashboard activeTab="website" />} />
          <Route path="/billing" element={<ProtectedDashboard activeTab="billing" />} />
          <Route path="/notifications" element={<ProtectedDashboard activeTab="notifications" />} />
          <Route path="/settings" element={<ProtectedDashboard activeTab="settings" />} />

          {/* Dynamic fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
