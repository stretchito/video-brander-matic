import { SERVER_URL } from '@/config/server';

export const useJobPolling = () => {
  const pollJobStatus = async (jobId: string, maxRetries = 60) => {
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      console.log(`Polling job status (attempt ${retryCount + 1})`);
      
      const statusResponse = await fetch(`${SERVER_URL}/job-status/${jobId}`);
      if (!statusResponse.ok) {
        console.error('Status check failed:', await statusResponse.text());
        throw new Error('Failed to check job status');
      }

      const statusData = await statusResponse.json();
      console.log('Job status:', statusData);
      
      if (statusData.status === 'completed') {
        return { completed: true, outputUrl: statusData.outputUrl };
      } else if (statusData.status === 'error') {
        throw new Error(statusData.error || 'Processing failed');
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      retryCount++;
    }

    throw new Error('Processing timed out while waiting for completion');
  };

  return { pollJobStatus };
};