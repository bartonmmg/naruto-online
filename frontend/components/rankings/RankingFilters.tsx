'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface Region {
  id: string;
  name: string;
}

interface Cluster {
  id: number;
  name: string;
}

interface RankingFiltersProps {
  onFiltersChange: (filters: {
    region: string;
    cluster: number;
    date: string;
    server?: string;
    isGlobal: boolean;
  }) => void;
  onLoading?: (loading: boolean) => void;
  onRankingData?: (data: any) => void;
}

export default function RankingFilters({
  onFiltersChange,
  onLoading,
  onRankingData,
}: RankingFiltersProps) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);

  const [selectedRegion, setSelectedRegion] = useState<string>('ES');
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('2026-04');
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [isGlobal, setIsGlobal] = useState(false);

  // Fetch regions on mount
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        onLoading?.(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/rankings/regions`
        );
        const data = await res.json();
        setRegions(data);

        if (data.length > 0) {
          const defaultRegion = data[0].id;
          setSelectedRegion(defaultRegion);
          fetchClusters(defaultRegion);
        }
      } catch (error) {
        console.error('Error fetching regions:', error);
      } finally {
        onLoading?.(false);
      }
    };

    fetchRegions();
  }, [onLoading]);

  const fetchClusters = async (region: string) => {
    try {
      onLoading?.(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rankings/clusters/${region}`
      );
      const data = await res.json();
      setClusters(data);

      if (data.length > 0) {
        setSelectedCluster(data[0].id);
        notifyFilterChange(region, data[0].id);
      }
    } catch (error) {
      console.error('Error fetching clusters:', error);
    } finally {
      onLoading?.(false);
    }
  };

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedServer('');
    setIsGlobal(false);
    fetchClusters(region);
  };

  const handleClusterChange = (cluster: number) => {
    setSelectedCluster(cluster);
    setIsGlobal(false);
    notifyFilterChange(selectedRegion, cluster);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    if (!isGlobal && selectedCluster) {
      notifyFilterChange(selectedRegion, selectedCluster, date);
    }
  };

  const handleServerChange = (server: string) => {
    setSelectedServer(server);
  };

  const handleGlobalToggle = () => {
    const newGlobalState = !isGlobal;
    setIsGlobal(newGlobalState);
    if (newGlobalState) {
      notifyFilterChange(selectedRegion, 1, selectedDate, '', true);
    } else if (selectedCluster) {
      notifyFilterChange(selectedRegion, selectedCluster, selectedDate);
    }
  };

  const notifyFilterChange = async (
    region: string,
    cluster: number,
    date: string = selectedDate,
    server: string = selectedServer,
    globalRanking: boolean = false
  ) => {
    onFiltersChange({
      region,
      cluster,
      date,
      server: server || undefined,
      isGlobal: globalRanking,
    });

    // Fetch ranking data
    try {
      onLoading?.(true);
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/rankings`;

      if (globalRanking) {
        url += `/global?region=${region}&date=${date}`;
      } else {
        url += `?region=${region}&cluster=${cluster}&date=${date}`;
        if (server) {
          url += `&server=${server}`;
        }
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const data = await res.json();
      onRankingData?.(data);
    } catch (error) {
      console.error('Error fetching ranking:', error);
    } finally {
      onLoading?.(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedServer('');
    setIsGlobal(false);
    if (selectedCluster) {
      notifyFilterChange(selectedRegion, selectedCluster);
    }
  };

  return (
    <div className="space-y-4 mb-8">
      {/* Region & Global Toggle Row */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-white/70 mb-2">
            Región
          </label>
          <div className="relative">
            <select
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full px-4 py-2 bg-black/40 border border-power-red/30 rounded text-white appearance-none cursor-pointer hover:border-power-red/60 transition"
            >
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
        </div>

        {/* Global Ranking Toggle */}
        <div className="flex items-end gap-2">
          <button
            onClick={handleGlobalToggle}
            className={`px-4 py-2 rounded font-semibold transition ${
              isGlobal
                ? 'bg-power-red/30 border border-power-red text-power-red'
                : 'bg-black/40 border border-white/20 text-white/70 hover:border-power-red/60'
            }`}
          >
            {isGlobal ? '🌍 Global' : 'Cluster'}
          </button>
        </div>
      </div>

      {/* Cluster & Date Row */}
      {!isGlobal && (
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-white/70 mb-2">
              Cluster
            </label>
            <div className="relative">
              <select
                value={selectedCluster ?? ''}
                onChange={(e) => handleClusterChange(Number(e.target.value))}
                className="w-full px-4 py-2 bg-black/40 border border-power-red/30 rounded text-white appearance-none cursor-pointer hover:border-power-red/60 transition"
              >
                {clusters.map((cluster) => (
                  <option key={cluster.id} value={cluster.id}>
                    {cluster.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-white/70 mb-2">
              Mes
            </label>
            <input
              type="month"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full px-4 py-2 bg-black/40 border border-power-red/30 rounded text-white cursor-pointer hover:border-power-red/60 transition"
            />
          </div>

          {/* Server Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-white/70 mb-2">
              Servidor
            </label>
            <input
              type="text"
              placeholder="Ej: S01"
              value={selectedServer}
              onChange={(e) => handleServerChange(e.target.value)}
              className="w-full px-4 py-2 bg-black/40 border border-power-red/30 rounded text-white placeholder-white/30 hover:border-power-red/60 transition"
            />
          </div>
        </div>
      )}

      {/* Global Date Row */}
      {isGlobal && (
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-white/70 mb-2">
              Mes
            </label>
            <input
              type="month"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full px-4 py-2 bg-black/40 border border-power-red/30 rounded text-white cursor-pointer hover:border-power-red/60 transition"
            />
          </div>
        </div>
      )}

      {/* Clear Button */}
      {(selectedServer || isGlobal) && (
        <button
          onClick={handleClearFilters}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-power-red transition"
        >
          <X className="w-4 h-4" />
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
