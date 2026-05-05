import { useState, useEffect, useCallback } from "react";
import LeaderboardPanel from "./components/LeaderboardPanel";
import ProfileCard from "./components/ProfileCard";
import {
  fetchRandomUserBatch,
  fetchLeaderboard,
  incrementUserLike,
  checkServerHealth,
  fetchUserById,
} from "./services/api";
import "./index.css";

const LEADERBOARD_LIMIT = 10;

function mergeLeaderboardProfile(entry, profile) {
  if (!profile) return entry;

  return {
    ...entry,
    profile,
    name:
      entry.name ||
      [profile.name?.first, profile.name?.last].filter(Boolean).join(" "),
    photo:
      entry.photo ||
      entry.avatar ||
      profile.picture?.thumbnail ||
      profile.picture?.medium ||
      profile.picture?.large,
    location:
      entry.location ||
      [profile.location?.city, profile.location?.country]
        .filter(Boolean)
        .join(", "),
  };
}

export default function App() {
  // State: Card Stack
  const [cardStack, setCardStack] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [seenIds, setSeenIds] = useState(new Set());

  // State: Leaderboard
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [profileCache, setProfileCache] = useState({});

  // State: UI
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [backendError, setBackendError] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(true);

  // Get current profile
  const currentProfile = cardStack[currentIndex] || null;

  const cacheProfiles = useCallback((profiles) => {
    setProfileCache((prev) => {
      const next = { ...prev };
      profiles.filter(Boolean).forEach((profile) => {
        if (profile.id != null) next[String(profile.id)] = profile;
      });
      return next;
    });
  }, []);

  const loadLeaderboard = useCallback(
    async (knownProfiles = {}) => {
      setLeaderboardLoading(true);

      const entries = await fetchLeaderboard(LEADERBOARD_LIMIT);
      const hydratedEntries = await Promise.all(
        entries.map(async (entry) => {
          const cached = knownProfiles[String(entry.userId)];
          if (cached) return mergeLeaderboardProfile(entry, cached);
          if (entry.name || entry.photo || entry.avatar) return entry;

          try {
            const fetchedProfile = await fetchUserById(entry.userId);
            return mergeLeaderboardProfile(entry, fetchedProfile);
          } catch {
            return entry;
          }
        }),
      );

      const fetchedProfiles = hydratedEntries
        .map((entry) => entry.profile)
        .filter(Boolean);
      if (fetchedProfiles.length > 0) cacheProfiles(fetchedProfiles);

      setLeaderboard(hydratedEntries);
      setLeaderboardLoading(false);
      return hydratedEntries;
    },
    [cacheProfiles],
  );

  /**
   * Initialize: Fetch random users and leaderboard
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsInitializing(true);
        setBackendError(null);

        // Fetch initial card batch
        const users = await fetchRandomUserBatch(10);
        if (!users || users.length === 0) {
          throw new Error("No users returned from API");
        }

        const userIds = new Set(users.map((u) => u.id));
        const initialCache = Object.fromEntries(
          users.map((user) => [String(user.id), user]),
        );
        setCardStack(users);
        setSeenIds(userIds);
        setProfileCache(initialCache);

        // Backend is optional for swipe. Health is advisory, then leaderboard gets a real attempt.
        await checkServerHealth();

        try {
          await loadLeaderboard(initialCache);
          setIsBackendConnected(true);
        } catch (err) {
          console.warn(
            "Leaderboard fetch failed, continuing in offline mode:",
            err,
          );
          setIsBackendConnected(false);
          setBackendError("Backend is offline. You can still swipe.");
          setLeaderboard([]);
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setBackendError(error.message || "Failed to load profiles");
        setCardStack([]);
      } finally {
        setIsInitializing(false);
        setLeaderboardLoading(false);
      }
    };

    initialize();
  }, [loadLeaderboard]);

  /**
   * Refill card stack when running low
   */
  useEffect(() => {
    if (
      cardStack.length - currentIndex <= 3 &&
      cardStack.length > 0 &&
      !isAnimating
    ) {
      (async () => {
        try {
          const newUsers = await fetchRandomUserBatch(10);
          const newUserIds = newUsers.filter((u) => !seenIds.has(u.id));
          setCardStack((prev) => [...prev, ...newUserIds]);
          cacheProfiles(newUserIds);
          setSeenIds(
            (prev) => new Set([...prev, ...newUsers.map((u) => u.id)]),
          );
        } catch (error) {
          console.error("Error refilling card stack:", error);
        }
      })();
    }
  }, [currentIndex, cardStack.length, seenIds, isAnimating, cacheProfiles]);

  /**
   * Handle like action
   */
  const handleLike = useCallback(async () => {
    if (!currentProfile || isAnimating) return;
    setIsAnimating(true);

    try {
      if (isBackendConnected) {
        const updatedEntry = await incrementUserLike(currentProfile.id);
        const decoratedEntry = mergeLeaderboardProfile(
          updatedEntry,
          currentProfile,
        );
        setLeaderboard((prev) => {
          const withoutCurrent = prev.filter(
            (entry) => String(entry.userId) !== String(decoratedEntry.userId),
          );
          return [decoratedEntry, ...withoutCurrent]
            .sort((a, b) => (b.likes || 0) - (a.likes || 0))
            .slice(0, LEADERBOARD_LIMIT);
        });

        await loadLeaderboard({
          ...profileCache,
          [String(currentProfile.id)]: currentProfile,
        });
      }
    } catch (error) {
      console.error("Error incrementing like:", error);
      setIsBackendConnected(false);
      setBackendError("Backend disconnected. Swiping still works.");
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setIsAnimating(false);
    }, 400);
  }, [currentProfile, isAnimating, isBackendConnected, loadLeaderboard, profileCache]);

  /**
   * Handle dislike action
   */
  const handleDislike = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setIsAnimating(false);
    }, 400);
  }, [isAnimating]);

  /**
   * Retry initialization
   */
  const handleRetry = () => {
    setIsInitializing(true);
    setBackendError(null);
    setCurrentIndex(0);
    setCardStack([]);
    window.location.reload();
  };

  const isBlockingError = !isInitializing && cardStack.length === 0;

  return (
    <div className="h-screen bg-app-bg overflow-hidden flex flex-col md:flex-row">
      <header className="fixed top-0 inset-x-0 z-30 md:hidden px-4 py-2 flex items-center justify-between border-b border-app-border bg-app-bg/95 safe-top">
        <div className="flex items-center gap-2">
          <h1 className="text-app-fg font-semibold tracking-wide text-sm uppercase">
            Swipe
          </h1>
          <span
            className={`inline-flex h-2.5 w-2.5 rounded-full ${isBackendConnected ? "bg-like" : "bg-yellow-400"}`}
            title={isBackendConnected ? "Backend connected" : "Backend offline"}
          />
        </div>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="w-9 h-9 rounded-md border border-app-border bg-app-surface hover:bg-app-border transition-colors active:scale-95"
          aria-label="Open leaderboard"
        >
          <svg
            className="mx-auto"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 8h14M5 12h14M5 16h14" />
          </svg>
        </button>
      </header>

      {!isBackendConnected && !isBlockingError && (
        <div className="fixed top-14 left-4 right-4 md:left-5 md:right-auto md:top-5 z-40 rounded-md border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
          Backend offline: swiping is available, leaderboard sync is paused.
        </div>
      )}

      {isInitializing && (
        <div className="w-full h-screen flex items-center justify-center bg-app-bg">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-app-border border-t-like rounded-full animate-spin mx-auto mb-4" />
            <p className="text-app-muted text-sm">Loading profiles...</p>
          </div>
        </div>
      )}

      {isBlockingError && !isInitializing && (
        <div className="w-full h-screen flex items-center justify-center bg-app-bg px-4">
          <div className="max-w-md text-center">
            <h2 className="text-xl font-bold text-app-fg mb-2">
              Profiles could not load
            </h2>
            <p className="text-app-muted mb-4">
              {backendError || "Unable to load profiles right now."}
            </p>
            <button
              onClick={handleRetry}
              className="px-5 py-2.5 rounded-md bg-like text-app-bg font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {!isInitializing && !isBlockingError && (
        <main className="flex-1 md:w-[66%] border-r border-app-border flex flex-col items-center justify-center px-4 pt-20 pb-5 md:py-6 overflow-y-auto">
          <div className="w-full flex flex-col items-center gap-4">
            <ProfileCard profile={currentProfile} isAnimating={isAnimating} />

            {currentProfile && (
              <div className="w-full max-w-sm rounded-md border border-app-border/70 bg-app-surface px-3 py-2.5">
                <p className="text-app-fg/80 text-sm leading-relaxed mb-2">
                  {currentProfile.name?.first} from{" "}
                  {currentProfile.location?.city},{" "}
                  {currentProfile.location?.country}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex h-6 items-center px-2 rounded-md border border-app-border/70 bg-app-bg/60 text-app-fg/70 text-[11px] font-semibold uppercase">
                    {currentProfile.nat}
                  </span>
                  <span className="inline-flex h-6 items-center px-2 rounded-md border border-app-border/70 bg-app-bg/60 text-app-fg/70 text-[11px] font-semibold uppercase">
                    ID: {currentProfile.id}
                  </span>
                </div>
              </div>
            )}

            <div className="w-full max-w-sm grid grid-cols-2 gap-2.5">
              <button
                onClick={handleDislike}
                disabled={isAnimating}
                className="group relative flex items-center justify-start gap-2 h-12 rounded-md border border-dislike/50 bg-app-surface hover:bg-dislike/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 px-2.5"
              >
                <div className="w-8 h-8 rounded-md border border-dislike/60 flex items-center justify-center flex-shrink-0">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-dislike"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </div>
                <div className="grid gap-0.5 leading-none">
                  <strong className="text-app-fg text-sm font-bold uppercase">
                    Pass
                  </strong>
                </div>
              </button>

              <button
                onClick={handleLike}
                disabled={isAnimating}
                className="group relative flex items-center justify-start gap-2 h-12 rounded-md border border-like/55 bg-app-surface hover:bg-like/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 px-2.5"
              >
                <div className="w-8 h-8 rounded-md border border-like/65 flex items-center justify-center flex-shrink-0">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-like"
                  >
                    <path d="M20.8 4.6c-1.8-2-4.8-1.9-6.6.1L12 7l-2.2-2.3c-1.8-2-4.8-2.1-6.6-.1-2 2.1-2 5.4 0 7.5L12 21l8.8-8.9c2-2.1 2-5.4 0-7.5Z" />
                  </svg>
                </div>
                <div className="grid gap-0.5 leading-none">
                  <strong className="text-app-fg text-sm font-bold uppercase">
                    Like
                  </strong>
                </div>
              </button>
            </div>
          </div>
        </main>
      )}

      {!isInitializing && !isBlockingError && (
        <LeaderboardPanel
          leaderboard={leaderboard}
          isDrawerOpen={isDrawerOpen}
          onCloseDrawer={() => setIsDrawerOpen(false)}
          isLoading={leaderboardLoading}
          isBackendConnected={isBackendConnected}
        />
      )}
    </div>
  );
}
