
import { Room } from '@/components/RoomCard';

export interface RoomFormInput {
  type: string;
  chaletNumber: string;
  rooms: { 
    roomNumber: string; 
    capacity: number;
    bedType: string;
    bedCount: number;
  }[];
  notes: string;
}
