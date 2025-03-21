import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, ChevronRight, UserCircle, Lock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import IndustrySelector, { Industry } from '@/components/IndustrySelector';

// Step type
type OnboardingStep = 'welcome' | 'industry' | 'final';

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);

  const handleIndustrySelect = (industry: Industry) => {
    setSelectedIndustry(industry);
    // Store the selected industry in localStorage
    localStorage.setItem('selectedIndustry', industry);
    setCurrentStep('final');
  };

  const handleGetStarted = () => {
    setCurrentStep('industry');
  };

  const handleCreateAccount = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    navigate('/register');
  };

  const handleLogin = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    navigate('/login');
  };
  
  const handleReservation = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    navigate('/reservations');
  };

  const renderWelcomeStep = () => (
    <div className="max-w-lg mx-auto text-center">
      <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
        <Building className="h-8 w-8 text-primary" />
      </div>
      
      <h1 className="text-4xl font-bold mb-4">Welcome to RoomAlloc</h1>
      
      <p className="text-lg text-muted-foreground mb-8">
        Simplify room allocation management for your organization. 
        Assign people to rooms, track occupancy, and manage accommodations with ease.
      </p>
      
      <Button size="lg" onClick={handleGetStarted} className="px-8">
        Get Started
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );

  const renderIndustryStep = () => (
    <IndustrySelector onSelectIndustry={handleIndustrySelect} />
  );

  const renderFinalStep = () => (
    <div className="max-w-lg mx-auto text-center">
      <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
        <Building className="h-8 w-8 text-primary" />
      </div>
      
      <h1 className="text-3xl font-bold mb-4">
        {selectedIndustry === 'hotel' && 'Optimize Your Hotel'}
        {selectedIndustry === 'farming' && 'Manage Farm Accommodations'}
        {selectedIndustry === 'education' && 'Streamline Student Housing'}
        {selectedIndustry === 'healthcare' && 'Efficient Hospital Room Management'}
        {selectedIndustry === 'general' && 'Ready to Get Started'}
      </h1>
      
      <p className="text-lg text-muted-foreground mb-8">
        {selectedIndustry === 'hotel' && 'Perfect for hotels, lodges and guest houses in Zimbabwe. Integrate with ZTA booking systems and enable EcoCash payments.'}
        {selectedIndustry === 'farming' && 'Designed for seasonal farmworker housing with SMS approvals and contract-based assignments.'}
        {selectedIndustry === 'education' && 'Built for universities like UZ, NUST, MSU and CUT with student portal integration.'}
        {selectedIndustry === 'healthcare' && 'Tailored for hospitals like Parirenyatwa and Mpilo with urgency-based bed allocation.'}
        {selectedIndustry === 'general' && 'Your workspace is set up and ready for room allocation management.'}
      </p>
      
      <div className="grid gap-4 sm:grid-cols-3">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={handleLogin}
          className="gap-2"
        >
          <Lock className="h-4 w-4" />
          Log In
        </Button>
        
        <Button 
          size="lg" 
          onClick={handleCreateAccount}
          className="gap-2"
        >
          <UserCircle className="h-4 w-4" />
          Create Account
        </Button>
        
        <Button 
          variant="secondary"
          size="lg" 
          onClick={handleReservation}
          className="gap-2"
        >
          <Calendar className="h-4 w-4" />
          Make Reservation
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col">
      <header className="p-6">
        <div className="flex items-center gap-2">
          <Building className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">RoomAlloc</span>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          {currentStep === 'welcome' && renderWelcomeStep()}
          {currentStep === 'industry' && renderIndustryStep()}
          {currentStep === 'final' && renderFinalStep()}
        </div>
      </main>
      
      <footer className="p-6 text-center text-sm text-muted-foreground">
        <p>RoomAlloc — Optimized for Zimbabwean industries</p>
      </footer>
    </div>
  );
};

export default Onboarding;
