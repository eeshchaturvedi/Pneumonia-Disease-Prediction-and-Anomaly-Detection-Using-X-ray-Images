import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Brain, Download, Eye, Activity } from 'lucide-react';
import { ChatInterface } from './ChatInterface';

interface AnalysisResultProps {
  imageFile: File;
  patientData: {
    name: string;
    age: string;
    gender: string;
  };
}

interface AnalysisData {
  hasPneumonia: boolean;
  confidence: number;
  affectedAreas: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  severity: 'mild' | 'moderate' | 'severe';
  recommendations: string[];
}

export const AnalysisResult = ({ imageFile, patientData }: AnalysisResultProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  // Simulated AI analysis results
  const [analysisResult] = useState<AnalysisData>({
    hasPneumonia: true, // This would come from actual AI model
    confidence: 0.87,
    affectedAreas: [
      { x: 120, y: 80, width: 60, height: 80 },
      { x: 200, y: 120, width: 40, height: 50 }
    ],
    severity: 'moderate',
    recommendations: [
      'Immediate antibiotic treatment recommended',
      'Follow-up chest X-ray in 7-10 days',
      'Monitor oxygen saturation levels',
      'Complete blood count and blood cultures advised'
    ]
  });

  useEffect(() => {
    if (analysisResult.hasPneumonia) {
      setShowChat(true);
    }
  }, [analysisResult.hasPneumonia]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageFile) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size
      canvas.width = 400;
      canvas.height = 400;
      
      // Draw the original image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Draw analysis overlays
      if (analysisResult.hasPneumonia) {
        // Draw red rectangles for infected areas
        ctx.strokeStyle = '#ef4444';
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.lineWidth = 2;
        
        analysisResult.affectedAreas.forEach(area => {
          ctx.fillRect(area.x, area.y, area.width, area.height);
          ctx.strokeRect(area.x, area.y, area.width, area.height);
        });
      } else {
        // Draw green overlay for clear lungs
        ctx.strokeStyle = '#22c55e';
        ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
        ctx.lineWidth = 2;
        ctx.fillRect(50, 50, 300, 300);
        ctx.strokeRect(50, 50, 300, 300);
      }
      
      setImageLoaded(true);
    };
    
    img.src = URL.createObjectURL(imageFile);
    
    return () => {
      URL.revokeObjectURL(img.src);
    };
  }, [imageFile, analysisResult]);

  const downloadReport = () => {
    // Create a downloadable report
    const reportData = {
      patient: patientData,
      analysis: analysisResult,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pneumonia-analysis-${patientData.name.replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Analysis Header */}
      <Card className="shadow-medical bg-gradient-card border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Analysis Results - {patientData.name}
              </CardTitle>
              <p className="text-muted-foreground">
                {patientData.age} years old, {patientData.gender}
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                analysisResult.hasPneumonia 
                  ? 'bg-destructive/10 text-destructive' 
                  : 'bg-success/10 text-success'
              }`}>
                {analysisResult.hasPneumonia ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
                <span className="font-semibold">
                  {analysisResult.hasPneumonia ? 'Pneumonia Detected' : 'No Pneumonia Detected'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Confidence: {(analysisResult.confidence * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Image Analysis */}
        <Card className="shadow-card bg-gradient-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              X-ray Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto"
                  style={{ maxHeight: '400px' }}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-pulse-medical text-primary">
                      <Activity className="h-8 w-8" />
                    </div>
                  </div>
                )}
              </div>
              
              {analysisResult.hasPneumonia && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Affected Areas:</p>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-destructive/20 border-2 border-destructive rounded"></div>
                    <span className="text-sm text-muted-foreground">
                      {analysisResult.affectedAreas.length} infected region(s) highlighted
                    </span>
                  </div>
                  <Badge variant={analysisResult.severity === 'severe' ? 'destructive' : 'secondary'}>
                    {analysisResult.severity} severity
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Explainable AI */}
        <Card className="shadow-card bg-gradient-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI-Detected Anomalies (Explainable AI)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="heatmap" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
                <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="heatmap" className="space-y-4">
                <div className="bg-black rounded-lg p-4">
                  <div className="relative h-48 bg-gradient-to-br from-blue-900 via-red-600 to-yellow-500 rounded opacity-70">
                    <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                      AI Attention Heatmap
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Red areas indicate regions where the AI detected anomalies. Yellow areas show moderate attention, 
                  while blue areas appear normal.
                </p>
              </TabsContent>
              
              <TabsContent value="analysis" className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-accent/30 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Key Findings:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Opacity in right lower lobe</li>
                      <li>• Air bronchograms present</li>
                      <li>• No pleural effusion detected</li>
                      <li>• Heart size within normal limits</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">AI Confidence Metrics:</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Pneumonia Detection</span>
                        <span className="font-medium">{(analysisResult.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Anatomical Recognition</span>
                        <span className="font-medium">94.2%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Image Quality Assessment</span>
                        <span className="font-medium">91.8%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Clinical Recommendations
            </CardTitle>
            <Button onClick={downloadReport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {analysisResult.recommendations.map((recommendation, index) => (
              <div key={index} className="p-3 bg-accent/30 rounded-lg border border-border/50">
                <p className="text-sm text-foreground">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      {showChat && (
        <ChatInterface 
          patientData={patientData}
          hasPneumonia={analysisResult.hasPneumonia}
        />
      )}
    </div>
  );
};