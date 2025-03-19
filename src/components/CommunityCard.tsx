
import React from 'react';
import { Link } from 'react-router-dom';
import { Community } from '@/lib/types';
import { CheckCircle } from 'lucide-react';

interface CommunityCardProps {
  community: Community;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ community }) => {
  return (
    <Link 
      to={`/community/${community.id}`}
      className="group block rounded-lg overflow-hidden bg-white border border-border shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={community.image}
          alt={community.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-lg text-foreground group-hover:text-primary transition-colors duration-300">{community.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{community.address}</p>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm font-medium flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Delivers Today</span>
          </p>
          <p className="text-sm font-medium">₹{community.deliveryFee} delivery</p>
        </div>
      </div>
    </Link>
  );
};

export default CommunityCard;
