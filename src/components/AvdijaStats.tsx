import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import { deniAvdijaInfo } from '@/data/content';

const ESPN_GAMELOG_URL = `https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/${deniAvdijaInfo.espnAthleteId}/gamelog`;
const CACHE_KEY = 'avdija_gamelog_cache_v1';
const STATS_LABELS = ['MIN', 'FG', 'FG%', '3PT', '3P%', 'FT', 'FT%', 'REB', 'AST', 'BLK', 'STL', 'PF', 'TO', 'PTS'] as const;

interface GameStats {
  date: string;
  opponent: string;
  result: 'W' | 'L';
  score: string;
  points: number;
  rebounds: number;
  assists: number;
  blocks: number;
  steals: number;
  minutes: number;
  fgPct: number;
  fg3Pct: number;
  ftPct: number;
  turnovers: number;
}

interface SeasonStats {
  seasonLabel: string;
  gamesPlayed: number;
  ppg: number;
  rpg: number;
  apg: number;
  fgPct: number;
  fg3Pct: number;
  ftPct: number;
  spg: number;
  bpg: number;
  topg: number;
  mpg: number;
  mostRecentGame: GameStats | null;
}

interface StatCard {
  label: string;
  value: string;
  sublabel?: string;
  highlight?: boolean;
}

interface CachedPayload {
  json: unknown;
  fetchedAt: number;
}

function toNum(value: string | undefined): number {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseGamelog(data: unknown): SeasonStats | null {
  if (!data || typeof data !== 'object') return null;
  const root = data as Record<string, unknown>;
  const labels = Array.isArray(root.labels) ? (root.labels as string[]) : Array.from(STATS_LABELS);
  const eventsMap = root.events as Record<string, Record<string, unknown>> | undefined;
  const seasonTypes = Array.isArray(root.seasonTypes) ? (root.seasonTypes as Array<Record<string, unknown>>) : [];

  const regularSeason = seasonTypes.find((st) => {
    const name = String(st.displayName ?? '');
    return /regular season/i.test(name);
  });
  if (!regularSeason) return null;

  const categories = Array.isArray(regularSeason.categories) ? (regularSeason.categories as Array<Record<string, unknown>>) : [];
  const games: GameStats[] = [];

  for (const category of categories) {
    const catGames = Array.isArray(category.events) ? (category.events as Array<Record<string, unknown>>) : [];
    for (const gameEntry of catGames) {
      const eventId = String(gameEntry.eventId ?? '');
      const rawStats = Array.isArray(gameEntry.stats) ? (gameEntry.stats as string[]) : [];
      const statsByLabel: Record<string, string> = {};
      labels.forEach((label, i) => {
        statsByLabel[label] = rawStats[i] ?? '';
      });

      const meta = eventsMap?.[eventId];
      const gameDate = meta ? String(meta.gameDate ?? '') : '';
      const opponentObj = meta?.opponent as Record<string, unknown> | undefined;
      const opponent = opponentObj ? String(opponentObj.displayName ?? '—') : '—';
      const result = String(meta?.gameResult ?? '') === 'L' ? 'L' : 'W';
      const score = String(meta?.score ?? '—');

      games.push({
        date: gameDate,
        opponent,
        result,
        score,
        points: toNum(statsByLabel['PTS']),
        rebounds: toNum(statsByLabel['REB']),
        assists: toNum(statsByLabel['AST']),
        blocks: toNum(statsByLabel['BLK']),
        steals: toNum(statsByLabel['STL']),
        minutes: toNum(statsByLabel['MIN']),
        fgPct: toNum(statsByLabel['FG%']),
        fg3Pct: toNum(statsByLabel['3P%']),
        ftPct: toNum(statsByLabel['FT%']),
        turnovers: toNum(statsByLabel['TO']),
      });
    }
  }

  games.sort((a, b) => a.date.localeCompare(b.date));

  if (games.length === 0) return null;

  const n = games.length;
  const avg = (selector: (g: GameStats) => number) => games.reduce((sum, g) => sum + selector(g), 0) / n;

  const filters = Array.isArray(root.filters) ? (root.filters as Array<Record<string, unknown>>) : [];
  const seasonFilter = filters.find((f) => f.name === 'season');
  const seasonValue = seasonFilter ? String(seasonFilter.value ?? '') : '';
  const seasonLabel = (() => {
    if (!seasonFilter) return '';
    const options = Array.isArray(seasonFilter.options) ? (seasonFilter.options as Array<Record<string, unknown>>) : [];
    const match = options.find((o) => String(o.value ?? '') === seasonValue);
    return match ? String(match.displayValue ?? '') : '';
  })();

  return {
    seasonLabel,
    gamesPlayed: n,
    ppg: avg((g) => g.points),
    rpg: avg((g) => g.rebounds),
    apg: avg((g) => g.assists),
    fgPct: avg((g) => g.fgPct),
    fg3Pct: avg((g) => g.fg3Pct),
    ftPct: avg((g) => g.ftPct),
    spg: avg((g) => g.steals),
    bpg: avg((g) => g.blocks),
    topg: avg((g) => g.turnovers),
    mpg: avg((g) => g.minutes),
    mostRecentGame: games[games.length - 1],
  };
}

function readCache(): CachedPayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPayload;
    if (!parsed || typeof parsed !== 'object' || parsed.json === undefined) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(json: unknown): void {
  try {
    const payload: CachedPayload = { json, fetchedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / serialization errors
  }
}

function formatGameDate(iso: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function AvdijaStats() {
  const [stats, setStats] = useState<SeasonStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingCache, setUsingCache] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    const url = `${ESPN_GAMELOG_URL}?t=${Date.now()}`;
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      const data: unknown = await response.json();
      const parsed = parseGamelog(data);
      if (!parsed) throw new Error('Could not parse season data from response');

      writeCache(data);
      setStats(parsed);
      setUsingCache(false);
      setLastUpdated(new Date());
    } catch {
      const cached = readCache();
      if (cached) {
        const parsed = parseGamelog(cached.json);
        if (parsed) {
          setStats(parsed);
          setUsingCache(true);
          setLastUpdated(new Date(cached.fetchedAt));
          setError('Live stats unavailable — showing cached data.');
        } else {
          setError('Live stats unavailable and cached data is invalid.');
          setStats(null);
        }
      } else {
        setError('Stats are temporarily unavailable. Please try again in a moment.');
        setStats(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const statCards: StatCard[] = stats ? [
    { label: 'Points', value: stats.ppg.toFixed(1), sublabel: 'per game', highlight: true },
    { label: 'Rebounds', value: stats.rpg.toFixed(1), sublabel: 'per game' },
    { label: 'Assists', value: stats.apg.toFixed(1), sublabel: 'per game' },
    { label: 'FG %', value: stats.fgPct.toFixed(1) + '%' },
    { label: '3PT %', value: stats.fg3Pct.toFixed(1) + '%' },
    { label: 'FT %', value: stats.ftPct.toFixed(1) + '%' },
    { label: 'Steals', value: stats.spg.toFixed(1) },
    { label: 'Blocks', value: stats.bpg.toFixed(1) },
    { label: 'Minutes', value: stats.mpg.toFixed(1), sublabel: 'per game' },
    { label: 'Games', value: String(stats.gamesPlayed), sublabel: 'played' },
  ] : [];

  const lastGame = stats?.mostRecentGame ?? null;
  const lastGameDateText = lastGame ? formatGameDate(lastGame.date) : '';

  return (
    <div className="reveal mb-12">
      <div className="glass-card rounded-2xl p-5 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center flex-shrink-0 font-bold text-white text-lg">DA</div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{deniAvdijaInfo.fullName}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 font-medium">{deniAvdijaInfo.nickname}</span>
              </div>
              <p className="text-sm text-neutral-400">{deniAvdijaInfo.team} · {deniAvdijaInfo.position} · {deniAvdijaInfo.height}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {usingCache && <span className="flex items-center gap-1.5 text-amber-400/80 text-xs"><AlertCircle size={14} />Using cached stats</span>}
            {lastUpdated && !loading && <span className="text-neutral-500 text-xs hidden sm:inline">Updated {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>}
            <button onClick={fetchStats} disabled={loading} className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card-hover text-neutral-300 hover:text-white text-xs font-medium disabled:opacity-50">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />Refresh
            </button>
          </div>
        </div>
      </div>

      {loading && !stats ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-5 animate-pulse">
              <div className="h-8 w-16 bg-neutral-700/50 rounded mb-2" />
              <div className="h-3 w-12 bg-neutral-700/30 rounded" />
            </div>
          ))}
        </div>
      ) : error && !stats ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <AlertCircle className="mx-auto mb-3 text-amber-400/70" size={28} />
          <p className="text-neutral-300 text-sm">{error}</p>
          <button onClick={fetchStats} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg glass-card-hover text-neutral-200 hover:text-white text-sm font-medium">
            <RefreshCw size={14} />Try again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className={`glass-card glass-card-hover rounded-xl p-5 text-center relative overflow-hidden ${card.highlight ? 'ring-1 ring-red-600/30' : ''}`}>
              {card.highlight && <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-600 to-orange-400" />}
              <div className={`text-3xl sm:text-4xl font-black mb-1 ${card.highlight ? 'gradient-text' : 'text-white'}`}>{card.value}</div>
              <div className="text-xs sm:text-sm text-neutral-400 font-medium">{card.label}</div>
              {card.sublabel && <div className="text-xs text-neutral-600 mt-0.5">{card.sublabel}</div>}
            </div>
          ))}
        </div>
      )}

      {stats && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-neutral-500">
            <TrendingUp size={16} className="text-red-400" />
            <span>Season Averages{stats.seasonLabel ? ` — ${stats.seasonLabel}` : ''}</span>
          </div>
          {lastGame && lastGameDateText && (
            <div className="flex items-center gap-2 text-neutral-500">
              <Calendar size={16} className="text-red-400" />
              <span>Last game: {lastGameDateText} vs {lastGame.opponent} ({lastGame.result} {lastGame.score})</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
