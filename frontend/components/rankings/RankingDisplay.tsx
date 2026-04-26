'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid, List } from 'lucide-react';

interface Player {
  rank: number;
  name: string;
  server: string | null;
  level: number;
  power: number;
  cluster?: number;
}

interface RankingData {
  region: string;
  cluster?: number;
  date: string;
  totalPlayers: number;
  players: Player[];
}

interface RankingDisplayProps {
  filters: {
    region: string;
    cluster: number;
    date: string;
    server?: string;
    isGlobal: boolean;
  };
  isLoading?: boolean;
}

const MEDAL_COLORS = {
  1: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  2: { bg: 'bg-gray-400/10', border: 'border-gray-400/30', text: 'text-gray-300' },
  3: { bg: 'bg-orange-600/10', border: 'border-orange-600/30', text: 'text-orange-400' },
};

const getMedalEmoji = (rank: number) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
};

export default function RankingDisplay({
  filters,
  isLoading,
}: RankingDisplayProps) {
  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRanking();
  }, [filters]);

  const fetchRanking = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/rankings`;

      if (filters.isGlobal) {
        url += `/global?region=${filters.region}&date=${filters.date}`;
      } else {
        url += `?region=${filters.region}&cluster=${filters.cluster}&date=${filters.date}`;
        if (filters.server) {
          url += `&server=${filters.server}`;
        }
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const data = await res.json();
      setRankingData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching ranking');
    } finally {
      setLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-power-red mb-4"></div>
          <p className="text-white/60">Cargando ranking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded p-4 text-red-300">
        {error}
      </div>
    );
  }

  if (!rankingData || rankingData.players.length === 0) {
    return (
      <div className="bg-black/40 border border-white/10 rounded p-8 text-center">
        <p className="text-white/60">No se encontraron jugadores</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con toggle de vista */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-power-red">
            {filters.isGlobal ? '🌍 Ranking Global' : `Ranking - Cluster ${filters.cluster}`}
          </h2>
          <p className="text-sm text-white/60 mt-1">
            {rankingData.totalPlayers} jugadores · {rankingData.date}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded transition ${
              viewMode === 'table'
                ? 'bg-power-red/30 border border-power-red text-power-red'
                : 'bg-black/40 border border-white/20 text-white/60 hover:border-power-red/60'
            }`}
            title="Vista tabla"
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`p-2 rounded transition ${
              viewMode === 'cards'
                ? 'bg-power-red/30 border border-power-red text-power-red'
                : 'bg-black/40 border border-white/20 text-white/60 hover:border-power-red/60'
            }`}
            title="Vista tarjetas"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs font-semibold text-white/60 uppercase tracking-wider">
                  #
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Ninja
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Nv.
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Poder
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Srv.
                </th>
                {filters.isGlobal && (
                  <th className="text-left py-3 px-4 text-xs font-semibold text-white/60 uppercase tracking-wider">
                    Cluster
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rankingData.players.map((player) => {
                const medal = getMedalEmoji(player.rank);
                const medalColor =
                  MEDAL_COLORS[player.rank as 1 | 2 | 3];
                const isMedal = player.rank <= 3;

                return (
                  <tr
                    key={`${player.rank}-${player.name}`}
                    className={`border-b border-white/5 hover:bg-white/5 transition ${
                      isMedal
                        ? `${medalColor.bg} border-l-2 ${medalColor.border}`
                        : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      {medal ? (
                        <span className="text-xl">{medal}</span>
                      ) : (
                        <span className="text-sm text-white/60 font-semibold">
                          {player.rank}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {player.name}
                    </td>
                    <td className="py-3 px-4 text-white/70">{player.level}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-power-red">
                        {player.power.toLocaleString('es-ES')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white/70">
                      {player.server || 'S??'}
                    </td>
                    {filters.isGlobal && (
                      <td className="py-3 px-4 text-white/70">
                        Cluster {player.cluster}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rankingData.players.map((player) => {
            const medal = getMedalEmoji(player.rank);
            const medalColor =
              MEDAL_COLORS[player.rank as 1 | 2 | 3];
            const isMedal = player.rank <= 3;

            return (
              <div
                key={`${player.rank}-${player.name}`}
                className={`rounded border p-4 transition hover:border-power-red/60 ${
                  isMedal
                    ? `${medalColor.bg} ${medalColor.border} border`
                    : 'bg-black/20 border-white/10'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    {medal ? (
                      <span className="text-2xl">{medal}</span>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white">
                        {player.rank}
                      </div>
                    )}
                  </div>
                  {filters.isGlobal && (
                    <span className="text-xs bg-power-red/20 text-power-red px-2 py-1 rounded">
                      Cluster {player.cluster}
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <h3 className="font-bold text-white truncate">
                    {player.name}
                  </h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Nv. {player.level}</span>
                    <span className="text-white/60">
                      {player.server || 'S??'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-black/30 rounded border border-power-red/20">
                  <p className="text-xs text-white/60 mb-1">Poder</p>
                  <p className="text-lg font-bold text-power-red">
                    {(player.power / 1000000).toFixed(2)}M
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
