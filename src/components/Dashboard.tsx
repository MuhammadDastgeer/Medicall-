import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, Calendar, MessageSquare, Settings, Users, FolderKanban, 
  HelpCircle, Code, LogOut, ChevronRight, ChevronLeft, Plus, Search, Filter, 
  TrendingUp, Play, Edit, Trash2, CheckCircle2, Clock, MapPin, 
  Mail, Phone, RefreshCw, Star, Info, ShieldAlert, Sparkles, X, ChevronDown, Check,
  Sliders, Eye, Activity, Heart, CalendarDays, Headphones, Globe, CreditCard, Bell, Shield, ArrowRight, Share2, DollarSign,
  LayoutGrid, Bot, ClipboardList
} from 'lucide-react';
import { motion } from 'motion/react';
import { Appointment, Conversation, AIAgent, Service, FAQ, WidgetConfig, BusinessProfile, BusinessHours } from '../types';
import DialerSim from './DialerSim';

interface DashboardProps {
  activeTab: 'overview' | 'analytics' | 'conversations' | 'appointments' | 'schedule' | 'patients' | 'support' | 'agents' | 'services' | 'faqs' | 'widget' | 'website' | 'billing' | 'notifications' | 'settings';
  appointments: Appointment[];
  conversations: Conversation[];
  agents: AIAgent[];
  services: Service[];
  faqs: FAQ[];
  widgets: WidgetConfig[];
  profile: BusinessProfile;
  hours: BusinessHours;
  onUpdateAppointments: (apts: Appointment[]) => void;
  onUpdateConversations: (convs: Conversation[]) => void;
  onUpdateAgents: (agts: AIAgent[]) => void;
  onUpdateServices: (srvs: Service[]) => void;
  onUpdateFAQs: (faqs: FAQ[]) => void;
  onUpdateWidgets: (wdgs: WidgetConfig[]) => void;
  onUpdateProfile: (prof: BusinessProfile) => void;
  onUpdateHours: (hrs: BusinessHours) => void;
  onSignOut: () => void;
}

export default function Dashboard({
  activeTab,
  appointments, conversations, agents, services, faqs, widgets, profile, hours,
  onUpdateAppointments, onUpdateConversations, onUpdateAgents, onUpdateServices, 
  onUpdateFAQs, onUpdateWidgets, onUpdateProfile, onUpdateHours, onSignOut
}: DashboardProps) {
  
  const navigate = useNavigate();
  
  // Sidebar collapsed state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Modals state
  const [showAptModal, setShowAptModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  
  // Selected conversation for transcription viewer
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(conversations[0] || null);
  const [convSubTab, setConvSubTab] = useState<'list' | 'chat'>('list');
  
  // Search and filter inputs
  const [aptSearch, setAptSearch] = useState('');
  const [aptFilter, setAptFilter] = useState<string>('all');
  const [convSearch, setConvSearch] = useState('');
  const [convFilter, setConvFilter] = useState<string>('all');

  // Agent configurations / Studio tab selection
  const [selectedAgentForStudio, setSelectedAgentForStudio] = useState<AIAgent | null>(agents[0] || null);
  const [studioSubTab, setStudioSubTab] = useState<'configure' | 'test'>('configure');
  const [agentSubTab, setAgentSubTab] = useState<'list' | 'studio' | 'edit'>('list');
  const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null);

  // Form states
  const [newApt, setNewApt] = useState<Partial<Appointment>>({
    customerName: '', phoneNumber: '', vehicleYear: '2021', vehicleMake: 'Toyota', vehicleModel: 'Camry',
    serviceId: services[0]?.id || '', scheduledAt: '', status: 'pending', notes: ''
  });

  const [newAgent, setNewAgent] = useState<Partial<AIAgent>>({
    name: '', voice: 'Alloy - Neutral', personality: 'Professional', interruptionSensitivity: 'Medium',
    greetingMessage: 'Hello! Thank you for calling... How can I assist you?',
    systemPrompt: 'You are a professional auto repair assistant...'
  });

  const [newService, setNewService] = useState<Partial<Service>>({
    name: '', description: '', durationMinutes: 60, priceType: 'Fixed Price', price: 49.99, isActive: true
  });

  const [newFaq, setNewFaq] = useState<Partial<FAQ>>({
    question: '', answer: '', category: 'General'
  });

  const [settingsTab, setSettingsTab] = useState<'profile' | 'hours'>('profile');

  // Schedule / Calendar state
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('2026-05-16');
  
  // Patients list state
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patients, setPatients] = useState([
    { id: 'p1', name: 'Sarah Jenkins', phone: '(555) 019-2834', email: 'sarah.j@example.com', vehicle: '2021 Toyota Camry', notes: 'Scheduled for Oil Change on May 16. Prefers mornings.', status: 'Active' },
    { id: 'p2', name: 'John Smith', phone: '(555) 014-9912', email: 'john.smith@example.com', vehicle: '2019 Ford F-150', notes: 'Brake inspection booked. Requires standard billing invoice.', status: 'Active' },
    { id: 'p3', name: 'Robert Chen', phone: '(555) 022-1845', email: 'robert.chen@example.com', vehicle: '2022 Tesla Model 3', notes: 'General inquiry about electric vehicle diagnostics & alignment.', status: 'Active' },
    { id: 'p4', name: 'Emily Rodriguez', phone: '(555) 017-4831', email: 'emily.rod@example.com', vehicle: '2020 Honda Civic', notes: 'Awaiting clinical auto recall response on transmission fluid.', status: 'Completed' },
    { id: 'p5', name: 'Michael Chang', phone: '(555) 011-3829', email: 'mchang@example.com', vehicle: '2023 BMW X5', notes: 'Interested in premier maintenance packages and warranty checks.', status: 'Pending' }
  ]);
  const [newPatient, setNewPatient] = useState({ name: '', phone: '', email: '', vehicle: '', notes: '' });

  // Help Support state
  const [selectedTicketId, setSelectedTicketId] = useState('t1');
  const [supportTickets, setSupportTickets] = useState([
    { id: 't1', title: 'Voice widget latency on Safari', status: 'Open', priority: 'High', date: 'May 16, 2026', category: 'Widget', description: 'Patients reporting that click-to-call button on our clinic landing page freezes for 2 seconds before requesting microphone permissions on iOS.' },
    { id: 't2', title: 'Inbound patient phone number configuration', status: 'In Progress', priority: 'Critical', date: 'May 15, 2026', category: 'Voice Network', description: 'Trying to route our standard phone line through the custom MediCall AI Agent. Calls are getting dropped during transit.' },
    { id: 't3', title: 'Download monthly clinical invoices', status: 'Resolved', priority: 'Low', date: 'May 10, 2026', category: 'Billing', description: 'Need an easy way to download previous invoices for accounting/tax files directly.' }
  ]);
  const [supportChat, setSupportChat] = useState([
    { sender: 'ai', text: 'Hello! I am your MediCall virtual assistant. How can I assist you with your AI Voice desk today?', time: '10:30 AM' }
  ]);
  const [newSupportChatMsg, setNewSupportChatMsg] = useState('');

  // Widget customizer / website state
  const [widgetBtnText, setWidgetBtnText] = useState('Call Doctor AI');
  const [widgetBtnPosition, setWidgetBtnPosition] = useState<'right' | 'left'>('right');
  const [widgetBtnColor, setWidgetBtnColor] = useState('#2563eb');
  const [widgetBtnGreeting, setWidgetBtnGreeting] = useState('Hello! Tap to speak with our clinical AI receptionist instantly.');
  const [isWidgetSaved, setIsWidgetSaved] = useState(false);

  // Billing view state
  const [isUpgraded, setIsUpgraded] = useState(false);
  const [billingPlan, setBillingPlan] = useState('Pro Business Tier');

  // Notifications state
  const [notificationsHistory, setNotificationsHistory] = useState([
    { id: 'n1', title: 'AI Call Completed', body: 'AI receptionist successfully handled call with Sarah Jenkins. Appointment scheduled.', time: '5 mins ago', read: false, type: 'call' },
    { id: 'n2', title: 'Appointment Booked', body: 'Sarah Jenkins booked Oil Change on Saturday, May 16 at 09:00 AM.', time: '8 mins ago', read: false, type: 'calendar' },
    { id: 'n3', title: 'Inbound Line Active', body: 'New clinical inbound number +1 (800) 555-0192 is now active.', time: '1 hour ago', read: true, type: 'system' },
    { id: 'n4', title: 'Knowledge Updated', body: 'FAQ question "Do you accept digital medical insurance?" updated.', time: '1 day ago', read: true, type: 'setup' }
  ]);
  const [notifEmailAlert, setNotifEmailAlert] = useState(true);
  const [notifSmsAlert, setNotifSmsAlert] = useState(true);
  const [notifSlackAlert, setNotifSlackAlert] = useState(false);
  const [notifWeeklyReport, setNotifWeeklyReport] = useState(true);

  // Active FAQ category filter
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<string>('All');

  // Update business profile handler
  const handleProfileChange = (field: keyof BusinessProfile, value: string) => {
    onUpdateProfile({ ...profile, [field]: value });
  };

  // Update business hours handler
  const handleHoursChange = (day: keyof BusinessHours, field: 'isOpen' | 'from' | 'to', value: any) => {
    onUpdateHours({
      ...hours,
      [day]: {
        ...hours[day],
        [field]: value
      }
    });
  };

  // Create appointment
  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApt.customerName || !newApt.phoneNumber) return;
    
    const formattedApt: Appointment = {
      id: `apt-${Date.now()}`,
      customerName: newApt.customerName,
      phoneNumber: newApt.phoneNumber,
      vehicleYear: newApt.vehicleYear || '2021',
      vehicleMake: newApt.vehicleMake || 'Toyota',
      vehicleModel: newApt.vehicleModel || 'Camry',
      serviceId: newApt.serviceId || services[0]?.id || 'srv-2',
      scheduledAt: newApt.scheduledAt ? newApt.scheduledAt.replace('T', ' ') : 'May 16, 2026 3:30 PM',
      status: (newApt.status as any) || 'pending',
      notes: newApt.notes || ''
    };

    onUpdateAppointments([formattedApt, ...appointments]);
    setShowAptModal(false);
    // Reset
    setNewApt({
      customerName: '', phoneNumber: '', vehicleYear: '2021', vehicleMake: 'Toyota', vehicleModel: 'Camry',
      serviceId: services[0]?.id || '', scheduledAt: '', status: 'pending', notes: ''
    });
  };

  // Create agent
  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgent.name) return;

    const formattedAgent: AIAgent = {
      id: `agt-${Date.now()}`,
      name: newAgent.name,
      voice: newAgent.voice || 'Alloy - Neutral',
      personality: newAgent.personality || 'Professional',
      interruptionSensitivity: (newAgent.interruptionSensitivity as any) || 'Medium',
      greetingMessage: newAgent.greetingMessage || 'Hello! Thank you for calling...',
      systemPrompt: newAgent.systemPrompt || 'You are a professional assistant...',
      isActive: true
    };

    onUpdateAgents([...agents, formattedAgent]);
    setSelectedAgentForStudio(formattedAgent);
    setShowAgentModal(false);
    setNewAgent({
      name: '', voice: 'Alloy - Neutral', personality: 'Professional', interruptionSensitivity: 'Medium',
      greetingMessage: 'Hello! Thank you for calling... How can I assist you?',
      systemPrompt: 'You are a professional auto repair assistant...'
    });
  };

  // Create service
  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.name) return;

    const formattedService: Service = {
      id: `srv-${Date.now()}`,
      name: newService.name,
      description: newService.description || '',
      durationMinutes: Number(newService.durationMinutes) || 60,
      priceType: (newService.priceType as any) || 'Fixed Price',
      price: Number(newService.price) || 0,
      isActive: true
    };

    onUpdateServices([...services, formattedService]);
    setShowServiceModal(false);
    setNewService({
      name: '', description: '', durationMinutes: 60, priceType: 'Fixed Price', price: 49.99, isActive: true
    });
  };

  // Create FAQ
  const handleCreateFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaq.question || !newFaq.answer) return;

    const formattedFaq: FAQ = {
      id: `faq-${Date.now()}`,
      question: newFaq.question,
      answer: newFaq.answer,
      category: newFaq.category || 'General'
    };

    onUpdateFAQs([...faqs, formattedFaq]);
    setShowFaqModal(false);
    setNewFaq({ question: '', answer: '', category: 'General' });
  };

  // Delete handlers
  const deleteAppointment = (id: string) => {
    onUpdateAppointments(appointments.filter(a => a.id !== id));
  };

  const deleteAgent = (id: string) => {
    onUpdateAgents(agents.filter(a => a.id !== id));
    if (selectedAgentForStudio?.id === id) {
      setSelectedAgentForStudio(agents.find(a => a.id !== id) || null);
    }
  };

  const deleteService = (id: string) => {
    onUpdateServices(services.filter(s => s.id !== id));
  };

  const deleteFaq = (id: string) => {
    onUpdateFAQs(faqs.filter(f => f.id !== id));
  };

  // Filter lists
  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.customerName.toLowerCase().includes(aptSearch.toLowerCase()) || 
                          apt.phoneNumber.includes(aptSearch);
    const matchesFilter = aptFilter === 'all' || apt.status === aptFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.callerName.toLowerCase().includes(convSearch.toLowerCase()) || 
                          conv.callerPhone.includes(convSearch);
    const matchesFilter = convFilter === 'all' || conv.status === convFilter || 
                          (convFilter === 'booked' && conv.appointmentBooked);
    return matchesSearch && matchesFilter;
  });

  const filteredFAQs = faqCategoryFilter === 'All' 
    ? faqs 
    : faqs.filter(f => f.category.toLowerCase() === faqCategoryFilter.toLowerCase());

  const faqCategories = ['All', ...Array.from(new Set(faqs.map(f => f.category)))];

  // Appointment booked from Dialer simulator directly!
  const handleDirectDialerBooking = (name: string, vehicle: string, serviceName: string) => {
    // Find service ID
    const matchingService = services.find(s => s.name.toLowerCase().includes(serviceName.toLowerCase())) || services[0];
    
    // Add appointment
    const newAptObj: Appointment = {
      id: `apt-${Date.now()}`,
      customerName: name,
      phoneNumber: '9999999999',
      vehicleYear: '2021',
      vehicleMake: vehicle.split(' ')[1] || 'Toyota',
      vehicleModel: vehicle.split(' ')[2] || 'Camry',
      serviceId: matchingService.id,
      scheduledAt: 'Saturday 10:00 AM',
      status: 'confirmed',
      notes: 'Booked via simulated live dialer receptionist'
    };

    onUpdateAppointments([newAptObj, ...appointments]);

    // Add conversation
    const newConvObj: Conversation = {
      id: `con-${Date.now()}`,
      callerName: name,
      callerPhone: '9999999999',
      status: 'completed',
      duration: '1:45',
      sentiment: 'positive',
      appointmentBooked: true,
      startedAt: 'Just now',
      transcript: [
        { sender: 'agent', text: 'Hello, how can I assist you today?', timestamp: '0:01' },
        { sender: 'user', text: `I want to book an ${serviceName} for my ${vehicle}`, timestamp: '0:15' },
        { sender: 'agent', text: `Sure, I have a slot available this Saturday at 10:00 AM. May I get your name?`, timestamp: '0:45' },
        { sender: 'user', text: `Yes, please book it under ${name}`, timestamp: '1:10' },
        { sender: 'agent', text: 'Excellent! Your appointment is fully confirmed. Have a great day!', timestamp: '1:40' }
      ]
    };

    onUpdateConversations([newConvObj, ...conversations]);
    setSelectedConv(newConvObj);
  };

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-[#080d1a] text-[#F8FAFC] font-sans flex flex-col md:flex-row relative overflow-hidden selection:bg-[#2563eb] selection:text-white">
      
      {/* Dynamic atmospheric ambient background lights */}
      <div className="absolute top-[-20%] left-[-10%] w-[45%] h-[40%] bg-[#2563eb]/8 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[45%] h-[45%] bg-[#7c3aed]/8 rounded-full blur-[160px] pointer-events-none"></div>

      {/* SIDEBAR NAVIGATION */}
      <aside className={`w-full bg-[#0d172a] border-r border-[#1e293b] flex flex-col justify-between shrink-0 relative z-20 shadow-2xl shadow-black/50 transition-all duration-300 ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}>
        <div className="overflow-y-auto flex-1 pb-4">
          {/* Sidebar Header */}
          <div className={`p-4 border-b border-[#1e293b] flex ${isSidebarCollapsed ? 'flex-col gap-3 items-center justify-center' : 'items-center justify-between'} bg-[#0d172a] h-[73px] transition-all duration-300`}>
            <div className="flex items-center gap-3 group cursor-pointer overflow-hidden" onClick={() => navigate('/')}>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 rounded-xl bg-[#121e36] border border-[#1e293b] flex items-center justify-center shadow-lg shadow-[#2563eb]/5 shrink-0 relative"
              >
                {/* Green online dot */}
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#0d172a] animate-pulse"></span>
                <div className="relative">
                  <Heart className="w-5 h-5 text-[#2563eb] fill-[#2563eb]/10" />
                  <Activity className="w-3.5 h-3.5 text-white absolute inset-0 m-auto mt-0.5 animate-pulse" />
                </div>
              </motion.div>
              {!isSidebarCollapsed && (
                <div className="whitespace-nowrap">
                  <span className="font-display font-black text-[#F8FAFC] text-sm block tracking-tight">Medi<span className="text-[#2563eb]">Call</span></span>
                  <span className="text-[10px] text-[#617496] block font-bold tracking-wide">AI Voice Platform</span>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg bg-[#121e36] border border-[#1e293b] text-[#617496] hover:text-[#F8FAFC] hover:bg-[#1a2e4c] transition-colors cursor-pointer shrink-0"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Business Profile Selector */}
          <div className="p-3 border-b border-[#1e293b] bg-[#0d172a]/40 flex justify-center">
            {isSidebarCollapsed ? (
              <div 
                className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-white font-extrabold text-xs flex items-center justify-center shadow-md cursor-pointer" 
                title={profile.name || "The Blockchain Health"}
              >
                {profile.name ? profile.name.substring(0, 2).toUpperCase() : "TH"}
              </div>
            ) : (
              <div className="w-full bg-[#121e36] border border-[#1e293b] rounded-xl p-3 flex items-center justify-between overflow-hidden">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-white font-extrabold text-xs flex items-center justify-center shadow-md shrink-0">
                    {profile.name ? profile.name.substring(0, 2).toUpperCase() : "TH"}
                  </div>
                  <div className="overflow-hidden">
                    <span className="font-bold text-xs text-[#F8FAFC] block truncate">{profile.name || "The Blockchain Health"}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-[#617496] block truncate font-medium">Health</span>
                      <span className="text-[8px] font-bold text-[#7c3aed] bg-[#7c3aed]/10 border border-[#7c3aed]/20 px-1.5 py-0.2 rounded-full uppercase tracking-wider">Business</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-0.5 items-end h-5 shrink-0">
                  <span className="w-0.5 bg-[#2563eb] h-3 rounded-full animate-pulse"></span>
                  <span className="w-0.5 bg-[#2563eb] h-5 rounded-full animate-pulse delay-75"></span>
                  <span className="w-0.5 bg-[#2563eb] h-4 rounded-full animate-pulse delay-150"></span>
                  <span className="w-0.5 bg-[#2563eb] h-2 rounded-full animate-pulse delay-300"></span>
                </div>
              </div>
            )}
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-4 text-xs">
            
            {/* CLINICAL GROUP */}
            <div className="space-y-1">
              {!isSidebarCollapsed && <div className="px-3 py-1 text-[9px] text-[#617496] font-black uppercase tracking-wider">Clinical</div>}
              
              {[
                { tab: 'overview', label: 'Overview', icon: LayoutGrid, path: '/overview' },
                { tab: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/analytics' },
                { tab: 'conversations', label: 'Call Log', icon: MessageSquare, path: '/conversations' },
                { tab: 'appointments', label: 'Appointments', icon: Calendar, path: '/appointments' },
                { tab: 'schedule', label: 'Schedule', icon: CalendarDays, path: '/schedule' },
                { tab: 'patients', label: 'Patients', icon: Users, path: '/patients' },
                { tab: 'support', label: 'Support', icon: Headphones, path: '/support' },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.tab;
                return (
                  <button 
                    key={item.tab}
                    onClick={() => navigate(item.path)}
                    title={item.label}
                    className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group relative ${
                      isActive 
                        ? 'bg-[#121e36] text-white font-bold border border-[#2563eb]/45 shadow-lg shadow-[#2563eb]/5' 
                        : 'text-[#617496] hover:bg-[#121e36]/30 hover:text-[#F8FAFC] border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 duration-200 ${isActive ? 'text-[#2563eb]' : 'text-[#617496] group-hover:text-[#2563eb]'}`} /> 
                      {!isSidebarCollapsed && <span>{item.label}</span>}
                    </span>
                    {!isSidebarCollapsed && isActive && (
                      <motion.div 
                        layoutId="activeTabIndicator"
                        className="w-1.5 h-1.5 rounded-full bg-[#2563eb] shadow-md shadow-[#2563eb]/50"
                      />
                    )}
                    {isSidebarCollapsed && isActive && (
                      <span className="absolute right-1 w-1 h-3 bg-[#2563eb] rounded-l-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* SETUP GROUP */}
            <div className="space-y-1">
              {!isSidebarCollapsed && <div className="px-3 py-1 text-[9px] text-[#617496] font-black uppercase tracking-wider">Setup</div>}

              {[
                { tab: 'agents', label: 'AI Agents', icon: Bot, path: '/agents' },
                { tab: 'services', label: 'Services', icon: ClipboardList, path: '/services' },
                { tab: 'faqs', label: 'Knowledge', icon: HelpCircle, path: '/faqs' },
                { tab: 'widget', label: 'Widget', icon: Code, path: '/widget' },
                { tab: 'website', label: 'Website', icon: Globe, path: '/website' },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.tab;
                return (
                  <button 
                    key={item.tab}
                    onClick={() => navigate(item.path)}
                    title={item.label}
                    className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group relative ${
                      isActive 
                        ? 'bg-[#121e36] text-white font-bold border border-[#2563eb]/45 shadow-lg shadow-[#2563eb]/5' 
                        : 'text-[#617496] hover:bg-[#121e36]/30 hover:text-[#F8FAFC] border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 duration-200 ${isActive ? 'text-[#2563eb]' : 'text-[#617496] group-hover:text-[#2563eb]'}`} /> 
                      {!isSidebarCollapsed && <span>{item.label}</span>}
                    </span>
                    {!isSidebarCollapsed && isActive && (
                      <motion.div 
                        layoutId="activeTabIndicator"
                        className="w-1.5 h-1.5 rounded-full bg-[#2563eb] shadow-md shadow-[#2563eb]/50"
                      />
                    )}
                    {isSidebarCollapsed && isActive && (
                      <span className="absolute right-1 w-1 h-3 bg-[#2563eb] rounded-l-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ACCOUNT GROUP */}
            <div className="space-y-1">
              {!isSidebarCollapsed && <div className="px-3 py-1 text-[9px] text-[#617496] font-black uppercase tracking-wider">Account</div>}

              {[
                { tab: 'billing', label: 'Plan & Billing', icon: Sparkles, path: '/billing', isSpecial: true },
                { tab: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications', badge: 1 },
                { tab: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
                { tab: 'logout', label: 'Sign Out', icon: LogOut, path: '#', isLogout: true },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.tab;
                
                // Active state styled specially if special (Matches Plan & Billing selection from screenshot)
                let activeStyle = 'bg-[#121e36] text-white font-bold border border-[#2563eb]/45 shadow-lg';
                if (item.isSpecial) {
                  activeStyle = 'bg-gradient-to-r from-[#2563eb]/25 to-[#7c3aed]/10 text-white font-bold border border-[#2563eb]/50 shadow-md shadow-[#2563eb]/10';
                }

                return (
                  <button 
                    key={item.tab}
                    onClick={() => {
                      if (item.isLogout) {
                        onSignOut();
                      } else {
                        navigate(item.path);
                      }
                    }}
                    title={item.label}
                    className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group relative ${
                      isActive 
                        ? activeStyle 
                        : item.isLogout 
                          ? 'text-red-400 hover:bg-red-950/15 hover:text-red-300 border border-transparent'
                          : 'text-[#617496] hover:bg-[#121e36]/30 hover:text-[#F8FAFC] border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-transform duration-200 ${
                        item.isLogout 
                          ? 'text-red-400 group-hover:text-red-300' 
                          : item.isSpecial && isActive 
                            ? 'text-indigo-400' 
                            : isActive 
                              ? 'text-[#2563eb]' 
                              : 'text-[#617496] group-hover:text-[#2563eb]'
                      }`} /> 
                      {!isSidebarCollapsed && <span>{item.label}</span>}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {item.badge !== undefined && (
                        <span className={`text-[9px] font-black text-white bg-blue-600 rounded-full flex items-center justify-center ${isSidebarCollapsed ? 'absolute -top-1 -right-1 w-4.5 h-4.5 border-2 border-[#0d172a]' : 'px-1.5 py-0.5 min-w-4 h-4'}`}>
                          {item.badge}
                        </span>
                      )}
                      {!isSidebarCollapsed && isActive && !item.badge && (
                        <motion.div 
                          layoutId="activeTabIndicator"
                          className="w-1.5 h-1.5 rounded-full bg-[#2563eb] shadow-md shadow-[#2563eb]/50"
                        />
                      )}
                      {isSidebarCollapsed && isActive && (
                        <span className="absolute right-1 w-1 h-3 bg-[#2563eb] rounded-l-full" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

          </nav>
        </div>
      </aside>

      {/* MAIN WORKSPACE CONTENT */}
      <main className="flex-1 overflow-y-auto md:h-screen flex flex-col bg-transparent relative z-10">
        
        {/* Workspace Topbar */}
        <header className="h-16 border-b border-[#1F2937] bg-[#0B1120]/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-[#F8FAFC] font-extrabold text-sm capitalize tracking-tight">{activeTab}</h2>
              <span className="w-1 h-1 rounded-full bg-gray-600"></span>
              <span className="text-[10px] text-[#3B82F6] font-bold font-mono tracking-wider">VoiceDesk AI Platform v2.0</span>
            </div>
            <p className="text-[10px] text-[#94A3B8] font-medium">Workspace configuration & live voice logs</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:inline-block text-[9px] font-mono text-[#94A3B8] bg-[#111827] border border-[#1F2937] px-3 py-1.5 rounded-lg font-bold tracking-wider uppercase">
              ⚡ Live Cloud Simulator Persistence
            </div>
            
            {/* User Profile avatar */}
            <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#8B5CF6]/10 text-[#3B82F6] flex items-center justify-center font-extrabold text-xs border border-[#3B82F6]/30 shadow-md shadow-[#3B82F6]/5 uppercase">
              {profile.name ? profile.name.substring(0, 2).toUpperCase() : "VD"}
            </div>
          </div>
        </header>

        {/* Dynamic Tab Panes */}
        <div className="flex-1 p-6 space-y-6">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08 }
                }
              }}
              className="space-y-6"
            >
              
              {/* Header greeting */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: -20 },
                  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
                }}
                className="relative overflow-hidden bg-gradient-to-r from-[#111827] via-[#111827]/95 to-[#020617] border border-[#1F2937] rounded-2xl p-6 shadow-2xl relative"
              >
                <div className="absolute top-[-30%] right-[-10%] w-72 h-72 bg-[#3B82F6]/5 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute bottom-[-30%] left-[-10%] w-72 h-72 bg-[#8B5CF6]/5 rounded-full blur-[80px] pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-[#F8FAFC] font-extrabold text-xl mb-1 flex items-center gap-2 font-display">
                      Good morning, {profile.name} <span className="animate-bounce">👋</span>
                    </h3>
                    <p className="text-xs text-[#94A3B8]">
                      Your AI receptionist has booked <span className="text-[#10B981] font-bold">{appointments.filter(a => a.status === 'confirmed').length} appointments</span> today with zero missed opportunities.
                    </p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => alert("Dashboard data fully synced with client-side state!")}
                    className="bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#EC4899] text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#8B5CF6]/20"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Sync AI Engine
                  </motion.button>
                </div>
              </motion.div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* CARD 1: Electric Blue Theme */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1 }
                  }}
                  whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(59, 130, 246, 0.15)", borderColor: "#3B82F6" }}
                  className="relative group bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] p-5 rounded-2xl flex items-center justify-between overflow-hidden transition-all duration-300 shadow-xl"
                >
                  <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-[#3B82F6]/5 rounded-full blur-xl group-hover:bg-[#3B82F6]/10 transition-colors pointer-events-none"></div>
                  <div>
                    <span className="text-[10px] text-[#94A3B8] block uppercase tracking-widest font-extrabold">Total Conversations</span>
                    <span className="text-3xl font-extrabold text-[#F8FAFC] block mt-1.5 tracking-tight">{conversations.length}</span>
                    <span className="text-[10px] text-[#3B82F6] flex items-center gap-1 mt-2 font-semibold">
                      <TrendingUp className="w-3.5 h-3.5" /> +100% Volume
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6] shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="w-5.5 h-5.5" />
                  </div>
                </motion.div>

                {/* CARD 2: Success Emerald Theme */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1 }
                  }}
                  whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(16, 185, 129, 0.15)", borderColor: "#10B981" }}
                  className="relative group bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] p-5 rounded-2xl flex items-center justify-between overflow-hidden transition-all duration-300 shadow-xl"
                >
                  <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none"></div>
                  <div>
                    <span className="text-[10px] text-[#94A3B8] block uppercase tracking-widest font-extrabold">Appointments Booked</span>
                    <span className="text-3xl font-extrabold text-[#F8FAFC] block mt-1.5 tracking-tight">{appointments.length}</span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-2 font-semibold">
                      <TrendingUp className="w-3.5 h-3.5" /> Real-time active
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-5.5 h-5.5" />
                  </div>
                </motion.div>

                {/* CARD 3: Purple Theme */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1 }
                  }}
                  whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(139, 92, 246, 0.15)", borderColor: "#8B5CF6" }}
                  className="relative group bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] p-5 rounded-2xl flex items-center justify-between overflow-hidden transition-all duration-300 shadow-xl"
                >
                  <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-[#8B5CF6]/5 rounded-full blur-xl group-hover:bg-[#8B5CF6]/10 transition-colors pointer-events-none"></div>
                  <div>
                    <span className="text-[10px] text-[#94A3B8] block uppercase tracking-widest font-extrabold">Conversion Rate</span>
                    <span className="text-3xl font-extrabold text-[#F8FAFC] block mt-1.5 tracking-tight">
                      {conversations.length > 0 ? Math.round((appointments.filter(a => a.status === 'confirmed' || a.status === 'completed').length / conversations.length) * 100) : 0}%
                    </span>
                    <span className="text-[10px] text-purple-400 flex items-center gap-1 mt-2 font-semibold">
                      <Sparkles className="w-3.5 h-3.5" /> Premium Reception
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-5.5 h-5.5" />
                  </div>
                </motion.div>

                {/* CARD 4: Warning Amber Theme */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1 }
                  }}
                  whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(245, 158, 11, 0.15)", borderColor: "#F59E0B" }}
                  className="relative group bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] p-5 rounded-2xl flex items-center justify-between overflow-hidden transition-all duration-300 shadow-xl"
                >
                  <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors pointer-events-none"></div>
                  <div>
                    <span className="text-[10px] text-[#94A3B8] block uppercase tracking-widest font-extrabold">Avg Call Duration</span>
                    <span className="text-3xl font-extrabold text-[#F8FAFC] block mt-1.5 tracking-tight">1:48</span>
                    <span className="text-[10px] text-amber-400 flex items-center gap-1 mt-2 font-semibold">
                      <Clock className="w-3.5 h-3.5 animate-pulse" /> Highly Optimized
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-5.5 h-5.5" />
                  </div>
                </motion.div>

              </div>

              {/* Chart & Quick summary row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Area line chart (SVG based for ultimate compatibility and look) */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] p-6 rounded-2xl lg:col-span-2 shadow-2xl relative group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6]/5 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-[#F8FAFC] font-bold text-sm tracking-tight font-display">Conversation Trend</h4>
                      <p className="text-[10px] text-[#94A3B8]">14 days inbound calls vs appointment conversion</p>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#3B82F6] rounded-full shadow-lg shadow-[#3B82F6]/20"></span> Inbound Calls</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#8B5CF6] rounded-full shadow-lg shadow-[#8B5CF6]/20"></span> Bookings</span>
                    </div>
                  </div>

                  {/* Custom CSS/SVG chart */}
                  <div className="relative h-44 w-full">
                    <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="glowBlue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25"/>
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0"/>
                        </linearGradient>
                        <linearGradient id="glowPurple" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2"/>
                          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0"/>
                        </linearGradient>
                      </defs>

                      {/* Grid lines */}
                      <line x1="0" y1="30" x2="500" y2="30" stroke="#1F2937" strokeDasharray="3"/>
                      <line x1="0" y1="75" x2="500" y2="75" stroke="#1F2937" strokeDasharray="3"/>
                      <line x1="0" y1="120" x2="500" y2="120" stroke="#1F2937" strokeDasharray="3"/>

                      {/* Area Fill */}
                      <path d="M 0,150 L 50,140 L 100,145 L 150,135 L 200,130 L 250,120 L 300,125 L 350,110 L 400,115 L 450,110 L 500,40 L 500,150 Z" fill="url(#glowBlue)"/>
                      <path d="M 0,150 L 50,145 L 100,148 L 150,142 L 200,140 L 250,135 L 300,138 L 350,128 L 400,132 L 450,130 L 500,60 L 500,150 Z" fill="url(#glowPurple)"/>

                      {/* Lines */}
                      <path d="M 0,150 L 50,140 L 100,145 L 150,135 L 200,130 L 250,120 L 300,125 L 350,110 L 400,115 L 450,110 L 500,40" fill="none" stroke="#3B82F6" strokeWidth="2.5"/>
                      <path d="M 0,150 L 50,145 L 100,148 L 150,142 L 200,140 L 250,135 L 300,138 L 350,128 L 400,132 L 450,130 L 500,60" fill="none" stroke="#8B5CF6" strokeWidth="2.5"/>
                    </svg>
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-[#94A3B8] mt-2">
                    <span>Apr 29</span>
                    <span>May 03</span>
                    <span>May 07</span>
                    <span>May 11</span>
                    <span>May 16 (Today)</span>
                  </div>
                </motion.div>

                {/* Right sidebar details */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] p-5 rounded-2xl space-y-4 shadow-2xl flex flex-col justify-between"
                >
                  <h4 className="text-[#F8FAFC] font-bold text-sm tracking-tight font-display">Today's Performance</h4>
                  
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between border-b border-[#1F2937] pb-2.5">
                      <span className="text-[#94A3B8]">Today's Conversations</span>
                      <span className="text-[#F8FAFC] font-mono font-extrabold text-sm">4</span>
                    </div>
                    <div className="flex justify-between border-b border-[#1F2937] pb-2.5">
                      <span className="text-[#94A3B8]">This Week's Conversions</span>
                      <span className="text-[#F8FAFC] font-mono font-extrabold text-sm">4</span>
                    </div>
                    <div className="flex justify-between border-b border-[#1F2937] pb-2.5">
                      <span className="text-[#94A3B8]">Callbacks Requested</span>
                      <span className="text-yellow-400 font-mono font-extrabold text-sm">0</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-[#94A3B8]">Active Configured Agents</span>
                      <span className="text-[#3B82F6] font-mono font-extrabold text-sm">2</span>
                    </div>
                  </div>

                  <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-xl p-3.5 text-[11px] text-[#94A3B8] mt-2">
                    <p className="font-bold text-[#3B82F6] mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Live Simulator Info
                    </p>
                    Customize presets, update FAQs, or try calling using the voice portal on the landing page!
                  </div>
                </motion.div>

              </div>

              {/* Recent Appointments panel */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] rounded-2xl overflow-hidden shadow-2xl"
              >
                <div className="p-5 border-b border-[#1F2937] flex items-center justify-between">
                  <div>
                    <h4 className="text-[#F8FAFC] font-bold text-sm tracking-tight font-display">Recent Booked Appointments</h4>
                    <p className="text-[10px] text-[#94A3B8]">Latest active repair sessions booked by AI receptionist</p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/appointments')}
                    className="text-xs text-[#3B82F6] hover:text-[#3B82F6]/80 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#020617] text-[#94A3B8] border-b border-[#1F2937]">
                        <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Customer</th>
                        <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Vehicle</th>
                        <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Service Needed</th>
                        <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Scheduled For</th>
                        <th className="p-4 font-bold uppercase tracking-wider text-[10px] text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F2937]">
                      {appointments.slice(0, 3).map((apt) => {
                        const service = services.find(s => s.id === apt.serviceId);
                        return (
                          <tr key={apt.id} className="hover:bg-[#020617]/40 transition-colors">
                            <td className="p-4">
                              <span className="text-[#F8FAFC] font-semibold block text-sm">{apt.customerName}</span>
                              <span className="text-[10px] text-[#94A3B8]">{apt.phoneNumber}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-[#94A3B8] block">{apt.vehicleYear} {apt.vehicleMake} {apt.vehicleModel}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-[#F8FAFC] block font-medium">{service?.name || 'Oil Change'}</span>
                            </td>
                            <td className="p-4 text-[#94A3B8] font-mono text-xs">
                              {apt.scheduledAt}
                            </td>
                            <td className="p-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                apt.status === 'confirmed' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/30 shadow-sm shadow-emerald-950/10' :
                                apt.status === 'completed' ? 'bg-blue-950/40 text-blue-400 border-blue-800/30' :
                                'bg-gray-900 text-gray-400 border-gray-800'
                              }`}>
                                {apt.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>

            </motion.div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              className="space-y-6"
            >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 30-Day Conversation line chart */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] p-6 rounded-2xl lg:col-span-2 shadow-2xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[#3B82F6]/5 rounded-full blur-3xl pointer-events-none"></div>
                  <h4 className="text-white font-bold text-sm tracking-tight mb-1 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#3B82F6]" /> 30-Day Conversation Trend
                  </h4>
                  <p className="text-[10px] text-[#94A3B8] mb-6">Aggregate inbound volume over the last month</p>
                  
                  <div className="relative h-48 w-full">
                    <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="30" x2="500" y2="30" stroke="#1F2937" strokeDasharray="3"/>
                      <line x1="0" y1="75" x2="500" y2="75" stroke="#1F2937" strokeDasharray="3"/>
                      <line x1="0" y1="120" x2="500" y2="120" stroke="#1F2937" strokeDasharray="3"/>
 
                      {/* Area Fill */}
                      <path d="M 0,150 L 100,148 L 200,147 L 300,146 L 400,145 L 450,110 L 500,20 L 500,150 Z" fill="url(#glowBlue)"/>
                      {/* Line */}
                      <path d="M 0,150 L 100,148 L 200,147 L 300,146 L 400,145 L 450,110 L 500,20" fill="none" stroke="#3B82F6" strokeWidth="2.5"/>
                    </svg>
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-[#94A3B8] mt-2">
                    <span>Apr 13</span>
                    <span>Apr 23</span>
                    <span>May 03</span>
                    <span>May 13</span>
                    <span>May 16</span>
                  </div>
                </motion.div>

                {/* Outcome distribution Donut */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] p-6 rounded-2xl shadow-2xl flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-32 h-32 bg-[#8B5CF6]/5 rounded-full blur-3xl pointer-events-none"></div>
                  <div>
                    <h4 className="text-white font-bold text-sm tracking-tight mb-1">Outcome Distribution</h4>
                    <p className="text-[10px] text-[#94A3B8] mb-4">Percentage of calls successfully converted</p>
                  </div>

                  <div className="relative flex items-center justify-center my-4 group">
                    {/* SVG Donut */}
                    <svg className="w-36 h-36 transform -rotate-90 filter drop-shadow-[0_0_15px_rgba(59,130,246,0.15)] group-hover:scale-105 transition-transform duration-500">
                      {/* Base Circle */}
                      <circle cx="72" cy="72" r="50" fill="transparent" stroke="#020617" strokeWidth="18" />
                      {/* Booking segment (75%) */}
                      <circle 
                        cx="72" cy="72" r="50" fill="transparent" 
                        stroke="#3B82F6" strokeWidth="18" 
                        strokeDasharray={2 * Math.PI * 50} 
                        strokeDashoffset={2 * Math.PI * 50 * 0.25} 
                      />
                      {/* No action segment (25%) */}
                      <circle 
                        cx="72" cy="72" r="50" fill="transparent" 
                        stroke="#8B5CF6" strokeWidth="18" 
                        strokeDasharray={2 * Math.PI * 50} 
                        strokeDashoffset={2 * Math.PI * 50 * 0.75} 
                        className="origin-center"
                        style={{ transform: `rotate(${360 * 0.75}deg)` }}
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-3xl font-extrabold text-white block tracking-tighter">75%</span>
                      <span className="text-[9px] text-[#3B82F6] font-extrabold uppercase tracking-widest">Converted</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-mono pt-4 border-t border-[#1F2937]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-[#94A3B8]"><span className="w-2.5 h-2.5 rounded bg-[#3B82F6] shadow-md shadow-[#3B82F6]/20"></span> Appointments Booked</span>
                      <span className="text-white font-extrabold">3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-[#94A3B8]"><span className="w-2.5 h-2.5 rounded bg-[#8B5CF6] shadow-md shadow-[#8B5CF6]/20"></span> No Action / Other</span>
                      <span className="text-white font-extrabold">1</span>
                    </div>
                  </div>
                </motion.div>

              </div>

              {/* Weekly daily breakdown column bar chart */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] p-6 rounded-2xl shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.03),transparent_60%)] pointer-events-none"></div>
                <h4 className="text-white font-bold text-sm tracking-tight mb-1">This Week - Daily Breakdown</h4>
                <p className="text-[10px] text-[#94A3B8] mb-8">Daily inbound call volumes categorized by appointments</p>

                <div className="flex items-end justify-between h-48 gap-4 px-4 max-w-4xl mx-auto">
                  {[
                    { day: 'Mon', calls: 0, appointments: 0 },
                    { day: 'Tue', calls: 4, appointments: 3 },
                    { day: 'Wed', calls: 0, appointments: 0 },
                    { day: 'Thu', calls: 0, appointments: 0 },
                    { day: 'Fri', calls: 0, appointments: 0 },
                    { day: 'Sat', calls: 0, appointments: 0 },
                    { day: 'Sun', calls: 0, appointments: 0 },
                  ].map((data, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-3">
                      <div className="w-full flex justify-center gap-2 h-36 items-end group">
                        {/* Inbound Call Bar (Green) */}
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${data.calls > 0 ? (data.calls / 5) * 100 : 2}%` }}
                          transition={{ type: 'spring', delay: idx * 0.05, stiffness: 60 }}
                          className="w-4 bg-gradient-to-t from-[#3B82F6] to-[#3B82F6]/80 rounded-t-md transition-all duration-300 shadow-md shadow-[#3B82F6]/10 group-hover:brightness-110 cursor-pointer"
                          title={`Calls: ${data.calls}`}
                        ></motion.div>
                        {/* Appointment Booked Bar (Purple) */}
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${data.appointments > 0 ? (data.appointments / 5) * 100 : 2}%` }}
                          transition={{ type: 'spring', delay: idx * 0.05 + 0.1, stiffness: 60 }}
                          className="w-4 bg-gradient-to-t from-[#8B5CF6] to-[#EC4899]/80 rounded-t-md transition-all duration-300 shadow-md shadow-[#8B5CF6]/10 group-hover:brightness-110 cursor-pointer"
                          title={`Booked: ${data.appointments}`}
                        ></motion.div>
                      </div>
                      <span className="text-[10px] text-[#94A3B8] font-mono font-semibold">{data.day}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-8 text-[10px] font-mono mt-8 border-t border-[#1F2937] pt-4">
                  <span className="flex items-center gap-2 text-[#94A3B8]"><span className="w-3 h-3 rounded bg-[#3B82F6] shadow-md shadow-[#3B82F6]/20"></span> Conversations</span>
                  <span className="flex items-center gap-2 text-[#94A3B8]"><span className="w-3 h-3 rounded bg-[#8B5CF6] shadow-md shadow-[#8B5CF6]/20"></span> Appointments</span>
                </div>
              </motion.div>

            </motion.div>
          )}

          {/* CONVERSATIONS TAB */}
          {activeTab === 'conversations' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Inner Sub Tabs bar */}
              <div className="flex border-b border-[#1F2937] pb-1 gap-6 text-xs font-bold">
                <button 
                  onClick={() => setConvSubTab('list')}
                  className={`pb-3 relative cursor-pointer font-extrabold tracking-tight transition-all flex items-center gap-1.5 ${
                    convSubTab === 'list' 
                      ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]' 
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Call Logs List
                </button>
                {selectedConv && (
                  <button 
                    onClick={() => setConvSubTab('chat')}
                    className={`pb-3 relative cursor-pointer font-extrabold tracking-tight transition-all flex items-center gap-1.5 ${
                      convSubTab === 'chat' 
                        ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]' 
                        : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    Active Transcript: {selectedConv.callerName}
                  </button>
                )}
              </div>

              {convSubTab === 'list' ? (
                /* FULL PAGE CALL LOGS LIST */
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] rounded-2xl p-6 flex flex-col justify-between shadow-2xl"
                >
                  <div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <h4 className="text-[#F8FAFC] font-extrabold text-base tracking-tight">Call Logs Records</h4>
                        <p className="text-[11px] text-[#94A3B8]">Full-page overview of customer dial-in recordings, durations, and AI sentiment analysis</p>
                      </div>
                      
                      {/* Search filter input */}
                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 text-[#94A3B8]/60 absolute top-2.5 left-3" />
                        <input 
                          type="text" 
                          placeholder="Search caller name..." 
                          value={convSearch}
                          onChange={(e) => setConvSearch(e.target.value)}
                          className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl pl-9 pr-3 py-2 outline-none transition-all"
                        />
                      </div>
                    </div>
   
                    {/* Calls Table List - Full Width */}
                    <div className="overflow-x-auto rounded-xl border border-[#1F2937]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#020617] text-[#94A3B8] border-b border-[#1F2937]">
                            <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Caller Profile</th>
                            <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Contact Number</th>
                            <th className="p-4 font-bold uppercase tracking-wider text-[10px] text-center">Status</th>
                            <th className="p-4 font-bold uppercase tracking-wider text-[10px] text-center">Duration</th>
                            <th className="p-4 font-bold uppercase tracking-wider text-[10px] text-center">Started At</th>
                            <th className="p-4 font-bold uppercase tracking-wider text-[10px]">AI Sentiment</th>
                            <th className="p-4 font-bold uppercase tracking-wider text-[10px] text-center">Appointment Booked</th>
                            <th className="p-4 font-bold uppercase tracking-wider text-[10px] text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1F2937]/60">
                          {filteredConversations.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="p-12 text-center text-[#94A3B8] italic bg-[#020617]/30">
                                No call logs found.
                              </td>
                            </tr>
                          ) : (
                            filteredConversations.map((conv) => {
                              const isSelected = selectedConv?.id === conv.id;
                              return (
                                <motion.tr 
                                  whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.02)" }}
                                  key={conv.id} 
                                  onClick={() => {
                                    setSelectedConv(conv);
                                    setConvSubTab('chat');
                                  }}
                                  className={`cursor-pointer transition-colors ${
                                    isSelected ? 'bg-[#3B82F6]/5 text-white border-l-2 border-[#3B82F6]' : ''
                                  }`}
                                >
                                  <td className="p-4">
                                    <span className="font-extrabold block text-white text-sm">{conv.callerName}</span>
                                    <span className="text-[10px] text-[#94A3B8] font-mono">ID: {conv.id}</span>
                                  </td>
                                  <td className="p-4 font-mono text-gray-300">
                                    {conv.callerPhone}
                                  </td>
                                  <td className="p-4 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center justify-center gap-1.5 w-24 mx-auto ${
                                      conv.status === 'completed' 
                                        ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30' 
                                        : 'bg-red-950/20 text-red-400 border-red-900/30'
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${conv.status === 'completed' ? 'bg-[#10B981]' : 'bg-red-400'}`}></span>
                                      {conv.status}
                                    </span>
                                  </td>
                                  <td className="p-4 font-mono text-[#94A3B8] text-center font-bold">{conv.duration}</td>
                                  <td className="p-4 text-[#94A3B8] text-center">{conv.startedAt}</td>
                                  <td className="p-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                      conv.sentiment === 'positive' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' :
                                      conv.sentiment === 'neutral' ? 'bg-gray-900 text-[#94A3B8] border-gray-800' :
                                      'bg-red-950/40 text-red-400 border-red-900/30'
                                    }`}>
                                      {conv.sentiment}
                                    </span>
                                  </td>
                                  <td className="p-4 text-center">
                                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${conv.appointmentBooked ? 'text-[#3B82F6] bg-[#3B82F6]/10 border border-[#3B82F6]/20' : 'text-[#94A3B8]'}`}>
                                      {conv.appointmentBooked ? '✓ Yes, Booked' : '— No booking'}
                                    </span>
                                  </td>
                                  <td className="p-4 text-center">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedConv(conv);
                                        setConvSubTab('chat');
                                      }}
                                      className="bg-[#020617] hover:bg-[#3B82F6] text-[#3B82F6] hover:text-white px-3 py-1.5 rounded-lg border border-[#1F2937] hover:border-[#3B82F6] text-xs font-bold transition-all cursor-pointer"
                                    >
                                      View Transcript
                                    </button>
                                  </td>
                                </motion.tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
   
                  <p className="text-[10px] text-[#94A3B8]/60 mt-6 italic">
                    *Click on any conversational log row to open the dedicated "Active Transcript" tab to review full dialogue scripts and audio simulations.
                  </p>
                </motion.div>
              ) : (
                /* FULL PAGE CHAT TRANSCRIPT DETAILS */
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/5 rounded-full blur-3xl pointer-events-none"></div>
                  {selectedConv ? (
                    <div className="flex flex-col space-y-6">
                      
                      {/* Top Header Row with Back button */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#1F2937]">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <button 
                              onClick={() => setConvSubTab('list')}
                              className="text-xs text-[#3B82F6] hover:text-white font-bold flex items-center gap-1 transition-colors cursor-pointer bg-[#3B82F6]/10 px-2.5 py-1 rounded-lg border border-[#3B82F6]/25"
                            >
                              ← Back to Logs
                            </button>
                            <span className="text-[9px] text-[#3B82F6] bg-[#3B82F6]/10 px-2 py-1 rounded border border-[#3B82F6]/25 uppercase tracking-wider font-extrabold font-mono">Active Full Transcript View</span>
                          </div>
                          <h3 className="text-white font-extrabold text-xl font-display">{selectedConv.callerName}</h3>
                          <p className="text-xs text-[#94A3B8] font-mono mt-0.5">{selectedConv.callerPhone} • Started {selectedConv.startedAt}</p>
                        </div>

                        {/* Interactive Waveform mockup & Player Button */}
                        <div className="flex items-center gap-3 bg-[#020617] border border-[#1F2937] p-3 rounded-2xl w-full sm:w-auto">
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5 h-6">
                              <div className="w-0.5 h-3.5 bg-[#3B82F6] rounded-full animate-pulse"></div>
                              <div className="w-0.5 h-5.5 bg-[#3B82F6] rounded-full animate-pulse delay-100"></div>
                              <div className="w-0.5 h-2 bg-[#3B82F6] rounded-full animate-pulse delay-200"></div>
                              <div className="w-0.5 h-4.5 bg-[#3B82F6] rounded-full animate-pulse delay-75"></div>
                              <div className="w-0.5 h-3 bg-[#3B82F6] rounded-full animate-pulse delay-150"></div>
                            </div>
                            <span className="text-[10px] text-[#94A3B8] font-mono font-medium mr-4">Voice log play stream</span>
                          </div>
                          <motion.button 
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => alert(`Playing audio simulation of call with ${selectedConv.callerName}!`)}
                            className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#3B82F6]/90 hover:to-[#8B5CF6]/90 text-white text-xs font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" /> Play Recording
                          </motion.button>
                        </div>
                      </div>
   
                      {/* Detailed Meta Data Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-[#020617] border border-[#1F2937] p-3.5 rounded-xl">
                          <span className="text-[10px] text-[#94A3B8] block uppercase font-extrabold tracking-wider font-mono">Call Duration</span>
                          <span className="text-sm font-mono font-bold text-white block mt-1">{selectedConv.duration}</span>
                        </div>
                        <div className="bg-[#020617] border border-[#1F2937] p-3.5 rounded-xl">
                          <span className="text-[10px] text-[#94A3B8] block uppercase font-extrabold tracking-wider font-mono">Sentiment Score</span>
                          <span className={`text-sm font-bold block mt-1 capitalize ${
                            selectedConv.sentiment === 'positive' ? 'text-emerald-400' :
                            selectedConv.sentiment === 'neutral' ? 'text-[#94A3B8]' : 'text-red-400'
                          }`}>{selectedConv.sentiment}</span>
                        </div>
                        <div className="bg-[#020617] border border-[#1F2937] p-3.5 rounded-xl">
                          <span className="text-[10px] text-[#94A3B8] block uppercase font-extrabold tracking-wider font-mono">AI Reception Action</span>
                          <span className={`text-sm font-bold block mt-1 ${
                            selectedConv.appointmentBooked ? 'text-[#3B82F6]' : 'text-[#94A3B8]'
                          }`}>{selectedConv.appointmentBooked ? '✓ Appointment Booked' : '— No Action Taken'}</span>
                        </div>
                        <div className="bg-[#020617] border border-[#1F2937] p-3.5 rounded-xl">
                          <span className="text-[10px] text-[#94A3B8] block uppercase font-extrabold tracking-wider font-mono">Status State</span>
                          <span className="text-sm font-bold text-emerald-400 block mt-1 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                            Completed
                          </span>
                        </div>
                      </div>
   
                      {/* Bubble chat section - beautiful, spacious full page bubbles */}
                      <div className="bg-[#020617]/50 border border-[#1F2937]/50 rounded-2xl p-6 space-y-5 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
                        {selectedConv.transcript.map((line, idx) => {
                          const isUser = line.sender === 'user';
                          return (
                            <div 
                              key={idx}
                              className={`flex flex-col max-w-[70%] ${
                                isUser ? 'ml-auto items-end' : 'mr-auto items-start'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] text-[#94A3B8] font-mono tracking-wider capitalize font-bold">
                                  {isUser ? 'Customer' : 'Receptionist AI'}
                                </span>
                                <span className="text-[9px] text-[#94A3B8]/50 font-mono">{line.timestamp}</span>
                              </div>
                              <div className={`px-5 py-3 rounded-2xl text-xs leading-relaxed ${
                                isUser 
                                  ? 'bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white rounded-tr-none shadow-md shadow-black/25 font-medium' 
                                  : 'bg-[#111827] text-gray-200 border border-[#1F2937] rounded-tl-none font-medium'
                              }`}>
                                {line.text}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <button 
                          onClick={() => setConvSubTab('list')}
                          className="bg-transparent hover:bg-gray-800 text-[#94A3B8] hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold border border-[#1F2937] transition-all cursor-pointer"
                        >
                          ← Back to Call Records
                        </button>
                        <p className="text-[10px] text-[#94A3B8]/60 italic">
                          Speech-to-text synced dynamically.
                        </p>
                      </div>

                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-24">
                      <MessageSquare className="w-12 h-12 text-[#94A3B8]/40 mb-3 animate-pulse" />
                      <p className="text-white font-semibold text-sm">No log selected</p>
                      <p className="text-[10px] text-[#94A3B8]/60 mt-1 max-w-[200px]">Select a call record from the logs table to review details.</p>
                      <button 
                        onClick={() => setConvSubTab('list')}
                        className="mt-4 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                      >
                        Browse Call Records
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* APPOINTMENTS TAB */}
          {activeTab === 'appointments' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] rounded-2xl p-6 space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#3B82F6]/5 rounded-full blur-3xl pointer-events-none"></div>
              
              {/* Header and filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-[#F8FAFC] font-extrabold text-base tracking-tight">Appointments Schedule</h4>
                  <p className="text-[10px] text-[#94A3B8]">Track and manage upcoming repair appointments booked by AI receptionist</p>
                </div>
 
                <div className="flex flex-wrap items-center gap-3">
                  
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#94A3B8]/60 absolute top-2.5 left-3" />
                    <input 
                      type="text" 
                      placeholder="Search customer name..." 
                      value={aptSearch}
                      onChange={(e) => setAptSearch(e.target.value)}
                      className="bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl pl-9 pr-3 py-2 outline-none transition-all"
                    />
                  </div>
 
                  {/* Status Dropdown */}
                  <div className="relative">
                    <select 
                      value={aptFilter}
                      onChange={(e) => setAptFilter(e.target.value)}
                      className="bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-[#94A3B8] rounded-xl px-4 py-2 outline-none cursor-pointer transition-all"
                    >
                      <option value="all">All Statuses</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
 
                  {/* Add Appointment Button */}
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowAptModal(true)}
                    className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#3B82F6]/90 hover:to-[#8B5CF6]/90 text-white text-xs font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#3B82F6]/20 transition-colors"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" /> New Appointment
                  </motion.button>
                </div>
              </div>
 
              {/* Table list */}
              <div className="overflow-x-auto rounded-xl border border-[#1F2937]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#020617] text-[#94A3B8] border-b border-[#1F2937]">
                      <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Customer</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Vehicle Details</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Requested Service</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Scheduled Time</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Notes</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-[10px] text-center">Status</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-[10px] text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2937]/50">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-[#94A3B8] italic font-medium bg-[#020617]/40">
                          No matching appointments found.
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((apt) => {
                        const service = services.find(s => s.id === apt.serviceId);
                        return (
                          <motion.tr 
                            whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.02)" }}
                            key={apt.id} 
                            className="transition-colors"
                          >
                            <td className="p-4">
                              <span className="text-white font-bold block text-sm">{apt.customerName}</span>
                              <span className="text-[10px] text-[#94A3B8] font-mono">{apt.phoneNumber}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-[#94A3B8] block font-medium">{apt.vehicleYear} {apt.vehicleMake} {apt.vehicleModel}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-[#F8FAFC] font-bold bg-[#020617] px-2.5 py-1 rounded-lg border border-[#1F2937] text-[11px] inline-block">{service?.name || 'Oil Change'}</span>
                            </td>
                            <td className="p-4 text-[#94A3B8] font-mono text-xs">
                              {apt.scheduledAt}
                            </td>
                            <td className="p-4 max-w-xs truncate text-[#94A3B8] font-medium italic">
                              {apt.notes || '—'}
                            </td>
                            <td className="p-4 text-center">
                              <select 
                                value={apt.status}
                                onChange={(e) => {
                                  const updated = appointments.map(a => a.id === apt.id ? { ...a, status: e.target.value as any } : a);
                                  onUpdateAppointments(updated);
                                }}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold border bg-[#020617] outline-none cursor-pointer transition-all ${
                                  apt.status === 'confirmed' ? 'text-[#3B82F6] border-[#3B82F6]/40 shadow-sm shadow-[#3B82F6]/20' :
                                  apt.status === 'completed' ? 'text-emerald-400 border-emerald-800/40' :
                                  'text-[#94A3B8] border-[#1F2937]'
                                }`}
                              >
                                <option value="pending">pending</option>
                                <option value="confirmed">confirmed</option>
                                <option value="completed">completed</option>
                                <option value="cancelled">cancelled</option>
                              </select>
                            </td>
                            <td className="p-4 text-center">
                              <motion.button 
                                whileHover={{ scale: 1.1, color: "#f87171" }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => deleteAppointment(apt.id)}
                                className="text-[#94A3B8] hover:text-red-400 p-1.5 rounded-lg hover:bg-[#020617] transition-all cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
 
            </motion.div>
          )}
          {activeTab === 'agents' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              
              {/* Inner Sub Tabs or Header depending on sub-tab */}
              {agentSubTab !== 'list' && (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setAgentSubTab('list');
                      setEditingAgent(null);
                    }}
                    className="text-xs text-[#3B82F6] hover:text-white font-bold flex items-center gap-1 transition-colors cursor-pointer bg-[#3B82F6]/10 px-3 py-1.5 rounded-lg border border-[#3B82F6]/25"
                  >
                    ← Back to Agents List
                  </button>
                  <span className="text-[10px] text-[#3B82F6] bg-[#3B82F6]/10 px-2.5 py-1.5 rounded border border-[#3B82F6]/25 uppercase tracking-wider font-extrabold font-mono">
                    {agentSubTab === 'studio' ? 'Agent Studio' : 'Edit Agent'}
                  </span>
                </div>
              )}

              {agentSubTab === 'list' && (
                /* FULL PAGE AGENTS LIST */
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] rounded-2xl p-6 flex flex-col justify-between shadow-2xl"
                >
                  <div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <h4 className="text-[#F8FAFC] font-extrabold text-base tracking-tight">AI Receptionist Voice Agents</h4>
                        <p className="text-[11px] text-[#94A3B8]">Manage presets, deploy custom behavioral parameters, and test interactive speech flows</p>
                      </div>
                      
                      <motion.button 
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowAgentModal(true)}
                        className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#3B82F6]/90 hover:to-[#8B5CF6]/90 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#3B82F6]/20 transition-all"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" /> Add New Agent
                      </motion.button>
                    </div>

                    {/* Agents Table List - Full Width */}
                    <div className="overflow-x-auto rounded-xl border border-[#1F2937]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#020617] text-[#94A3B8] border-b border-[#1F2937]">
                            <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Agent Profile</th>
                            <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Voice Model</th>
                            <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Personality</th>
                            <th className="p-4 font-bold uppercase tracking-wider text-[10px] text-center">Interruption Sensitivity</th>
                            <th className="p-4 font-bold uppercase tracking-wider text-[10px] text-center">Status</th>
                            <th className="p-4 font-bold uppercase tracking-wider text-[10px] text-center">Quick Active Status</th>
                            <th className="p-4 font-bold uppercase tracking-wider text-[10px] text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1F2937]/60">
                          {agents.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-12 text-center text-[#94A3B8] italic bg-[#020617]/30">
                                No agents configured. Click "Add New Agent" to create one.
                              </td>
                            </tr>
                          ) : (
                            agents.map((agt) => {
                              return (
                                <motion.tr 
                                  whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.02)" }}
                                  key={agt.id} 
                                  className="transition-colors text-white"
                                >
                                  <td className="p-4">
                                    <div className="flex items-center gap-2.5">
                                      <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition-colors ${
                                        agt.isActive ? 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30' : 'bg-[#111827] text-[#94A3B8] border border-[#1F2937]'
                                      }`}>
                                        <Volume2Icon className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <span className="font-extrabold block text-white text-sm">{agt.name}</span>
                                        <span className="text-[10px] text-[#94A3B8] font-mono">ID: {agt.id}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4 font-mono text-gray-300">
                                    {agt.voice}
                                  </td>
                                  <td className="p-4 text-gray-300 font-medium">
                                    {agt.personality}
                                  </td>
                                  <td className="p-4 text-center">
                                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-[#020617] border border-[#1F2937] text-gray-300">
                                      {agt.interruptionSensitivity}
                                    </span>
                                  </td>
                                  <td className="p-4 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center justify-center gap-1.5 w-24 mx-auto ${
                                      agt.isActive 
                                        ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30' 
                                        : 'bg-gray-900 text-[#94A3B8] border-gray-800'
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${agt.isActive ? 'bg-[#10B981]' : 'bg-gray-500'}`}></span>
                                      {agt.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                  </td>
                                  <td className="p-4 text-center">
                                    {/* Beautiful Toggle Switch */}
                                    <div className="flex items-center justify-center">
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const updated = agents.map(a => a.id === agt.id ? { ...a, isActive: !a.isActive } : a);
                                          onUpdateAgents(updated);
                                        }}
                                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                                          agt.isActive ? 'bg-[#3B82F6]' : 'bg-gray-800 border border-[#1F2937]'
                                        }`}
                                      >
                                        <motion.div 
                                          layout
                                          className="bg-white w-4 h-4 rounded-full shadow-md"
                                          animate={{ x: agt.isActive ? 20 : 0 }}
                                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                      </button>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center justify-center gap-2">
                                      <button 
                                        onClick={() => {
                                          setSelectedAgentForStudio(agt);
                                          setAgentSubTab('studio');
                                          setStudioSubTab('configure');
                                        }}
                                        className="bg-[#3B82F6]/15 hover:bg-[#3B82F6] text-[#3B82F6] hover:text-white px-2.5 py-1.5 rounded-lg border border-[#3B82F6]/30 hover:border-[#3B82F6] text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                                      >
                                        <Sliders className="w-3 h-3" /> View Studio
                                      </button>
                                      <button 
                                        onClick={() => {
                                          setEditingAgent(agt);
                                          setAgentSubTab('edit');
                                        }}
                                        className="bg-gray-950 hover:bg-gray-800 text-gray-300 hover:text-white p-1.5 rounded-lg border border-gray-800 hover:border-gray-700 transition-all cursor-pointer"
                                        title="Edit Agent"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </button>
                                      <button 
                                        onClick={() => {
                                          deleteAgent(agt.id);
                                        }}
                                        className="bg-red-950/20 hover:bg-red-600/20 text-red-400 p-1.5 rounded-lg border border-red-900/30 hover:border-red-500/30 transition-all cursor-pointer"
                                        title="Delete Agent"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </td>
                                </motion.tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <p className="text-[10px] text-[#94A3B8]/60 mt-6 italic">
                    *Select "View Studio" to access full voice synthesis simulators, system instructions, and dynamic live tests. Toggle "Quick Active Status" to immediately toggle the agent's availability.
                  </p>
                </motion.div>
              )}

              {agentSubTab === 'studio' && selectedAgentForStudio && (
                /* FULL PAGE STUDIO CONFIG + TEST LIVE */
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/5 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="h-full flex flex-col justify-between space-y-6">
                    <div>
                      {/* Studio Header & Sub-tabs */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1F2937] pb-4 gap-4">
                        <div>
                          <span className="text-[9px] text-[#3B82F6] font-extrabold uppercase bg-[#3B82F6]/10 border border-[#3B82F6]/25 px-2 py-0.5 rounded font-mono">Agent Studio Workspace</span>
                          <h3 className="text-white font-extrabold text-xl mt-1 font-display">{selectedAgentForStudio.name}</h3>
                          <p className="text-xs text-[#94A3B8] font-medium mt-0.5">Voice Model: {selectedAgentForStudio.voice} • Personality: {selectedAgentForStudio.personality}</p>
                        </div>

                        {/* Sub-tabs selector */}
                        <div className="bg-[#020617] p-1.5 rounded-xl border border-[#1F2937] flex text-xs">
                          <button 
                            onClick={() => setStudioSubTab('configure')}
                            className={`px-5 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                              studioSubTab === 'configure' ? 'bg-[#111827] text-[#3B82F6] border border-[#1F2937] font-extrabold' : 'text-[#94A3B8] hover:text-gray-300'
                            }`}
                          >
                            Configure Rules
                          </button>
                          <button 
                            onClick={() => setStudioSubTab('test')}
                            className={`px-5 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                              studioSubTab === 'test' ? 'bg-[#111827] text-[#3B82F6] border border-[#1F2937] font-extrabold' : 'text-[#94A3B8] hover:text-gray-300'
                            }`}
                          >
                            Test Live
                          </button>
                        </div>
                      </div>

                      {/* CONFIGURE VIEW */}
                      {studioSubTab === 'configure' && (
                        <div className="space-y-6 mt-6 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-800">
                          
                          {/* Top row fields */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                              <label className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider font-mono block mb-1.5">Agent Name *</label>
                              <input 
                                type="text" 
                                value={selectedAgentForStudio.name}
                                onChange={(e) => {
                                  const updated = agents.map(a => a.id === selectedAgentForStudio.id ? { ...a, name: e.target.value } : a);
                                  onUpdateAgents(updated);
                                  setSelectedAgentForStudio({ ...selectedAgentForStudio, name: e.target.value });
                                }}
                                className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-4 py-2.5 outline-none transition-all"
                              />
                            </div>
                            
                            <div>
                              <label className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider font-mono block mb-1.5">Interruption Sensitivity</label>
                              <select 
                                value={selectedAgentForStudio.interruptionSensitivity}
                                onChange={(e) => {
                                  const val = e.target.value as any;
                                  const updated = agents.map(a => a.id === selectedAgentForStudio.id ? { ...a, interruptionSensitivity: val } : a);
                                  onUpdateAgents(updated);
                                  setSelectedAgentForStudio({ ...selectedAgentForStudio, interruptionSensitivity: val });
                                }}
                                className="w-full bg-[#020617] border border-[#1F2937] text-xs text-[#94A3B8] rounded-xl px-4 py-2.5 outline-none cursor-pointer focus:border-[#3B82F6] transition-all"
                              >
                                <option value="Low">Low - Interruption disabled</option>
                                <option value="Medium">Medium - Balanced natural turns</option>
                                <option value="High">High - Instant interruption response</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider font-mono block mb-1.5">Active Availability</label>
                              <select 
                                value={selectedAgentForStudio.isActive ? "true" : "false"}
                                onChange={(e) => {
                                  const val = e.target.value === "true";
                                  const updated = agents.map(a => a.id === selectedAgentForStudio.id ? { ...a, isActive: val } : a);
                                  onUpdateAgents(updated);
                                  setSelectedAgentForStudio({ ...selectedAgentForStudio, isActive: val });
                                }}
                                className="w-full bg-[#020617] border border-[#1F2937] text-xs text-[#94A3B8] rounded-xl px-4 py-2.5 outline-none cursor-pointer focus:border-[#3B82F6] transition-all"
                              >
                                <option value="true">Active Receptionist</option>
                                <option value="false">Inactive / Standby</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <label className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider font-mono block mb-1.5">Select Voice Model</label>
                              <select 
                                value={selectedAgentForStudio.voice}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updated = agents.map(a => a.id === selectedAgentForStudio.id ? { ...a, voice: val } : a);
                                  onUpdateAgents(updated);
                                  setSelectedAgentForStudio({ ...selectedAgentForStudio, voice: val });
                                }}
                                className="w-full bg-[#020617] border border-[#1F2937] text-xs text-[#94A3B8] rounded-xl px-4 py-2.5 outline-none cursor-pointer focus:border-[#3B82F6] transition-all"
                              >
                                <option value="Alloy - Neutral">Alloy - Neutral (Standard)</option>
                                <option value="Alloy - Friendly & Warm">Alloy - Friendly & Warm</option>
                                <option value="Echo - Resonant Deep">Echo - Resonant Deep</option>
                                <option value="Shimmer - Sweet & Crisp">Shimmer - Sweet & Crisp</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider font-mono block mb-1.5">Select Personality Vibe</label>
                              <select 
                                value={selectedAgentForStudio.personality}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updated = agents.map(a => a.id === selectedAgentForStudio.id ? { ...a, personality: val } : a);
                                  onUpdateAgents(updated);
                                  setSelectedAgentForStudio({ ...selectedAgentForStudio, personality: val });
                                }}
                                className="w-full bg-[#020617] border border-[#1F2937] text-xs text-[#94A3B8] rounded-xl px-4 py-2.5 outline-none cursor-pointer focus:border-[#3B82F6] transition-all"
                              >
                                <option value="Professional">Professional & Courteous</option>
                                <option value="Professional & Empathetic">Professional & Empathetic</option>
                                <option value="Casual & Friendly">Casual & Friendly</option>
                                <option value="Direct & Efficient">Direct & Efficient</option>
                              </select>
                            </div>
                          </div>

                          {/* Greeting Message */}
                          <div>
                            <label className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider font-mono block mb-1.5">Greeting Message *</label>
                            <textarea 
                              rows={3}
                              value={selectedAgentForStudio.greetingMessage}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = agents.map(a => a.id === selectedAgentForStudio.id ? { ...a, greetingMessage: val } : a);
                                onUpdateAgents(updated);
                                setSelectedAgentForStudio({ ...selectedAgentForStudio, greetingMessage: val });
                              }}
                              className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-4 py-3 outline-none transition-all leading-relaxed"
                            />
                            <span className="text-[9.5px] text-[#94A3B8]/60 block mt-1.5 font-medium">The first sentence the AI speaks when answering incoming customer calls.</span>
                          </div>

                          {/* System Prompt Instructions */}
                          <div>
                            <label className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider font-mono block mb-1.5">System Prompt & Behavioral Rules</label>
                            <textarea 
                              rows={6}
                              value={selectedAgentForStudio.systemPrompt}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = agents.map(a => a.id === selectedAgentForStudio.id ? { ...a, systemPrompt: val } : a);
                                onUpdateAgents(updated);
                                setSelectedAgentForStudio({ ...selectedAgentForStudio, systemPrompt: val });
                              }}
                              className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-4 py-3 font-mono outline-none transition-all leading-relaxed"
                            />
                            <span className="text-[9.5px] text-[#94A3B8]/60 block mt-1.5 font-medium">Define strict guidelines on how the receptionist handles questions, pitches oil changes, checkups, pricing, and schedules.</span>
                          </div>

                        </div>
                      )}

                      {/* TEST LIVE VIEW */}
                      {studioSubTab === 'test' && (
                        <div className="space-y-6 mt-6 max-w-lg mx-auto py-4">
                          <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/15 rounded-2xl p-4 text-center text-xs">
                            <span className="text-[#3B82F6] font-extrabold block mb-1 text-sm tracking-tight">🎙 Live Voice Receptionist Sandbox</span>
                            <p className="text-[#94A3B8]">Interact directly with <span className="text-white font-extrabold">{selectedAgentForStudio.name}</span> instantly. Speak into your microphone or type replies below.</p>
                          </div>
                          
                          <DialerSim 
                            agentName={selectedAgentForStudio.name}
                            agentVoice={selectedAgentForStudio.voice}
                            onAppointmentBooked={handleDirectDialerBooking}
                          />
                        </div>
                      )}

                    </div>

                    {/* Bottom Save actions */}
                    {studioSubTab === 'configure' && (
                      <div className="pt-4 border-t border-[#1F2937] mt-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                          <Info className="w-4 h-4 text-[#3B82F6] animate-pulse" />
                          <span className="font-medium">All parameters sync automatically in your secure local session.</span>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => {
                              setAgentSubTab('list');
                            }}
                            className="bg-transparent hover:bg-gray-800 text-[#94A3B8] hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold border border-[#1F2937] transition-all cursor-pointer"
                          >
                            Back to List
                          </button>
                          <motion.button 
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              alert("Configurations updated and deployed successfully!");
                              setAgentSubTab('list');
                            }}
                            className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#3B82F6]/90 hover:to-[#8B5CF6]/90 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl cursor-pointer shadow-md shadow-[#3B82F6]/25 transition-all"
                          >
                            Save & Return to Agents
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {agentSubTab === 'edit' && editingAgent && (
                /* FULL PAGE DETAILED EDIT FORM */
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/5 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="h-full flex flex-col justify-between space-y-6">
                    <div>
                      {/* Edit Header */}
                      <div className="border-b border-[#1F2937] pb-4">
                        <span className="text-[9px] text-[#3B82F6] font-extrabold uppercase bg-[#3B82F6]/10 border border-[#3B82F6]/25 px-2 py-0.5 rounded font-mono">Agent Editor Mode</span>
                        <h3 className="text-white font-extrabold text-xl mt-1 font-display">Configure {editingAgent.name}</h3>
                        <p className="text-xs text-[#94A3B8]">Full panel to alter core receptionist behavior, speech profile, greeting sequences and prompt overrides</p>
                      </div>

                      {/* Editing Fields Form */}
                      <div className="space-y-6 mt-6 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-800">
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div>
                            <label className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider font-mono block mb-1.5">Agent Name *</label>
                            <input 
                              type="text" 
                              value={editingAgent.name}
                              onChange={(e) => setEditingAgent({ ...editingAgent, name: e.target.value })}
                              className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-4 py-2.5 outline-none transition-all"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider font-mono block mb-1.5">Interruption Sensitivity</label>
                            <select 
                              value={editingAgent.interruptionSensitivity}
                              onChange={(e) => setEditingAgent({ ...editingAgent, interruptionSensitivity: e.target.value as any })}
                              className="w-full bg-[#020617] border border-[#1F2937] text-xs text-[#94A3B8] rounded-xl px-4 py-2.5 outline-none cursor-pointer focus:border-[#3B82F6] transition-all"
                            >
                              <option value="Low">Low - Interruption disabled</option>
                              <option value="Medium">Medium - Balanced natural turns</option>
                              <option value="High">High - Instant interruption response</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider font-mono block mb-1.5">Active Agent Status</label>
                            <div className="flex items-center gap-3 bg-[#020617] border border-[#1F2937] rounded-xl px-4 py-2 h-[38px]">
                              <button 
                                type="button"
                                onClick={() => setEditingAgent({ ...editingAgent, isActive: !editingAgent.isActive })}
                                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                                  editingAgent.isActive ? 'bg-[#3B82F6]' : 'bg-gray-800 border border-[#1F2937]'
                                }`}
                              >
                                <motion.div 
                                  layout
                                  className="bg-white w-4 h-4 rounded-full shadow-md"
                                  animate={{ x: editingAgent.isActive ? 20 : 0 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                              </button>
                              <span className="text-xs font-bold text-gray-300">
                                {editingAgent.isActive ? 'Active on Dashboard' : 'Standby / Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider font-mono block mb-1.5">Select Voice Model</label>
                            <select 
                              value={editingAgent.voice}
                              onChange={(e) => setEditingAgent({ ...editingAgent, voice: e.target.value })}
                              className="w-full bg-[#020617] border border-[#1F2937] text-xs text-[#94A3B8] rounded-xl px-4 py-2.5 outline-none cursor-pointer focus:border-[#3B82F6] transition-all"
                            >
                              <option value="Alloy - Neutral">Alloy - Neutral (Standard)</option>
                              <option value="Alloy - Friendly & Warm">Alloy - Friendly & Warm</option>
                              <option value="Echo - Resonant Deep">Echo - Resonant Deep</option>
                              <option value="Shimmer - Sweet & Crisp">Shimmer - Sweet & Crisp</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider font-mono block mb-1.5">Select Personality Vibe</label>
                            <select 
                              value={editingAgent.personality}
                              onChange={(e) => setEditingAgent({ ...editingAgent, personality: e.target.value })}
                              className="w-full bg-[#020617] border border-[#1F2937] text-xs text-[#94A3B8] rounded-xl px-4 py-2.5 outline-none cursor-pointer focus:border-[#3B82F6] transition-all"
                            >
                              <option value="Professional">Professional & Courteous</option>
                              <option value="Professional & Empathetic">Professional & Empathetic</option>
                              <option value="Casual & Friendly">Casual & Friendly</option>
                              <option value="Direct & Efficient">Direct & Efficient</option>
                            </select>
                          </div>
                        </div>

                        {/* Greeting Message */}
                        <div>
                          <label className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider font-mono block mb-1.5">Greeting Message *</label>
                          <textarea 
                            rows={3}
                            value={editingAgent.greetingMessage}
                            onChange={(e) => setEditingAgent({ ...editingAgent, greetingMessage: e.target.value })}
                            className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-4 py-3 outline-none transition-all leading-relaxed"
                          />
                          <span className="text-[9.5px] text-[#94A3B8]/60 block mt-1.5 font-medium">The introductory phrase this agent speaks immediately upon customer pickup.</span>
                        </div>

                        {/* System Prompt Rules */}
                        <div>
                          <label className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider font-mono block mb-1.5">System Prompt & Instruction Overrides</label>
                          <textarea 
                            rows={6}
                            value={editingAgent.systemPrompt}
                            onChange={(e) => setEditingAgent({ ...editingAgent, systemPrompt: e.target.value })}
                            className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-4 py-3 font-mono outline-none transition-all leading-relaxed"
                          />
                          <span className="text-[9.5px] text-[#94A3B8]/60 block mt-1.5 font-medium">Core rules the agent follows, such as matching services, lookup procedures, quoting repair estimates, etc.</span>
                        </div>

                      </div>
                    </div>

                    {/* Form actions */}
                    <div className="pt-4 border-t border-[#1F2937] mt-6 flex items-center justify-between">
                      <p className="text-[10px] text-[#94A3B8]/60 italic">
                        *Verify changes in live sandbox simulator once saved.
                      </p>
                      <div className="flex gap-3">
                        <button 
                          type="button"
                          onClick={() => {
                            setAgentSubTab('list');
                            setEditingAgent(null);
                          }}
                          className="bg-[#020617] hover:bg-[#111827] text-[#94A3B8] hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold border border-[#1F2937] transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <motion.button 
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => {
                            if (!editingAgent.name) return;
                            const updated = agents.map(a => a.id === editingAgent.id ? editingAgent : a);
                            onUpdateAgents(updated);
                            setAgentSubTab('list');
                            setEditingAgent(null);
                            alert("Agent edits saved successfully!");
                          }}
                          className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#3B82F6]/90 hover:to-[#8B5CF6]/90 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl cursor-pointer shadow-md shadow-[#3B82F6]/25 transition-all"
                        >
                          Save Changes
                        </motion.button>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

            </motion.div>
          )}
 
          {/* SERVICES TAB */}
          {activeTab === 'services' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] rounded-2xl p-6 space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6]/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-extrabold text-base tracking-tight">Services Catalog</h4>
                  <p className="text-[10px] text-[#94A3B8]">Specify repair and checkup packages your AI receptionist is authorized to pitch & book</p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowServiceModal(true)}
                  className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#3B82F6]/90 hover:to-[#8B5CF6]/90 text-white text-xs font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#3B82F6]/20 transition-colors"
                >
                  <Plus className="w-4 h-4 stroke-[3]" /> Add Service
                </motion.button>
              </div>
 
              {/* Service Grid items */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {services.map((srv, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={srv.id} 
                    className="bg-[#020617]/40 border border-[#1F2937] rounded-2xl p-5 flex flex-col justify-between relative group hover:border-[#3B82F6]/30 hover:bg-[#020617] transition-all duration-300 shadow-md"
                  >
                    
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <span className="bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] text-[9px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
                          {srv.priceType}
                        </span>
                        
                        <motion.button 
                          whileHover={{ scale: 1.1, color: "#f87171" }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteService(srv.id)}
                          className="text-[#94A3B8] hover:text-red-400 p-1.5 rounded-lg hover:bg-[#020617] transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
 
                      <h4 className="text-white font-extrabold text-sm mb-2 group-hover:text-[#3B82F6] transition-colors">{srv.name}</h4>
                      <p className="text-[#94A3B8] text-[11px] leading-relaxed mb-4">{srv.description || 'No description provided.'}</p>
                    </div>
 
                    <div className="flex items-center justify-between pt-4 border-t border-[#1F2937] mt-2 text-xs">
                      <span className="text-[#94A3B8] flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#3B82F6]" /> {srv.durationMinutes} minutes
                      </span>
                      <span className="text-[#3B82F6] font-mono font-extrabold text-base tracking-tight">
                        ${srv.price}
                      </span>
                    </div>
 
                  </motion.div>
                ))}
              </div>
 
            </motion.div>
          )}
 
          {/* FAQS TAB */}
          {activeTab === 'faqs' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] rounded-2xl p-6 space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#3B82F6]/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-white font-extrabold text-base tracking-tight">FAQs Knowledge Base</h4>
                  <p className="text-[10px] text-[#94A3B8]">Add common queries so your AI voice receptionist can resolve user concerns instantly</p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowFaqModal(true)}
                  className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#3B82F6]/90 hover:to-[#8B5CF6]/90 text-white text-xs font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#3B82F6]/20 transition-colors"
                >
                  <Plus className="w-4 h-4 stroke-[3]" /> Add FAQ
                </motion.button>
              </div>
 
              {/* FAQ Category Pills filter */}
              <div className="flex flex-wrap gap-2">
                {faqCategories.map((cat, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setFaqCategoryFilter(cat)}
                    className={`text-xs px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer font-bold ${
                      faqCategoryFilter === cat 
                        ? 'bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white border-none shadow-md shadow-[#3B82F6]/20' 
                        : 'bg-[#020617]/80 border border-[#1F2937] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
 
              {/* FAQ List expanded accordion style */}
              <div className="space-y-3 max-w-4xl">
                {filteredFAQs.map((faq) => (
                  <details key={faq.id} className="bg-[#020617]/40 border border-[#1F2937] rounded-2xl group transition-all duration-350">
                    <summary className="p-4 flex items-center justify-between font-bold text-xs text-white cursor-pointer select-none outline-none list-none group-hover:bg-[#020617] rounded-t-2xl">
                      <div className="flex items-center gap-2.5">
                        <span className="bg-[#111827] text-[9px] font-bold font-mono text-[#3B82F6] px-2 py-0.5 rounded border border-[#1F2937] uppercase tracking-wider">
                          {faq.category}
                        </span>
                        <span>{faq.question}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <motion.button 
                          whileHover={{ scale: 1.1, color: "#f87171" }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.preventDefault();
                            deleteFaq(faq.id);
                          }}
                          className="text-[#94A3B8] hover:text-red-400 p-1.5 rounded-lg hover:bg-[#111827] transition-colors pointer-events-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                        <ChevronDown className="w-4 h-4 text-[#94A3B8] group-open:rotate-180 transition-transform duration-300" />
                      </div>
                    </summary>
                    <div className="px-4 pb-4 pt-2 text-[11px] text-[#94A3B8] leading-relaxed border-t border-[#1F2937] mt-1">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
 
            </motion.div>
          )}
 
          {/* WIDGET TAB */}
          {activeTab === 'widget' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] rounded-2xl p-6 space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6]/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div>
                <h4 className="text-white font-extrabold text-base tracking-tight">Embeddable Voice Widgets</h4>
                <p className="text-[10px] text-[#94A3B8]">Embed this simple floating receptionist dialer right into your live HTML page</p>
              </div>
 
              <div className="space-y-6">
                {widgets.map((wdg) => {
                  const agent = agents.find(a => a.id === wdg.agentId);
                  return (
                    <div key={wdg.id} className="bg-[#020617]/40 border border-[#1F2937] rounded-2xl p-5 space-y-4 shadow-inner">
                      
                      {/* Widget specs */}
                      <div className="flex items-start justify-between border-b border-[#1F2937] pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full shadow-md shadow-[#3B82F6]/20" style={{ backgroundColor: wdg.primaryColor }}></div>
                          <div>
                            <h5 className="text-white font-bold text-xs">{wdg.name} <span className="text-[9px] text-[#3B82F6] bg-[#3B82F6]/10 px-2.5 py-0.5 rounded-full border border-[#3B82F6]/20 ml-2 font-extrabold uppercase font-mono">Active</span></h5>
                            <p className="text-[10px] text-[#94A3B8] mt-0.5">Position: <span className="capitalize">{wdg.position}</span> • Mapped Agent: <span className="text-white font-medium">{agent?.name || 'Default'}</span></p>
                          </div>
                        </div>
 
                        <span className="text-[9.5px] font-mono text-[#94A3B8] bg-[#020617] px-2.5 py-1 rounded-lg border border-[#1F2937]">businessId: {wdg.id}</span>
                      </div>
 
                      {/* Code Snippet */}
                      <div className="relative">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            alert("Integration script tag copied!");
                          }}
                          className="absolute top-3 right-3 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-md"
                        >
                          Copy Code
                        </motion.button>
                        
                        <pre className="bg-[#020617]/90 p-5 rounded-xl text-[10.5px] font-mono leading-relaxed text-gray-300 overflow-x-auto border border-[#1F2937]">
                          {`<!-- CarBot AI Voice Widget -->
<script src="https://yourapp.com/widget-sim.js"></script>
<script>
  CarBot.init({
    businessId: "${wdg.id}",
    agentId: "${wdg.agentId}",
    position: "${wdg.position}",
    primaryColor: "${wdg.primaryColor}"
  });
</script>`}
                        </pre>
                      </div>
 
                    </div>
                  );
                })}
              </div>
 
            </motion.div>
          )}
 
          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] rounded-2xl p-6 space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6]/5 rounded-full blur-3xl pointer-events-none"></div>
              
              {/* Header and inner tabs */}
              <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
                <div className="flex text-xs font-bold gap-6">
                  <button 
                    onClick={() => setSettingsTab('profile')}
                    className={`pb-3 relative cursor-pointer font-extrabold tracking-tight transition-all ${
                      settingsTab === 'profile' ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]' : 'text-[#94A3B8] hover:text-gray-200'
                    }`}
                  >
                    Business Profile
                  </button>
                  <button 
                    onClick={() => setSettingsTab('hours')}
                    className={`pb-3 relative cursor-pointer font-extrabold tracking-tight transition-all ${
                      settingsTab === 'hours' ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]' : 'text-[#94A3B8] hover:text-gray-200'
                    }`}
                  >
                    Business Hours
                  </button>
                </div>
              </div>
 
              {/* PROFILE SUB TAB */}
              {settingsTab === 'profile' && (
                <div className="space-y-4 max-w-2xl">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-[#94A3B8] uppercase font-bold font-mono tracking-wider block mb-1.5">Business Name *</label>
                      <input 
                        type="text" 
                        value={profile.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#94A3B8] uppercase font-bold font-mono tracking-wider block mb-1.5">Phone Number *</label>
                      <input 
                        type="text" 
                        value={profile.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                      />
                    </div>
                  </div>
 
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-[#94A3B8] uppercase font-bold font-mono tracking-wider block mb-1.5">Support Email</label>
                      <input 
                        type="email" 
                        value={profile.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#94A3B8] uppercase font-bold font-mono tracking-wider block mb-1.5">Website URL</label>
                      <input 
                        type="text" 
                        value={profile.website}
                        onChange={(e) => handleProfileChange('website', e.target.value)}
                        className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                      />
                    </div>
                  </div>
 
                  <div>
                    <label className="text-[10px] text-[#94A3B8] uppercase font-bold font-mono tracking-wider block mb-1.5">Street Address</label>
                    <input 
                      type="text" 
                      value={profile.address}
                      onChange={(e) => handleProfileChange('address', e.target.value)}
                      className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                    />
                  </div>
 
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-[#94A3B8] uppercase font-bold font-mono tracking-wider block mb-1.5">City</label>
                      <input 
                        type="text" 
                        value={profile.city}
                        onChange={(e) => handleProfileChange('city', e.target.value)}
                        className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#94A3B8] uppercase font-bold font-mono tracking-wider block mb-1.5">State</label>
                      <input 
                        type="text" 
                        value={profile.state}
                        onChange={(e) => handleProfileChange('state', e.target.value)}
                        className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#94A3B8] uppercase font-bold font-mono tracking-wider block mb-1.5">Zip Code</label>
                      <input 
                        type="text" 
                        value={profile.zip}
                        onChange={(e) => handleProfileChange('zip', e.target.value)}
                        className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                      />
                    </div>
                  </div>
 
                  <div className="pt-4 flex justify-end">
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => alert("Business profile details successfully updated!")}
                      className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#3B82F6]/90 hover:to-[#8B5CF6]/90 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-md shadow-[#3B82F6]/20 transition-colors"
                    >
                      Save Changes
                    </motion.button>
                  </div>
 
                </div>
              )}
 
              {/* HOURS SUB TAB */}
              {settingsTab === 'hours' && (
                <div className="space-y-4 max-w-2xl">
                  
                  <div className="space-y-3">
                    {Object.keys(hours).map((dayKey) => {
                      const day = dayKey as keyof BusinessHours;
                      const dayInfo = hours[day];
                      return (
                        <div key={day} className="flex items-center justify-between bg-[#020617]/40 p-4 rounded-xl border border-[#1F2937] shadow-sm">
                          
                          <div className="flex items-center gap-3 w-28">
                            <input 
                              type="checkbox" 
                              checked={dayInfo.isOpen}
                              onChange={(e) => handleHoursChange(day, 'isOpen', e.target.checked)}
                              className="accent-[#3B82F6] w-4 h-4 cursor-pointer"
                            />
                            <span className="capitalize text-xs font-bold text-white">{day}</span>
                          </div>
 
                          {dayInfo.isOpen ? (
                            <div className="flex items-center gap-3 text-xs font-mono">
                              <input 
                                type="text" 
                                value={dayInfo.from} 
                                onChange={(e) => handleHoursChange(day, 'from', e.target.value)}
                                className="bg-[#020617] border border-[#1F2937] px-3 py-1.5 rounded-lg text-white text-center w-28 outline-none focus:border-[#3B82F6] transition-all" 
                              />
                              <span className="text-[#94A3B8] font-bold">to</span>
                              <input 
                                type="text" 
                                value={dayInfo.to} 
                                onChange={(e) => handleHoursChange(day, 'to', e.target.value)}
                                className="bg-[#020617] border border-[#1F2937] px-3 py-1.5 rounded-lg text-white text-center w-28 outline-none focus:border-[#3B82F6] transition-all" 
                              />
                            </div>
                          ) : (
                            <span className="text-xs text-red-400 font-bold font-mono tracking-wide bg-red-950/20 px-3 py-1 rounded-lg border border-red-900/10">Closed</span>
                          )}
 
                        </div>
                      );
                    })}
                  </div>
 
                  <div className="pt-4 flex justify-end">
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => alert("Business hours successfully updated!")}
                      className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#3B82F6]/90 hover:to-[#8B5CF6]/90 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-md shadow-[#3B82F6]/20"
                    >
                      Save Hours
                    </motion.button>
                  </div>
 
                </div>
              )}
 
            </motion.div>
          )}

          {/* SCHEDULE (CALENDAR) TAB */}
          {activeTab === 'schedule' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121e36] border border-[#1e293b] p-6 rounded-2xl">
                <div>
                  <h3 className="text-white font-display font-black text-base tracking-tight">Clinical Appointment Calendar</h3>
                  <p className="text-xs text-[#617496]">Monitor real-time slot bookings and clinic scheduling.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs font-mono font-bold text-[#2563eb] bg-[#2563eb]/10 border border-[#2563eb]/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4" /> May 2026
                  </span>
                  <button 
                    onClick={() => setShowAptModal(true)} 
                    className="bg-[#2563eb] hover:bg-[#2563eb]/90 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#2563eb]/15 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Schedule Call
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Calendar Grid Container */}
                <div className="lg:col-span-2 bg-[#121e36] border border-[#1e293b] rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">May 2026</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded-md font-bold font-mono">Live Sync</span>
                    </div>
                    <div className="flex gap-1">
                      <button className="text-[#617496] hover:text-white p-1 rounded hover:bg-[#0d172a] transition-all"><ChevronRight className="w-4 h-4 rotate-180" /></button>
                      <button className="text-[#617496] hover:text-white p-1 rounded hover:bg-[#0d172a] transition-all"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {/* Days of the Week */}
                  <div className="grid grid-cols-7 gap-2 text-center text-[10px] text-[#617496] font-bold uppercase tracking-wider mb-2">
                    <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                  </div>

                  {/* May 2026 Grid: Starts on Friday (May 1st) */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Empty cells for Sun-Thu before 1st */}
                    <div className="aspect-square bg-[#0d172a]/20 rounded-xl opacity-30 border border-transparent"></div>
                    <div className="aspect-square bg-[#0d172a]/20 rounded-xl opacity-30 border border-transparent"></div>
                    <div className="aspect-square bg-[#0d172a]/20 rounded-xl opacity-30 border border-transparent"></div>
                    <div className="aspect-square bg-[#0d172a]/20 rounded-xl opacity-30 border border-transparent"></div>
                    <div className="aspect-square bg-[#0d172a]/20 rounded-xl opacity-30 border border-transparent"></div>
                    
                    {/* Render days of May */}
                    {Array.from({ length: 31 }, (_, i) => {
                      const day = i + 1;
                      const dateStr = `2026-05-${day.toString().padStart(2, '0')}`;
                      const isSelected = selectedCalendarDate === dateStr;
                      
                      // Check if appointments on this day
                      const dayApts = appointments.filter(a => a.scheduledAt.startsWith(dateStr));
                      const hasApts = dayApts.length > 0;

                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedCalendarDate(dateStr)}
                          className={`aspect-square rounded-xl flex flex-col justify-between p-2 relative border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-[#2563eb]/20 border-[#2563eb] text-white shadow-md shadow-[#2563eb]/5'
                              : 'bg-[#0d172a]/40 border-[#1e293b]/60 text-gray-300 hover:border-[#2563eb]/40'
                          }`}
                        >
                          <span className="text-xs font-bold">{day}</span>
                          {hasApts && (
                            <div className="flex gap-1 max-w-full overflow-hidden self-end">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] shadow-md shadow-[#2563eb]/50"></span>
                              {dayApts.length > 1 && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]"></span>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Appointments on Selected Day */}
                <div className="bg-[#121e36] border border-[#1e293b] rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-[#1e293b] mb-4">
                      <div>
                        <span className="text-[10px] text-[#617496] uppercase font-black tracking-wider block">Selected Schedule</span>
                        <span className="font-extrabold text-sm text-white">May {selectedCalendarDate.split('-')[2] || '16'}, 2026</span>
                      </div>
                      <span className="text-xs font-bold text-[#2563eb] bg-[#2563eb]/10 px-2.5 py-1 rounded-lg">
                        {appointments.filter(a => a.scheduledAt.startsWith(selectedCalendarDate)).length} Booked
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                      {appointments.filter(a => a.scheduledAt.startsWith(selectedCalendarDate)).length === 0 ? (
                        <div className="text-center py-12">
                          <CalendarDays className="w-8 h-8 text-[#617496]/50 mx-auto mb-2.5" />
                          <p className="text-xs font-bold text-[#617496]">No appointments scheduled for this date.</p>
                          <p className="text-[10px] text-[#617496]/70 mt-1">Click "Schedule Call" to list a new visit.</p>
                        </div>
                      ) : (
                        appointments
                          .filter(a => a.scheduledAt.startsWith(selectedCalendarDate))
                          .map((apt) => (
                            <div key={apt.id} className="bg-[#0d172a]/60 border border-[#1e293b] p-3.5 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-black text-xs text-white">{apt.customerName}</span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                  apt.status === 'confirmed' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40' :
                                  apt.status === 'pending' ? 'bg-amber-950/40 text-amber-400 border border-amber-900/40' :
                                  'bg-red-950/40 text-red-400 border border-red-900/40'
                                }`}>
                                  {apt.status}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-[#617496] font-mono">
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {apt.scheduledAt.split('T')[1]?.substring(0, 5) || "10:00"}</span>
                                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {apt.phoneNumber}</span>
                              </div>
                              {apt.notes && (
                                <p className="text-[10px] text-[#617496] bg-[#080d1a]/50 p-2 rounded-lg border border-[#1e293b]/50">
                                  {apt.notes}
                                </p>
                              )}
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#1e293b] mt-4">
                    <div className="bg-[#0d172a]/50 border border-[#1e293b]/80 p-3 rounded-xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#2563eb]/10 flex items-center justify-center text-[#2563eb]">
                        <Info className="w-4.5 h-4.5" />
                      </div>
                      <p className="text-[10px] text-[#617496] leading-relaxed">
                        To update clinical appointments, go to the <b className="text-white">Appointments</b> tab.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* PATIENTS TAB */}
          {activeTab === 'patients' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121e36] border border-[#1e293b] p-6 rounded-2xl">
                <div>
                  <h3 className="text-white font-display font-black text-base tracking-tight">Patient Directory</h3>
                  <p className="text-xs text-[#617496]">Complete repository of active patient contact records and clinical voice notes.</p>
                </div>
                <button 
                  onClick={() => setShowPatientModal(true)}
                  className="bg-[#2563eb] hover:bg-[#2563eb]/90 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#2563eb]/15 transition-all self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Patient
                </button>
              </div>

              {/* Search & Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2 relative">
                  <Search className="w-4 h-4 text-[#617496] absolute left-3.5 top-3" />
                  <input 
                    type="text" 
                    placeholder="Search by name, phone number, vehicle..." 
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="w-full bg-[#121e36] border border-[#1e293b] focus:border-[#2563eb] text-xs text-white rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all placeholder:text-[#617496]"
                  />
                </div>
                <div className="bg-[#121e36] border border-[#1e293b] rounded-xl px-4 py-2.5 flex items-center justify-between">
                  <span className="text-[10px] text-[#617496] uppercase font-bold">Total Patients</span>
                  <span className="font-mono font-black text-white">{patients.length}</span>
                </div>
                <div className="bg-[#121e36] border border-[#1e293b] rounded-xl px-4 py-2.5 flex items-center justify-between">
                  <span className="text-[10px] text-[#617496] uppercase font-bold">Active Calls</span>
                  <span className="font-mono font-black text-emerald-400">2 Live</span>
                </div>
              </div>

              {/* Patients List */}
              <div className="bg-[#121e36] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#0d172a] border-b border-[#1e293b] text-[#617496] font-bold">
                        <th className="p-4">Patient Name</th>
                        <th className="p-4">Contact Phone & Email</th>
                        <th className="p-4">Primary Vehicle / Field</th>
                        <th className="p-4">Latest Voice Note</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e293b]/60">
                      {patients
                        .filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.phone.includes(patientSearch) || p.vehicle.toLowerCase().includes(patientSearch.toLowerCase()))
                        .map((p) => (
                          <tr key={p.id} className="hover:bg-[#121e36]/40 transition-colors">
                            <td className="p-4 font-bold text-white flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#2563eb]/10 text-[#2563eb] flex items-center justify-center font-extrabold font-mono text-xs border border-[#2563eb]/20">
                                {p.name.substring(0, 1)}
                              </div>
                              <div>
                                <span className="block">{p.name}</span>
                                <span className={`inline-block text-[8px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${
                                  p.status === 'Active' ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/20' : 'bg-[#617496]/20 text-[#617496]'
                                }`}>{p.status}</span>
                              </div>
                            </td>
                            <td className="p-4 space-y-0.5">
                              <span className="block font-mono text-white/90">{p.phone}</span>
                              <span className="block text-[10px] text-[#617496]">{p.email}</span>
                            </td>
                            <td className="p-4 text-white/80 font-medium">
                              {p.vehicle}
                            </td>
                            <td className="p-4 max-w-xs">
                              <p className="text-[10px] text-[#617496] leading-relaxed line-clamp-2 bg-[#0d172a]/40 p-2 rounded-lg border border-[#1e293b]/30">
                                {p.notes}
                              </p>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button 
                                  onClick={() => {
                                    alert(`Initializing call routing simulator with ${p.name}... Open Dialer simulator on top right of landing screen to handle live audio!`);
                                  }}
                                  className="text-[#2563eb] bg-[#2563eb]/10 hover:bg-[#2563eb]/20 p-2 rounded-lg border border-[#2563eb]/15 transition-all cursor-pointer"
                                  title="Simulate Inbound Call"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => setPatients(patients.filter(pat => pat.id !== p.id))}
                                  className="text-red-400 bg-red-950/10 hover:bg-red-950/30 p-2 rounded-lg border border-red-950/20 transition-all cursor-pointer"
                                  title="Remove Patient"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* HELP SUPPORT TAB */}
          {activeTab === 'support' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121e36] border border-[#1e293b] p-6 rounded-2xl">
                <div>
                  <h3 className="text-white font-display font-black text-base tracking-tight">MediCall Help Desk</h3>
                  <p className="text-xs text-[#617496]">Chat with the clinical AI developer or manage platform support tickets.</p>
                </div>
                <div className="bg-[#080d1a] border border-[#1e293b] px-4 py-1.5 rounded-xl flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-bold text-[#617496]">Server response time:</span>
                  <span className="font-mono text-emerald-400 font-bold">24ms</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Ticket List (Left 5 cols) */}
                <div className="lg:col-span-5 space-y-3 bg-[#121e36] border border-[#1e293b] p-5 rounded-2xl flex flex-col h-[520px]">
                  <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
                    <span className="text-xs font-black text-white uppercase tracking-wider font-display">Active Tickets</span>
                    <button 
                      onClick={() => {
                        const title = prompt("Enter support ticket subject:");
                        if (title) {
                          const newTicket = {
                            id: 't' + (supportTickets.length + 1),
                            title,
                            status: 'Open',
                            priority: 'High',
                            date: 'May 16, 2026',
                            category: 'General Inquiry',
                            description: 'Awaiting support administrator review.'
                          };
                          setSupportTickets([newTicket, ...supportTickets]);
                          setSelectedTicketId(newTicket.id);
                        }
                      }}
                      className="text-[10px] font-bold text-white bg-[#2563eb] px-2.5 py-1 rounded-lg hover:bg-[#2563eb]/90 transition-all cursor-pointer"
                    >
                      + Create Ticket
                    </button>
                  </div>

                  <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 scrollbar-none">
                    {supportTickets.map((t) => {
                      const isSelected = selectedTicketId === t.id;
                      return (
                        <div 
                          key={t.id}
                          onClick={() => setSelectedTicketId(t.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-[#0d172a] border-[#2563eb]/80 shadow-md shadow-[#2563eb]/5' 
                              : 'bg-[#0d172a]/30 border-[#1e293b]/70 hover:border-[#2563eb]/40'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[9px] font-mono font-bold text-[#617496]">{t.category}</span>
                            <span className={`text-[8px] font-black px-1.5 py-0.2 rounded ${
                              t.priority === 'Critical' ? 'bg-rose-950/40 text-rose-400 border border-rose-900/30' :
                              t.priority === 'High' ? 'bg-amber-950/40 text-amber-400 border border-amber-900/30' :
                              'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30'
                            }`}>{t.priority}</span>
                          </div>
                          <span className="font-bold text-xs text-white block mb-2">{t.title}</span>
                          <div className="flex items-center justify-between text-[10px] text-[#617496] font-mono">
                            <span>Status: <b className={t.status === 'Resolved' ? 'text-emerald-400' : 'text-amber-400'}>{t.status}</b></span>
                            <span>{t.date}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Ticket View & AI Live Assistant (Right 7 cols) */}
                <div className="lg:col-span-7 bg-[#121e36] border border-[#1e293b] rounded-2xl flex flex-col h-[520px] overflow-hidden">
                  
                  {/* Top Bar Tabs: Switch between Selected Ticket and Live Developer Bot */}
                  <div className="bg-[#0d172a] border-b border-[#1e293b] px-4 py-3 flex items-center justify-between">
                    <span className="text-xs font-black text-white flex items-center gap-2 font-display">
                      <Headphones className="w-4 h-4 text-[#2563eb]" /> Clinical AI Assistant Desk
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/30 border border-emerald-900/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Online</span>
                  </div>

                  {/* Chat interface */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-none flex flex-col justify-between">
                    
                    {/* Selected ticket details block at the top */}
                    {supportTickets.find(t => t.id === selectedTicketId) && (
                      <div className="bg-[#0d172a]/50 border border-[#1e293b] p-3.5 rounded-xl">
                        <span className="text-[9px] text-[#617496] uppercase font-bold tracking-wider block">Currently Viewing:</span>
                        <h4 className="font-extrabold text-xs text-white mt-0.5">{supportTickets.find(t => t.id === selectedTicketId)?.title}</h4>
                        <p className="text-[10px] text-[#617496] mt-2 leading-relaxed bg-[#080d1a] p-2 rounded-lg border border-[#1e293b]/50">
                          {supportTickets.find(t => t.id === selectedTicketId)?.description}
                        </p>
                      </div>
                    )}

                    {/* Chat Messages */}
                    <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
                      {supportChat.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-3 rounded-xl max-w-sm text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-[#2563eb] text-white rounded-br-none'
                              : 'bg-[#0d172a] text-[#F8FAFC] border border-[#1e293b] rounded-bl-none'
                          }`}>
                            <p>{msg.text}</p>
                            <span className="text-[8px] font-mono text-[#617496] block text-right mt-1.5">{msg.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Predefined Helper Question Pills */}
                    <div className="pt-2 border-t border-[#1e293b]/60 flex gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
                      {[
                        "How do I add medical keywords to my voice agent?",
                        "What is the phone calling pricing per minute?",
                        "How do I embed the web floating widget?"
                      ].map((pill, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            const userMsg = { sender: 'user', text: pill, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
                            let aiResponseText = '';
                            if (pill.includes('keywords')) {
                              aiResponseText = "You can add custom medical vocabulary and auto-replies directly within the 'Knowledge' tab. Add key-value entries like 'insurance' or 'emergency services' to instantly feed it to the agent's brain.";
                            } else if (pill.includes('pricing')) {
                              aiResponseText = "Inbound/outbound calls on MediCall are flat-rate at $0.05 per minute. All local phone numbers are priced at $1.50 per month, completely managed under your 'Plan & Billing' wallet.";
                            } else {
                              aiResponseText = "To embed the floating dialer widget, copy the HTML script block from the 'Widget' tab and place it before the closing </body> tag of your website. It will configure style and color automatically!";
                            }

                            const aiMsg = { sender: 'ai', text: aiResponseText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
                            setSupportChat(prev => [...prev, userMsg, aiMsg]);
                          }}
                          className="text-[10px] text-white/90 bg-[#121e36] border border-[#1e293b] px-3 py-1.5 rounded-full hover:border-[#2563eb] transition-all whitespace-nowrap cursor-pointer hover:bg-[#2563eb]/10"
                        >
                          {pill}
                        </button>
                      ))}
                    </div>

                    {/* Message input */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newSupportChatMsg.trim()) return;
                        const userMsg = { sender: 'user', text: newSupportChatMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
                        const aiMsg = { sender: 'ai', text: "Your message has been captured by the ticketing service! Our clinical operations team will response within 2 hours. Feel free to use the interactive pills below for instant answers.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
                        setSupportChat(prev => [...prev, userMsg, aiMsg]);
                        setNewSupportChatMsg('');
                      }}
                      className="flex gap-2 shrink-0 pt-2"
                    >
                      <input 
                        type="text" 
                        placeholder="Type a custom query to MediCall support team..." 
                        value={newSupportChatMsg}
                        onChange={(e) => setNewSupportChatMsg(e.target.value)}
                        className="flex-1 bg-[#0d172a] border border-[#1e293b] focus:border-[#2563eb] text-xs text-white rounded-xl px-3.5 py-2.5 outline-none transition-all placeholder:text-[#617496]"
                      />
                      <button 
                        type="submit" 
                        className="bg-[#2563eb] hover:bg-[#2563eb]/90 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer shrink-0"
                      >
                        Send
                      </button>
                    </form>

                  </div>

                </div>

              </div>
            </motion.div>
          )}

          {/* WEBSITE TAB */}
          {activeTab === 'website' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121e36] border border-[#1e293b] p-6 rounded-2xl">
                <div>
                  <h3 className="text-white font-display font-black text-base tracking-tight">Website Voice Button Customizer</h3>
                  <p className="text-xs text-[#617496]">Build an elegant click-to-call clinical AI button to embed on your website.</p>
                </div>
                {isWidgetSaved && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 self-start sm:self-auto animate-pulse">
                    <Check className="w-4 h-4" /> Customized Live Widget Saved!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Customizer (Left 5 cols) */}
                <div className="lg:col-span-5 bg-[#121e36] border border-[#1e293b] p-5 rounded-2xl space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-xs font-black text-white uppercase tracking-wider block border-b border-[#1e293b] pb-2 font-display">Style Preferences</span>
                    
                    <div>
                      <label className="text-[10px] text-[#617496] uppercase font-bold block mb-1.5">Floating Button Text</label>
                      <input 
                        type="text" 
                        value={widgetBtnText} 
                        onChange={(e) => { setWidgetBtnText(e.target.value); setIsWidgetSaved(false); }}
                        className="w-full bg-[#0d172a] border border-[#1e293b] focus:border-[#2563eb] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-[#617496] uppercase font-bold block mb-1.5">Voice Button Placement</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => { setWidgetBtnPosition('right'); setIsWidgetSaved(false); }}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            widgetBtnPosition === 'right' 
                              ? 'bg-[#2563eb]/20 border-[#2563eb] text-white' 
                              : 'bg-[#0d172a] border-[#1e293b] text-[#617496] hover:text-white'
                          }`}
                        >
                          Bottom Right
                        </button>
                        <button 
                          onClick={() => { setWidgetBtnPosition('left'); setIsWidgetSaved(false); }}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            widgetBtnPosition === 'left' 
                              ? 'bg-[#2563eb]/20 border-[#2563eb] text-white' 
                              : 'bg-[#0d172a] border-[#1e293b] text-[#617496] hover:text-white'
                          }`}
                        >
                          Bottom Left
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#617496] uppercase font-bold block mb-1.5">Theme Color Accent</label>
                      <div className="flex gap-2">
                        {['#2563eb', '#7c3aed', '#db2777', '#10b981', '#f59e0b'].map((color) => (
                          <button
                            key={color}
                            onClick={() => { setWidgetBtnColor(color); setIsWidgetSaved(false); }}
                            style={{ backgroundColor: color }}
                            className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-all ${
                              widgetBtnColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#617496] uppercase font-bold block mb-1.5">Voice Greeting Message</label>
                      <textarea 
                        rows={2.5}
                        value={widgetBtnGreeting} 
                        onChange={(e) => { setWidgetBtnGreeting(e.target.value); setIsWidgetSaved(false); }}
                        className="w-full bg-[#0d172a] border border-[#1e293b] focus:border-[#2563eb] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsWidgetSaved(true)}
                    className="w-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white font-black text-xs py-3 rounded-xl hover:shadow-lg hover:shadow-[#2563eb]/10 transition-all cursor-pointer"
                  >
                    Save & Build Embedded Script
                  </button>
                </div>

                {/* Live Preview Website Container (Right 7 cols) */}
                <div className="lg:col-span-7 bg-[#121e36] border border-[#1e293b] p-5 rounded-2xl flex flex-col justify-between min-h-[380px] relative overflow-hidden">
                  <div>
                    <span className="text-xs font-black text-white uppercase tracking-wider block border-b border-[#1e293b] pb-2 mb-4 font-display">Patient Landing Page Live Preview</span>
                    
                    {/* Simulated Clinic Landing Page */}
                    <div className="bg-[#080d1a] border border-[#1e293b]/70 rounded-xl p-5 min-h-[260px] relative shadow-inner">
                      <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]/50">
                        <span className="font-extrabold text-xs text-white flex items-center gap-1.5"><Activity className="w-4 h-4 text-[#2563eb]" /> {profile.name || "Blockchain Health Group"}</span>
                        <div className="flex gap-1.5 text-[8px] text-[#617496] font-mono">
                          <span>Home</span><span>About</span><span>Physicians</span>
                        </div>
                      </div>

                      <div className="py-6 max-w-sm">
                        <h4 className="font-black text-sm text-white tracking-tight leading-snug">Empowering Patients through AI Assistant Voice Portals</h4>
                        <p className="text-[10px] text-[#617496] mt-2 leading-relaxed">
                          We provide premium, frictionless virtual auto scheduling and clinic bookings powered by state-of-the-art voice processing systems.
                        </p>
                        <div className="mt-4 flex gap-2">
                          <button className="bg-[#121e36] border border-[#1e293b] text-[#F8FAFC] font-extrabold text-[9px] px-3 py-1.5 rounded-lg">View Doctors</button>
                          <button className="bg-white text-black font-extrabold text-[9px] px-3 py-1.5 rounded-lg">Read FAQs</button>
                        </div>
                      </div>

                      {/* Interactive Float Voice Widget Button Preview */}
                      <div className={`absolute bottom-4 ${widgetBtnPosition === 'right' ? 'right-4' : 'left-4'} animate-bounce`}>
                        <button 
                          onClick={() => {
                            alert(`Clinical Widget voice simulation started: "${widgetBtnGreeting}"`);
                          }}
                          style={{ backgroundColor: widgetBtnColor }}
                          className="text-white text-[10px] font-black px-3.5 py-2.5 rounded-full flex items-center gap-2 shadow-2xl hover:scale-105 transition-all cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {widgetBtnText}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0d172a]/60 border border-[#1e293b]/80 p-3.5 rounded-xl flex items-center gap-3 mt-4">
                    <div className="w-8 h-8 rounded-lg bg-[#2563eb]/10 text-[#2563eb] flex items-center justify-center shrink-0">
                      <Code className="w-4.5 h-4.5" />
                    </div>
                    <p className="text-[10px] text-[#617496] leading-relaxed">
                      Copy the custom script tag from the <b className="text-white">Widget</b> tab to inject this real-time widget into your external clinical domains instantly.
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* BILLING TAB */}
          {activeTab === 'billing' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 space-y-6"
            >
              {/* Wallet Block */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#2563eb]/15 to-[#7c3aed]/10 border border-[#2563eb]/30 p-6 rounded-2xl shadow-lg shadow-[#2563eb]/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#7c3aed] bg-[#7c3aed]/15 border border-[#7c3aed]/25 px-2 py-0.5 rounded-full font-black tracking-widest uppercase">Premium Tier</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span className="text-[10px] text-[#617496] font-mono">Current Business Level</span>
                  </div>
                  <h3 className="text-white font-display font-black text-base tracking-tight mt-1">{profile.name || "The Blockchain Health Business Plan"}</h3>
                  <p className="text-xs text-[#617496]">Configured under your secure organizational clinical account.</p>
                </div>
                <div className="flex gap-2">
                  <div className="bg-[#0d172a] border border-[#1e293b] px-4 py-2 rounded-xl flex flex-col items-center">
                    <span className="text-[9px] text-[#617496] font-bold">Billing Status</span>
                    <span className="font-extrabold text-xs text-emerald-400 mt-0.5">Paid / Active</span>
                  </div>
                  <button 
                    onClick={() => {
                      setIsUpgraded(true);
                      alert("Successfully upgraded your clinical billing setup to Unlimited Enterprise level!");
                    }}
                    className="bg-[#2563eb] hover:bg-[#2563eb]/90 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#2563eb]/15 transition-all cursor-pointer self-center"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" /> Upgrade Plan
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Wallet Card & Usage Meters (Left 7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Card mockup */}
                  <div className="bg-gradient-to-br from-[#121e36] to-[#0d172a] border border-[#1e293b] p-6 rounded-2xl relative overflow-hidden shadow-md">
                    <div className="absolute top-[-30%] right-[-10%] w-[35%] h-[60%] bg-[#2563eb]/20 rounded-full blur-[70px] pointer-events-none"></div>
                    <div className="flex justify-between items-start mb-12">
                      <div>
                        <span className="text-[9px] text-[#617496] uppercase font-bold tracking-widest block">Active Payment Wallet</span>
                        <span className="font-black text-sm text-white tracking-wider block mt-1">Visa Primary Card</span>
                      </div>
                      <span className="font-black text-xs text-[#617496] bg-[#121e36] px-3 py-1 rounded-lg border border-[#1e293b]">VISA</span>
                    </div>

                    <div className="mb-4">
                      <span className="font-mono text-base text-white tracking-widest block font-bold">••••  ••••  ••••  8821</span>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[8px] text-[#617496] uppercase font-bold tracking-wider block">Card Holder</span>
                        <span className="text-[10px] font-bold text-white tracking-tight block uppercase mt-0.5">{profile.name || "Blockchain Health Group"}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-[#617496] uppercase font-bold tracking-wider block">Expires</span>
                        <span className="text-[10px] font-mono font-bold text-white mt-0.5 block">08 / 2029</span>
                      </div>
                    </div>
                  </div>

                  {/* Usage progress meters */}
                  <div className="bg-[#121e36] border border-[#1e293b] p-6 rounded-2xl space-y-4">
                    <span className="text-xs font-black text-white uppercase tracking-wider block border-b border-[#1e293b] pb-2 font-display">Active Month Usage Meters</span>
                    
                    <div className="space-y-3.5">
                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-white mb-1.5">
                          <span>AI Call Log Minutes</span>
                          <span className="font-mono text-[#617496]">142 mins / 1,000 mins</span>
                        </div>
                        <div className="w-full bg-[#0d172a] h-2.5 rounded-full overflow-hidden border border-[#1e293b]">
                          <div className="bg-gradient-to-r from-[#2563eb] to-[#7c3aed] h-full rounded-full" style={{ width: '14%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-white mb-1.5">
                          <span>Auto Scheduled Appointments</span>
                          <span className="font-mono text-[#617496]">28 booked / 200 slots</span>
                        </div>
                        <div className="w-full bg-[#0d172a] h-2.5 rounded-full overflow-hidden border border-[#1e293b]">
                          <div className="bg-gradient-to-r from-[#2563eb] to-[#7c3aed] h-full rounded-full" style={{ width: '14%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-white mb-1.5">
                          <span>Inbound AI Agents Mounted</span>
                          <span className="font-mono text-[#617496]">3 active / 10 agents</span>
                        </div>
                        <div className="w-full bg-[#0d172a] h-2.5 rounded-full overflow-hidden border border-[#1e293b]">
                          <div className="bg-gradient-to-r from-[#2563eb] to-[#7c3aed] h-full rounded-full" style={{ width: '30%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 2. Invoices (Right 5 cols) */}
                <div className="lg:col-span-5 bg-[#121e36] border border-[#1e293b] p-5 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-xs font-black text-white uppercase tracking-wider block border-b border-[#1e293b] pb-2 font-display">Historical Invoices</span>
                    
                    <div className="space-y-2.5">
                      {[
                        { num: 'INV-4921', date: 'May 01, 2026', amt: '$149.00', stat: 'Paid' },
                        { num: 'INV-4809', date: 'Apr 01, 2026', amt: '$149.00', stat: 'Paid' },
                        { num: 'INV-4701', date: 'Mar 01, 2026', amt: '$149.00', stat: 'Paid' },
                        { num: 'INV-4521', date: 'Feb 01, 2026', amt: '$149.00', stat: 'Paid' }
                      ].map((inv) => (
                        <div key={inv.num} className="bg-[#0d172a]/50 border border-[#1e293b] p-3 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold text-xs text-white block">{inv.num}</span>
                            <span className="text-[10px] text-[#617496] block mt-0.5">{inv.date}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-black text-xs text-white block">{inv.amt}</span>
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-1.5 py-0.2 rounded mt-1 inline-block">
                              {inv.stat}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#1e293b] mt-4 flex gap-2">
                    <button 
                      onClick={() => alert("Redirecting to secured Stripe payment gateway... Please authorize custom wallet updates.")}
                      className="flex-1 bg-[#121e36] border border-[#1e293b] hover:border-[#2563eb] text-white font-extrabold text-[11px] py-2.5 rounded-xl cursor-pointer text-center transition-all"
                    >
                      Change Card
                    </button>
                    <button 
                      onClick={() => alert("Downloading all invoices as clinical expense statement ZIP...")}
                      className="flex-1 bg-[#121e36] border border-[#1e293b] hover:border-[#2563eb] text-[#F8FAFC] font-extrabold text-[11px] py-2.5 rounded-xl cursor-pointer text-center transition-all"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121e36] border border-[#1e293b] p-6 rounded-2xl">
                <div>
                  <h3 className="text-white font-display font-black text-base tracking-tight">Notification Center</h3>
                  <p className="text-xs text-[#617496]">Monitor call logs alerts, workflow triggers, and clinical system notifications.</p>
                </div>
                <button 
                  onClick={() => {
                    setNotificationsHistory([]);
                    alert("All platform notification alerts cleared successfully!");
                  }}
                  className="text-xs font-bold text-red-400 bg-red-950/10 hover:bg-red-950/20 px-3.5 py-2 rounded-xl border border-red-950/15 cursor-pointer transition-all self-start sm:self-auto"
                >
                  Clear History
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Alerts feed (Left 7 cols) */}
                <div className="lg:col-span-7 bg-[#121e36] border border-[#1e293b] p-5 rounded-2xl space-y-4">
                  <span className="text-xs font-black text-white uppercase tracking-wider block border-b border-[#1e293b] pb-2 font-display">Live Activity Stream</span>
                  
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {notificationsHistory.length === 0 ? (
                      <div className="text-center py-16">
                        <Bell className="w-10 h-10 text-[#617496]/50 mx-auto mb-3" />
                        <p className="text-xs font-bold text-[#617496]">All caught up!</p>
                        <p className="text-[10px] text-[#617496]/70 mt-1">There are no new platform notifications.</p>
                      </div>
                    ) : (
                      notificationsHistory.map((n) => (
                        <div key={n.id} className="bg-[#0d172a]/50 border border-[#1e293b] p-3.5 rounded-xl flex items-start gap-3.5">
                          <div className="w-7.5 h-7.5 rounded-lg bg-[#2563eb]/10 text-[#2563eb] flex items-center justify-center shrink-0 mt-0.5">
                            <Bell className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-xs text-white block">{n.title}</span>
                              <span className="text-[9px] text-[#617496] font-mono">{n.time}</span>
                            </div>
                            <p className="text-[10px] text-[#617496] mt-1.5 leading-relaxed">{n.body}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 2. Channel Config (Right 5 cols) */}
                <div className="lg:col-span-5 bg-[#121e36] border border-[#1e293b] p-5 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-5">
                    <span className="text-xs font-black text-white uppercase tracking-wider block border-b border-[#1e293b] pb-2 font-display">Notification Routing Setup</span>
                    
                    <div className="space-y-4">
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-xs text-white block">Inbound Call Email Alerts</span>
                          <span className="text-[10px] text-[#617496] block mt-0.5">Receive immediate notification of AI call transcripts.</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notifEmailAlert}
                          onChange={(e) => setNotifEmailAlert(e.target.checked)}
                          className="accent-[#2563eb] w-4.5 h-4.5 cursor-pointer shrink-0"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-xs text-white block">Auto Scheduled SMS Alerts</span>
                          <span className="text-[10px] text-[#617496] block mt-0.5">SMS text update routed to patients on booking.</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notifSmsAlert}
                          onChange={(e) => setNotifSmsAlert(e.target.checked)}
                          className="accent-[#2563eb] w-4.5 h-4.5 cursor-pointer shrink-0"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-xs text-white block">Slack Webhook Activity log</span>
                          <span className="text-[10px] text-[#617496] block mt-0.5">Push active call logs directly to your clinical Slack channels.</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notifSlackAlert}
                          onChange={(e) => setNotifSlackAlert(e.target.checked)}
                          className="accent-[#2563eb] w-4.5 h-4.5 cursor-pointer shrink-0"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-xs text-white block">Weekly Digest Email Report</span>
                          <span className="text-[10px] text-[#617496] block mt-0.5">Comprehensive analytics digest sent out on Sunday evenings.</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notifWeeklyReport}
                          onChange={(e) => setNotifWeeklyReport(e.target.checked)}
                          className="accent-[#2563eb] w-4.5 h-4.5 cursor-pointer shrink-0"
                        />
                      </div>

                    </div>
                  </div>

                  <button 
                    onClick={() => alert("Notification settings configured successfully!")}
                    className="w-full bg-[#121e36] border border-[#1e293b] hover:border-[#2563eb] text-[#F8FAFC] font-black text-xs py-3 rounded-xl transition-all cursor-pointer mt-6"
                  >
                    Save Alert Channels
                  </button>
                </div>

              </div>
            </motion.div>
          )}

        </div>

      </main>

      {/* MODALS */}

      {/* NEW APPOINTMENT MODAL */}
      {showAptModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-xl shadow-2xl relative overflow-hidden animate-zoomIn">
            
            {/* Header */}
            <div className="bg-[#020617] px-5 py-4 border-b border-[#1F2937] flex items-center justify-between">
              <h3 className="text-white font-extrabold text-sm">Book Appointment</h3>
              <button onClick={() => setShowAptModal(false)} className="text-[#94A3B8] hover:text-white cursor-pointer transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
 
            {/* Form */}
            <form onSubmit={handleCreateAppointment} className="p-6 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Customer Name *</label>
                  <input 
                    type="text" 
                    required
                    value={newApt.customerName}
                    onChange={(e) => setNewApt({ ...newApt, customerName: e.target.value })}
                    placeholder="John Smith"
                    className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Phone Number *</label>
                  <input 
                    type="text" 
                    required
                    value={newApt.phoneNumber}
                    onChange={(e) => setNewApt({ ...newApt, phoneNumber: e.target.value })}
                    placeholder="(555) 000-0000"
                    className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                  />
                </div>
              </div>
 
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Vehicle Year</label>
                  <input 
                    type="text" 
                    value={newApt.vehicleYear}
                    onChange={(e) => setNewApt({ ...newApt, vehicleYear: e.target.value })}
                    placeholder="2021"
                    className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Make</label>
                  <input 
                    type="text" 
                    value={newApt.vehicleMake}
                    onChange={(e) => setNewApt({ ...newApt, vehicleMake: e.target.value })}
                    placeholder="Toyota"
                    className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Model</label>
                  <input 
                    type="text" 
                    value={newApt.vehicleModel}
                    onChange={(e) => setNewApt({ ...newApt, vehicleModel: e.target.value })}
                    placeholder="Camry"
                    className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                  />
                </div>
              </div>
 
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Service</label>
                  <select 
                    value={newApt.serviceId}
                    onChange={(e) => setNewApt({ ...newApt, serviceId: e.target.value })}
                    className="w-full bg-[#020617] border border-[#1F2937] text-xs text-gray-300 rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-[#3B82F6] transition-all"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (${s.price})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Date & Time *</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={newApt.scheduledAt}
                    onChange={(e) => setNewApt({ ...newApt, scheduledAt: e.target.value })}
                    className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-gray-300 rounded-xl px-3 py-2 outline-none transition-all"
                  />
                </div>
              </div>
 
              <div>
                <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Status</label>
                <select 
                  value={newApt.status}
                  onChange={(e) => setNewApt({ ...newApt, status: e.target.value as any })}
                  className="w-full bg-[#020617] border border-[#1F2937] text-xs text-gray-300 rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-[#3B82F6] transition-all"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
 
              <div>
                <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Notes</label>
                <textarea 
                  rows={2}
                  value={newApt.notes}
                  onChange={(e) => setNewApt({ ...newApt, notes: e.target.value })}
                  placeholder="Any notes..."
                  className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                />
              </div>
 
              <div className="pt-4 border-t border-[#1F2937] flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAptModal(false)}
                  className="bg-[#020617] hover:bg-[#111827] text-[#94A3B8] hover:text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-[#1F2937] transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#3B82F6]/90 hover:to-[#8B5CF6]/90 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-[#3B82F6]/25 transition-all"
                >
                  Book Appointment
                </button>
              </div>
 
            </form>
          </div>
        </div>
      )}

      {/* NEW PATIENT MODAL */}
      {showPatientModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-xl shadow-2xl relative overflow-hidden animate-zoomIn">
            
            {/* Header */}
            <div className="bg-[#020617] px-5 py-4 border-b border-[#1F2937] flex items-center justify-between">
              <h3 className="text-white font-extrabold text-sm">Add New Patient</h3>
              <button onClick={() => setShowPatientModal(false)} className="text-[#94A3B8] hover:text-white cursor-pointer transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
 
            {/* Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              const pRecord = {
                id: 'p' + (patients.length + 1),
                name: newPatient.name,
                phone: newPatient.phone,
                email: newPatient.email,
                vehicle: newPatient.vehicle,
                notes: newPatient.notes,
                status: 'Active'
              };
              setPatients([pRecord, ...patients]);
              setShowPatientModal(false);
              setNewPatient({ name: '', phone: '', email: '', vehicle: '', notes: '' });
            }} className="p-6 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Patient Name *</label>
                  <input 
                    type="text" 
                    required
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    placeholder="John Smith"
                    className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Phone Number *</label>
                  <input 
                    type="text" 
                    required
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    placeholder="(555) 000-0000"
                    className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Primary Vehicle / Field</label>
                  <input 
                    type="text" 
                    value={newPatient.vehicle}
                    onChange={(e) => setNewPatient({ ...newPatient, vehicle: e.target.value })}
                    placeholder="Audi Q7 / Cardiology"
                    className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                  />
                </div>
              </div>
 
              <div>
                <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Clinical / Voice Notes</label>
                <textarea 
                  rows={2}
                  value={newPatient.notes}
                  onChange={(e) => setNewPatient({ ...newPatient, notes: e.target.value })}
                  placeholder="Patient requested recurring updates on cardiovascular report status..."
                  className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                />
              </div>
 
              <div className="pt-4 border-t border-[#1F2937] flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowPatientModal(false)}
                  className="bg-[#020617] hover:bg-[#111827] text-[#94A3B8] hover:text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-[#1F2937] transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#3B82F6]/90 hover:to-[#8B5CF6]/90 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-[#3B82F6]/25 transition-all"
                >
                  Add Patient
                </button>
              </div>
 
            </form>
          </div>
        </div>
      )}

      {/* NEW AGENT MODAL */}
      {showAgentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-xl shadow-2xl relative overflow-hidden animate-zoomIn">
            
            <div className="bg-[#020617] px-5 py-4 border-b border-[#1F2937] flex items-center justify-between">
              <h3 className="text-white font-extrabold text-sm">Create Agent</h3>
              <button onClick={() => setShowAgentModal(false)} className="text-[#94A3B8] hover:text-white cursor-pointer transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
 
            <form onSubmit={handleCreateAgent} className="p-6 space-y-4">
              
              <div>
                <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Agent Name *</label>
                <input 
                  type="text" 
                  required
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  placeholder="Reception AI"
                  className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                />
              </div>
 
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Voice</label>
                  <select 
                    value={newAgent.voice}
                    onChange={(e) => setNewAgent({ ...newAgent, voice: e.target.value })}
                    className="w-full bg-[#020617] border border-[#1F2937] text-xs text-gray-300 rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-[#3B82F6] transition-all"
                  >
                    <option value="Alloy - Neutral">Alloy - Neutral</option>
                    <option value="Alloy - Friendly & Warm">Alloy - Friendly & Warm</option>
                    <option value="Echo - Resonant Deep">Echo - Resonant Deep</option>
                    <option value="Shimmer - Sweet & Crisp">Shimmer - Sweet & Crisp</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Personality</label>
                  <select 
                    value={newAgent.personality}
                    onChange={(e) => setNewAgent({ ...newAgent, personality: e.target.value })}
                    className="w-full bg-[#020617] border border-[#1F2937] text-xs text-gray-300 rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-[#3B82F6] transition-all"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Professional & Empathetic">Professional & Empathetic</option>
                    <option value="Casual & Friendly">Casual & Friendly</option>
                  </select>
                </div>
              </div>
 
              <div>
                <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Interruption Sensitivity</label>
                <select 
                  value={newAgent.interruptionSensitivity}
                  onChange={(e) => setNewAgent({ ...newAgent, interruptionSensitivity: e.target.value as any })}
                  className="w-full bg-[#020617] border border-[#1F2937] text-xs text-gray-300 rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-[#3B82F6] transition-all"
                >
                  <option value="Low">Low - Interruption disabled</option>
                  <option value="Medium">Medium - Balanced natural turns</option>
                  <option value="High">High - Instant interruption response</option>
                </select>
              </div>
 
              <div>
                <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Greeting Message</label>
                <textarea 
                  rows={2}
                  value={newAgent.greetingMessage}
                  onChange={(e) => setNewAgent({ ...newAgent, greetingMessage: e.target.value })}
                  placeholder="Hello! Thank you for calling..."
                  className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                />
              </div>
 
              <div>
                <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">System Prompt</label>
                <textarea 
                  rows={3}
                  value={newAgent.systemPrompt}
                  onChange={(e) => setNewAgent({ ...newAgent, systemPrompt: e.target.value })}
                  placeholder="You are a professional auto repair receptionist..."
                  className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                />
              </div>
 
              <div className="pt-4 border-t border-[#1F2937] flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAgentModal(false)}
                  className="bg-[#020617] hover:bg-[#111827] text-[#94A3B8] hover:text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-[#1F2937] transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#3B82F6]/90 hover:to-[#8B5CF6]/90 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-[#3B82F6]/25 transition-all"
                >
                  Create Agent
                </button>
              </div>
 
            </form>
          </div>
        </div>
      )}

      {/* ADD SERVICE MODAL */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-xl shadow-2xl relative overflow-hidden animate-zoomIn">
            
            <div className="bg-[#020617] px-5 py-4 border-b border-[#1F2937] flex items-center justify-between">
              <h3 className="text-white font-extrabold text-sm">Add Service</h3>
              <button onClick={() => setShowServiceModal(false)} className="text-[#94A3B8] hover:text-white cursor-pointer transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
 
            <form onSubmit={handleCreateService} className="p-6 space-y-4">
              
              <div>
                <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Service Name *</label>
                <input 
                  type="text" 
                  required
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="Oil Change"
                  className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                />
              </div>
 
              <div>
                <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Description</label>
                <textarea 
                  rows={2}
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  placeholder="Brief description for the AI..."
                  className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                />
              </div>
 
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Duration (minutes)</label>
                  <input 
                    type="number" 
                    value={newService.durationMinutes}
                    onChange={(e) => setNewService({ ...newService, durationMinutes: Number(e.target.value) })}
                    placeholder="60"
                    className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Price Type</label>
                  <select 
                    value={newService.priceType}
                    onChange={(e) => setNewService({ ...newService, priceType: e.target.value as any })}
                    className="w-full bg-[#020617] border border-[#1F2937] text-xs text-gray-300 rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-[#3B82F6] transition-all"
                  >
                    <option value="Fixed Price">Fixed Price</option>
                    <option value="Starting From">Starting From</option>
                    <option value="Variable Price">Variable Price</option>
                  </select>
                </div>
              </div>
 
              <div>
                <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Price ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                  placeholder="49.99"
                  className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                />
              </div>
 
              <div className="pt-4 border-t border-[#1F2937] flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowServiceModal(false)}
                  className="bg-[#020617] hover:bg-[#111827] text-[#94A3B8] hover:text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-[#1F2937] transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#3B82F6]/90 hover:to-[#8B5CF6]/90 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-[#3B82F6]/25 transition-all"
                >
                  Add Service
                </button>
              </div>
 
            </form>
          </div>
        </div>
      )}

      {/* ADD FAQ MODAL */}
      {showFaqModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-xl shadow-2xl relative overflow-hidden animate-zoomIn">
            
            <div className="bg-[#020617] px-5 py-4 border-b border-[#1F2937] flex items-center justify-between">
              <h3 className="text-white font-extrabold text-sm">Add FAQ</h3>
              <button onClick={() => setShowFaqModal(false)} className="text-[#94A3B8] hover:text-white cursor-pointer transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
 
            <form onSubmit={handleCreateFaq} className="p-6 space-y-4">
              
              <div>
                <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Category / Topic Tag *</label>
                <input 
                  type="text" 
                  required
                  value={newFaq.category}
                  onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                  placeholder="e.g. Oil, Appointments, Pricing"
                  className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                />
              </div>
 
              <div>
                <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Question *</label>
                <input 
                  type="text" 
                  required
                  value={newFaq.question}
                  onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  placeholder="What are your business hours?"
                  className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                />
              </div>
 
              <div>
                <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Answer *</label>
                <textarea 
                  rows={3}
                  required
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                  placeholder="We are open..."
                  className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                />
              </div>
 
              <div className="pt-4 border-t border-[#1F2937] flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowFaqModal(false)}
                  className="bg-[#020617] hover:bg-[#111827] text-[#94A3B8] hover:text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-[#1F2937] transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#3B82F6]/90 hover:to-[#8B5CF6]/90 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-[#3B82F6]/25 transition-all"
                >
                  Add FAQ
                </button>
              </div>
 
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Compact icons mapper to bypass import issues
function Volume2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}
