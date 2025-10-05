export default function Button({ title, onClick, leftIcon, containerClass }) {
  return (
    <button onClick={onClick} className={`${containerClass || ""} px-3 py-2 rounded`}>
      {leftIcon}
      <span className="ml-2">{title}</span>
    </button>
  );
}