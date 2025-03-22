
import { useState, useEffect } from 'react';
import { Person } from '@/components/PersonCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useAttendeeData = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) {
      setPeople([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data: peopleData, error: peopleError } = await supabase
        .from('women_attendees')
        .select('*')
        .eq('user_id', user.id);

      if (peopleError) throw peopleError;

      const { data: allocationsData, error: allocationsError } = await supabase
        .from('room_allocations')
        .select(`
          person_id,
          accommodation_rooms(id, name)
        `)
        .eq('user_id', user.id);

      if (allocationsError) throw allocationsError;

      const formattedPeople: Person[] = peopleData.map(person => {
        const allocation = allocationsData.find(a => a.person_id === person.id);
        
        return {
          id: person.id,
          name: person.name,
          email: person.email || '',
          department: person.department || person.home_church || '',
          roomId: allocation ? allocation.accommodation_rooms.id : undefined,
          roomName: allocation ? allocation.accommodation_rooms.name : undefined
        };
      });

      setPeople(formattedPeople);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleDeletePerson = async (personId: string) => {
    if (!user) {
      toast.error("You must be logged in to perform this action");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('women_attendees')
        .delete()
        .eq('id', personId)
        .eq('user_id', user.id);

      if (error) throw error;

      setPeople(people.filter(p => p.id !== personId));
      toast.success(`Person deleted successfully`);
    } catch (error) {
      console.error("Error deleting person:", error);
      toast.error("Failed to delete person");
    }
  };

  const handleAddSuccess = (newPerson: Person) => {
    setPeople([...people, newPerson]);
  };

  const handleEditSuccess = (editedPerson: Person) => {
    setPeople(people.map(p => p.id === editedPerson.id ? editedPerson : p));
  };

  return {
    people,
    loading,
    fetchData,
    handleDeletePerson,
    handleAddSuccess,
    handleEditSuccess
  };
};
