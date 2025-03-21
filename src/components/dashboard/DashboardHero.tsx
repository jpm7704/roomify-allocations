
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const DashboardHero = () => {
  const navigate = useNavigate();
  
  return (
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
  );
};

export default DashboardHero;
