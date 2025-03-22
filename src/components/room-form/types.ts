
export interface Room {
  roomNumber: string;
  capacity: number;
  bedType: string; // 'single', 'double', 'twin'
  bedCount: number;
}

export interface RoomFormValues {
  type: string;
  chaletNumber: string;
  rooms: Room[];
  notes: string;
}
