import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';

export interface MarketRegion {
    id: number;
    name: string;
    currency_code: string;
    currency_symbol: string;
    flag_code?: string;
}

interface MarketContextType {
    regions: MarketRegion[];
    selectedRegion: MarketRegion | null;
    setSelectedRegion: (region: MarketRegion) => void;
    isLoading: boolean;
    isMarketOpen: boolean;
    setIsMarketOpen: (open: boolean) => void;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const defaultRegions = [
        { id: 1, name: 'INDIAN RUPEE', currency_code: 'INR', currency_symbol: '₹', flag_code: 'IN' },
        { id: 2, name: 'US DOLLAR', currency_code: 'USD', currency_symbol: '$', flag_code: 'US' },
        { id: 3, name: 'EURO', currency_code: 'EUR', currency_symbol: '€', flag_code: 'EU' },
        { id: 4, name: 'BRITISH POUND', currency_code: 'GBP', currency_symbol: '£', flag_code: 'GB' },
        { id: 5, name: 'CANADIAN DOLLAR', currency_code: 'CAD', currency_symbol: '$', flag_code: 'CA' },
        { id: 6, name: 'AUSTRALIAN DOLLAR', currency_code: 'AUD', currency_symbol: '$', flag_code: 'AU' }
    ];

    const [regions, setRegions] = useState<MarketRegion[]>(defaultRegions);
    const [selectedRegion, setSelectedRegion] = useState<MarketRegion | null>(defaultRegions[0]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMarketOpen, setIsMarketOpen] = useState(false);

    useEffect(() => {
        const fetchRegions = async () => {
            try {
                // Try to get from API
                const data = await apiRequest('/admin/market/regions').catch(() => []);

                // If API returns data, use it; otherwise stay with defaults
                if (data && Array.isArray(data) && data.length > 0) {
                    setRegions(data);
                } else {
                    setRegions(defaultRegions);
                }

                // Get saved region or set default
                const currentRegions = (data && data.length > 0) ? data : defaultRegions;
                const saved = localStorage.getItem('selected_market_region');

                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        const found = currentRegions.find((r: any) => r.id === parsed.id || r.currency_code === parsed.currency_code);
                        if (found) setSelectedRegion(found);
                        else setSelectedRegion(currentRegions[0]);
                    } catch (e) {
                        setSelectedRegion(currentRegions[0]);
                    }
                } else {
                    setSelectedRegion(currentRegions[0]);
                }
            } catch (err) {
                console.error('Failed to fetch regions', err);
                setRegions(defaultRegions);
                setSelectedRegion(defaultRegions[0]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRegions();
    }, []);

    useEffect(() => {
        if (selectedRegion) {
            localStorage.setItem('selected_market_region', JSON.stringify(selectedRegion));
        }
    }, [selectedRegion]);

    return (
        <MarketContext.Provider value={{
            regions,
            selectedRegion,
            setSelectedRegion,
            isLoading,
            isMarketOpen,
            setIsMarketOpen
        }}>
            {children}
        </MarketContext.Provider>
    );
};

export const useMarket = () => {
    const context = useContext(MarketContext);
    if (context === undefined) {
        throw new Error('useMarket must be used within a MarketProvider');
    }
    return context;
};
