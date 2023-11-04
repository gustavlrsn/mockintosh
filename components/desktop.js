import Icon from "@/components/icon";
import { applicationTypes } from "@/pages/index";

export default ({ children, openWindow, openWindows }) => (
  <div
    className="ml-auto grid grid-cols-[repeat(6,_84px)] grid-rows-[repeat(5,_64px)] grid-flow-col  "
    style={{ direction: "rtl" }}
  >
    {children}
    {/* <Icon
      icon={{
        title: "Trash",
        type: applicationTypes.FOLDER,
        img: "/icons/trash.png",
        payload: {},
      }}
      openWindow={openWindow}
      openWindows={openWindows}
    /> */}
    {/* <div className="flex flex-col gap-2 m-2"></div> */}
    {/* <div className="gap-2 m-2">
    
    </div> */}
  </div>
);
