
import Layout from '@/components/Layout';
import DashboardHero from '@/components/dashboard/DashboardHero';
import StatisticsSection from '@/components/dashboard/StatisticsSection';
import FeatureSection from '@/components/dashboard/FeatureSection';
import CallToAction from '@/components/dashboard/CallToAction';
// import ClearDataButton from '@/components/dashboard/ClearDataButton';

const Index = () => {
  return (
    <Layout>
      <div className="page-container">
        {/* Hero Section */}
        <DashboardHero />
        
        {/* Stats Section */}
        <StatisticsSection />
        
        {/* Features Section */}
        <FeatureSection />
        
        {/* CTA Section */}
        <CallToAction />
        
        {/* Uncomment to add clear data button */}
        {/* <div className="flex justify-center">
          <ClearDataButton />
        </div> */}
      </div>
    </Layout>
  );
};

export default Index;
