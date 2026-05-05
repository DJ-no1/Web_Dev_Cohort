import { Mail, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfileCard({ profile }) {
  if (!profile) return null;

  const cardVariants = {
    initial: {
      y: 32,
      scale: 0.95,
      opacity: 0,
    },
    animate: {
      y: 0,
      scale: 1,
      opacity: 1,
      transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
    },
    exit: {
      scale: 0.95,
      opacity: 0,
    },
  };

  return (
    <motion.div
      key={profile.id}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative w-full max-w-sm rounded-card overflow-hidden border border-app-border/70 bg-app-surface shadow-[0_22px_70px_-45px_rgba(9,9,11,0.95)]"
      style={{ height: 'min(61dvh, 560px)' }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: profile.picture?.large
            ? `url('${profile.picture.large}')`
            : profile.photo
            ? `url('${profile.photo}')`
            : `linear-gradient(150deg, oklch(0.28 0.03 250) 0%, oklch(0.38 0.04 170) 52%, oklch(0.16 0.01 250) 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-app-bg/95 via-app-bg/38 to-app-bg/8" />
      </div>

      <div className="absolute top-3 left-3 right-3 z-10 flex gap-2">
        <div className="inline-flex min-w-0 items-center gap-1.5 h-7 px-2.5 rounded-full border border-app-fg/15 bg-app-bg/72 text-app-fg text-[11px] font-semibold">
          <MapPin size={12} className="flex-shrink-0 text-app-muted" />
          <span className="truncate">
            {profile.location?.city || 'Unknown'}, {profile.location?.country || ''}
          </span>
        </div>
        <div className="ml-auto inline-flex items-center h-7 px-2.5 rounded-full border border-like/35 bg-like/10 text-like text-[11px] font-bold">
          {profile.nat || 'NEW'}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
        <div className="flex items-end gap-2 mb-2">
          <h2 className="text-app-fg text-3xl font-black leading-none">
            {profile.name?.first} {profile.name?.last}
          </h2>
          <span className="text-app-fg/70 text-base font-semibold">{profile.dob?.age}</span>
        </div>

        <div className="flex items-center gap-2 text-app-fg/68 mb-2">
          <MapPin size={15} />
          <span className="text-sm truncate">
            {profile.location?.city}, {profile.location?.country}
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-2 text-app-muted">
          <Mail size={14} className="flex-shrink-0" />
          <p className="truncate text-xs font-medium">{profile.email}</p>
        </div>
      </div>
    </motion.div>
  );
}
