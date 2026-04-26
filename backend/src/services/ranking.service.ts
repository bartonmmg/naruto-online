import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data/db.json');

function getDbData() {
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

interface Player {
  rank: number;
  name: string;
  server: string | null;
  level: number;
  power: number;
}

interface RankingSnapshot {
  region: string;
  cluster: number;
  date: string;
  updatedAt: string;
  totalPlayers: number;
  players: Player[];
}

interface RankingFilters {
  region?: string;
  cluster?: number;
  date?: string;
  server?: string | null;
  limit?: number;
}

const getRankingSchema = z.object({
  region: z.string().optional(),
  cluster: z.coerce.number().optional(),
  date: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  server: z.string().nullable().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

class RankingService {
  private cache: Map<string, RankingSnapshot> = new Map();

  constructor() {
    this.initializeCache();
  }

  private initializeCache(): void {
    getDbData().rankings.forEach((ranking: any) => {
      const key = `${ranking.region}-${ranking.cluster}-${ranking.date}`;
      this.cache.set(key, {
        region: ranking.region,
        cluster: ranking.cluster,
        date: ranking.date,
        updatedAt: ranking.updatedAt,
        totalPlayers: ranking.totalPlayers,
        players: ranking.players,
      });
    });
  }

  getRegions(): Array<{ id: string; name: string }> {
    const regions = getDbData().meta.regions || [];
    const regionNames: Record<string, string> = {
      ES: 'España',
      LATAM: 'Latinoamérica',
    };

    return regions.map((r: string) => ({
      id: r,
      name: regionNames[r] || r,
    }));
  }

  getClusters(region: string): Array<{ id: number; name: string }> {
    // Obtener clusters que tienen datos para esta región
    const rankings = getDbData().rankings || [];
    const availableClusters = new Set(
      rankings
        .filter((r: any) => r.region === region)
        .map((r: any) => r.cluster)
    );

    // Ordenar y devolver solo los disponibles
    const clusters = Array.from(availableClusters).sort((a, b) => (a as number) - (b as number));
    return clusters.map((c: any) => ({
      id: c,
      name: `Cluster ${c}`,
    }));
  }

  getRanking(filters: RankingFilters): RankingSnapshot {
    const { region, cluster, date, server, limit = 100 } = filters;

    if (!region || cluster === undefined || !date) {
      throw new Error('region, cluster, and date are required');
    }

    const key = `${region}-${cluster}-${date}`;
    const ranking = this.cache.get(key);

    if (!ranking) {
      throw new Error(
        `No ranking found for region: ${region}, cluster: ${cluster}, date: ${date}`
      );
    }

    let players = [...ranking.players];

    // Filter by server if provided
    if (server) {
      players = players.filter((p) => p.server === server);
    }

    // Apply limit
    players = players.slice(0, limit);

    return {
      ...ranking,
      players,
      totalPlayers: players.length,
    };
  }

  getTop10(region: string, cluster: number, date: string): RankingSnapshot {
    return this.getRanking({ region, cluster, date, limit: 10 });
  }

  getTop100(region: string, cluster: number, date: string): RankingSnapshot {
    return this.getRanking({ region, cluster, date, limit: 100 });
  }

  getRankingByServer(
    region: string,
    cluster: number,
    date: string,
    server: string
  ): RankingSnapshot {
    return this.getRanking({ region, cluster, date, server });
  }

  getGlobalRanking(region: string, date: string, limit: number = 100): {
    region: string;
    date: string;
    updatedAt: string;
    totalPlayers: number;
    players: Array<Player & { cluster: number }>;
  } {
    const clusters = getDbData().meta.clusters || [];
    const allPlayers: Array<Player & { cluster: number }> = [];

    clusters.forEach((cluster: number) => {
      const key = `${region}-${cluster}-${date}`;
      const ranking = this.cache.get(key);

      if (ranking) {
        ranking.players.forEach((player) => {
          allPlayers.push({
            ...player,
            cluster,
          });
        });
      }
    });

    // Sort by power descending and reassign ranks
    allPlayers.sort((a, b) => b.power - a.power);

    const topPlayers = allPlayers.slice(0, limit).map((player, index) => ({
      ...player,
      rank: index + 1,
    }));

    return {
      region,
      date,
      updatedAt: new Date().toISOString().split('T')[0],
      totalPlayers: topPlayers.length,
      players: topPlayers,
    };
  }

  compareMonths(
    region: string,
    cluster: number,
    dates: string[]
  ): {
    region: string;
    cluster: number;
    comparison: Array<{
      playerName: string;
      servers: Array<string | null>;
      powerDelta: number;
      oldRank: number | null;
      newRank: number | null;
      oldPower: number | null;
      newPower: number | null;
    }>;
  } {
    if (dates.length < 2) {
      throw new Error('At least 2 dates required for comparison');
    }

    const oldDate = dates[0];
    const newDate = dates[dates.length - 1];

    const oldRanking = this.getRanking({
      region,
      cluster,
      date: oldDate,
      limit: 100,
    });
    const newRanking = this.getRanking({
      region,
      cluster,
      date: newDate,
      limit: 100,
    });

    const oldPlayerMap = new Map(oldRanking.players.map((p) => [p.name, p]));
    const newPlayerMap = new Map(newRanking.players.map((p) => [p.name, p]));

    const allPlayerNames = new Set([
      ...oldPlayerMap.keys(),
      ...newPlayerMap.keys(),
    ]);

    const comparison = Array.from(allPlayerNames)
      .map((playerName) => {
        const oldPlayer = oldPlayerMap.get(playerName);
        const newPlayer = newPlayerMap.get(playerName);

        return {
          playerName,
          servers: Array.from(
            new Set(
              [oldPlayer?.server, newPlayer?.server].filter(
                (s) => s !== undefined
              )
            )
          ) as Array<string | null>,
          powerDelta: (newPlayer?.power ?? 0) - (oldPlayer?.power ?? 0),
          oldRank: oldPlayer?.rank ?? null,
          newRank: newPlayer?.rank ?? null,
          oldPower: oldPlayer?.power ?? null,
          newPower: newPlayer?.power ?? null,
        };
      })
      .sort((a, b) => b.powerDelta - a.powerDelta);

    return {
      region,
      cluster,
      comparison,
    };
  }

  getAvailableDates(region: string, cluster: number): string[] {
    const rankings = getDbData().rankings || [];
    const dates = rankings
      .filter((r: any) => r.region === region && r.cluster === cluster)
      .map((r: any) => r.date)
      .sort()
      .reverse();

    return dates;
  }

  getAllDates(): string[] {
    const rankings = getDbData().rankings || [];
    const dates = Array.from(
      new Set(rankings.map((r: any) => r.date))
    ) as string[];
    dates.sort().reverse();
    return dates;
  }

  validateFilters(filters: unknown): RankingFilters {
    return getRankingSchema.parse(filters);
  }

  getConsolidatedGlobal(date: string, limit: number = 100): {
    date: string;
    updatedAt: string;
    totalPlayers: number;
    players: Array<Player & { region: string; cluster: number }>;
  } {
    const rankings = getDbData().rankings || [];
    const allPlayers: Array<Player & { region: string; cluster: number }> = [];

    // Recolectar todos los jugadores de todas las regiones y clusters
    rankings.forEach((ranking: any) => {
      if (ranking.date === date) {
        ranking.players.forEach((player: Player) => {
          allPlayers.push({
            ...player,
            region: ranking.region,
            cluster: ranking.cluster,
          });
        });
      }
    });

    // Ordenar por poder descendente y reasignar ranks
    allPlayers.sort((a, b) => b.power - a.power);

    const topPlayers = allPlayers.slice(0, limit).map((player, index) => ({
      ...player,
      rank: index + 1,
    }));

    return {
      date,
      updatedAt: new Date().toISOString().split('T')[0],
      totalPlayers: topPlayers.length,
      players: topPlayers,
    };
  }
}

export const rankingService = new RankingService();
