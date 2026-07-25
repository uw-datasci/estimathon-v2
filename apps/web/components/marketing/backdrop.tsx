import Image from "next/image";

export function Backdrop() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-portage-600">
      <header className="absolute top-6 left-6 z-10">
        <Image
          src="/dsc_white.svg"
          alt="UW DSC logo"
          width={50}
          height={50}
          unoptimized
          className="h-16 w-auto"
        />
      </header>
      <div className="absolute top-1/2 left-1/2 h-270 w-480 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-0 bg-portage-600" />

        {/** Large bright circle top-right **/}
        <div className="absolute -top-50 -right-75 h-325 w-325 rounded-full bg-portage-400" />

        {/** Mid‐tone circle overlapping center **/}
        <div className="absolute -top-125 left-200 h-300 w-300 rounded-full bg-portage-300 opacity-50" />

        {/** Bottom right circle **/}
        <div className="absolute bottom-0 left-325 h-200 w-200 rounded-full bg-portage-500 opacity-50" />

        {/** Small accent circle **/}
        <div className="absolute top-170 right-153.75 h-37.5 w-37.5 rounded-full bg-portage-900" />

        {/** Orbits & dots **/}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" fill="none">
          <circle cx="1500" cy="640" r="650" stroke="white" strokeWidth="1" opacity="1" />
          {/* left circle */}
          <circle cx="500" cy="300" r="500" stroke="white" strokeWidth="1" opacity="1" />
          <circle cx="1470" cy="160" r="170" stroke="white" strokeWidth="1" opacity="1" />
          <circle cx="1490" cy="200" r="125" stroke="white" strokeWidth="1" opacity="1" />
          <circle cx="1600" cy="50" r="10" fill="white" />
          <circle cx="850" cy="660" r="10" fill="white" />
          <circle cx="1540" cy="315" r="10" fill="white" />
        </svg>

        {/** Big dark circle bottom-left **/}
        <div className="absolute bottom-0 left-0 h-125 w-125 rounded-full bg-portage-950" />
      </div>
    </div>
  );
}
