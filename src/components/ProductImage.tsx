import Image from "next/image";

export function ProductImage({
  src,
  alt,
  className = "object-contain p-6",
  priority = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  if (!src) {
    return <div className="h-full w-full bg-[#eef3f3]" />;
  }

  const external = src.startsWith("http") || src.startsWith("data:");
  if (external) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={`h-full w-full ${className}`} />
    );
  }

  return (
    <Image src={src} alt={alt} fill className={className} priority={priority} />
  );
}
