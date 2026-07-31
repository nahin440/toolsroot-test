import Image from "next/image";

export function Logo({ className = "size-7" }) {
  return (
    <Image
      src="/logo.png"
      alt="Tools Root Logo"
      width={48}
      height={48}
      className={`${className} shrink-0 object-contain`}
      priority
    />
  );
}

export function LogoMark({ className = "" }) {
  return (
    <div className={`${className} flex items-center gap-2`}>
      <Logo className="size-7" />
      <span className="font-display text-lg font-semibold tracking-tight text-foreground">
        Tools Root
      </span>
    </div>
  );
}