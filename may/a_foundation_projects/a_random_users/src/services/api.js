const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/random_match';

const RANDOM_USER_API_BASE = import.meta.env.VITE_RANDOM_USER_API_BASE || 'https://api.freeapi.app/api/v1/public/randomusers';
const LEADERBOARD_ENDPOINT = import.meta.env.VITE_API_LEADERBOARD_ENDPOINT || '/leaderboard';
const LIKE_ENDPOINT = import.meta.env.VITE_API_LIKE_ENDPOINT || '/leaderboard/like';
const HEALTH_ENDPOINT = import.meta.env.VITE_API_HEALTH_ENDPOINT || '/health';
const CONFIG_ENDPOINT = import.meta.env.VITE_API_CONFIG_ENDPOINT || '/config';

function joinUrl(base, path) {
    return `${base.replace(/\/$/, '')}/${String(path).replace(/^\//, '')}`;
}

function unwrapData(payload) {
    if (Array.isArray(payload)) return payload;
    return payload?.data ?? payload?.leaderboard ?? payload?.results ?? payload ?? null;
}

function normalizeLeaderboardEntry(entry) {
    const userId = entry?.userId ?? entry?.id ?? entry?._id;
    return {
        ...entry,
        userId: userId != null ? String(userId) : '',
        likes: Number(entry?.likes ?? entry?.score ?? entry?.count ?? 0),
    };
}

/**
 * Fetch a batch of random users (10 by default)
 */
export async function fetchRandomUserBatch(count = 10) {
    try {
        const promises = Array.from({ length: count }).map(() =>
            fetch(`${RANDOM_USER_API_BASE}/user/random`)
                .then(res => res.json())
                .then(data => data.data)
        );
        const users = await Promise.all(promises);
        return users;
    } catch (error) {
        console.error('Error fetching random user batch:', error);
        throw error;
    }
}

/**
 * Fetch a specific user by ID for profile enrichment
 */
export async function fetchUserById(userId) {
    try {
        const response = await fetch(joinUrl(RANDOM_USER_API_BASE, userId));
        const data = await response.json();
        return unwrapData(data);
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        throw error;
    }
}

/**
 * GET /api/random_match/leaderboard - Fetch top leaderboard entries
 */
export async function fetchLeaderboard(limit = 10) {
    try {
        const params = new URLSearchParams();
        if (limit) params.set('limit', limit);

        const response = await fetch(`${joinUrl(API_BASE_URL, LEADERBOARD_ENDPOINT)}?${params}`);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        const leaderboard = unwrapData(data);
        return Array.isArray(leaderboard)
            ? leaderboard.map(normalizeLeaderboardEntry).filter((entry) => entry.userId)
            : [];
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
    }
}

/**
 * POST /api/random_match/leaderboard/like - Increment likes for a user
 */
export async function incrementUserLike(userId) {
    try {
        const stableUserId = userId != null ? String(userId) : '';
        if (!stableUserId) {
            throw new Error('Invalid userId: expected a non-empty value');
        }

        const response = await fetch(joinUrl(API_BASE_URL, LIKE_ENDPOINT), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: stableUserId }),
        });
        const data = await response.json();
        if (!response.ok || data.success === false || data.status === 'error') {
            throw new Error(data.message || `Server error: ${response.status}`);
        }
        return normalizeLeaderboardEntry(unwrapData(data) || { userId: stableUserId, likes: 1 });
    } catch (error) {
        console.error('Error incrementing like:', error);
        throw error;
    }
}

/**
 * GET /api/random_match/health - Check server health
 */
export async function checkServerHealth() {
    try {
        const response = await fetch(joinUrl(API_BASE_URL, HEALTH_ENDPOINT));
        if (!response.ok) throw new Error(`Server unhealthy: ${response.status}`);
        const data = await response.json();
        return ['healthy', 'ok', 'success'].includes(String(data.status).toLowerCase());
    } catch (error) {
        console.error('Health check failed:', error);
        return false;
    }
}

/**
 * GET /api/random_match/config - Fetch server configuration/version
 */
export async function fetchServerConfig() {
    try {
        const response = await fetch(joinUrl(API_BASE_URL, CONFIG_ENDPOINT));
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching server config:', error);
        return null;
    }
}
