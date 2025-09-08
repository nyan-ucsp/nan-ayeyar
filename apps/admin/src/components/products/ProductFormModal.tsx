import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Plus, Trash2 } from 'lucide-react';
import { Product, ProductFormData } from '@/types';
import { adminApiClient } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/utils/cn';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess: (product: Product) => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProductFormData>();

  const isEditing = !!product;

  // Reset form when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen) {
      if (product) {
        reset({
          sku: product.sku || '',
          name_en: product.name_en,
          name_my: product.name_my || '',
          description_en: product.description_en || '',
          description_my: product.description_my || '',
          price: product.price,
          disabled: product.disabled,
          outOfStock: product.outOfStock,
          allowSellWithoutStock: product.allowSellWithoutStock,
          metadata: product.metadata || {},
        });
        setUploadedImages(product.images || []);
      } else {
        reset({
          name_en: '',
          name_my: '',
          description_en: '',
          description_my: '',
          price: 0,
          disabled: false,
          outOfStock: false,
          allowSellWithoutStock: true,
          metadata: {},
        });
        setUploadedImages([]);
      }
    }
  }, [isOpen, product, reset]);

  const onDrop = async (acceptedFiles: File[]) => {
    setIsUploading(true);
    try {
      const uploadPromises = acceptedFiles.map(file => adminApiClient.uploadFile(file));
      const urls = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...urls]);
    } catch (error) {
      console.error('Failed to upload images:', error);
      alert(`Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true,
  });

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const productData = {
        ...data,
        images: uploadedImages,
      };

      let result: Product;
      if (isEditing) {
        result = await adminApiClient.updateProduct(product!.id, productData);
      } else {
        result = await adminApiClient.createProduct(productData);
      }

      onSuccess(result);
    } catch (error) {
      console.error('Failed to save product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addMetadataField = () => {
    const currentMetadata = watch('metadata') || {};
    const newKey = `field_${Date.now()}`;
    setValue('metadata', {
      ...currentMetadata,
      [newKey]: '',
    });
  };

  const updateMetadataField = (key: string, value: string) => {
    const currentMetadata = watch('metadata') || {};
    setValue('metadata', {
      ...currentMetadata,
      [key]: value,
    });
  };

  const removeMetadataField = (key: string) => {
    const currentMetadata = watch('metadata') || {};
    const newMetadata = { ...currentMetadata };
    delete newMetadata[key];
    setValue('metadata', newMetadata);
  };

  const metadata = watch('metadata') || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Product' : 'Add New Product'}
      size="2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              {...register('sku')}
              label="SKU (Optional)"
              placeholder="Product SKU"
              error={errors.sku?.message}
            />
          </div>
          <div>
            <Input
              {...register('price', { 
                required: 'Price is required',
                min: { value: 0, message: 'Price must be positive' }
              })}
              type="number"
              step="0.01"
              label="Price"
              placeholder="0.00"
              error={errors.price?.message}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              {...register('name_en', { required: 'English name is required' })}
              label="Product Name (English)"
              placeholder="Enter product name in English"
              error={errors.name_en?.message}
            />
          </div>
          <div>
            <Input
              {...register('name_my')}
              label="Product Name (Myanmar)"
              placeholder="Enter product name in Myanmar"
              error={errors.name_my?.message}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (English)
            </label>
            <textarea
              {...register('description_en')}
              rows={3}
              placeholder="Enter product description in English"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Myanmar)
            </label>
            <textarea
              {...register('description_my')}
              rows={3}
              placeholder="Enter product description in Myanmar"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Product Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images
          </label>
          
          {/* Image Upload Area */}
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
              isDragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              {isDragActive
                ? 'Drop images here...'
                : 'Drag & drop images here, or click to select'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF up to 5MB each
            </p>
          </div>

          {/* Uploaded Images */}
          {uploadedImages.length > 0 && (
            <div className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isUploading && (
            <div className="mt-2 text-sm text-gray-500">
              Uploading images...
            </div>
          )}
        </div>

        {/* Product Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <input
              {...register('disabled')}
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Disabled (Hidden from store)
            </label>
          </div>
          <div className="flex items-center">
            <input
              {...register('outOfStock')}
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Out of Stock
            </label>
          </div>
          <div className="flex items-center">
            <input
              {...register('allowSellWithoutStock')}
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Allow sell without stock
            </label>
          </div>
        </div>

        {/* Metadata Fields */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Product Metadata (e.g., variety, weight, grade)
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMetadataField}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Field
            </Button>
          </div>
          
          <div className="space-y-3">
            {Object.entries(metadata).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-3">
                <Input
                  value={key}
                  onChange={(e) => {
                    const newKey = e.target.value;
                    const newMetadata = { ...metadata };
                    delete newMetadata[key];
                    newMetadata[newKey] = value;
                    setValue('metadata', newMetadata);
                  }}
                  placeholder="Field name"
                  className="flex-1"
                />
                <Input
                  value={value as string}
                  onChange={(e) => updateMetadataField(key, e.target.value)}
                  placeholder="Field value"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeMetadataField(key)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
          >
            {isEditing ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductFormModal;
