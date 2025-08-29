"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Loader2, Image, Video, FileText, Hash, Lightbulb, Download, Copy } from "lucide-react";

interface GeneratedContent {
  post?: string;
  hashtags?: string;
  imageIdeas?: string;
  generatedImage?: string;
  generatedVideo?: string;
}

export function AIContentGenerator() {
  const [businessType, setBusinessType] = useState("");
  const [postTopic, setPostTopic] = useState("");
  const [content, setContent] = useState<GeneratedContent>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("post");

  const getCurrentUserId = () => {
    // Implement based on your auth system (Clerk, etc.)
    return "user_placeholder"; // Replace with actual implementation
  };

  const handleGenerate = async (type: 'post' | 'hashtags' | 'imageIdeas' | 'image' | 'video') => {
    if (!businessType || !postTopic) {
      alert('Bitte füllen Sie Geschäftstyp und Thema aus.');
      return;
    }

    setLoading(prev => ({ ...prev, [type]: true }));

    try {
      let endpoint = '';
      let payload: any = {
        userId: getCurrentUserId(),
        businessType,
        postTopic
      };

      switch (type) {
        case 'post':
          endpoint = '/api/generate-post';
          payload.prompt = createPostPrompt(businessType, postTopic);
          break;
        case 'hashtags':
          endpoint = '/api/generate-hashtags';
          payload.postContent = content.post;
          break;
        case 'imageIdeas':
          endpoint = '/api/generate-image-ideas';
          payload.postContent = content.post;
          break;
        case 'image':
          endpoint = '/api/generate-image';
          payload.prompt = `Erstelle ein professionelles Social Media Bild für: ${postTopic}`;
          payload.postContent = content.post;
          break;
        case 'video':
          endpoint = '/api/generate-video';
          payload.prompt = `Erstelle ein kurzes, ansprechendes Social Media Video für: ${postTopic}`;
          payload.postContent = content.post;
          payload.videoType = 'text-to-video';
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        setContent(prev => ({
          ...prev,
          [type === 'post' ? 'post' : 
           type === 'hashtags' ? 'hashtags' :
           type === 'imageIdeas' ? 'imageIdeas' :
           type === 'image' ? 'generatedImage' :
           'generatedVideo']: result.content || result.imageUrl || result.videoUrl
        }));
      } else {
        alert(result.error || 'Ein Fehler ist aufgetreten');
      }
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const createPostPrompt = (businessType: string, postTopic: string) => {
    return `Du bist ein Social-Media-Experte für lokale Geschäfte in der DACH-Region. 

WICHTIG: Analysiere zuerst den Geschäftstyp "${businessType}" und das Thema "${postTopic}" um den passenden Tonfall zu bestimmen:

TONALITÄT-ANALYSE:
- Für Cafés, Restaurants, Bäckereien: Locker, herzlich, einladend
- Für Anwaltskanzleien, Steuerberater, Ärzte: Professionell, vertrauensvoll, seriös  
- Für Friseure, Beauty-Salons, Mode: Trendig, inspirierend, lifestyle-orientiert
- Für Handwerker, Autowerkstätten: Bodenständig, kompetent, zuverlässig
- Für Fitness-Studios, Yoga: Motivierend, energisch, gesundheitsbewusst

Erstelle einen authentischen Social-Media-Post (4-5 Sätze) der GENAU zum Geschäftstyp passt. Der Post soll so klingen, als hätte ihn der Geschäftsinhaber selbst geschrieben.

Geschäftstyp: ${businessType}
Thema: "${postTopic}"`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>AI Content Generator</CardTitle>
          <CardDescription>
            Erstellen Sie komplette Social Media Inhalte mit KI - Posts, Hashtags, Bilder und Videos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessType">Geschäftstyp</Label>
              <Input
                id="businessType"
                placeholder="z.B. Café, Friseur, Anwaltskanzlei..."
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="postTopic">Thema/Anlass</Label>
              <Input
                id="postTopic"
                placeholder="z.B. Neue Speisekarte, Sommerfrisuren..."
                value={postTopic}
                onChange={(e) => setPostTopic(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="post" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Post
          </TabsTrigger>
          <TabsTrigger value="hashtags" className="flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Hashtags
          </TabsTrigger>
          <TabsTrigger value="imageIdeas" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Bild-Ideen
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Bild
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Video
          </TabsTrigger>
        </TabsList>

        <TabsContent value="post" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Post</CardTitle>
              <CardDescription>
                Generieren Sie einen authentischen Post für Ihr Geschäft
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => handleGenerate('post')}
                disabled={loading.post || !businessType || !postTopic}
                className="w-full"
              >
                {loading.post ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generiere Post...
                  </>
                ) : (
                  'Post generieren'
                )}
              </Button>
              
              {content.post && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">Generierter Post</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(content.post!)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Kopieren
                    </Button>
                  </div>
                  <Textarea
                    value={content.post}
                    onChange={(e) => setContent(prev => ({ ...prev, post: e.target.value }))}
                    rows={4}
                    className="resize-none"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hashtags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hashtags</CardTitle>
              <CardDescription>
                Generieren Sie relevante Hashtags für Ihren Post
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => handleGenerate('hashtags')}
                disabled={loading.hashtags || !content.post}
                className="w-full"
              >
                {loading.hashtags ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generiere Hashtags...
                  </>
                ) : (
                  'Hashtags generieren'
                )}
              </Button>
              
              {!content.post && (
                <p className="text-sm text-muted-foreground">
                  Generieren Sie zuerst einen Post, um passende Hashtags zu erstellen.
                </p>
              )}
              
              {content.hashtags && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">Generierte Hashtags</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(content.hashtags!)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Kopieren
                    </Button>
                  </div>
                  <Textarea
                    value={content.hashtags}
                    onChange={(e) => setContent(prev => ({ ...prev, hashtags: e.target.value }))}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="imageIdeas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bild-Ideen & Regieanweisungen</CardTitle>
              <CardDescription>
                Erhalten Sie detaillierte Anweisungen für perfekte Social Media Fotos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => handleGenerate('imageIdeas')}
                disabled={loading.imageIdeas || !content.post}
                className="w-full"
              >
                {loading.imageIdeas ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generiere Bild-Ideen...
                  </>
                ) : (
                  'Bild-Ideen generieren'
                )}
              </Button>
              
              {!content.post && (
                <p className="text-sm text-muted-foreground">
                  Generieren Sie zuerst einen Post, um passende Bild-Ideen zu erstellen.
                </p>
              )}
              
              {content.imageIdeas && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">Generierte Bild-Ideen</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(content.imageIdeas!)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Kopieren
                    </Button>
                  </div>
                  <Textarea
                    value={content.imageIdeas}
                    onChange={(e) => setContent(prev => ({ ...prev, imageIdeas: e.target.value }))}
                    rows={8}
                    className="resize-none"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="image" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>KI-Bild Generierung</CardTitle>
              <CardDescription>
                Lassen Sie ein professionelles Bild für Ihren Social Media Post erstellen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => handleGenerate('image')}
                disabled={loading.image || !businessType || !postTopic}
                className="w-full"
              >
                {loading.image ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generiere Bild...
                  </>
                ) : (
                  'Bild generieren'
                )}
              </Button>
              
              {content.generatedImage && (
                <div className="space-y-2">
                  <Badge variant="secondary">Generiertes Bild</Badge>
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <img 
                      src={content.generatedImage} 
                      alt="Generiertes Social Media Bild"
                      className="w-full max-w-md mx-auto rounded-lg"
                    />
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Herunterladen
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => copyToClipboard(content.generatedImage!)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Link kopieren
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>KI-Video Generierung</CardTitle>
              <CardDescription>
                Erstellen Sie ein kurzes, ansprechendes Video für Social Media
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => handleGenerate('video')}
                disabled={loading.video || !businessType || !postTopic}
                className="w-full"
              >
                {loading.video ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generiere Video...
                  </>
                ) : (
                  'Video generieren'
                )}
              </Button>
              
              {content.generatedVideo && (
                <div className="space-y-2">
                  <Badge variant="secondary">Generiertes Video</Badge>
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <video 
                      src={content.generatedVideo} 
                      controls
                      className="w-full max-w-md mx-auto rounded-lg"
                    >
                      Ihr Browser unterstützt das Video-Element nicht.
                    </video>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Herunterladen
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => copyToClipboard(content.generatedVideo!)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Link kopieren
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}