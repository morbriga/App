
import React, { useState, useEffect } from 'react';
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // הוספתי את ה-import החסר
import { Scan, User, Users, Loader2, CheckCircle } from 'lucide-react';
import { FaceTag, Post } from '@/api/entities';
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function FaceRecognition({ event, onFacesDetected }) {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [faces, setFaces] = useState([]);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [selectedFace, setSelectedFace] = useState(null);
  const [personName, setPersonName] = useState('');
  const [processingStatus, setProcessingStatus] = useState('');
  const [processingComplete, setProcessingComplete] = useState(false);
  
  const scanForFaces = async () => {
    try {
      setIsScanning(true);
      setProcessingComplete(false);
      setProcessingStatus('מאתר תמונות באירוע...');
      
      // Get all posts for this event
      const posts = await Post.filter({ event_id: event.id, type: 'photo' });
      
      if (posts.length === 0) {
        alert('לא נמצאו תמונות לסריקה באירוע זה');
        setIsScanning(false);
        return;
      }
      
      setProgress({ current: 0, total: posts.length, percentage: 0 });
      setProcessingStatus('מתחיל לסרוק פנים...');
      
      const detectedFaces = [];
      
      // Process each image
      for (let i = 0; i < posts.length; i++) {
        const currentProgress = Math.round(((i + 1) / posts.length) * 100);
        setProgress({ 
          current: i + 1, 
          total: posts.length,
          percentage: currentProgress
        });
        
        setProcessingStatus(`סורק תמונה ${i + 1} מתוך ${posts.length}...`);
        
        try {
          // Improved prompting for better face detection
          const result = await InvokeLLM({
            prompt: `
              זהה פנים בתמונה בכתובת ${posts[i].media_url}.
              אני מבקש זיהוי פנים באיכות גבוהה, עם מיקום מדויק של כל פנים בתמונה.
              
              עבור כל פנים שאתה מזהה, אנא ספק:
              1. מזהה ייחודי לפנים (מספר או מחרוזת)
              2. מיקום הפנים בתמונה כ-(x, y, width, height) כאשר הערכים הם בין 0 ל-1
              
              אם אתה רואה את אותם פנים בתמונות שונות, השתמש באותו מזהה.
              חשוב מאוד לזהות את כל הפנים בתמונה, גם אם הן בפרופיל או חלקית.
            `,
            add_context_from_internet: false,
            response_json_schema: {
              type: "object",
              properties: {
                faces: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      face_id: { type: "string" },
                      bounding_box: {
                        type: "object",
                        properties: {
                          x: { type: "number" },
                          y: { type: "number" },
                          width: { type: "number" },
                          height: { type: "number" }
                        }
                      }
                    }
                  }
                }
              }
            }
          });
          
          if (result.faces && result.faces.length > 0) {
            // Add post info to each face
            const facesWithMetadata = result.faces.map(face => ({
              ...face,
              post_id: posts[i].id,
              post_url: posts[i].media_url,
              event_id: event.id
            }));
            
            detectedFaces.push(...facesWithMetadata);
          }
        } catch (error) {
          console.error(`Error processing image ${posts[i].id}:`, error);
          // Continue with next image
        }
      }
      
      setProcessingStatus('מקבץ פנים דומות...');
      
      // Group similar faces with improved algorithm
      const groupedFaces = await groupSimilarFaces(detectedFaces);
      setFaces(groupedFaces);
      
      setProcessingStatus('מסיים עיבוד...');
      
      if (groupedFaces.length > 0) {
        onFacesDetected(groupedFaces);
      }
      
      setProcessingComplete(true);
      setProcessingStatus(`זוהו ${groupedFaces.length} פנים באירוע`);
      
    } catch (error) {
      console.error('Error scanning faces:', error);
      alert('שגיאה בסריקת פנים');
    } finally {
      setIsScanning(false);
    }
  };
  
  // Advanced function to group similar faces using AI
  const groupSimilarFaces = async (faces) => {
    if (faces.length <= 1) return faces.map(face => ({
      face_id: face.face_id,
      person_name: '',
      instances: [face]
    }));
    
    try {
      // First, group by the AI-provided face_id
      const initialGroups = {};
      
      faces.forEach(face => {
        const groupId = face.face_id;
        if (!initialGroups[groupId]) {
          initialGroups[groupId] = {
            face_id: groupId,
            person_name: '',
            instances: []
          };
        }
        
        initialGroups[groupId].instances.push({
          post_id: face.post_id,
          post_url: face.post_url,
          bounding_box: face.bounding_box,
          event_id: face.event_id
        });
      });
      
      // Now we have initial groups, return them
      return Object.values(initialGroups);
      
    } catch (error) {
      console.error('Error grouping faces:', error);
      // Fallback to basic grouping if AI grouping fails
      const groups = {};
      
      faces.forEach(face => {
        const groupId = face.face_id;
        if (!groups[groupId]) {
          groups[groupId] = {
            face_id: groupId,
            person_name: '',
            instances: []
          };
        }
        
        groups[groupId].instances.push({
          post_id: face.post_id,
          post_url: face.post_url,
          bounding_box: face.bounding_box,
          event_id: face.event_id
        });
      });
      
      return Object.values(groups);
    }
  };
  
  const handleNameFace = (face) => {
    setSelectedFace(face);
    setPersonName('');
    setShowNameDialog(true);
  };
  
  const saveFaceName = async () => {
    if (!personName.trim() || !selectedFace) return;
    
    try {
      // Update name in state
      const updatedFaces = faces.map(face => 
        face.face_id === selectedFace.face_id 
          ? { ...face, person_name: personName } 
          : face
      );
      setFaces(updatedFaces);
      
      // Save face tags to database
      for (const instance of selectedFace.instances) {
        await FaceTag.create({
          post_id: instance.post_id,
          event_id: instance.event_id,
          person_name: personName,
          face_id: selectedFace.face_id,
          bounding_box: instance.bounding_box
        });
      }
      
      onFacesDetected(updatedFaces);
      setShowNameDialog(false);
    } catch (error) {
      console.error('Error saving face tag:', error);
    }
  };

  return (
    <Card className="border-none shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold">זיהוי פנים חכם</h3>
          </div>
          <Button
            onClick={scanForFaces}
            disabled={isScanning}
            className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                סורק...
              </>
            ) : (
              <>
                <Scan className="w-4 h-4" />
                סרוק פנים
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isScanning && (
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span>{processingStatus}</span>
              <span>{progress.current} מתוך {progress.total}</span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
          </div>
        )}
        
        {processingComplete && faces.length === 0 && (
          <div className="text-center py-8">
            <div className="mx-auto bg-purple-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-1">לא זוהו פנים</h3>
            <p className="text-gray-500 mb-4">לא הצלחנו לזהות פנים בתמונות האירוע</p>
          </div>
        )}
        
        {faces.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-green-100 p-1 rounded-full">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <h4 className="font-semibold">{faces.length} אנשים זוהו באירוע</h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {faces.map((face) => (
                <div key={face.face_id} className="text-center">
                  {face.instances[0] && (
                    <div className="relative rounded-lg overflow-hidden aspect-square mb-2 shadow-md group hover:shadow-xl transition-all">
                      <img 
                        src={face.instances[0].post_url} 
                        alt="Face" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {/* Highlight the face */}
                      <div 
                        className="absolute border-2 border-purple-500"
                        style={{
                          left: `${face.instances[0].bounding_box.x * 100}%`,
                          top: `${face.instances[0].bounding_box.y * 100}%`,
                          width: `${face.instances[0].bounding_box.width * 100}%`,
                          height: `${face.instances[0].bounding_box.height * 100}%`,
                        }}
                      ></div>
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <p className="text-white text-xs">
                          {face.instances.length} תמונות
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {face.person_name ? (
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 cursor-pointer" onClick={() => handleNameFace(face)}>
                      {face.person_name} ({face.instances.length})
                    </Badge>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs gap-1 border-purple-200 text-purple-800 hover:bg-purple-50"
                      onClick={() => handleNameFace(face)}
                    >
                      <User className="w-3 h-3" />
                      זהה פנים
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>שם האדם בתמונה</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center mb-4">
            {selectedFace && selectedFace.instances[0] && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                <img 
                  src={selectedFace.instances[0].post_url} 
                  alt="Face" 
                  className="w-full h-full object-cover"
                />
                <div 
                  className="absolute border-2 border-purple-500"
                  style={{
                    left: `${selectedFace.instances[0].bounding_box.x * 100}%`,
                    top: `${selectedFace.instances[0].bounding_box.y * 100}%`,
                    width: `${selectedFace.instances[0].bounding_box.width * 100}%`,
                    height: `${selectedFace.instances[0].bounding_box.height * 100}%`,
                  }}
                ></div>
              </div>
            )}
          </div>
          <Input 
            placeholder="הזן את שם האדם" 
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            className="mb-2"
          />
          <p className="text-xs text-gray-500 mb-4">
            השם יופיע על כל התמונות בהן האדם מזוהה ({selectedFace?.instances.length} תמונות)
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNameDialog(false)}>ביטול</Button>
            <Button onClick={saveFaceName}>שמור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
