import { motion } from 'framer-motion';
import { Heart, Trophy, UserRound, X } from 'lucide-react';

export default function LeaderboardPanel({
  leaderboard,
  isDrawerOpen,
  onCloseDrawer,
  isLoading,
  isBackendConnected,
}) {
  const isEmpty = !isLoading && leaderboard.length === 0;
  const topLikes = leaderboard[0]?.likes || 0;

  return (
    <>
      {/* Mobile Backdrop */}
      {isDrawerOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCloseDrawer}
          className="fixed inset-0 bg-black/75 z-40 md:hidden"
        />
      )}

      {/* Leaderboard Panel */}
      <aside
        className={`fixed md:relative right-0 top-0 w-[min(84vw,330px)] md:w-[34%] h-screen md:h-auto bg-app-surface border-l border-app-border z-50 md:z-auto flex flex-col transition-transform duration-300 ease-out ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
        aria-label="Top 10 Hall of Fame"
      >
        <header className="flex-shrink-0 px-4 py-4 border-b border-app-border flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-md border border-like/30 bg-like/10 text-like">
              <Trophy size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-app-fg font-black text-lg tracking-tight">Hall of Fame</h2>
              <p className="text-app-muted text-[11px] font-semibold uppercase tracking-wider">
                Top liked profiles
              </p>
            </div>
          </div>
          <button
            onClick={onCloseDrawer}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-md hover:bg-app-bg transition"
            aria-label="Close leaderboard"
          >
            <X size={18} />
          </button>
        </header>

        <section className="flex-1 overflow-y-auto px-3 py-3">
          {!isBackendConnected && (
            <div className="mb-3 rounded-md border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
              Leaderboard sync is paused while the backend is offline.
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-7 h-7 border-2 border-app-border border-t-like rounded-full animate-spin mb-3" />
              <p className="text-app-muted text-sm">Loading...</p>
            </div>
          )}

          {isEmpty && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Trophy size={42} className="text-app-muted/30 mb-4" />
              <p className="text-app-muted/60 text-sm font-medium">No likes yet</p>
              <p className="text-app-muted/40 text-xs">Like a profile to add the first score.</p>
            </div>
          )}

          {!isLoading && leaderboard.length > 0 && (
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
              className="space-y-1"
            >
              {leaderboard.map((item, idx) => {
                const rank = idx + 1;
                const name = item.name || `User ${item.userId}`;
                const likes = item.likes || 0;
                const width = topLikes > 0 ? `${Math.max(10, (likes / topLikes) * 100)}%` : '0%';

                return (
                <motion.li
                  key={item.userId || idx}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.24 }}
                >
                  <div className="relative overflow-hidden rounded-md border border-app-border/70 bg-app-bg/50 px-3 py-2.5 transition-colors hover:border-app-fg/15">
                    <div
                      className="absolute inset-y-0 left-0 bg-like/8"
                      style={{ width }}
                    />
                    <div className="relative flex items-center gap-3">
                    <span className={`grid h-7 w-7 place-items-center rounded-md text-xs font-black tabular-nums ${rank <= 3 ? 'bg-like/15 text-like' : 'bg-app-surface text-app-muted'}`}>
                      {rank}
                    </span>

                    <div className="h-9 w-9 overflow-hidden rounded-full border border-app-border bg-app-surface flex-shrink-0">
                      {item.photo || item.avatar ? (
                        <img
                          src={item.photo || item.avatar}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-app-muted">
                          <UserRound size={16} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-app-fg text-sm font-semibold truncate">{name}</p>
                      <p className="text-app-muted text-[11px] truncate">
                        {item.location || `ID: ${item.userId}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Heart size={14} fill="currentColor" className="text-like" />
                      <span className="text-app-fg font-bold text-sm tabular-nums">{likes}</span>
                    </div>
                    </div>
                  </div>
                </motion.li>
              )})}
            </motion.ul>
          )}
        </section>
      </aside>
    </>
  );
}
