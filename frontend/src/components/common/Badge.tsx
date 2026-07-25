interface BadgeProps {
  label: string;
  color?: 'blue' | 'green' | 'red' | 'gray';
}

export const Badge: React.FC<BadgeProps> = ({ label, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[color]}`}>
      {label}
    </span>
  );
};