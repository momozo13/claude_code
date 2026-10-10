import type { Player } from '../types';

export default function PlayerSelect({
  players,
  value,
  onChange,
  placeholder = '—',
  className = '',
}: {
  players: Player[];
  value?: string;
  onChange: (id: string | undefined) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <select
      className={`input ${className}`}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || undefined)}
    >
      <option value="">{placeholder}</option>
      {players.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
          {p.status !== 'alive' ? '（死）' : ''}
        </option>
      ))}
    </select>
  );
}
