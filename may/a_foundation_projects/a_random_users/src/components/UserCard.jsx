
const UserCard = ({ image, name, location }) => {
  const hasImage = typeof image === 'string' && image.trim() !== '' && image !== 'loading';
  const initials = name
    ? name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0])
        .join('')
        .toUpperCase()
    : '•';

  return (
    <article className="user-card">
      <div className="user-card__image-wrap">
        {hasImage ? (
          <img src={image} alt={name ? `${name} profile portrait` : 'User profile portrait'} className="user-card__image" />
        ) : (
          <div className="user-card__placeholder" aria-hidden="true">
            {initials}
          </div>
        )}
      </div>

      <div className="user-card__content">
        <p className="user-card__eyebrow">Random user</p>
        <h2 className="user-card__name">{name}</h2>
        <p className="user-card__location">{location}</p>
      </div>
    </article>
  );
}

export default UserCard