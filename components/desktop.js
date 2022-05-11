import Icon from "components/icon";
import { windowTypes } from "pages/index";
export default ({ children, openWindow, openWindows }) => (
  <div className="flex-1 flex flex-col items-end justify-between">
    <div className="flex flex-col gap-2 m-2">{children}</div>
    <div className="gap-2 m-2">
      <Icon
        icon={{
          title: "Trash",
          type: windowTypes.FOLDER,
          img: "/icons/trash.png",
          payload: {},
        }}
        openWindow={openWindow}
        openWindows={openWindows}
      ></Icon>
    </div>
  </div>
);
