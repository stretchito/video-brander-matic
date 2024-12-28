export async function downloadFile(url: string, filePath: string) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  await Deno.writeFile(filePath, new Uint8Array(arrayBuffer));
}

export async function cleanupTempFiles(tempDir: string) {
  try {
    await Deno.remove(tempDir, { recursive: true });
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
  }
}