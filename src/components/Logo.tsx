import Image from "next/image";
import { MJ_BRAND_NAME } from "@/lib/mj/brand";

type LogoProps = {
  className?: string;
  light?: boolean;
};

export function Logo({ className = "", light = false }: LogoProps) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <Image
        src="/brand/logo.png"
        alt={MJ_BRAND_NAME}
        width={180}
        height={28}
        className={`h-7 w-auto md:h-8 ${light ? "brightness-0 invert" : ""}`}
        priority
      />
    </span>
  );
}
