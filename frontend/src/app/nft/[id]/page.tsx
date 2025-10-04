'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, Share2, MoreVertical, Clock, Tag, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Mock data - replace with actual data fetching
const nftData = {
  id: '1',
  name: 'Cosmic Dreams #4521',
  description: 'A unique piece from the Cosmic Dreams collection, featuring abstract patterns and vibrant colors that represent the infinite possibilities of the universe.',
  image: 'https://via.placeholder.com/600',
  owner: {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    name: 'CryptoArtist',
    avatar: 'https://via.placeholder.com/40',
  },
  creator: {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    name: 'CryptoArtist',
  },
  collection: {
    name: 'Cosmic Dreams',
    verified: true,
  },
  price: '2.5',
  priceUSD: '4,250',
  tokenId: '4521',
  contractAddress: '0x1234567890123456789012345678901234567890',
  tokenStandard: 'ERC-721',
  blockchain: 'Ethereum',
  properties: [
    { trait_type: 'Background', value: 'Nebula' },
    { trait_type: 'Style', value: 'Abstract' },
    { trait_type: 'Rarity', value: 'Rare' },
  ],
  history: [
    { event: 'Sale', price: '2.5 ETH', from: '0xabc...', to: '0xdef...', date: '2024-01-15' },
    { event: 'Transfer', from: '0x123...', to: '0xabc...', date: '2024-01-10' },
    { event: 'Minted', to: '0x123...', date: '2024-01-01' },
  ],
};

export default function NFTDetailPage({ params }: { params: { id: string } }) {
  // Mock wallet connection for UI demo
  const address = '';
  const isConnected = false;
  const [activeTab, setActiveTab] = useState<'details' | 'offers' | 'history'>('details');
  const [isLiked, setIsLiked] = useState(false);

  const handleBuy = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }
    // Implement buy logic
    toast.success('Purchase initiated!');
  };

  const handleMakeOffer = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }
    // Implement offer logic
    toast('Make offer feature coming soon!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-square relative">
            <Image
              src={nftData.image}
              alt={nftData.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Properties */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Properties</h3>
            <div className="grid grid-cols-2 gap-3">
              {nftData.properties.map((prop, index) => (
                <div key={index} className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-blue-600 font-medium">{prop.trait_type}</p>
                  <p className="text-lg font-bold text-gray-900">{prop.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-6">
          {/* Collection */}
          <div className="flex items-center space-x-2">
            <span className="text-blue-600 font-medium">{nftData.collection.name}</span>
            {nftData.collection.verified && (
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          {/* Title & Actions */}
          <div className="flex items-start justify-between">
            <h1 className="text-4xl font-bold text-gray-900">{nftData.name}</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Heart className={`h-6 w-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Share2 className="h-6 w-6 text-gray-600" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <MoreVertical className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Owner */}
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-sm text-gray-500">Owned by</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500" />
                <span className="font-medium text-blue-600">{nftData.owner.name}</span>
              </div>
            </div>
          </div>

          {/* Price Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Current Price</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-gray-900">{nftData.price} ETH</span>
                  <span className="text-lg text-gray-500">${nftData.priceUSD}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Sale ends in</p>
                <div className="flex items-center space-x-1 text-gray-900 font-medium">
                  <Clock className="h-4 w-4" />
                  <span>2d 14h 30m</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBuy}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Buy Now
              </button>
              <button
                onClick={handleMakeOffer}
                className="flex-1 border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Make Offer
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-gray-600 leading-relaxed">{nftData.description}</p>
          </div>

          {/* Details & History Tabs */}
          <div className="bg-white rounded-xl shadow-md">
            <div className="border-b border-gray-200">
              <div className="flex space-x-8 px-6">
                {['details', 'offers', 'history'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`py-4 font-medium capitalize ${
                      activeTab === tab
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'details' && (
                <div className="space-y-3">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Contract Address</span>
                    <span className="font-mono text-sm">
                      {nftData.contractAddress.slice(0, 6)}...{nftData.contractAddress.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Token ID</span>
                    <span className="font-medium">{nftData.tokenId}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Token Standard</span>
                    <span className="font-medium">{nftData.tokenStandard}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Blockchain</span>
                    <span className="font-medium">{nftData.blockchain}</span>
                  </div>
                </div>
              )}

              {activeTab === 'offers' && (
                <div className="text-center py-8 text-gray-500">
                  No active offers yet
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-4">
                  {nftData.history.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Tag className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{item.event}</p>
                          <p className="text-sm text-gray-500">
                            {item.from && `From ${item.from.slice(0, 6)}...`}
                            {item.to && ` to ${item.to.slice(0, 6)}...`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {item.price && <p className="font-medium">{item.price}</p>}
                        <p className="text-sm text-gray-500">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* More from Collection */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">More from this collection</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Add more NFT cards here */}
        </div>
      </div>
    </div>
  );
}
