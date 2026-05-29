import Link from "next/link";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/run-today", label: "Run Today" },
  { href: "/calendar", label: "Calendar" },
  { href: "/approvals", label: "Approvals" },
  { href: "/social/imports", label: "Imports" },
  { href: "/metrics", label: "Metrics" },
  { href: "/prompts", label: "Prompts" },
];

export function ContentPageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f5f7f4] px-4 py-6 text-[#17211d] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md border border-stone-200 bg-white px-3 py-1.5 font-medium text-stone-700 hover:border-emerald-300 hover:text-[#1e6b4d]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <header className="mt-5 border-b border-stone-200 pb-5">
          <p className="text-xs font-semibold uppercase text-stone-500">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">{description}</p>
        </header>
        <div className="py-5">{children}</div>
      </div>
    </main>
  );
}
