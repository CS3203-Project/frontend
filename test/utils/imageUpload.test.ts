import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { uploadImage, uploadMultipleImages } from '../../src/utils/imageUpload';

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockAxiosPost = vi.mocked(axios.post);

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('imageUpload utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('mock-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        data: { imageUrl: 'https://example.com/image.jpg' }
      };
      
      mockAxiosPost.mockResolvedValueOnce(mockResponse);

      const result = await uploadImage(mockFile);

      expect(result).toBe('https://example.com/image.jpg');
      expect(mockAxiosPost).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/upload-image',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer mock-token'
          }
        }
      );
    });

    it('should handle upload error', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockError = {
        response: {
          data: { message: 'Upload failed' }
        }
      };
      
      mockAxiosPost.mockRejectedValueOnce(mockError);

      await expect(uploadImage(mockFile)).rejects.toThrow('Upload failed');
    });

    it('should handle upload error without response message', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      mockAxiosPost.mockRejectedValueOnce(new Error('Network error'));

      await expect(uploadImage(mockFile)).rejects.toThrow('Failed to upload image');
    });
  });

  describe('uploadMultipleImages', () => {
    it('should upload multiple images successfully', async () => {
      const mockFiles = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })
      ];
      
      mockAxiosPost
        .mockResolvedValueOnce({ data: { imageUrl: 'https://example.com/image1.jpg' } })
        .mockResolvedValueOnce({ data: { imageUrl: 'https://example.com/image2.jpg' } });

      const result = await uploadMultipleImages(mockFiles);

      expect(result).toEqual([
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg'
      ]);
      expect(mockAxiosPost).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple upload error', async () => {
      const mockFiles = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' })
      ];
      
      mockAxiosPost.mockRejectedValueOnce(new Error('Upload failed'));

      await expect(uploadMultipleImages(mockFiles)).rejects.toThrow();
    });
  });
});