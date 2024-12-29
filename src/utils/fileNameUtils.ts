export const createWebFriendlyFileName = (originalFileName: string): string => {
  // Get the file extension
  const extension = originalFileName.split('.').pop() || '';
  
  // Remove the extension and any special characters, convert to lowercase
  const nameWithoutExtension = originalFileName
    .replace(`.${extension}`, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  
  // Split into words and limit to 6 words
  const limitedWords = nameWithoutExtension.split('-').slice(0, 6).join('-');
  
  // Return the limited name with the original extension
  return `${limitedWords}.${extension}`;
};