
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import CommunityCard from '@/components/CommunityCard';
import { communities } from '@/lib/data';
import { getCurrentUser, initializeStorage } from '@/lib/storage';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCommunities, setFilteredCommunities] = useState(communities);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    // Initialize local storage with mock data
    initializeStorage();
    
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const filtered = communities.filter(community => 
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCommunities(filtered);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sweet-50 pb-10">
      <Navbar />
      <div className="pt-20 px-4 container mx-auto">
        <header className="text-center my-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Sweet Shop Delivery</h1>
          <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
            Delicious treats delivered directly to your gated community
          </p>
        </header>

        <div className="max-w-md mx-auto relative mb-10 animate-fade-in">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search your community..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 h-12 w-full bg-white shadow-sm"
          />
        </div>

        {filteredCommunities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community) => (
              <CommunityCard key={community.id} community={community} />
            ))}
          </div>
        ) : (
          <div className="text-center p-10 animate-fade-in">
            <p className="text-muted-foreground">No communities found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
