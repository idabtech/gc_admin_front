import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
const BASE_URL = API_BASE_URL.replace('/rmsdev/api/v1', '');

class UploadService {
  /**
   * Upload a single file without authentication
   * @param file - The file to upload
   * @param onProgress - Optional callback for upload progress
   * @returns Upload response with file URL
   */
  async uploadFile(
    file,
    onProgress
  ) {
    console.log('[uploadService] uploadFile called', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadUrl: `${BASE_URL}/uploads`
    });

    const formData = new FormData();
    formData.append('file', file);
    console.log('BASE_URL', BASE_URL);
    try {
      const response = await axios.post(
        `${BASE_URL}/uploads`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percentage = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              console.log(`[uploadService] Upload progress: ${percentage}%`);
              onProgress({
                loaded: progressEvent.loaded,
                total: progressEvent.total,
                percentage,
              });
            }
          },
        }
      );

      console.log('[uploadService] Upload response:', response.data);

      // Handle wrapped API response
      if (response.data.data) {
        console.log('[uploadService] Returning nested data:', response.data.data);
        return {
          success: true,
          url: response.data.data.url,
          filename: response.data.data.filename,
          originalName: response.data.data.filename,
          size: response.data.data.size,
          mimeType: 'application/octet-stream',
          data: response.data.data
        };
      }

      return response.data;
    } catch (error) {
      console.error('[uploadService] Upload error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        response: (error).response?.data,
        status: (error).response?.status
      });
      throw new Error(
        (error).response?.data?.message || 'Failed to upload file'
      );
    }
  }

  /**
   * Upload multiple files (requires authentication)
   * @param files - Array of files to upload
   * @param onProgress - Optional callback for upload progress
   * @returns Array of upload responses
   */
  async uploadMultipleFiles(
    files,
    onProgress
  ) {
    const uploadPromises = files.map((file) => this.uploadFile(file, onProgress));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file (requires authentication)
   * @param url - The URL of the file to delete
   */
  async deleteFile(url) {
    const token = localStorage.getItem('token');

    try {
      await axios.delete(`${API_BASE_URL}/uploads`, {
        data: { url },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      throw new Error(
        (error).response?.data?.message || 'Failed to delete file'
      );
    }
  }

  /**
   * Check if file type is allowed
   * @param file - The file to check
   * @returns boolean
   */
  isFileTypeAllowed(file) {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/avif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed',
    ];

    return allowedTypes.includes(file.type);
  }

  /**
   * Check if file size is within limit
   * @param file - The file to check
   * @param maxSizeMB - Maximum size in MB (default: 10)
   * @returns boolean
   */
  isFileSizeValid(file, maxSizeMB = 10) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * Get file extension from filename
   * @param filename - The filename
   * @returns file extension
   */
  getFileExtension(filename) {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Format file size for display
   * @param bytes - File size in bytes
   * @returns Formatted size string
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const uploadService = new UploadService();