
export interface Room {
  roomNumber: string;
  capacity: number;
}

export interface RoomFormValues {
  type: string;
  chaletNumber: string;
  rooms: Room[];
  notes: string;
}
