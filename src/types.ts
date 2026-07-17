export interface Appointment {
  id: string;
  customerName: string;
  phoneNumber: string;
  vehicleYear: string;
  vehicleMake: string;
  vehicleModel: string;
  serviceId: string;
  scheduledAt: string; // Date string format
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Conversation {
  id: string;
  callerName: string;
  callerPhone: string;
  status: 'completed' | 'in_progress' | 'failed';
  duration: string; // MM:SS format
  sentiment: 'positive' | 'neutral' | 'negative';
  appointmentBooked: boolean;
  startedAt: string; // Date or relative text
  transcript: { sender: 'agent' | 'user'; text: string; timestamp: string }[];
}

export interface AIAgent {
  id: string;
  name: string;
  voice: string;
  personality: string;
  interruptionSensitivity: 'Low' | 'Medium' | 'High';
  greetingMessage: string;
  systemPrompt: string;
  isActive: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceType: 'Fixed Price' | 'Variable Price' | 'Starting From';
  price: number;
  isActive: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface WidgetConfig {
  id: string;
  name: string;
  agentId: string;
  position: 'bottom-right' | 'bottom-left';
  primaryColor: string;
  greetingMessage: string;
  isActive: boolean;
}

export interface BusinessProfile {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  website: string;
  timezone: string;
}

export interface DayHours {
  isOpen: boolean;
  from: string;
  to: string;
}

export interface BusinessHours {
  sunday: DayHours;
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
}
