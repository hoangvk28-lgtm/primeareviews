import Image from "next/image";

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Image src="/logo-mark.png" alt="" width={36} height={36} unoptimized priority aria-hidden="true" />
      <span className={`font-display text-xl font-semibold tracking-tight ${inverse ? "text-white" : "text-pine"}`}>
        Primea<span className="text-gold"> Reviews</span>
      </span>
    </span>
  );
}
