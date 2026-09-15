import Image from "next/image";

type LogoProps = {
  className?: string;
  light?: boolean;
};

export function Logo({ className = "", light = false }: LogoProps) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <Image
        src="/brand/logo.png"
        alt="The Clinic"
        width={180}
        height={28}
        className={`h-7 w-auto md:h-8 ${light ? "brightness-0 invert" : ""}`}
        priority
      />
    </span>
  );
}
