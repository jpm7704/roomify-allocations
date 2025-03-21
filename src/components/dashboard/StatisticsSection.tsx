
import { Building, User, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import StatCard from './StatCard';

const StatisticsSection = () => {
  // Fetch rooms data
  const { data: rooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accommodation_rooms')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch people data
  const { data: people } = useQuery({
    queryKey: ['people'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('women_attendees')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch allocations data
  const { data: allocations } = useQuery({
    queryKey: ['allocations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('room_allocations')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate the stats based on real data
  const roomCount = rooms?.length || 0;
  const peopleCount = people?.length || 0;
  const allocationsCount = allocations?.length || 0;
  
  // Create stats based on real data
  const stats = [
    { 
      title: 'Total Rooms', 
      value: roomCount.toString(), 
      description: roomCount > 0 ? `With a capacity of ${rooms?.reduce((acc, room) => acc + (room.capacity || 0), 0)} beds` : 'No rooms available',
      change: rooms?.length ? `${rooms.filter(room => room.building).length} buildings` : 'Add rooms to get started',
      icon: <Building className="h-5 w-5" />,
      href: '/rooms'
    },
    { 
      title: 'Total People', 
      value: peopleCount.toString(), 
      description: peopleCount > 0 ? `From ${new Set(people?.map(p => p.department).filter(Boolean)).size || 0} departments` : 'No people registered',
      change: peopleCount > 0 ? `${people?.filter(p => p.special_needs).length || 0} with special needs` : 'Add people to get started',
      icon: <User className="h-5 w-5" />,
      href: '/people'
    },
    { 
      title: 'Current Allocations', 
      value: allocationsCount.toString(), 
      description: allocationsCount > 0 ? `${((allocationsCount / peopleCount) * 100).toFixed(1)}% allocation rate` : 'No allocations yet',
      change: roomCount > 0 ? `${roomCount - allocationsCount} rooms available` : 'Assign rooms to people',
      icon: <Users className="h-5 w-5" />,
      href: '/allocations'
    }
  ];

  return (
    <section className="py-12">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <StatCard 
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            change={stat.change}
            icon={stat.icon}
            href={stat.href}
            index={index}
          />
        ))}
      </div>
    </section>
  );
};

export default StatisticsSection;
