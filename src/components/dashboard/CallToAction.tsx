
import { Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CallToAction = () => {
  const navigate = useNavigate();
  
  return (
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
            onClick={() => navigate('/allocations')}
          >
            <Building className="mr-2 h-5 w-5" />
            Manage Allocations
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
