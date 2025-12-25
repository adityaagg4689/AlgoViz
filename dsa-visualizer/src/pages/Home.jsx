import { Link } from "react-router-dom";

export default function Home() {
  const pages = [
    ["Array", "/array"],
    ["Linked List", "/linked-list"],
    ["Stack", "/stack"],
    ["Queue", "/queue"],
    ["Tree (AVL)", "/tree"],
    ["Graph", "/graph"],
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white grid grid-cols-2 md:grid-cols-3 gap-6 p-10">
      {pages.map(([n, p]) => (
        <Link key={p} to={p} className="bg-indigo-600 p-8 rounded-xl text-center">
          {n}
        </Link>
      ))}
    </div>
  );
}
