import Link from "next/link";

const TABS = [
  { href: "/portal", label: "Meine Knöpfe" },
  { href: "/portal/messages", label: "Meine Botschaften" },
];

export function PortalNav({ current, isAdmin }: { current: string; isAdmin: boolean }) {
  const tabs = isAdmin ? [...TABS, { href: "/admin", label: "Admin" }] : TABS;
  return (
    <nav className="tabs" aria-label="Bereiche">
      {tabs.map((tab) => (
        <Link key={tab.href} href={tab.href} aria-current={tab.href === current ? "page" : undefined}>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
