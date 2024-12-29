export async function downloadFile(url: string, filePath: string) {
  try {
    console.log(`Downloading file from ${url} to ${filePath}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    await Deno.writeFile(filePath, new Uint8Array(arrayBuffer));
    console.log('File downloaded successfully');
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}

export async function cleanupTempFiles(tempDir: string) {
  try {
    console.log(`Cleaning up temporary directory: ${tempDir}`);
    await Deno.remove(tempDir, { recursive: true });
    console.log('Temporary files cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
    // Don't throw the error here as this is cleanup code
  }
}