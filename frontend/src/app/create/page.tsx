'use client';

import { useState } from 'react';
import { Upload, Image as ImageIcon, FileVideo, FileAudio } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CreatePage() {
  // Mock wallet connection for UI demo
  const isConnected = false;
  const address = '';
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    collection: '',
    royalty: '10',
    properties: [] as { trait_type: string; value: string }[],
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);

    try {
      // 1. Upload file to IPFS
      const fileFormData = new FormData();
      fileFormData.append('file', file);

      const uploadRes = await fetch('/api/ipfs/upload', {
        method: 'POST',
        body: fileFormData,
      });

      const { cid: imageCid } = await uploadRes.json();

      // 2. Upload metadata to IPFS
      const metadata = {
        name: formData.name,
        description: formData.description,
        image: `ipfs://${imageCid}`,
        attributes: formData.properties,
      };

      const metadataRes = await fetch('/api/ipfs/upload-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata),
      });

      const { cid: metadataCid } = await metadataRes.json();

      // 3. Mint NFT on-chain
      // TODO: Implement minting logic with ethers.js
      console.log('Metadata CID:', metadataCid);
      
      toast.success('NFT created successfully!');
    } catch (error) {
      console.error('Error creating NFT:', error);
      toast.error('Failed to create NFT');
    } finally {
      setIsUploading(false);
    }
  };

  const addProperty = () => {
    setFormData({
      ...formData,
      properties: [...formData.properties, { trait_type: '', value: '' }],
    });
  };

  const removeProperty = (index: number) => {
    setFormData({
      ...formData,
      properties: formData.properties.filter((_, i) => i !== index),
    });
  };

  const updateProperty = (index: number, field: 'trait_type' | 'value', value: string) => {
    const newProperties = [...formData.properties];
    newProperties[index][field] = value;
    setFormData({ ...formData, properties: newProperties });
  };

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Create New NFT</h1>
        <p className="text-gray-600 mb-8">Please connect your wallet to create NFTs</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-2">Create New Item</h1>
      <p className="text-gray-600 mb-8">
        Upload your artwork, add metadata, and mint your NFT
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image, Video, Audio, or 3D Model *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview('');
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*,video/*,audio/*,.glb,.gltf"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex flex-col items-center"
                >
                  <Upload className="h-12 w-12 text-gray-400 mb-3" />
                  <span className="text-sm text-gray-600">
                    PNG, GIF, WEBP, MP4 or MP3. Max 50MB.
                  </span>
                  <span className="mt-2 text-blue-600 font-medium">
                    Choose File
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Item name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Provide a detailed description of your item"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Collection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Collection
          </label>
          <select
            value={formData.collection}
            onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select collection</option>
            <option value="default">Default Collection</option>
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price (ETH)
          </label>
          <input
            type="number"
            step="0.001"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="0.00"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Royalty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Royalty (%)
          </label>
          <input
            type="number"
            min="0"
            max="50"
            value={formData.royalty}
            onChange={(e) => setFormData({ ...formData, royalty: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Suggested: 10%. Maximum is 50%
          </p>
        </div>

        {/* Properties */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Properties
            </label>
            <button
              type="button"
              onClick={addProperty}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Add Property
            </button>
          </div>
          <div className="space-y-2">
            {formData.properties.map((prop, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Trait (e.g., Background)"
                  value={prop.trait_type}
                  onChange={(e) => updateProperty(index, 'trait_type', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Value (e.g., Blue)"
                  value={prop.value}
                  onChange={(e) => updateProperty(index, 'value', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeProperty(index)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isUploading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Creating...' : 'Create NFT'}
          </button>
        </div>
      </form>
    </div>
  );
}
