export default function CensoredText({
  maskedWord,
  word,
}: {
  maskedWord: string;
  word: string;
}) {
  const arrOfChars = Array.from(maskedWord);

  if (word.length != maskedWord.length) return null;

  return (
    <div className="group inline-block">
      {arrOfChars.map((char, index) => {
        if (char !== "*") return char;
        return (
          <div className="inline-block relative" key={`${word}-${index}`}>
            <span
              className="animate-spin inline-block align-top group-hover:opacity-0 transition-all
                         h-[25px]
                         md:h-[38px]
                         lg:h-[45px]
                         xl:h-[60px]"
            >
              *
            </span>
            <span
              className="absolute animate-spin opacity-0 group-hover:opacity-100 transition-all
                         text-[6px] top-[8px] h-[8px] left-[2px]
                         md:text-[10px] md:top-[14px] md:h-[10px] md:left-[3px]
                         lg:text-[12px] lg:top-[15px] lg:h-[15px] lg:left-[8px]
                         xl:text-[16px] xl:top-[20px] xl:h-[20px] xl:left-[5px]"
            >
              {word}
            </span>
          </div>
        );
      })}
    </div>
  );
}
