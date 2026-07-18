import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, Calendar, MessageSquare, Settings, Users, User, FolderKanban, 
  HelpCircle, Code, LogOut, ChevronRight, ChevronLeft, Plus, Search, Filter, 
  TrendingUp, Play, Edit, Trash2, CheckCircle2, Clock, MapPin, 
  Mail, Phone, RefreshCw, Star, Info, ShieldAlert, Sparkles, X, ChevronDown, Check,
  Sliders, Eye, EyeOff, Lock, Activity, Heart, CalendarDays, Headphones, Globe, CreditCard, Bell, Shield, ArrowRight, Share2, DollarSign,
  LayoutGrid, Bot, ClipboardList, Send, Key, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Appointment, Conversation, AIAgent, Service, FAQ, WidgetConfig, BusinessProfile, BusinessHours } from '../types';
import DialerSim from './DialerSim';
import { supabase } from '../lib/supabaseClient';

interface DashboardProps {
  activeTab: 'overview' | 'analytics' | 'appointments' | 'schedule' | 'patients' | 'agents' | 'services' | 'faqs' | 'notifications' | 'settings';
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
  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };
  
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

  // Medical Chat States
  const [medicalChatSessions, setMedicalChatSessions] = useState<{[agentId: string]: {role: 'user'|'assistant'|'system', content: string}[]}>({});
  const [selectedMedicalAgentId, setSelectedMedicalAgentId] = useState<string>('agt-admin');
  const [medicalChatInput, setMedicalChatInput] = useState('');
  const [medicalChatLoading, setMedicalChatLoading] = useState(false);
  const [medicalOpenAIKeyOverride, setMedicalOpenAIKeyOverride] = useState(() => localStorage.getItem('vd_openai_api_key_override') || '');
  const [showKeyOverrideInput, setShowKeyOverrideInput] = useState(false);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [viewingFaq, setViewingFaq] = useState<FAQ | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [viewingService, setViewingService] = useState<Service | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);

  const [settingsTab, setSettingsTab] = useState<'profile' | 'hours' | 'password' | 'danger'>('profile');
  const [deleteAccountConfirmText, setDeleteAccountConfirmText] = useState('');
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch patients when patients tab is selected or on mount
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('patients')
            .select('*')
            .eq('user_id', user.id);
          if (data && !error) {
            setPatients(data);
          }
        }
      } catch (err) {
        console.error("Error fetching patients:", err);
      }
    };
    if (activeTab === 'patients' || patients.length === 0) {
      loadPatients();
    }
  }, [activeTab]);

  // Schedule / Calendar state
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [selectedCalendarDate, setSelectedCalendarDate] = useState(getTodayDateString());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-11
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };
  
  // Patients list state
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [editingPatient, setEditingPatient] = useState<any | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', phone: '', email: '', vehicle: '', notes: '', status: 'Active' });
  const [bookAppointment, setBookAppointment] = useState(false);
  const [aptTime, setAptTime] = useState('');
  const [aptServiceId, setAptServiceId] = useState('');

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
  const [notificationsHistory, setNotificationsHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('vd_notifications_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [notifEmailAlert, setNotifEmailAlert] = useState(true);
  const [notifSmsAlert, setNotifSmsAlert] = useState(true);
  const [notifSlackAlert, setNotifSlackAlert] = useState(false);
  const [notifWeeklyReport, setNotifWeeklyReport] = useState(true);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('vd_notifications_history', JSON.stringify(notificationsHistory));
  }, [notificationsHistory]);

  // Mark as read when notifications tab is active
  useEffect(() => {
    if (activeTab === 'notifications') {
      setNotificationsHistory(prev => {
        if (prev.some(n => !n.read)) {
          return prev.map(n => ({ ...n, read: true }));
        }
        return prev;
      });
    }
  }, [activeTab]);

  // Studio Chatbot state
  const [studioChatHistory, setStudioChatHistory] = useState<{ sender: 'agent' | 'user'; text: string; time: string }[]>([]);
  const [studioChatInput, setStudioChatInput] = useState('');
  const [isStudioChatTyping, setIsStudioChatTyping] = useState(false);
  const studioChatScrollRef = useRef<HTMLDivElement>(null);
  const [studioBookingState, setStudioBookingState] = useState<{ step: number; service: string; vehicle: string; name: string } | null>(null);

  // Auto-initialize chatbot with custom greeting when selectedAgentForStudio is selected
  useEffect(() => {
    if (selectedAgentForStudio) {
      setStudioChatHistory([
        {
          sender: 'agent',
          text: selectedAgentForStudio.greetingMessage || `Hello! I am ${selectedAgentForStudio.name}, your AI assistant. How can I help you today?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setStudioBookingState(null);
    }
  }, [selectedAgentForStudio?.id, selectedAgentForStudio?.greetingMessage]);

  // Scroll chatbot to bottom
  useEffect(() => {
    if (studioChatScrollRef.current) {
      studioChatScrollRef.current.scrollTop = studioChatScrollRef.current.scrollHeight;
    }
  }, [studioChatHistory]);

  const handleSendStudioChatMessageWithText = (textToSend: string) => {
    if (!textToSend.trim() || !selectedAgentForStudio) return;

    const userText = textToSend;
    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedHistory = [
      ...studioChatHistory,
      { sender: 'user' as const, text: userText, time: userTime }
    ];
    setStudioChatHistory(updatedHistory);
    setIsStudioChatTyping(true);

    setTimeout(() => {
      const textLower = userText.toLowerCase();
      let reply = '';

      if (studioBookingState) {
        if (studioBookingState.step === 1) {
          const vehicle = userText;
          setStudioBookingState({ ...studioBookingState, step: 2, vehicle });
          reply = `Got it, a ${vehicle}. And what is your full name to finalize this appointment?`;
        } else if (studioBookingState.step === 2) {
          const name = userText;
          reply = `Thank you, ${name}! Your appointment is fully confirmed for this coming Saturday at 10:00 AM for the ${studioBookingState.service}. We look forward to seeing you at AutoCare Pro Garage!`;

          // Call the existing appointment booking function to save in database and local states
          handleDirectDialerBooking(name, studioBookingState.vehicle || 'Toyota Camry', studioBookingState.service || 'Oil Change');

          setStudioBookingState(null);
        }
      } else {
        const personality = selectedAgentForStudio.personality?.toLowerCase() || '';
        const systemPrompt = selectedAgentForStudio.systemPrompt?.toLowerCase() || '';

        let prefix = '';
        if (personality.includes('empathetic')) {
          prefix = "I completely understand and I'm here to help. ";
        } else if (personality.includes('casual') || personality.includes('friendly')) {
          prefix = "Hey there! Happy to help. ";
        } else if (personality.includes('direct') || personality.includes('efficient')) {
          prefix = "Understood. ";
        }

        if (textLower.includes('oil') || textLower.includes('lub') || textLower.includes('change')) {
          setStudioBookingState({ step: 1, service: 'Oil Change', vehicle: '', name: '' });
          reply = `${prefix}I can absolutely assist you with scheduling an Oil Change. Our premium service uses full synthetic oil and starts at $49.99. What is the year, make, and model of your vehicle?`;
        } else if (textLower.includes('brake') || textLower.includes('squeak') || textLower.includes('noise')) {
          setStudioBookingState({ step: 1, service: 'Brake Inspection', vehicle: '', name: '' });
          reply = `${prefix}Brakes are crucial for safety! We can perform a comprehensive Brake Inspection starting at $39.99. What is the year, make, and model of your vehicle?`;
        } else if (textLower.includes('hour') || textLower.includes('open') || textLower.includes('time') || textLower.includes('sunday') || textLower.includes('saturday')) {
          reply = `${prefix}Our business hours are Monday to Friday from 8:00 AM to 6:00 PM, and Saturdays from 9:00 AM to 2:00 PM. We are closed on Sundays.`;
        } else if (textLower.includes('price') || textLower.includes('cost') || textLower.includes('fee') || textLower.includes('how much')) {
          reply = `${prefix}Of course. Our base prices are: Oil Change starting at $49.99, Brake Inspection at $39.99, and computer diagnostic scan at $59.99. Other services depend on the technician's custom estimate.`;
        } else if (textLower.includes('where') || textLower.includes('location') || textLower.includes('address') || textLower.includes('directions')) {
          reply = `${prefix}We are conveniently located at 742 Market Street, San Francisco, California 94103.`;
        } else if (textLower.includes('hello') || textLower.includes('hi') || textLower.includes('hey')) {
          reply = `${prefix}Hello! How can I help you with your vehicle servicing today?`;
        } else {
          if (systemPrompt.includes('tire') || textLower.includes('tire')) {
            reply = `${prefix}Yes, we handle tire rotations, alignments, and new tire installations. What kind of tire service are you looking for?`;
          } else {
            reply = `${prefix}I've taken note of that. As your AI Receptionist, I can help you check services, schedule appointments, or answer pricing questions. What would you like to do next?`;
          }
        }
      }

      setStudioChatHistory(prev => [
        ...prev,
        {
          sender: 'agent' as const,
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsStudioChatTyping(false);
    }, 1000);
  };

  const handleSendStudioChatMessage = () => {
    if (!studioChatInput.trim()) return;
    handleSendStudioChatMessageWithText(studioChatInput);
    setStudioChatInput('');
  };


  // Dynamic metrics helpers for Overview and Analytics tabs
  const getAverageCallDuration = () => {
    if (!conversations || conversations.length === 0) return '0:00';
    let totalSeconds = 0;
    let count = 0;
    conversations.forEach(c => {
      if (c.duration) {
        const parts = c.duration.split(':');
        if (parts.length === 2) {
          totalSeconds += parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
          count++;
        }
      }
    });
    if (count === 0) return '0:00';
    const avgSeconds = Math.round(totalSeconds / count);
    const mins = Math.floor(avgSeconds / 60);
    const secs = avgSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getWeeklyBreakdown = () => {
    const days = [
      { day: 'Mon', calls: 0, appointments: 0, dayIndex: 1 },
      { day: 'Tue', calls: 0, appointments: 0, dayIndex: 2 },
      { day: 'Wed', calls: 0, appointments: 0, dayIndex: 3 },
      { day: 'Thu', calls: 0, appointments: 0, dayIndex: 4 },
      { day: 'Fri', calls: 0, appointments: 0, dayIndex: 5 },
      { day: 'Sat', calls: 0, appointments: 0, dayIndex: 6 },
      { day: 'Sun', calls: 0, appointments: 0, dayIndex: 0 },
    ];

    if (appointments) {
      appointments.forEach(apt => {
        if (!apt.scheduledAt) return;
        try {
          let dateStr = apt.scheduledAt;
          if (dateStr.includes('at')) {
            dateStr = dateStr.split('at')[0].trim();
          }
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) {
            const dayOfWeek = d.getDay();
            const matchedDay = days.find(day => day.dayIndex === dayOfWeek);
            if (matchedDay) {
              matchedDay.appointments++;
            }
          } else {
            const lower = apt.scheduledAt.toLowerCase();
            if (lower.includes('monday') || lower.includes('mon')) days[0].appointments++;
            else if (lower.includes('tuesday') || lower.includes('tue')) days[1].appointments++;
            else if (lower.includes('wednesday') || lower.includes('wed')) days[2].appointments++;
            else if (lower.includes('thursday') || lower.includes('thu')) days[3].appointments++;
            else if (lower.includes('friday') || lower.includes('fri')) days[4].appointments++;
            else if (lower.includes('saturday') || lower.includes('sat')) days[5].appointments++;
            else if (lower.includes('sunday') || lower.includes('sun')) days[6].appointments++;
          }
        } catch (e) {
          console.error("Error mapping appointment day:", e);
        }
      });
    }

    if (conversations) {
      conversations.forEach(c => {
        if (!c.startedAt) return;
        const lower = c.startedAt.toLowerCase();
        if (lower.includes('monday') || lower.includes('mon')) days[0].calls++;
        else if (lower.includes('tuesday') || lower.includes('tue')) days[1].calls++;
        else if (lower.includes('wednesday') || lower.includes('wed')) days[2].calls++;
        else if (lower.includes('thursday') || lower.includes('thu')) days[3].calls++;
        else if (lower.includes('friday') || lower.includes('fri')) days[4].calls++;
        else if (lower.includes('saturday') || lower.includes('sat')) days[5].calls++;
        else if (lower.includes('sunday') || lower.includes('sun')) days[6].calls++;
        else {
          const todayIndex = new Date().getDay();
          const matchedDay = days.find(day => day.dayIndex === todayIndex);
          if (matchedDay) {
            matchedDay.calls++;
          }
        }
      });
    }

    return days;
  };

  const getTrendSvgPaths = () => {
    const data = getWeeklyBreakdown();
    const maxVal = Math.max(1, ...data.map(d => Math.max(d.calls, d.appointments)));
    
    const width = 500;
    const height = 150;
    const padding = 15;
    const usableHeight = height - padding * 2;
    
    const pointsCalls = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - padding - (d.calls / maxVal) * usableHeight;
      return { x, y };
    });
    
    const pointsApts = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - padding - (d.appointments / maxVal) * usableHeight;
      return { x, y };
    });
    
    const callsLinePath = pointsCalls.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
    const callsAreaPath = `${callsLinePath} L ${width},${height} L 0,${height} Z`;
    
    const aptsLinePath = pointsApts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
    const aptsAreaPath = `${aptsLinePath} L ${width},${height} L 0,${height} Z`;
    
    return { callsLinePath, callsAreaPath, aptsLinePath, aptsAreaPath };
  };

  const bookedCount = conversations.filter(c => c.appointmentBooked).length;
  const otherCount = Math.max(0, conversations.length - bookedCount);
  const convertedPct = conversations.length > 0 ? Math.round((bookedCount / conversations.length) * 100) : 0;
  const weeklyData = getWeeklyBreakdown();
  const maxWeeklyVal = Math.max(1, ...weeklyData.map(d => Math.max(d.calls, d.appointments)));

  // Track changes dynamically to generate notifications
  const isFirstRender = useRef(true);
  const prevAppointments = useRef<Appointment[]>([]);
  const prevConversations = useRef<Conversation[]>([]);
  const prevAgents = useRef<AIAgent[]>([]);
  const prevServices = useRef<Service[]>([]);
  const prevFaqs = useRef<FAQ[]>([]);
  const prevWidgets = useRef<WidgetConfig[]>([]);
  const prevProfile = useRef<BusinessProfile | null>(null);
  const prevHours = useRef<BusinessHours | null>(null);

  useEffect(() => {
    if (isFirstRender.current) {
      prevAppointments.current = appointments;
      prevConversations.current = conversations;
      prevAgents.current = agents;
      prevServices.current = services;
      prevFaqs.current = faqs;
      prevWidgets.current = widgets;
      prevProfile.current = profile;
      prevHours.current = hours;
      isFirstRender.current = false;
      return;
    }

    const newNotifications: any[] = [];
    const nowStr = 'Just now';

    const addNotif = (title: string, body: string, type: string) => {
      newNotifications.push({
        id: `n-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        body,
        time: nowStr,
        read: activeTab === 'notifications',
        type
      });
    };

    // Appointments changes
    if (appointments !== prevAppointments.current) {
      if (appointments.length > prevAppointments.current.length) {
        const added = appointments.filter(a => !prevAppointments.current.some(pa => pa.id === a.id));
        added.forEach(a => {
          const sName = services.find(s => s.id === a.serviceId)?.name || 'clinical service';
          addNotif(
            'Appointment Booked',
            `${a.customerName} booked ${sName} on ${a.scheduledAt || 'N/A'}.`,
            'calendar'
          );
        });
      } else if (appointments.length === prevAppointments.current.length) {
        appointments.forEach(a => {
          const prev = prevAppointments.current.find(pa => pa.id === a.id);
          if (prev && JSON.stringify(prev) !== JSON.stringify(a)) {
            addNotif(
              'Appointment Updated',
              `Appointment for ${a.customerName} was updated (Status: ${a.status}).`,
              'calendar'
            );
          }
        });
      }
      prevAppointments.current = appointments;
    }

    // Conversations changes
    if (conversations !== prevConversations.current) {
      if (conversations.length > prevConversations.current.length) {
        const added = conversations.filter(c => !prevConversations.current.some(pc => pc.id === c.id));
        added.forEach(c => {
          addNotif(
            'New AI Call Completed',
            `AI receptionist handled call with ${c.callerName || 'Unknown'} (${c.callerPhone || 'N/A'}). Duration: ${c.duration}.`,
            'call'
          );
        });
      }
      prevConversations.current = conversations;
    }

    // Agents changes
    if (agents !== prevAgents.current) {
      if (agents.length > prevAgents.current.length) {
        const added = agents.filter(a => !prevAgents.current.some(pa => pa.id === a.id));
        added.forEach(a => {
          addNotif(
            'AI Agent Created',
            `New AI Agent "${a.name}" has been successfully configured and deployed.`,
            'setup'
          );
        });
      } else if (agents.length === prevAgents.current.length) {
        agents.forEach(a => {
          const prev = prevAgents.current.find(pa => pa.id === a.id);
          if (prev && JSON.stringify(prev) !== JSON.stringify(a)) {
            addNotif(
              'AI Agent Modified',
              `AI Agent "${a.name}" configuration has been updated.`,
              'setup'
            );
          }
        });
      }
      prevAgents.current = agents;
    }

    // Services changes
    if (services !== prevServices.current) {
      if (services.length > prevServices.current.length) {
        const added = services.filter(s => !prevServices.current.some(ps => ps.id === s.id));
        added.forEach(s => {
          addNotif(
            'Service Created',
            `New clinical service "${s.name}" added at ${s.price || 'free'}.`,
            'setup'
          );
        });
      } else if (services.length === prevServices.current.length) {
        services.forEach(s => {
          const prev = prevServices.current.find(ps => ps.id === s.id);
          if (prev && JSON.stringify(prev) !== JSON.stringify(s)) {
            addNotif(
              'Service Updated',
              `Clinical service "${s.name}" details updated.`,
              'setup'
            );
          }
        });
      }
      prevServices.current = services;
    }

    // FAQs changes
    if (faqs !== prevFaqs.current) {
      if (faqs.length > prevFaqs.current.length) {
        const added = faqs.filter(f => !prevFaqs.current.some(pf => pf.id === f.id));
        added.forEach(f => {
          addNotif(
            'FAQ Added',
            `New FAQ question regarding "${f.question.substring(0, 40)}..." has been added.`,
            'setup'
          );
        });
      } else if (faqs.length === prevFaqs.current.length) {
        faqs.forEach(f => {
          const prev = prevFaqs.current.find(pf => pf.id === f.id);
          if (prev && JSON.stringify(prev) !== JSON.stringify(f)) {
            addNotif(
              'FAQ Updated',
              `FAQ answer for "${f.question.substring(0, 40)}..." has been modified.`,
              'setup'
            );
          }
        });
      }
      prevFaqs.current = faqs;
    }

    // Widgets changes
    if (widgets !== prevWidgets.current) {
      widgets.forEach(w => {
        const prev = prevWidgets.current.find(pw => pw.id === w.id);
        if (prev && JSON.stringify(prev) !== JSON.stringify(w)) {
          addNotif(
            'Widget Config Updated',
            `Dynamic widget configuration for "${w.name}" has been modified.`,
            'system'
          );
        }
      });
      prevWidgets.current = widgets;
    }

    // Profile changes
    if (profile !== prevProfile.current) {
      if (prevProfile.current && JSON.stringify(prevProfile.current) !== JSON.stringify(profile)) {
        addNotif(
          'Business Profile Updated',
          `Business profile details have been successfully saved to your clinical database.`,
          'system'
        );
      }
      prevProfile.current = profile;
    }

    // Hours changes
    if (hours !== prevHours.current) {
      if (prevHours.current && JSON.stringify(prevHours.current) !== JSON.stringify(hours)) {
        addNotif(
          'Business Hours Updated',
          `Your active clinical weekly schedule hours have been modified.`,
          'system'
        );
      }
      prevHours.current = hours;
    }

    if (newNotifications.length > 0) {
      setNotificationsHistory(prev => [...newNotifications, ...prev]);
    }

  }, [appointments, conversations, agents, services, faqs, widgets, profile, hours, activeTab]);

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

  // Change Password handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus({ type: '', message: '' });

    if (!oldPassword) {
      setPasswordStatus({ type: 'error', message: 'Please enter your old password.' });
      return;
    }

    if (!newPassword) {
      setPasswordStatus({ type: 'error', message: 'Please enter a new password.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New password and confirm password do not match.' });
      return;
    }

    setPasswordLoading(true);

    try {
      // 1. Get current logged in user details
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPasswordStatus({ type: 'error', message: 'Could not fetch current user context. Please sign in again.' });
        setPasswordLoading(false);
        return;
      }

      // 2. Check if old password matches by trying to log in
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword
      });

      if (loginError) {
        setPasswordStatus({ type: 'error', message: 'Incorrect old password. Please try again.' });
        setPasswordLoading(false);
        return;
      }

      // 3. Old password matched! Let's update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        setPasswordStatus({ 
          type: 'error', 
          message: updateError.message || 'Failed to update password. Please try again.' 
        });
      } else {
        setPasswordStatus({ type: 'success', message: 'Password changed and saved successfully!' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPasswordStatus({ type: 'error', message: err?.message || 'An unexpected error occurred.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Delete Account and all associated data handler
  const handleDeleteAccount = async () => {
    if (deleteAccountConfirmText.trim().toUpperCase() !== 'DELETE') {
      alert("Please type 'DELETE' in the input box to confirm your action.");
      return;
    }

    setDeleteAccountLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Unable to find user session. Please sign in again.");
        setDeleteAccountLoading(false);
        return;
      }

      // Delete from all database tables
      await supabase.from('profiles').delete().eq('id', user.id);
      await supabase.from('business_profiles').delete().eq('id', user.id);
      await supabase.from('business_hours').delete().eq('id', user.id);
      await supabase.from('faqs').delete().eq('user_id', user.id);
      await supabase.from('services').delete().eq('user_id', user.id);
      await supabase.from('appointments').delete().eq('user_id', user.id);
      await supabase.from('agents').delete().eq('user_id', user.id);
      await supabase.from('patients').delete().eq('user_id', user.id);

      // If mock Supabase is active, clean up mock local storage
      if (supabase.isMock) {
        const mockUsersStr = localStorage.getItem('supabase_mock_users');
        if (mockUsersStr) {
          const mockUsers = JSON.parse(mockUsersStr);
          const filteredUsers = mockUsers.filter((u: any) => u.id !== user.id);
          localStorage.setItem('supabase_mock_users', JSON.stringify(filteredUsers));
        }
        localStorage.removeItem(`supabase_mock_profile_${user.id}`);
        localStorage.removeItem(`supabase_mock_hours_${user.id}`);
        localStorage.removeItem(`supabase_mock_faqs_${user.id}`);
        localStorage.removeItem(`supabase_mock_services_${user.id}`);
        localStorage.removeItem(`supabase_mock_appointments_${user.id}`);
        localStorage.removeItem(`supabase_mock_patients_${user.id}`);
        localStorage.removeItem(`supabase_mock_agents_${user.id}`);
      }

      alert("Your account and all associated data have been permanently deleted from all database tables. Logging out now.");
      onSignOut();
    } catch (err: any) {
      console.error("Error during account deletion:", err);
      alert(err?.message || "An error occurred while deleting your account. Please try again.");
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  // Create/Edit appointment
  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApt.customerName || !newApt.phoneNumber) return;

    try {
      if (editingAppointment) {
        const updatedFields = {
          customerName: newApt.customerName,
          phoneNumber: newApt.phoneNumber,
          vehicleYear: newApt.vehicleYear || '2021',
          vehicleMake: newApt.vehicleMake || 'Toyota',
          vehicleModel: newApt.vehicleModel || 'Camry',
          serviceId: newApt.serviceId || services[0]?.id || 'srv-2',
          scheduledAt: newApt.scheduledAt ? newApt.scheduledAt.replace('T', ' ') : 'May 16, 2026 3:30 PM',
          status: newApt.status || 'pending',
          notes: newApt.notes || ''
        };

        const { error } = await supabase
          .from('appointments')
          .update(updatedFields)
          .eq('id', editingAppointment.id);

        if (error) {
          console.error('Error updating appointment in Supabase:', error);
        }

        const updated = appointments.map(a => a.id === editingAppointment.id ? { ...a, ...updatedFields } : a);
        onUpdateAppointments(updated);
      } else {
        const id = `apt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const { data: { user } } = await supabase.auth.getUser();
        const user_id = user ? user.id : null;

        const newAptObj = {
          id,
          user_id,
          customerName: newApt.customerName,
          phoneNumber: newApt.phoneNumber,
          vehicleYear: newApt.vehicleYear || '2021',
          vehicleMake: newApt.vehicleMake || 'Toyota',
          vehicleModel: newApt.vehicleModel || 'Camry',
          serviceId: newApt.serviceId || services[0]?.id || 'srv-2',
          scheduledAt: newApt.scheduledAt ? newApt.scheduledAt.replace('T', ' ') : 'May 16, 2026 3:30 PM',
          status: newApt.status || 'pending',
          notes: newApt.notes || ''
        };

        const { error } = await supabase
          .from('appointments')
          .insert(newAptObj);

        if (error) {
          console.error('Error inserting appointment in Supabase:', error);
        }

        const { user_id: _, ...localApt } = newAptObj as any;
        onUpdateAppointments([localApt, ...appointments]);
      }
    } catch (err) {
      console.error('Exception saving appointment:', err);
    } finally {
      setShowAptModal(false);
      setEditingAppointment(null);
      setNewApt({
        customerName: '', phoneNumber: '', vehicleYear: '2021', vehicleMake: 'Toyota', vehicleModel: 'Camry',
        serviceId: services[0]?.id || '', scheduledAt: '', status: 'pending', notes: ''
      });
    }
  };

  // Create agent
  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgent.name) return;

    const formattedAgent: AIAgent = {
      id: `agt-${Date.now()}`,
      name: newAgent.name,
      voice: newAgent.voice || 'General Medicine Expert',
      personality: newAgent.personality || 'Compassionate and Professional',
      interruptionSensitivity: (newAgent.interruptionSensitivity as any) || 'Medium',
      greetingMessage: newAgent.greetingMessage || 'Hello! How can I assist you today?',
      systemPrompt: newAgent.systemPrompt || 'You are an expert medical AI...',
      isActive: true
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user ? user.id : null;

      const { error } = await supabase
        .from('agents')
        .insert(userId ? { ...formattedAgent, user_id: userId } : formattedAgent);

      if (error) {
        console.error('Error inserting agent to Supabase:', error);
      }
    } catch (err) {
      console.error('Exception creating agent:', err);
    } finally {
      onUpdateAgents([...agents, formattedAgent]);
      setSelectedAgentForStudio(formattedAgent);
      setShowAgentModal(false);
      setNewAgent({
        name: '', voice: 'General Medicine Expert', personality: 'Compassionate and Professional', interruptionSensitivity: 'Medium',
        greetingMessage: 'Hello! I am your Medical AI Assistant. How can I help you today?',
        systemPrompt: 'You are an expert Medical AI assistant...'
      });
    }
  };

  const handleSaveAgentModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgent.name) return;

    if (editingAgent) {
      const updatedAgent: AIAgent = {
        ...editingAgent,
        name: newAgent.name,
        voice: newAgent.voice || 'General Medicine Specialist',
        personality: newAgent.personality || 'Compassionate and Professional',
        interruptionSensitivity: (newAgent.interruptionSensitivity as any) || 'Medium',
        greetingMessage: newAgent.greetingMessage || '',
        systemPrompt: newAgent.systemPrompt || '',
      };

      try {
        const { error } = await supabase
          .from('agents')
          .update(updatedAgent)
          .eq('id', editingAgent.id);
        if (error) {
          console.error('Error updating agent in Supabase:', error);
        }
      } catch (err) {
        console.error('Exception updating agent:', err);
      } finally {
        onUpdateAgents(agents.map(a => a.id === editingAgent.id ? updatedAgent : a));
        setShowAgentModal(false);
        setEditingAgent(null);
        setNewAgent({
          name: '', voice: 'General Medicine Specialist', personality: 'Empathetic, clear, and clinical', interruptionSensitivity: 'Medium',
          greetingMessage: 'Hello! I am your Medical AI Assistant. How can I help you today?',
          systemPrompt: 'You are an expert Medical AI assistant...'
        });
      }
    } else {
      await handleCreateAgent(e);
    }
  };

  // Create or Update service in Supabase
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.name) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user ? user.id : null;

      if (editingService) {
        const updatedService: Service = {
          id: editingService.id,
          name: newService.name,
          description: newService.description || '',
          durationMinutes: Number(newService.durationMinutes) || 60,
          priceType: (newService.priceType as any) || 'Fixed Price',
          price: Number(newService.price) || 0,
          isActive: newService.isActive !== undefined ? newService.isActive : true
        };

        const { error } = await supabase
          .from('services')
          .update(userId ? { ...updatedService, user_id: userId } : updatedService)
          .eq('id', editingService.id);

        if (error) {
          console.error('Error updating Service:', error);
        }

        onUpdateServices(services.map(s => s.id === editingService.id ? updatedService : s));
      } else {
        const formattedService = {
          id: `srv-${Date.now()}`,
          name: newService.name,
          description: newService.description || '',
          durationMinutes: Number(newService.durationMinutes) || 60,
          priceType: (newService.priceType as any) || 'Fixed Price',
          price: Number(newService.price) || 0,
          isActive: true
        };

        const { error } = await supabase
          .from('services')
          .insert(userId ? { ...formattedService, user_id: userId } : formattedService);

        if (error) {
          console.error('Error inserting Service:', error);
        }

        onUpdateServices([...services, formattedService]);
      }
    } catch (err) {
      console.error('Exception saving Service:', err);
      // Fallback
      if (editingService) {
        const updatedService: Service = {
          id: editingService.id,
          name: newService.name!,
          description: newService.description || '',
          durationMinutes: Number(newService.durationMinutes) || 60,
          priceType: (newService.priceType as any) || 'Fixed Price',
          price: Number(newService.price) || 0,
          isActive: newService.isActive !== undefined ? newService.isActive : true
        };
        onUpdateServices(services.map(s => s.id === editingService.id ? updatedService : s));
      } else {
        const formattedService = {
          id: `srv-${Date.now()}`,
          name: newService.name!,
          description: newService.description || '',
          durationMinutes: Number(newService.durationMinutes) || 60,
          priceType: (newService.priceType as any) || 'Fixed Price',
          price: Number(newService.price) || 0,
          isActive: true
        };
        onUpdateServices([...services, formattedService]);
      }
    } finally {
      setShowServiceModal(false);
      setEditingService(null);
      setNewService({
        name: '', description: '', durationMinutes: 60, priceType: 'Fixed Price', price: 49.99, isActive: true
      });
    }
  };

  // Create or Update FAQ in Supabase
  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaq.question || !newFaq.answer) return;

    try {
      // Get logged in user details for user_id association
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user ? user.id : null;

      if (editingFaq) {
        // Update in Supabase
        const updatedFaq: FAQ = {
          id: editingFaq.id,
          question: newFaq.question,
          answer: newFaq.answer,
          category: newFaq.category || 'General'
        };

        const { error } = await supabase
          .from('faqs')
          .update(userId ? { ...updatedFaq, user_id: userId } : updatedFaq)
          .eq('id', editingFaq.id);

        if (error) {
          console.error('Error updating FAQ:', error);
        }

        // Update local React state in either case
        onUpdateFAQs(faqs.map(f => f.id === editingFaq.id ? updatedFaq : f));
      } else {
        // Create in Supabase
        const formattedFaq = {
          id: `faq-${Date.now()}`,
          question: newFaq.question,
          answer: newFaq.answer,
          category: newFaq.category || 'General'
        };

        const { error } = await supabase
          .from('faqs')
          .insert(userId ? { ...formattedFaq, user_id: userId } : formattedFaq);

        if (error) {
          console.error('Error inserting FAQ:', error);
        }

        // Update local React state
        onUpdateFAQs([...faqs, formattedFaq]);
      }
    } catch (err) {
      console.error('Exception saving FAQ:', err);
      // Fallback update React state if any issue
      if (editingFaq) {
        const updatedFaq = { id: editingFaq.id, question: newFaq.question!, answer: newFaq.answer!, category: newFaq.category || 'General' };
        onUpdateFAQs(faqs.map(f => f.id === editingFaq.id ? updatedFaq : f));
      } else {
        const formattedFaq = { id: `faq-${Date.now()}`, question: newFaq.question!, answer: newFaq.answer!, category: newFaq.category || 'General' };
        onUpdateFAQs([...faqs, formattedFaq]);
      }
    } finally {
      setShowFaqModal(false);
      setEditingFaq(null);
      setNewFaq({ question: '', answer: '', category: 'General' });
    }
  };

  // Delete handlers
  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting appointment from Supabase:', error);
      }
    } catch (err) {
      console.error('Exception deleting appointment:', err);
    } finally {
      onUpdateAppointments(appointments.filter(a => a.id !== id));
    }
  };

  const deleteAgent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Error deleting Agent from Supabase:', error);
      }
    } catch (err) {
      console.error('Exception deleting Agent:', err);
    } finally {
      const remaining = agents.filter(a => a.id !== id);
      onUpdateAgents(remaining);
      if (selectedAgentForStudio?.id === id) {
        setSelectedAgentForStudio(remaining[0] || null);
      }
      if (selectedMedicalAgentId === id) {
        setSelectedMedicalAgentId(remaining[0]?.id || '');
      }
    }
  };

  const handleSendMedicalMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!medicalChatInput.trim() || medicalChatLoading) return;

    const userMessage = medicalChatInput.trim();
    setMedicalChatInput('');

    // Get current session messages
    const currentSession = medicalChatSessions[selectedMedicalAgentId] || [];
    
    // Find active doctor
    const activeDoc = agents.find(a => a.id === selectedMedicalAgentId);
    if (!activeDoc) return;

    const updatedWithUser = [...currentSession, { role: 'user' as const, content: userMessage }];
    setMedicalChatSessions(prev => ({
      ...prev,
      [selectedMedicalAgentId]: updatedWithUser
    }));

    setMedicalChatLoading(true);

    try {
      const apiMessages = [
        { role: 'system', content: activeDoc.systemPrompt || "You are an expert Medical AI Assistant. Answer medical questions safely and clearly." },
        ...updatedWithUser.map(msg => ({ role: msg.role, content: msg.content }))
      ];

      const response = await fetch('/api/medical-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: apiMessages,
          apiKeyOverride: medicalOpenAIKeyOverride || undefined
        })
      });

      const contentType = response.headers.get('content-type');
      let result: any = null;
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response (${response.status}): ${text.substring(0, 120)}...`);
      }

      if (!response.ok) {
        throw new Error(result?.error?.message || `API Error: ${response.status}`);
      }

      const assistantMessageContent = result.choices?.[0]?.message?.content || "No reply received.";
      
      setMedicalChatSessions(prev => ({
        ...prev,
        [selectedMedicalAgentId]: [...updatedWithUser, { role: 'assistant' as const, content: assistantMessageContent }]
      }));
    } catch (err: any) {
      console.error("Error in medical chat API call:", err);
      const errorMsg = `[System Error: ${err.message || "Failed to contact OpenAI API"}]\n\nPlease verify your OpenAI API Key is configured. You can set it using the API Key Override button at the top-right of the chat dashboard.`;
      setMedicalChatSessions(prev => ({
        ...prev,
        [selectedMedicalAgentId]: [...updatedWithUser, { role: 'assistant' as const, content: errorMsg }]
      }));
    } finally {
      setMedicalChatLoading(false);
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting Service from Supabase:', error);
      }
    } catch (err) {
      console.error('Exception deleting Service:', err);
    } finally {
      onUpdateServices(services.filter(s => s.id !== id));
    }
  };

  const deleteFaq = async (id: string) => {
    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting FAQ from Supabase:', error);
      }
    } catch (err) {
      console.error('Exception deleting FAQ:', err);
    } finally {
      onUpdateFAQs(faqs.filter(f => f.id !== id));
    }
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
  const handleDirectDialerBooking = async (name: string, vehicle: string, serviceName: string) => {
    // Find service ID
    const matchingService = services.find(s => s.name.toLowerCase().includes(serviceName.toLowerCase())) || services[0];
    
    const id = `apt-${Date.now()}`;
    const { data: { user } } = await supabase.auth.getUser();
    const user_id = user ? user.id : null;

    // Add appointment
    const newAptObj = {
      id,
      user_id,
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

    try {
      await supabase
        .from('appointments')
        .insert(newAptObj);
    } catch (err) {
      console.error('Error saving direct dialer booking to Supabase:', err);
    }

    const { user_id: _, ...localApt } = newAptObj as any;
    onUpdateAppointments([localApt, ...appointments]);

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

      {/* MOBILE SIDEBAR BACKDROP Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`fixed inset-y-0 left-0 md:static flex flex-col justify-between shrink-0 z-50 bg-[#0d172a] border-r border-[#1e293b] shadow-2xl transition-all duration-300 transform ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'} w-64`}>
        <div className="overflow-y-auto flex-1 pb-4">
          {/* Sidebar Header */}
          <div className={`p-4 border-b border-[#1e293b] flex ${isSidebarCollapsed ? 'md:flex-col gap-3 items-center justify-center' : 'items-center justify-between'} bg-[#0d172a] h-[73px] transition-all duration-300`}>
            <div className="flex items-center gap-3 group cursor-pointer overflow-hidden" onClick={() => handleNavigate('/')}>
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
            
            {/* Mobile close button / Desktop collapse button */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-[#121e36] border border-[#1e293b] text-[#617496] hover:text-white transition-colors cursor-pointer shrink-0 md:hidden"
                title="Close Sidebar"
              >
                <X className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1.5 rounded-lg bg-[#121e36] border border-[#1e293b] text-[#617496] hover:text-[#F8FAFC] hover:bg-[#1a2e4c] transition-colors cursor-pointer shrink-0 hidden md:inline-block"
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              </button>
            </div>
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
                { tab: 'appointments', label: 'Appointments', icon: Calendar, path: '/appointments' },
                { tab: 'schedule', label: 'Schedule', icon: CalendarDays, path: '/schedule' },
                { tab: 'patients', label: 'Patients', icon: Users, path: '/patients' },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.tab;
                return (
                  <button 
                    key={item.tab}
                    onClick={() => handleNavigate(item.path)}
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
                { tab: 'agents', label: 'Medical AI', icon: Heart, path: '/agents' },
                { tab: 'services', label: 'Services', icon: ClipboardList, path: '/services' },
                { tab: 'faqs', label: 'Knowledge', icon: HelpCircle, path: '/faqs' },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.tab;
                return (
                  <button 
                    key={item.tab}
                    onClick={() => handleNavigate(item.path)}
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
                { tab: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications', badge: notificationsHistory.filter((n: any) => !n.read).length || undefined, isSpecial: false },
                { tab: 'settings', label: 'Settings', icon: Settings, path: '/settings', isSpecial: false },
                { tab: 'logout', label: 'Sign Out', icon: LogOut, path: '#', isLogout: true, isSpecial: false },
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
                        handleNavigate(item.path);
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
        <header className="h-16 border-b border-[#1F2937] bg-[#0B1120]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Navigation Drawer Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-[#121e36] border border-[#1e293b] text-[#617496] hover:text-white transition-colors cursor-pointer shrink-0 md:hidden"
              title="Open Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-[#F8FAFC] font-extrabold text-sm capitalize tracking-tight">{activeTab}</h2>
                <span className="w-1 h-1 rounded-full bg-gray-600 hidden xs:inline-block"></span>
                <span className="text-[10px] text-[#3B82F6] font-bold font-mono tracking-wider hidden xs:inline-block">MediCall Voice Platform v2.0</span>
              </div>
              <p className="text-[10px] text-[#94A3B8] font-medium truncate max-w-[150px] xs:max-w-[200px] sm:max-w-none">Workspace configuration & live voice logs</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:inline-block text-[9px] font-mono text-[#94A3B8] bg-[#111827] border border-[#1F2937] px-3 py-1.5 rounded-lg font-bold tracking-wider uppercase">
              ⚡ Live Cloud Simulator Persistence
            </div>
            
            {/* User Profile avatar with Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#8B5CF6]/10 text-[#3B82F6] hover:text-[#3B82F6]/80 flex items-center justify-center font-extrabold text-xs border border-[#3B82F6]/30 shadow-md shadow-[#3B82F6]/5 uppercase cursor-pointer select-none transition-all duration-150 focus:outline-none"
              >
                {profile.name ? profile.name.substring(0, 2).toUpperCase() : "VD"}
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2.5 w-56 bg-[#0B1120] border border-[#1F2937] rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Header info */}
                  <div className="px-4 py-2 border-b border-[#1F2937] mb-1">
                    <p className="text-xs font-bold text-white truncate">{profile.name || "Clinic Admin"}</p>
                    <p className="text-[10px] text-[#617496] truncate mt-0.5">{profile.email || "admin@voice.ai"}</p>
                  </div>

                  {/* Dropdown Options */}
                  <button
                    onClick={() => {
                      setSettingsTab('profile');
                      navigate('/settings');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-[#94A3B8] hover:text-white hover:bg-[#121E36] transition-all flex items-center gap-2.5 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-[#3B82F6]" />
                    <span>Business Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setSettingsTab('password');
                      navigate('/settings');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-[#94A3B8] hover:text-white hover:bg-[#121E36] transition-all flex items-center gap-2.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    <span>Change Password</span>
                  </button>

                  <button
                    onClick={() => {
                      setSettingsTab('hours');
                      navigate('/settings');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-[#94A3B8] hover:text-white hover:bg-[#121E36] transition-all flex items-center gap-2.5 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Business Hours</span>
                  </button>

                  {/* Divider */}
                  <div className="border-t border-[#1F2937] my-1"></div>

                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onSignOut();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/15 transition-all flex items-center gap-2.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
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
                    <span className="text-3xl font-extrabold text-[#F8FAFC] block mt-1.5 tracking-tight">{getAverageCallDuration()}</span>
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
                      <p className="text-[10px] text-[#94A3B8]">Weekly inbound calls vs appointment conversion</p>
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
                      <path d={getTrendSvgPaths().callsAreaPath} fill="url(#glowBlue)"/>
                      <path d={getTrendSvgPaths().aptsAreaPath} fill="url(#glowPurple)"/>

                      {/* Lines */}
                      <path d={getTrendSvgPaths().callsLinePath} fill="none" stroke="#3B82F6" strokeWidth="2.5"/>
                      <path d={getTrendSvgPaths().aptsLinePath} fill="none" stroke="#8B5CF6" strokeWidth="2.5"/>
                    </svg>
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-[#94A3B8] mt-2">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
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
                      <span className="text-[#F8FAFC] font-mono font-extrabold text-sm">
                        {conversations.filter(c => c.startedAt && (c.startedAt.includes('minute') || c.startedAt.includes('hour') || c.startedAt.includes('Today') || c.startedAt.includes('today') || c.startedAt.includes('ago'))).length}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#1F2937] pb-2.5">
                      <span className="text-[#94A3B8]">This Week's Conversions</span>
                      <span className="text-[#F8FAFC] font-mono font-extrabold text-sm">
                        {appointments.filter(a => a.status === 'confirmed' || a.status === 'completed').length}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#1F2937] pb-2.5">
                      <span className="text-[#94A3B8]">Callbacks Requested</span>
                      <span className="text-yellow-400 font-mono font-extrabold text-sm">
                        {appointments.filter(a => a.status === 'pending').length}
                      </span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-[#94A3B8]">Active AI Specialists</span>
                      <span className="text-[#3B82F6] font-mono font-extrabold text-sm">
                        {agents.filter(a => a.isActive !== false).length}
                      </span>
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
                      <path d={getTrendSvgPaths().callsAreaPath} fill="url(#glowBlue)"/>
                      {/* Line */}
                      <path d={getTrendSvgPaths().callsLinePath} fill="none" stroke="#3B82F6" strokeWidth="2.5"/>
                    </svg>
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-[#94A3B8] mt-2">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
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
                      {/* Booking segment */}
                      <circle 
                        cx="72" cy="72" r="50" fill="transparent" 
                        stroke="#3B82F6" strokeWidth="18" 
                        strokeDasharray={2 * Math.PI * 50} 
                        strokeDashoffset={2 * Math.PI * 50 * (1 - convertedPct / 100)} 
                      />
                      {/* No action segment */}
                      {convertedPct < 100 && (
                        <circle 
                          cx="72" cy="72" r="50" fill="transparent" 
                          stroke="#8B5CF6" strokeWidth="18" 
                          strokeDasharray={2 * Math.PI * 50} 
                          strokeDashoffset={2 * Math.PI * 50 * (convertedPct / 100)} 
                          className="origin-center"
                          style={{ transform: `rotate(${360 * (convertedPct / 100)}deg)` }}
                        />
                      )}
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-3xl font-extrabold text-white block tracking-tighter">{convertedPct}%</span>
                      <span className="text-[9px] text-[#3B82F6] font-extrabold uppercase tracking-widest">Converted</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-mono pt-4 border-t border-[#1F2937]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-[#94A3B8]"><span className="w-2.5 h-2.5 rounded bg-[#3B82F6] shadow-md shadow-[#3B82F6]/20"></span> Appointments Booked</span>
                      <span className="text-white font-extrabold">{bookedCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-[#94A3B8]"><span className="w-2.5 h-2.5 rounded bg-[#8B5CF6] shadow-md shadow-[#8B5CF6]/20"></span> No Action / Other</span>
                      <span className="text-white font-extrabold">{otherCount}</span>
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
                  {weeklyData.map((data, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-3">
                      <div className="w-full flex justify-center gap-2 h-36 items-end group">
                        {/* Inbound Call Bar (Green) */}
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${data.calls > 0 ? (data.calls / maxWeeklyVal) * 100 : 2}%` }}
                          transition={{ type: 'spring', delay: idx * 0.05, stiffness: 60 }}
                          className="w-4 bg-gradient-to-t from-[#3B82F6] to-[#3B82F6]/80 rounded-t-md transition-all duration-300 shadow-md shadow-[#3B82F6]/10 group-hover:brightness-110 cursor-pointer"
                          title={`Calls: ${data.calls}`}
                        ></motion.div>
                        {/* Appointment Booked Bar (Purple) */}
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${data.appointments > 0 ? (data.appointments / maxWeeklyVal) * 100 : 2}%` }}
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
          {(activeTab as any) === 'conversations' && (
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
                                onChange={async (e) => {
                                  const newStatus = e.target.value as any;
                                  try {
                                    await supabase
                                      .from('appointments')
                                      .update({ status: newStatus })
                                      .eq('id', apt.id);
                                  } catch (err) {
                                    console.error('Error updating status in Supabase:', err);
                                  }
                                  const updated = appointments.map(a => a.id === apt.id ? { ...a, status: newStatus } : a);
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
                              <div className="flex items-center justify-center gap-1">
                                {/* View Appointment Button */}
                                <motion.button 
                                  whileHover={{ scale: 1.1, color: "#3B82F6" }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => setViewingAppointment(apt)}
                                  className="text-[#94A3B8] hover:text-[#3B82F6] p-1.5 rounded-lg hover:bg-[#020617] transition-all cursor-pointer"
                                  title="View Appointment Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </motion.button>

                                {/* Edit Appointment Button */}
                                <motion.button 
                                  whileHover={{ scale: 1.1, color: "#10B981" }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    setEditingAppointment(apt);
                                    setNewApt({
                                      customerName: apt.customerName,
                                      phoneNumber: apt.phoneNumber,
                                      vehicleYear: apt.vehicleYear,
                                      vehicleMake: apt.vehicleMake,
                                      vehicleModel: apt.vehicleModel,
                                      serviceId: apt.serviceId,
                                      scheduledAt: apt.scheduledAt.includes(' ') ? apt.scheduledAt.replace(' ', 'T') : apt.scheduledAt,
                                      status: apt.status,
                                      notes: apt.notes || ''
                                    });
                                    setShowAptModal(true);
                                  }}
                                  className="text-[#94A3B8] hover:text-[#10B981] p-1.5 rounded-lg hover:bg-[#020617] transition-all cursor-pointer"
                                  title="Edit Appointment"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </motion.button>

                                {/* Delete Appointment Button */}
                                <motion.button 
                                  whileHover={{ scale: 1.1, color: "#f87171" }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete the appointment for "${apt.customerName}"?`)) {
                                      deleteAppointment(apt.id);
                                    }
                                  }}
                                  className="text-[#94A3B8] hover:text-red-400 p-1.5 rounded-lg hover:bg-[#020617] transition-all cursor-pointer"
                                  title="Delete Appointment"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </motion.button>
                              </div>
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
              {/* Header section with subtitle & actions */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] p-6 rounded-2xl shadow-xl">
                <div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <span className="p-2 bg-[#3B82F6]/10 text-[#3B82F6] rounded-xl border border-[#3B82F6]/20">
                      <Heart className="w-5 h-5 text-red-400 fill-red-400/20 animate-pulse" />
                    </span>
                    ChatGPT Medical Specialist AI Advisor
                  </h2>
                  <p className="text-[11px] font-mono text-[#94A3B8] mt-1 uppercase tracking-wider">
                    Answering complex medical, diagnostic, and preventative healthcare questions powered by OpenAI
                  </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setEditingAgent(null);
                      setNewAgent({
                        name: '',
                        voice: 'General Medicine Specialist',
                        personality: 'Empathetic, clear, and clinical',
                        interruptionSensitivity: 'Medium',
                        greetingMessage: 'Hello! I am ready to assist you. What health-related questions do you have today?',
                        systemPrompt: 'You are a compassionate Medical Specialist. Provide educational healthcare guidance, cautioning the user to seek in-person diagnostic assessments for critical symptoms.'
                      });
                      setShowAgentModal(true);
                    }}
                    className="bg-gradient-to-r from-red-500 to-[#3B82F6] hover:from-red-600 hover:to-[#3B82F6]/90 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-red-500/10 transition-all w-full md:w-auto"
                  >
                    <Plus className="w-4 h-4" /> Add Medical Specialist
                  </motion.button>
                </div>
              </div>

              {/* Main Workspace Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Left Side: Medical Specialist List */}
                <div className="lg:col-span-4 bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] p-5 rounded-2xl shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="mb-4">
                      <label className="text-[10px] font-mono font-bold text-gray-400 block mb-1 uppercase tracking-wider">Search Specialists</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#94A3B8]" />
                        <input 
                          type="text"
                          placeholder="Filter doctors by name/specialty..."
                          value={doctorSearchQuery}
                          onChange={(e) => setDoctorSearchQuery(e.target.value)}
                          className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl pl-9 pr-3 py-2 outline-none transition-all placeholder:text-[#475569]"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                      {agents
                        .filter(agt => 
                          agt.name.toLowerCase().includes(doctorSearchQuery.toLowerCase()) || 
                          (agt.voice || '').toLowerCase().includes(doctorSearchQuery.toLowerCase())
                        )
                        .map((agt) => {
                          const isSelected = selectedMedicalAgentId === agt.id;
                          return (
                            <div 
                              key={agt.id}
                              onClick={() => setSelectedMedicalAgentId(agt.id)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 relative group ${
                                isSelected 
                                  ? 'bg-[#3B82F6]/10 border-[#3B82F6]/50 shadow-md' 
                                  : 'bg-[#020617]/50 border-[#1F2937] hover:border-gray-700'
                              }`}
                            >
                              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-[#1F2937] flex items-center justify-center shrink-0">
                                <span className="text-sm font-extrabold text-red-400 font-sans">🩺</span>
                              </div>
                              <div className="space-y-1 pr-6 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-white text-xs block">{agt.name}</span>
                                  {agt.isActive && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active"></span>
                                  )}
                                </div>
                                <span className="text-[10px] font-medium text-red-400/90 font-mono block bg-red-950/20 px-2 py-0.5 rounded border border-red-900/30 w-max">
                                  {agt.voice || 'Medical Specialist'}
                                </span>
                                <p className="text-[10px] text-[#94A3B8] line-clamp-1 italic">
                                  "${agt.personality || 'Empathetic and authoritative'}"
                                </p>
                              </div>

                              {/* Actions on Doctor */}
                              <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingAgent(agt);
                                    setNewAgent({ ...agt });
                                    setShowAgentModal(true);
                                  }}
                                  className="p-1 hover:bg-[#1F2937] text-gray-400 hover:text-white rounded transition-colors"
                                  title="Edit Doctor Details"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`Are you sure you want to remove ${agt.name}?`)) {
                                      deleteAgent(agt.id);
                                    }
                                  }}
                                  className="p-1 hover:bg-red-950/20 text-gray-400 hover:text-red-400 rounded transition-colors"
                                  title="Remove Doctor"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      {agents.length === 0 && (
                        <div className="p-8 text-center text-xs text-gray-500 italic bg-[#020617]/50 border border-[#1F2937] rounded-xl">
                          No specialists found. Click "+ Add Specialist" to register one.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#1F2937] space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                      <span>Total Specialists:</span>
                      <span className="font-bold text-white">{agents.length}</span>
                    </div>
                    <div className="p-2 bg-[#020617]/40 border border-[#1F2937] rounded-lg text-[9px] text-[#94A3B8] italic">
                      *You can edit medical prompts and instructions dynamically. Changes persist instantly!
                    </div>
                  </div>
                </div>

                {/* Right Side: ChatGPT-Style Conversational Interface */}
                <div className="lg:col-span-8 bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] rounded-2xl shadow-xl flex flex-col min-h-[560px] overflow-hidden">
                  
                  {/* Chat Header */}
                  {(() => {
                    const activeDoc = agents.find(a => a.id === selectedMedicalAgentId) || agents[0];
                    if (!activeDoc) {
                      return (
                        <div className="p-8 text-center text-xs text-gray-500 italic">
                          Please select or add a Medical Specialist to begin consultation.
                        </div>
                      );
                    }

                    const sessionMessages = medicalChatSessions[activeDoc.id] || [];

                    return (
                      <>
                        <div className="bg-[#020617] px-5 py-4 border-b border-[#1F2937] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-950/20 text-red-400 border border-red-900/40 flex items-center justify-center">
                              <Heart className="w-5 h-5 fill-red-400/20" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="text-white font-extrabold text-sm">{activeDoc.name}</h3>
                                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[8px] font-mono font-bold uppercase tracking-wide border border-emerald-900/50">Online</span>
                              </div>
                              <p className="text-[10px] text-[#94A3B8] font-mono uppercase tracking-wider">{activeDoc.voice || 'Medical Specialist'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-stretch sm:self-auto">
                            <button
                              onClick={() => {
                                setMedicalChatSessions(prev => ({
                                  ...prev,
                                  [activeDoc.id]: []
                                }));
                              }}
                              className="text-[10px] text-gray-400 hover:text-white bg-[#020617] hover:bg-[#111827] border border-[#1F2937] px-2.5 py-1.5 rounded-lg font-mono transition-colors cursor-pointer flex items-center gap-1"
                              title="Clear current session history"
                            >
                              <RefreshCw className="w-3 h-3" /> Clear History
                            </button>

                            <button
                              onClick={() => setShowKeyOverrideInput(!showKeyOverrideInput)}
                              className={`text-[10px] px-2.5 py-1.5 rounded-lg font-mono border transition-all cursor-pointer flex items-center gap-1 ${
                                medicalOpenAIKeyOverride 
                                  ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30' 
                                  : 'bg-[#020617] text-gray-400 hover:text-white border-[#1F2937]'
                              }`}
                              title="Configure custom OpenAI API Key"
                            >
                              <Key className="w-3 h-3" /> 
                              {medicalOpenAIKeyOverride ? 'Key Active' : 'API Key'}
                            </button>
                          </div>
                        </div>

                        {/* Optional OpenAI Key Override input bar */}
                        <AnimatePresence>
                          {showKeyOverrideInput && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="bg-[#020617] border-b border-[#1F2937] px-5 py-3 overflow-hidden"
                            >
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <div className="relative flex-1">
                                  <Key className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#94A3B8]" />
                                  <input 
                                    type="password"
                                    placeholder="Enter your OpenAI API Key (sk-...) to override server default"
                                    value={medicalOpenAIKeyOverride}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setMedicalOpenAIKeyOverride(val);
                                      localStorage.setItem('vd_openai_api_key_override', val);
                                    }}
                                    className="w-full bg-[#111827] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl pl-9 pr-3 py-2 outline-none transition-all placeholder:text-[#475569]"
                                  />
                                </div>
                                {medicalOpenAIKeyOverride && (
                                  <button
                                    onClick={() => {
                                      setMedicalOpenAIKeyOverride('');
                                      localStorage.removeItem('vd_openai_api_key_override');
                                    }}
                                    className="bg-red-950/20 hover:bg-red-600/20 text-red-400 text-xs px-3 py-2 rounded-xl border border-red-900/30 hover:border-red-500/30 font-mono transition-all cursor-pointer"
                                  >
                                    Clear Key
                                  </button>
                                )}
                              </div>
                              <p className="text-[9px] text-[#94A3B8] mt-1.5 italic">
                                *Keys are processed securely in our custom full stack backend (`/api/medical-chat`) and never saved anywhere except your local browser storage.
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Conversational Screen (Feed) */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[380px] bg-[#020617]/20 flex flex-col">
                          
                          {/* Selected Doctor Welcome Message */}
                          <div className="flex items-start gap-3 max-w-[85%]">
                            <div className="w-8 h-8 rounded-full bg-slate-900 border border-[#1F2937] flex items-center justify-center shrink-0">
                              <span className="text-xs">🩺</span>
                            </div>
                            <div className="bg-[#111827] border border-[#1F2937] rounded-2xl rounded-tl-none p-3.5 shadow-sm text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">
                              {activeDoc.greetingMessage}
                            </div>
                          </div>

                          {/* Dynamic Message Logs */}
                          {sessionMessages.map((msg, idx) => {
                            const isUser = msg.role === 'user';
                            return (
                              <div 
                                key={idx}
                                className={`flex items-start gap-3 max-w-[85%] ${
                                  isUser ? 'self-end flex-row-reverse' : ''
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
                                  isUser 
                                    ? 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30' 
                                    : 'bg-slate-900 text-[#94A3B8] border-[#1F2937]'
                                }`}>
                                  <span className="text-xs">{isUser ? '👤' : '🩺'}</span>
                                </div>
                                <div className={`p-3.5 shadow-sm text-xs leading-relaxed whitespace-pre-wrap rounded-2xl ${
                                  isUser 
                                    ? 'bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-white rounded-tr-none' 
                                    : 'bg-[#111827] border border-[#1F2937] text-gray-200 rounded-tl-none'
                                }`}>
                                  {msg.content}
                                </div>
                              </div>
                            );
                          })}

                          {/* Thinking / Loader state */}
                          {medicalChatLoading && (
                            <div className="flex items-start gap-3 max-w-[80%]">
                              <div className="w-8 h-8 rounded-full bg-slate-900 border border-[#1F2937] flex items-center justify-center shrink-0">
                                <span className="text-xs">🩺</span>
                              </div>
                              <div className="bg-[#111827] border border-[#1F2937] rounded-2xl rounded-tl-none p-3 px-4 shadow-sm flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                                <span className="animate-bounce font-extrabold text-[#3B82F6]">●</span>
                                <span className="animate-bounce delay-100 font-extrabold text-red-400">●</span>
                                <span className="animate-bounce delay-200 font-extrabold text-emerald-400">●</span>
                                <span className="ml-1 text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold font-mono">Dr. is analyzing...</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Interactive Suggestion Prompts */}
                        <div className="bg-[#020617]/50 border-t border-[#1F2937]/50 px-5 py-3 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
                          <span className="text-[9px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider shrink-0">Suggested Questions:</span>
                          {[
                            "Explain chest pain vs heartburn signs",
                            "Pediatric treatment for infant fever",
                            "Healthy habits for lower blood pressure"
                          ].map((suggestion, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => setMedicalChatInput(suggestion)}
                              className="text-[10px] bg-[#111827] hover:bg-[#1F2937] text-gray-300 hover:text-white px-2.5 py-1 rounded-full border border-[#1F2937] transition-all cursor-pointer truncate"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>

                        {/* Prompt Input Form */}
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMedicalMessage();
                          }}
                          className="bg-[#020617] px-5 py-4 border-t border-[#1F2937] flex items-center gap-3"
                        >
                          <input 
                            type="text"
                            required
                            disabled={medicalChatLoading}
                            value={medicalChatInput}
                            onChange={(e) => setMedicalChatInput(e.target.value)}
                            placeholder={`Ask ${activeDoc.name} any health-related question...`}
                            className="flex-1 bg-[#111827] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-4 py-3 outline-none transition-all placeholder:text-[#475569] disabled:opacity-50"
                          />
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            type="submit"
                            disabled={medicalChatLoading || !medicalChatInput.trim()}
                            className="bg-gradient-to-r from-red-500 to-[#3B82F6] hover:from-red-600 hover:to-[#3B82F6]/90 text-white p-3 rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-red-500/10 transition-all flex items-center justify-center shrink-0"
                          >
                            <Send className="w-4 h-4" />
                          </motion.button>
                        </form>
                      </>
                    );
                  })()}
                </div>
              </div>
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
                        
                        <div className="flex items-center gap-1">
                          {/* View Service Button */}
                          <motion.button 
                            whileHover={{ scale: 1.1, color: "#3B82F6" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setViewingService(srv)}
                            className="text-[#94A3B8] hover:text-[#3B82F6] p-1.5 rounded-lg hover:bg-[#020617] transition-all cursor-pointer"
                            title="View Service Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </motion.button>

                          {/* Edit Service Button */}
                          <motion.button 
                            whileHover={{ scale: 1.1, color: "#10B981" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setEditingService(srv);
                              setNewService({
                                name: srv.name,
                                description: srv.description || '',
                                durationMinutes: srv.durationMinutes || 60,
                                priceType: srv.priceType || 'Fixed Price',
                                price: srv.price || 0,
                                isActive: srv.isActive !== undefined ? srv.isActive : true
                              });
                              setShowServiceModal(true);
                            }}
                            className="text-[#94A3B8] hover:text-[#10B981] p-1.5 rounded-lg hover:bg-[#020617] transition-all cursor-pointer"
                            title="Edit Service"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </motion.button>

                          {/* Delete Service Button */}
                          <motion.button 
                            whileHover={{ scale: 1.1, color: "#f87171" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${srv.name}"?`)) {
                                deleteService(srv.id);
                              }
                            }}
                            className="text-[#94A3B8] hover:text-red-400 p-1.5 rounded-lg hover:bg-[#020617] transition-all cursor-pointer"
                            title="Delete Service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
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
                      <div className="flex items-center gap-2.5">
                        {/* View Button */}
                        <motion.button 
                          whileHover={{ scale: 1.1, color: "#3B82F6" }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setViewingFaq(faq);
                          }}
                          className="text-[#94A3B8] hover:text-[#3B82F6] p-1.5 rounded-lg hover:bg-[#111827] transition-colors pointer-events-auto"
                          title="View FAQ Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </motion.button>

                        {/* Edit Button */}
                        <motion.button 
                          whileHover={{ scale: 1.1, color: "#10B981" }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setEditingFaq(faq);
                            setNewFaq({
                              question: faq.question,
                              answer: faq.answer,
                              category: faq.category
                            });
                            setShowFaqModal(true);
                          }}
                          className="text-[#94A3B8] hover:text-[#10B981] p-1.5 rounded-lg hover:bg-[#111827] transition-colors pointer-events-auto"
                          title="Edit FAQ"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </motion.button>

                        {/* Delete Button */}
                        <motion.button 
                          whileHover={{ scale: 1.1, color: "#f87171" }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (confirm("Are you sure you want to delete this FAQ?")) {
                              deleteFaq(faq.id);
                            }
                          }}
                          className="text-[#94A3B8] hover:text-red-400 p-1.5 rounded-lg hover:bg-[#111827] transition-colors pointer-events-auto"
                          title="Delete FAQ"
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
          {(activeTab as any) === 'widget' && (
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
                  <button 
                    onClick={() => setSettingsTab('password')}
                    className={`pb-3 relative cursor-pointer font-extrabold tracking-tight transition-all ${
                      settingsTab === 'password' ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]' : 'text-[#94A3B8] hover:text-gray-200'
                    }`}
                  >
                    Change Password
                  </button>
                  <button 
                    onClick={() => setSettingsTab('danger')}
                    className={`pb-3 relative cursor-pointer font-extrabold tracking-tight transition-all ${
                      settingsTab === 'danger' ? 'text-red-500 border-b-2 border-red-500' : 'text-red-400/70 hover:text-red-400'
                    }`}
                  >
                    Delete Account
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

              {/* PASSWORD CHANGE SUB TAB */}
              {settingsTab === 'password' && (
                <div className="space-y-6 max-w-xl">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Update Security Password</h3>
                    <p className="text-xs text-[#94A3B8]">Ensure your account security by choosing a robust password of at least 6 characters.</p>
                  </div>

                  {passwordStatus.type && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border flex items-start gap-3 ${
                        passwordStatus.type === 'success' 
                          ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300' 
                          : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                      }`}
                    >
                      <div className="mt-0.5">
                        {passwordStatus.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                      </div>
                      <div className="text-xs font-medium">
                        {passwordStatus.message}
                      </div>
                    </motion.div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    {/* Old Password */}
                    <div className="space-y-1.5 relative">
                      <label className="text-[10px] text-[#94A3B8] uppercase font-bold font-mono tracking-wider block">
                        Old Password *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-[#617496]">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input 
                          type={showOldPassword ? 'text' : 'password'} 
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl pl-9 pr-10 py-2.5 outline-none transition-all font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          className="absolute right-3 top-2.5 text-[#617496] hover:text-[#94A3B8] transition-colors"
                        >
                          {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-1.5 relative">
                      <label className="text-[10px] text-[#94A3B8] uppercase font-bold font-mono tracking-wider block">
                        New Password *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-[#617496]">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input 
                          type={showNewPassword ? 'text' : 'password'} 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl pl-9 pr-10 py-2.5 outline-none transition-all font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-2.5 text-[#617496] hover:text-[#94A3B8] transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5 relative">
                      <label className="text-[10px] text-[#94A3B8] uppercase font-bold font-mono tracking-wider block">
                        Confirm New Password *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-[#617496]">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input 
                          type={showConfirmPassword ? 'text' : 'password'} 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl pl-9 pr-10 py-2.5 outline-none transition-all font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-2.5 text-[#617496] hover:text-[#94A3B8] transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <motion.button 
                        type="submit"
                        disabled={passwordLoading}
                        whileHover={{ scale: passwordLoading ? 1 : 1.03 }}
                        whileTap={{ scale: passwordLoading ? 1 : 0.97 }}
                        className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#3B82F6]/90 hover:to-[#8B5CF6]/90 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-md shadow-[#3B82F6]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {passwordLoading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Save Password'
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>
              )}

              {/* DANGER ZONE SUB TAB */}
              {settingsTab === 'danger' && (
                <div className="space-y-6 max-w-xl bg-red-950/10 border border-red-900/30 p-5 rounded-2xl">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 shrink-0 border border-red-500/20">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-red-500 mb-1">Danger Zone: Delete Account</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        This action is permanent and cannot be undone. Once deleted, all your clinic data and login sessions will be wiped clean from our databases immediately.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 bg-[#020617]/50 p-4 rounded-xl border border-red-900/10">
                    <h4 className="text-[10px] text-red-400 uppercase font-mono font-bold tracking-wider">What will be permanently deleted:</h4>
                    <ul className="list-disc pl-5 text-xs text-slate-400 space-y-1.5 leading-relaxed">
                      <li>Your entire business profile details & contact info</li>
                      <li>Your customized clinical business operational hours</li>
                      <li>All registered clinic services and appointment fees</li>
                      <li>All logged patients, diagnostic details, and contact lists</li>
                      <li>All booked clinical client appointments & historic records</li>
                      <li>All configured medical AI physicians, specialists, and agents</li>
                      <li>All clinic support FAQs and custom-trained system prompts</li>
                    </ul>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[10px] text-slate-400 uppercase font-bold font-mono tracking-wider block">
                      To confirm, type <span className="text-red-500 font-extrabold font-sans">DELETE</span> below:
                    </label>
                    <input 
                      type="text" 
                      value={deleteAccountConfirmText}
                      onChange={(e) => setDeleteAccountConfirmText(e.target.value)}
                      placeholder="Type DELETE to confirm"
                      className="w-full bg-[#020617] border border-red-900/30 focus:border-red-500 text-xs text-white rounded-xl px-4 py-3 outline-none transition-all font-mono tracking-widest uppercase placeholder:text-slate-600 focus:ring-1 focus:ring-red-500/30"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <motion.button 
                      onClick={handleDeleteAccount}
                      disabled={deleteAccountLoading || deleteAccountConfirmText.trim().toUpperCase() !== 'DELETE'}
                      whileHover={{ scale: deleteAccountLoading ? 1 : 1.02 }}
                      whileTap={{ scale: deleteAccountLoading ? 1 : 0.98 }}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs px-5 py-3 rounded-xl cursor-pointer shadow-lg shadow-red-900/20 flex items-center gap-2 transition-all"
                    >
                      {deleteAccountLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Deleting Everything...
                        </>
                      ) : (
                        'Permanently Delete Account'
                      )}
                    </motion.button>
                  </div>
                </div>
              )}
 
            </motion.div>
          )}

          {/* SCHEDULE (CALENDAR) TAB */}
          {activeTab === 'schedule' && (() => {
            const MONTH_NAMES = [
              "January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"
            ];
            const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

            return (
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
                      <CalendarDays className="w-4 h-4" /> {MONTH_NAMES[currentMonth]} {currentYear}
                    </span>
                    <button 
                      onClick={() => {
                        setNewApt(prev => ({ ...prev, scheduledAt: `${selectedCalendarDate}T10:00` }));
                        setShowAptModal(true);
                      }} 
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
                        <span className="font-extrabold text-sm text-white">{MONTH_NAMES[currentMonth]} {currentYear}</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded-md font-bold font-mono">Live Sync</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => {
                            const today = new Date();
                            setCurrentMonth(today.getMonth());
                            setCurrentYear(today.getFullYear());
                            setSelectedCalendarDate(getTodayDateString());
                          }}
                          className="text-[10px] text-[#2563eb] hover:text-white px-2 py-1 rounded bg-[#2563eb]/10 hover:bg-[#2563eb] transition-all font-bold font-mono mr-2 cursor-pointer"
                        >
                          Today
                        </button>
                        <button 
                          onClick={handlePrevMonth}
                          className="text-[#617496] hover:text-white p-1 rounded hover:bg-[#0d172a] transition-all cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={handleNextMonth}
                          className="text-[#617496] hover:text-white p-1 rounded hover:bg-[#0d172a] transition-all cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Days of the Week */}
                    <div className="grid grid-cols-7 gap-2 text-center text-[10px] text-[#617496] font-bold uppercase tracking-wider mb-2">
                      <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                    </div>

                    {/* Calendar Days Grid */}
                    <div className="grid grid-cols-7 gap-2">
                      {/* Empty cells before 1st of month */}
                      {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                        <div key={`empty-${idx}`} className="aspect-square bg-[#0d172a]/20 rounded-xl opacity-30 border border-transparent"></div>
                      ))}
                      
                      {/* Days of current month */}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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
                          <span className="font-extrabold text-sm text-white">
                            {(() => {
                              const parts = selectedCalendarDate.split('-');
                              const y = parts[0];
                              const mIdx = parts[1] ? parseInt(parts[1]) - 1 : 0;
                              const d = parts[2] ? parseInt(parts[2]) : 1;
                              return `${MONTH_NAMES[mIdx] || 'May'} ${d}, ${y}`;
                            })()}
                          </span>
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
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> 
                                    {(() => {
                                      const timePart = apt.scheduledAt.includes(' ') 
                                        ? apt.scheduledAt.split(' ').slice(1).join(' ') 
                                        : apt.scheduledAt.includes('T') 
                                          ? apt.scheduledAt.split('T')[1] 
                                          : '';
                                      return timePart || apt.scheduledAt;
                                    })()}
                                  </span>
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
            );
          })()}

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
                  onClick={() => {
                    setEditingPatient(null);
                    setIsViewOnly(false);
                    setBookAppointment(false);
                    setNewPatient({ name: '', phone: '', email: '', vehicle: '', notes: '', status: 'Active' });
                    setAptTime('');
                    setAptServiceId(services[0]?.id || '');
                    setShowPatientModal(true);
                  }}
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
                      {patients.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-[#617496]">
                            No patients found. Click "Add Patient" to register your first patient.
                          </td>
                        </tr>
                      ) : (
                        patients
                          .filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.phone.includes(patientSearch) || (p.vehicle && p.vehicle.toLowerCase().includes(patientSearch.toLowerCase())))
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
                                <div className="flex items-center justify-end gap-1.5">
                                  <button 
                                    onClick={() => {
                                      setEditingPatient(p);
                                      setNewPatient({
                                        name: p.name,
                                        phone: p.phone,
                                        email: p.email || '',
                                        vehicle: p.vehicle || '',
                                        notes: p.notes || '',
                                        status: p.status || 'Active'
                                      });
                                      setIsViewOnly(true);
                                      setShowPatientModal(true);
                                    }}
                                    className="text-blue-400 bg-blue-950/20 hover:bg-blue-950/40 p-2 rounded-lg border border-blue-900/30 transition-all cursor-pointer"
                                    title="View Patient Details"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setEditingPatient(p);
                                      setNewPatient({
                                        name: p.name,
                                        phone: p.phone,
                                        email: p.email || '',
                                        vehicle: p.vehicle || '',
                                        notes: p.notes || '',
                                        status: p.status || 'Active'
                                      });
                                      setIsViewOnly(false);
                                      setBookAppointment(false);
                                      setShowPatientModal(true);
                                    }}
                                    className="text-amber-400 bg-amber-950/20 hover:bg-amber-950/40 p-2 rounded-lg border border-amber-900/30 transition-all cursor-pointer"
                                    title="Edit Patient"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={async () => {
                                      if (confirm(`Are you sure you want to delete patient "${p.name}"?`)) {
                                        try {
                                          const { error } = await supabase
                                            .from('patients')
                                            .delete()
                                            .eq('id', p.id);
                                          if (!error) {
                                            setPatients(patients.filter(pat => pat.id !== p.id));
                                          } else {
                                            console.error("Error deleting patient:", error);
                                          }
                                        } catch (err) {
                                          console.error("Error deleting patient:", err);
                                        }
                                      }
                                    }}
                                    className="text-red-400 bg-red-950/20 hover:bg-red-950/40 p-2 rounded-lg border border-red-900/30 transition-all cursor-pointer"
                                    title="Delete Patient"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* WEBSITE TAB */}
          {(activeTab as any) === 'website' && (
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

      {/* NEW/EDIT APPOINTMENT MODAL */}
      {showAptModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-xl shadow-2xl relative overflow-hidden animate-zoomIn">
            
            {/* Header */}
            <div className="bg-[#020617] px-5 py-4 border-b border-[#1F2937] flex items-center justify-between">
              <h3 className="text-white font-extrabold text-sm">{editingAppointment ? 'Edit Appointment' : 'Book Appointment'}</h3>
              <button onClick={() => { setShowAptModal(false); setEditingAppointment(null); }} className="text-[#94A3B8] hover:text-white cursor-pointer transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
 
            {/* Form */}
            <form onSubmit={handleSaveAppointment} className="p-6 space-y-4">
              
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
                    type={editingAppointment ? "text" : "datetime-local"} 
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
                  onClick={() => { setShowAptModal(false); setEditingAppointment(null); }}
                  className="bg-[#020617] hover:bg-[#111827] text-[#94A3B8] hover:text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-[#1F2937] transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#3B82F6]/90 hover:to-[#8B5CF6]/90 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-[#3B82F6]/25 transition-all"
                >
                  {editingAppointment ? 'Save Changes' : 'Book Appointment'}
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
              <h3 className="text-white font-extrabold text-sm">
                {isViewOnly ? 'View Patient Profile' : editingPatient ? 'Edit Patient Details' : 'Add New Patient'}
              </h3>
              <button 
                onClick={() => {
                  setShowPatientModal(false);
                  setEditingPatient(null);
                  setIsViewOnly(false);
                }} 
                className="text-[#94A3B8] hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
 
            {/* Form */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (isViewOnly) {
                setShowPatientModal(false);
                setEditingPatient(null);
                return;
              }

              try {
                const { data: { user } } = await supabase.auth.getUser();
                const userId = user ? user.id : 'usr-demo';
                const pId = editingPatient ? editingPatient.id : 'pat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

                const pRecord = {
                  id: pId,
                  user_id: userId,
                  name: newPatient.name,
                  phone: newPatient.phone,
                  email: newPatient.email,
                  vehicle: newPatient.vehicle,
                  notes: newPatient.notes,
                  status: newPatient.status || 'Active'
                };

                if (editingPatient) {
                  // Update Patient
                  const { error } = await supabase
                    .from('patients')
                    .update(pRecord)
                    .eq('id', editingPatient.id);
                  if (!error) {
                    setPatients(patients.map(p => p.id === editingPatient.id ? pRecord : p));
                  } else {
                    console.error('Error updating patient in Supabase:', error);
                  }
                } else {
                  // Insert Patient
                  const { error } = await supabase
                    .from('patients')
                    .insert(pRecord);
                  if (!error) {
                    setPatients([pRecord, ...patients]);
                  } else {
                    console.error('Error inserting patient in Supabase:', error);
                  }

                  // If book appointment is checked, also schedule appointment
                  if (bookAppointment && aptTime) {
                    const selectedService = services.find(s => s.id === aptServiceId) || services[0];
                    const newAptObj = {
                      id: 'apt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
                      user_id: userId,
                      customerName: newPatient.name,
                      phoneNumber: newPatient.phone,
                      vehicleYear: '2026',
                      vehicleMake: newPatient.vehicle || 'N/A',
                      vehicleModel: '',
                      serviceId: selectedService?.id || 'srv-2',
                      scheduledAt: aptTime.replace('T', ' '),
                      status: 'pending',
                      notes: 'Automatically created from Patient Onboarding. ' + (newPatient.notes || '')
                    };

                    const { error: aptErr } = await supabase
                      .from('appointments')
                      .insert(newAptObj);
                    
                    if (!aptErr) {
                      const { user_id: _, ...localApt } = newAptObj as any;
                      onUpdateAppointments([localApt, ...appointments]);
                    } else {
                      console.error('Error inserting auto-appointment:', aptErr);
                    }
                  }
                }
              } catch (err) {
                console.error('Exception saving patient details:', err);
              } finally {
                setShowPatientModal(false);
                setEditingPatient(null);
                setBookAppointment(false);
                setNewPatient({ name: '', phone: '', email: '', vehicle: '', notes: '', status: 'Active' });
                setAptTime('');
              }
            }} className="p-6 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Patient Name *</label>
                  <input 
                    type="text" 
                    required
                    disabled={isViewOnly}
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    placeholder="John Smith"
                    className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Phone Number *</label>
                  <input 
                    type="text" 
                    required
                    disabled={isViewOnly}
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    placeholder="(555) 000-0000"
                    className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Email Address</label>
                  <input 
                    type="email" 
                    disabled={isViewOnly}
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Primary Vehicle / Field</label>
                  <input 
                    type="text" 
                    disabled={isViewOnly}
                    value={newPatient.vehicle}
                    onChange={(e) => setNewPatient({ ...newPatient, vehicle: e.target.value })}
                    placeholder="Audi Q7 / Cardiology"
                    className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Status</label>
                  <select 
                    disabled={isViewOnly}
                    value={newPatient.status}
                    onChange={(e) => setNewPatient({ ...newPatient, status: e.target.value })}
                    className="w-full bg-[#020617] border border-[#1F2937] text-xs text-white rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-[#3B82F6] transition-all disabled:opacity-60"
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
 
              <div>
                <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Clinical / Voice Notes</label>
                <textarea 
                  rows={2}
                  disabled={isViewOnly}
                  value={newPatient.notes}
                  onChange={(e) => setNewPatient({ ...newPatient, notes: e.target.value })}
                  placeholder="Patient requested recurring updates on cardiovascular report status..."
                  className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all disabled:opacity-60"
                />
              </div>

              {/* BOOK APPOINTMENT DURING PATIENT CREATION */}
              {!isViewOnly && !editingPatient && (
                <div className="bg-[#020617] border border-[#1F2937] p-4 rounded-xl space-y-3.5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-white select-none cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={bookAppointment}
                      onChange={(e) => {
                        setBookAppointment(e.target.checked);
                        if (e.target.checked && services.length > 0 && !aptServiceId) {
                          setAptServiceId(services[0].id);
                        }
                      }}
                      className="rounded border-[#1F2937] text-[#3B82F6] focus:ring-0 bg-transparent w-4 h-4 cursor-pointer"
                    />
                    Book Appointment for this Patient?
                  </label>

                  {bookAppointment && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-fadeIn">
                      <div>
                        <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Select Service *</label>
                        <select 
                          required={bookAppointment}
                          value={aptServiceId}
                          onChange={(e) => setAptServiceId(e.target.value)}
                          className="w-full bg-[#111827] border border-[#1F2937] text-xs text-white rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-[#3B82F6] transition-all"
                        >
                          {services.map((srv) => (
                            <option key={srv.id} value={srv.id}>{srv.name} (${srv.price})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Appointment Time *</label>
                        <input 
                          type="datetime-local"
                          required={bookAppointment}
                          value={aptTime}
                          onChange={(e) => setAptTime(e.target.value)}
                          className="w-full bg-[#111827] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
 
              <div className="pt-4 border-t border-[#1F2937] flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowPatientModal(false);
                    setEditingPatient(null);
                    setIsViewOnly(false);
                    setBookAppointment(false);
                  }}
                  className="bg-[#020617] hover:bg-[#111827] text-[#94A3B8] hover:text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-[#1F2937] transition-all"
                >
                  {isViewOnly ? 'Close' : 'Cancel'}
                </button>
                {!isViewOnly && (
                  <button 
                    type="submit" 
                    className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#3B82F6]/90 hover:to-[#8B5CF6]/90 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-[#3B82F6]/25 transition-all"
                  >
                    {editingPatient ? 'Save Changes' : 'Add Patient'}
                  </button>
                )}
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
              <h3 className="text-white font-extrabold text-sm">
                {editingAgent ? 'Edit Medical Specialist Profile' : 'Register New Medical Specialist'}
              </h3>
              <button onClick={() => {
                setShowAgentModal(false);
                setEditingAgent(null);
              }} className="text-[#94A3B8] hover:text-white cursor-pointer transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
 
            <form onSubmit={handleSaveAgentModal} className="p-6 space-y-4">
              
              <div>
                <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Specialist Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  placeholder="e.g. Dr. Sarah Jenkins"
                  className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                />
              </div>
 
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Medical Specialty</label>
                  <select 
                    value={newAgent.voice}
                    onChange={(e) => setNewAgent({ ...newAgent, voice: e.target.value })}
                    className="w-full bg-[#020617] border border-[#1F2937] text-xs text-gray-300 rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-[#3B82F6] transition-all"
                  >
                    <option value="General Medicine Specialist">General Medicine Specialist</option>
                    <option value="Pediatrics Expert">Pediatrics Expert</option>
                    <option value="Cardiology Consultant">Cardiology Consultant</option>
                    <option value="Neurology Specialist">Neurology Specialist</option>
                    <option value="Dermatology Expert">Dermatology Expert</option>
                    <option value="Psychiatry & Therapy Consultant">Psychiatry & Therapy Consultant</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Approach & Demeanor</label>
                  <select 
                    value={newAgent.personality}
                    onChange={(e) => setNewAgent({ ...newAgent, personality: e.target.value })}
                    className="w-full bg-[#020617] border border-[#1F2937] text-xs text-gray-300 rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-[#3B82F6] transition-all"
                  >
                    <option value="Compassionate and Professional">Compassionate and Professional</option>
                    <option value="Direct, analytical, and highly detailed">Direct, analytical, and highly detailed</option>
                    <option value="Warm, patient, and family-focused">Warm, patient, and family-focused</option>
                    <option value="Empathetic, reassuring, and comforting">Empathetic, reassuring, and comforting</option>
                  </select>
                </div>
              </div>
 
              <div>
                <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Consultation Flow Sensitivity</label>
                <select 
                  value={newAgent.interruptionSensitivity}
                  onChange={(e) => setNewAgent({ ...newAgent, interruptionSensitivity: e.target.value as any })}
                  className="w-full bg-[#020617] border border-[#1F2937] text-xs text-gray-300 rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-[#3B82F6] transition-all"
                >
                  <option value="Low">Low - Highly focused, thorough answers</option>
                  <option value="Medium">Medium - Standard natural flow</option>
                  <option value="High">High - Instant real-time adaptive response</option>
                </select>
              </div>
 
              <div>
                <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Clinical Welcoming Statement</label>
                <textarea 
                  rows={2}
                  required
                  value={newAgent.greetingMessage}
                  onChange={(e) => setNewAgent({ ...newAgent, greetingMessage: e.target.value })}
                  placeholder="e.g. Hello, I am Dr. Jenkins. How can I assist you with your health symptoms or questions today?"
                  className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                />
              </div>
 
              <div>
                <label className="text-[10px] text-[#94A3B8] uppercase font-mono block mb-1">Specialized Expert AI Instructions (System Prompt)</label>
                <textarea 
                  rows={3}
                  required
                  value={newAgent.systemPrompt}
                  onChange={(e) => setNewAgent({ ...newAgent, systemPrompt: e.target.value })}
                  placeholder="e.g. You are a diagnostic general practitioner. Provide clean clinical insights, recommend next steps, and warn if red flag symptoms are mentioned."
                  className="w-full bg-[#020617] border border-[#1F2937] focus:border-[#3B82F6] text-xs text-white rounded-xl px-3 py-2 outline-none transition-all"
                />
              </div>
 
              <div className="pt-4 border-t border-[#1F2937] flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAgentModal(false);
                    setEditingAgent(null);
                  }}
                  className="bg-[#020617] hover:bg-[#111827] text-[#94A3B8] hover:text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-[#1F2937] transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-red-500 to-[#3B82F6] hover:from-red-600 hover:to-[#3B82F6]/90 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-red-500/10 transition-all"
                >
                  {editingAgent ? 'Save Profile Changes' : 'Register Specialist'}
                </button>
              </div>
 
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT SERVICE MODAL */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-xl shadow-2xl relative overflow-hidden animate-zoomIn">
            
            <div className="bg-[#020617] px-5 py-4 border-b border-[#1F2937] flex items-center justify-between">
              <h3 className="text-white font-extrabold text-sm">{editingService ? 'Edit Service' : 'Add Service'}</h3>
              <button 
                onClick={() => {
                  setShowServiceModal(false);
                  setEditingService(null);
                  setNewService({
                    name: '', description: '', durationMinutes: 60, priceType: 'Fixed Price', price: 49.99, isActive: true
                  });
                }} 
                className="text-[#94A3B8] hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
 
            <form onSubmit={handleSaveService} className="p-6 space-y-4">
              
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
                  onClick={() => {
                    setShowServiceModal(false);
                    setEditingService(null);
                    setNewService({
                      name: '', description: '', durationMinutes: 60, priceType: 'Fixed Price', price: 49.99, isActive: true
                    });
                  }}
                  className="bg-[#020617] hover:bg-[#111827] text-[#94A3B8] hover:text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-[#1F2937] transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#3B82F6]/90 hover:to-[#8B5CF6]/90 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-[#3B82F6]/25 transition-all"
                >
                  {editingService ? 'Save Changes' : 'Add Service'}
                </button>
              </div>
 
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT FAQ MODAL */}
      {showFaqModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-xl shadow-2xl relative overflow-hidden animate-zoomIn">
            
            <div className="bg-[#020617] px-5 py-4 border-b border-[#1F2937] flex items-center justify-between">
              <h3 className="text-white font-extrabold text-sm">{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</h3>
              <button 
                onClick={() => {
                  setShowFaqModal(false);
                  setEditingFaq(null);
                  setNewFaq({ question: '', answer: '', category: 'General' });
                }} 
                className="text-[#94A3B8] hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
 
            <form onSubmit={handleSaveFaq} className="p-6 space-y-4">
              
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
                  onClick={() => {
                    setShowFaqModal(false);
                    setEditingFaq(null);
                    setNewFaq({ question: '', answer: '', category: 'General' });
                  }}
                  className="bg-[#020617] hover:bg-[#111827] text-[#94A3B8] hover:text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-[#1F2937] transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#3B82F6]/90 hover:to-[#8B5CF6]/90 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-[#3B82F6]/25 transition-all"
                >
                  {editingFaq ? 'Save Changes' : 'Add FAQ'}
                </button>
              </div>
 
            </form>
          </div>
        </div>
      )}

      {/* VIEW FAQ DETAILS MODAL */}
      {viewingFaq && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-xl shadow-2xl relative overflow-hidden animate-zoomIn">
            
            <div className="bg-[#020617] px-5 py-4 border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-[#111827] text-[9px] font-bold font-mono text-[#3B82F6] px-2 py-0.5 rounded border border-[#1F2937] uppercase tracking-wider">
                  {viewingFaq.category}
                </span>
                <h3 className="text-white font-extrabold text-sm">FAQ Details</h3>
              </div>
              <button onClick={() => setViewingFaq(null)} className="text-[#94A3B8] hover:text-white cursor-pointer transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <h4 className="text-[10px] text-[#617496] uppercase font-mono font-bold tracking-wider">Question</h4>
                <p className="text-sm font-bold text-white leading-relaxed">{viewingFaq.question}</p>
              </div>

              <div className="space-y-2 border-t border-[#1F2937]/50 pt-4">
                <h4 className="text-[10px] text-[#617496] uppercase font-mono font-bold tracking-wider">Answer</h4>
                <p className="text-xs text-[#94A3B8] leading-relaxed whitespace-pre-wrap">{viewingFaq.answer}</p>
              </div>
              
              <div className="pt-4 border-t border-[#1F2937] flex items-center justify-end">
                <button 
                  type="button" 
                  onClick={() => setViewingFaq(null)}
                  className="bg-[#020617] hover:bg-[#111827] text-[#94A3B8] hover:text-white px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer border border-[#1F2937] transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW SERVICE DETAILS MODAL */}
      {viewingService && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-xl shadow-2xl relative overflow-hidden animate-zoomIn">
            
            <div className="bg-[#020617] px-5 py-4 border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-[#111827] text-[9px] font-bold font-mono text-[#3B82F6] px-2 py-0.5 rounded border border-[#1F2937] uppercase tracking-wider">
                  {viewingService.priceType}
                </span>
                <h3 className="text-white font-extrabold text-sm">Service Details</h3>
              </div>
              <button onClick={() => setViewingService(null)} className="text-[#94A3B8] hover:text-white cursor-pointer transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <h4 className="text-[10px] text-[#617496] uppercase font-mono font-bold tracking-wider">Service Name</h4>
                <p className="text-sm font-bold text-white leading-relaxed">{viewingService.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[#1F2937]/50 pt-4">
                <div className="space-y-1">
                  <h4 className="text-[10px] text-[#617496] uppercase font-mono font-bold tracking-wider">Duration</h4>
                  <p className="text-xs text-[#94A3B8] font-semibold">{viewingService.durationMinutes} minutes</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] text-[#617496] uppercase font-mono font-bold tracking-wider">Price</h4>
                  <p className="text-sm text-[#3B82F6] font-mono font-extrabold">${viewingService.price}</p>
                </div>
              </div>

              <div className="space-y-2 border-t border-[#1F2937]/50 pt-4">
                <h4 className="text-[10px] text-[#617496] uppercase font-mono font-bold tracking-wider">Description</h4>
                <p className="text-xs text-[#94A3B8] leading-relaxed whitespace-pre-wrap">{viewingService.description || 'No description provided.'}</p>
              </div>
              
              <div className="pt-4 border-t border-[#1F2937] flex items-center justify-end">
                <button 
                  type="button" 
                  onClick={() => setViewingService(null)}
                  className="bg-[#020617] hover:bg-[#111827] text-[#94A3B8] hover:text-white px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer border border-[#1F2937] transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW APPOINTMENT DETAILS MODAL */}
      {viewingAppointment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-xl shadow-2xl relative overflow-hidden animate-zoomIn">
            
            <div className="bg-[#020617] px-5 py-4 border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                  viewingAppointment.status === 'confirmed' ? 'text-[#3B82F6] border-[#3B82F6]/40 bg-[#3B82F6]/5' :
                  viewingAppointment.status === 'completed' ? 'text-emerald-400 border-emerald-800/40 bg-emerald-950/5' :
                  'text-[#94A3B8] border-[#1F2937] bg-slate-900/10'
                }`}>
                  {viewingAppointment.status}
                </span>
                <h3 className="text-white font-extrabold text-sm">Appointment Details</h3>
              </div>
              <button onClick={() => setViewingAppointment(null)} className="text-[#94A3B8] hover:text-white cursor-pointer transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="text-[10px] text-[#617496] uppercase font-mono font-bold tracking-wider">Customer Name</h4>
                  <p className="text-sm font-bold text-white leading-relaxed">{viewingAppointment.customerName}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] text-[#617496] uppercase font-mono font-bold tracking-wider">Phone Number</h4>
                  <p className="text-xs text-[#94A3B8] font-mono font-semibold">{viewingAppointment.phoneNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[#1F2937]/50 pt-4">
                <div className="space-y-1">
                  <h4 className="text-[10px] text-[#617496] uppercase font-mono font-bold tracking-wider">Vehicle Details</h4>
                  <p className="text-xs text-[#94A3B8] font-semibold">{viewingAppointment.vehicleYear} {viewingAppointment.vehicleMake} {viewingAppointment.vehicleModel}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] text-[#617496] uppercase font-mono font-bold tracking-wider">Service</h4>
                  <p className="text-xs text-white font-bold bg-[#020617] border border-[#1F2937] px-2.5 py-1 rounded-lg inline-block">
                    {services.find(s => s.id === viewingAppointment.serviceId)?.name || 'Oil Change'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[#1F2937]/50 pt-4">
                <div className="space-y-1">
                  <h4 className="text-[10px] text-[#617496] uppercase font-mono font-bold tracking-wider">Scheduled Time</h4>
                  <p className="text-xs text-[#94A3B8] font-semibold">{viewingAppointment.scheduledAt}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] text-[#617496] uppercase font-mono font-bold tracking-wider">Status</h4>
                  <span className="text-xs text-[#94A3B8] font-semibold capitalize">{viewingAppointment.status}</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-[#1F2937]/50 pt-4">
                <h4 className="text-[10px] text-[#617496] uppercase font-mono font-bold tracking-wider">Appointment Notes</h4>
                <p className="text-xs text-[#94A3B8] leading-relaxed whitespace-pre-wrap">{viewingAppointment.notes || 'No notes provided.'}</p>
              </div>
              
              <div className="pt-4 border-t border-[#1F2937] flex items-center justify-end">
                <button 
                  type="button" 
                  onClick={() => setViewingAppointment(null)}
                  className="bg-[#020617] hover:bg-[#111827] text-[#94A3B8] hover:text-white px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer border border-[#1F2937] transition-all"
                >
                  Close
                </button>
              </div>
            </div>
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
