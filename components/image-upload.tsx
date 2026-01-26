'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { X, Upload, Image as ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void
  initialImages?: string[]
  maxImages?: number
  folder?: string
  className?: string
}

export function ImageUpload({
  onImagesChange,
  initialImages = [],
  maxImages = 5,
  folder = 'uploads',
  className = ''
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`)
      return
    }

    setUploading(true)
    setUploadProgress(0)

    const uploadPromises = acceptedFiles.map(async (file, index) => {
      try {
        // Create form data for upload
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', folder)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const data = await response.json()
        setUploadProgress(((index + 1) / acceptedFiles.length) * 100)
        return data.url
      } catch (error) {
        console.error('Upload error:', error)
        throw error
      }
    })

    try {
      const uploadedImages = await Promise.all(uploadPromises)
      const newImages = [...images, ...uploadedImages]
      setImages(newImages)
      onImagesChange(newImages)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload images')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [images, maxImages, folder, onImagesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true,
    disabled: uploading || images.length >= maxImages
  })

  const removeImage = async (index: number) => {
    const imageToRemove = images[index]
    
    try {
      // Delete from S3
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: imageToRemove })
      })

      // Update state
      const newImages = images.filter((_, i) => i !== index)
      setImages(newImages)
      onImagesChange(newImages)
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete image')
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {images.length < maxImages && (
        <Card
          {...getRootProps()}
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              {uploading ? (
                <div className="animate-spin">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <p className="text-gray-600 mb-2">
              {uploading
                ? 'Uploading images...'
                : isDragActive
                ? 'Drop the images here...'
                : 'Drag & drop images here, or click to select'}
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG, GIF up to 10MB each (max {maxImages} images)
            </p>
            {uploading && (
              <div className="mt-4">
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <Card className="overflow-hidden">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Image Count */}
      <div className="text-sm text-gray-600">
        {images.length} / {maxImages} images uploaded
      </div>
    </div>
  )
}