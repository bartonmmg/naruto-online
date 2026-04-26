import { Request, Response } from 'express';
import { rankingService } from '../services/ranking.service.js';

export const getRanking = (req: Request, res: Response): void => {
  try {
    const filters = rankingService.validateFilters(req.query);
    const ranking = rankingService.getRanking(filters);
    res.json(ranking);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
};

export const getRegions = (req: Request, res: Response): void => {
  try {
    const regions = rankingService.getRegions();
    res.json(regions);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
};

export const getClusters = (req: Request, res: Response): void => {
  try {
    const { region } = req.params;
    if (!region) {
      res.status(400).json({ error: 'region parameter required' });
      return;
    }
    const clusters = rankingService.getClusters(region);
    res.json(clusters);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
};

export const getTop10 = (req: Request, res: Response): void => {
  try {
    const { region, cluster, date } = req.query;

    if (!region || !cluster || !date) {
      res
        .status(400)
        .json({
          error: 'region, cluster, and date query parameters required',
        });
      return;
    }

    const ranking = rankingService.getTop10(
      String(region),
      Number(cluster),
      String(date)
    );
    res.json(ranking);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
};

export const getTop100 = (req: Request, res: Response): void => {
  try {
    const { region, cluster, date } = req.query;

    if (!region || !cluster || !date) {
      res
        .status(400)
        .json({
          error: 'region, cluster, and date query parameters required',
        });
      return;
    }

    const ranking = rankingService.getTop100(
      String(region),
      Number(cluster),
      String(date)
    );
    res.json(ranking);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
};

export const getRankingByServer = (req: Request, res: Response): void => {
  try {
    const { region, cluster, date, server } = req.query;

    if (!region || !cluster || !date || !server) {
      res.status(400).json({
        error: 'region, cluster, date, and server query parameters required',
      });
      return;
    }

    const ranking = rankingService.getRankingByServer(
      String(region),
      Number(cluster),
      String(date),
      String(server)
    );
    res.json(ranking);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
};

export const getGlobalRanking = (req: Request, res: Response): void => {
  try {
    const { region, date, limit = 100 } = req.query;

    if (!region || !date) {
      res
        .status(400)
        .json({
          error: 'region and date query parameters required for global ranking',
        });
      return;
    }

    const globalRanking = rankingService.getGlobalRanking(
      String(region),
      String(date),
      Number(limit)
    );
    res.json(globalRanking);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
};

export const getConsolidatedGlobal = (req: Request, res: Response): void => {
  try {
    const { date, limit = 100 } = req.query;

    if (!date) {
      res.status(400).json({ error: 'date query parameter required' });
      return;
    }

    const globalRanking = rankingService.getConsolidatedGlobal(
      String(date),
      Number(limit)
    );
    res.json(globalRanking);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
};

export const compareRankings = (req: Request, res: Response): void => {
  try {
    const { region, cluster, dates } = req.query;

    if (!region || !cluster || !dates) {
      res.status(400).json({
        error: 'region, cluster, and dates query parameters required',
      });
      return;
    }

    const dateArray = String(dates)
      .split(',')
      .map((d) => d.trim());
    const comparison = rankingService.compareMonths(
      String(region),
      Number(cluster),
      dateArray
    );
    res.json(comparison);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
};

export const getAvailableDates = (req: Request, res: Response): void => {
  try {
    const { region, cluster } = req.params;

    if (!region || !cluster) {
      res.status(400).json({ error: 'region and cluster parameters required' });
      return;
    }

    const dates = rankingService.getAvailableDates(region, Number(cluster));
    res.json(dates);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
};
