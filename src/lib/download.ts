export function downloadTextFile(filename: string, text: string, type: 'markdown' | 'json') {
  const mimeType = type === 'markdown' ? 'text/markdown' : 'application/json';
  const extension = type === 'markdown' ? '.md' : '.json';
  
  // Create a Blob with the text content
  const blob = new Blob([text], { type: mimeType });
  
  // Create an object URL for the Blob
  const url = URL.createObjectURL(blob);
  
  const element = document.createElement('a');
  element.setAttribute('href', url);
  element.setAttribute('download', `${filename}${extension}`);
  element.style.display = 'none';
  document.body.appendChild(element);
  
  element.click();
  
  document.body.removeChild(element);
  
  // Revoke the object URL to free up resources
  URL.revokeObjectURL(url);
}
