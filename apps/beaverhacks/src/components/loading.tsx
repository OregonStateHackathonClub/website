import Image from "next/image";

export const Loading = () => {
  return (
    <div className="w-screen h-screen bg-white flex items-center justify-center overflow-hidden">
      <div className="w-80 h-80 flex items-center justify-center bg-[#262624] rounded-tl-3xl rounded-br-3xl animate-[expand_1s_cubic-bezier(0.25,0.46,0.45,0.94)_0.5s_forwards]">
        <Image src="/logo-transparent.png" width={64} height={64} alt="logo" />
      </div>
    </div>
  );
};
