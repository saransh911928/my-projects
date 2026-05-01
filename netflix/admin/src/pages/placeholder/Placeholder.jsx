import "./placeholder.css";

export default function Placeholder({ title, message }) {
  return (
    <div className="placeholderPage">
      <h1 className="placeholderTitle">{title}</h1>
      <p className="placeholderMessage">{message}</p>
    </div>
  );
}

