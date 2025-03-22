
import { useNavigate } from 'react-router-dom';
import { Building, User, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Fetch rooms data
  const { data: rooms } = useQuery({
    queryKey: ['rooms', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('accommodation_rooms')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Fetch people data
  const { data: people } = useQuery({
    queryKey: ['people', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('women_attendees')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Fetch allocations data
  const { data: allocations } = useQuery({
    queryKey: ['allocations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('room_allocations')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Calculate the stats based on real user data
  const roomCount = rooms?.length || 0;
  const peopleCount = people?.length || 0;
  const allocationsCount = allocations?.length || 0;
  
  // Create stats based on real user data
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
    <Layout>
      <div className="page-container">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your room allocation dashboard</p>
        </div>
        
        {/* Stats Overview */}
        <section className="py-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat, index) => (
              <Card 
                key={stat.title} 
                className={cn(
                  "border overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer",
                  "hover:border-primary/20 group animate-slide-in"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => navigate(stat.href)}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl font-medium transition-colors group-hover:text-primary">
                    {stat.title}
                  </CardTitle>
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    {stat.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-sm text-muted-foreground mt-1">{stat.description}</p>
                  <p className="text-xs font-medium text-primary mt-4">{stat.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        {/* Recent Activity Section */}
        <section className="py-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {user && allocations && allocations.length > 0 ? (
                <div className="space-y-4">
                  {allocations.slice(0, 5).map((allocation, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <div className="p-2 bg-primary/10 rounded-full text-primary">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Room allocation updated</p>
                        <p className="text-xs text-muted-foreground">Room ID: {allocation.room_id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
