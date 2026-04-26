import { Router } from 'express';
import {
  getRanking,
  getRegions,
  getClusters,
  getTop10,
  getTop100,
  getRankingByServer,
  getGlobalRanking,
  getConsolidatedGlobal,
  compareRankings,
  getAvailableDates,
} from '../controllers/ranking.controller.js';

const router = Router();

// Metadata endpoints
router.get('/regions', getRegions);
router.get('/clusters/:region', getClusters);
router.get('/dates/:region/:cluster', getAvailableDates);

// Ranking data endpoints
router.get('/ranking', getRanking);
router.get('/top10', getTop10);
router.get('/top100', getTop100);
router.get('/by-server', getRankingByServer);
router.get('/global', getGlobalRanking);
router.get('/consolidated-global', getConsolidatedGlobal);

// Comparison endpoint
router.get('/compare', compareRankings);

export default router;
