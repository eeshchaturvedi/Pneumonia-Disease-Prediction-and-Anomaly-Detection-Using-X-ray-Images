import { useState } from 'react';
import { LoginDashboard } from '@/components/LoginDashboard';
import { Sidebar } from '@/components/Sidebar';
import { PatientForm } from '@/components/PatientForm';
import { AnalysisResult } from '@/components/AnalysisResult';

interface User {
  name: string;
  email: string;
}

interface PatientData {
  name: string;
  age: string;
  gender: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastVisit: string;
  status: 'pending' | 'diagnosed' | 'clear';
}

type AppState = 'login' | 'dashboard' | 'analysis';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPatient, setCurrentPatient] = useState<PatientData | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setAppState('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPatient(null);
    setUploadedImage(null);
    setAppState('login');
  };

  const handleNewPatient = () => {
    setCurrentPatient(null);
    setUploadedImage(null);
    setAppState('dashboard');
  };

  const handlePatientSubmit = (data: PatientData) => {
    setCurrentPatient(data);
  };

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    if (currentPatient) {
      setAppState('analysis');
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    // Convert selected patient to current patient format
    setCurrentPatient({
      name: patient.name,
      age: patient.age.toString(),
      gender: patient.gender
    });
    setAppState('dashboard');
  };

  if (appState === 'login') {
    return <LoginDashboard onLogin={handleLogin} />;
  }

  if (!currentUser) {
    return <LoginDashboard onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        onNewPatient={handleNewPatient}
        onSelectPatient={handleSelectPatient}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {appState === 'analysis' && currentPatient && uploadedImage ? (
            <AnalysisResult 
              imageFile={uploadedImage}
              patientData={currentPatient}
            />
          ) : (
            <PatientForm 
              onSubmit={handlePatientSubmit}
              onImageUpload={handleImageUpload}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
