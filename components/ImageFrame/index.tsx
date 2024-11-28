import Image, { StaticImageData } from "next/image";

export default function ImageFrame({
  alt,
  image,
}: {
  alt: string;
  image: StaticImageData;
}) {
  return (
    <div className="w-1/3 relative flex flex-1">
      <div className="absolute w-full h-full image-frame z-10" />
      <Image alt={alt} loading="eager" src={image} />
    </div>
  );
}
