"use client";
import { useEffect } from 'react';
import { toast } from 'sonner';
import { getOutbox, removeFromOutbox } from '../utils/db';

export default function OfflineSyncManager() {
  useEffect(() => {
    const syncOutbox = async () => {
      if (!navigator.onLine) return;
      
      try {
        const pendingScans = await getOutbox();
        if (pendingScans.length === 0) return;
        
        toast.info(`Syncing ${pendingScans.length} offline scan(s)...`);
        const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';
        const token = sessionStorage.getItem('token');
        
        let successCount = 0;
        
        for (const scan of pendingScans) {
          try {
            const formData = new FormData();
            formData.append('source_type', scan.sourceType);
            formData.append('product_name', scan.productName);
            if (scan.location) {
              formData.append('latitude', scan.location.lat);
              formData.append('longitude', scan.location.lng);
            }
            
            // Append files directly from IndexedDB
            if (scan.files && scan.files.length > 0) {
              scan.files.forEach(f => formData.append('images', f));
            }
            
            const res = await fetch(`${API}/scans`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
              body: formData
            });
            
            if (res.ok) {
              await removeFromOutbox(scan.id);
              successCount++;
            }
          } catch (err) {
            console.error("Failed to sync scan:", scan.id, err);
          }
        }
        
        if (successCount > 0) {
          toast.success(`Successfully synced ${successCount} offline scan(s)!`);
          // Dispatch event to refresh dashboard/history if they are on it
          window.dispatchEvent(new Event('offline-sync-complete'));
        }
      } catch (err) {
        console.error("Sync error:", err);
      }
    };

    window.addEventListener('online', syncOutbox);
    
    // Attempt sync 3 seconds after mount (in case app was closed offline and reopened online)
    const timeout = setTimeout(syncOutbox, 3000); 

    return () => {
      window.removeEventListener('online', syncOutbox);
      clearTimeout(timeout);
    };
  }, []);

  return null;
}
