const API_BASE_URL = 'http://localhost:5000/api';

export const uploadApi = {
  async uploadScreenshot(file: File): Promise<{ filename: string; filepath: string; size: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/uploads/screenshot`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload screenshot');
    }

    return response.json();
  },

  async getScreenshot(filename: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/uploads/screenshot/${filename}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to get screenshot');
    }

    return response.blob();
  },

  async deleteScreenshot(filename: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/uploads/screenshot/${filename}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete screenshot');
    }
  },

  async listScreenshots(): Promise<Array<{
    filename: string;
    size: number;
    created_at: string;
    url: string;
  }>> {
    const response = await fetch(`${API_BASE_URL}/uploads/screenshots`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to list screenshots');
    }

    const data = await response.json();
    return data.screenshots;
  },

  getScreenshotUrl(filename: string): string {
    return `${API_BASE_URL}/uploads/screenshot/${filename}`;
  }
}; 