export default function Logo({ className = 'h-10 w-10' }) {
  return (
    <img
      src="/dokanBhai_logo.png"
      alt="দোকানভাই"
      className={`rounded-xl object-cover ${className}`}
    />
  )
}
