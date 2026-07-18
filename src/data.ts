import { Appointment, Conversation, AIAgent, Service, FAQ, WidgetConfig, BusinessProfile, BusinessHours } from './types';

export const INITIAL_SERVICES: Service[] = [];

export const INITIAL_AGENTS: AIAgent[] = [
  {
    id: 'agt-admin',
    name: 'Admin',
    voice: 'General Medicine Expert',
    personality: 'Professional, knowledgeable, and efficient',
    interruptionSensitivity: 'Medium',
    greetingMessage: 'Hello! I am Admin, your AI Clinic Manager. I can help you find services, book appointments, and answer general questions about our clinic. How can I assist you today?',
    systemPrompt: 'You are the Admin AI Clinic Manager. You are professional, knowledgeable, and direct. Help clients find our medical services, answer FAQs about clinical policies, and assist with scheduling appointments. Always remain courteous and prompt.',
    isActive: true,
  }
];

export const INITIAL_FAQS: FAQ[] = [];

export const INITIAL_APPOINTMENTS: Appointment[] = [];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'con-1',
    callerName: 'Daulat Hussain',
    callerPhone: '123456789',
    status: 'completed',
    duration: '1:22',
    sentiment: 'positive',
    appointmentBooked: true,
    startedAt: '25 minutes ago',
    transcript: [
      { sender: 'agent', text: 'Hello! Thank you for calling AutoCare Pro Garage support. How can I help you today?', timestamp: '0:01' },
      { sender: 'user', text: 'Hi, I need to book an oil change for my BMW 3.', timestamp: '0:12' },
      { sender: 'agent', text: 'Sure! I can help you book an oil change. What is the year model of your BMW 3?', timestamp: '0:22' },
      { sender: 'user', text: 'It is a 2019 model.', timestamp: '0:35' },
      { sender: 'agent', text: 'Perfect. We have slots available on May 16 at 3:30 PM. Would that work for you?', timestamp: '0:48' },
      { sender: 'user', text: 'Yes, that slot is perfect. Please book it under Daulat Hussain.', timestamp: '1:02' },
      { sender: 'agent', text: 'I have successfully confirmed your appointment for May 16, 2026 at 3:30 PM. Thank you for booking!', timestamp: '1:20' }
    ]
  },
  {
    id: 'con-2',
    callerName: 'Unknown',
    callerPhone: '987654321',
    status: 'completed',
    duration: '0:56',
    sentiment: 'neutral',
    appointmentBooked: false,
    startedAt: '27 minutes ago',
    transcript: [
      { sender: 'agent', text: 'Hello! Thank you for calling AutoCare Pro Garage support. How can I help you today?', timestamp: '0:01' },
      { sender: 'user', text: 'Hi, do you guys work on weekends?', timestamp: '0:15' },
      { sender: 'agent', text: 'Yes, we are open on Saturday from 9:00 AM to 2:00 PM. We are closed on Sundays.', timestamp: '0:31' },
      { sender: 'user', text: 'Okay, perfect. I will call back to book a session. Thanks.', timestamp: '0:45' },
      { sender: 'agent', text: 'You are welcome! Have a wonderful day!', timestamp: '0:54' }
    ]
  },
  {
    id: 'con-3',
    callerName: 'Balot Hussain',
    callerPhone: '123456789',
    status: 'completed',
    duration: '1:55',
    sentiment: 'positive',
    appointmentBooked: true,
    startedAt: '32 minutes ago',
    transcript: [
      { sender: 'agent', text: 'Hello! Thank you for calling AutoCare Pro Garage support. How can I help you today?', timestamp: '0:01' },
      { sender: 'user', text: 'Hello, I need an oil change for a 2019 BMW A3.', timestamp: '0:18' },
      { sender: 'agent', text: 'I would be happy to help. We have a regular slot available on May 16 at 3:30 PM. Would you like to lock that in?', timestamp: '0:40' },
      { sender: 'user', text: 'Yes, lock it in under Balot Hussain. Phone is 123456789.', timestamp: '1:08' },
      { sender: 'agent', text: 'Great. I have booked your oil change appointment for May 16 at 3:30 PM. Looking forward to seeing you!', timestamp: '1:45' }
    ]
  },
  {
    id: 'con-4',
    callerName: 'Daulat Hussain',
    callerPhone: '123456789',
    status: 'completed',
    duration: '3:00',
    sentiment: 'positive',
    appointmentBooked: true,
    startedAt: 'about 1 hour ago',
    transcript: [
      { sender: 'agent', text: 'Hello! Thank you for calling AutoCare Pro Garage support. How can I help you today?', timestamp: '0:01' },
      { sender: 'user', text: 'Hi, I need my brakes inspected. They make a weird squeaking noise.', timestamp: '0:15' },
      { sender: 'agent', text: 'Oh, brake noise is important. We can do a comprehensive Brake Inspection on May 13 at 4:00 PM. How does that sound?', timestamp: '0:40' },
      { sender: 'user', text: 'That sounds good. Its for a 2019 BMW 3 Series.', timestamp: '1:12' },
      { sender: 'agent', text: 'Excellent, I will book the Brake Inspection for you. Can I confirm your name?', timestamp: '1:40' },
      { sender: 'user', text: 'Yes, it is Daulat Hussain.', timestamp: '2:10' },
      { sender: 'agent', text: 'Perfect, Daulat. Your appointment is scheduled for May 13 at 4:00 PM. See you then!', timestamp: '2:45' }
    ]
  }
];

export const INITIAL_WIDGETS: WidgetConfig[] = [
  {
    id: 'wdg-1',
    name: 'Health Care',
    agentId: 'agt-admin',
    position: 'bottom-right',
    primaryColor: '#22c55e',
    greetingMessage: 'Hello and welcome to CarBot AI. I\'m your AI assistant, here to help with appointments, support, pricing, and general questions.',
    isActive: true,
  },
  {
    id: 'wdg-2',
    name: 'Welcome',
    agentId: 'agt-admin',
    position: 'bottom-left',
    primaryColor: '#22c55e',
    greetingMessage: 'Hello and welcome to CarBot AI. How can we help you?',
    isActive: true,
  }
];

export const INITIAL_PROFILE: BusinessProfile = {
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  website: '',
  timezone: ''
};

export const INITIAL_HOURS: BusinessHours = {
  sunday: { isOpen: false, from: '', to: '' },
  monday: { isOpen: false, from: '', to: '' },
  tuesday: { isOpen: false, from: '', to: '' },
  wednesday: { isOpen: false, from: '', to: '' },
  thursday: { isOpen: false, from: '', to: '' },
  friday: { isOpen: false, from: '', to: '' },
  saturday: { isOpen: false, from: '', to: '' },
};

export const LANDING_REVIEWS = [
  {
    id: 'rev-1',
    stars: 5,
    text: '"Our missed call rate dropped to zero overnight. CarBot handles every inquiry, books appointments, and even upsells service packages. Best investment we made this year."',
    author: 'Mike Thompson',
    role: 'Owner - Premier Auto Repair, Austin TX',
    badge: '0 missed calls',
    avatar: 'MT'
  },
  {
    id: 'rev-2',
    stars: 5,
    text: '"I was skeptical about AI handling customer calls, but the voice quality is incredible. Customers genuinely can\'t tell they\'re talking to a bot. Bookings up 40%."',
    author: 'Sarah Lin',
    role: 'General Manager - Quick Lube Plus, Chicago IL',
    badge: '+40% bookings',
    avatar: 'SL'
  },
  {
    id: 'rev-3',
    stars: 5,
    text: '"ROI in the first week. The AI booked $2,400 in appointments that would have gone to voicemail. It pays for itself ten times over every month."',
    author: 'James Rivera',
    role: 'Co-Owner - Riverside Motors, Miami FL',
    badge: '$2,400 week 1',
    avatar: 'JR'
  },
  {
    id: 'rev-4',
    stars: 5,
    text: '"Setup was surprisingly fast. We had it live on our website in 20 minutes. The dashboard analytics help us understand what customers are calling about."',
    author: 'David Chen',
    role: 'Operations Director - Pacific Auto Group, Seattle WA',
    badge: 'Live in 20 min',
    avatar: 'DC'
  }
];
