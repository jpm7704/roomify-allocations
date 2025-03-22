
import { Person } from '@/components/PersonCard';

export interface AttendeeFormData {
  name: string;
  email: string;
  phone: string;
  department: string;
  homeChurch: string;
  specialNeeds: string;
}

export interface AttendeeFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (person: Person) => void;
  initialData?: Partial<{
    id: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    homeChurch: string;
    specialNeeds: string;
  }>;
  mode: 'add' | 'edit';
}
