
import { useState, useMemo } from 'react';
import { Person } from '@/components/PersonCard';

export const useAttendeeFilter = (people: Person[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const filteredPeople = useMemo(() => {
    return people.filter(person => {
      const matchesSearch = 
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        person.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.department?.toLowerCase().includes(searchQuery.toLowerCase());
        
      if (activeTab === 'all') return matchesSearch;
      if (activeTab === 'assigned') return matchesSearch && !!person.roomId;
      if (activeTab === 'unassigned') return matchesSearch && !person.roomId;
      
      return matchesSearch;
    });
  }, [people, searchQuery, activeTab]);
  
  const allPeopleCount = people.length;
  const assignedPeopleCount = people.filter(person => !!person.roomId).length;
  const unassignedPeopleCount = people.filter(person => !person.roomId).length;
  
  return {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredPeople,
    counts: {
      all: allPeopleCount,
      assigned: assignedPeopleCount,
      unassigned: unassignedPeopleCount
    }
  };
};
