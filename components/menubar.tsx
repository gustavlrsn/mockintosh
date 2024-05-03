import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { connectClickHandler } from "@/lib/print";
import { SystemContext, applicationTypes } from "@/pages";
import React from "react";

type MenubarType = {
  label: string;
  items: {
    label: string;
    shortcut?: string;
    disabled?: boolean;
    checked?: boolean;
  }[];
}[];

const finderMenubar: MenubarType = [
  {
    label: "File",
    items: [
      {
        label: "New Folder",
        shortcut: "⌘N",
        disabled: true,
      },
      {
        label: "Open",
        shortcut: "⌘O",
        disabled: true,
      },
      {
        label: "Print",
        disabled: true,
      },
      {
        label: "Close",
        disabled: true,
      },
    ],
  },
  {
    label: "Edit",
    items: [
      {
        label: "Undo",
        shortcut: "⌘Z",
        disabled: true,
      },
      {
        label: "Cut",
        shortcut: "⌘X",
        disabled: true,
      },
      {
        label: "Copy",
        shortcut: "⌘C",
        disabled: true,
      },
      {
        label: "Paste",
        shortcut: "⌘V",
        disabled: true,
      },
      {
        label: "Clear",
        disabled: true,
      },
      {
        label: "Select All",
        shortcut: "⌘A",
        disabled: true,
      },
      {
        label: "Show Clipboard",
        disabled: true,
      },
    ],
  },
  {
    label: "View",
    items: [
      {
        label: "By Small Icon",
        disabled: true,
      },
      {
        label: "By Icon",
        checked: true,
        disabled: true,
      },
      {
        label: "By Name",
        disabled: true,
      },
      {
        label: "By Date",
        disabled: true,
      },
      {
        label: "By Size",
        disabled: true,
      },
      {
        label: "By Kind",
        disabled: true,
      },
    ],
  },
  {
    label: "Special",
    items: [
      {
        label: "Clean Up Desktop",
        disabled: true,
      },
      {
        label: "Empty Trash",
        disabled: true,
      },
      {
        label: "Erase Disk",
        disabled: true,
      },
      {
        label: "Set Startup...",
        disabled: true,
      },
      {
        label: "Restart",
        disabled: true,
      },
      {
        label: "Shut Down",
        disabled: true,
      },
    ],
  },
];

export function SystemMenubar({ openWindow }) {
  const [devices, setDevices] = React.useState<USBDevice[]>([]);
  const { openWindows } = React.useContext(SystemContext);
  const activeApp = openWindows[openWindows?.length - 1];

  console.log({ activeApp });
  const menubar = activeApp?.menubar || finderMenubar;
  React.useEffect(() => {
    const fetchDevices = async () => {
      const devices = await navigator.usb.getDevices();
      setDevices(devices);
    };
    // fetchDevices();
  }, []);
  return (
    <Menubar className="z-30">
      <MenubarMenu>
        <MenubarTrigger>
          <img
            src="/eaten_apple.png"
            className=""
            style={{
              height: 11,
              width: 9,
            }}
          />
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem
            onClick={() =>
              openWindow({
                title: "About This Mockintosh",
                type: applicationTypes.ABOUT_THIS_MOCKINTOSH,
              })
            }
          >
            About this Mockintosh...
          </MenubarItem>
          <MenubarSeparator />
          {devices.map((device) => (
            <MenubarItem
              key={device.vendorId}
              onClick={() => console.log({ device })}
            >
              {device.productName}
            </MenubarItem>
          ))}

          <MenubarItem onClick={connectClickHandler}>
            Connect printer
          </MenubarItem>

          <MenubarSeparator />
          <MenubarItem disabled>Control Panel</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      {menubar.map((menu) => (
        <MenubarMenu key={menu.label}>
          <MenubarTrigger>{menu.label}</MenubarTrigger>
          <MenubarContent>
            {menu.items.map((item) => {
              if (item.type === "radiogroup") {
                return (
                  <MenubarRadioGroup
                    key={item.label}
                    value={item.value}
                    onValueChange={item.onValueChange}
                  >
                    {item.items.map((radioItem) => (
                      <MenubarRadioItem
                        key={radioItem.label}
                        value={radioItem.label}
                        disabled={radioItem.disabled}
                      >
                        {radioItem.label}
                      </MenubarRadioItem>
                    ))}
                  </MenubarRadioGroup>
                );
              }
              return (
                <MenubarItem key={item.label} disabled={item.disabled}>
                  {item.label}{" "}
                  {item.shortcut && (
                    <MenubarShortcut>{item.shortcut}</MenubarShortcut>
                  )}
                </MenubarItem>
              );
            })}
          </MenubarContent>
        </MenubarMenu>
      ))}
      {/* <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem disabled>
            New Folder <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            Open <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>Print</MenubarItem>
          <MenubarItem disabled>Close</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger disabled>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem disabled>
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled>
            Cut <MenubarShortcut>⌘K</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            Copy <MenubarShortcut>⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            Paste <MenubarShortcut>⌘V</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>Clear</MenubarItem>
          <MenubarItem disabled>
            Select All <MenubarShortcut>⌘A</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled>Show Clipboard</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem disabled>By Small Icon</MenubarCheckboxItem>
          <MenubarCheckboxItem checked disabled>
            By Icon
          </MenubarCheckboxItem>
          <MenubarCheckboxItem disabled>By Name</MenubarCheckboxItem>
          <MenubarCheckboxItem disabled>By Date</MenubarCheckboxItem>
          <MenubarCheckboxItem disabled>By Size</MenubarCheckboxItem>
          <MenubarCheckboxItem disabled>By Kind</MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Special</MenubarTrigger>
        <MenubarContent>
          <MenubarItem disabled>Clean Up Desktop</MenubarItem>
          <MenubarItem disabled>Empty Trash</MenubarItem>
          <MenubarItem disabled>Erase Disk</MenubarItem>
          <MenubarItem disabled>Set Startup...</MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled>Restart</MenubarItem>
          <MenubarItem disabled>Shut Down</MenubarItem>
        </MenubarContent>
      </MenubarMenu> */}
    </Menubar>
  );
}
