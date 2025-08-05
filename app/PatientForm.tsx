import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, User, Calendar, Users } from 'lucide-react';

interface PatientData {
  name: string;
  age: string;
  gender: string;
}

interface PatientFormProps {
  onSubmit: (data: PatientData) => void;
  onImageUpload: (file: File) => void;
}

export const PatientForm = ({ onSubmit, onImageUpload }: PatientFormProps) => {
  const [formData, setFormData] = useState<PatientData>({
    name: '',
    age: '',
    gender: ''
  });
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.age && formData.gender) {
      onSubmit(formData);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">New Patient Registration</CardTitle>
          <p className="text-muted-foreground">Enter patient details for pneumonia analysis</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Patient Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-background/70"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Age in years"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  className="bg-background/70"
                  required
                  min="1"
                  max="120"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Gender
                </Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger className="bg-background/70">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-medical hover:shadow-hover transition-all duration-300"
              disabled={!formData.name || !formData.age || !formData.gender}
            >
              Continue to X-ray Upload
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* X-ray Upload Section */}
      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-semibold text-foreground">Upload Chest X-ray</CardTitle>
          <p className="text-muted-foreground">Upload a front-view chest X-ray image for analysis</p>
        </CardHeader>
        <CardContent>
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
              dragActive 
                ? 'border-primary bg-primary/5 shadow-medical' 
                : 'border-border hover:border-primary/50 hover:bg-accent/30'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
              </div>
              
              <div>
                <p className="text-lg font-medium text-foreground">
                  Drop your X-ray image here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Supported formats: JPG, PNG, DICOM (Max size: 10MB)
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  Secure Upload
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  HIPAA Compliant
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  AI-Powered
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-accent/30 rounded-lg border border-border/50">
            <h4 className="font-medium text-foreground mb-2">Image Requirements:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Front-view (PA or AP) chest X-ray</li>
              <li>• Clear visibility of lung fields</li>
              <li>• Proper patient positioning</li>
              <li>• Good image quality and contrast</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};