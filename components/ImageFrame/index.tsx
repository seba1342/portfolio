import Image, { StaticImageData } from "next/image";

export default function ImageFrame({
  alt,
  height = "auto",
  image,
  width = "w-1/3",
}: {
  alt: string;
  height?: string;
  image: StaticImageData;
  width?: string;
}) {
  return (
    <div className={`${width} ${height} relative`}>
      <div className="absolute w-full h-full image-frame z-10" />
      <Image alt={alt} loading="eager" src={image} />
    </div>
  );
}
