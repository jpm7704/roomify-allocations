
import { useState } from 'react';
import { Building, Hotel, Tractor, GraduationCap, Stethoscope, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type Industry = 'hotel' | 'farming' | 'education' | 'healthcare' | 'general' | 'reservation';

interface IndustrySelectorProps {
  onSelectIndustry: (industry: Industry) => void;
}

const IndustrySelector = ({ onSelectIndustry }: IndustrySelectorProps) => {
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);

  const industries = [
    {
      id: 'hotel',
      title: 'Hotels & Lodges',
      description: 'For hotels, lodges, and guest houses in Victoria Falls, Harare, and Bulawayo',
      icon: <Hotel className="h-8 w-8" />,
      features: ['ZTA Booking Integration', 'EcoCash & USD Payments', 'National ID Verification']
    },
    {
      id: 'farming',
      title: 'Farming Sector',
      description: 'For seasonal farmworker housing management',
      icon: <Tractor className="h-8 w-8" />,
      features: ['Contract-based Assignment', 'SMS Room Approvals', 'Occupancy Tracking']
    },
    {
      id: 'education',
      title: 'Universities & Hostels',
      description: 'For universities like UZ, NUST, MSU, and CUT',
      icon: <GraduationCap className="h-8 w-8" />,
      features: ['Student Portal Integration', 'Roommate Selection', 'EcoCash Fee Reminders']
    },
    {
      id: 'healthcare',
      title: 'Hospitals & Clinics',
      description: 'For healthcare facilities like Parirenyatwa and Mpilo',
      icon: <Stethoscope className="h-8 w-8" />,
      features: ['Urgency-based Allocation', 'Ministry of Health Integration', 'Mobile Room Reassignment']
    },
    {
      id: 'general',
      title: 'General Use',
      description: 'Standard room allocation for any organization',
      icon: <Building className="h-8 w-8" />,
      features: ['Basic Room Management', 'People Management', 'Room Allocation']
    },
    {
      id: 'reservation',
      title: 'SDA Women\'s Ministry Camp Meeting',
      description: 'Register for the upcoming event (August 5-7, 2023)',
      icon: <Calendar className="h-8 w-8" />,
      features: ['Harare City Centre Church', 'Women\'s Ministry Event', 'Quick registration - no account needed']
    }
  ];

  const handleSelect = (industry: Industry) => {
    setSelectedIndustry(industry);
  };

  const handleContinue = () => {
    if (selectedIndustry) {
      onSelectIndustry(selectedIndustry);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Select Your Industry</h2>
        <p className="text-muted-foreground mt-2">
          We'll customize your experience based on your industry's specific needs
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {industries.map((industry) => (
          <Card 
            key={industry.id}
            className={cn(
              "cursor-pointer hover:border-primary/50 transition-all",
              selectedIndustry === industry.id && "border-primary ring-1 ring-primary"
            )}
            onClick={() => handleSelect(industry.id as Industry)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  {industry.icon}
                </div>
                {selectedIndustry === industry.id && (
                  <div className="w-4 h-4 rounded-full bg-primary"></div>
                )}
              </div>
              <CardTitle className="mt-4">{industry.title}</CardTitle>
              <CardDescription>{industry.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {industry.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Button 
          size="lg" 
          onClick={handleContinue} 
          disabled={!selectedIndustry}
          className="px-8"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default IndustrySelector;
