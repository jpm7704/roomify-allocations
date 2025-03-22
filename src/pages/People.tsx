
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Person } from '@/components/PersonCard';
import AttendeeForm from '@/components/AttendeeForm';
import AttendeeTabs from '@/components/AttendeeTabs';
import TextImportDialog from '@/components/TextImportDialog';
import AttendeeHeader from '@/components/attendee/AttendeeHeader';
import { useAttendeeData } from '@/hooks/useAttendeeData';
import { useAttendeeFilter } from '@/hooks/useAttendeeFilter';

const People = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [currentPerson, setCurrentPerson] = useState<Person | undefined>(undefined);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  
  const { 
    people, 
    loading, 
    fetchData,
    handleDeletePerson, 
    handleAddSuccess,
    handleEditSuccess
  } = useAttendeeData();
  
  const {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredPeople,
    counts
  } = useAttendeeFilter(people);
  
  const handleOpenAddDialog = () => {
    setFormMode('add');
    setCurrentPerson(undefined);
    setIsDialogOpen(true);
  };
  
  const handleEditPerson = (person: Person) => {
    setFormMode('edit');
    setCurrentPerson(person);
    setIsDialogOpen(true);
  };
  
  const handleAssignPerson = (person: Person) => {
    navigate('/allocations');
  };
  
  const handlePersonClick = (person: Person) => {
    toast.info(`Viewing person: ${person.name}`);
  };

  const handleFormSuccess = (person: Person) => {
    if (formMode === 'add') {
      handleAddSuccess(person);
    } else {
      handleEditSuccess(person);
    }
  };

  const handleImportSuccess = () => {
    fetchData();
    toast.success("Attendee data imported successfully");
  };

  return (
    <Layout>
      <div className="page-container">
        <AttendeeHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenAddDialog={handleOpenAddDialog}
          onOpenImportDialog={() => setIsImportOpen(true)}
        />
        
        <AttendeeTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          allPeopleCount={counts.all}
          assignedPeopleCount={counts.assigned}
          unassignedPeopleCount={counts.unassigned}
          loading={loading}
          filteredPeople={filteredPeople}
          searchQuery={searchQuery}
          onEdit={handleEditPerson}
          onDelete={handleDeletePerson}
          onAssign={handleAssignPerson}
          onClick={handlePersonClick}
        />

        <AttendeeForm 
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSuccess={handleFormSuccess}
          initialData={currentPerson}
          mode={formMode}
        />
        
        <TextImportDialog
          isOpen={isImportOpen}
          onOpenChange={setIsImportOpen}
          onSuccess={handleImportSuccess}
        />
      </div>
    </Layout>
  );
};

export default People;
