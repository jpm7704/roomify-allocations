
import { Building, User, Users } from 'lucide-react';

const FeatureSection = () => {
  const features = [
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
  ];

  return (
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
        {features.map((feature, index) => (
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
  );
};

export default FeatureSection;
