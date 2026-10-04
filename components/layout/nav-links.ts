export const PUBLIC_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
] as const;

export function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
