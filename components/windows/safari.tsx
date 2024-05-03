import React from "react";
import Google from "../safari/websites/google.com";
import { Window, WindowScrollArea, WindowHeader } from "../ui/window";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { Input } from "../ui/input";

const registry = [
  {
    name: "Google",
    url: "google.com",
    Site: Google,
  },
  {
    name: "Mockintosh",
    url: "mockintosh.com",
    Site: () => (
      <div className="bg-black flex justify-center items-center h-full">
        <img src="/microdesktop-disk.png" width={51} height={34} />
      </div>
    ),
  },
  {
    name: "Facebook",
    url: "www.facebook.com",
  },
  {
    name: "Twitter",
    url: "www.twitter.com",
  },
  {
    name: "Instagram",
    url: "www.instagram.com",
  },
  {
    name: "TikTok",
    url: "www.tiktok.com",
  },
  {
    name: "Reddit",
    url: "www.reddit.com",
  },
  {
    name: "Netflix",
    url: "www.netflix.com",
  },
  {
    name: "Amazon",
    url: "www.amazon.com",
  },
  {
    name: "Wikipedia",
    url: "www.wikipedia.org",
  },
  {
    name: "Yahoo",
    url: "www.yahoo.com",
  },
  {
    name: "eBay",
    url: "www.ebay.com",
  },
  {
    name: "Microsoft",
    url: "www.microsoft.com",
  },
  {
    name: "Apple",
    url: "www.apple.com",
  },
  {
    name: "LinkedIn",
    url: "www.linkedin.com",
  },
  {
    name: "Pinterest",
    url: "www.pinterest.com",
  },
  {
    name: "WordPress",
    url: "www.wordpress.com",
  },
  {
    name: "Dropbox",
    url: "www.dropbox.com",
  },
  {
    name: "Stack Overflow",
    url: "www.stackoverflow.com",
  },
  {
    name: "GitHub",
    url: "www.github.com",
  },
  {
    name: "Medium",
    url: "www.medium.com",
  },
  {
    name: "Quora",
    url: "www.quora.com",
  },
  {
    name: "Spotify",
    url: "www.spotify.com",
  },
  {
    name: "PayPal",
    url: "www.paypal.com",
  },
  {
    name: "Zoom",
    url: "www.zoom.us",
  },
];

const menuOptions = [
  { name: "File", items: [{ name: "New Window", action: () => {} }] },
];

export default function Safari({ i, window }) {
  const defaultSite = registry[0];
  const [url, setUrl] = React.useState(defaultSite.url);
  const [currentSite, setCurrentSite] = React.useState(defaultSite);
  const [history, setHistory] = React.useState([defaultSite.url]);
  const locationInput = React.useRef(null);
  const goToUrl = (url) => {
    const site = registry.find((site) => site.url === url);
    if (site) {
      setCurrentSite(site);
      setHistory([...history, url]);
    }
  };
  const goBack = () => {
    const index = history.indexOf(currentSite.url);
    if (index > 0) {
      goToUrl(history[index - 1]);
    }
  };
  const goForward = () => {
    const index = history.indexOf(currentSite.url);
    if (index < history.length - 1) {
      goToUrl(history[index + 1]);
    }
  };
  const canGoBack = history.indexOf(currentSite.url) > 0;
  const canGoForward = history.indexOf(currentSite.url) < history.length - 1;

  console.log({ canGoBack, canGoForward, history, url, currentSite });
  return (
    <Window
      i={i}
      // width={340}
      // resizable
      title="Safari"
      {...window}
      //   title={currentSite ? `${currentSite.name} | Safari` : "Safari"}
    >
      <WindowHeader>
        <div className="p-1 flex items-center gap-1">
          <div className="flex items-center">
            <Button
              disabled={!canGoBack}
              className="border-r-0"
              onClick={goBack}
            >
              <img
                src="/big-arrow-right.png"
                width={20}
                height={20}
                className="rotate-180"
              />
            </Button>
            <Button disabled={!canGoForward} className="" onClick={goForward}>
              <img src="/big-arrow-right.png" width={20} height={20} />
            </Button>
          </div>
          <form
            className="flex-1 relative"
            onSubmit={(e) => {
              e.preventDefault();
              console.log("submit", url);
              const site = registry.find((site) => site.url === url);
              if (site) {
                setCurrentSite(site);
                setHistory([...history, url]);
                locationInput.current.blur();
              }
            }}
          >
            {/* <div className="relative flex-1 h-4 w-full border-red-500 border"> */}
            <Input
              className={"w-full pl-4"}
              spellCheck={false}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              ref={locationInput}
            />
            <div className="absolute left-1.5 top-0 bottom-0 flex items-center">
              <img src="/unlocked.png" width="8" height="8" />
            </div>
          </form>
        </div>
      </WindowHeader>

      <WindowScrollArea resizable className="w-96 h-52">
        {currentSite.Site ? <currentSite.Site /> : <div>404</div>}
      </WindowScrollArea>
    </Window>
  );
}
