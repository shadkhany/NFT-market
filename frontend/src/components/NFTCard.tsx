'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, MoreVertical } from 'lucide-react';
import { useState } from 'react';

interface NFTCardProps {
  id: string;
  name: string;
  image: string;
  price: string;
  collection: string;
  likes?: number;
  seller: {
    address: string;
    name?: string;
  };
}

export function NFTCard({ id, name, image, price, collection, likes = 0, seller }: NFTCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <Link href={`/nft/${id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden group">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={image || '/placeholder-nft.png'}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <button
            onClick={handleLike}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
          >
            <Heart
              className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{name}</h3>
              <p className="text-sm text-gray-500 truncate">{collection}</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mt-4">
            <div>
              <p className="text-xs text-gray-500">Price</p>
              <p className="text-lg font-bold text-gray-900">{price} ETH</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Buy Now
            </button>
          </div>

          {/* Seller */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-500" />
              <span className="text-sm text-gray-600 truncate">
                {seller.name || `${seller.address.slice(0, 6)}...${seller.address.slice(-4)}`}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500">
              <Heart className="h-4 w-4" />
              <span className="text-sm">{likeCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
