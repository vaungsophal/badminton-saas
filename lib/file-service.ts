import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export class LocalFileService {
  private mediaDir: string

  constructor() {
    this.mediaDir = join(process.cwd(), 'public', 'media')
    this.ensureMediaDir()
  }

  /**
   * Ensure media directory exists
   */
  private ensureMediaDir() {
    if (!existsSync(this.mediaDir)) {
      mkdir(this.mediaDir, { recursive: true })
    }
  }

  /**
   * Create folder if it doesn't exist
   */
  private ensureFolder(folder: string) {
    const folderPath = join(this.mediaDir, folder)
    if (!existsSync(folderPath)) {
      mkdir(folderPath, { recursive: true })
    }
    return folderPath
  }

  /**
   * Upload a file to local storage
   */
  async uploadFile(
    buffer: Buffer,
    fileName: string,
    contentType: string,
    folder: string = 'uploads'
  ): Promise<string> {
    const sanitizedFileName = this.sanitizeFileName(fileName)
    const timestamp = Date.now()
    const finalFileName = `${timestamp}-${sanitizedFileName}`
    
    const folderPath = this.ensureFolder(folder)
    const filePath = join(folderPath, finalFileName)
    
    await writeFile(filePath, buffer)
    
    // Return relative URL for web access
    return `/media/${folder}/${finalFileName}`
  }

  /**
   * Delete a file from local storage
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const relativePath = fileUrl.replace('/media/', '')
      const filePath = join(this.mediaDir, relativePath)
      
      if (existsSync(filePath)) {
        await unlink(filePath)
      }
    } catch (error) {
      console.error('Delete file error:', error)
    }
  }

  /**
   * Get file info from URL
   */
  getFileInfo(fileUrl: string): { folder: string; fileName: string } {
    const urlParts = fileUrl.replace('/media/', '').split('/')
    const fileName = urlParts[urlParts.length - 1]
    const folder = urlParts[urlParts.length - 2] || 'uploads'

    return { folder, fileName }
  }

  /**
   * Generate folder name based on entity type
   */
  generateFolderName(entityType: 'club' | 'court' | 'user'): string {
    return `${entityType}s`
  }

  /**
   * Sanitize filename
   */
  sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase()
  }
}

// Export singleton instance
export const fileService = new LocalFileService()

// Utility function to create image upload handler
export const createImageUploadHandler = (folder: string) => {
  return async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const sanitizedFileName = fileService.sanitizeFileName(file.name)
    
    return await fileService.uploadFile(
      buffer,
      sanitizedFileName,
      file.type,
      folder
    )
  }
}