
import { useNavigate } from 'react-router-dom';
import { Building, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const navigate = useNavigate();
  
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
    <Layout>
      <div className="page-container">
        {/* Hero Section */}
        <section className="py-12 md:py-20 flex flex-col items-center text-center">
          <div className="space-y-4 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="title-text animate-fade-in">
              Room Allocation <span className="text-primary">Management</span>
            </h1>
            <p className="subtitle-text animate-fade-in opacity-90 max-w-2xl mx-auto">
              Efficiently manage room assignments with our intuitive room allocation system. Track occupancy, manage people, and organize spaces with ease.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mt-8 animate-fade-in">
              <Button
                size="lg"
                className="rounded-md px-6 transition-all duration-300 hover:translate-y-[-2px]"
                onClick={() => navigate('/allocations')}
              >
                View Allocations
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-md px-6 transition-all duration-300 hover:translate-y-[-2px]"
                onClick={() => navigate('/rooms')}
              >
                Manage Rooms
              </Button>
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="py-12">
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
        
        {/* Features Section */}
        <section className="py-12 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your room allocations effectively
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: 'Room Management',
                description: 'Track room capacity, occupancy, and details with an intuitive interface.',
                icon: <Building className="h-10 w-10" />,
              },
              {
                title: 'People Directory',
                description: 'Maintain a directory of people with their details and current room assignments.',
                icon: <User className="h-10 w-10" />,
              },
              {
                title: 'Allocation Tracking',
                description: 'Easily assign people to rooms and track all current allocations.',
                icon: <Users className="h-10 w-10" />,
              },
            ].map((feature, index) => (
              <div 
                key={feature.title}
                className="flex flex-col items-center text-center p-6 rounded-lg animate-scale-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="p-4 bg-primary/10 rounded-full text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-12 md:py-16">
          <div className="bg-primary/5 rounded-xl p-8 md:p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Start managing your room allocations today with our intuitive system.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                size="lg" 
                className="rounded-md animate-pulse hover:animate-none"
                onClick={() => navigate('/rooms')}
              >
                <Building className="mr-2 h-5 w-5" />
                Manage Rooms
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
