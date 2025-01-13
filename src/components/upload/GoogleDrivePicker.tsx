import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GoogleDrivePickerProps {
  onFileSelect: (file: File, path: string) => void;
}

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

const GoogleDrivePicker = ({ onFileSelect }: GoogleDrivePickerProps) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Load the Google API client library
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('picker', () => {
        initializePicker();
      });
    };
    document.body.appendChild(script);

    // Load the Google Identity Services library
    const scriptAuth = document.createElement('script');
    scriptAuth.src = 'https://accounts.google.com/gsi/client';
    document.body.appendChild(scriptAuth);
  }, []);

  const initializePicker = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to use Google Drive');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('google_access_token, google_token_expiry')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to fetch user profile');
        return;
      }

      if (!profile?.google_access_token) {
        toast.error('Please connect your Google account first');
        return;
      }

      setAccessToken(profile.google_access_token);
    } catch (error) {
      console.error('Error initializing picker:', error);
      toast.error('Failed to initialize Google Drive picker');
    }
  };

  const createPicker = () => {
    if (!window.google || !window.google.picker || !accessToken) {
      toast.error('Google Drive picker is not ready');
      return;
    }

    const picker = new window.google.picker.PickerBuilder()
      .addView(window.google.picker.ViewId.DOCS_VIDEOS)
      .setOAuthToken(accessToken)
      .setCallback(pickerCallback)
      .build();
    picker.setVisible(true);
  };

  const pickerCallback = async (data: any) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const file = data.docs[0];
      try {
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        const blob = await response.blob();
        const driveFile = new File([blob], file.name, { type: file.mimeType });
        
        // Generate a unique path for the file
        const fileExt = file.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        
        onFileSelect(driveFile, filePath);
      } catch (error) {
        console.error('Error downloading file from Google Drive:', error);
        toast.error('Failed to download file from Google Drive');
      }
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={createPicker}
      className="w-full"
      disabled={!accessToken}
    >
      Select from Google Drive
    </Button>
  );
};

export default GoogleDrivePicker;