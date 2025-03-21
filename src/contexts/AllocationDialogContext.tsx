
import React, { createContext, useContext, useState } from 'react';
import { Person } from '@/components/PersonCard';
import { Room } from '@/components/RoomCard';
import { Allocation } from '@/components/AllocationCard';

interface AllocationDialogContextType {
  // Dialog visibility state
  isAllocationDialogOpen: boolean;
  isRoomDialogOpen: boolean;
  isDetailsDialogOpen: boolean;
  
  // Dialog data
  selectedPerson: Person | null;
  selectedRoom: Room | null;
  selectedPeople: Person[];
  viewedAllocation: Allocation | null;
  multiSelectMode: boolean;
  
  // Dialog actions
  openAllocationDialog: () => void;
  closeAllocationDialog: () => void;
  openRoomDialog: () => void;
  closeRoomDialog: () => void;
  openAllocationDetails: (allocation: Allocation) => void;
  closeAllocationDetails: () => void;
  
  // Selection actions
  setSelectedPerson: (person: Person | null) => void;
  setSelectedRoom: (room: Room | null) => void;
  setSelectedPeople: React.Dispatch<React.SetStateAction<Person[]>>;
  setMultiSelectMode: (enabled: boolean) => void;
  setIsDetailsDialogOpen: (isOpen: boolean) => void;
  setViewedAllocation: React.Dispatch<React.SetStateAction<Allocation | null>>;
}

const AllocationDialogContext = createContext<AllocationDialogContextType | undefined>(undefined);

export const AllocationDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Dialog visibility state
  const [isAllocationDialogOpen, setIsAllocationDialogOpen] = useState(false);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  
  // Dialog data
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedPeople, setSelectedPeople] = useState<Person[]>([]);
  const [viewedAllocation, setViewedAllocation] = useState<Allocation | null>(null);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  
  // Dialog actions
  const openAllocationDialog = () => {
    setSelectedPerson(null);
    setSelectedRoom(null);
    setSelectedPeople([]);
    setIsAllocationDialogOpen(true);
  };
  
  const closeAllocationDialog = () => {
    setIsAllocationDialogOpen(false);
    setSelectedPeople([]);
  };
  
  const openRoomDialog = () => {
    setIsRoomDialogOpen(true);
  };
  
  const closeRoomDialog = () => {
    setIsRoomDialogOpen(false);
  };
  
  const openAllocationDetails = (allocation: Allocation) => {
    setViewedAllocation(allocation);
    setIsDetailsDialogOpen(true);
  };
  
  const closeAllocationDetails = () => {
    setIsDetailsDialogOpen(false);
  };
  
  const value = {
    // Dialog visibility state
    isAllocationDialogOpen,
    isRoomDialogOpen,
    isDetailsDialogOpen,
    
    // Dialog data
    selectedPerson,
    selectedRoom,
    selectedPeople,
    viewedAllocation,
    multiSelectMode,
    
    // Dialog actions
    openAllocationDialog,
    closeAllocationDialog,
    openRoomDialog,
    closeRoomDialog,
    openAllocationDetails,
    closeAllocationDetails,
    
    // Selection actions
    setSelectedPerson,
    setSelectedRoom,
    setSelectedPeople,
    setMultiSelectMode,
    setIsDetailsDialogOpen,
    setViewedAllocation
  };
  
  return (
    <AllocationDialogContext.Provider value={value}>
      {children}
    </AllocationDialogContext.Provider>
  );
};

export const useAllocationDialog = () => {
  const context = useContext(AllocationDialogContext);
  if (context === undefined) {
    throw new Error('useAllocationDialog must be used within an AllocationDialogProvider');
  }
  return context;
};
