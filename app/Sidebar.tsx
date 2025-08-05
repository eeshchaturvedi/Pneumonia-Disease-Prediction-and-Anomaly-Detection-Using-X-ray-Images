import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, User, Clock, AlertTriangle, CheckCircle, LogOut } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastVisit: string;
  status: 'pending' | 'diagnosed' | 'clear';
}

interface SidebarProps {
  onNewPatient: () => void;
  onSelectPatient: (patient: Patient) => void;
  currentUser: { name: string; email: string };
  onLogout: () => void;
}

export const Sidebar = ({ onNewPatient, onSelectPatient, currentUser, onLogout }: SidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock patient data
  const [patients] = useState<Patient[]>([
    {
      id: '1',
      name: 'John Martinez',
      age: 45,
      gender: 'Male',
      lastVisit: '2024-01-15',
      status: 'diagnosed'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      age: 32,
      gender: 'Female',
      lastVisit: '2024-01-14',
      status: 'clear'
    },
    {
      id: '3',
      name: 'Robert Chen',
      age: 58,
      gender: 'Male',
      lastVisit: '2024-01-13',
      status: 'pending'
    },
    {
      id: '4',
      name: 'Maria Garcia',
      age: 28,
      gender: 'Female',
      lastVisit: '2024-01-12',
      status: 'clear'
    },
    {
      id: '5',
      name: 'David Wilson',
      age: 67,
      gender: 'Male',
      lastVisit: '2024-01-11',
      status: 'diagnosed'
    }
  ]);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: Patient['status']) => {
    switch (status) {
      case 'diagnosed':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'clear':
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: Patient['status']) => {
    switch (status) {
      case 'diagnosed':
        return <Badge variant="destructive" className="text-xs">Pneumonia</Badge>;
      case 'clear':
        return <Badge className="text-xs bg-success hover:bg-success text-success-foreground">Clear</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Pending</Badge>;
    }
  };

  return (
    <div className="w-80 bg-card border-r border-border h-screen flex flex-col shadow-card">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-medical rounded-lg shadow-medical">
            <div className="w-6 h-6 bg-primary-foreground rounded-sm flex items-center justify-center">
              <span className="text-xs font-bold text-primary">N</span>
            </div>
          </div>
          <h1 className="text-xl font-bold bg-gradient-medical bg-clip-text text-transparent">
            NexaThink
          </h1>
        </div>
        
        <Button 
          onClick={onNewPatient}
          className="w-full bg-gradient-medical hover:shadow-hover transition-all duration-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Patient
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patient by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>
      </div>

      {/* Patient List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => onSelectPatient(patient)}
              className="p-4 bg-background/50 rounded-lg border border-border/50 hover:border-primary/30 hover:shadow-sm cursor-pointer transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {patient.name}
                  </span>
                </div>
                {getStatusIcon(patient.status)}
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>{patient.age} years, {patient.gender}</span>
                {getStatusBadge(patient.status)}
              </div>
              
              <div className="text-xs text-muted-foreground">
                Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
        
        {filteredPatients.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No patients found</p>
            <p className="text-xs mt-1">Try adjusting your search</p>
          </div>
        )}
      </ScrollArea>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-border bg-background/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-medical rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-primary-foreground">
              {currentUser.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground">{currentUser.email}</p>
          </div>
        </div>
        
        <Button
          onClick={onLogout}
          variant="outline"
          size="sm"
          className="w-full border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all duration-200"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};