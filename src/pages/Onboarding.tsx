
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Users, ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const Onboarding = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Room Management',
      description: 'Efficiently manage rooms and track their capacity, building, and other details.',
      icon: <Building className="h-12 w-12 text-primary" />,
    },
    {
      title: 'People Management',
      description: 'Keep track of attendees, their departments, and special requirements.',
      icon: <Users className="h-12 w-12 text-primary" />,
    },
    {
      title: 'Smart Allocations',
      description: 'Easily assign people to rooms with our intelligent allocation system.',
      icon: <ArrowRight className="h-12 w-12 text-primary" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="w-full py-4 px-6 flex justify-between items-center border-b">
        <h1 className="text-2xl font-bold text-foreground">Room Allocator</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-5xl mx-auto w-full">
        {/* Welcome Section */}
        <div className="text-center space-y-4 mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Welcome to <span className="text-primary">Room Allocator</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simplify accommodation management with our intuitive room allocation system.
          </p>
        </div>

        {/* Features Carousel */}
        <Carousel className="w-full max-w-md mb-12">
          <CarouselContent>
            {features.map((feature, index) => (
              <CarouselItem key={index}>
                <Card className="border-none shadow-none">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0" />
          <CarouselNext className="right-0" />
        </Carousel>

        {/* Auth Buttons */}
        <div className="space-y-4 w-full max-w-md animate-slide-in">
          <Button 
            onClick={() => navigate('/login')} 
            className="w-full py-6 text-lg" 
            size="lg"
          >
            <LogIn className="mr-2 h-5 w-5" /> Sign In
          </Button>
          <Button
            onClick={() => navigate('/register')}
            variant="outline"
            className="w-full py-6 text-lg"
            size="lg"
          >
            <UserPlus className="mr-2 h-5 w-5" /> Create Account
          </Button>
          <div className="text-center mt-4">
            <Button 
              variant="link" 
              onClick={() => navigate('/')}
            >
              Continue as Guest
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
