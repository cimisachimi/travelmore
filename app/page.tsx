// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Welcome</h1>
      <p className="mb-4">Basic Next.js + Prisma + Tailwind setup.</p>
      <Link className="btn" href="/about">About</Link>
      <div className="bg-primer text-black">Primer</div>
      <div className="bg-sekunder text-black">Sekunder</div>

    </div>
  );
}
