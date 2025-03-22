
import { useNavigate } from 'react-router-dom';
import { Building, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Landing = () => {
  const navigate = useNavigate();
  
  // Create stats based on information
  const stats = [
    { 
      title: 'Room Management', 
      value: 'Efficient', 
      description: 'Track room capacity, occupancy, and details with an intuitive interface',
      change: 'Quick access to room data',
      icon: <Building className="h-5 w-5" />,
      href: '/auth'
    },
    { 
      title: 'People Directory', 
      value: 'Organized', 
      description: 'Maintain a directory of people with their details and current room assignments',
      change: 'Easy attendee management',
      icon: <User className="h-5 w-5" />,
      href: '/auth'
    },
    { 
      title: 'Allocations', 
      value: 'Streamlined', 
      description: 'Easily assign people to rooms and track all current allocations',
      change: 'Optimize your space allocation',
      icon: <Users className="h-5 w-5" />,
      href: '/auth'
    }
  ];

  return (
    <div className="page-container bg-gradient-to-b from-background to-background/80">
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="py-12 md:py-20 flex flex-col items-center text-center">
          <div className="space-y-4 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/4f847240-5664-46f4-879f-80afcc2a9a0f.png" 
                  alt="Roomify Logo" 
                  className="w-10 h-10 brightness-0" 
                />
              </div>
            </div>
            <h1 className="title-text animate-fade-in text-4xl md:text-5xl font-bold">
              Room Allocation <span className="text-primary">Management</span>
            </h1>
            <p className="subtitle-text animate-fade-in opacity-90 max-w-2xl mx-auto text-lg text-muted-foreground">
              Efficiently manage room assignments with our intuitive room allocation system. Track occupancy, manage people, and organize spaces with ease.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mt-8 animate-fade-in">
              <Button
                size="lg"
                className="rounded-md px-6 transition-all duration-300 hover:translate-y-[-2px]"
                onClick={() => navigate('/auth')}
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-md px-6 transition-all duration-300 hover:translate-y-[-2px]"
                onClick={() => navigate('/auth')}
              >
                Login to Dashboard
              </Button>
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="py-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto px-4">
            {stats.map((stat, index) => (
              <Card 
                key={stat.title} 
                className="border overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer hover:border-primary/20 group animate-slide-in"
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
          
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto px-4">
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
        <section className="py-12 md:py-16 max-w-6xl mx-auto px-4">
          <div className="bg-primary/5 rounded-xl p-8 md:p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Start managing your room allocations today with our intuitive system.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                size="lg" 
                className="rounded-md animate-pulse hover:animate-none"
                onClick={() => navigate('/auth')}
              >
                <Building className="mr-2 h-5 w-5" />
                Sign Up Now
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Landing;
