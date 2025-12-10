import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="flex gap-4 p-4 bg-blue-600 text-white">
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/registrations">Registrations</Link>
    </div>
  );
}
