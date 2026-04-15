import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, PieChart, Filter, Search, PlusCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EntrepreneurCard } from '../../components/entrepreneur/EntrepreneurCard';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { collaborationService } from '../../services/collaborationService';
import { User } from '../../services/authService';
import toast from 'react-hot-toast';

export const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [entrepreneurs, setEntrepreneurs] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      const [entrepreneursData, requestsData] = await Promise.all([
        userService.getAllEntrepreneurs(),
        collaborationService.getRequestsFromInvestor(),
      ]);
      setEntrepreneurs(entrepreneursData);
      setSentRequests(requestsData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  const requestedEntrepreneurIds = sentRequests.map(req => req.entrepreneurId);
  const industries = Array.from(new Set(entrepreneurs.map(e => e.industry || '').filter(i => i)));
  
  const filteredEntrepreneurs = entrepreneurs.filter(entrepreneur => {
    const matchesSearch = searchQuery === '' || 
      entrepreneur.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entrepreneur.startupName && entrepreneur.startupName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entrepreneur.industry && entrepreneur.industry.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entrepreneur.pitchSummary && entrepreneur.pitchSummary.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesIndustry = selectedIndustries.length === 0 || 
      (entrepreneur.industry && selectedIndustries.includes(entrepreneur.industry));
    
    return matchesSearch && matchesIndustry;
  });
  
  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prevSelected => 
      prevSelected.includes(industry)
        ? prevSelected.filter(i => i !== industry)
        : [...prevSelected, industry]
    );
  };
  
  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Discover Startups</h1>
          <p className="text-sm sm:text-base text-gray-600">Find and connect with promising entrepreneurs</p>
        </div>
        
        <Link to="/entrepreneurs">
          <Button leftIcon={<PlusCircle size={18} />} className="w-full sm:w-auto">
            View All Startups
          </Button>
        </Link>
      </div>
      
      {/* Filters and search - responsive */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search startups, industries, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            startAdornment={<Search size={18} />}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={18} className="text-gray-500 hidden sm:block" />
          <span className="text-xs sm:text-sm font-medium text-gray-700 hidden sm:inline">Filter by:</span>
          
          <div className="flex flex-wrap gap-2">
            {industries.slice(0, 4).map(industry => (
              <Badge
                key={industry}
                variant={selectedIndustries.includes(industry) ? 'primary' : 'gray'}
                className="cursor-pointer text-xs"
                onClick={() => toggleIndustry(industry)}
              >
                {industry}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      {/* Stats summary - responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-primary-50 border border-primary-100">
          <CardBody className="p-3 sm:p-4">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-primary-100 rounded-full mr-3 sm:mr-4">
                <Users size={16} className="text-primary-700" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-primary-700">Total Startups</p>
                <h3 className="text-lg sm:text-xl font-semibold text-primary-900">{entrepreneurs.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-secondary-50 border border-secondary-100">
          <CardBody className="p-3 sm:p-4">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-secondary-100 rounded-full mr-3 sm:mr-4">
                <PieChart size={16} className="text-secondary-700" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-secondary-700">Industries</p>
                <h3 className="text-lg sm:text-xl font-semibold text-secondary-900">{industries.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-accent-50 border border-accent-100">
          <CardBody className="p-3 sm:p-4">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-accent-100 rounded-full mr-3 sm:mr-4">
                <Users size={16} className="text-accent-700" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-accent-700">Your Connections</p>
                <h3 className="text-lg sm:text-xl font-semibold text-accent-900">
                  {sentRequests.filter(req => req.status === 'accepted').length}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Entrepreneurs grid - responsive */}
      <div>
        <Card>
          <CardHeader>
            <h2 className="text-base sm:text-lg font-medium text-gray-900">Featured Startups</h2>
          </CardHeader>
          
          <CardBody>
            {filteredEntrepreneurs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredEntrepreneurs.map(entrepreneur => (
                  <EntrepreneurCard
                    key={entrepreneur.id}
                    entrepreneur={entrepreneur as any}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No startups match your filters</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedIndustries([]);
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};