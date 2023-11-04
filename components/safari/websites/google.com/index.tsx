import { Button } from "@/components/ui/button";

export default function Google() {
  return (
    <div className="flex mt-12 justify-center items-center">
      <div className="flex flex-col items-center gap-4">
        <img
          alt="Google logo"
          src="/safari/google-logo.png"
          width="112"
          height="32"
        />
        <input className="font-chicago border w-64 h-6 outline-none px-1" />
        <div className="font-chicago flex gap-2">
          <Button className="border p-1 cursor-pointer">Google-Search</Button>
          <Button className="border p-1 cursor-pointer">
            I'm Feeling Lucky
          </Button>
        </div>
      </div>
    </div>
  );
}
